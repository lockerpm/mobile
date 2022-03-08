package com.cystack.locker.autofill;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

import  com.cystack.locker.R;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class LoginList extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // getSupportActionBar().hide();
        setContentView(R.layout.activity_login_list);

        Intent intent = getIntent();
        ArrayList<AutofillData> loginList = (ArrayList<AutofillData>) intent.getSerializableExtra("data");


        LoginListAdapter listAdapter = new LoginListAdapter(this, loginList);
        ListView listView = findViewById(R.id.listView);
        listView.setAdapter(listAdapter);
        listView.setClickable(true);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                AutofillData data = (AutofillData) listAdapter.getItem(position);
                Intent intent = new Intent();
                intent.putExtra("autofill_data", data);
                setResult(1, intent);
                finish();
            }
        });
    }

    public void cancel(View view){
        setResult(0);
        finish();
    }
}