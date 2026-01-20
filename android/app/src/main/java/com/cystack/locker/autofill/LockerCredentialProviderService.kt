package com.cystack.locker.autofill

import com.cystack.locker.packages.RNAutofillServiceAndroid

import android.os.Bundle
import android.os.Build
import android.os.CancellationSignal
import android.os.OutcomeReceiver
import androidx.annotation.RequiresApi
import android.graphics.drawable.Icon
import com.cystack.locker.R

import androidx.credentials.webauthn.PublicKeyCredentialRequestOptions
import androidx.credentials.exceptions.ClearCredentialException
import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.CreateCredentialUnknownException
import androidx.credentials.exceptions.GetCredentialUnknownException

import androidx.credentials.provider.BeginGetPublicKeyCredentialOption
import androidx.credentials.provider.BeginGetPasswordOption
import androidx.credentials.provider.CallingAppInfo
import androidx.credentials.provider.CredentialEntry
import androidx.credentials.provider.PublicKeyCredentialEntry
import androidx.credentials.provider.BeginCreateCredentialRequest
import androidx.credentials.provider.BeginCreateCredentialResponse
import androidx.credentials.provider.BeginCreatePublicKeyCredentialRequest
import androidx.credentials.provider.BeginGetCredentialRequest
import androidx.credentials.provider.BeginGetCredentialResponse
import androidx.credentials.provider.CreateEntry
import androidx.credentials.provider.AuthenticationAction
import androidx.credentials.provider.CredentialProviderService
import androidx.credentials.provider.ProviderClearCredentialStateRequest

import android.util.Log


@RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
class LockerCredentialProviderService: CredentialProviderService() {
    override fun onClearCredentialStateRequest(
        request: ProviderClearCredentialStateRequest,
        cancellationSignal: CancellationSignal,
        callback: OutcomeReceiver<Void?, ClearCredentialException>
    ) {
//        TODO("Not yet implemented")
    }

    // ------------------------------- Get -----------------------------------------

    override fun onBeginGetCredentialRequest(
        request: BeginGetCredentialRequest,
        cancellationSignal: CancellationSignal,
        callback: OutcomeReceiver<BeginGetCredentialResponse, GetCredentialException>
    ) {
        // If cancellation is requested, return immediately
        if (cancellationSignal.isCanceled) {
            return
        }
        try {
            val response = processGetCredentialRequest(request)
            callback.onResult(response)
        } catch (e: GetCredentialException) {
            callback.onError(GetCredentialUnknownException())
        }
    }

    fun processGetCredentialRequest(
        request: BeginGetCredentialRequest
    ): BeginGetCredentialResponse {
        val callingAppInfo = request.callingAppInfo
        for (option in request.beginGetCredentialOptions) {
            when (option) {
                is BeginGetPasswordOption -> {
                    return BeginGetCredentialResponse()
                }
                is BeginGetPublicKeyCredentialOption -> {
                    return BeginGetCredentialResponse(
                        credentialEntries = populatePasskeyData(option)
                    )
                }
            }
        }
        return BeginGetCredentialResponse()
    }
    private fun populatePasskeyData(
        option: BeginGetPublicKeyCredentialOption
    ): List<CredentialEntry> {
        val passkeyEntries: MutableList<CredentialEntry> = mutableListOf()
        val request = PublicKeyCredentialRequestOptions(option.requestJson)

        // Get your credentials from database where you saved during creation flow
        passkeyEntries.add(
            PublicKeyCredentialEntry(
                context = applicationContext,
                username = request.rpId,
                pendingIntent = RNAutofillServiceAndroid.intentForGetCredential(applicationContext),
                beginGetPublicKeyCredentialOption = option,
                displayName = "Locker",
                icon = Icon.createWithResource(applicationContext, R.mipmap.ic_launcher)
            )
        )
        return passkeyEntries
    }
    // ------------------------------- Create ----------------------------------------

    override fun onBeginCreateCredentialRequest(
        request: BeginCreateCredentialRequest,
        cancellationSignal: CancellationSignal,
        callback: OutcomeReceiver<BeginCreateCredentialResponse, CreateCredentialException>
    ) {
        val response: BeginCreateCredentialResponse? = processCreateCredentialRequest(request)
        if (response != null) {
            callback.onResult(response)
        } else {
            callback.onError(CreateCredentialUnknownException("response is null"))
        }
    }

    fun processCreateCredentialRequest(request: BeginCreateCredentialRequest): BeginCreateCredentialResponse? {
        when (request) {
            is BeginCreatePublicKeyCredentialRequest -> {
                // Request is passkey type
                return handleCreatePasskeyQuery(request)
            }
        }
        // Request not supported
        return null
    }

    private fun handleCreatePasskeyQuery(
        request: BeginCreatePublicKeyCredentialRequest
    ): BeginCreateCredentialResponse? {
        val requestJson = request
            .candidateQueryData
            .getString("androidx.credentials.BUNDLE_KEY_REQUEST_JSON")
        if (requestJson.isNullOrEmpty()) return null

        return BeginCreateCredentialResponse(
            createEntries = mutableListOf(
                CreateEntry(
                "Locker",
                RNAutofillServiceAndroid.intentForCreateCredential(applicationContext)
            ))
        )
    }
}
