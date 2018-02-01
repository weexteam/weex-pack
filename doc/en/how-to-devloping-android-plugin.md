## How to devloping android plugin

### Develop

1. Use Android Studio to open the `example/android` project in the project directory created with the weex plugin create command. The project should contains two modules:
  * app: playground project, compile and run to open the playground, and automatically integrate the plug-ins in the library module
  * library: plugin module, you need to implement plug-in logic in the module

  > Note: The library module pre-built plug-in development related examples, just as a reference to use, delete the org.weex.plugin.example directory before you release your package.

2. Add plug-in registration information

* Component
  * Component 
      Please use `@ WeexComponent` to annotate the Component implementation class in the plugin. The @WeexComponent contains the following parameters:
      * String [] names: Specify one or more names for the Component, which can not be null
      
      * boolean appenndTree: Whether to apply the append = tree attribute to this Component, the default is `false`
      
      * boolean usingHolder: Whether to initialize the Component with `SimpleComponentHolder`, the default is` false`
      
      * boolean canOverrideExistingComponent: Can overwrite the existing Component with the same name in the current environment, defaults to `true`
      
      * String creator: The fully qualified name of the ComponentCreator implementation class used to instantiate the Component, which must have a constructor that takes no arguments. This property must be set when `usingHolder` is true, and defaults to` NULL`.
  * Module
      Use `@ WeexModule` to add annotations to the Module implementation class in the plug-in. The` @ WeexModule` contains the following parameters:
      * String name: specify a name for the Module, can not be empty
      
      * boolean canOverrideExistingModule: Can overwrite the existing Module with the same name in the current environment, the default is `true`
      
      * boolean globalRegistration: whether to register the module globally, the default is false
      
      * boolean lazyLoad: lazy load the Module, the default is false (lazy loading function is currently not yet implemented, you can ignore the parameter)
  * Adapter
      Please use `@ WeexAdapter` to annotate the Adapter class implemented in the plugin. The @WeexAdapter contains the following parameters:
      * Class type: Plug Adapter adapter interface class, can not be empty. For example, if the current plugin class is an implementation class of `IWXHttpAdapter`, you need to add an annotation of` @WeexAdapter (type = IWXHttpAdapter.class) `. Currently, only the adapter types defined in weex sdk are supported
      
      * boolean canOverrideExistingAdapter: Can overwrite existing Adapter of the same type in current environment, default is `true`
  * DomObject
      Use '@ WeexDomObject` to add annotations to the custom DomObject in the plug-in, with the following parameters: @ WeexDomObject.
      
      * String type: DomObject type, can not be empty
      
      * boolean canOverrideExistingDomObject: Can overwrite DomObject with the same name in the current environment, default is `true`.

### Test
After the plug-in development is complete, please compile the example project and install it on the device for testing. After the playground starts, the plug-in will be automatically registered in the weex runtime. At this time, you can write your test script on [Dotwe](http://dotwe.org/vue/) and scan the qrcode for testing.

### How to load Weex plugin in existing APP
* Introduce plug-in container
  Introducing `compile 'org.weex.plugin: plugin-loader: $ {latest_version}'` in the corresponding `build.gradle` file (the latest version at [jcenter] (https://bintray.com/alibabaweex/maven / plugin_loader) view)
* Load plug-in
  After weex sdk initialization, call the appropriate method in the plug-in container `WeexPluginContainer` to load the plug-in:
  * loadAll (Context context): Load all the plug-ins integrated in the current application, use the default ClassLoader to load the plug-in class
  * loadAll (Context context, ClassLoader classLoader): Load all the plug-ins integrated in the current application and load the plug-in class using the incoming ClassLoader
  * loadModules (Context context): Load the modules contained in all the plug-ins integrated in the current application, use the default ClassLoader to load the plug-in class
  * loadModules (Context context, ClassLoader classLoader): Loads the Module contained in all the plug-ins integrated in the current application and loads the plug-in class using the incoming ClassLoader
  loadComponents (Context context)
  * loadComponents (Context context, ClassLoader classLoader)
  * loadAdapters (Context context)
  * loadAdapters (Context context, ClassLoader classLoader)
  * loadDomObjects (Context context)
  * loadDomObjects (Context context, ClassLoader classLoader)

> Tips: Under normal circumstances, a simple call `WeexPluginContainer.loadAll (appContext)` to complete the load. If your APP uses plug-ins and other related technologies (ie there may be different ApplicationContext and ClassLoader applications), you need to consider passing in a custom ClassLoader, and all the classes contained in the plug-in class itself and plug-in information will use that ClassLoader Load; If you encounter an integrated plug-in has not been successfully loaded, please check incoming Context object is correct, the plug-in container needs to read through the Context AssetManager object plug-in information.

If the application integrates plug-ins related to the old plug-in mechanism, please load the old plug-in by calling `WeexPluginContainerCompat.init (Context context)`, and we strongly recommend to upgrade to the new plug-in mechanism. In a future plug-in container, we may remove support for older mechanisms.
