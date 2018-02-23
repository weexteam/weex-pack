[![GitHub release](https://img.shields.io/github/release/weexteam/weex-pack.svg)](https://github.com/weexteam/weex-pack/releases)  [![GitHub issues](https://img.shields.io/github/issues/weexteam/weex-pack.svg)](https://github.com/weexteam/weex-pack/issues)
![Node Version](https://img.shields.io/node/v/weex-pack.svg "Node Version")
[![Build Status](https://travis-ci.org/weexteam/weex-pack.svg?branch=master)](https://travis-ci.org/weexteam/weex-pack)
# Weex 工程开发套件

[English Document](./README.en.md)
|
[如何开发Weex插件](./doc/cn/how-to-devloping-weex-plugin.md)
|
[更新日志](./CHANGELOG.md)


目前[weex-toolkit](https://github.com/weexteam/weex-toolkit)集成对weexpack的命令调用支持，你可以使用weex-toolkit命令来实现weexpack具备的功能。如：
``` bash
# 使用weexpack 命令
$ weexpack platform add ios

# 使用weex-toolkit
$ weex platform add  ios

```

又或者添加 weex-plugin-lottie插件

``` bash
# 使用weexpack 命令
$ weexpack plugin add weex-plugin-lottie

# 使用weex-toolkit
$ weex plugin add  weex-plugin-lottie

```

## 如何使用

我们推荐你使用weex-toolkit来使用weexpack中的功能, 文档见 [weex-toolkit](https://github.com/weexteam/weex-toolkit#commands)