package com.cystack.locker.autofill.passkey

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import androidx.credentials.webauthn.FidoPublicKeyCredential
import androidx.credentials.webauthn.PublicKeyCredentialCreationOptions
import androidx.credentials.webauthn.PublicKeyCredentialRequestOptions
import androidx.credentials.webauthn.AuthenticatorAssertionResponse

import androidx.credentials.GetCredentialResponse
import androidx.credentials.PublicKeyCredential
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.provider.PendingIntentHandler

import android.util.Log
import java.security.Signature

@SuppressLint("RestrictedApi")
class Fid2Service {
    fun createPasskey(
        activity: Activity,
        requestJson: String,
        credentialId: String,
        publicKey: String,
        origin: String,
        packageName: String
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
            val createPublicKeyCredResponse =
                CreatePublicKeyCredentialResponse(credential.json())

            PendingIntentHandler.setCreateCredentialResponse(
                result,
                createPublicKeyCredResponse
            )
            activity.setResult(Activity.RESULT_OK, result)
            activity.finish()
        } catch (e: Exception) {
            Log.e("Fid2Service", "Error creating passkey", e)
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
        clientDataHash: String
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
            val jsonResult = credential.json()

            val passkeyCredential = PublicKeyCredential(jsonResult)

            PendingIntentHandler.setGetCredentialResponse(
                result, GetCredentialResponse(passkeyCredential)
            )

            activity.setResult(Activity.RESULT_OK, result)
            activity.finish()
        } catch (e: Exception) {
            Log.e("Fid2Service", "Error get passkey", e)
        }
    }
}
