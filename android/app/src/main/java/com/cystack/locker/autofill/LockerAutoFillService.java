package com.cystack.locker.autofill;

import android.app.assist.AssistStructure;
import android.content.IntentSender;
import android.os.Build;
import android.os.CancellationSignal;
import android.service.autofill.AutofillService;
import android.service.autofill.Dataset;
import android.service.autofill.FillCallback;
import android.service.autofill.FillRequest;
import android.service.autofill.FillResponse;
import android.service.autofill.SaveCallback;
import android.service.autofill.SaveRequest;
import android.util.ArrayMap;
import android.util.Log;
import android.view.autofill.AutofillId;
import android.view.autofill.AutofillValue;
import android.widget.RemoteViews;
import android.util.ArrayMap;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.cystack.locker.LockerAutofillClient;
import com.cystack.locker.R;

import java.util.ArrayList;
import java.util.Map;

import com.facebook.react.bridge.ReactApplicationContext;

@RequiresApi(api = Build.VERSION_CODES.O)
public class LockerAutoFillService extends AutofillService {
    private static final String TAG = "Locker_Service";
    private int mNumberDatasets;
    private ArrayList<AutofillData> datas = new ArrayList<>();
    @Override
    public void onConnected() {
        super.onConnected();

        // datas.add(new AutofillData("username", "pass", "locker", "facebook", System.currentTimeMillis()));
        // mNumberDatasets = datas.size() + 1;
        mNumberDatasets = 1;
    }

    @Override
    public void onFillRequest(@NonNull FillRequest request, @NonNull CancellationSignal cancellationSignal, @NonNull FillCallback callback) {
        Log.d(TAG, "onFillRequest()");

       
        // Find autofillable fields
        AssistStructure structure = Utils.getLatestAssistStructure(request);

        Parser.Result result =  new Parser(structure).parse();

        ArrayMap<String, AutofillId> fields =result.getFillable();
        String domain = result.getDomain();

        Log.d(TAG, "Domain: " + domain);
        Log.d(TAG, "autofillable fields:" + fields);

        ReactApplicationContext reactContext = new ReactApplicationContext(getApplicationContext());
        AutofillDataKeychain autoFillHelper = new AutofillDataKeychain(reactContext, domain);

        if (fields.isEmpty() || Utils.BlacklistedUris.contains(domain)) {
            Log.d(TAG, "No autofill hints found");
            callback.onSuccess(null);
            return;
        }

        IntentSender authentication = LockerAutofillClient.newIntentSenderForResponse(this, fields, domain);
        // Create response...
        FillResponse.Builder response = new FillResponse.Builder();

        for (int i = 0 ; i < mNumberDatasets -1; i++){
            response.addDataset(buildDataSetWithAuthen(fields, datas.get(i), authentication));
        }
        response.addDataset(buildDataSetLocker(fields, authentication));

        // ... and return it
        callback.onSuccess(response.build());
    }


    @Override
    public void onSaveRequest(@NonNull SaveRequest request, @NonNull SaveCallback callback) {

    }
    public Dataset buildDataSetLocker(ArrayMap<String, AutofillId> fields, IntentSender authentication){
        RemoteViews presentation = new RemoteViews(getPackageName(), R.layout.remote_locker_app);

        Dataset unlockedDataset = newlockedDataset(fields, null, presentation, authentication);

        return unlockedDataset;
    }

    public Dataset buildDataSetWithAuthen(ArrayMap<String, AutofillId> fields, AutofillData data, IntentSender authentication){
        RemoteViews presentation = new RemoteViews(getPackageName(), android.R.layout.simple_list_item_1);
        presentation.setTextViewText(android.R.id.text1, data.getName());

        Dataset unlockedDataset = newlockedDataset(fields, data , presentation, authentication);

        return unlockedDataset;
    }


    public static Dataset newUnlockDataset(@NonNull Map<String, AutofillId> fields, @NonNull AutofillData data, RemoteViews presentation){
        Dataset.Builder dataset = new Dataset.Builder();
        for (Map.Entry<String, AutofillId> field : fields.entrySet()) {
            String hint = field.getKey();
            AutofillId id = field.getValue();
            String value = hint.contains("password") ? data.getPassword() : data.getUserName();
            dataset.setValue(id, AutofillValue.forText(value), presentation);
        }
        return dataset.build();
    }

    static Dataset newlockedDataset(@NonNull Map<String, AutofillId> fields, AutofillData data, RemoteViews presentation, IntentSender authentication) {
        Dataset.Builder dataset = new Dataset.Builder();
        for (Map.Entry<String, AutofillId> field : fields.entrySet()) {
            String hint = field.getKey();
            AutofillId id = field.getValue();

            if (data != null) {
                String value = hint.contains("password") ? data.getPassword() : data.getUserName();
                dataset.setValue(id, AutofillValue.forText(value), presentation);
            } else {
                dataset.setValue(id,  null, presentation);
            }
        }
        dataset.setAuthentication(authentication);
        return dataset.build();
    }

}
