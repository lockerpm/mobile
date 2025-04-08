package com.cystack.locker;

import android.util.Base64;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

import java.security.SecureRandom;
import java.security.Key;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class RNFileEncryptor extends ReactContextBaseJavaModule {

    private static final String AES_MODE = "AES/GCM/NoPadding";
    private static final int IV_SIZE = 12;
    private static final int TAG_LENGTH = 128; // in bits

    public RNFileEncryptor(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "FileEncryptor";
    }

    @ReactMethod
    public void encryptFileByChunk(String inputPath, String outputPath, String keyBase64, int chunkSize, Promise promise) {
        try {
            byte[] keyBytes = Base64.decode(keyBase64, Base64.NO_WRAP);
            Key key = new SecretKeySpec(keyBytes, "AES");

            byte[] iv = new byte[IV_SIZE];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(AES_MODE);
            GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, key, spec);

            // Streams
            InputStream inStream = new FileInputStream(inputPath);
            OutputStream outStream = new FileOutputStream(outputPath);

            // Write IV first
            outStream.write(iv);

            byte[] buffer = new byte[chunkSize];
            int bytesRead;
            while ((bytesRead = inStream.read(buffer)) != -1) {
                byte[] encrypted = cipher.update(buffer, 0, bytesRead);
                if (encrypted != null) {
                    outStream.write(encrypted);
                }
            }

            byte[] finalBlock = cipher.doFinal();
            if (finalBlock != null) {
                outStream.write(finalBlock);
            }

            // Write auth tag manually if you want to extract it (not required if using combined block)

            inStream.close();
            outStream.close();

            promise.resolve(true);
        } catch (Exception e) {
            e.printStackTrace();
            promise.reject("ENCRYPTION_FAILED", e.getMessage());
        }
    }
}