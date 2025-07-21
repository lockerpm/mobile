package com.cystack.locker.autofill;

import android.app.assist.AssistStructure;
import android.os.Build;
import android.os.CancellationSignal;
import android.service.autofill.AutofillService;
import android.service.autofill.FillCallback;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.service.autofill.FillResponse;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveRequest;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.cystack.locker.RNAutofillServiceAndroid;
import com.cystack.locker.autofill.parser.Parser;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;

import java.util.ArrayList;
import java.util.List;

@RequiresApi(api = Build.VERSION_CODES.O)
public class LockerAutoFillService extends AutofillService {
    private static final String TAG = "LockerAutoFillService";

    @Override
    public void onConnected() {
        Log.d(TAG, "onConnected()");
        super.onConnected();
        ReactNativeHost host = ((ReactApplication) this.getApplicationContext()).getReactNativeHost();
        ReactInstanceManager manager = host.getReactInstanceManager();

        ReactContext reactContext = manager.getCurrentReactContext();
        if (reactContext instanceof ReactApplicationContext) {
            AutofillDataKeychain keyStore = new AutofillDataKeychain((ReactApplicationContext) reactContext);
            if (keyStore.isLoggedInPw) {
                Utils.InitCredentialsStore(getBaseContext(), keyStore.email, keyStore.hashPass);
            }  else {
                Utils.RemoveAllCredential();
            }
        }  else {
            Utils.RemoveAllCredential();
        }
    }

    @Override
    public void onFillRequest(@NonNull FillRequest request, @NonNull CancellationSignal cancellationSignal,
            @NonNull FillCallback callback) {
        Log.d(TAG, "onFillRequest()");

        Parser.Result parseResult = new Parser(request).Parse();

        ArrayList<Field> fields = (ArrayList<Field>) parseResult.getFillable();
        String domain = parseResult.getDomain();

        if (fields == null || fields.isEmpty() || Utils.BlacklistedUris.contains(domain)) {
            Log.d(TAG, "No autofill hints found");
            callback.onSuccess(null);
            return;
        }

        // Create response...
        FillResponse.Builder response = Utils.BuildFillResponse(fields, request, domain, this);

        // add save info
        Utils.AddSaveInfo(request, response, fields, parseResult.getPackageName());

        callback.onSuccess(response.build());
    }

    @Override
    public void onSaveRequest(@NonNull SaveRequest request, @NonNull SaveCallback callback) {
        Log.d(TAG, "onSaveRequest()");

        Parser.Result parseResult = new Parser(request).Parse();
        ArrayList<Field> fields = (ArrayList<Field>) parseResult.getFillable();
        String domain = parseResult.getDomain();

        startActivity(RNAutofillServiceAndroid.newIntentForSaveLogin(this, fields, domain));
    }

}
