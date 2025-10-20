package com.cystack.locker.screening;

import android.os.Build;
import android.telecom.Call;
import android.telecom.CallScreeningService;
import android.util.Log;

import androidx.annotation.RequiresApi;

import com.cystack.locker.scam.ScamService;

@RequiresApi(api = Build.VERSION_CODES.Q)
public class LockerScreeningService extends CallScreeningService {
    private static String TAG = "LockerScreeningService";

    @Override
    public void onScreenCall(Call.Details callDetails) {
        int callDirection = callDetails.getCallDirection();

        Log.d(TAG, "callDirection: " + callDirection);
        if (Call.Details.DIRECTION_INCOMING == callDirection) {
            String phoneNumber = null;
            if (callDetails.getHandle() != null) {
                phoneNumber = callDetails.getHandle().getSchemeSpecificPart();
            }

            Log.d(TAG, "onScreenCall: " + phoneNumber);

            if (phoneNumber != null) {
                ScamService.lookup(this, phoneNumber);
            }
        }
        respondToCall(callDetails, new CallResponse.Builder().build());
    }


    private boolean checkNumber(String number) {
        // Example detection logic: block any number starting with +999
        return number.startsWith("+999");
    }
}