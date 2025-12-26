package com.cystack.locker.autofill.passkey

import android.annotation.SuppressLint
import androidx.credentials.webauthn.AuthenticatorResponse
import androidx.credentials.webauthn.Cbor
import androidx.credentials.webauthn.PublicKeyCredentialCreationOptions

import org.json.JSONArray
import org.json.JSONObject
import java.security.MessageDigest

import kotlinx.serialization.ExperimentalSerializationApi
import java.io.ByteArrayOutputStream
import java.security.PublicKey
import java.security.interfaces.ECPublicKey


@SuppressLint("RestrictedApi")
class AuthenticatorAttestationResponse(
    private val requestOptions: PublicKeyCredentialCreationOptions,
    private val credentialId: ByteArray,
    private val publicKey: PublicKey,
    private val origin: String,
    private val packageName: String? = null,
) : AuthenticatorResponse {
    override var clientJson = JSONObject()
    var attestationObject: ByteArray
    val credentialPublicKey: ByteArray // COSE (for authData)
    val derPublicKey: ByteArray        // DER (for JSON publicKey)

    init {
        clientJson.put("type", "webauthn.create")
        clientJson.put("challenge", PasskeyUtils.b64Encode(requestOptions.challenge))
        clientJson.put("origin", origin)
        if (packageName != null) {
            clientJson.put("androidPackageName", packageName)
        }
        credentialPublicKey = getPublicKeyCBOR(publicKey)
        derPublicKey = publicKey.encoded

        attestationObject = defaultAttestationObject()
    }

    private fun authData(): ByteArray {
        val md = MessageDigest.getInstance("SHA-256")
        val rpHash = md.digest(requestOptions.rp.id.toByteArray())
        val flags: Int = 0x01 or 0x40 or 0x04
        val aaguid = ByteArray(16) { 0 }
        val credIdLen = byteArrayOf((credentialId.size shr 8).toByte(), credentialId.size.toByte())

        val ret =
            rpHash +
            byteArrayOf(flags.toByte()) +
            byteArrayOf(0, 0, 0, 0) +
            aaguid +
            credIdLen +
            credentialId +
            credentialPublicKey

        return ret
    }

    @OptIn(ExperimentalSerializationApi::class)
    internal fun defaultAttestationObject(): ByteArray {
        val ao = mutableMapOf<String, Any>()
        ao.put("fmt", "none")
        ao.put("attStmt", emptyMap<Any, Any>())
        ao.put("authData", authData())
        return Cbor().encode(ao)
    }

    override fun json(): JSONObject {
        // See AuthenticatorAttestationResponseJSON at
        // https://w3c.github.io/webauthn/#ref-for-dom-publickeycredential-tojson

        val clientData = clientJson.toString().toByteArray()
        val response = JSONObject()

        response.put("clientDataJSON", PasskeyUtils.b64Encode(clientData))
        response.put("attestationObject", PasskeyUtils.b64Encode(attestationObject))
        response.put("transports", JSONArray(listOf("internal", "hybrid")))


        // Fix for "MojoClassFromJSON ... field missing or invalid: ...
        response.put("publicKeyAlgorithm", -7)
        response.put("authenticatorData", PasskeyUtils.b64Encode(authData()))
        response.put("publicKey", PasskeyUtils.b64Encode(derPublicKey))

        return response
    }

    private fun getPublicKeyCBOR(publicKey: PublicKey): ByteArray {
        val ecPublicKey = publicKey as ECPublicKey
        val w = ecPublicKey.w

        val xRaw = w.affineX.toByteArray()
        val yRaw = w.affineY.toByteArray()

        val x = when {
            xRaw.size > 32 && xRaw[0] == 0.toByte() -> xRaw.copyOfRange(1, xRaw.size)
            xRaw.size < 32 -> ByteArray(32 - xRaw.size) + xRaw
            else -> xRaw
        }

        val y = when {
            yRaw.size > 32 && yRaw[0] == 0.toByte() -> yRaw.copyOfRange(1, yRaw.size)
            yRaw.size < 32 -> ByteArray(32 - yRaw.size) + yRaw
            else -> yRaw
        }

        // Build COSE_Key CBOR manually
        val baos = ByteArrayOutputStream()
        // Map with 5 key/value pairs
        baos.write(0xA5) // map(5)

        // 1. kty: 2
        baos.write(0x01) // key 1
        baos.write(0x02) // value 2

        // 2. alg: -7 (ES256)
        baos.write(0x03) // key 3
        baos.write(0x26) // value -7 (CBOR negative integer encoding for -7 is 0x20 + (7 - 1) = 0x26)

        // 3. crv: 1 (P-256)
        baos.write(0x20) // key -1
        baos.write(0x01) // value 1

        // 4. x coordinate
        baos.write(0x21) // key -2
        baos.write(0x58) // byte string, length follows
        baos.write(0x20) // length 32
        baos.write(x)

        // 5. y coordinate
        baos.write(0x22) // key -3
        baos.write(0x58) // byte string, length follows
        baos.write(0x20) // length 32
        baos.write(y)

        return baos.toByteArray()
    }
}
