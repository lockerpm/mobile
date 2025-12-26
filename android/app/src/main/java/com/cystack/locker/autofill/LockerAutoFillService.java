package com.cystack.locker.autofill;

import android.os.CancellationSignal;
import android.service.autofill.AutofillService;
import android.service.autofill.FillCallback;
import android.service.autofill.FillRequest;
import android.service.autofill.FillResponse;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveRequest;
import android.util.Log;

import androidx.annotation.NonNull;

import com.cystack.locker.packages.RNAutofillServiceAndroid;
import com.cystack.locker.autofill.password.AutofillDataKeychain;
import com.cystack.locker.autofill.password.Field;
import com.cystack.locker.autofill.password.PasswordUtils;
import com.cystack.locker.autofill.password.parser.Parser;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactHost;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;

import java.util.ArrayList;

public class LockerAutoFillService extends AutofillService {
    private static final String TAG = "LockerAutoFillService";

    @Override
    public void onConnected() {
        Log.d(TAG, "onConnected()");
        super.onConnected();
        ReactHost host = ((ReactApplication) this.getApplicationContext()).getReactHost();
//        ReactInstanceManager manager = host.getCurrentReactContext();
        if (host != null) {
            ReactContext reactContext = host.getCurrentReactContext();
            Log.d("LockerAutoFillService", "onConnected" + reactContext);

            if (reactContext instanceof ReactApplicationContext) {
                Log.d("LockerAutoFillService", "reactContext instanceof ReactApplicationContext");
                AutofillDataKeychain keyStore = new AutofillDataKeychain((ReactApplicationContext) reactContext);
                if (keyStore.isLoggedInPw) {
                    PasswordUtils.InitCredentialsStore(getBaseContext(), keyStore.email, keyStore.hashPass);
                }  else {
                    PasswordUtils.RemoveAllCredential();
                }
            }  else {
                Log.d("LockerAutoFillService", "reactContext is not instanceof ReactApplicationContext");
                PasswordUtils.RemoveAllCredential();
            }
        }
    }

    @Override
    public void onFillRequest(@NonNull FillRequest request, @NonNull CancellationSignal cancellationSignal,
            @NonNull FillCallback callback) {
        Log.d(TAG, "onFillRequest()");

        Parser.Result parseResult = new Parser(request).Parse();

        ArrayList<Field> fields = (ArrayList<Field>) parseResult.getFillable();
        String domain = parseResult.getDomain();

        if (fields == null || fields.isEmpty() || PasswordUtils.BlacklistedUris.contains(domain)) {
            Log.d(TAG, "No autofill hints found");
            callback.onSuccess(null);
            return;
        }

        // Create response...
        FillResponse.Builder response = PasswordUtils.BuildFillResponse(fields, request, domain, this);

        // add save info
        PasswordUtils.AddSaveInfo(request, response, fields, parseResult.getPackageName());

        callback.onSuccess(response.build());
    }

    @Override
    public void onSaveRequest(@NonNull SaveRequest request, @NonNull SaveCallback callback) {
        Log.d(TAG, "onSaveRequest()");

        Parser.Result parseResult = new Parser(request).Parse();
        ArrayList<Field> fields = (ArrayList<Field>) parseResult.getFillable();
        String domain = parseResult.getDomain();

        if (fields == null || fields.isEmpty() || PasswordUtils.BlacklistedUris.contains(domain)) {
            callback.onSuccess();
            return;
        }
        startActivity(RNAutofillServiceAndroid.intentForSavePassword(this, fields, domain));
    }
}
