package com.cystack.locker.callerID;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.CallLog;
import android.provider.Settings;

import androidx.core.app.ActivityCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

public class CallerIDManager extends ReactContextBaseJavaModule {
    public static final String NAME = "CallerIdModule";
    private ReactApplicationContext reactContext;

    public CallerIDManager(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "CallerIDManager";
    }

    @ReactMethod
    public void isOverlayPermissionEnabled(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(getReactApplicationContext())) {
                promise.resolve(false);
            } 
        }
        promise.resolve(true);
    }

     @ReactMethod
    public void requestOverlayPermission(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(getReactApplicationContext())) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + getReactApplicationContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getReactApplicationContext().startActivity(intent);
                promise.resolve(false);
            } 
        } 
        promise.resolve(true);
    }

    @ReactMethod
    public void getCallLogs(int page, int pageSize, Promise promise) {
        if (ActivityCompat.checkSelfPermission(this.reactContext, Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSION_DENIED", "READ_CALL_LOG permission not granted");
            return;
        }

        WritableArray callLogs = Arguments.createArray();
        Cursor cursor = null;

        try {
             String[] projection = {
                CallLog.Calls._ID,
                CallLog.Calls.NUMBER,
                CallLog.Calls.CACHED_NAME,   // Tên nếu có trong danh bạ
                CallLog.Calls.DATE,
                CallLog.Calls.TYPE,
                CallLog.Calls.DURATION
            };
    
            cursor = reactContext.getContentResolver().query(
                    CallLog.Calls.CONTENT_URI,
                    projection,
                    null,
                    null,
                    CallLog.Calls.DATE + " DESC" // No LIMIT/OFFSET here
            );

            if (cursor == null) {
                promise.reject("CALL_LOG_ERROR", "Cursor is null");
                return;
            }

            int offset = page * pageSize;
            int count = 0;
            int index = 0;

            while (cursor.moveToNext()) {
                if (index++ < offset) continue; // Skip to the page start
                if (count++ >= pageSize) break; // Stop after pageSize

                int number = cursor.getColumnIndex(CallLog.Calls.NUMBER);
                int type = cursor.getColumnIndex(CallLog.Calls.TYPE);
                int date = cursor.getColumnIndex(CallLog.Calls.DATE);
                int duration = cursor.getColumnIndex(CallLog.Calls.DURATION);
                int name = cursor.getColumnIndex(CallLog.Calls.CACHED_NAME);
                int id = cursor.getColumnIndex(CallLog.Calls._ID);

                WritableMap call = Arguments.createMap();
                call.putString("number", cursor.getString(number));
                call.putInt("type", cursor.getInt(type));
                call.putDouble("date", cursor.getLong(date));
                call.putInt("duration", cursor.getInt(duration));
                call.putString("name", cursor.getString(name));
                call.putString("id", cursor.getString(id));
                callLogs.pushMap(call);
            }

            promise.resolve(callLogs);
        } catch (Exception e) {
            promise.reject("CALL_LOG_ERROR", e.getMessage());
        } finally {
            if (cursor != null) cursor.close();
        }
    }
}