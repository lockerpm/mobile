package com.cystack.locker.autofill;

import android.app.assist.AssistStructure;
import android.os.Build;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import android.text.InputType;
import android.util.Log;
import android.view.View;
import android.view.autofill.AutofillId;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;


/**
 * Parse AssistStructure and guess username and password fields.
 */
@RequiresApi(api = Build.VERSION_CODES.O)
class StructureParser {
    static private final String TAG = "LockerAutoFillService";
    
    public  boolean isNullOrWhiteSpace(String value) {
        return value == null || value.trim().isEmpty();
    }

    final private AssistStructure structure;
    private Result result;

    StructureParser(AssistStructure structure) {
        this.structure = structure;
    }

    Result parse() {
        result = new Result();
        for (int i=0; i<structure.getWindowNodeCount(); ++i) {
            AssistStructure.WindowNode windowNode = structure.getWindowNodeAt(i);
            if (i == 0)
            {
                result.title.add(getTitlePackageId(windowNode));
            }
            parseViewNode(windowNode.getRootViewNode());
        }
        return result;
    }

    private void parseViewNode(AssistStructure.ViewNode node) {
        String[] hints = node.getAutofillHints();

        if (hints == null) {
            // Could not find native autofill hints.
            // Try to infer any hints from the ID of the field (ie the #id of a webbased text input)
            String inferredHint = inferHint(node, node.getIdEntry());
            if (inferredHint != null) {
                hints = new String[]{inferredHint};
            }
        }

        if (hints != null && hints.length > 0) {
            if (Arrays.stream(hints).anyMatch(View.AUTOFILL_HINT_USERNAME::equals)) {
                result.username.add(node.getAutofillId());
            }
            else if (Arrays.stream(hints).anyMatch(View.AUTOFILL_HINT_EMAIL_ADDRESS::equals)) {
                result.email.add(node.getAutofillId());
            }
            else if (Arrays.stream(hints).anyMatch(View.AUTOFILL_HINT_PASSWORD::equals)) {
                result.password.add(node.getAutofillId());
            }
        } else if (node.getAutofillType() == View.AUTOFILL_TYPE_TEXT) {
            // Attempt to match based on Field Type
            int inputType = node.getInputType();
            switch (inputType) {
                case InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_WEB_EMAIL_ADDRESS:
                    result.email.add(node.getAutofillId());
                    break;
                case InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD:
                case InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD:
                    result.password.add(node.getAutofillId());
                    break;
                default:
                    break;
            }
        }

        // Finally look for domain names
        String webDomain = node.getWebDomain();
        if (webDomain != null) {
            result.webDomain.add(webDomain);
        }

        for (int i=0; i<node.getChildCount(); ++i) {
            parseViewNode(node.getChildAt(i));
        }
    }

    // Attempt to infer the AutoFill type from a string
    private String inferHint(AssistStructure.ViewNode node, @Nullable String actualHint) {
        if (actualHint == null) return null;

        String hint = actualHint.toLowerCase();
        if (hint.contains("label") || hint.contains("container")) {
            return null;
        }

        if (hint.contains("password")) return View.AUTOFILL_HINT_PASSWORD;
        if (hint.contains("username")
                || (hint.contains("login") && hint.contains("id")))
            return View.AUTOFILL_HINT_USERNAME;
        if (hint.contains("email")) return View.AUTOFILL_HINT_EMAIL_ADDRESS;
        if (hint.contains("name")) return View.AUTOFILL_HINT_NAME;
        if (hint.contains("phone")) return View.AUTOFILL_HINT_PHONE;
        return null;
    }

    private String getTitlePackageId(AssistStructure.WindowNode node)
    {
        if (node != null && !isNullOrWhiteSpace((String) node.getTitle()))
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
        final List<String> title;
        final List<String> webDomain;
        final List<AutofillId> username;
        final List<AutofillId> email;
        final List<AutofillId> password;

        private Result() {
            title = new ArrayList<>();
            webDomain = new ArrayList<>();
            username = new ArrayList<>();
            email = new ArrayList<>();
            password = new ArrayList<>();
        }

        public AutofillId[] getAllAutoFillIds() {
            ArrayList<AutofillId> autofillIds = new ArrayList<>();
            autofillIds.addAll(username);
            autofillIds.addAll(email);
            autofillIds.addAll(password);

            AutofillId[] finalAutoFillIds = new AutofillId[autofillIds.size()];
            return autofillIds.toArray(finalAutoFillIds);
        }
    }
}