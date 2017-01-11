# 插件发布

通过weexpack体系下命令可以方便开发者创建插件发布模板，配置完成模板之后即可发布，详细介绍如下。


**以下通过weex-test举例说明**
## 插件创建

通过如下命令创建发布模板

weexpack plugin create

举例：`weexpack plugin create weex-test`

目录结构


	├── LICENSE
	├── README.md
	├── RELEASENOTES.md
	├── android
	├── ios
	├── js
	├── package.json
	├── plugin.xml
	└── web

* 各自平台目录

	android/ios/js/web目录放置对应平台的源码，开发者把开发完成的weex插件，copy源码到对应目录即可


* plugin.xml文件配置

	plugin.xml定义了插件的详细配置与依赖

	**plugin**

	Attributes | Description
	----|-----
	id(string) |   即将发布的插件标识，用于插件安装时使用
	version(string) | 即将发布的插件版本号
	name(string) | 即将发布的插件名字，默认与id一致
	description(string) | 即将发布的插件描述

	举例:

	```
	<plugin xmlns="http://www.w3.org/ns/widgets"
    id="weex-test"
    version="0.1.0">
    <name>weex-test</name>
    <description></description>
	```

	**dependency**

	Attributes | Description
	----|-----
	id(string) |   依赖的插件标识，用于插件安装时使用
	url(string) | 依赖的插件git地址
	version(string) | 依赖的插件版本号，默认获取最新版本

	举例：

	```
	<dependency id="weex-gcanvas" version="^0.1.0" />
	```

	**platform**

	Attributes | Description
	----|-----
	name(string) |   平台名称

	举例:

	```
	<platform name="ios">
  		<!-- ios-specific elements -->
	</platform>

	<platform name="android">
  		<!-- android-specific elements -->
	</platform>
	```

	**source-file**

	Attributes | Description
	----|-----
	src(string) |   源码实现文件的路径

	举例：

	```
	<!-- android -->
	<source-file src=“a/b/c/Test.java” target-dir=“src/a/b/c/Test.java” />
	<!-- ios -->
	<source-file src="ios/WXTest.m" />
	```

	**header-file(ios only)**

	Attributes | Description
	----|-----
	src(string) |   源码头文件的路径

	举例：

	```
	<!-- ios -->
	<header-file src="ios/WXTest.h" />
	```

	**framework**

	Attributes | Description
	----|-----
	src(string) |   插件依赖的系统framework，如果custom为ture，value是framework路径
	custom(boolean) | 标识引用的framework是否是第三方库
	type(string) | 标识framework的来源

	举例：

    ```
    <!-- ios -->
    <framework src="Foundation.framework" />
    <framework src="relative/path/to/my.framework" custom="true" />
    <framework src="SDWebImage" type="podspec" spec="" />

    <!-- android -->
    <framework src="com.taobao.android:gcanvas_library_weex:1.1-SNAPSHOT@aar" />

    ```


	**config-file**

	Attributes | Description
	----|-----
	target(string) | 即将要修改的iOS/Android工程配置文件
	parent(string) | 指定在哪个父节点插入内容。指定工程配置文件的父元素，会在指定的父元素下添加config-file下所有的内容，可以使用通配符/*，标识在根元素下插入。如果target是Plist文件，指定在Plsit文件中哪个节点下插入内容，授权文件都添加在plist文件。

	举例：

	```
	<!-- ios -->
	<config-file target="config.xml" parent="/*">
    </config-file>
    <config-file target="*-Info.plist" parent="NSCameraUsageDescription">
	</config-file>

	<!-- android -->
	<config-file target="config.xml" parent="/*">
	</config-file>
	```

	**feature**

	Attributes | Description
	----|-----
	name(string) | 添加到工程配置文件的插件名称

	* param

		 param描述WeexSDK注册插件的信息

		Attributes | Description
		----|-----
		name(string) | category为注册的插件类别（module/component/handle）；ios-package为WeexSDK待注册的类名称；api为js业务调用的组件名称
		value(string) | name为category时，iOS分为三类（module/component/handle）；name为ios-packag时，值为weexSDK待注册的类名称；name为api时，值为js业务调用的组件名称


    举例：
    ```
    <!-- ios -->
    <config-file target="WeexpluginConfig.xml" parent="/*">
      <feature name="WXTestModule">
        <param name="category" value="module" />
        <param name="ios-package" value="WXTestModule" />
        <param name="api" value="test" />
      </feature>
    </config-file>

    <!-- android -->
    <config-file target="config.xml" parent="/*">
      <feature name="WXTestModule">
        <param name="category" value="module" />
        <param name="android-package" value="com.taobao.weex.ui.module.WXTestModule" />
        <param name="api" value="test" />
      </feature>
    </config-file>
    ```


	**preference(iOS only)**

	preference字段可以为其他标签定义变量，其他所有标签都可直接使用此变量

	Attributes | Description
	----|-----
	name(string) | 变量名称
	default(string)	| 默认值,可为空

	举例：

	```
	<preference name="CAMERA_USAGE_DESCRIPTION" default=" " />
    <config-file target="*-Info.plist" parent="NSCameraUsageDescription">		<string>$CAMERA_USAGE_DESCRIPTION</string>
	</config-file>
	```

* [html5插件开发文档](./doc/plugin-devloping-web.md)


## 插件发布

weexpack plugin publish

举例：cd到`weex-test`目录下执行`weexpack plugin publish`即可发布。

## 官方示例
[weex-plugins](https://github.com/weexteam/weex-plugins)是weex官方维护的插件仓库，开发者可以参考实现, 也欢迎大家提交commit。
