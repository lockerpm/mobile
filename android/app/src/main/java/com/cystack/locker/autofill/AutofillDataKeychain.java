package com.cystack.locker.autofill;

import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.oblador.keychain.PrefsStorage;
import com.oblador.keychain.SecurityLevel;
import com.oblador.keychain.cipherStorage.CipherStorage;
import com.oblador.keychain.cipherStorage.CipherStorageKeystoreAesCbc;

import com.facebook.react.bridge.ReactApplicationContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class AutofillDataKeychain {
    private static final String TAG = "AutofillDataKeychain";
    private static final String service = "W7S57TNBH5.com.cystack.lockerapp.info";

    private final PrefsStorage prefsStorage;
    private final CipherStorage cipherStorage;

    // Data used by autofill service

    public String email;
    public String hashPass;
    public boolean isLoggedInPw = false;


    public AutofillDataKeychain(ReactApplicationContext reactContext) {
        cipherStorage = new CipherStorageKeystoreAesCbc();
        prefsStorage = new PrefsStorage(reactContext);
        getAutoFillEntriesForDomain();
    }

    /**
     * Deprecated
     * For a given domain name, attempt to find matching AutoFill credentials
     * 
     * @return - List of matching Username/Passwords in the form of the AutofillData
     *         class.
     */
    public void getAutoFillEntriesForDomain() {
        try {
            String itemString = getAutoFillItems();
//            Log.d(TAG, "getAutoFillEntriesForDomain " + itemString);
            if (itemString == null) {
                return;
            }
            JSONObject jsonObject = new JSONObject(itemString);

            this.email = jsonObject.getString("email");
            this.hashPass = jsonObject.getString("hashPass");
            this.isLoggedInPw = true;

        } catch (Exception ex) {
            Log.e(TAG, ex.getMessage());
        }
    }

    private String getAutoFillItems() throws Exception {
        PrefsStorage.ResultSet resultSet = prefsStorage.getEncryptedEntry(service);
        Log.e(TAG, "getAutoFillItems" +resultSet.toString());
        if (resultSet == null) {
            Log.e(TAG, "No entry found");
            return "[]";
        }

        CipherStorage.DecryptionResult decryptionResult = cipherStorage.decrypt(service, resultSet.username,
                resultSet.password, SecurityLevel.ANY);
        return decryptionResult.password;
    }

    private void setItem(String key, String value) throws Exception {
        CipherStorage.EncryptionResult result = cipherStorage.encrypt(service, key, value, SecurityLevel.ANY);
        prefsStorage.storeEncryptedEntry(service, result);
    }

    public static Map<String, Object> toMap(JSONObject object) throws JSONException {
        Map<String, Object> map = new HashMap<String, Object>();

        Iterator<String> keysItr = object.keys();
        while (keysItr.hasNext()) {
            String key = keysItr.next();
            Object value = object.get(key);

            if (value instanceof JSONArray) {
                value = toList((JSONArray) value);
            }

            else if (value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            map.put(key, value);
        }
        return map;
    }

    public static List<Object> toList(JSONArray array) throws JSONException {
        List<Object> list = new ArrayList<Object>();
        for (int i = 0; i < array.length(); i++) {
            Object value = array.get(i);
            if (value instanceof JSONArray) {
                value = toList((JSONArray) value);
            }

            else if (value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            list.add(value);
        }
        return list;
    }
}
