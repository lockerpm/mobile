package com.cystack.locker.vincss.autofill.parser;

import android.app.assist.AssistStructure;
import android.os.Build;
import android.text.InputType;
import android.util.Log;
import android.view.View;
import android.view.autofill.AutofillId;


import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.cystack.locker.vincss.autofill.Field;
import com.cystack.locker.vincss.autofill.Utils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

@RequiresApi(api = Build.VERSION_CODES.O)
public class FieldParser {
    private static final String TAG = "Field_Parser";
    public List<Field> fields  = new ArrayList<>();
    private List<Field> fillable = new ArrayList<>();
    private List<String> autofillIds = new ArrayList<>();
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
    public HashSet<String> passwordTerms = new HashSet<String>(
            Arrays.asList("password",
                    "pswd",
                    "pw",
                    "mật Khẩu",
                    "Mật "
            )
    );


    @Nullable
    public List<Field> getFillableItem(){
        // add some heuristics
        if (fillable.size() == 0) {
            return null;
        }

        if (fields.size() == 1) {
            if (fields.get(0).fillType != Field.FILL_TYPE_PASSWORD) {
                return null;
            } else
                return fields;
        }

        return parseLoginField(fillable);
    }
    
    public void addField(Field field){
        if (field.autofillType != View.AUTOFILL_TYPE_NONE) {
            fields.add(field);
        }
    }
    public void parser() {
        for (Field field: fields){
            // parse by hint
            String hint = parseHint(field);
            if (!Utils.isNullOrWhiteSpace(hint)){
                switch (hint) {
                    case View.AUTOFILL_HINT_EMAIL_ADDRESS:
                        field.fillType = Field.FILL_TYPE_EMAIL;
                        break;
                    case View.AUTOFILL_HINT_PASSWORD:
                        field.fillType = Field.FILL_TYPE_PASSWORD;
                        break;
                    case View.AUTOFILL_HINT_USERNAME:
                        field.fillType = Field.FILL_TYPE_USERNAME;
                        break;
                }
                fillable.add(field);
                autofillIds.add(field.autofillId.toString());
            }

            // parse inputType
            boolean isPasswordField = parseInputType(field);
            if (isPasswordField){
                if (!autofillIds.contains(field.autofillId.toString())){
                    field.fillType = Field.FILL_TYPE_PASSWORD;
                    fillable.add(field);
                }
            }
        }
    }

    private List<Field> parseLoginField(List<Field> fields) {
        int size = fields.size();
        List<Field> loginField = new ArrayList<>();
        for (int i = 0 ; i < size; i++ ){
            int fillType = fields.get(i).fillType;
            if (fillType == Field.FILL_TYPE_EMAIL || fillType == Field.FILL_TYPE_USERNAME) {
                loginField.add(fields.get(i));
                if ( i == size - 1) {
                    return null;
                } else {
                    for (int j = i ; j < size ; j++){
                        if (fields.get(j).fillType == Field.FILL_TYPE_PASSWORD) {
                            loginField.add(fields.get(j));
                            return loginField;
                        }
                    }
                }
          }
        }
        return null;
    }

    private boolean parseInputType(Field field) {
        int type = field.inputType;
        Log.d("type ", String.valueOf(type));
        boolean inputTypePassword = false;
        if ((type & InputType.TYPE_TEXT_VARIATION_PASSWORD) == InputType.TYPE_TEXT_VARIATION_PASSWORD){
            if ((type & InputType.TYPE_TEXT_FLAG_MULTI_LINE) == InputType.TYPE_TEXT_FLAG_MULTI_LINE) {
                inputTypePassword = false;

            } else {
                inputTypePassword = true;
            }

        }
        if ((type & InputType.TYPE_NUMBER_VARIATION_PASSWORD) == InputType.TYPE_NUMBER_VARIATION_PASSWORD){
            inputTypePassword = true;
        }
        if ((type & InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD) == InputType.TYPE_TEXT_VARIATION_WEB_PASSWORD){
            inputTypePassword = true;
        }
        if ((type & InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD) == InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD){
            inputTypePassword = true;
        }

        Log.d("pass field ", String.valueOf(inputTypePassword));
        return inputTypePassword && !valueContainsAnyTerms(field.hint, ignoreSearchTerms)
                && !valueContainsAnyTerms(field.entry, ignoreSearchTerms);
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

        // Then try some basic heuristics based on other node properties
        // using hint
        hint = inferHint(field.hint);
        if (hint != null) {
            return hint;
        }

        //using resourceId
        hint = inferHint(field.entry);
        if (hint != null) {
            return hint;
        }

        // using text
        hint = inferHint(field.text);
        if (hint != null) {
            return hint;
        }
        return null;
    }



    @Nullable
    protected String inferHint(@Nullable String actualHint) {

        if (actualHint == null) return null;
        Log.d(TAG, actualHint);
        Log.d(TAG, "mật khẩu");
        String hint = actualHint.toLowerCase();
        if (hint.contains("label") || hint.contains("container")) {
            return null;
        }
        if (hint.contains("password") || hint.contains("mật khẩu")) return View.AUTOFILL_HINT_PASSWORD;
        if (hint.contains("username")
                || (hint.contains("login") && hint.contains("id")) || hint.contains("tên đăng nhập"))
            return View.AUTOFILL_HINT_USERNAME;
        if (hint.contains("email")) return View.AUTOFILL_HINT_EMAIL_ADDRESS;

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
