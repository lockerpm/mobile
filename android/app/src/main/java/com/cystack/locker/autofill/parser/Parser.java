package com.cystack.locker.autofill.parser;

import android.app.assist.AssistStructure;
import android.os.Build;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.service.autofill.SaveRequest;
import android.text.InputType;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.cystack.locker.autofill.Utils;
import com.cystack.locker.autofill.Field;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;


@RequiresApi(api = Build.VERSION_CODES.O)
public class Parser {
    private static final String TAG = "Parser";

    private final List<AssistStructure> structures;
    private Result result;
    private String packageName;
    private String domain;
    private String uri;

    public FieldParser fieldParser = new FieldParser();

    public Parser(@NonNull FillRequest request )
    {
        List<FillContext> fillContexts = request.getFillContexts();
        Log.d(TAG, "getLatestAssistStructure: " + fillContexts.size());
        this.structures = fillContexts.stream()
                .map(FillContext::getStructure)
                .collect(Collectors.toList());
    }

    public Parser(@NonNull SaveRequest request )
    {
        List<FillContext> fillContexts = request.getFillContexts();
        Log.d(TAG, "getLatestAssistStructure: " + fillContexts.size());
        this.structures = fillContexts.stream()
                .map(FillContext::getStructure)
                .collect(Collectors.toList());
    }


    public Result Parse() {
        result = new Result();
        for (AssistStructure structure : structures) {
//            dumpStructure(structure);
            for(int i = 0 ; i < structure.getWindowNodeCount() ; i++) {
                AssistStructure.WindowNode node = structure.getWindowNodeAt(i);
                if (i == 0)
                {
                    this.packageName = getTitlePackage(node);
                }
                ParseNode(node.getRootViewNode());
            }
        }


        if (!Utils.isNullOrWhiteSpace(packageName)){
            result.packageName = packageName;
        }

        if (!Utils.isNullOrWhiteSpace(domain)){
            result.domain = domain;
        }
        if (!Utils.isNullOrWhiteSpace(uri)){
            result.uri = uri;
        }

        // get fillable item
        fieldParser.parser();
        result.fillable = fieldParser.getFillableItem();


        Log.d(TAG, String.format("packageName: %s, domain: %s, uri: %s",
                result.packageName,
                result.domain,
                result.uri
        ));

        return result;
    }

    private void ParseNode(AssistStructure.ViewNode node){
        setPackageAndDomain(node);
        // First try the explicit autofill hints...
        boolean haveAutofillHints = node.getAutofillHints() != null && node.getAutofillHints().length > 0;
        boolean isEditText = node.getClassName() != null && (node.getClassName().contains("EditText") || node.getClassName().contains("AutoCompleteTextView"));
        boolean isInputTag = node.getHtmlInfo() != null &&
                "input".equalsIgnoreCase(node.getHtmlInfo().getTag());

//        boolean isInputType = (inputType & InputType.TYPE_MASK_CLASS) == InputType.TYPE_CLASS_TEXT
//                || (inputType & InputType.TYPE_MASK_CLASS) == InputType.TYPE_CLASS_NUMBER
//                || (inputType & InputType.TYPE_MASK_CLASS) == InputType.TYPE_CLASS_PHONE;

        boolean isInputType = false;
        int inputType = node.getInputType();
        int inputClass = inputType & InputType.TYPE_MASK_CLASS;
        int variation = inputType & InputType.TYPE_MASK_VARIATION;

        if ((inputClass == InputType.TYPE_CLASS_TEXT) || (
                inputClass == InputType.TYPE_CLASS_NUMBER &&
                        variation == InputType.TYPE_NUMBER_VARIATION_PASSWORD
        )) {
            isInputType = true;
        }

        boolean isEditable = (isInputType || isEditText || isInputTag || haveAutofillHints);

        Log.d(TAG, String.format("id: %s, hints: %s, text: %s,  inputType: %d, isEditText: %b, isInputTag: %b, haveAutofillHints: %b, isEditable: %b",
                node.getIdEntry(),
                Arrays.toString(node.getAutofillHints()),
                node.getText(),
                inputType,
                isEditText,
                isInputTag,
                haveAutofillHints,
                isEditable
        ));

        if (isEditable) {
            fieldParser.addField(new Field(node));
        }
        for (int i = 0; i < node.getChildCount(); i++)
        {
            ParseNode(node.getChildAt(i));
        }
    }

    public void dumpStructure(AssistStructure structure) {
        for (int i = 0; i < structure.getWindowNodeCount(); i++) {
            AssistStructure.ViewNode root = structure.getWindowNodeAt(i).getRootViewNode();
            dumpNodeRecursive(root, 0);
        }
    }

    private void dumpNodeRecursive(AssistStructure.ViewNode node, int depth) {
        String indent = new String(new char[depth]).replace('\0', '-');
        Log.d("DUMP", indent + "Class: " + node.getClassName()
                + ", ID: " + node.getIdEntry()
                + ", Hints: " + Arrays.toString(node.getAutofillHints())
                + ", Text: " + node.getText()
                + ", package" + node.getIdPackage()
                + ", Hint" + node.getHint()
                + ", getWebDomain" + node.getWebDomain()
        );

        for (int i = 0; i < node.getChildCount(); i++) {
            dumpNodeRecursive(node.getChildAt(i), depth + 1);
        }
    }

    private void setPackageAndDomain(AssistStructure.ViewNode node)
    {
        if (Utils.isNullOrWhiteSpace(packageName) && !Utils.isNullOrWhiteSpace(node.getIdPackage())) {
            packageName = node.getIdPackage();
        }
        if (Utils.isNullOrWhiteSpace(domain) && !Utils.isNullOrWhiteSpace(node.getWebDomain())) {
            String scheme = "http";
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                scheme = node.getWebScheme();
            }

            if (!Utils.isNullOrWhiteSpace(node.getWebDomain())){
                domain = node.getWebDomain();
                uri = String.format("%s://%s", scheme, node.getWebDomain());
            }
        }
    }
    @Nullable
    private String getTitlePackage(AssistStructure.WindowNode node)
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
        return null;
    }
    public static class Result {
        String packageName;
        String domain;
        String uri;
        List<Field> fillable;

        @Nullable
        public String getUri() {
            if (!Utils.isNullOrWhiteSpace(uri)) {
                return uri;
            } else if (!Utils.isNullOrWhiteSpace(packageName)){
                return String.format("%s://%s", "androidapp", packageName);
            }
            return null;
        }
        @Nullable
        public String getDomain() {
            return !Utils.isNullOrWhiteSpace(domain) ? domain : packageName;
        }
        @Nullable
        public String getPackageName() {
            return packageName;
        }
        public  List<Field> getFillable() {
            return fillable;
        }
    }
}
