package com.cystack.locker.vincss.autofill.parser;

import android.app.assist.AssistStructure;
import android.os.Build;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.cystack.locker.vincss.autofill.Utils;
import com.cystack.locker.vincss.autofill.Field;

import java.util.List;


@RequiresApi(api = Build.VERSION_CODES.O)
public class Parser {
    private static final String TAG = "Parser";

    private final AssistStructure structure;
    private Result result;
    private String packageName;
    private String domain;
    private String uri;

    public FieldParser fieldParser = new FieldParser();

    public Parser(AssistStructure structure)
    {
        this.structure = structure;
    }

    public Result Parse() {
        result = new Result();
        for(int i = 0 ; i < structure.getWindowNodeCount() ; i++) {
            AssistStructure.WindowNode node = structure.getWindowNodeAt(i);
            if (i == 0)
            {
                this.packageName = getTitlePackage(node);
            }
            ParseNode(node.getRootViewNode());
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

        return result;
    }

    private void ParseNode(AssistStructure.ViewNode node){
        setPackageAndDomain(node);

        // First try the explicit autofill hints...
        boolean haveAutofillHints = node.getAutofillHints() != null && node.getAutofillHints().length > 0;
        boolean isEditText = node.getClassName() != null && (node.getClassName().contains("EditText") || node.getClassName().contains("AutoCompleteTextView"));
        boolean isInputTag = node.getHtmlInfo() != null && node.getHtmlInfo().getTag().equals("input");

        if (isEditText || isInputTag || haveAutofillHints) {
            fieldParser.addField(new Field(node));
        }
        for (int i = 0; i < node.getChildCount(); i++)
        {
            ParseNode(node.getChildAt(i));
        }
    }

    private void setPackageAndDomain(AssistStructure.ViewNode node)
    {
        if (Utils.isNullOrWhiteSpace(packageName) && !Utils.isNullOrWhiteSpace(node.getIdPackage())) {
            packageName = node.getClassName();
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
