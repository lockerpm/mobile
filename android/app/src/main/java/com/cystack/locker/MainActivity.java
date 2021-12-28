package com.cystack.locker;

import android.app.Activity;
import android.os.Bundle; // here
import com.facebook.react.ReactActivity;
import org.devio.rn.splashscreen.SplashScreen; // here
import android.view.WindowManager;

import androidx.annotation.Nullable;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;


public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "CyStackLocker";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.show(this);  // here
    super.onCreate(savedInstanceState);
    getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
  }

  public static class AppActivityDelegate extends ReactActivityDelegate {
    private static final String ENABLE_AUTOFILL = "autofill";
    private Bundle mInitialProps = null;
    private final
    @Nullable
    Activity mActivity;

    public AppActivityDelegate(Activity activity, String mainComponentName) {
      super(activity, mainComponentName);
      this.mActivity = activity;
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
      Bundle bundle = mActivity.getIntent().getExtras();
      if (bundle != null && bundle.containsKey(ENABLE_AUTOFILL)) {
        mInitialProps = new Bundle();
        mInitialProps.putInt(ENABLE_AUTOFILL, bundle.getInt(ENABLE_AUTOFILL));
      }
      super.onCreate(savedInstanceState);
    }

    @Override
    protected Bundle getLaunchOptions() {
      return mInitialProps;
    }
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new AppActivityDelegate(this, getMainComponentName());
  }
}
