package com.cystack.locker.autofill.password.parser;

import android.text.InputType;
import android.util.Log;
import android.view.View;

import androidx.annotation.Nullable;

import com.cystack.locker.autofill.password.Field;
import com.cystack.locker.autofill.password.PasswordUtils;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;

public class FieldParser {
    private static final String TAG = "Field_Parser";
    public List<Field> fields  = new ArrayList<>();
    private final List<Field> fillable = new ArrayList<>();
    private final List<String> autofillIds = new ArrayList<>();

    private final HashSet<String> passwordTerms = new HashSet<>(Arrays.asList(
            // English
            "password", "pass", "pwd", "pswd", "passw", "passwd", "p@ss", "p@ssw0rd", "p4ssword", "pw",

            // Vietnamese
            "mật khẩu", "mật_khẩu", "mật", "khẩu", "matkhau", "mat_khau", "m_k", "mk", "mat-khau",

            // Russian
            "пароль", "пасс", "код",

            // Chinese
            "密码", "登入密码", "登录密码", "通行码",

            // French
            "mot de passe", "mdp", "passe"
    ));

    public HashSet<String> usernameTerms = new HashSet<>(Arrays.asList(
            // English
            "username", "user_name", "login", "log_in", "user", "userid", "user_id", "account", "accountname", "loginid", "passid", "id",

            // Vietnamese
            "tên đăng nhập", "tai khoan", "tài khoản", "ten dang nhap", "id người dùng", "ten nguoi dung",

            // Russian
            "имя пользователя", // username
            "логин",            // login
            "аккаунт",          // account
            "пользователь",     // user

            // Chinese
            "用户名",           // username
            "账户名",           // account name
            "登录名",           // login name
            "用户",             // user

            // French
            "nom d'utilisateur", // username
            "identifiant",       // login ID
            "compte",            // account
            "utilisateur"        // user
    ));
    public HashSet<String> emailTerms = new HashSet<>(Arrays.asList(
            // English
            "email", "email_address", "emailaddress", "e-mail", "mail", "address",

            // Vietnamese
            "địa chỉ email", "email người dùng", "thu điện tử", "email cá nhân",

            // Russian
            "электронная почта",  // email
            "почта",              // mail
            "e-mail", "имейл",

            // Chinese
            "邮箱",      // mailbox
            "电子邮件",  // email
            "邮件地址",  // email address

            // French
            "adresse e-mail", "email", "courriel", "adresse électronique"
    ));

    public HashSet<String> ignoreSearchTerms = new HashSet<>(Arrays.asList(
            // English
            "search", "find", "container", "label", "recipient", "edit", "query", "filter",

            // Vietnamese
            "tìm kiếm", "tìm", "người nhận", "trường", "lọc", "tên người nhận", "trường nhập",

            // Russian
            "поиск",           // search
            "найти",           // find
            "контейнер",       // container
            "получатель",      // recipient
            "редактировать",   // edit
            "метка",           // label

            // Chinese
            "搜索",     // search
            "查找",     // find
            "容器",     // container
            "收件人",   // recipient
            "标签",     // label
            "编辑",     // edit

            // French
            "recherche", "trouver", "conteneur", "destinataire", "étiquette", "modifier", "filtre"
    ));


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
            if (!PasswordUtils.isNullOrWhiteSpace(hint)){
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
        //        if (fillable.isEmpty()) {
        //            if (unknowType.size() == 1) {
        //                Field field = unknowType.get(0);
        //                field.fillType = Field.FILL_TYPE_USERNAME;
        //                fillable.add(field);
        //            }
        //            if (unknowType.size() == 2) {
        //                Field field1 = unknowType.get(0);
        //                field1.fillType = Field.FILL_TYPE_USERNAME;
        //                fillable.add(field1);
        //
        //                Field field2 = unknowType.get(1);
        //                field2.fillType = Field.FILL_TYPE_PASSWORD;
        //                fillable.add(field2);
        //            }
        //        }
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

//        // Optional: ignore multi-line input
//        if ((type & InputType.TYPE_TEXT_FLAG_MULTI_LINE) == InputType.TYPE_TEXT_FLAG_MULTI_LINE) {
//            inputTypePassword = false;
//        }

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
        // Check for email-type inputs
        if (field.inputType == InputType.TYPE_CLASS_TEXT && areAllNullOrEmpty(
                field.hint,
                field.idHint,
                field.entry,
                field.idEntry,
                field.text
        ) ) {
            isEmailOrUsername = true;
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
        if (PasswordUtils.isNullOrWhiteSpace(actualHint)) return null;
        Log.d(TAG, "inferHint:  " + actualHint);
        String hint = normalize(actualHint);
        if (hint.contains("label") || hint.contains("container")) return null;

        if (valueContainsAnyTerms(hint, usernameTerms)) return View.AUTOFILL_HINT_USERNAME;
        if (valueContainsAnyTerms(hint, emailTerms)) return View.AUTOFILL_HINT_EMAIL_ADDRESS;
        if (valueContainsAnyTerms(hint, passwordTerms)) return View.AUTOFILL_HINT_PASSWORD;

        return null;
    }

    private boolean valueContainsAnyTerms(String value, HashSet<String> terms) {
        if (PasswordUtils.isNullOrWhiteSpace(value)) return false;
        String normalized = normalize(value);
        return terms.stream().anyMatch(normalized::contains);
    }

    private String normalize(String input) {
        String noAccent = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", ""); // remove accents
        return noAccent.toLowerCase(Locale.ROOT).trim();
    }
    private boolean areAllNullOrEmpty(String... values) {
        for (String value : values) {
            if (value != null && !value.isEmpty()) {
                return false;
            }
        }
        return true;
    }

}
