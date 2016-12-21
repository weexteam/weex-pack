package com.alibaba.weex.commons.util;

import android.content.Context;
import android.content.res.XmlResourceParser;
import android.util.Log;

import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.util.HashMap;

/**
 * Created by budao on 2016/10/12.
 */
public class AppConfig {
  private static final String TAG = "AppConfig";
  private static final boolean DEBUG = false;
  private static HashMap<String, PluginEntry> sComponents = new HashMap<>();
  private static HashMap<String, PluginEntry> sModules = new HashMap<>();
  private static CordovaPreferences sPreferences = new CordovaPreferences();

  public static void init(Context context) {
    loadAppSetting(context);
  }

  public static String getLaunchUrl() {
    return sPreferences.getString("launch_url", "http://127.0.0.1:8080/dist/index.js");
  }

  public static String getLocalUrl() {
    return sPreferences.getString("local_url", "file://assets/index.js");
  }

  public static Boolean isLaunchLocally() {
    return sPreferences.getBoolean("launch_locally", false);
  }

  private static void loadAppSetting(Context context) {
    ConfigXmlParser parser = new ConfigXmlParser();
    parser.parse(context);
    sComponents = parser.getPluginComponents();
    sModules = parser.getPluginModules();
    sPreferences = parser.getPreferences();
  }

  public static HashMap<String, PluginEntry> getComponents() {
    return sComponents;
  }

  public static void setComponents(HashMap<String, PluginEntry> components) {
    AppConfig.sComponents = components;
  }

  public static HashMap<String, PluginEntry> getModules() {
    return sModules;
  }

  public static void setModules(HashMap<String, PluginEntry> modules) {
    AppConfig.sModules = modules;
  }
}
