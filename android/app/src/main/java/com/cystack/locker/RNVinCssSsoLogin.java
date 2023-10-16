package com.cystack.locker;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import net.vincss.fido2.ClientSDKConfig;
import net.vincss.fido2.Fido2ClientActivity;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.util.Log;
import java.util.Map;
import java.util.HashMap;

import androidx.annotation.NonNull;

public class RNVinCssSsoLogin extends ReactContextBaseJavaModule {
    private static final int SSO_LOGIN_REQUEST = 1;
    private static final String R_REQUEST_CANCELLED = "E_PICKER_CANCELLED";
    private static final String E_ACTIVITY_DOES_NOT_EXIST = "E_ACTIVITY_DOES_NOT_EXIST";
    private static final String E_FAILED_TO_SHOW_WEBVIEW = "E_FAILED_TO_SHOW_WEBVIEW";

    private Promise mWebauthPromise;
    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (requestCode == SSO_LOGIN_REQUEST) {
                if (mWebauthPromise != null) {
                    if (resultCode == Activity.RESULT_CANCELED) {
                        mWebauthPromise.reject(R_REQUEST_CANCELLED, "SSO was cancelled by user");
                    } else if (resultCode == Activity.RESULT_OK) {
                        WritableMap map = Arguments.createMap();
                        int status = intent.getIntExtra("status", 0);
                        String error_message = intent.getStringExtra("error_message");
                        int error_code = intent.getIntExtra("error_code", 0);
                        String callbackUrl = intent.getStringExtra("url");

                        map.putInt("status", status);
                        map.putString("error_message", error_message);
                        map.putInt("error_code", error_code);
                        map.putString("url", callbackUrl);
                        mWebauthPromise.resolve(map);
                    }
                }
                mWebauthPromise = null;
            }
        }
    };

    RNVinCssSsoLogin(ReactApplicationContext context) {
        super(context);
        // Add the listener for `onActivityResult`
        context.addActivityEventListener(mActivityEventListener);
    }

    @Override
    public String getName() {
        return "VinCssSsoLoginModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("FEATURE_USB_HOST", PackageManager.FEATURE_USB_HOST);
        constants.put("FEATURE_NFC", PackageManager.FEATURE_NFC);
        return constants;
    }

    @ReactMethod
    public void hasSystemFeature(String feature, final Promise promise) {
        try {
            boolean pm = getCurrentActivity().getPackageManager().hasSystemFeature(feature);
            promise.resolve(pm);
        } catch (Exception e) {
            promise.reject("error", e);
        }
    }

    @ReactMethod
    public void startUSBAuthen(@NonNull String url, @NonNull String callBackDomain, final Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Activity doesn't exist");
            return;
        }
        // Store the promise to resolve/reject when picker returns data
        mWebauthPromise = promise;
        try {
            ClientSDKConfig.getInstance().setOrigin(url);
            ClientSDKConfig.getInstance().useWebAuthnAPI(true);
            ClientSDKConfig.getInstance().setCommunicationMethod(ClientSDKConfig.CommunicationMethod.USB);
            ClientSDKConfig.getInstance().requireCallbackURI(true);
            ClientSDKConfig.getInstance().setCallbackDomain(callBackDomain);
            Intent ssoIntent = new Intent(getReactApplicationContext(), Fido2ClientActivity.class);
            ssoIntent.putExtra("key_qr", true);
            currentActivity.startActivityForResult(ssoIntent, SSO_LOGIN_REQUEST);
        } catch (Exception e) {
            mWebauthPromise.reject(E_FAILED_TO_SHOW_WEBVIEW, e);
            mWebauthPromise = null;
        }
    }

    @ReactMethod
    public void startNFCAuthen(@NonNull String url, @NonNull String callBackDomain, final Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Activity doesn't exist");
            return;
        }

        // Store the promise to resolve/reject when picker returns data
        mWebauthPromise = promise;
        try {
            ClientSDKConfig.getInstance().setOrigin(url);
            ClientSDKConfig.getInstance().useWebAuthnAPI(true);
            ClientSDKConfig.getInstance().setCommunicationMethod(ClientSDKConfig.CommunicationMethod.NFC);
            ClientSDKConfig.getInstance().requireCallbackURI(true);
            ClientSDKConfig.getInstance().setCallbackDomain(callBackDomain);
            Intent ssoIntent = new Intent(getReactApplicationContext(), Fido2ClientActivity.class);
            ssoIntent.putExtra("key_qr", true);
            currentActivity.startActivityForResult(ssoIntent, SSO_LOGIN_REQUEST);
        } catch (Exception e) {
            mWebauthPromise.reject(E_FAILED_TO_SHOW_WEBVIEW, e);
            mWebauthPromise = null;
        }
    }

}