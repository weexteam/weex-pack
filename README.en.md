# Weex Engineering Development Kit

[中文版文档](./README.md)
|
[How to devloping weex plugin](./doc/en/how-to-devloping-weex-plugin.md)
|
[Changelog](./CHANGELOG.en.md)

## Weexpack introduction
Weexpack is our next generation of engineering development kits, it helps to setup weex application from scratch quickly. With simple commands, developers could create a weex project, add different platform template, could install plugins from local, GitHub or weex market, could pack up his application project and run on mobile. For those who would like to share his own plugins, he could publish them to the weex market.


[weex-toolkit](https://github.com/weexteam/weex-toolkit) ([Installing Guide](https://github.com/weexteam/weex-toolkit)) integrates the weexpack commands，you can run weex-toolkit commands to call weexpack functions。For example, we add an iOS app template：

``` bash
# use weexpack
$ weexpack platform add ios

# use weex-toolkit
$ weex platform add  ios

```

Add a weex-plugin-lottie plugin

``` bash
# use weexpack
$ weexpack plugin add weex-plugin-lottie

# use weex-toolkit
$ weex plugin add  weex-plugin-lottie

```

### Usage

See [weex-toolkit](https://github.com/weexteam/weex-toolkit#commands)