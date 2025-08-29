package com.cystack.locker.scam;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.telephony.TelephonyManager;
import android.util.Log;


public class ScamReceiver extends BroadcastReceiver {
    private static boolean isRinging = false;
    private static boolean isOffHook = false;

    @Override
    public void onReceive(Context context, Intent intent) {
        String state = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
        Log.d("com.cystack.locker", state);
        if (TelephonyManager.EXTRA_STATE_RINGING.equals(state)) {
            String number = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER);
            isRinging = true;
            isOffHook = false;
            if (number != null) {
                ScamService.lookup(context.getApplicationContext(), number);
            }
        }

        if (TelephonyManager.EXTRA_STATE_OFFHOOK.equals(state)) {
            isOffHook = true;
        }

        if (TelephonyManager.EXTRA_STATE_IDLE.equals(state)) {
            // Nếu trước đó có RINGING nhưng không có OFFHOOK => cuộc gọi bị từ chối/huỷ
            if (isRinging && !isOffHook) {
                ScamService.removeOverlay(); // Đóng overlay nếu còn hiện
            }

            // Reset flags
            isRinging = false;
            isOffHook = false;
        }
    }
}