package com.cystack.locker.callerID;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.annotation.Nullable;

import com.cystack.locker.R;

public class CallerIdService extends Service {
    private static View overlayView;
    private static WindowManager windowManager;

    public static void lookup(Context context, String phoneNumber) {
        // Gửi request đến server hoặc API public (nếu có)
        new Thread(() -> {
            String callerName = fetchNameFromApi(phoneNumber);
            if (callerName != null) {
                new Handler(Looper.getMainLooper()).post(() -> {
                    showOverlay(context, callerName, phoneNumber);
                });
            }
        }).start();
    }

    private static String fetchNameFromApi(String number) {
        // Gọi API của bạn để lấy thông tin số điện thoại
        return "Nguyễn Văn A"; // Ví dụ trả về
    }

    public static void showOverlay(Context context, String name, String number) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(context)) {
            // Cần yêu cầu quyền SYSTEM_ALERT_WINDOW
            return;
        }

        windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O ?
                        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY :
                        WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
        );

        overlayView = LayoutInflater.from(context).inflate(R.layout.overlay_layout, null);
        TextView nameText = overlayView.findViewById(R.id.caller_name);
        TextView carrierText = overlayView.findViewById(R.id.carrier);
        TextView labelText = overlayView.findViewById(R.id.label);
        ImageButton closeButton = overlayView.findViewById(R.id.close_button);


        nameText.setText(name + " - " + number);
        closeButton.setOnClickListener(v -> removeOverlay());
        windowManager.addView(overlayView, params);
    }

    public static void removeOverlay() {
        if (overlayView != null && windowManager != null) {
            try {
                windowManager.removeView(overlayView);
            } catch (Exception e) {
                e.printStackTrace(); // Trong trường hợp view đã bị remove
            }
            overlayView = null;
            windowManager = null;
        }
    }


    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}