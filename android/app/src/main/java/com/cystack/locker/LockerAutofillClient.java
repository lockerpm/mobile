package com.cystack.locker;

import static android.view.autofill.AutofillManager.EXTRA_AUTHENTICATION_RESULT;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.service.autofill.Dataset;
import android.view.autofill.AutofillId;
import android.view.autofill.AutofillValue;
import android.widget.Button;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import com.cystack.locker.autofill.Prefs;

public class LockerAutofillClient extends AppCompatActivity {
    Button fillButton;

    private static final String DOMAIN = "domain";
    private static final String EMAIL_IDS = "email_ids";
    private static final String USERNAME_IDS = "username_ids";
    private static final String PASS_IDS = "pass_ids";
    private static int sPendingIntentId = 0;
    @RequiresApi(api = Build.VERSION_CODES.O)
    public static IntentSender newIntentSenderForResponse(@NonNull Context context,
                                                        AutofillId[] emailIds, AutofillId[] userNameIds,  AutofillId[] passwordIds, String domain) {

        Intent intent = new Intent(context, LockerAutofillClient.class);

        if (emailIds.length > 0) {
            intent.putExtra(EMAIL_IDS, emailIds[0]);
        } else if (userNameIds.length > 0) {
            intent.putExtra(EMAIL_IDS, userNameIds[0]);
        }


        if (passwordIds.length > 0) {
            intent.putExtra(PASS_IDS, passwordIds[0]);
        }

//        intent.putExtra(USERNAME_IDS, userNameIds[0]);
        intent.putExtra(DOMAIN, domain);

        return PendingIntent.getActivity(context, ++sPendingIntentId, intent,
                PendingIntent.FLAG_CANCEL_CURRENT).getIntentSender();
    }


    private final ActivityResultLauncher<Intent> pcapFileLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), this::pcapFileResult);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_client);


        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra("autofill", 1); //start app by autofill service
        intent.putExtra("domain", getIntent().getStringExtra(DOMAIN));
        pcapFileLauncher.launch(intent);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void pcapFileResult(final ActivityResult result) {
        final SharedPreferences prefs = getSharedPreferences(Prefs.NAME, MODE_PRIVATE);
        String emailFillValue = Prefs.getEmail(prefs);
        String passFillValue = Prefs.getPassword(prefs);
        String usernameFillValue = Prefs.getUserName(prefs);
        if (passFillValue == null)
            finish();

        if (emailFillValue != "") {
            onFillPassword(emailFillValue, passFillValue);
        }

        if (usernameFillValue != "") {
            onFillPassword(usernameFillValue, passFillValue);
        }
    }


    @RequiresApi(api = Build.VERSION_CODES.O)
    public void onFillPassword(String username, String password){
        Intent intent = getIntent();
        Intent replyIntent = new Intent();

        AutofillId emailIds = intent.getParcelableExtra(EMAIL_IDS);
        AutofillId passIds = intent.getParcelableExtra(PASS_IDS);

        if (emailIds != null || passIds != null) {
            Dataset.Builder builder = new Dataset.Builder();

            if (emailIds != null ){
                builder.setValue(emailIds, AutofillValue.forText(username));
            }
            if (passIds != null ){
                builder.setValue(passIds, AutofillValue.forText(password));
            }
            Dataset dataSet = builder.build();

            replyIntent.putExtra(EXTRA_AUTHENTICATION_RESULT, dataSet);
            setResult(RESULT_OK, replyIntent);
        } else {
            setResult(RESULT_CANCELED);
        }

        finish();
    }
}