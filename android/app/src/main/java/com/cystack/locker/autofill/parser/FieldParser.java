package com.cystack.locker.autofill.parser;

import android.text.InputType;
import android.util.Log;
import android.view.View;

import androidx.annotation.Nullable;

import com.cystack.locker.autofill.Field;
import com.cystack.locker.autofill.Utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

public class FieldParser {
    private static final String TAG = "Field_Parser";
    public List<Field> fields  = new ArrayList<>();
    private final List<Field> fillable = new ArrayList<>();
    private final List<String> autofillIds = new ArrayList<>();
    public HashSet<String> ignoreSearchTerms = new HashSet<String>(
            Arrays.asList("search",
                    "find",
                    "container",
                    "label",
                    "recipient",
                    "edit",
                    "tìm kiếm"
            )
    );
    private final HashSet<String> passwordTerms = new HashSet<String>(
            Arrays.asList("password",
                    "pswd",
                    "pwd",
                    "mật Khẩu",
                    "pass",
                    "Mật ",
                    "pass_word",
                    "Mật khẩu"
            )
    );

    public HashSet<String> usernameTerms = new HashSet<String>(
            Arrays.asList("username",
                    "login",
                    "id",
                    "tên đăng nhập",
                    "UserName",
                    "user_name"
            )
    );
    public HashSet<String> emailTerms = new HashSet<String>(
            Arrays.asList("email",
                    "address",
                    "email_address"
            )
    );


    @Nullable
    public List<Field> getFillableItem(){
        if (fillable.isEmpty()) {
            Log.d(TAG, "Not found any fill-able field");
            return null;
        }
        return fillable;
    }

    
    public void addField(Field field){
        fields.add(field);
    }
    public void parser() {
        List<Field> unknowType = new ArrayList<>();
        for (Field field: fields){
            // parse by hint
            String hint = parseHint(field);
            if (!Utils.isNullOrWhiteSpace(hint)){
                switch (hint) {
                    case View.AUTOFILL_HINT_PASSWORD:
                        field.fillType = Field.FILL_TYPE_PASSWORD;
                        break;
                    case View.AUTOFILL_HINT_EMAIL_ADDRESS:
                    case View.AUTOFILL_HINT_USERNAME:
                        field.fillType = Field.FILL_TYPE_USERNAME;
                        break;
                }
                fillable.add(field);
                autofillIds.add(field.autofillId.toString());
                continue;
            }
            // parse inputType
            boolean isPasswordField = parsePasswordInputType(field);
            if (isPasswordField) {
                if (!autofillIds.contains(field.autofillId.toString())) {
                    field.fillType = Field.FILL_TYPE_PASSWORD;
                    fillable.add(field);
                }
                continue;
            }

            boolean isUsernameField = parseEmailOrUsernameInputType(field);
            if (isUsernameField) {
                if (!autofillIds.contains(field.autofillId.toString())) {
                    field.fillType = Field.FILL_TYPE_USERNAME;
                    fillable.add(field);
                }
                continue;
            }
            field.fillType = Field.FILL_TYPE_UNKNOW;
            unknowType.add(field);
        }

        Log.d(TAG, "fillable " + fillable.size());
        Log.d(TAG, "unknownType fields size: " + unknowType.size());
        // If there is only 1 fillable item in the list and the type is Fill.FILL_TYPE PASSWORD
        // and if there is only 1 item in the list the type is unknown
        // Then make item default type Field.FILL_TYPE_USERNAME;
        if (fillable.size() == 1 && fillable.get(0).fillType == Field.FILL_TYPE_PASSWORD) {
            if (unknowType.size() == 1) {
                Field field = unknowType.get(0);
                field.fillType = Field.FILL_TYPE_USERNAME;
                fillable.add(field);
            }
        }


        // If the fillable have no item and unknownType is not empty
        // Then make first item default type Field.FILL_TYPE_USERNAME;
        // Then make second item default type Field.FILL_TYPE_PASSWORD;
        if (fillable.isEmpty()) {
            if (unknowType.size() == 1) {
                Field field = unknowType.get(0);
                field.fillType = Field.FILL_TYPE_USERNAME;
                fillable.add(field);
            }
            if (unknowType.size() == 2) {
                Field field1 = unknowType.get(0);
                field1.fillType = Field.FILL_TYPE_USERNAME;
                fillable.add(field1);

                Field field2 = unknowType.get(1);
                field2.fillType = Field.FILL_TYPE_PASSWORD;
                fillable.add(field2);
            }
        }
    }


