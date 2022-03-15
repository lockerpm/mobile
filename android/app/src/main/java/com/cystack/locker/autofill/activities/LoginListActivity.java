package com.cystack.locker.autofill.activities;

import static com.cystack.locker.autofill.activities.VerifyMasterPasswordActivity.EXTRA_LOGIN_DATA;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;


import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.SearchView;

import com.cystack.locker.R;
import com.cystack.locker.autofill.AutofillItem;
import com.cystack.locker.autofill.adapter.LoginListAdapter;

import java.util.ArrayList;


@RequiresApi(api = Build.VERSION_CODES.O)
public class LoginListActivity extends AppCompatActivity {
    public static final String DATA = "autofill_data";
    LoginListAdapter listAdapter;
    ListView listView;
    SearchView searchView;
    CharSequence search = "";


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // getSupportActionBar().hide();
        setContentView(R.layout.activity_login_list);

        Intent intent = getIntent();
        ArrayList<AutofillItem> loginList = intent.getParcelableArrayListExtra(EXTRA_LOGIN_DATA);


        listAdapter = new LoginListAdapter(this, loginList);
        listView = findViewById(R.id.listView);
        listView.setAdapter(listAdapter);
        listView.setClickable(true);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                AutofillItem data = (AutofillItem) listAdapter.getItem(position);
                Intent intent = new Intent();
                intent.putExtra(DATA, data);
                setResult(1, intent);
                finish();
            }
        });

        searchView = findViewById(R.id.search_bar);
        searchView.setFocusable(false);
        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                return false;
            }

            @Override
            public boolean onQueryTextChange(String newText) {
                listAdapter.getFilter().filter(newText);
                return false;
            }
        });
    }

    public void cancel(View view){
        setResult(0);
        finish();
    }

}