[![GitHub release](https://img.shields.io/github/release/weexteam/weex-pack.svg)](https://github.com/weexteam/weex-pack/releases)  [![GitHub issues](https://img.shields.io/github/issues/weexteam/weex-pack.svg)](https://github.com/weexteam/weex-pack/issues)
![Node Version](https://img.shields.io/node/v/weex-pack.svg "Node Version")
[![Build Status](https://travis-ci.org/weexteam/weex-pack.svg?branch=master)](https://travis-ci.org/weexteam/weex-pack)
# Weex 工程开发套件

[English Version](./README.en.md)

## weexpack 介绍
weexpack 是新一代的weex应用工程和插件工程开发套件，是基于weex快速搭建应用原型的利器。它能够帮助开发者通过命令行创建weex应用工程和插件工程，快速打包 weex 应用并安装到手机运行，对于具有分享精神的开发者而言还能够创建weex插件模版并发布插件到weex应用市场。 使用weexpack 能够方便的在在weex工程和native工程中安装插件。

目前[weex-toolkit](https://github.com/weexteam/weex-toolkit)集成对weexpack的命令调用支持，你可以使用weex-toolkit命令来实现weexpack具备的功能。比如我们要实现添加iOS应用模板：
``` bash
# 使用weexpack 命令
$ weexpack platform add ios

# 使用weex-toolkit
$ weex platform add  ios

```

又或者添加 weex-action-sheet插件

``` bash
# 使用weexpack 命令
$ weexpack plugin add weex-action-sheet

# 使用weex-toolkit
$ weex plugin add  weex-action-sheet

```

### weexpack 命令介绍

weexpack 所提供的命令大致可分为三组，分别是：
* 打包命令
 * **weexpack create** — 创建 weex 工程项目。
 * **weexpack platform add/remove** — 安装／移除 weex 应用模版，默认模版支持 weex bundle 调试和插件机制。
 * **weexpack platform list** — 查看已安装的平台模版及版本。
 * **weexpack platform run** - 打包应用并安装到设备运行。


* 插件使用者命令
 * **weexpack plugin add/remove** — 安装／移除 weex 插件。


* 插件开发者命令
 * **weexpack plugin login  - 市场账号登录
 * **weexpack plugin logout  - 市场账号登出
 * **weexpack plugin create** - 生成weex插件模版，主要是配置文件和必需的目录。
 * **weexpack plugin publish** - 发布插件到weex插件市场（npm发布&插件市场同步）。
 * **weexpack plugin sync - 同步插件市场（不会做发布npm，针对npm已发布的包）[--ali] 可选参数


## 安装

### 环境要求

 - 目前支持 Mac、windows、linux平台(windows下仅能打包android)。
 - 配置 [Node.js][1] 环境，并且安装 [npm][2] 包管理器。(`需要node6.0+`)
 - 如果要支持 iOS 平台则需要配置 iOS 开发环境：
     - 安装 [Xcode IDE][3] ，启动一次 Xcode ，使 Xcode 自动安装开发者工具和确认使用协议。
     - 安装 cocoaPods。
 - 如果要支持 Android 平台则需要配置 Android 开发环境：
    - 安装 [Android Studio][4]（推荐）或者 [Android SDK][7]。打开 [AVD Manager][5] ，新建 Android 模拟器并启动 。（如果有安装 [Docker][6] ，请关闭 Docker Server 。）
    - 保证Android build-tool的版本为23.0.2。

#### 安装命令

首先，全局安装 weex-pack 命令：

    $ npm install -g weexpack

或者 在 clone 的 weexpack 根目录下执行

    $ npm install

## 打包及插件使用

打包主要过程如下图所示，其中插件操作是打包过程的可选项，不是必须的。

![weexpack1](https://img.alicdn.com/tps/TB1.bpVPXXXXXarapXXXXXXXXXX-462-310.png)

### 详细步骤

#### 1. 创建 weexpack 工程

    $ weexpack create appName

  生成工程的目录如下：

  ```
    WeexProject
    ├── README.md
    ├── android.config.json
    ├── config.xml
    ├── hooks
    │   └── README.md
    ├── ios.config.json
    ├── package.json
    ├── platforms     // 平台模版目录
    ├── plugins       // 插件下载目录
    │   └── README.md
    ├── src           // 业务代码（we文件）目录
    │   └── index.we
    ├── start
    ├── start.bat
    ├── tools
    │   └── webpack.config.plugin.js
    ├── web
    │   ├── index.html
    │   ├── index.js
    │   └── js
    │       └── init.js
    └── webpack.config.js
  ```

通过 create 命令创建的工程默认不包含 ios 和 android 工程模版，创建完成之后就可以切换到appName目录下并安装依赖。

    $ cd appName && npm install

#### 2. 安装 weex 应用模版

添加应用模版，官方提供的模版默认支持 weex bundle 调试和插件机制，注意模版名称均为小写，模版被安装到platforms目录下。

* android模版

		$ weexpack platform add android

* ios模版

		$ weexpack platform add ios

    <a name="weex-plugin"></a>

android平台，安装后 platforms 目录如下

```
  platforms
   └── android
       ├── LICENSE
       ├── NOTICE
       ├── README.md
       ├── app
       │   ├── build
       │   ├── build.gradle
       │   ├── proguard-rules.pro
       │   └── src
       ├── appframework
       │   ├── build
       │   ├── build.gradle
       │   ├── proguard-rules.pro
       │   └── src
       ├── build
       │   └── generated
       ├── build.gradle
       ├── codeStyleSettings.xml
       ├── gradle
       │   └── wrapper
       ├── gradle.properties
       ├── gradlew
       ├── gradlew.bat
       ├── settings.gradle
       └── weexplugin
           ├── build.gradle
           ├── proguard-rules.pro
           └── src
```

ios平台，安装后 platforms 目录如下

```
  platforms
   └── ios
       ├── LICENSE
       ├── Podfile
       ├── README.md
       ├── WeexDemo
       │   ├── AppDelegate.h
       │   ├── AppDelegate.m
       │   ├── Assets.xcassets
       │   ├── DemoDefine.h
       │   ├── Images.xcassets
       │   ├── WeexConfig
       │   ├── WeexDemo-Info.plist
       │   ├── WeexScanner
       │   ├── config.xml
       │   ├── main.m
       │   └── weex-icon.png
       ├── WeexDemo.xcodeproj
       │   ├── project.pbxproj
       │   ├── project.xcworkspace
       │   ├── xcshareddata
       │   └── xcuserdata
       ├── WeexDemo.xcworkspace
       │   ├── contents.xcworkspacedata
       │   ├── xcshareddata
       │   └── xcuserdata
       ├── WeexDemoTests
       │   ├── Info.plist
       │   └── WeexDemoTests.m
       ├── WeexUITestDemo-Info.plist
       ├── WeexUITestDemoUITests
       │   ├── Info.plist
       │   └── WeexUITestDemoUITests.m
       ├── Weexplugin
       │   ├── Podfile
       │   ├── Weexplugin
       │   ├── Weexplugin.podspec
       │   ├── Weexplugin.xcodeproj
       │   └── WeexpluginTests
       ├── bundlejs

 ```

对于已安装的模版可以使用weexpack platform list命令查看。

* 查看已安装模版

		$ weexpack platform list

    示例结果：


    Installed platforms:
      android
    Available platforms:
      android ^6.2.1


如果想要删除某个不需要的平台可以使用 weexpack platform remove移除，比如window平台用户是不需要ios模版的，可用如下命令移除。


* 移除相应平台模版

		$ weexpack platform remove ios


#### 3. 安装 weex 插件

添加想要使用的插件，支持从本地或者 weex 应用市场安装插件。

* 从本地添加插件，在开发插件时会经常用到

		$ weexpack plugin add plugin-name

* 从插件市场添加插件，例如 weex-action-sheet。

		$ weexpack plugin add weex-action-sheet

* 查看已安装插件

 - 在weex工程中weexpack将插件作为依赖安装到package.json中。你可以在文件的依赖中看到安装过的插件

 - 在iOS工程中weexpack将插件作为依赖安装到Podfile中。你可以在文件的依赖中看到安装过的插件

 - 在android工程中weexpack将插件作为依赖安装到build.gradle中。你可以在文件的依赖中看到安装过的插件


如果想要删除某个不需要的插件可以使用 weexpack plugin remove 移除，比如weex-action-sheet

* 移除插件，例如weex-chart

		$ weexpack plugin remove weex-action-sheet



#### 5. 打包应用并安装运行

完成以上步骤并we代码放在src目录下，就可以打包运行了，打包过程中可能要下载依赖和编译工具，这会是个较为耗时的过程，安装运行需要打开模拟器或者连接设备。

* 打包运行android应用

		$ weexpack run android

  你可以更改项目目录下的android.config.json
    * AppName: 应用名
    * AppId: application_id 包名
    * SplashText: 欢迎页上面的文字
    * WeexBundle: 指定的weex bundle文件（支持文件名和url的形式）

    文件名则以本地文件的方式加载bundle,url则以远程的方式加载bundle
    如果以本地方式指定bundle  .we文件请放到src目录。

* 打包运行ios应用
  * 模拟器运行

		$ weexpack run ios

  * 构建ipa包

		$ weexpack build ios

  构建包的过程中，将会提示让您输入`CodeSign（证书）`，`Profile(provisioning profile)`,`AppId`，只有输入真实的这些信息才能成功打包。
  其余如AppName,和入口weex bundle文件可以编辑项目目录下的ios.config.json配置。
  打完包成功之后，可以在/playground/build/ipa_build/目录下获取ipa文件

  **注：证书需要预先安装到keychain中，在keychain中点击右键获取证书id（证书名称），provisioning profile文件（*mobileprovision）需要获取UUID，进入[目录](https://github.com/weexteam/weex-pack/tree/dev/generator/platforms/templates) 可以看到mobileprovision_UUID.sh文件，此文件可以获取到UUID**

  mobileprovision_UUID.sh用法如下：
  `$  ./mobileprovision_UUID.sh   \*mobileprovision`
  参数（\*mobileprovision）为provisioning profile文件路径




* 打包html5平台：

     $ weexpack build web

  这样你可以把打包后的资源上传到cdn服务器，然后上线你的web项目。

* 在 html5 平台运行：

     $ weexpack run web


## 插件开发文档

如果想扩展weex功能，你可以使用weexpack 命令快速创建一个weex工程。


     $ weexpack plugin create weex-plguin-demo

工程目录如下


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
           ├── start(weex编译命令)
      ├── ****.podspec(ios发布文件)
      ├── start(native端weex编译命令)
      ├── start-web(浏览器端weex编译命令)
      ├── package.json(js发布文件)
      ├── README.md


生成工程中为你准备好了ios、android、js的插件模块的实现的例子和demo。同时也为你准备好了example，这些example经过编译之后,

    $ ./start

可以在playground下的各端的个demo工程运行调试。详细的开发过程可以参考下以文档：


+ [使用weexpack开发插件](./doc/plugin-devloping-weexpack.md)

+ [开发html5的插件教程](./doc/plugin-devloping-web.md)




## 插件发布

对于插件开发者来说，也有一组用于创建和发布插件的命令，[前往](./README_plugin.md) 查看详细文档

![weexpack2](https://img.alicdn.com/tps/TB18hxjPXXXXXXgapXXXXXXXXXX-248-258.png)


## 示例
[使用Weexpack打包出一个Weex版的 《One App》](https://github.com/weexteam/weex-pack/wiki/Create-Weex-One-App-with-Weexpack)



## changelog

0.4.0
* 重构插件weex插件开发和安装机制，详细参考 [使用weexpack开发插件](./doc/plugin-devloping-weexpack.md)



0.3.13
* 修复创建ali内部源问题


0.3.12
* 修复merge问题
* 更新发测试用例
* 修复插件发布的命名空间问题

0.3.11
* 修复安装插件时，ios平台ali内部出错问题
* plugin remove 命令增加成功提示

0.3.10
* 实现weexpack plugin link dir 命令， 可以在demo中安装本地正在开发的插件。用于测试
* 支持创建使用ali内部源的ios容器
  - weexpack weexplugin create ios -a

0.3.9
* 支持单独创建插件容器命令
  - weexpack weexplugin create ios 创建iOS插件容器
  - weexpack weexplugin create android 创建android插件容器

0.3.8
* 添加命令选项 weexpack platform add ios -a , 创建支持内部源的iOS平台

0.2.5
* 修复weexpack build android在windows下的bug

0.2.4
* 修复weexpack run web的bug 并且加了自动打开浏览器的功能

0.2.3
* suppress adb reverse error(android 5.0- will cause error)

0.2.2
* 更换copy库 之前用的库还是存在windows的兼容问题，被坑了。

0.2.1
* 修复windows平台的bug 重新用bat重写了start脚本
* 修复了错误把build文件夹ignore的问题。

0.2.0
* 优化操作流程，去掉了以前会重复出现的server窗口
* 修复个别打包失败的错误 增强稳定性
* 消除ios-deploy的依赖，只在ios打包时再动态安装ios-deploy
* 修复了EI Capitan系统下安装失败的问题
* 支持windows，不再依赖ios相关的环境
* 以WeexOne作为测试用例


  [1]: https://nodejs.org/
  [2]: https://www.npmjs.com/
  [3]: https://itunes.apple.com/us/app/xcode/id497799835?mt=12
  [4]: https://developer.android.com/studio/install.html
  [5]: https://developer.android.com/studio/run/managing-avds.html
  [6]: https://www.docker.com/
  [7]: https://developer.android.com/studio/releases/sdk-tools.html
  [8]: https://developer.android.com/studio/run/managing-avds.html



