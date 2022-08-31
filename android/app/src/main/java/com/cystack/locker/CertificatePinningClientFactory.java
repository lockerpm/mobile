package com.cystack.locker;

import com.facebook.react.modules.network.OkHttpClientProvider;
import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.ReactCookieJarContainer;
import okhttp3.CertificatePinner;
import okhttp3.OkHttpClient;
import okhttp3.CertificatePinner.Builder;
import okhttp3.logging.LoggingEventListener;


public class CertificatePinningClientFactory implements OkHttpClientFactory {

    @Override
    public OkHttpClient createNewNetworkModuleClient(){

        String hostName = BuildConfig.SSL_PINNING_HOST;

        String certificatePublicKey1 = "sha256/" + BuildConfig.SSL_PINNING_PUB_KEY_1;
        String certificatePublicKey2 = "sha256/" + BuildConfig.SSL_PINNING_PUB_KEY_2;
        OkHttpClient.Builder clientBuilder = OkHttpClientProvider.createClientBuilder();


        CertificatePinner certificatePinner = new CertificatePinner.Builder()
            .add(hostName, certificatePublicKey1)
            .add(hostName, certificatePublicKey2)               
            .build();

        clientBuilder.certificatePinner(certificatePinner);
        clientBuilder.cookieJar(new ReactCookieJarContainer());
        clientBuilder.eventListenerFactory(new LoggingEventListener.Factory());
        return clientBuilder.build();
    }
}