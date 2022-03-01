package com.cystack.locker;

import static android.view.autofill.AutofillManager.EXTRA_AUTHENTICATION_RESULT;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.IntentSender;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.service.autofill.Dataset;
import android.view.autofill.AutofillId;
import android.view.autofill.AutofillValue;
import android.widget.RemoteViews;
import android.widget.Button;
import android.util.ArrayMap;
import android.os.Parcelable;
import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import com.cystack.locker.autofill.Prefs;
import com.cystack.locker.autofill.AutofillData;
import com.cystack.locker.autofill.LockerAutoFillService;

@RequiresApi(api = Build.VERSION_CODES.O)
public class LockerAutofillClient extends AppCompatActivity {
    Button fillButton;

    private static final String DOMAIN = "domain";
    private static final String EXTRA_HINTS = "hints";
    private static final String EXTRA_IDS = "ids";
    private static int sPendingIntentId = 0;

    public static IntentSender newIntentSenderForResponse(@NonNull Context context,
                                                          @NonNull ArrayMap<String, AutofillId> fields, String domain) {

        Intent intent = new Intent(context, LockerAutofillClient.class);

        int size = fields.size();
        String[] hints = new String[size];
        AutofillId[] ids = new AutofillId[size];
        for (int i = 0; i < size; i++) {
            hints[i] = fields.keyAt(i);
            ids[i] = fields.valueAt(i);
        }

        intent.putExtra(EXTRA_HINTS, hints);
        intent.putExtra(EXTRA_IDS, ids);
        intent.putExtra(DOMAIN, domain);

        return PendingIntent.getActivity(context, ++sPendingIntentId, intent,
                PendingIntent.FLAG_CANCEL_CURRENT).getIntentSender();
    }


    private final ActivityResultLauncher<Intent> lockerLauncher =
            registerForActivityResult(new ActivityResultContracts.StartActivityForResult(), this::lockerLauncherResult);

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_client);


        Intent intent = new Intent(this, MainActivity.class);
        intent.putExtra("autofill", 1); //start app by autofill service
        intent.putExtra("domain", getIntent().getStringExtra(DOMAIN));
        lockerLauncher.launch(intent);
    }

    private void lockerLauncherResult(final ActivityResult result) {
        final SharedPreferences prefs = getSharedPreferences(Prefs.NAME, MODE_PRIVATE);
        String passFillValue = Prefs.getPassword(prefs);
        String usernameFillValue = Prefs.getUserName(prefs);

        AutofillData data = new AutofillData(usernameFillValue, passFillValue, usernameFillValue, "...", System.currentTimeMillis());

        if (passFillValue == null){
            setResult(RESULT_CANCELED);
            finish();
        }
        onFillPassword(data);
    }

    private void onFillPassword(AutofillData data) {
        
        Intent myIntent = getIntent();
        Intent replyIntent = new Intent();

        String[] hints = myIntent.getStringArrayExtra(EXTRA_HINTS);
        Parcelable[] ids = myIntent.getParcelableArrayExtra(EXTRA_IDS);
        int size = hints.length;
        ArrayMap<String, AutofillId> fields = new ArrayMap<>(size);
        for (int i = 0; i < size; i++) {
            fields.put(hints[i], (AutofillId) ids[i]);
        }
        RemoteViews presentation = new RemoteViews(getPackageName(), R.layout.remote_locker_app); // crash ?
        Dataset response =
                LockerAutoFillService.newUnlockDataset(fields, data, presentation);
        replyIntent.putExtra(EXTRA_AUTHENTICATION_RESULT, response);

        setResult(RESULT_OK, replyIntent);
        finish();
    }

}