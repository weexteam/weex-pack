# Weex 工程开发套件

[English Version](./README.md)

### weexpack 介绍
weexpack 是 weex 新一代的工程开发套件。它允许开发者通过简单的命令，创建 weex 工程项目，将项目运行在不同的开发平台上。

### 前期环境要求

 - 目前只支持 Mac 平台。
 - 配置 [Node.js][1] 环境，并且安装 [npm][2] 包管理器。
 - 配置 iOS 开发环境：
     - 安装 [Xcode IDE][3] ，启动一次 Xcode ，使 Xcode 自动安装开发者工具和确认使用协议。
 - 配置 Android 开发环境：
    - 安装 [Android Studio][4] 并打开，新建项目。上方菜单栏，打开 [AVD Manager][5] ，新建 Android 模拟器并启动 。（如果有安装 [Docker][6] ，请关闭 Docker Server 。）
    - 或者 只下载 [Android SDK][7] ， 命令行运行 [AVD Manager][8] ，新建 Android 模拟器并启动。

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
    |     |—— /commons
    |     |—— /sdk
    |     |—— /inspector
    |     |—— /weex_debug

紧接着，进入目录，并且安装依赖：

    $ cd appName && npm install

在 ios 平台上，运行项目：

    $ weexpack run ios

在 android 平台上，运行项目：

    $ weexpack run android

在 html5 平台上，运行项目：

    $ weexpack run html5

对于有打包发布的需求的开发者，可以直接基于 playground 工程进行修改。后续，weexpack 将会进一步加入打包、测试等功能。


  [1]: https://nodejs.org/
  [2]: https://www.npmjs.com/
  [3]: https://itunes.apple.com/us/app/xcode/id497799835?mt=12
  [4]: https://developer.android.com/studio/install.html
  [5]: https://developer.android.com/studio/run/managing-avds.html
  [6]: https://www.docker.com/
  [7]: https://developer.android.com/studio/releases/sdk-tools.html
  [8]: https://developer.android.com/studio/run/managing-avds.html
