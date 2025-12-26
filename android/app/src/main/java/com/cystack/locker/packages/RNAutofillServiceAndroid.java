package com.cystack.locker.packages;

import static android.view.autofill.AutofillManager.EXTRA_AUTHENTICATION_RESULT;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.provider.Settings;
import android.service.autofill.Dataset;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;

import com.cystack.locker.MainActivity;
import com.cystack.locker.R;
import com.cystack.locker.autofill.password.AutofillItem;
import com.cystack.locker.autofill.password.Field;
import com.cystack.locker.autofill.password.PasswordUtils;
import com.cystack.locker.autofill.passkey.Fid2Service;


import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Random;
import java.util.ArrayList;
import java.util.Objects;

public class RNAutofillServiceAndroid extends ReactContextBaseJavaModule {
    public static final int FILL_PASSWORD = 1;
    public static final int QUICK_BAR_PASSWORD = 2;
    public static final int SAVE_PASSWORD = 3;
    public static final int CREATE_PASSKEY = 4;
    public static final int GET_PASSKEY = 5;
    public static final String CREATE_PASSKEY_ACTION = "com.cystack.locker.credentials.ACTION_CREATE_PASSKEY";
    public static final String GET_PASSKEY_ACTION = "com.cystack.locker.credentials.ACTION_GET_PASSKEY";


    private static ArrayList<Field> _fields = null;
    private static String _url = null;

    public static PendingIntent intentForFillPassword(@NonNull Context context, ArrayList<Field> fields, String url) {
        // store fillable field in Activity Static variable
        _url = url;
        _fields = fields;
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("type", FILL_PASSWORD); //start app by autofill service
        intent.putExtra("url", url);
        return PendingIntent.getActivity(context, 1001, intent,
                PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    public static PendingIntent intentForQuickBarPassword(@NonNull Context context, ArrayList<Field> fields, String url, String id) {
        // store fillable field in Activity Static variable
        _url = url;
        _fields = fields;
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("type", QUICK_BAR_PASSWORD); //start app by autofill service
        intent.putExtra("id", id);
        return PendingIntent.getActivity(context, 1002, intent,
                PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    public static PendingIntent intentForCreateCredential(@NonNull Context context) {
        Intent intent = new Intent(CREATE_PASSKEY_ACTION).setPackage(context.getPackageName());
        intent.putExtra("type", CREATE_PASSKEY);

        int requestCode = new Random().nextInt();
        return PendingIntent.getActivity(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_MUTABLE | PendingIntent.FLAG_CANCEL_CURRENT
        );
    }
    public static PendingIntent intentForGetCredential(@NonNull Context context) {
        Intent intent = new Intent(GET_PASSKEY_ACTION).setPackage(context.getPackageName());
        intent.putExtra("type", GET_PASSKEY);

        int requestCode = new Random().nextInt();
        return PendingIntent.getActivity(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_MUTABLE | PendingIntent.FLAG_CANCEL_CURRENT
        );
    }
    public static Intent intentForSavePassword(@NonNull Context context, ArrayList<Field> fields, String url) {
        _url = url;

        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.putExtra("type", SAVE_PASSWORD);  //start app with OnSaveRequest
        intent.putExtra("url", url);
        for (Field field: fields) {
            int fillType = field.fillType;
            if (fillType == Field.FILL_TYPE_PASSWORD) {
                intent.putExtra("password", field.text);
            }
            if (fillType  == Field.FILL_TYPE_EMAIL || fillType == Field.FILL_TYPE_USERNAME) {
                intent.putExtra("username", field.text);
            }
        }
        return intent;
    }

    RNAutofillServiceAndroid(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "RNAutofillServiceAndroid";
    }

    // --------------------------------PASSKEY---------------------------
    @ReactMethod
    public void handleCreatePasskeyResponse(String requestJson, String credentialId, String publicKey, String origin, String packageName, Promise promise) {
        Fid2Service fido2 = new Fid2Service();
        fido2.createPasskey(Objects.requireNonNull(getCurrentActivity()), requestJson, credentialId, publicKey, origin, packageName);
        promise.resolve(true);
    }

    @ReactMethod
    public void handleGetPasskeyResponse(
        String requestJson,
        String credentialId,
        String userId,
        String privateKey,
        int signatureCounter,
        String origin,
        String packageName,
        String clientDataHash,
        Promise promise
    ) {
        Fid2Service fido2 = new Fid2Service();
        fido2.authenPasskey(
                Objects.requireNonNull(getCurrentActivity()),
                requestJson,
                credentialId,
                userId,
                privateKey,
                signatureCounter,
                origin,
                packageName,
                clientDataHash
        );
        promise.resolve(true);
    }

    // Password
    @ReactMethod
    public void isAutofillServiceActived(Promise promise) {
        promise.resolve(PasswordUtils.IsLockerAutofillServicesEnabled(getReactApplicationContext()));
    }

    @ReactMethod
    public void isChromeAutofillServiceActived(Promise promise) {
        promise.resolve(PasswordUtils.IsLockerAutofillServicesEnabledChrome(getReactApplicationContext()));
    }

    @ReactMethod
    public void openChromeAutofillSettings(Promise promise) {
        try {
            PasswordUtils.openChromeDeepLinkSettings(getReactApplicationContext());
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("AUTOFILL_ERROR", "Failed to open autofill settings: " + e.getMessage());
        }
    }

    @ReactMethod
    public void openAutofillSettings(Promise promise) {
        try {
            Context context = getReactApplicationContext();
            String packageName = context.getPackageName();

            Intent intent = new Intent(Settings.ACTION_REQUEST_SET_AUTOFILL_SERVICE);
            intent.setData(android.net.Uri.parse("package:" + packageName));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);

            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("AUTOFILL_ERROR", "Failed to open autofill settings: " + e.getMessage());
        }
    }

    @ReactMethod
    public void removeLastItem() {
        PasswordUtils.RemoveCredential(_url);
    }

    @ReactMethod
    public void useLastItem() {
        AutofillItem data = PasswordUtils.GetCredential(_url);
        buildResponse(data);
    }

    @ReactMethod
    public void addAutofillValue(String id, String userName, String password, String name, String uri) {
        AutofillItem data = new AutofillItem(id, userName, password, name, uri);
        buildResponse(data);
    }


    private void buildResponse(AutofillItem data) {
        RemoteViews presentation = new RemoteViews(getReactApplicationContext().getPackageName(), R.layout.remote_locker_app); // crash ?

        if (_fields != null ) {
            Dataset response = PasswordUtils.BuildUnlockDataset(_fields, data, presentation);

            if (!data.getId().isEmpty()) {
                PasswordUtils.SetCredential(_url, data);
            }

            Intent replyIntent = new Intent();
            replyIntent.putExtra(EXTRA_AUTHENTICATION_RESULT, response);

            Objects.requireNonNull(getCurrentActivity()).setResult(-1, replyIntent); //RESULT_OK
            Objects.requireNonNull(getCurrentActivity()).finish();
        }

    }
}

