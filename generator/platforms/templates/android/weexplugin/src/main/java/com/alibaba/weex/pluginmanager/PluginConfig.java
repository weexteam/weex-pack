package com.alibaba.weex.pluginmanager;

import android.content.Context;

import java.util.HashMap;

/**
 * Created by budao on 2016/12/23.
 */

public class PluginConfig {
  private static final String TAG = "PluginConfig";
  private static final boolean DEBUG = false;
  private static HashMap<String, PluginEntry> sComponents = new HashMap<>();
  private static HashMap<String, PluginEntry> sModules = new HashMap<>();

  public static void init(Context context) {
    loadAppSetting(context);
  }

  private static void loadAppSetting(Context context) {
    ConfigXmlParser parser = new ConfigXmlParser();
    parser.parse(context);
    sComponents = parser.getPluginComponents();
    sModules = parser.getPluginModules();
  }

  public static HashMap<String, PluginEntry> getComponents() {
    return sComponents;
  }

  public static void setComponents(HashMap<String, PluginEntry> components) {
    sComponents = components;
  }

  public static HashMap<String, PluginEntry> getModules() {
    return sModules;
  }

  public static void setModules(HashMap<String, PluginEntry> modules) {
    sModules = modules;
  }
}
