package com.cystack.locker.autofill;

import androidx.annotation.NonNull;
import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;


public class AutoFillHelpers {
    private static final String TAG = "AutoFillHelpers";

    public AutoFillHelpers() {
        
    }

    /**
     * For a given domain name, attempt to find matching AutoFill credentials
     * @param domain - The domain name to search for
     * @return - List of matching Username/Passwords in the form of the AutoFillEntry class.
     */
    public ArrayList<AutoFillEntry> getAutoFillEntriesForDomain(String domain) {
        ArrayList<AutoFillEntry> entries = new ArrayList<>();
        
        try {
            entries.add(new AutoFillEntry("user", "pass", "entry"));
        } catch (Exception ex) {
            Log.e(TAG, ex.getMessage());
            return entries;
        }

        return entries;
    }
}