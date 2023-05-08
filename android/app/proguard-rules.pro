# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
-keep class com.cystack.locker.BuildConfig { *; }
-keep class com.facebook.jni.** { *; }
-keep public class com.horcrux.svg.** {*;}
-keep class com.facebook.react.turbomodule.** { *; }
-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}


#VinCSS js inject
-keepclassmembers class net.vincss.fido2.core.models.common.CollectedClientData { *; }

#VinCSS FIDO2 SDK
-keep class net.vincss.fido2.core.models.common.** { *; }
-keep class net.vincss.fido2.Fido2Manager { *; }
-keep class net.vincss.fido2.Fido2Manager$Companion { *; }
-keep class net.vincss.fido2.ClientSDKConfig { *; }
-keep class net.vincss.fido2.ClientSDKConfig$Companion { *; }
-keep class net.vincss.fido2.ClientSDKConfig$CommunicationMethod { *; }
-keep class net.vincss.fido2.core.constants.Errors { *; }


-keepattributes InnerClasses
 -keep class **.R
 -keep class **.R$* {
    <fields>;
}

# Jackson
-keep @com.fasterxml.jackson.annotation.JsonIgnoreProperties class * { *; }
-keep @com.fasterxml.jackson.annotation.JsonCreator class * { *; }
-keep @com.fasterxml.jackson.annotation.JsonValue class * { *; }
-keep class com.fasterxml.** { *; }
-keep class org.codehaus.** { *; }
-keepnames class com.fasterxml.jackson.** { *; }
-keepclassmembers public final enum com.fasterxml.jackson.annotation.JsonAutoDetect$Visibility {
    public static final com.fasterxml.jackson.annotation.JsonAutoDetect$Visibility *;
}

# General
-keepattributes SourceFile,LineNumberTable,*Annotation*,EnclosingMethod,Signature,Exceptions,InnerClasses
