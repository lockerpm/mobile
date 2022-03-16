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
    private static final String TAG = "LockerAutoFillService";
    private static final String service = "W7S57TNBH5.com.cystack.lockerapp";

   private final PrefsStorage prefsStorage;
   private final CipherStorage cipherStorage;

    // Data used by autofill service
    public  boolean faceIdEnabled = false;
    public  boolean loginedLocker = false;
    public String email;
    public String hashMassterPass;
    public String userAvatar;
    public ArrayList<AutofillItem> credentials = new ArrayList<>();
    // public ArrayList<AutofillItem> otherCredentials = new ArrayList<>();


    public AutofillDataKeychain(ReactApplicationContext reactContext, String domain) {
        cipherStorage = new CipherStorageKeystoreAesCbc();
        prefsStorage = new PrefsStorage(reactContext);
        getAutoFillEntriesForDomain(domain);
    }

    /**
     * For a given domain name, attempt to find matching AutoFill credentials
     * @param domain - The domain name to search for
     * @return - List of matching Username/Passwords in the form of the AutofillData class.
     */
    public void getAutoFillEntriesForDomain(String domain) {
        try {
            String itemString = getAutoFillItems();
            if (itemString == null){
                return;
            }
            loginedLocker = true;
            JSONObject jsonObject = new JSONObject(itemString);
            JSONArray jsonArray  = jsonObject.getJSONArray("passwords");
            List<Object> itemList = toList(jsonArray);
            for (Object item: itemList) {
                if (item instanceof HashMap) {
                    HashMap map = (HashMap) item;
                    String username = (String) map.get("username");
                    String password = (String) map.get("password");
                    String uri = (String) map.get("uri");
                    String name = (String) map.get("name");
                    String id = (String) map.get("id");

                    credentials.add(new AutofillItem(id, username, password, name, uri));
                    // if (domain.contains(uri)) {
                    //     credentials.add(new AutofillItem(id, username, password, name, uri));
                    // } else {
                    //     otherCredentials.add(new AutofillItem(id, username, password, name, uri));
                    // }
                }
            }

            JSONObject authen = jsonObject.getJSONObject("authen");
            email = authen.getString("email");
            hashMassterPass = authen.getString("hashPass");
            userAvatar = authen.getString("avatar");
            faceIdEnabled = jsonObject.getBoolean("faceIdEnabled");        
             Log.e(TAG, "----------- no error sss");
        } catch (Exception ex) {
            Log.e(TAG, ex.getMessage());

        }
    }
    private String getAutoFillItems() throws Exception {
        PrefsStorage.ResultSet resultSet = prefsStorage.getEncryptedEntry(service);
        if (resultSet == null) {
            Log.e(TAG, "No entry found");
            return "[]";
        }

    
        CipherStorage.DecryptionResult decryptionResult = cipherStorage.decrypt(service, resultSet.username, resultSet.password, SecurityLevel.ANY);
        return decryptionResult.password;
    }

    private void setItem(String key, String value) throws Exception {
       CipherStorage.EncryptionResult result = cipherStorage.encrypt(service, key, value, SecurityLevel.ANY);
       prefsStorage.storeEncryptedEntry(service, result);
    }

    public static Map<String, Object> toMap(JSONObject object) throws JSONException {
        Map<String, Object> map = new HashMap<String, Object>();

        Iterator<String> keysItr = object.keys();
        while(keysItr.hasNext()) {
            String key = keysItr.next();
            Object value = object.get(key);

            if(value instanceof JSONArray) {
                value = toList((JSONArray) value);
            }

            else if(value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            map.put(key, value);
        }
        return map;
    }

    public static List<Object> toList(JSONArray array) throws JSONException {
        List<Object> list = new ArrayList<Object>();
        for(int i = 0; i < array.length(); i++) {
            Object value = array.get(i);
            if(value instanceof JSONArray) {
                value = toList((JSONArray) value);
            }

            else if(value instanceof JSONObject) {
                value = toMap((JSONObject) value);
            }
            list.add(value);
        }
        return list;
    }
}
