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
import android.util.Log;
import android.view.autofill.AutofillValue;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.cystack.locker.R;
import com.cystack.locker.autofill.activities.VerifyMasterPasswordActivity;
import com.cystack.locker.autofill.parser.Parser;

import java.util.ArrayList;


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

        Log.d(TAG, "Domain: " + domain);
        Log.d(TAG, "autofillable fields:" + fields.size());

        if ( fields == null || fields.isEmpty() || Utils.BlacklistedUris.contains(domain)) {
            Log.d(TAG, "No autofill hints found");
            callback.onSuccess(null);
            return;
        }

        IntentSender authentication = VerifyMasterPasswordActivity.newIntentSenderForResponse(this, fields, domain);
        // Create response...
        FillResponse.Builder response = new FillResponse.Builder();

//        for (int i = 0 ; i < mNumberDatasets -1; i++){
//            response.addDataset(buildDataSetWithAuthen(fields, datas.get(i), authentication));
//        }
        response.addDataset(buildDataSetLocker(fields, authentication));

        // ... and return it
        callback.onSuccess(response.build());
    }

    @Override
    public void onSaveRequest(@NonNull SaveRequest request, @NonNull SaveCallback callback) {

    }
    public Dataset buildDataSetLocker(ArrayList<Field> fields, IntentSender authentication){
        RemoteViews presentation = new RemoteViews(getPackageName(), R.layout.remote_locker_app);

        Dataset unlockedDataset = newlockedDataset(fields, null, presentation, authentication);

        return unlockedDataset;
    }

    public Dataset buildDataSetWithAuthen(ArrayList<Field> fields, AutofillItem data, IntentSender authentication){
        RemoteViews presentation = new RemoteViews(getPackageName(), android.R.layout.simple_list_item_1);
        presentation.setTextViewText(android.R.id.text1, data.getName());

        Dataset unlockedDataset = newlockedDataset(fields, data , presentation, authentication);

        return unlockedDataset;
    }


    public static Dataset newUnlockDataset(@NonNull ArrayList<Field> fields, AutofillItem data, RemoteViews presentation){
        Dataset.Builder dataset = new Dataset.Builder();

        for (Field field : fields) {
            if (data != null) {
                if (field.fillType == Field.FILL_TYPE_PASSWORD) {
                    dataset.setValue(field.autofillId, AutofillValue.forText(data.getPassword()), presentation);
                } else if (field.fillType == Field.FILL_TYPE_EMAIL) {
                    dataset.setValue(field.autofillId, AutofillValue.forText(data.getUserName()), presentation);
                } else if (field.fillType == Field.FILL_TYPE_USERNAME) {
                    dataset.setValue(field.autofillId, AutofillValue.forText(data.getUserName()), presentation);
                }

            } else {
                dataset.setValue(field.autofillId,  null, presentation);
            }
        }
        return dataset.build();
    }

    static Dataset newlockedDataset(@NonNull ArrayList<Field> fields, AutofillItem data, RemoteViews presentation, IntentSender authentication) {
        Dataset.Builder dataset = new Dataset.Builder();
        for (Field field : fields) {
            if (data != null) {
                if (field.fillType == Field.FILL_TYPE_PASSWORD) {
                    dataset.setValue(field.autofillId, AutofillValue.forText(data.getPassword()), presentation);
                } else if (field.fillType == Field.FILL_TYPE_EMAIL) {
                    dataset.setValue(field.autofillId, AutofillValue.forText(data.getUserName()), presentation);
                } else if (field.fillType == Field.FILL_TYPE_USERNAME) {
                    dataset.setValue(field.autofillId, AutofillValue.forText(data.getUserName()), presentation);
                }

            } else {
                dataset.setValue(field.autofillId,  null, presentation);
            }
        }
        dataset.setAuthentication(authentication);
        return dataset.build();
    }

}
