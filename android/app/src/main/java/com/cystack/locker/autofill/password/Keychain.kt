package com.cystack.locker.autofill.password

import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.oblador.keychain.DataStorePrefsStorage
import com.oblador.keychain.SecurityLevel
import com.oblador.keychain.cipherStorage.CipherStorage
import com.oblador.keychain.cipherStorage.CipherStorageKeystoreAesGcm
import com.oblador.keychain.resultHandler.ResultHandlerNonInteractive


class Keychain(reactContext: ReactApplicationContext) {
    private val LOG_TAG = "CystackKeychain"
    private val SERVICE = "W7S57TNBH5.com.cystack.lockerapp.info"

    private val cipherStorage: CipherStorage = CipherStorageKeystoreAesGcm(reactContext, false)
    private val prefsStorage: DataStorePrefsStorage = DataStorePrefsStorage.getInstance(reactContext)

    /** Try to decrypt with provided storage. */
    fun getGenericPassword(): String? {
        try {
            val resultSet = prefsStorage.getEncryptedEntry(SERVICE)
            if (resultSet == null) {
                return null
            }

            val handler = ResultHandlerNonInteractive()
            cipherStorage.decrypt(
                handler,
                SERVICE,
                resultSet.username!!,
                resultSet.password!!,
                SecurityLevel.ANY
            )
            val error = handler.error
            if (error != null) {
                Log.e(LOG_TAG, "Keychain handler error: $error")
                return null
            }
            if (handler.decryptionResult == null) {
                Log.e(LOG_TAG, "No decryption results and no error. Something deeply wrong!")
                return null
            }
            val decryptionResult = handler.decryptionResult!!
            return decryptionResult.password
        } catch (e: Throwable) {
            Log.e(LOG_TAG, "getGenericPassword: " + e.message)
        }
        return null
    }
}
