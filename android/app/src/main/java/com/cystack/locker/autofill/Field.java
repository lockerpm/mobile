package com.cystack.locker.autofill;

import android.app.assist.AssistStructure;
import android.os.Build;
import android.os.Parcel;
import android.os.Parcelable;
import android.view.autofill.AutofillId;
import android.view.View;
import androidx.annotation.RequiresApi;

import java.io.Serializable;


@RequiresApi(api = Build.VERSION_CODES.O)
public class Field implements Parcelable {
    public static final int FILL_TYPE_NONE = 0;
    public static final int FILL_TYPE_EMAIL = 1;
    public static final int FILL_TYPE_USERNAME = 2;
    public static final int FILL_TYPE_PASSWORD = 3;

    public int fillType = FILL_TYPE_NONE;
    public AutofillId autofillId;
    public String hint;
    public String[] hints;
    public String entry;
    public String text;
    public int inputType;
    public int autofillType;

    public Field(AssistStructure.ViewNode node) {
        this.autofillId = node.getAutofillId();
        this.hint = node.getHint();
        this.entry = node.getIdEntry();
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
        hints = in.createStringArray();
        entry = in.readString();
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
        dest.writeStringArray(hints);
        dest.writeString(entry);
        dest.writeString(text);
        dest.writeInt(inputType);
        dest.writeInt(autofillType);
    }
}
