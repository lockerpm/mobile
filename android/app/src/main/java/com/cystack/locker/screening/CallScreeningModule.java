package com.cystack.locker.screening;


import android.app.Activity;
import android.app.role.RoleManager;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.telecom.TelecomManager;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class CallScreeningModule extends ReactContextBaseJavaModule {
    private static final int REQUEST_ID = 12345;
    private Promise rolePromise;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == REQUEST_ID && rolePromise != null) {
                if (resultCode == Activity.RESULT_OK) {
                    rolePromise.resolve(true); // thành công
                } else {
                    rolePromise.resolve(false); // bị từ chối
                }
                rolePromise = null;
            }
        }
    };

    public CallScreeningModule(ReactApplicationContext reactContext) {
        super(reactContext);

        // Lắng nghe onActivityResult
        reactContext.addActivityEventListener(activityEventListener);
    }

    @NonNull
    @Override
    public String getName() {
        return "CallerIDManager";
    }

    @ReactMethod
    public void requestScreeningRole(Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "No current activity");
            return;
        }
        this.rolePromise = promise;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            RoleManager roleManager = (RoleManager) currentActivity.getSystemService(Activity.ROLE_SERVICE);
            if (roleManager != null && !roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
                Intent intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING);
                currentActivity.startActivityForResult(intent, REQUEST_ID);
            } else {
                promise.resolve(true); // đã có quyền
            }
        } else {
            promise.resolve(true); // chưa hỗ trợ
        }
    }

    @ReactMethod
    public void isEnabledScreeningRole(Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject("NO_ACTIVITY", "No current activity");
            return;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            RoleManager roleManager = (RoleManager) currentActivity.getSystemService(Activity.ROLE_SERVICE);
            if (roleManager != null && !roleManager.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
                promise.resolve(false);
            } else {
                promise.resolve(true);
            }
        } else {
            promise.resolve(true);
        }
    }
}
