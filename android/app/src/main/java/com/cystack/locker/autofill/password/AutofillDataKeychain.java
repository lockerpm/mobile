package com.cystack.locker.autofill.password;

import android.util.Log;
import com.facebook.react.bridge.ReactApplicationContext;
import org.json.JSONObject;


public class AutofillDataKeychain {
    // Data used by autofill service
    public String email;
    public String hashPass;
    public boolean isLoggedInPw = false;

    private Keychain keychain;


    public AutofillDataKeychain(ReactApplicationContext reactContext) {
        keychain = new Keychain(reactContext);
        getAutoFillEntriesForDomain();
    }

    public void getAutoFillEntriesForDomain() {
        try {
            String itemString = keychain.getGenericPassword();
            if (itemString == null) {
                return;
            }

            JSONObject jsonObject = new JSONObject(itemString);
            this.email = jsonObject.getString("email");
            this.hashPass = jsonObject.getString("hashPass");
            this.isLoggedInPw = true;
        } catch (Exception ex) {
            Log.e("AutofillDataKeychain", ex.getMessage());
        }
    }
}
