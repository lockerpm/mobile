package com.cystack.locker.autofill.passkey

import android.annotation.SuppressLint
import android.util.Log
import androidx.credentials.webauthn.AuthenticatorResponse
import androidx.credentials.webauthn.PublicKeyCredentialRequestOptions

import java.security.MessageDigest
import org.json.JSONObject
import java.security.PrivateKey
import java.security.Signature

@SuppressLint("RestrictedApi")
class AuthenticatorAssertionResponse(
    private val requestOptions: PublicKeyCredentialRequestOptions,
    private val credentialId: ByteArray,
    private var userHandle: ByteArray,
    private val privateKey: PrivateKey,
    private val signatureCounter: Int,
    private val origin: String,
    private val packageName: String? = null,
    private val clientDataHash: ByteArray? = null,
) : AuthenticatorResponse {
    override var clientJson = JSONObject()
    var authenticatorData: ByteArray
    var signature: ByteArray = byteArrayOf()

    init {
        clientJson.put("type", "webauthn.get")
        clientJson.put("challenge", PasskeyUtils.b64Encode(requestOptions.challenge))
        clientJson.put("origin", origin)
        if (packageName != null) {
            clientJson.put("androidPackageName", packageName)
        }

        authenticatorData = defaultAuthenticatorData()

        val dataToSign = dataToSign()
        val sig = Signature.getInstance("SHA256withECDSA")
        sig.initSign(privateKey)
        sig.update(dataToSign)

        signature = sig.sign()
    }

    fun defaultAuthenticatorData(): ByteArray {
        val rpHash = MessageDigest.getInstance("SHA-256").digest(requestOptions.rpId.toByteArray())
        // Flags: UP (0x01)  UV (0x04) BE (0x08) or BS (0x10)
        // UP = User Present, UV = User Verified
        var flags = byteArrayOf((0x01 or 0x04 or 0x08 or 0x10).toByte())
        // Signature counter: 4 bytes, big-endian
        val signCount = byteArrayOf(
            (signatureCounter shr 24).toByte(),
            (signatureCounter shr 16).toByte(),
            (signatureCounter shr 8).toByte(),
            signatureCounter.toByte()
        )
        val ret = rpHash + flags + signCount
        return ret
    }

    fun dataToSign(): ByteArray {
        val md = MessageDigest.getInstance("SHA-256")
        var hash: ByteArray
        if (clientDataHash != null) {
            hash = clientDataHash
        } else {
            hash = md.digest(clientJson.toString().toByteArray())
        }

        return authenticatorData + hash
    }

    override fun json(): JSONObject {
        val clientData = clientJson.toString().toByteArray()
        val response = JSONObject()
        if (clientDataHash == null) {
            response.put("clientDataJSON", PasskeyUtils.b64Encode(clientData))
        }

        response.put("clientDataJSON", PasskeyUtils.b64Encode(clientData))
        response.put("authenticatorData", PasskeyUtils.b64Encode(authenticatorData))
        response.put("signature", PasskeyUtils.b64Encode(signature))
        response.put("userHandle", PasskeyUtils.b64Encode(userHandle))
        return response
    }
}
