package com.cystack.locker;

import android.util.Base64;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

import java.security.SecureRandom;
import java.security.Key;
import java.util.Arrays;

import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class RNFileEncryptor extends ReactContextBaseJavaModule {

    private static final String AES_MODE = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 16; // in bits

    public RNFileEncryptor(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "FileEncryptor";
    }

    @ReactMethod
    public void encryptFileByChunk(String inputPath,
                                   String outputPath,
                                   String keyBase64,
                                   int chunkSize,
                                   Promise promise) {
        try {
            File inputFile = new File(inputPath);
            File outputFile = new File(outputPath);

            if (!inputFile.exists()) {
                promise.reject("file_error", "Input file does not exist");
                return;
            }

            // Decode key
            byte[] key = Base64.decode(keyBase64, Base64.NO_WRAP);
            SecretKeySpec keySpec = new SecretKeySpec(key, "AES");

            // Generate random IV
            byte[] iv = new byte[IV_LENGTH];
            SecureRandom random = new SecureRandom();
            random.nextBytes(iv);

            // Set up cipher
            Cipher cipher = Cipher.getInstance(AES_MODE);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(TAG_LENGTH * 8, iv);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);

            // Read file & encrypt in chunks
            FileInputStream fis = new FileInputStream(inputFile);
            ByteArrayOutputStream encryptedBuffer = new ByteArrayOutputStream();

            byte[] inputChunk = new byte[chunkSize];
            int read;
            while ((read = fis.read(inputChunk)) != -1) {
                byte[] encryptedChunk = cipher.update(inputChunk, 0, read);
                if (encryptedChunk != null) {
                    encryptedBuffer.write(encryptedChunk);
                }
            }

            byte[] finalBytes = cipher.doFinal();
            if (finalBytes != null) {
                encryptedBuffer.write(finalBytes);
            }

            // Get auth tag
            byte[] tag = Arrays.copyOfRange(encryptedBuffer.toByteArray(),
                    encryptedBuffer.size() - TAG_LENGTH,
                    encryptedBuffer.size());

            // Write output file: IV + AuthTag + Ciphertext
            FileOutputStream fos = new FileOutputStream(outputFile);
            fos.write(iv);                             // [0...11] IV
            fos.write(tag);                            // [12...27] AuthTag
            fos.write(encryptedBuffer.toByteArray(), 0,
                    encryptedBuffer.size() - TAG_LENGTH); // [28...] Ciphertext
            fos.flush();
            fos.close();
            fis.close();

            promise.resolve(true);
        } catch (Exception e) {
            e.printStackTrace();
            promise.reject("encrypt_error", e.getMessage());
        }
    }

    @ReactMethod
    public void decryptFileByChunk(String inputPath,
                                   String outputPath,
                                   String keyBase64,
                                   int chunkSize,
                                   Promise promise) {
        try {
            File inputFile = new File(inputPath);
            File outputFile = new File(outputPath);

            if (!inputFile.exists()) {
                promise.reject("file_error", "Input file does not exist");
                return;
            }

            FileInputStream fis = new FileInputStream(inputFile);
            FileOutputStream fos = new FileOutputStream(outputFile);

            long fileSize = inputFile.length();
            if (fileSize < IV_LENGTH + TAG_LENGTH) {
                promise.reject("file_error", "File too small to contain IV and AuthTag");
                return;
            }

            // Read IV
            byte[] iv = new byte[IV_LENGTH];
            if (fis.read(iv) != IV_LENGTH) {
                promise.reject("file_error", "Failed to read IV");
                return;
            }

            // Read AuthTag
            byte[] authTag = new byte[TAG_LENGTH];
            if (fis.read(authTag) != TAG_LENGTH) {
                promise.reject("file_error", "Failed to read AuthTag");
                return;
            }

            // Prepare Cipher
            byte[] key = Base64.decode(keyBase64, Base64.NO_WRAP);
            SecretKeySpec keySpec = new SecretKeySpec(key, "AES");
            GCMParameterSpec spec = new GCMParameterSpec(TAG_LENGTH * 8, iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, keySpec, spec);

            // Read ciphertext and decrypt in chunks
            long ciphertextSize = fileSize - IV_LENGTH - TAG_LENGTH;
            byte[] buffer = new byte[chunkSize];
            long totalRead = 0;

            while (totalRead < ciphertextSize) {
                int toRead = (int) Math.min(chunkSize, ciphertextSize - totalRead);
                int read = fis.read(buffer, 0, toRead);
                if (read == -1) break;

                byte[] decryptedChunk = cipher.update(buffer, 0, read);
                if (decryptedChunk != null) {
                    fos.write(decryptedChunk);
                }

                totalRead += read;
            }

            // Finalize decryption
            byte[] finalBytes = cipher.doFinal(authTag);
            if (finalBytes != null) {
                fos.write(finalBytes);
            }

            fos.flush();
            fis.close();
            fos.close();

            promise.resolve(true);
        } catch (AEADBadTagException e) {
            promise.reject("auth_error", "Authentication failed: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            promise.reject("decrypt_error", "Decryption failed: " + e.getMessage());
        }
    }
}