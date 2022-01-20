package com.cystack.locker.autofill;

import android.content.SharedPreferences;

import androidx.preference.PreferenceManager;

public class Prefs {
    public static final String NAME = "locker_autofill";
    public static final String AUTOFILL_HINT_USERNAME =  "hint_username";
    public static final String AUTOFILL_HINT_PASSWORD = "hint_password";

    public static String getUserName(SharedPreferences pref) {return pref.getString(AUTOFILL_HINT_USERNAME, "");}
    public static String getPassword(SharedPreferences pref) {return pref.getString(AUTOFILL_HINT_PASSWORD, "");}
}
