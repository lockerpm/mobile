package com.cystack.locker.selfhost.autofill;

import android.app.assist.AssistStructure;
import android.os.Build;
import android.os.Parcel;
import android.os.Parcelable;
import android.view.autofill.AutofillId;
import androidx.annotation.RequiresApi;


@RequiresApi(api = Build.VERSION_CODES.O)
public class Field implements Parcelable {
    public static final int FILL_TYPE_NONE = 0;
    public static final int FILL_TYPE_EMAIL = 1;
    public static final int FILL_TYPE_USERNAME = 2;
    public static final int FILL_TYPE_PASSWORD = 3;
    public static final int FILL_TYPE_UNKNOW= 4;

    public int fillType = FILL_TYPE_NONE;
    public AutofillId autofillId;
    public String hint;
    public String idHint;
    public String[] hints;

    public String idEntry;
    public String entry;
    public String text;

    public int inputType;
    public int autofillType;

    public Field(AssistStructure.ViewNode node) {
        this.autofillId = node.getAutofillId();
        this.hint = node.getHint();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            this.idHint = node.getHintIdEntry();
        }
        this.entry = node.getIdEntry();
        this.idEntry = node.getIdEntry();
        if (node.getText() != null) {
            this.text = node.getText().toString();
        }
        this.inputType = node.getInputType();
        this.autofillType = node.getAutofillType();
        this.hints = node.getAutofillHints();
    }

    protected Field(Parcel in) {
        fillType = in.readInt();
        autofillId = in.readParcelable(AutofillId.class.getClassLoader());
        hint = in.readString();
        idHint = in.readString();
        hints = in.createStringArray();
        entry = in.readString();
        idEntry = in.readString();
        text = in.readString();
        inputType = in.readInt();
        autofillType = in.readInt();
    }

    public static final Creator<Field> CREATOR = new Creator<Field>() {
        @Override
        public Field createFromParcel(Parcel in) {
            return new Field(in);
        }

        @Override
        public Field[] newArray(int size) {
            return new Field[size];
        }
    };

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(fillType);
        dest.writeParcelable(autofillId, flags);
        dest.writeString(hint);
        dest.writeString(idHint);
        dest.writeStringArray(hints);
        dest.writeString(entry);
        dest.writeString(idEntry);
        dest.writeString(text);
        dest.writeInt(inputType);
        dest.writeInt(autofillType);
    }
}
