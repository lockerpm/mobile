package com.cystack.locker.autofill;

public class AutofillData {
    private String userName;
    private String password;
    private String name;
    private String uri;
    private long lastUsed;

    public AutofillData(String userName, String password, String name, String uri, long lastUsed) {
        this.userName = userName;
        this.password = password;
        this.name = name;
        this.uri = uri;
        this.lastUsed = lastUsed;
    }


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

    public long getLastUsed() {
        return lastUsed;
    }
}
