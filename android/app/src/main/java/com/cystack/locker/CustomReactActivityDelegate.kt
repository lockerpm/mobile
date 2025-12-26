package com.cystack.locker

import android.os.Build.VERSION_CODES
import android.os.Bundle
import android.util.Log
import android.util.Base64

import androidx.annotation.RequiresApi
import androidx.credentials.provider.PendingIntentHandler
import androidx.credentials.provider.CallingAppInfo
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption

import com.facebook.react.ReactActivity
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import java.security.MessageDigest

import com.cystack.locker.autofill.passkey.PasskeyUtils

open class CustomReactActivityDelegate(
    private val activity: ReactActivity,
    mainComponentName: String,
) : DefaultReactActivityDelegate(activity, mainComponentName, fabricEnabled) {
    override fun getLaunchOptions(): Bundle? {
        var launchOptions = Bundle()
        val intent = activity.intent ?: return launchOptions

        val getRequest = PendingIntentHandler.retrieveProviderGetCredentialRequest(intent)
        if (getRequest != null && getRequest?.credentialOptions?.first() is GetPublicKeyCredentialOption) {
            val publicKeyRequest = getRequest?.credentialOptions?.first() as GetPublicKeyCredentialOption

            launchOptions.putString("requestJson", publicKeyRequest.requestJson)

            val callingAppInfo = getRequest.callingAppInfo
            val clientDataHash = publicKeyRequest.clientDataHash
            if (clientDataHash != null) {
                launchOptions.putString(
                    "clientDataHash",
                    PasskeyUtils.b64Encode(clientDataHash)
                )
            }
            launchOptions.putString("origin", appInfoToOrigin(callingAppInfo))
            launchOptions.putString("packageName", callingAppInfo.packageName)
        }

        val createRrequest = PendingIntentHandler.retrieveProviderCreateCredentialRequest(intent)
        if (createRrequest != null && createRrequest.callingRequest is CreatePublicKeyCredentialRequest) {
            val publicKeyRequest: CreatePublicKeyCredentialRequest = createRrequest.callingRequest as CreatePublicKeyCredentialRequest

            launchOptions.putString("requestJson", publicKeyRequest.requestJson)

            val callingAppInfo = createRrequest.callingAppInfo
            launchOptions.putString("origin", appInfoToOrigin(callingAppInfo))
            launchOptions.putString("packageName", callingAppInfo.packageName)
        }

        val intentExtras = activity.intent?.extras
        intentExtras?.let { bundle ->
            when {
                bundle.containsKey("type") -> {
                    launchOptions.putInt("type", bundle.getInt("type"))

                    bundle.getString("url")?.let {
                        launchOptions.putString("url", it)
                    }
                    bundle.getString("id")?.let {
                        launchOptions.putString("id", it)
                    }
                    bundle.getString("password")?.let {
                        launchOptions.putString("password", it)
                    }
                    bundle.getString("username")?.let {
                        launchOptions.putString("username", it)
                    }
                }
                else -> {}
            }
        }

        return launchOptions
    }

    @RequiresApi(VERSION_CODES.P)
    fun appInfoToOrigin(info: CallingAppInfo): String {
        val cert = info.signingInfo.apkContentsSigners[0].toByteArray()
        val md = MessageDigest.getInstance("SHA-256")
        val certHash = md.digest(cert)
        // This is the format for origin
        return "android:apk-key-hash:${Base64.encodeToString(certHash, Base64.NO_PADDING or Base64.NO_WRAP or Base64.URL_SAFE)}"
    }
}