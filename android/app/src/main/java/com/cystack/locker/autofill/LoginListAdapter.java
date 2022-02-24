package com.cystack.locker.autofill;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.BaseAdapter;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.cystack.locker.R;

import java.util.ArrayList;
import java.util.List;


public class LoginListAdapter extends BaseAdapter {
    private List<AutofillData> listData;
    private LayoutInflater layoutInflater;
    private Context context;

    public LoginListAdapter(Context context, List<AutofillData> listData){
        this.context = context;
        this.listData = listData;
        layoutInflater = LayoutInflater.from(context);
    }

    @Override
    public int getCount() {
        return listData.size();
    }

    @Override
    public Object getItem(int position) {
        return listData.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        convertView = layoutInflater.inflate(R.layout.list_item, null);
        AutofillData data = this.listData.get(position);
        TextView name = (TextView) convertView.findViewById(R.id.login_name);
        TextView uri = (TextView) convertView.findViewById(R.id.login_uri);
        name.setText(data.getName());
        uri.setText(data.getUri());
        return convertView;
    }
}
