package com.cystack.locker.autofill.adapter;

import android.content.Context;
import android.os.Build;
import android.os.Parcelable;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.BaseAdapter;
import android.widget.Filter;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.cystack.locker.R;
import com.cystack.locker.autofill.AutofillItem;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


public class LoginListAdapter extends BaseAdapter {
    private List<AutofillItem> listData;
    private List<AutofillItem> filterData;
    private LayoutInflater layoutInflater;
    private Context context;

    public LoginListAdapter(Context context, List<AutofillItem> listData){
        this.context = context;
        this.listData = listData;
        filterData = new ArrayList<>(listData);
        layoutInflater = LayoutInflater.from(context);
    }
    @Override
    public int getCount() {
        return filterData.size();
    }

    @Override
    public Object getItem(int position) {
        return filterData.get(position);
    }

    @Override
    public long getItemId(int position) {
        return position;
    }

    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        convertView = layoutInflater.inflate(R.layout.list_item, null);
        AutofillItem data = this.filterData.get(position);
        TextView name = (TextView) convertView.findViewById(R.id.login_name);
        TextView uri = (TextView) convertView.findViewById(R.id.login_uri);
        name.setText(data.getName());
        uri.setText(data.getUri());
        return convertView;
    }

    public Filter getFilter() {
        return new Filter() {
            @Override
            protected FilterResults performFiltering(CharSequence constraint) {
                String key = constraint.toString();
                if (key.isEmpty()) {
                    filterData = listData;
                } else {
                    List<AutofillItem> listFiltered = new ArrayList<>();
                    for (AutofillItem data: listData) {
                        if (data.getName().toLowerCase().contains(key)){
                            listFiltered.add(data);
                            break;
                        }
                        if (data.getUri().toLowerCase().contains(key)){
                            listFiltered.add(data);
                            break;
                        }
                        if (data.getUserName().toLowerCase().contains(key)){
                            listFiltered.add(data);
                            break;
                        }
                    }
                    filterData = listFiltered;
                }
                FilterResults filterResults = new FilterResults();
                filterResults.values = filterData;
                return filterResults;
            }

            @Override
            protected void publishResults(CharSequence constraint, FilterResults results) {
                filterData = (List<AutofillItem>) results.values;
                notifyDataSetChanged();
            }
        };
    }

}
