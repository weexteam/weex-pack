## Changelog

### 1.1.6
* 添加对'pod'脚本缺失时的代码提示。
* 添加 'iosBuildPath' 选项用于配置用户自定义Xcode的编译路径。

### 1.1.1
* 修复 `cfg is not defined` 报错.
* 修复 `weex run web` 功能.

### 1.1.0
* `weex create` 命令支持远程模板，可以通过 `weex create <template> [projectname]` 的方式从远程创建模板，如 `weex create weex-templates/webpack my-project`, 同时可以通过使用`--offline`选项使用本地缓存过的模板。
* [How to create your own template](https://github.com/weex-templates/How-to-create-your-own-template/tree/master)

### 1.0.18
* 格式化日志事件为 'hh:mm:ss'。
* 修复使用`weex plugin add/remove`命令时会重复调用 `npm install pluginname` 以及 `npm run build:plugin` 的问题。

### 1.0.17
* 修复issue [weex-pack/issues/284](https://github.com/weexteam/weex-toolkit/issues/284).
* 删除根目录下无用的文件
* 修复`plugin install`命令

### 1.0.16
* 修复issue [weex-pack/issues/284](https://github.com/weexteam/weex-toolkit/issues/284).

### 1.0.15
* 修复issue [weex-pack/issues/222](https://github.com/weexteam/weex-pack/issues/222).
* 新增英文插件开发文档，见 [How to devloping weex plugin](./doc/en/how-to-devloping-weex-plugin.md)

### 1.0.14
* 修复issue [weex-pack/issues/224](https://github.com/weexteam/weex-pack/issues/224).
* 移除对`installIosDeploy.sh`的引用.

### 1.0.13
* 修复模块引入作用域提升问题 [weex-ui/issues/135](https://github.com/alibaba/weex-ui/issues/135).

### 1.0.12
* 修复大小写敏感系统（如Ubuntu，linux）下`gituser.js`模块找不到的问题[weexteam/weex-toolkit/issues/252](https://github.com/weexteam/weex-toolkit/issues/252)

### 1.0.11
* 更新`weexpack-create`依赖版本至0.2.16. [weexpack-create/commit/6a3427](https://github.com/weexteam/weexpack-create/commit/6a3427c7e91e6837350165f3ef277f08971ffe0c)
支持多页面模式开发，仅需在`src`中增加`.vue`文件,同时在url中指明`?page=xxx.js`即可预览`xxx.vue`文件的页面。

### 1.0.10
* 更新`weexpack-create`依赖版本至0.2.15. [weexpack-create/commit/acec5d91](https://github.com/weexteam/weexpack-create/commit/acec5d917a031390dce5f4993a0d4c8ff86e6143)

### 1.0.9
* 修复 `src/utils` 中的 `logger` undefined 的问题. [weex-toolkit/issues/254](https://github.com/weexteam/weex-toolkit/issues/254)

### 1.0.8
* 移除部分代码对`weexpack-common`依赖，方便后续精简包大小。
* 更新`weexpack-create`依赖，修改preview页面的url参数 [weex-toolkit/issues/250](https://github.com/weexteam/weex-toolkit/issues/250)

### 1.0.7
* 修复babel编译问题，将`json`文件转换为`js`文件形式引用，修复文件丢失问题。[weex-toolkit/issues/249](https://github.com/weexteam/weex-toolkit/issues/249)

### 1.0.6
* issues修复 [weex-toolkit/issues/249](https://github.com/weexteam/weex-toolkit/issues/249)

### 1.0.3
* issues修复 [weex-toolkit/issues/249](https://github.com/weexteam/weex-toolkit/issues/249)

### 1.0.2
* 修复文件丢失问题

### 1.0.1
* 修复babel脚本编译问题，支持 node 6+ 设备

### 1.0.0
* 全新的插件开发以及集成机制,详情参考 [如何开发weex插件](./doc/plugin-devloping-weexpack.md)
* 全新的 `weex` 模板项目，支持前端热更新、测试、开发、打包、构建一体化流程
* 更加精简的 playground 模板，支持代码修改的实施同步功能，修改代码立即可在客户端中查看效果
* 移除cordova依赖，重构代码以及移除冗余的逻辑
* 修复 `weex run` 以及 `weex build` 功能同时优化用户提示

### 0.4.7
* 重构部分代码，修复功能为主

### 0.4.0
* 重构插件weex插件开发和安装机制,详情参考 [如何开发weex插件](./doc/plugin-devloping-weexpack.md)

### 0.3.13
* 修复创建ali内部源问题


### 0.3.12
* 修复merge问题
* 更新发测试用例
* 修复插件发布的命名空间问题

### 0.3.11
* 修复安装插件时，ios平台ali内部出错问题
* plugin remove 命令增加成功提示

### 0.3.10
* 实现weexpack plugin link dir 命令， 可以在demo中安装本地正在开发的插件。用于测试
* 支持创建使用ali内部源的ios容器
  - weexpack weexplugin create ios -a

### 0.3.9
* 支持单独创建插件容器命令
  - weexpack weexplugin create ios 创建iOS插件容器
  - weexpack weexplugin create android 创建android插件容器

### 0.3.8
* 添加命令选项 weexpack platform add ios -a , 创建支持内部源的iOS平台

### 0.2.5
* 修复weexpack build android在windows下的bug

### 0.2.4
* 修复weexpack run web的bug 并且加了自动打开浏览器的功能

### 0.2.3
* suppress adb reverse error(android 5.0- will cause error)

### 0.2.2
* 更换copy库 之前用的库还是存在windows的兼容问题，被坑了。

### 0.2.1
* 修复windows平台的bug 重新用bat重写了start脚本
* 修复了错误把build文件夹ignore的问题。

### 0.2.0
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


