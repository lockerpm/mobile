package com.cystack.locker.autofill.passkey

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import androidx.credentials.webauthn.FidoPublicKeyCredential
import androidx.credentials.webauthn.PublicKeyCredentialCreationOptions
import androidx.credentials.webauthn.PublicKeyCredentialRequestOptions

import androidx.credentials.GetCredentialResponse
import androidx.credentials.PublicKeyCredential
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.exceptions.CreateCredentialUnknownException
import androidx.credentials.exceptions.GetCredentialUnknownException
import androidx.credentials.provider.PendingIntentHandler

import org.json.JSONObject

@SuppressLint("RestrictedApi")
class Fid2Service {
    fun createPasskey(
        activity: Activity,
        requestJson: String,
        credentialId: String,
        publicKey: String,
        origin: String,
        packageName: String,
        clientExtensionResultsJson: String
    ) {
        try {
            val request = PublicKeyCredentialCreationOptions(requestJson)
            val importedPublicKey = PasskeyUtils.importPublicKey(publicKey)

            val response = AuthenticatorAttestationResponse(
                requestOptions = request,
                credentialId = PasskeyUtils.b64Decode(credentialId),
                publicKey = importedPublicKey,
                origin = origin,
                packageName = packageName
            )

            val credential = FidoPublicKeyCredential(
                rawId = PasskeyUtils.b64Decode(credentialId),
                response = response,
                authenticatorAttachment = "platform",
            )

            val result = Intent()
            val credentialJson = addClientExtensionResults(
                credential.json(),
                clientExtensionResultsJson
            )
            val createPublicKeyCredResponse = CreatePublicKeyCredentialResponse(credentialJson)

            PendingIntentHandler.setCreateCredentialResponse(
                result,
                createPublicKeyCredResponse
            )
            activity.setResult(Activity.RESULT_OK, result)
            activity.finish()
        } catch (e: Exception) {
            failCreatePasskey(activity, e.message ?: "Unable to create passkey")
        }
    }

    fun authenPasskey(
        activity: Activity,
        requestJson: String,
        credentialId: String,
        userId: String,
        privateKey: String,
        signatureCounter: Int,
        origin: String,
        packageName: String,
        clientDataHash: String,
        clientExtensionResultsJson: String
    ) {
        try {
            val request = PublicKeyCredentialRequestOptions(requestJson)

            val importedPrivateKey = PasskeyUtils.importPrivateKey(privateKey)

            val clientDataHashByte = if (clientDataHash == "") null else PasskeyUtils.b64Decode(clientDataHash)

            val response = AuthenticatorAssertionResponse(
                requestOptions = request,
                credentialId = PasskeyUtils.b64Decode(credentialId),
                userHandle = PasskeyUtils.b64Decode(userId),
                privateKey = importedPrivateKey,
                signatureCounter = signatureCounter,
                origin = origin,
                packageName = packageName,
                clientDataHash = clientDataHashByte
            )

            val credential = FidoPublicKeyCredential(
                rawId = PasskeyUtils.b64Decode(credentialId),
                response = response,
                authenticatorAttachment = "platform",
            )

            val result = Intent()
            val jsonResult = addClientExtensionResults(
                credential.json(),
                clientExtensionResultsJson
            )

            val passkeyCredential = PublicKeyCredential(jsonResult)

            PendingIntentHandler.setGetCredentialResponse(
                result, GetCredentialResponse(passkeyCredential)
            )

            activity.setResult(Activity.RESULT_OK, result)
            activity.finish()
        } catch (e: Exception) {
            failGetPasskey(activity, e.message ?: "Unable to get passkey")
        }
    }

    fun failCreatePasskey(activity: Activity, message: String) {
        val result = Intent()
        PendingIntentHandler.setCreateCredentialException(
            result,
            CreateCredentialUnknownException(message)
        )
        finishWithResult(activity, result)
    }

    fun failGetPasskey(activity: Activity, message: String) {
        val result = Intent()
        PendingIntentHandler.setGetCredentialException(
            result,
            GetCredentialUnknownException(message)
        )
        finishWithResult(activity, result)
    }

    private fun addClientExtensionResults(
        credentialJson: String,
        clientExtensionResultsJson: String
    ): String {
        val credential = JSONObject(credentialJson)
        val clientExtensionResults = JSONObject(clientExtensionResultsJson)
        credential.put("clientExtensionResults", clientExtensionResults)
        return credential.toString()
    }

    private fun finishWithResult(activity: Activity, result: Intent) {
        activity.setResult(Activity.RESULT_OK, result)
        activity.finish()
    }
}
