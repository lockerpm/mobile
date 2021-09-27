package com.cystack.locker;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import android.util.Log;
import android.view.autofill.AutofillManager;
import android.content;
import android.provider;
import android.net.uri;

public class AutofillModule extends ReactContextBaseJavaModule {
  AutofillModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "AutofillModule";
  }

  @ReactMethod
  public void test() {
    Log.d("AutofillModule", "Autofill module connected");
  }

  @ReactMethod
  public boolean isSupported() {
    return AutofillManager.isAutofillSupported();
  }

  @ReactMethod
  public boolean serviceEnabled() {
    return AutofillManager.hasEnabledAutofillServices();
  }

  @ReactMethod
  public boolean openSettings() {
    try {
      Intent intent = new Intent(Settings.ACTION_REQUEST_SET_AUTOFILL_SERVICE);
      intent.setData(parse("package:com.cystack.locker"))
      startActivity(intent);
      return true;
    }
    catch (ActivityNotFoundException) {
      Log.d("AutofillModule", "activity not found");
      return false;
    }
  }

  @ReactMethod
  public void disable() {
    return AutofillManager.disableAutofillServices();
  }
}