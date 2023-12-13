package com.cystack.locker.vincss;

import android.content.Intent;
import android.os.Build;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class RNManufacturerSettingsAndroid extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public RNManufacturerSettingsAndroid(ReactApplicationContext reactContext) {
      super(reactContext);
      this.reactContext = reactContext;
    }
  
    @Override
    public String getName() {
      return "RNManufacturerSettings";
    }

    private void startActivityForResult(Intent intent) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivityForResult(intent, 1, null);
      }

    private void putExtraPackageStartActivityForResult(Intent intent) {
        intent.putExtra("extra_pkgname", reactContext.getPackageName());
        startActivityForResult(intent);
      }

    @ReactMethod
    public void XIAOMI_APP_PERM_EDITOR() {
        Intent intent =new Intent("miui.intent.action.APP_PERM_EDITOR");
        putExtraPackageStartActivityForResult(intent);
    }
}

