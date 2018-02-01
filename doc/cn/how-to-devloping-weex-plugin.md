## 如何基于weex开发自己的插件

> **注意：** 所有的组件开发基于由`weex-toolkit`创建出的模板工程进行开发

### 环境准备

```
$ npm install weex-toolkit -g 
```

安装过程中如果遇到问题请访问[weex-toolkit 官方文档](https://github.com/weexteam/weex-toolkit/blob/master/README-zh.md)查找解决方案，或查阅[相关issue](https://github.com/weexteam/weex-toolkit/issues)。

### 创建用例

通过`weex plugin create` 命令创建插件开发工程

```
$ weex plugin create weex-plugin-lottie
```

生成的文件结构如下：
```
 ├── android(Android插件工程目录)
 │    ├── library  (Android插件module目录，已被include到example工程中)
 ├── ios  (iOS插件工程)
 ├── js  (Web插件工程)
 ├── playground  (例子,开发者用来测试问题)
 │    ├── android  (Android demo工程，集成了playground功能并默认引用了插件module)
 │    ├── ios  (iOS demo工程，集成了playground功能并默认引用了插件module)
 │    ├── browser  (Browser demo工程，集成了playground功能并默认引用了插件module)
 ├── examples  (三端使用的共同例子)
 ├── ****.podspec  (ios发布文件)
 ├── start  (weex编译命令)
 ├── package.json  (js发布文件)
 ├── README.md
```
工程创建完成后进入`weex-plugin-lottie`项目中运行`npm install` 安装项目依赖。

### 开发

[如何开发web插件](./how-to-devloping-web-plugin.md)
|
[如何开发android插件](./how-to-devloping-android-plugin.md)
|
[如何开发ios插件](./how-to-devloping-ios-plugin.md)

### 发布

#### 基于 npm／pod/ maven 发布

第一步：发布ios／android开发好的插件包至pod以及maven仓库

cocopod发布参考 
  [1] [Specs and the Specs Repo](https://guides.cocoapods.org/making/specs-and-specs-repo.html)
  [2] [Getting setup with Trunk](https://guides.cocoapods.org/making/getting-setup-with-trunk.html)

maven发布参考
 [1] [How to publishing maven artifacts](http://www.apache.org/dev/publishing-maven-artifacts.html)
 [2] [Guide to uploading artifacts to the Central Repository](https://maven.apache.org/guides/mini/guide-central-repository-upload.html)

第二步：发布npm包前配置`package.json`文件如下：

```
{
  "name": "weex-plugin-lottie",
  "version": "0.0.1",
  ...
  "web":{
    "name":"weex-plugin-lottie",
    "version":"0.1.0" //可选
  },
  "android": {
    "groupId": "org.weex.plugin",
    "name": "weex-plugin-lottie",
    "version": "0.0.1",
    // 或是
    "dependency": "org.weex.plugin:weex-plugin-lottie:0.0.1"
  },
  "ios": {
    "name": "weex-plugin-lottie",
    "version": "0.0.1"
  }
  ...
}
```
配置好对应的`package.json`文件之后便可通过`npm publish`发布仓库至`npm`仓库中供`weex plugin`进行下载。

#### Weex Market发布

目前Weex Market正在重构中，该途径暂时无法使用。

### 集成

```
$ weex plugin add weex-plugin-lottie
```