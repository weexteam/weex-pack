# Weex 工程开发套件
***
### weex-pack 介绍
weex-pack 是 weex 新一代的工程开发套件。它允许开发者通过简单的命令，创建 weex 工程项目，将项目运行在不同的开发平台上。

### 使用方法

首先，全局安装 weex-pack 命令：

    $ npm install -g weex-pack

然后，创建 weex 工程：

    $ weex-pack init appName

weex-pack 会自动新建以 appName 命名的目录，并将项目模板拉取到该目录。

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
    |     |—— config.ios.js
    |     |—— /playground
    |     |—— /sdk
    |     |—— /WXDevtool
    |     |—— /resources
    |—— /android
    |     |—— config.android.js
    |     |—— /playground
    |     |—— /commons
    |     |—— /inspector
    |     |—— /resources
    
紧接着，进入目录，并且安装依赖：

    $ cd appName && npm install

在 ios 平台上，运行项目：

    $ weex-pack run ios
    
在 android 平台上，运行项目：

    $ weex-pack run android

在 html5 平台上，运行项目：

    $ weex-pack run html5
    
对于有打包发布的需求的开发者，可以直接基于 playground 工程进行修改。后续，weex-pack 将会进一步加入打包、测试等功能。
