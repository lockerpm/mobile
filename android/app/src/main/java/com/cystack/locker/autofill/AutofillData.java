package com.cystack.locker.autofill;

public class AutofillData {
    private String userName;
    private String password;
    private String name;
    private String uri;
    private String id;



    public AutofillData(String id, String userName, String password, String name, String uri) {
        this.id = id;
        this.userName = userName;
        this.password = password;
        this.name = name;
        this.uri = uri;
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
    public String getId() {
        return id;
    }
}
