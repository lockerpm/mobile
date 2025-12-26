package com.cystack.locker.autofill.passkey

import android.util.Base64
import android.util.Log
import java.security.KeyFactory
import java.security.PrivateKey
import java.security.PublicKey
import java.security.spec.PKCS8EncodedKeySpec
import java.security.spec.X509EncodedKeySpec

internal class PasskeyUtils {
    companion object {
        fun b64Decode(str: String): ByteArray {
            return Base64.decode(str, Base64.NO_PADDING or Base64.NO_WRAP or Base64.URL_SAFE)
        }

        fun b64Encode(data: ByteArray): String {
            return Base64.encodeToString(
                data,
                Base64.NO_PADDING or Base64.NO_WRAP or Base64.URL_SAFE
            )
        }

        /**
         * Import public key from SPKI format.
         * @param base64UrlKey The public key in SPKI format.
         */
        fun importPublicKey(base64UrlKey: String): PublicKey {
            val keyBytes = b64Decode(base64UrlKey)
            try {
                val keyFactory = KeyFactory.getInstance("EC")
                val keySpec = X509EncodedKeySpec(keyBytes)
                return keyFactory.generatePublic(keySpec)
            } catch (e: Exception) {
                val hexString = keyBytes.joinToString("") { "%02x".format(it) }
                Log.e("Fid2Service", "Failed to parse SPKI Key. Hex: $hexString", e)
                throw IllegalArgumentException("Invalid SPKI key format.", e)
            }
        }

        /**
         * Import private key from PKCS8 format.
         * @param base64UrlKey The private key in PKCS8 format.
         */
        fun importPrivateKey(base64UrlKey: String): PrivateKey {
            val keyBytes = b64Decode(base64UrlKey)
            try {
                val keyFactory = KeyFactory.getInstance("EC")
                val keySpec = PKCS8EncodedKeySpec(keyBytes)
                return keyFactory.generatePrivate(keySpec)
            } catch (e: Exception) {
                val hexString = keyBytes.joinToString("") { "%02x".format(it) }
                Log.e("Utils", "Failed to parse PKCS8 Private Key", e)
                throw IllegalArgumentException("Invalid PKCS8 private key format.", e)
            }
        }
    }
}