    private boolean parsePasswordInputType(Field field) {
        int type = field.inputType;

        int inputClass = type & InputType.TYPE_MASK_CLASS;
        int variation = type & InputType.TYPE_MASK_VARIATION;

        boolean inputTypePassword = false;

        if (inputClass == InputType.TYPE_CLASS_TEXT) {
            switch (variation) {
                case InputType.TYPE_TEXT_VARIATION_PASSWORD:
                case InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD:
                case InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD:
                    inputTypePassword = true;
                    break;
            }
        } else if (inputClass == InputType.TYPE_CLASS_NUMBER &&
                variation == InputType.TYPE_NUMBER_VARIATION_PASSWORD) {
            inputTypePassword = true;
        }

        // Optional: ignore multi-line input
        if ((type & InputType.TYPE_TEXT_FLAG_MULTI_LINE) == InputType.TYPE_TEXT_FLAG_MULTI_LINE) {
            inputTypePassword = false;
        }

        Log.d("inputTypePassword", String.valueOf(inputTypePassword));

        return inputTypePassword &&
                !valueContainsAnyTerms(field.hint, ignoreSearchTerms) &&
                !valueContainsAnyTerms(field.entry, ignoreSearchTerms);
    }

    private boolean parseEmailOrUsernameInputType(Field field) {
        int type = field.inputType;

        int inputClass = type & InputType.TYPE_MASK_CLASS;
        int variation = type & InputType.TYPE_MASK_VARIATION;

        boolean isEmailOrUsername = false;

        // Check for email-type inputs
        if (inputClass == InputType.TYPE_CLASS_TEXT) {
            switch (variation) {
                case InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS:
                case InputType.TYPE_TEXT_VARIATION_WEB_EMAIL_ADDRESS:
                    isEmailOrUsername = true;
                    break;
            }
        }

        return isEmailOrUsername;
    }

    @Nullable
    private String parseHint(Field field) {
        String[] hints = field.hints;
        String hint = null;

        if (hints != null) {
            for (String fieldHint: hints) {
                hint = inferHint(fieldHint);
                if (hint != null) return hint;
            }
        }
        String[] moreHeuristics = new String[] {field.hint, field.idHint, field.entry, field.idEntry, field.text};
        for (String fieldHint: moreHeuristics) {
            hint = inferHint(fieldHint);
            if (hint != null) return hint;
        }
        return null;
    }

    @Nullable
    protected String inferHint(@Nullable String actualHint) {
        if (Utils.isNullOrWhiteSpace(actualHint)) return null;
        Log.d(TAG, "inferHint:  " + actualHint);
        String hint = actualHint.toLowerCase();
        if (hint.contains("label") || hint.contains("container")) {
            return null;
        }
        if (valueContainsAnyTerms(hint, passwordTerms)) return View.AUTOFILL_HINT_PASSWORD;
        if (valueContainsAnyTerms(hint, usernameTerms))
            return View.AUTOFILL_HINT_USERNAME;
        if (valueContainsAnyTerms(hint, emailTerms)) return View.AUTOFILL_HINT_EMAIL_ADDRESS;

        return null;
    }

    private boolean valueContainsAnyTerms(String value, HashSet<String> terms)
    {
        if (Utils.isNullOrWhiteSpace(value))
        {
            return false;
        }
        return terms.stream().anyMatch(value.toLowerCase()::contains);
    }

}
