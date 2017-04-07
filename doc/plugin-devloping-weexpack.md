# weexpack 插件开发套件
 weexpack 插件开发套件旨在帮助用户快速，方便开发插件，一键集成，无需更改任何业务代码


## 安装weexpack

     $ npm install weexpack -g
 
     
 
## 创建工程


     $ weexpack plugin create weex-plguin-demo
 
     
 
生成工程目录如下
 

      ├── android(Android插件工程目录)
      │    ├── library(Android插件module目录，已被include到example工程中)
      ├── ios(ios插件工程)
      ├── js(h5插件工程)
      ├── example(例子,开发者用来测试问题)
      │    └── index.we
      ├── playground
      │    ├── android(Android demo工程，集成了playground功能并默认引用了插件module)
      │    ├── ios(demo)
      │    ├── browser(demo)
      ├── ****.podspec(ios发布文件)
      ├── start(native端weex编译命令)
      ├── start-web(浏览器端weex编译命令)
      ├── package.json(js发布文件)
      ├── README.md

    
weexpack在工程创建完后会尝试运行npm 的安装命令。如果失败，需要手动运行一下，以便将需要的依赖都安装到工程中


    $ npm install
 
     
在生成工程完的中为你准备好了ios、android、js的插件模块的实现,同时也为你准备好了example，这些example经过编译之后,
   
    $ ./start
 
可以在playground下的各端的demo工程运行调试。详细的开发过程可以参考下以文档： 


## iOS端开发

- 请在ios目录下用如下命令初始化ios工程
```
pod update
```
- 添加插件初测信息
   - component示例
   ```
   WX_PlUGIN_EXPORT_MODULE(test, WPTestComponent)
   ```
   - module示例
   ```
   WX_PlUGIN_EXPORT_COMPONENT(test, WPTestModule)
   ```
   - Handler示例
   ```
   WX_PlUGIN_EXPORT_HANDLER(WPTestHandler, WXImgLoaderProtocol)
   ```
- 插件开发完成请在example/ios测试
   - 初始化测试工程
   ```
   pod update
   ```
   - 检验测试结果,demo运行起来会在控制台输入下面类似信息
   ```
   2017-03-24 16:54:52.934 WeexDemo[88059:2693902] WPTestComponent register
   2017-03-24 16:54:52.936 WeexDemo[88059:2693902] WXImgLoaderProtocol register
   2017-03-24 16:54:52.937 WeexDemo[88059:2693902] WPTestModule register
   ```

### 如何发布插件

- 发布插件到cocoapods 仓库

   - 已经默认创建好podspec，开发者在根目录通过如下命令检查iOS插件的正确性
  ```
  pod spec lint --allow-warnings --use-libraries
  ```
   - 发布插件到cocoapods 仓库
   ```
   pod trunk push --allow-warnings --use-libraries
   ```

### 如何发布插件到weex market

发布插件到weex market. 首先要在package.json中配置ios插件的安装信息。这样weexpack才能知道如何在将插件安装到目标工程中去

