package com.cystack.locker.autofill

import android.content.Context
import android.content.Intent
import android.util.Base64
import java.io.File
import java.security.MessageDigest
import java.security.SecureRandom

/**
 * MainActivity must stay exported (launcher + deep links), so any installed app can start it
 * with arbitrary extras. Autofill / passkey entry points are only legitimate when the intent was
 * built by Locker itself (autofill service, credential provider service), so those intents carry
 * a random secret that only this app can read. Intents without a matching token are treated as a
 * plain app launch.
 *
 * The secret is persisted in no-backup app-private storage so PendingIntents handed to the system
 * keep working after the process is killed and restarted.
 */
object InternalLaunchToken {
    const val EXTRA_TOKEN = "com.cystack.locker.extra.INTERNAL_LAUNCH_TOKEN"

    private const val FILE_NAME = "internal_launch_token"
    private const val TOKEN_BYTES = 32

    @Volatile
    private var cached: String? = null

    @JvmStatic
    fun attach(context: Context, intent: Intent): Intent {
        intent.putExtra(EXTRA_TOKEN, get(context))
        return intent
    }

    @JvmStatic
    fun isValid(context: Context, intent: Intent?): Boolean {
        val provided = try {
            intent?.getStringExtra(EXTRA_TOKEN)
        } catch (e: RuntimeException) {
            // Malformed extras from a hostile caller (e.g. BadParcelableException)
            null
        } ?: return false

        return MessageDigest.isEqual(
            provided.toByteArray(Charsets.UTF_8),
            get(context).toByteArray(Charsets.UTF_8)
        )
    }

    private fun get(context: Context): String {
        cached?.let { return it }
        synchronized(this) {
            cached?.let { return it }
            val file = File(context.applicationContext.noBackupFilesDir, FILE_NAME)
            val existing = if (file.exists()) file.readText().trim() else ""
            val token = existing.ifEmpty {
                val bytes = ByteArray(TOKEN_BYTES).also { SecureRandom().nextBytes(it) }
                Base64.encodeToString(bytes, Base64.NO_WRAP or Base64.NO_PADDING or Base64.URL_SAFE)
                    .also { file.writeText(it) }
            }
            cached = token
            return token
        }
    }
}
