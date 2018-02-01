## How to devloping weex plugin

> ** NOTE: ** All component development is based on a template project created by `weex-toolkit`.

### Environment

```
$ npm install weex-toolkit -g 
```
If you have any problem while install the `weex-toolkit`, you can see the FAQ or issues here
[1] [weex-toolkit FAQ](https://github.com/weexteam/weex-toolkit/blob/master/README.md#faq)
[2] [issues](https://github.com/weexteam/weex-toolkit/issues)

### Create your own plugin project

You can run `weex plugin create` to create a plugin project

```
$ weex plugin create weex-plugin-lottie
```

The resulting file structure is as follows:

```
 ├── android  (Plugin folder for Android)
 │    ├── library  (Module folder for Android plugin，should be include into the examples)
 ├── ios  (Plugin folder for iOS)
 ├── js  (Plugin folder for Web)
 ├── playground  (A playground demo)
 │    ├── android  (Android demo, default include the plugin module)
 │    ├── ios  (iOS demo, default include the plugin module)
 │    ├── browser  (Browser demo, default include the plugin module)
 ├── examples  (Written by vue examples)
 ├── ****.podspec  (Pod pulish file)
 ├── start  (Command to start develop)
 ├── package.json  (npm pulish file, need to be config before publish)
 ├── README.md
```
After the project is created, you can run the `npm install` installation project dependency in the` weex-plugin-lottie` project.

### Develop

[How to devloping web plugin](./how-to-devloping-web-plugin.md)
|
[How to devloping android plugin](./how-to-devloping-android-plugin.md)
|
[How to devloping ios plugin](./how-to-devloping-ios-plugin.md)

### Publish

#### Base on the npm／pod/ maven

Step1: Release `ios/android` plug-in package to pod and maven warehouse

Cocopod release reference
  [1] [Specs and the Specs Repo](https://guides.cocoapods.org/making/specs-and-specs-repo.html)
  [2] [Getting setup with Trunk](https://guides.cocoapods.org/making/getting-setup-with-trunk.html)

Maven release reference
 [1] [How to publishing maven artifacts](http://www.apache.org/dev/publishing-maven-artifacts.html)
 [2] [Guide to uploading artifacts to the Central Repository](https://maven.apache.org/guides/mini/guide-central-repository-upload.html)

 Step1: Configuration `package.json` file as follows before release npm package:
 ```
{
  "name": "weex-plugin-lottie",
  "version": "0.0.1",
  ...
  "web":{
    "name":"weex-plugin-lottie",
    "version":"0.1.0" // optional
  },
  "android": {
    "groupId": "org.weex.plugin",
    "name": "weex-plugin-lottie",
    "version": "0.0.1",
    // or
    "dependency": "org.weex.plugin:weex-plugin-lottie:0.0.1"
  },
  "ios": {
    "name": "weex-plugin-lottie",
    "version": "0.0.1"
  }
  ...
}
```
> Tips: the useless comment need to be removed.

#### Base on Weex Market

processing...

### How to use plugin

```
$ weex plugin add weex-plugin-lottie
```