目前weexpack支持两种配置方式

 - cocoapods方式(推荐）.这种方式需要将ios工程发布到cocoapods仓库。并在package.json中做相应配置

   ```
   {
    "ios" :{
        "type":"pod"
        "version":"1.1.1"
        "name:"pluginPodName"
    }
   }
   ```
   
 - 本地安装方式。这种方式是ios工程随插件工程一同发布到npm。 weexpack安装时将工程下载下来，并注册到目标工程中



配置完成后，可以通过weex命令发布

```
weexpack plugin publish
```

### 如何集成插件weex-test
- 命令行集成
  ```
  weexpack plugin add weex-test
  ```
- 手动集成
  在podfile 中添加
  ```
  pod 'weex-test'
  ```

## Android
### 如何开发插件（以test举例）
- 通过weexpack初始化一个weex-test工程 （工程名称将被作为默认package名称的一部分，例如当设置工程名称为`test`时，插件工程的默认package会被设置为`org.weex.plugin.test`，所以在命名插件工程时请考虑其作为package名称的合法性）
    
    `weexpack plugin create test`


- 请使用Android Studio打开`example/android`目录下的工程，工程包含两个module：
    - app：playground工程，编译运行可打开playground，并自动集成library module中的插件
    - library：plugin module，你需要在该module内实现插件的逻辑    
        注：library module内预置了插件开发相关的示例，仅作为参考使用，在正式发布时请删除`org.weex.plugin.example`目录

- 添加插件注册信息
    - Component
    请使用`@WeexComponent`为插件中的Component实现类添加注解，`@WeexComponent`包含以下参数：
        - String[] names: 为Component指定一个或多个名称，不能为空
        - boolean appenndTree: 是否为该Component应用`append = tree`属性，默认为`false`
        - boolean usingHolder: 是否使用`SimpleComponentHolder`初始化该Component，默认为`false`
        - boolean canOverrideExistingComponent: 是否可以覆盖当前环境中已存在的同名Component，默认为`true`
        - String creator: 用于实例化Component的`ComponentCreator`实现类的全限定名，该类必须有一个无参数的构造函数。当`usingHolder`为`true`时，必须设置该属性，默认为`NULL`

    - Module
    请使用`@WeexModule`为插件中的Module实现类添加注解，`@WeexModule`包含以下参数：
        - String name: 为Module指定一个名称，不能为空
        - boolean canOverrideExistingModule: 是否可以覆盖当前环境中已存在的同名Module，默认为`true`
        - boolean globalRegistration: 是否全局注册该Module，默认为`false`
        - boolean lazyLoad: 是否懒加载该Module，默认为`false` （懒加载功能目前暂未实现，可先忽略该参数）

    - Adapter
    请使用`@WeexAdapter`为插件中实现的Adapter类添加注解，`@WeexAdapter`包含以下参数：
        - Class type: 插件实现的Adapter接口类，不能为空。例如，当前插件类为`IWXHttpAdapter`的实现类，则需要加上`@WeexAdapter(type = IWXHttpAdapter.class)`的注解，目前只支持weex sdk中已定义的Adapter类型
        - boolean canOverrideExistingAdapter: 是否可以覆盖当前环境中已存在的同类型Adapter，默认为`true`

    - DomObject
    请使用`@WeexDomObject`为插件中的自定义DomObject添加注解，`@WeexDomObject`包含以下参数：
        - String type: DomObject类型，不能为空
        - boolean canOverrideExistingDomObject: 是否可以覆盖当前环境中已存在的同名DomObject，默认为`true`

- 测试插件    
    插件开发完成后，请编译example工程并安装到设备上进行测试，playground启动后，插件将被自动注册到weex运行时中，此时你可以编写测试脚本并扫码进行测试

### 构建和发布插件    
在插件编写完成后，仅需要按照正常流程编译插件并做发布。默认地，约定`org.weex.plugin`作为插件的groupId，插件工程名（例如上文提到的`test`）作为插件的artifactId，插件工程根目录中`package.json`内android.version中定义的`version`作为插件的version。如果你需要以其他的GAV坐标发布插件，请对`package.json`做以下同步修改：    
- 将`android.groupId`更改为你自己的groupId    
- 将`android.name`更改为你自己的artifactId    
- 将`android.version`更改为你自己的version        

然后你就可以将构建出的插件aar发布到依赖管理仓库中




### 发布插件到weex market    
如果你希望让其他用户能通过weexpack工具集成你的插件，可将插件发布到weex market内，

发布插件到weex market. 首先要在package.json中配置android插件的安装信息。这样weexpack才能知道如何在将插件安装到目标工程中去

目前weexpack支持两种配置方式

 - maven(推荐）。 这种方式需要将android工程发布到maven仓库。并在package.json中做相应配置

   ```
   {
    "android" :{
        "type":"maven"
        "version":"1.1.1"
        "name:"mavenName"
        "groundId":"org.weex.plugin.test"
    }
   }
   ```
   
 - 本地安装方式。这种方式是android工程随插件工程一同发布到npm。 weexpack安装时将工程下载下来，并注册到目标工程中




在插件根目录下执行：

`weexpack plugin publish`    

即可将插件（包含android、iOS和H5实现）发布到weex market内

### 集成插件
- 命令行集成    
    `weexpack pulgin add test`    
    weexpack工具会从weex market下载test插件，解析插件内的GAV信息，生成gradle依赖信息并添加到工程的`build.gradle`中

- 手动集成    
    在相应的`build.gradle`文件中添加插件依赖

### 加载插件
- 引入插件容器    
    在相应的`build.gradle`文件中引入`compile 'org.weex.plugin:plugin-loader:${latest_version}'` （最新版本请在[jcenter](https://bintray.com/alibabaweex/maven/plugin_loader)查看）

- 加载插件
请在weex sdk初始化完成之后，调用插件容器`WeexPluginContainer`中的相应方法来加载插件：
    - loadAll(Context context): 加载当前应用中集成的所有插件，使用默认ClassLoader加载插件类
    - loadAll(Context context, ClassLoader classLoader): 加载当前应用中集成的所有插件，并使用传入的ClassLoader加载插件类
    - loadModules(Context context): 加载当前应用中集成的所有插件中包含的Module，使用默认ClassLoader加载插件类
    - loadModules(Context context, ClassLoader classLoader): 加载当前应用中集成的所有插件中包含的Module，并使用传入的ClassLoader加载插件类
    - loadComponents(Context context)
    - loadComponents(Context context, ClassLoader classLoader)
    - loadAdapters(Context context)
    - loadAdapters(Context context, ClassLoader classLoader)
    - loadDomObjects(Context context)
    - loadDomObjects(Context context, ClassLoader classLoader)

一般情况下，简单调用`WeexPluginContainer.loadAll(appContext)`即可完成加载。如果你的APP使用了插件化等相关技术（即应用中可能存在不同的ApplicationContext和ClassLoader），那么你需要考虑传入自定义的ClassLoader，插件类自身及插件信息中包含的所有Class将使用该ClassLoader加载；如果遇到集成的插件未被成功加载的情况，请排查传入的Context对象是否正确，插件容器需要通过Context中的AssetManager对象读取插件信息。

如果应用中集成了旧版本插件机制的相关插件，请调用`WeexPluginContainerCompat.init(Context context)`来加载旧版本的插件，并且我们强烈建议升级到新版本的插件机制，在以后的插件容器中我们可能会移除对旧版本机制的支持。



## web端开发

- 首先在插件根目录下运行安装命令

    ```
    npm install
    ```
    
- 调试
  
  在根目录下运行
  
    ```
    ./start-web
    ```
  命令。 开启试模式。 打开浏览器，访问  [http://localhost:12580/](http://localhost:12580/)  便可看到插件的演示效果
  
  
  
- 打包

   - 打包JS
   
   ```
    npm run build:web
   ```
   
   - 打包example
   
   ```
       npm run build:examples:web
   ```

### 如何发布插件


可以通过weex命令发布

```
weexpack plugin publish
```

### 如何集成插件

- 命令行集成

  ```
  weexpack plugin add weex-test
  ```
- 手动集成
  在package.json 中添加依赖
