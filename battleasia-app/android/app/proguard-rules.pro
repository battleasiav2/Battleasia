-keep class com.dexterous.flutterlocalnotifications.** { *; }

# In-App Purchase
-keep class com.amazon.** {*;}
-keep class dev.hyo.** { *; }
-keep class com.android.vending.billing.**
-dontwarn com.amazon.**
-keepattributes *Annotation*

# Flutter - core engine protection
-keep class io.flutter.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.app.** { *; }
-dontwarn io.flutter.**

# record plugin (audio recording)
-keep class com.llfbandit.record.** { *; }
-dontwarn com.llfbandit.record.**

# flutter_sound plugin (audio playback/recording)
-keep class com.dooboolab.fluttersound.** { *; }
-keep class xyz.canardoux.fluttersound.** { *; }
-dontwarn com.dooboolab.**

# permission_handler plugin
-keep class com.baseflow.permissionhandler.** { *; }
-dontwarn com.baseflow.permissionhandler.**

# webview_flutter plugin
-keep class io.flutter.plugins.webviewflutter.** { *; }
-dontwarn io.flutter.plugins.webviewflutter.**

# image_picker plugin
-keep class io.flutter.plugins.imagepicker.** { *; }
-dontwarn io.flutter.plugins.imagepicker.**

# path_provider plugin
-keep class io.flutter.plugins.pathprovider.** { *; }
-dontwarn io.flutter.plugins.pathprovider.**

# Kotlin serialization
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn kotlin.**
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }

