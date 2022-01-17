package com.cystack.locker.autofill;

import android.annotation.TargetApi;
import android.app.PendingIntent;
import android.app.assist.AssistStructure;
import android.content.Intent;
import android.content.IntentSender;
import android.net.Uri;
import android.os.Build;
import android.os.CancellationSignal;
import android.service.autofill.AutofillService;
import android.service.autofill.Dataset;
import android.service.autofill.FillCallback;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.service.autofill.FillResponse;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveRequest;
import androidx.annotation.NonNull;
import android.util.Log;
import android.view.autofill.AutofillId;
import android.view.autofill.AutofillValue;
import android.widget.RemoteViews;

import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;

import com.cystack.locker.MainActivity;
import com.facebook.react.bridge.ReactApplicationContext;

import com.cystack.locker.LockerAutofillClient;
import com.cystack.locker.R;

@TargetApi(Build.VERSION_CODES.O)
public class LockerAutoFillService extends AutofillService {
    private static final String TAG = "LockerAutoFillService";

    @Override
    public void onCreate() {
        Log.d(TAG, "onCreate");
        super.onCreate();
    }

    //The autofill framework defines a workflow to fill out views that is 
    //designed to minimize the time that the Android system is bound to 
    //the autofill service.
    @Override
    public void onFillRequest(
            @NonNull FillRequest request,
            @NonNull CancellationSignal cancellationSignal,
            @NonNull FillCallback callback
    ) {
        try {
            Log.d(TAG, "onFillRequest");

            List<FillContext> context = request.getFillContexts();
            AssistStructure structure = context.get(context.size() - 1).getStructure();

            // Parse the structure into fillable view IDs
            StructureParser.Result parseResult = new StructureParser(structure).parse();


            AutofillId[] emailIDs = toArray(parseResult.email);
            AutofillId[] usernameIds = toArray(parseResult.username);
            AutofillId[] passIds = toArray(parseResult.password);

            if (emailIDs.length == 0 && usernameIds.length == 0 && passIds.length == 0)
                callback.onSuccess(null);
            else {
                String domain = parseResult.webDomain.size() > 0 ? parseResult.webDomain.get(0) : "";
                IntentSender authentication = LockerAutofillClient.newIntentSenderForResponse(this, emailIDs,
                        usernameIds, passIds, domain);

                RemoteViews remoteView = new RemoteViews(getPackageName(), R.layout.remote_locker_app);

                FillResponse fillResponse = new FillResponse.Builder()
                        .addDataset(buildDataSetWithAuthen(emailIDs, usernameIds, passIds, remoteView, authentication))
                        .build();

                callback.onSuccess(fillResponse);
            }
        } catch (Exception e) {
            Log.e(TAG, e.toString());
            callback.onFailure(e.toString());
        }
    }

    public static Dataset buildDataSetWithAuthen(AutofillId[] emailIds, AutofillId[] usenameIds, AutofillId[] passwordIds, RemoteViews remoteView,IntentSender authentication){
        Dataset.Builder builder = new Dataset.Builder();

        for(AutofillId id: emailIds){
            builder.setValue(id, AutofillValue.forText("locker"), remoteView);
        }
        for(AutofillId id: usenameIds){
            builder.setValue(id, null, remoteView);
        }
        for(AutofillId id: passwordIds){
            builder.setValue(id, null, remoteView);
        }
        builder.setAuthentication(authentication);

        return builder.build();
    }


    @Override
    public void onSaveRequest(@NonNull SaveRequest request, @NonNull SaveCallback callback) {
        Log.d(TAG, "onSaveRequest");
        callback.onFailure("Unfortunately Locker does not support saving credentials yet.");
    }

    @Override
    public void onConnected() {
        Log.d(TAG, "onConnected");
    }

    @Override
    public void onDisconnected() {
        Log.d(TAG, "onDisconnected");
    }

    private AutofillId[] toArray(List<AutofillId> idList) {
        AutofillId[] ids = new AutofillId[idList.size()];
        ids = idList.toArray(ids);
        return ids;
    }
}