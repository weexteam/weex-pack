# weexpack

![image | left](https://img.shields.io/badge/PRs-welcome-brightgreen.svg "")
![image | left](https://img.shields.io/badge/license-Apache--2.0-brightgreen.svg "")
[![GitHub release](https://img.shields.io/github/release/weexteam/weex-pack.svg)](https://github.com/weexteam/weex-pack/releases)  [![GitHub issues](https://img.shields.io/github/issues/weexteam/weex-pack.svg)](https://github.com/weexteam/weex-pack/issues)
![Node Version](https://img.shields.io/node/v/weex-pack.svg "Node Version")
[![Build Status](https://travis-ci.org/weexteam/weex-pack.svg?branch=master)](https://travis-ci.org/weexteam/weex-pack)

[中文版文档](./README.zh.md)
|
[How to devloping weex plugin](./doc/en/how-to-devloping-weex-plugin.md)
|
[Changelog](./CHANGELOG.en.md)

## Usage

Currently, [weex-toolkit] (https://github.com/weexteam/weex-toolkit) integrates with the weexpack command invocation support. We recommend using weex-toolkit to use the functionality in weexpack. See [weex-toolkit] (https://github.com/weexteam/weex-toolkit#commands)

### Create

```bash
# create a new project with an official template
$ weex create my-project

# create a new project straight from a github template
$ weex create username/repo my-project
```

### Platform

``` bash
$ weex platform [add|remove|update] [ios|android]

```
### Run

``` bash
$ weex run [web|ios|android]
```

### Build
``` bash
$ weex build [web|ios|android]
```

### Plugin

```
$ weex plugin add  weex-plugin-lottie
```

Plugin resources（PR welcome）：
- [Natjs](https://github.com/natjs/nat)
- [wee-plugin-lottie](https://github.com/acton393/WeexLottie)

## License

[MIT](./LICENSE).
