package com.cystack.locker.autofill.parser;

import android.os.Build;
import android.text.InputType;
import android.util.Log;
import android.view.View;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.cystack.locker.autofill.Field;
import com.cystack.locker.autofill.Utils;

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
    private HashSet<String> passwordTerms = new HashSet<String>(
            Arrays.asList("password",
                    "pswd",
                    "pwd",
                    "mật Khẩu",
                    "pass",
                    "Mật "
            )
    );

    public HashSet<String> usernameTerms = new HashSet<String>(
            Arrays.asList("username",
                    "login",
                    "id",
                    "tên đăng nhập"
            )
    );
    public HashSet<String> emailTerms = new HashSet<String>(
            Arrays.asList("email",
                    "address"
            )
    );


    @Nullable
    public List<Field> getFillableItem(){
        if (fillable.size() == 0) {
            Log.d(TAG, "Not found any fill-able field");
            return null;
        }
        return fillable;
    }

    
    public void addField(Field field){
        if (field.autofillType != View.AUTOFILL_TYPE_NONE) {
            fields.add(field);
        }
    }
    public void parser() {
        Log.d(TAG, "find fields size: " + fields.size());
        List<Field> unknowType = new ArrayList<>();
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
            } else {
                // parse inputType
                boolean isPasswordField = parseInputType(field);
                if (isPasswordField) {
                    if (!autofillIds.contains(field.autofillId.toString())) {
                        field.fillType = Field.FILL_TYPE_PASSWORD;
                        fillable.add(field);
                    }
                } else {
                    field.fillType = Field.FILL_TYPE_UNKNOW;
                    unknowType.add(field);
                }
            }
        }
        Log.d(TAG, "unknowType fields size: " + unknowType.size());
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
    }

    /**
     * Analyze login patterns by finding username and password fields in the field list
     * @param fields
     * @return
     */
    private List<Field> parseLoginField(List<Field> fields) {
        int size = fields.size();
        List<Field> loginField = new ArrayList<>();
        for (int i = 0 ; i < size; i++ ){
            int fillType = fields.get(i).fillType;
            Log.d(TAG, "field type "+ fillType);
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
        return loginField;
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

        Log.d("inputTypePassword", String.valueOf(inputTypePassword));
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
        Log.d(TAG, actualHint);
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
