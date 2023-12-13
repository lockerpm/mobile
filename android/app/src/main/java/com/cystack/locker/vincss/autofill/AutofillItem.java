package com.cystack.locker.vincss.autofill;

import android.os.Parcel;
import android.os.Parcelable;

import java.io.Serializable;

public class AutofillItem implements Parcelable {
    private String userName;
    private String password;
    private String name;
    private String uri;
    private String id;

    public AutofillItem(String id, String userName, String password, String name, String uri) {
        this.id = id;
        this.userName = userName;
        this.password = password;
        this.name = name;
        this.uri = uri;
    }

    protected AutofillItem(Parcel in) {
        userName = in.readString();
        password = in.readString();
        name = in.readString();
        uri = in.readString();
        id = in.readString();
    }

    public static final Creator<AutofillItem> CREATOR = new Creator<AutofillItem>() {
        @Override
        public AutofillItem createFromParcel(Parcel in) {
            return new AutofillItem(in);
        }

        @Override
        public AutofillItem[] newArray(int size) {
            return new AutofillItem[size];
        }
    };

    public String getUserName() {
        return userName;
    }
    public String getPassword() {
        return password;
    }
    public String getName() {
        return name;
    }
    public String getUri() {
        return uri;
    }
    public String getId() {
        return id;
    }

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(userName);
        dest.writeString(password);
        dest.writeString(name);
        dest.writeString(uri);
        dest.writeString(id);
    }
}
