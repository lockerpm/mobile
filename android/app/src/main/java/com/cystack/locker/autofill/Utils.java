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
import android.service.autofill.SaveInfo;
import android.service.autofill.InlinePresentation;
import android.util.Log;
import android.view.autofill.AutofillManager;
import android.view.autofill.AutofillValue;
import android.view.autofill.AutofillId;
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

import com.tencent.mmkv.MMKV;
import com.cystack.locker.R;
import com.cystack.locker.RNAutofillServiceAndroid;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@RequiresApi(api = Build.VERSION_CODES.O)
public class Utils {
    private static MMKV kv;
    // The URLs are blacklisted from autofilling
    public static HashSet<String> BlacklistedUris = new HashSet<String>(
            Arrays.asList("com.android.settings",
                    "com.android.settings.intelligence",
                    "com.cystack.locker",
                    "com.cystack.locker.staging"
            )
    );
    public static HashSet<String> CompatBrowsers = new HashSet<String>(
            Arrays.asList("alook.browser",
                "alook.browser.google",
                "com.amazon.cloud9",
                "com.android.browser",
                "com.android.chrome",
                "com.android.htmlviewer",
                "com.avast.android.secure.browser",
                "com.avg.android.secure.browser",
                "com.brave.browser",
                "com.brave.browser_beta",
                "com.brave.browser_default",
                "com.brave.browser_dev",
                "com.brave.browser_nightly",
                "com.chrome.beta",
                "com.chrome.canary",
                "com.chrome.dev",
                "com.cookiegames.smartcookie",
                "com.cookiejarapps.android.smartcookieweb",
                "com.ecosia.android",
                "com.google.android.apps.chrome",
                "com.google.android.apps.chrome_dev",
                "com.google.android.captiveportallogin",
                "com.jamal2367.styx",
                "com.kiwibrowser.browser",
                "com.kiwibrowser.browser.dev",
                "com.microsoft.emmx",
                "com.microsoft.emmx.beta",
                "com.microsoft.emmx.canary",
                "com.microsoft.emmx.dev",
                "com.mmbox.browser",
                "com.mmbox.xbrowser",
                "com.mycompany.app.soulbrowser",
                "com.naver.whale",
                "com.opera.browser",
                "com.opera.browser.beta",
                "com.opera.mini.native",
                "com.opera.mini.native.beta",
                "com.opera.touch",
                "com.qflair.browserq",
                "com.qwant.liberty",
                "com.sec.android.app.sbrowser",
                "com.sec.android.app.sbrowser.beta",
                "com.stoutner.privacybrowser.free",
                "com.stoutner.privacybrowser.standard",
                "com.vivaldi.browser",
                "com.vivaldi.browser.snapshot",
                "com.vivaldi.browser.sopranos",
                "com.yandex.browser",
                "com.z28j.feel",
                "idm.internet.download.manager",
                "idm.internet.download.manager.adm.lite",
                "idm.internet.download.manager.plus",
                "io.github.forkmaintainers.iceraven",
                "mark.via",
                "mark.via.gp",
                "net.slions.fulguris.full.download",
                "net.slions.fulguris.full.download.debug",
                "net.slions.fulguris.full.playstore",
                "net.slions.fulguris.full.playstore.debug",
                "org.adblockplus.browser",
                "org.adblockplus.browser.beta",
                "org.bromite.bromite",
                "org.bromite.chromium",
                "org.chromium.chrome",
                "org.codeaurora.swe.browser",
                "org.gnu.icecat",
                "org.mozilla.fenix",
                "org.mozilla.fenix.nightly",
                "org.mozilla.fennec_aurora",
                "org.mozilla.fennec_fdroid",
                "org.mozilla.firefox",
                "org.mozilla.firefox_beta",
                "org.mozilla.reference.browser",
                "org.mozilla.rocket",
                "org.torproject.torbrowser",
                "org.torproject.torbrowser_alpha",
                "org.ungoogled.chromium.extensions.stable",
                "org.ungoogled.chromium.stable",
                "us.spotco.fennec_dos"
            )
    );

    public static boolean IsLockerAutofillServicesEnabled(Context context) {
        AutofillManager af = context.getSystemService(AutofillManager.class);
        return af.hasEnabledAutofillServices();
    }

    @NonNull
    public static AssistStructure getLatestAssistStructure(@NonNull FillRequest request) {
        List<FillContext> fillContexts = request.getFillContexts();
        return fillContexts.get(fillContexts.size() - 1).getStructure();
    }

    public static boolean isNullOrWhiteSpace(String value) {
        return value == null || value.trim().isEmpty();
    }

    public static void InitCredentialsStore(Context context, String id,  String encKey) {
        MMKV.initialize(context);
        kv = MMKV.mmkvWithID(id, MMKV.MULTI_PROCESS_MODE, encKey);
    }

    public static void SetCredential(String key, AutofillItem value){
        if (kv == null) return;
        kv.encode(key, value);
    }

