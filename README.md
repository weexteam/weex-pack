[![GitHub release](https://img.shields.io/github/release/weexteam/weex-pack.svg)](https://github.com/weexteam/weex-pack/releases)  [![GitHub issues](https://img.shields.io/github/issues/weexteam/weex-pack.svg)](https://github.com/weexteam/weex-pack/issues)
# Weex 工程开发套件

[English Version](./README.en.md)

### weexpack 介绍
weexpack 是 weex 新一代的工程开发套件。它允许开发者通过简单的命令，创建 weex 工程项目，将项目运行在不同的开发平台上。

### 前期环境要求

 - 目前支持 Mac、windows、linux平台(windows下仅能打包android)。
 - 配置 [Node.js][1] 环境，并且安装 [npm][2] 包管理器。(`需要node6.0+`)
 - 配置 iOS 开发环境：
     - 安装 [Xcode IDE][3] ，启动一次 Xcode ，使 Xcode 自动安装开发者工具和确认使用协议。
     - 安装 cocoaPods
 - 配置 Android 开发环境：
    - 安装 [Android Studio][4] 并打开，新建项目。上方菜单栏，打开 [AVD Manager][5] ，新建 Android 模拟器并启动 。（如果有安装 [Docker][6] ，请关闭 Docker Server 。）
    - 或者 只下载 [Android SDK][7] ， 命令行运行 [AVD Manager][8] ，新建 Android 模拟器并启动。
    - 保证Android build-tool的版本为23.0.2

### 使用方法

首先，全局安装 weex-pack 命令：

    $ npm install -g weexpack

然后，创建 weex 工程：

    $ weexpack init appName

weexpack 会自动新建以 appName 命名的目录，并将项目模板拉取到该目录。

最终形成的目录结构，如下所示：

    -> /appName
    .
    |—— .gitignore
    |—— README.md
    |—— package.json
    |-- android.config.json
    |-- ios.config.json
    |—— webpack.config.js
    |—— /src
    |     |—— index.we
    |—— /html5
    |     |—— index.html
    |—— /ios
    |     |—— /playground
    |     |—— /sdk
    |     |—— /WXDevtool
    |—— /android
    |     |—— /playground
    |     |—— /appframework

紧接着，进入目录，并且安装依赖：

    $ cd appName && npm install

## IOS平台打包&运行

#### 模拟器运行
    $ weexpack run ios
#### 构建ipa包
    $ weexpack build ios

构建包的过程中，将会提示让您输入`CodeSign（证书）`，`Profile(provisioning profile)`,`AppId`，只有输入真实的这些信息才能成功打包。
其余如AppName,和入口weex bundle文件可以编辑项目目录下的ios.config.json配置。
打完包成功之后，可以在/playground/build/ipa_build/目录下获取ipa文件

**注：证书需要预先安装到keychain中，在keychain中点击右键获取证书id（证书名称），provisioning profile文件（*mobileprovision）需要获取UUID，进入[目录](https://github.com/weexteam/weex-pack/tree/master/generator/ios) 可以看到mobileprovision_UUID.sh文件，此文件可以获取到UUID**

mobileprovision_UUID.sh用法如下：
$  ./mobileprovision_UUID.sh   \*mobileprovision,参数（\*mobileprovision）为provisioning profile文件路径

## Android平台打包&运行
android的打包和构建是一体的 ：

    $ weexpack run android

同样的你可以更改项目目录下的android.config.json

* AppName: 应用名
* AppId: application_id 包名
* SplashText: 欢迎页上面的文字
* WeexBundle: 指定的weex bundle文件（支持文件名和url的形式）


文件名则以本地文件的方式加载bundle,url则以远程的方式加载bundle
如果以本地方式指定bundle  .we文件请放到src目录。


## 在 html5 平台上，运行项目：

    $ weexpack run web

## 示例
[使用Weexpack打包出一个Weex版的 《One App》](https://github.com/weexteam/weex-pack/wiki/Create-Weex-One-App-with-Weexpack)


## changelog

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



