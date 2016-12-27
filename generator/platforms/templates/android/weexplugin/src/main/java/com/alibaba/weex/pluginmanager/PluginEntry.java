/*
       Licensed to the Apache Software Foundation (ASF) under one
       or more contributor license agreements.  See the NOTICE file
       distributed with this work for additional information
       regarding copyright ownership.  The ASF licenses this file
       to you under the Apache License, Version 2.0 (the
       "License"); you may not use this file except in compliance
       with the License.  You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

       Unless required by applicable law or agreed to in writing,
       software distributed under the License is distributed on an
       "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
       KIND, either express or implied.  See the License for the
       specific language governing permissions and limitations
       under the License.
 */
package com.alibaba.weex.pluginmanager;

import com.taobao.weex.common.IWXObject;
import com.taobao.weex.common.WXModule;
import com.taobao.weex.ui.component.WXComponent;

/**
 * This class represents a service entry object.
 */
public final class PluginEntry {

    /**
     * The name of the service that this plugin implements
     */
    public final String service;

    /**
     * The plugin class name that implements the service.
     */
    public final String pluginClass;

    /**
     * The pre-instantiated plugin to use for this entry.
     */
    public final IWXObject plugin;

    /**
     * Flag that indicates the plugin object should be created when PluginManager is initialized.
     */
    public final boolean onload;

    public final String category;

    /**
     * Constructs with a CordovaPlugin already instantiated.
     */
    public PluginEntry(String service, IWXObject plugin) {
        this(service, plugin.getClass().getName(), true, plugin);
    }

    /**
     * @param service               The name of the service
     * @param pluginClass           The plugin class name
     * @param onload                Create plugin object when HTML page is loaded
     */
//    public PluginEntry(String service, String pluginClass, boolean onload) {
//        this(service, pluginClass, onload, null);
//    }



    public PluginEntry(String service, String pluginClass, boolean onload, String category) {
        this(service, category, pluginClass, onload, null);
    }

    private PluginEntry(String service, String pluginClass, boolean onload, IWXObject plugin) {
        this(service, calCategory(plugin), pluginClass, onload, plugin);
    }

    private PluginEntry(String service, String category, String pluginClass, boolean onload, IWXObject plugin) {
        this.service = service;
        this.category = category;
        this.pluginClass = pluginClass;
        this.onload = onload;
        this.plugin = plugin;
    }

    private static String calCategory(IWXObject plugin) {
        if (plugin != null) {
            if (plugin instanceof WXModule) {
                return  "module";
            } else if (plugin instanceof WXComponent) {
                return  "component";
            }
        }
        return "module";
    }
}
