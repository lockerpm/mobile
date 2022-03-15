package com.cystack.locker.autofill;

import android.app.assist.AssistStructure;
import android.os.Build;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.util.Log;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.Base64;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@RequiresApi(api = Build.VERSION_CODES.O)
public class Utils {
    // The URLs are blacklisted from autofilling
    public static HashSet<String> BlacklistedUris = new HashSet<String>(
            Arrays.asList("com.android.settings",
                    "com.android.settings.intelligence",
                    "com.cystack.locker"
            )
    );
    @NonNull
    public static AssistStructure getLatestAssistStructure(@NonNull FillRequest request) {
        List<FillContext> fillContexts = request.getFillContexts();
        return fillContexts.get(fillContexts.size() - 1).getStructure();
    }

    public static boolean isNullOrWhiteSpace(String value) {
        return value == null || value.trim().isEmpty();
    }

    private static String pbkdf2(String password, String salt, int iterations, int keyLength) throws NoSuchAlgorithmException, InvalidKeySpecException {
        char[] chars = password.toCharArray();

        PBEKeySpec spec = new PBEKeySpec(chars, salt.getBytes(), iterations, keyLength*8);
        SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
        byte[] hash = skf.generateSecret(spec).getEncoded();
        return Base64.getEncoder().encodeToString(hash);
    }

    @Nullable
    public static String makeKeyHash(String masterPassword, String email){
        try {
            String key = pbkdf2(masterPassword, email, 100000, 32);
            String keyHash = pbkdf2(key, masterPassword, 3, 32);
            return keyHash;
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            e.printStackTrace();
        }
        return null;
    }
}
