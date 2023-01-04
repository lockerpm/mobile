package com.cystack.locker;

import android.app.Activity;
import android.os.Bundle; // here
import com.facebook.react.ReactActivity;
import org.devio.rn.splashscreen.SplashScreen; // here
import android.view.WindowManager;

import androidx.annotation.Nullable;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;

import com.facebook.react.modules.network.OkHttpClientProvider;
import com.cystack.locker.CertificatePinningClientFactory;
import android.util.Log;

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

    //RuntimeException android.app.ActivityThread in performLaunchActivity
    // Unhandled
    // Unable to start activity ComponentInfo{com.cystack.locker/com.cystack.locker.MainActivity}: androidx.fragment.app.Fragment$k
    //https://github.com/software-mansion/react-native-screens/issues/17#issuecomment-424704067
    super.onCreate(null);

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

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new AppActivityDelegate(this, getMainComponentName());
  }
}
