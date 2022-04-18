package com.cystack.locker.autofill.activities;

import static android.view.autofill.AutofillManager.EXTRA_AUTHENTICATION_RESULT;

import static androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL;
import static androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_STRONG;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.os.Build;
import android.os.Bundle;
import android.service.autofill.Dataset;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.RemoteViews;
import android.widget.TextView;
import android.widget.Toast;

import com.cystack.locker.R;
import com.cystack.locker.autofill.AutofillItem;
import com.cystack.locker.autofill.AutofillDataKeychain;
import com.cystack.locker.autofill.Field;
import com.cystack.locker.autofill.LockerAutoFillService;
import com.cystack.locker.autofill.Utils;

import java.util.ArrayList;
import java.util.concurrent.Executor;

import com.facebook.react.bridge.ReactApplicationContext;

@RequiresApi(api = Build.VERSION_CODES.O)
public class VerifyMasterPasswordActivity extends AppCompatActivity {
    public static final String DOMAIN = "domain";
    public static final String EXTRA_LOGIN_DATA = "login_data";
    // put and getExtra from intent return null for arraylist<Field> ??
    private static ArrayList<Field> sfields = null;
    public static PendingIntent newIntentSenderForResponse(@NonNull Context context, ArrayList<Field> fields, String domain) {
        // store fillable field in Activity Static variable
        sfields = fields;
        Intent intent = new Intent(context, VerifyMasterPasswordActivity.class);
        intent.putExtra(DOMAIN, domain);
        return PendingIntent.getActivity(context, 1001, intent,
                PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private AutofillDataKeychain keyStore;
    private Executor executor;
    private BiometricPrompt biometricPrompt;
    private BiometricPrompt.PromptInfo promptInfo;
    private final ActivityResultLauncher<Intent> loginList =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), this::lockerLauncherResult);

    private ArrayList<AutofillItem> datas;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_locker_autofill_client);

        ReactApplicationContext reactContext = new ReactApplicationContext(getApplicationContext());
        keyStore = new AutofillDataKeychain(reactContext);
        datas = keyStore.credentials;
        TextView email  = findViewById(R.id.mp_email);
        email.setText(keyStore.email);
   
        if (keyStore.loginedLocker) {
            if (keyStore.faceIdEnabled){
                biometricSupport();
            }
        }
        else {
            cancel();
        }
    }
    private void lockerLauncherResult(final ActivityResult result) {
        if (result.getResultCode() == 1) {
            Intent intent = result.getData();
            if (intent != null) {
                AutofillItem data = intent.getParcelableExtra(LoginListActivity.DATA);
                onFillPassword(data);
            }
        }
        else {
            cancel();
        }
    }

    private void onFillPassword(AutofillItem data) {
        RemoteViews presentation = new RemoteViews(getPackageName(), R.layout.remote_locker_app); // crash ?
        Dataset response = Utils.BuildUnlockDataset(sfields, data, presentation);

        Intent replyIntent = new Intent();
        replyIntent.putExtra(EXTRA_AUTHENTICATION_RESULT, response);

        setResult(RESULT_OK, replyIntent);
        finish();
    }
    
    public void unlock(View view) {
        EditText text = findViewById(R.id.master_password);
        String masterPassword = text.getText().toString();
       
        if (keyStore.hashMassterPass.equals(Utils.makeKeyHash(masterPassword, keyStore.email))){
            preformLoginList();
        }
        else {
            cancel();
        }
    }

    public void cancel(View view) {
        cancel();
    }

    private void cancel(){
        setResult(RESULT_CANCELED);
        finish();
    }
    private void preformLoginList() {
        Intent intent = new Intent(this, LoginListActivity.class);
        intent.putParcelableArrayListExtra(EXTRA_LOGIN_DATA, datas);
        intent.putExtra(DOMAIN, getIntent().getStringExtra(DOMAIN));
        loginList.launch(intent);
    }

    private void biometricSupport(){
        executor = ContextCompat.getMainExecutor(this);
        biometricPrompt = new BiometricPrompt(this,
                executor, new BiometricPrompt.AuthenticationCallback() {
            @Override
            public void onAuthenticationError(int errorCode,
                                                @NonNull CharSequence errString) {
                super.onAuthenticationError(errorCode, errString);
                Toast.makeText(getApplicationContext(),
                        "Authentication error: " + errString, Toast.LENGTH_SHORT)
                        .show();
            }

            @Override
            public void onAuthenticationSucceeded(
                    @NonNull BiometricPrompt.AuthenticationResult result) {
                super.onAuthenticationSucceeded(result);
                preformLoginList();
            }

            @Override
            public void onAuthenticationFailed() {
                super.onAuthenticationFailed();
                Toast.makeText(getApplicationContext(), "Authentication failed",
                        Toast.LENGTH_SHORT)
                        .show();
            }
        });
        promptInfo = new BiometricPrompt.PromptInfo.Builder()
                .setTitle("Biometric login for my app")
                .setSubtitle("Log in using your biometric credential")
                .setAllowedAuthenticators(BIOMETRIC_STRONG| DEVICE_CREDENTIAL)
                .setConfirmationRequired(false)
                .build();

        biometricPrompt.authenticate(promptInfo);
    }
}