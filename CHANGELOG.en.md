## Changelog

### 1.1.6
* Add tips on 'pod update' command.
* Add 'iosBuildPath' option to custom Xcode Deviced.

### 1.1.1
* Fixed `cfg is not defined` error.
* Fixed `weex run web` command.

### 1.1.0
* After this version, the `weex create` command can supports remote templates, which can be created remotely from` weex create <template> [projectname] `, such as` weex create weex-templates/webpack my-project` and by using the `--offline` option Use locally cached templates.
* [How to create your own template](https://github.com/weex-templates/How-to-create-your-own-template/tree/master)

### 1.0.18
* Formate log date to 'hh:mm:ss'.
* Fixed bug of call `npm install pluginname` and `npm run build:plugin` repeatedly while using `weex plugin add/remove` command.

### 1.0.17
* Fixed issue [weex-pack/issues/284](https://github.com/weexteam/weex-toolkit/issues/284).
* Remove useless source on the root folder.
* Fixed `plugin install` command.

### 1.0.16
* Fixed issue [weex-pack/issues/284](https://github.com/weexteam/weex-toolkit/issues/284).

### 1.0.15
* Fix issue [weex-pack/issues/222](https://github.com/weexteam/weex-pack/issues/222).
* Add English document about how to devloping weex, see [How to devloping weex plugin](./doc/en/how-to-devloping-weex-plugin.md)

### 1.0.14
* Fix issue [weex-pack/issues/224](https://github.com/weexteam/weex-pack/issues/224).
* Remove `installIosDeploy.sh`.

### 1.0.13
* Fix Hosting error [weex-ui/issues/135](https://github.com/alibaba/weex-ui/issues/135).

### 1.0.12
* Fix `gituser.js` module not found on ubuntu or other linux platform [weexteam/weex-toolkit/issues/252](https://github.com/weexteam/weex-toolkit/issues/252)

### 1.0.11
* Upgrade `weexpack-create` to 0.2.16. [weexpack-create/commit/6a3427](https://github.com/weexteam/weexpack-create/commit/6a3427c7e91e6837350165f3ef277f08971ffe0c)
support muti page develop, you can just add `xxx.vue` in to the `src` folder, and modify the `?page=xxx.js` options on url to the page you want to preview, like `?page=demo.js`.

### 1.0.10
* Upgrade `weexpack-create` to 0.2.15. [weexpack-create/commit/acec5d91](https://github.com/weexteam/weexpack-create/commit/acec5d917a031390dce5f4993a0d4c8ff86e6143)

### 1.0.9
* Fix issue [weex-toolkit/issues/254](https://github.com/weexteam/weex-toolkit/issues/254)

### 1.0.8
* Remove `weexpack-common` dependence.
* Upgrade `weexpack-create` to 0.2.14.[weex-toolkit/issues/250](https://github.com/weexteam/weex-toolkit/issues/250)

### 1.0.7
* 修复babel编译问题，将`json`文件转换为`js`文件形式引用，修复文件丢失问题。[weex-toolkit/issues/249](https://github.com/weexteam/weex-toolkit/issues/249)

### 1.0.6
* Fixed [weex-toolkit/issues/249](https://github.com/weexteam/weex-toolkit/issues/249)

### 1.0.3
* Fixed [weex-toolkit/issues/249](https://github.com/weexteam/weex-toolkit/issues/249)

### 1.0.2
* Fixed file missing bug.

### 1.0.1
* Fix babel compile issue.

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


