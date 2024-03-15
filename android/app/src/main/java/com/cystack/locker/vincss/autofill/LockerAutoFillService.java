package com.cystack.locker.vincss.autofill;

import android.app.PendingIntent;
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

import com.cystack.locker.vincss.autofill.parser.Parser;
import com.cystack.locker.vincss.RNAutofillServiceAndroid;

import java.util.ArrayList;
import java.util.List;

import com.facebook.react.bridge.ReactApplicationContext;

@RequiresApi(api = Build.VERSION_CODES.O)
public class LockerAutoFillService extends AutofillService {
    private static final String TAG = "LockerAutoFillService";
    private boolean readyToStart = false;

    @Override
    public void onConnected() {
        Log.d(TAG, "onConnected()");
        super.onConnected();

        ReactApplicationContext reactContext = new ReactApplicationContext(getApplicationContext());
        AutofillDataKeychain keyStore = new AutofillDataKeychain(reactContext);
        if (keyStore.isLoggedInPw) {
            this.readyToStart = true;
            Utils.InitCredentialsStore(getBaseContext(), keyStore.email, keyStore.hashPass);
        } else {
            Utils.RemoveAllCredential();
        }
    }

    @Override
    public void onFillRequest(@NonNull FillRequest request, @NonNull CancellationSignal cancellationSignal,
            @NonNull FillCallback callback) {
        Log.d(TAG, "onFillRequest()");
        // Find fillable fields
        AssistStructure structure = Utils.getLatestAssistStructure(request);
        Parser.Result parseResult = new Parser(structure).Parse();

        ArrayList<Field> fields = (ArrayList<Field>) parseResult.getFillable();
        String domain = parseResult.getDomain();

        if (fields == null || fields.isEmpty() || Utils.BlacklistedUris.contains(domain) || !this.readyToStart) {
            Log.d(TAG, "No autofill hints found");
            callback.onSuccess(null);
            return;
        }

        Log.d(TAG, "Domain: " + domain);
        Log.d(TAG, "autofillable fields:" + fields.size());

        // Create response...
        FillResponse.Builder response = Utils.BuildFillResponse(fields, request, domain, this);

        // add save info
        Utils.AddSaveInfo(request, response, fields, parseResult.getPackageName());

        callback.onSuccess(response.build());
    }

    @Override
    public void onSaveRequest(@NonNull SaveRequest request, @NonNull SaveCallback callback) {
        Log.d(TAG, "onSaveRequest()");

        List<FillContext> context = request.getFillContexts();
        AssistStructure structure = context.get(context.size() - 1).getStructure();
        Parser.Result parseResult = new Parser(structure).Parse();
        ArrayList<Field> fields = (ArrayList<Field>) parseResult.getFillable();
        String domain = parseResult.getDomain();

        startActivity(RNAutofillServiceAndroid.newIntentForSaveLogin(this, fields, domain));
    }

}
