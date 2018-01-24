## 开发Weex的android端插件

### 开发

1. 使用Android Studio打开通过`weex plugin create`命令创建的工程目录下的`example/android`工程，工程包含两个module：
  * app：playground工程，编译运行可打开playground，并自动集成library module中的插件
  * library：plugin module，你需要在该module内实现插件的逻辑 

  > 注：library module内预置了插件开发相关的示例，仅作为参考使用，在正式发布时请删除`org.weex.plugin.example`目录

2. 添加插件注册信息
  * Component  
    请使用`@WeexComponent`为插件中的Component实现类添加注解，`@WeexComponent`包含以下参数：
    * String[] names: 为Component指定一个或多个名称，不能为空
    * boolean appenndTree: 是否为该Component应用`append = tree`属性，默认为`false`
    * boolean usingHolder: 是否使用`SimpleComponentHolder`初始化该Component，默认为`false`
    * boolean canOverrideExistingComponent: 是否可以覆盖当前环境中已存在的同名Component，默认为`true`
    * String creator: 用于实例化Component的`ComponentCreator`实现类的全限定名，该类必须有一个无参数的构造函数。当`usingHolder`为`true`时，必须设置该属性，默认为`NULL`
  * Module  
    请使用`@WeexModule`为插件中的Module实现类添加注解，`@WeexModule`包含以下参数：
    * String name: 为Module指定一个名称，不能为空
    * boolean canOverrideExistingModule: 是否可以覆盖当前环境中已存在的同名Module，默认为`true`
    * boolean globalRegistration: 是否全局注册该Module，默认为`false`
    * boolean lazyLoad: 是否懒加载该Module，默认为`false` （懒加载功能目前暂未实现，可先忽略该参数）
  * Adapter  
    请使用`@WeexAdapter`为插件中实现的Adapter类添加注解，`@WeexAdapter`包含以下参数：
    * Class type: 插件实现的Adapter接口类，不能为空。例如，当前插件类为`IWXHttpAdapter`的实现类，则需要加上`@WeexAdapter(type = IWXHttpAdapter.class)`的注解，目前只支持weex sdk中已定义的Adapter类型
    * boolean canOverrideExistingAdapter: 是否可以覆盖当前环境中已存在的同类型Adapter，默认为`true`
  * DomObject  
    请使用`@WeexDomObject`为插件中的自定义DomObject添加注解，`@WeexDomObject`包含以下参数：
    * String type: DomObject类型，不能为空
    * boolean canOverrideExistingDomObject: 是否可以覆盖当前环境中已存在的同名DomObject，默认为`true`

### 测试 
插件开发完成后，请编译example工程并安装到设备上进行测试，playground启动后，插件将被自动注册到weex运行时中，此时你可以在[Dotwe](http://dotwe.org/vue/)中编写测试脚本并扫码进行测试


### 如何在已有APP中加载Weex插件
* 引入插件容器  
  在相应的`build.gradle`文件中引入`compile 'org.weex.plugin:plugin-loader:${latest_version}'` （最新版本请在[jcenter](https://bintray.com/alibabaweex/maven/plugin_loader)查看）
* 加载插件  
  请在weex sdk初始化完成之后，调用插件容器`WeexPluginContainer`中的相应方法来加载插件：
  * loadAll(Context context): 加载当前应用中集成的所有插件，使用默认ClassLoader加载插件类
  * loadAll(Context context, ClassLoader classLoader): 加载当前应用中集成的所有插件，并使用传入的ClassLoader加载插件类
  * loadModules(Context context): 加载当前应用中集成的所有插件中包含的Module，使用默认ClassLoader加载插件类
  * loadModules(Context context, ClassLoader classLoader): 加载当前应用中集成的所有插件中包含的Module，并使用传入的ClassLoader加载插件类
  * loadComponents(Context context)
  * loadComponents(Context context, ClassLoader classLoader)
  * loadAdapters(Context context)
  * loadAdapters(Context context, ClassLoader classLoader)
  * loadDomObjects(Context context)
  * loadDomObjects(Context context, ClassLoader classLoader)


一般情况下，简单调用`WeexPluginContainer.loadAll(appContext)`即可完成加载。如果你的APP使用了插件化等相关技术（即应用中可能存在不同的ApplicationContext和ClassLoader），那么你需要考虑传入自定义的ClassLoader，插件类自身及插件信息中包含的所有Class将使用该ClassLoader加载；如果遇到集成的插件未被成功加载的情况，请排查传入的Context对象是否正确，插件容器需要通过Context中的AssetManager对象读取插件信息。

如果应用中集成了旧版本插件机制的相关插件，请调用`WeexPluginContainerCompat.init(Context context)`来加载旧版本的插件，并且我们强烈建议升级到新版本的插件机制，在以后的插件容器中我们可能会移除对旧版本机制的支持。