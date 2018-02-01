## How to devloping ios plugin

### Develop

1. Go to the `ios` project path under the project directory created by the `weexend plugin create` command. Update the cocoapods with the following commands to initialize the ios project

```
$ pod update
```

2. Follow [Extend to iOS](https://weex.apache.org/references/advanced/extend-to-ios.html) to complete plug-in development.

3. Add plug-in registration information in the code:
```
// Register Component
WX_PlUGIN_EXPORT_COMPONENT(test, WPTestModule)
// Register Module
WX_PlUGIN_EXPORT_MODULE(test, WPTestComponent)
// Register Handler
WX_PlUGIN_EXPORT_HANDLER(WPTestHandler, WXImgLoaderProtocol)
```

### Test 

After finished the plugin development, you can test on `playground/ios`.

1. Initialize the test project
```
$ pod update
```

2. Verify the test results, after the demo run up, following information should be output on the console:
```
2017-03-24 16:54:52.934 WeexDemo[88059:2693902] WPTestComponent register
2017-03-24 16:54:52.936 WeexDemo[88059:2693902] WXImgLoaderProtocol register
2017-03-24 16:54:52.937 WeexDemo[88059:2693902] WPTestModule register
```

Also you can use [Dotwe](http://dotwe.org/vue/) to wrote some vue script to test on your `playground app`.