package com.cystack.locker

import android.os.Bundle
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled

open class CustomReactActivityDelegate(
    private val activity: ReactActivity,
    mainComponentName: String,
) : DefaultReactActivityDelegate(activity, mainComponentName, fabricEnabled) {
    private var TAG = "MainActivity___"

    override fun getLaunchOptions(): Bundle? {
        Log.d(TAG, "CustomReactActivityDelegate:  ${activity.intent.extras}")
        var launchOptions = Bundle()
        launchOptions.putString("testInit", "123123")


        val intentExtras = activity.intent?.extras
        intentExtras?.let { bundle ->
            when {
                bundle.containsKey("autofill") -> {
                    launchOptions.putInt("autofill", bundle.getInt("autofill"))
                    launchOptions.putString("domain", bundle.getString("domain"))
                }
                bundle.containsKey("savePassword") -> {
                    launchOptions.putInt("savePassword", bundle.getInt("savePassword"))
                    launchOptions.putString("domain", bundle.getString("domain"))
                    bundle.getString("username")?.let {
                        launchOptions.putString("username", it)
                    }
                    launchOptions.putString("password", bundle.getString("password"))
                }
                bundle.containsKey("lastFill") -> {
                    launchOptions.putInt("lastFill", bundle.getInt("lastFill"))
                    launchOptions.putString("lastUserPasswordID", bundle.getString("itemID"))
                }

                else -> {}
            }
        }
        return launchOptions
    }
}