package net.vincss.passwordmanager;

import static android.view.autofill.AutofillManager.EXTRA_AUTHENTICATION_RESULT;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.os.Build;
import android.os.Bundle;
import android.service.autofill.Dataset;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;
import android.view.autofill.AutofillId;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

import net.vincss.passwordmanager.R;
import net.vincss.passwordmanager.autofill.AutofillItem;
import net.vincss.passwordmanager.autofill.Utils;
import net.vincss.passwordmanager.autofill.Field;

import java.util.ArrayList;
import java.util.Objects;

public class RNAutofillServiceAndroid extends ReactContextBaseJavaModule {
    public static final String DOMAIN = "domain";

    private static ArrayList<Field> sfields = null;
    private static String credentialID = null;
    public static PendingIntent newIntentSenderForResponse(@NonNull Context context, ArrayList<Field> fields, String domain) {
        // store fillable field in Activity Static variable
        credentialID = domain;
        sfields = fields;
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("autofill", 1); //start app by autofill service
        intent.putExtra(DOMAIN, domain);
        return PendingIntent.getActivity(context, 1001, intent,
                PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    public static PendingIntent newIntentSenderForFillResponse(@NonNull Context context, ArrayList<Field> fields, String domain, String itemID) {
        // store fillable field in Activity Static variable
        credentialID = domain;
        sfields = fields;
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("lastFill", 1); //start app by autofill service
        intent.putExtra("itemID", itemID);
        return PendingIntent.getActivity(context, 1002, intent,
                PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    public static Intent newIntentForSaveLogin(@NonNull Context context, ArrayList<Field> fields, String domain) {
        credentialID = domain;

        String username = null;
        String password = null;

        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
        intent.putExtra("savePassword", 1); //start app with OnSaveRequest
        intent.putExtra(DOMAIN, domain);
        for (Field field: fields) {
            int fillType = field.fillType;
            if (fillType == Field.FILL_TYPE_PASSWORD) {
                password = field.text;
                intent.putExtra("password", field.text);
            }
            if (fillType  == Field.FILL_TYPE_EMAIL || fillType == Field.FILL_TYPE_USERNAME) {
                username = field.text;
                intent.putExtra("username", field.text);
            }
        } 
        AutofillItem data = new AutofillItem("", username, password, "", domain);
        
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

    @ReactMethod
    public void isAutofillServiceActived(Callback callBack) {
        callBack.invoke(Utils.IsLockerAutofillServicesEnabled(getReactApplicationContext()));
    }
    
    @ReactMethod
    public void removeLastItem() {
        Utils.RemoveCredential(credentialID);
    }

    @ReactMethod
    public void useLastItem() {
        AutofillItem data = Utils.GetCredential(credentialID);
        buildResponse(data);
    }

    @ReactMethod
    public void addAutofillValue(String id, String userName, String password, String name, String uri) {

        AutofillItem data = new AutofillItem(id, userName, password, name, uri);
        buildResponse(data);
    }

    private void buildResponse(AutofillItem data) {
        RemoteViews presentation = new RemoteViews(getReactApplicationContext().getPackageName(), R.layout.remote_locker_app); // crash ?
        Dataset response = Utils.BuildUnlockDataset(sfields, data, presentation);

        Utils.SetCredential(credentialID, data);

        Intent replyIntent = new Intent();
        replyIntent.putExtra(EXTRA_AUTHENTICATION_RESULT, response);

        Objects.requireNonNull(getCurrentActivity()).setResult(-1, replyIntent); //RESULT_OK
        Objects.requireNonNull(getCurrentActivity()).finish();
    }
}

