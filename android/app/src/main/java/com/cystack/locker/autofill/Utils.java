package com.cystack.locker.autofill;

import android.app.assist.AssistStructure;
import android.os.Build;
import android.service.autofill.FillContext;
import android.service.autofill.FillRequest;
import android.widget.RemoteViews;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.cystack.locker.R;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;

@RequiresApi(api = Build.VERSION_CODES.O)
public class Utils {

    // The URLs are blacklisted from autofilling
    public static HashSet<String> BlacklistedUris = new HashSet<String>(
            Arrays.asList("android",
                    "com.android.settings",
                    "com.android.settings.intelligence",
                    "com.cystack.locker"
            )
    );

    public static boolean isBlackListUri(String domain) {
        Iterator<String> it = BlacklistedUris.iterator();
        while (it.hasNext()) {
            String bl = it.next();
            if (bl.contains(domain) || domain.contains(bl))
                return true;
        }
        return false;
    }

    @NonNull
    static AssistStructure getLatestAssistStructure(@NonNull FillRequest request) {
        List<FillContext> fillContexts = request.getFillContexts();
        return fillContexts.get(fillContexts.size() - 1).getStructure();
    }

  
    @NonNull
    static RemoteViews newDatasetPresentation(@NonNull String packageName,
                                              @NonNull CharSequence text) {
        RemoteViews presentation =
                new RemoteViews(packageName, R.layout.remote_locker_app);
        return presentation;
    }

    static boolean isNullOrWhiteSpace(String value) {
        return value == null || value.trim().isEmpty();
    }
}
