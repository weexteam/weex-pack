# weexpack

![image | left](https://img.shields.io/badge/PRs-welcome-brightgreen.svg "")
![image | left](https://img.shields.io/badge/license-Apache--2.0-brightgreen.svg "")
[![GitHub release](https://img.shields.io/github/release/weexteam/weex-pack.svg)](https://github.com/weexteam/weex-pack/releases)  [![GitHub issues](https://img.shields.io/github/issues/weexteam/weex-pack.svg)](https://github.com/weexteam/weex-pack/issues)
![Node Version](https://img.shields.io/node/v/weex-pack.svg "Node Version")
[![Build Status](https://travis-ci.org/weexteam/weex-pack.svg?branch=master)](https://travis-ci.org/weexteam/weex-pack)

[English Document](./README.en.md)
|
[如何开发Weex插件](./doc/cn/how-to-devloping-weex-plugin.md)
|
[更新日志](./CHANGELOG.md)




## 如何使用

目前[weex-toolkit](https://github.com/weexteam/weex-toolkit)集成对weexpack的命令调用支持，我们推荐你使用weex-toolkit来使用weexpack中的功能, 文档见 [weex-toolkit](https://github.com/weexteam/weex-toolkit#commands)

### 项目初始化

```bash
# 从官方模板中创建项目
$ weex create my-project

# 从github上下载模板到本地
$ weex create username/repo my-project
```

### 平台管理

``` bash
$ weex platform [add|remove|update] [ios|android]

```
### 模拟器或真机预览

``` bash
$ weex run [web|ios|android]
```

### 打包
``` bash
$ weex build [web|ios|android]
```

### 插件管理

```
$ weex plugin add  weex-plugin-lottie
```

支持的插件（欢迎PR更新）：
- [Natjs](https://github.com/natjs/nat)
- [wee-plugin-lottie](https://github.com/acton393/WeexLottie)

## License

[MIT](./LICENSE)
