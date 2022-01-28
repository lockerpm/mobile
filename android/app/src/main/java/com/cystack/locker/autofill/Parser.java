package com.cystack.locker.autofill;

import android.app.assist.AssistStructure;
import android.os.Build;
import android.text.TextUtils;
import android.util.ArrayMap;
import android.util.Log;
import android.view.View;
import android.view.autofill.AutofillId;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RequiresApi(api = Build.VERSION_CODES.O)
public class Parser {

    static private final String TAG = "Parser";
    final private AssistStructure structure;
    private Result result;

    private String packageName;
    private String website;

    public Parser(@NonNull AssistStructure structure){
        this.structure = structure;
    }

    Result parse() {
        result = new Result();
        int nodes = structure.getWindowNodeCount();
        for (int i = 0; i < nodes; i++) {
            AssistStructure.ViewNode node = structure.getWindowNodeAt(i).getRootViewNode();
            if (i == 0)
            {
                packageName = getTitlePackageId(structure.getWindowNodeAt(i));
            }
            addAutofillableFields(result.fillable, node);

        }

        if (website != null){
            result.domain = website;
        } else {
            result.domain = packageName;
        }
        return result;
    }

    private void lookingWebsite(@NonNull AssistStructure.ViewNode node){
        String webDomain = node.getWebDomain();
        if (webDomain != null) {
            website = webDomain ;
        }
    }
    private void addAutofillableFields(@NonNull Map<String, AutofillId> fields,
                                       @NonNull AssistStructure.ViewNode node) {
        String hint = getHint(node);
        if (hint != null) {
            AutofillId id = node.getAutofillId();
            if (!fields.containsKey(hint)) {
                fields.put(hint, id);
            } else {
                Log.v(TAG, "Ignoring hint '" + hint + "' on " + id
                        + " because it was already set");
            }
        }

        // Finally look for domain names
        lookingWebsite(node);

        int childrenSize = node.getChildCount();
        for (int i = 0; i < childrenSize; i++) {
            addAutofillableFields(fields, node.getChildAt(i));
        }
    }


    @Nullable
    protected String getHint(@NonNull AssistStructure.ViewNode node) {

        // First try the explicit autofill hints...
        String[] hints = node.getAutofillHints();
        if (hints != null) {
            // We're simple, we only care about the first hint
            return hints[0].toLowerCase();
        }

        // Then try some rudimentary heuristics based on other node properties
        String viewHint = node.getHint();
        String hint = inferHint(node, viewHint);
        if (hint != null) {
            Log.d(TAG, "Found hint using view hint(" + viewHint + "): " + hint);
            return hint;
        } else if (!TextUtils.isEmpty(viewHint)) {
            Log.v(TAG, "No hint using view hint: " + viewHint);
        }

        String resourceId = node.getIdEntry();
        hint = inferHint(node, resourceId);
        if (hint != null) {
            Log.d(TAG, "Found hint using resourceId(" + resourceId + "): " + hint);
            return hint;
        } else if (!TextUtils.isEmpty(resourceId)) {
            Log.v(TAG, "No hint using resourceId: " + resourceId);
        }

        CharSequence text = node.getText();
        CharSequence className = node.getClassName();
        if (text != null && className != null && className.toString().contains("EditText")) {
            hint = inferHint(node, text.toString());
            if (hint != null) {
                // NODE: text should not be logged, as it could contain PII
                Log.d(TAG, "Found hint using text(" + text + "): " + hint);
                return hint;
            }
        } else if (!TextUtils.isEmpty(text)) {
            // NODE: text should not be logged, as it could contain PII
            Log.v(TAG, "No hint using text: " + text + " and class " + className);
        }
        return null;
    }



    @Nullable
    protected String inferHint(AssistStructure.ViewNode node, @Nullable String actualHint) {
        if (actualHint == null) return null;

        String hint = actualHint.toLowerCase();
        if (hint.contains("label") || hint.contains("container")) {
            Log.v(TAG, "Ignoring 'label/container' hint: " + hint);
            return null;
        }
        if (hint.contains("password")) return View.AUTOFILL_HINT_PASSWORD;
        if (hint.contains("username")
                || (hint.contains("login") && hint.contains("id")))
            return View.AUTOFILL_HINT_USERNAME;
        if (hint.contains("email")) return View.AUTOFILL_HINT_EMAIL_ADDRESS;
        if (hint.contains("name")) return View.AUTOFILL_HINT_NAME;
        if (hint.contains("phone")) return View.AUTOFILL_HINT_PHONE;

//         if (node.isEnabled() && node.getAutofillType() != View.AUTOFILL_TYPE_NONE) {
//             return actualHint;
//         }

        return null;
    }

    private String getTitlePackageId(AssistStructure.WindowNode node)
    {
        if (node != null && !Utils.isNullOrWhiteSpace((String) node.getTitle()))
        {
            int slashPosition = ((String) node.getTitle()).indexOf('/');
            if (slashPosition > -1)
            {
                String packageId = ((String) node.getTitle()).substring(0, slashPosition);
                if (packageId.contains("."))
                {
                    return packageId;
                }
            }
        }
        return "";
    }

    static class Result {
        String domain;
        final ArrayMap<String, AutofillId> fillable;
        private Result() {
            fillable = new ArrayMap<>();
        }

        public String getDomain() {return domain; }
        public ArrayMap<String, AutofillId> getFillable() {
            return fillable;
        }
    }
}
