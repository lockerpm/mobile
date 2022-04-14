package com.cystack.locker.autofill;

import android.annotation.SuppressLint;
import android.app.PendingIntent;
import android.app.assist.AssistStructure;
import android.app.slice.Slice;
import android.content.Context;
import android.content.res.Resources;
import android.graphics.BlendMode;
import android.graphics.drawable.Icon;
import android.os.Build;
import android.os.Bundle;
import android.service.autofill.Dataset;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.service.autofill.FillResponse;
import android.service.autofill.InlinePresentation;
import android.util.Log;
import android.view.autofill.AutofillValue;
import android.view.inputmethod.InlineSuggestionsRequest;
import android.widget.RemoteViews;
import android.widget.inline.InlinePresentationSpec;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.ArrayList;
import java.util.Base64;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.autofill.inline.UiVersions;
import androidx.autofill.inline.v1.InlineSuggestionUi;

import com.cystack.locker.R;

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

    public static  FillResponse BuildFillResponse(ArrayList<Field> fields, PendingIntent authentication, @NonNull FillRequest request, Context context){

        FillResponse.Builder response = new FillResponse.Builder();

        List<InlinePresentationSpec> inlinePresentationSpecs = null;
        int inlinePresentationSpecsCount = 0;
        int inlineMaxSuggestedCount = 0;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            InlineSuggestionsRequest inlineSuggestionsRequest = request.getInlineSuggestionsRequest();
            if (inlineSuggestionsRequest != null) {
                inlinePresentationSpecs = inlineSuggestionsRequest.getInlinePresentationSpecs();
                inlinePresentationSpecsCount = inlinePresentationSpecs.size();
                inlineMaxSuggestedCount = inlineSuggestionsRequest.getMaxSuggestionCount();
            }

            Log.d("Inline-Autofill", "inlinePresentationSpecsCount: " + inlinePresentationSpecsCount);
            Log.d("Inline-Autofill", "inlineMaxSuggestedCount: " + inlineMaxSuggestedCount);
        }

//        for (int i = 0 ; i < mNumberDatasets -1; i++){
//            response.addDataset(buildDataSetWithAuthen(fields, datas.get(i), authentication));
//        }

        InlinePresentationSpec inlinePresentationSpec = null;
        if (inlinePresentationSpecs != null) {
            inlinePresentationSpec = inlinePresentationSpecs.get(inlinePresentationSpecsCount - 1);
        }

        response.addDataset(BuildDataSetLocker(fields, authentication, inlinePresentationSpec, context));

        return response.build();
    }

    public static Dataset BuildDataSetLocker(ArrayList<Field> fields, PendingIntent authentication, InlinePresentationSpec inlinePresentationSpec, Context context){
        RemoteViews presentation = new RemoteViews(context.getPackageName(), R.layout.remote_locker_app);

        Dataset unlockedDataset = BuildlockedDataset(fields, null, presentation, authentication, inlinePresentationSpec, context);
        return unlockedDataset;
    }

    public static Dataset BuildDataSetWithAuthen(ArrayList<Field> fields, AutofillItem data, PendingIntent authentication, InlinePresentationSpec inlinePresentationSpec, Context context){
        RemoteViews presentation = new RemoteViews(context.getPackageName(), android.R.layout.simple_list_item_1);
        presentation.setTextViewText(android.R.id.text1, data.getName());

        Dataset unlockedDataset = BuildlockedDataset(fields, data , presentation, authentication, inlinePresentationSpec, context);

        return unlockedDataset;
    }

    public static Dataset BuildUnlockDataset(@NonNull ArrayList<Field> fields,
                                             AutofillItem data,
                                             RemoteViews presentation){
        Dataset.Builder dataset = newDataset(fields, data, presentation);
        return dataset.build();
    }

    static Dataset BuildlockedDataset(@NonNull ArrayList<Field> fields, AutofillItem data,
                                      RemoteViews presentation,
                                      PendingIntent authentication,
                                      InlinePresentationSpec inlinePresentationSpec,
                                      Context context)  {

        Dataset.Builder dataset = newDataset(fields, data, presentation);
        dataset.setAuthentication(authentication.getIntentSender());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            InlinePresentation inlinePresentation = buildInlinePresentation(inlinePresentationSpec, authentication, context);
            if (inlinePresentation != null) {
                dataset.setInlinePresentation(inlinePresentation);
            }
        }

        return dataset.build();
    }

    private static InlinePresentation buildInlinePresentation( InlinePresentationSpec inlinePresentationSpec, PendingIntent pendingIntent, Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            return null;
        }
        Slice slice = CreateInlinePresentationSlice(inlinePresentationSpec, pendingIntent, context);
        return new InlinePresentation(slice, inlinePresentationSpec, false);
    }
    @SuppressLint("RestrictedApi")
    private static Slice CreateInlinePresentationSlice(
            InlinePresentationSpec inlinePresentationSpec,
            PendingIntent pendingIntent,
            Context context)
    {
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.R) {
            return null;
        }

        Bundle imeStyle = inlinePresentationSpec.getStyle();
        if (!UiVersions.getVersions(imeStyle).contains(UiVersions.INLINE_UI_VERSION_1))
        {
            return null;
        }

        InlineSuggestionUi.Content.Builder contentBuilder = InlineSuggestionUi.newContentBuilder(pendingIntent);

        contentBuilder.setTitle(context.getResources().getString(R.string.mp_title));

        Icon icon =  Icon.createWithResource(context, R.drawable.ic_logo);
        icon.setTintBlendMode(BlendMode.DST);

        contentBuilder.setStartIcon(icon);
        return contentBuilder.build().getSlice();
    }

    private static Dataset.Builder newDataset(@NonNull ArrayList<Field> fields,
                                              AutofillItem data,
                                              RemoteViews presentation){
        Dataset.Builder dataset = new Dataset.Builder();

        for (Field field : fields) {
            if (data != null) {
                if (field.fillType == Field.FILL_TYPE_PASSWORD) {
                    dataset.setValue(field.autofillId, AutofillValue.forText(data.getPassword()), presentation);
                } else if (field.fillType == Field.FILL_TYPE_EMAIL) {
                    dataset.setValue(field.autofillId, AutofillValue.forText(data.getUserName()), presentation);
                } else if (field.fillType == Field.FILL_TYPE_USERNAME) {
                    dataset.setValue(field.autofillId, AutofillValue.forText(data.getUserName()), presentation);
                }

            } else {
                dataset.setValue(field.autofillId,  null, presentation);
            }
        }
        return dataset;
    }
}