    @Nullable
    public static AutofillItem GetCredential(String key){
       if (kv == null) return null;
       return kv.decodeParcelable(key, AutofillItem.class);
    }

    public static void RemoveCredential(String key){
        if (kv == null) return;
        kv.remove(key);
    }

    public static void RemoveAllCredential(){
        if (kv == null) return;
        kv.clearMemoryCache();
        kv.clearAll();
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

    public static  FillResponse.Builder BuildFillResponse(ArrayList<Field> fields, @NonNull FillRequest request, String domain, Context context){
        
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

     
        InlinePresentationSpec itemInlinePresentationSpec = null;
        InlinePresentationSpec lockerInlinePresentationSpec = null;
        if (inlinePresentationSpecs != null) {
            if (inlinePresentationSpecsCount > 2) {
                itemInlinePresentationSpec = inlinePresentationSpecs.get(0);
            }
            lockerInlinePresentationSpec = inlinePresentationSpecs.get(inlinePresentationSpecsCount - 1);
        }

        AutofillItem storedItem = GetCredential(domain);
        if (storedItem != null) {
            response.addDataset(BuildDataSetWithAuthen(fields, storedItem, itemInlinePresentationSpec, domain, context));
        }

        response.addDataset(BuildDataSetLocker(fields, lockerInlinePresentationSpec, domain, context));

        return response;
    }

    public static Dataset BuildDataSetLocker(ArrayList<Field> fields, InlinePresentationSpec inlinePresentationSpec, String domain, Context context){
        RemoteViews presentation = new RemoteViews(context.getPackageName(), R.layout.remote_locker_app);

        PendingIntent authentication = RNAutofillServiceAndroid.newIntentSenderForResponse(context, fields, domain);

        return BuildlockedDataset(fields, null, presentation, authentication, inlinePresentationSpec, context);
    }

    public static Dataset BuildDataSetWithAuthen(ArrayList<Field> fields, AutofillItem data, InlinePresentationSpec inlinePresentationSpec, String domain, Context context){
        RemoteViews presentation = new RemoteViews(context.getPackageName(), android.R.layout.simple_list_item_1);
        presentation.setTextViewText(android.R.id.text1, data.getName());

        PendingIntent authentication = RNAutofillServiceAndroid.newIntentSenderForFillResponse(context, fields, domain ,data.getId());

        return BuildlockedDataset(fields, data, presentation, authentication, inlinePresentationSpec, context);
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
            InlinePresentation inlinePresentation = buildInlinePresentation(inlinePresentationSpec, authentication, data, context);
            if (inlinePresentation != null) {
                dataset.setInlinePresentation(inlinePresentation);
            }
        }

        return dataset.build();
    }

    private static InlinePresentation buildInlinePresentation( InlinePresentationSpec inlinePresentationSpec, PendingIntent pendingIntent,  AutofillItem data, Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            return null;
        }
        if (inlinePresentationSpec == null){
            return null;
        }
        String title = null;
        if (data != null) {
            title = data.getName();
        }
        Slice slice = CreateInlinePresentationSlice(inlinePresentationSpec, pendingIntent, title, context);
        return new InlinePresentation(slice, inlinePresentationSpec, false);
    }
    @SuppressLint("RestrictedApi")
    private static Slice CreateInlinePresentationSlice(
            InlinePresentationSpec inlinePresentationSpec,
            PendingIntent pendingIntent,
            @Nullable String title, 
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

        if (title != null) {
            contentBuilder.setTitle(title);
        } else {
            contentBuilder.setTitle(context.getResources().getString(R.string.mp_title));
            Icon icon =  Icon.createWithResource(context, R.drawable.ic_logo);
            icon.setTintBlendMode(BlendMode.DST);
    
            contentBuilder.setStartIcon(icon);
        }
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

    public static void AddSaveInfo(@NonNull FillRequest fillRequest, FillResponse.Builder response, List<Field> fields, String packageName) {
        // Docs state that password fields cannot be reliably saved in Compat mode since they will show as
        // masked values.
        boolean compatRequest = false;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q){
            // Attempt to automatically establish compat request mode on Android 10+
            compatRequest = (fillRequest.getFlags() | FillRequest.FLAG_COMPATIBILITY_MODE_REQUEST) == fillRequest.getFlags();
        }

        if (compatRequest && CompatBrowsers.contains(packageName)) {
            return;
        }
        AutofillId[] autofillIds = new AutofillId[fields.size()];
        for (int i = 0 ; i < fields.size(); i++ ){
            autofillIds[i] = fields.get(i).autofillId;
        }
        SaveInfo.Builder saveBuilder = new SaveInfo.Builder(SaveInfo.SAVE_DATA_TYPE_USERNAME | SaveInfo.SAVE_DATA_TYPE_PASSWORD,
                autofillIds);
        response.setSaveInfo(saveBuilder.build());
    }
}
