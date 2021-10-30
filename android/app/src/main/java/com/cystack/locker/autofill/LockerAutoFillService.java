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


@TargetApi(Build.VERSION_CODES.O)
public class LockerAutoFillService extends AutofillService {
    private static final String TAG = "LockerAutoFillService";

    @Override
    public void onCreate() {
        Log.d(TAG, "onCreate");
        super.onCreate();
    }

    @Override
    public void onFillRequest(
            @NonNull FillRequest request,
            @NonNull CancellationSignal cancellationSignal,
            @NonNull FillCallback callback
    ) {
        Log.d(TAG, "onFillRequest");

        ReactApplicationContext reactContext = new ReactApplicationContext(getApplicationContext());
        AutoFillHelpers autoFillHelper = new AutoFillHelpers(reactContext);

        // Get the structure from the request
        List<FillContext> context = request.getFillContexts();
        AssistStructure structure = context.get(context.size() - 1).getStructure();

        // Parse the structure into fillable view IDs
        StructureParser.Result parseResult = new StructureParser(structure).parse();

        // Add a dataset to the response
        FillResponse.Builder fillResponseBuilder = new FillResponse.Builder();

        try {
            for (String domain: parseResult.webDomain) {
                Log.d(TAG, domain);
                // Search Locker Entries that match this domain name
                ArrayList<AutoFillEntry> matchedEntries = autoFillHelper.getAutoFillEntriesForDomain(domain);

                for (AutoFillEntry entry: matchedEntries) {
                    // Build the presentation of the datasets
                    RemoteViews remoteView = new RemoteViews(getPackageName(), android.R.layout.simple_list_item_1);
                    remoteView.setTextViewText(android.R.id.text1, entry.getUsername());
                    Dataset.Builder builder = new Dataset.Builder(remoteView);

                    // Assign the username/password to any found view IDs
                    parseResult.email.forEach(id -> builder.setValue(id, AutofillValue.forText(entry.getUsername())));
                    parseResult.username.forEach(id -> builder.setValue(id, AutofillValue.forText(entry.getUsername())));
                    parseResult.password.forEach(id -> builder.setValue(id, AutofillValue.forText(entry.getPassword())));

                    Dataset dataSet = builder.build();
                    fillResponseBuilder.addDataset(dataSet);
                }
            }

            // Add the 'Add new password' option
            RemoteViews remoteView = new RemoteViews(getPackageName(), android.R.layout.simple_list_item_1);
            remoteView.setTextViewText(android.R.id.text1, "Add new password");

            // Create the sender intent so that we can start the Locker app and let the user add new credential
            String q = String.join(",", parseResult.webDomain);
            String uri = "locker://add?domain=" + URLEncoder.encode(q, "UTF-8");
            Intent launchIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(uri));
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

            // Add the domain names to the intent for Search to work in the app
            String[] serviceIdentifiers = new String[parseResult.webDomain.size()];
            launchIntent.putExtra("serviceIdentifiers", parseResult.webDomain.toArray(serviceIdentifiers));
            IntentSender intentSender = PendingIntent.getActivity(
                    this,
                    1001,
                    launchIntent,
                    PendingIntent.FLAG_CANCEL_CURRENT
            ).getIntentSender();

            // Finally build the Login with Locker dataset and add it to the list
            Dataset.Builder builder = new Dataset.Builder(remoteView);
            builder.setAuthentication(intentSender);

            // Note the dataset MUST have values set. These aren't actually used so we'll just fill dummy values out
            parseResult.email.forEach(id -> builder.setValue(id, AutofillValue.forText("-")));
            parseResult.username.forEach(id -> builder.setValue(id, AutofillValue.forText("-")));
            parseResult.password.forEach(id -> builder.setValue(id, AutofillValue.forText("-")));
            Dataset dataSet = builder.build();
            fillResponseBuilder.addDataset(dataSet);

            callback.onSuccess(fillResponseBuilder.build());
        } catch (Exception ex) {
            Log.e(TAG, ex.getMessage());
            callback.onSuccess(null);
        }
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
}