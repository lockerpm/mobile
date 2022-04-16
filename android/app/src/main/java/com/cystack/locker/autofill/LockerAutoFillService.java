package com.cystack.locker.autofill;

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

import com.cystack.locker.autofill.activities.VerifyMasterPasswordActivity;
import com.cystack.locker.autofill.parser.Parser;
import com.cystack.locker.RNAutofillServiceAndroid;

import java.util.ArrayList;
import java.util.List;

@RequiresApi(api = Build.VERSION_CODES.O)
public class LockerAutoFillService extends AutofillService{
    private static final String TAG = "Locker_Service";
    @Override
    public void onConnected() {
        super.onConnected();
    }

    @Override
    public void onFillRequest(@NonNull FillRequest request, @NonNull CancellationSignal cancellationSignal, @NonNull FillCallback callback) {
        Log.d(TAG, "onFillRequest()");

        // Find fillable fields
        AssistStructure structure = Utils.getLatestAssistStructure(request);
        Parser.Result parseResult = new Parser(structure).Parse();
        ArrayList<Field> fields = (ArrayList<Field>) parseResult.getFillable();
        String domain = parseResult.getDomain();

        if ( fields == null || fields.isEmpty() || Utils.BlacklistedUris.contains(domain)) {
            Log.d(TAG, "No autofill hints found");
            callback.onSuccess(null);
            return;
        }

        for(Field field: fields ) {
            Log.d("------------------", "type : " + field.autofillType);
        }
        Log.d(TAG, "Domain: " + domain);
        Log.d(TAG, "autofillable fields:" + fields.size());

        // PendingIntent authentication = VerifyMasterPasswordActivity.newIntentSenderForResponse(this, fields, domain);
        PendingIntent authentication = RNAutofillServiceAndroid.newIntentSenderForResponse(this, fields, domain);
        
        // Create response...
        FillResponse.Builder response = Utils.BuildFillResponse(fields, authentication, request, getBaseContext());

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
