package com.cystack.locker;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;

import androidx.annotation.Nullable;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.zoontek.rnbootsplash.RNBootSplash;
import android.view.WindowManager;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Locker";
  }


  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the renderer you wish to use - the new renderer (Fabric) or the old renderer
   * (Paper).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new AppActivityDelegate(this, getMainComponentName());
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    RNBootSplash.init(this);            // <- initialize the splash screen
    super.onCreate(null);               // or super.onCreate(savedInstanceState) when not using react-native-screens


    getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);

    if (BuildConfig.IS_PROD.equals("1")) {
      // OkHttpClientProvider.setOkHttpClientFactory(new CertificatePinningClientFactory());
    }
  }

  public static class AppActivityDelegate extends ReactActivityDelegate {
    private static final String ENABLE_AUTOFILL = "autofill";
    private static final String SAVE_LOGIN = "savePassword";
    private static final String LAST_LOGIN = "lastFill";
    private static final String DOMAIN_FILL = "domain";
    private static final String USERNAME = "username";
    private static final String PASSWORD = "password";
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

      if (bundle != null){

        if (bundle.containsKey(ENABLE_AUTOFILL)) {

          mInitialProps = new Bundle();
          mInitialProps.putInt(ENABLE_AUTOFILL, bundle.getInt(ENABLE_AUTOFILL));
          mInitialProps.putString(DOMAIN_FILL, bundle.getString(DOMAIN_FILL));
        } else if (bundle.containsKey(SAVE_LOGIN)) {

          mInitialProps = new Bundle();
          mInitialProps.putInt(SAVE_LOGIN, bundle.getInt(SAVE_LOGIN));
          mInitialProps.putString(DOMAIN_FILL, bundle.getString(DOMAIN_FILL));
          if (bundle.containsKey(USERNAME)) {
            mInitialProps.putString(USERNAME, bundle.getString(USERNAME));
          }
          mInitialProps.putString(PASSWORD, bundle.getString(PASSWORD));
        }
        else if (bundle.containsKey(LAST_LOGIN)) {

          mInitialProps = new Bundle();
          mInitialProps.putInt(LAST_LOGIN, bundle.getInt(LAST_LOGIN));
          mInitialProps.putString("lastUserPasswordID", bundle.getString("itemID"));
        }
      }
      super.onCreate(savedInstanceState);
    }

    @Override
    protected Bundle getLaunchOptions() {
      return mInitialProps;
    }
  }


  /**
   * Align the back button behavior with Android S
   * where moving root activities to background instead of finishing activities.
   * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
   */
  @Override
  public void invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        // For non-root activities, use the default implementation to finish them.
        super.invokeDefaultOnBackPressed();
      }
      return;
    }

    // Use the default back button implementation on Android S
    // because it's doing more than {@link Activity#moveTaskToBack} in fact.
    super.invokeDefaultOnBackPressed();
  }
}
