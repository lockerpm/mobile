package com.cystack.locker;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Map;
import java.util.HashMap;
import java.util.Objects;

public class AutofillModule extends ReactContextBaseJavaModule {
    AutofillModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "AutofillAndroid";
    }

//    @ReactMethod
//    public void addAutofillValue(String username ,String password) {
//        SharedPreferences pref = getReactApplicationContext().getSharedPreferences(Prefs.NAME, Context.MODE_PRIVATE);
//        pref.edit().putString(Prefs.AUTOFILL_HINT_USERNAME, username)
//                .putString(Prefs.AUTOFILL_HINT_PASSWORD, password)
//            .commit();
//
//        Objects.requireNonNull(getCurrentActivity()).finish();
//    }
}