## 开发Weex的ios端插件

### 开发

1. 进入通过`weex plugin create`命令创建的工程目录下的`ios`工程路径用如下命令更新 cocoapods，初始化 ios 工程
```
$ pod update
```

2. 按照 [Extend to iOS](https://weex.apache.org/references/advanced/extend-to-ios.html) 完成插件开发

3. 在代码中添加插件注册信息

```
// 注册 Component
WX_PlUGIN_EXPORT_COMPONENT(test, WPTestModule)
// 注册 Module
WX_PlUGIN_EXPORT_MODULE(test, WPTestComponent)
// 注册 Handler
WX_PlUGIN_EXPORT_HANDLER(WPTestHandler, WXImgLoaderProtocol)
```

### 测试

插件开发完成请在 playground/ios 测试

1. 初始化测试工程
```
$ pod update
```

2. 检验测试结果，demo 运行起来后，会在控制台输入如下信息：

```
2017-03-24 16:54:52.934 WeexDemo[88059:2693902] WPTestComponent register
2017-03-24 16:54:52.936 WeexDemo[88059:2693902] WXImgLoaderProtocol register
2017-03-24 16:54:52.937 WeexDemo[88059:2693902] WPTestModule register
```
