# 开发web插件


在weex中，组件(component ), api或者loader都是扩展，因此你并不要引入weex的包。

### 如何创建一个组件

我们可以使用weexpack plugin create weex-plugin-your_plugin_name 去自动创建一个插件模版。官方建议我们在进行组件命名的时候使用weex-开头，然后加上具体的名称比如`photo` 。这样的约束也有利于其他开发者快速锁定他需要使用的第三方插件名称。

然后我们进入我们的web目录。初始化我们项目`npm init`。因为我们可能绝大多数开发的项目，将来都有可能开放出去，所以建议我们才开始就准备发到npm上。

接下来，我们可以在目录下建立 index.js,简单说下index.js基本内容。

+ 我们需要继承Weex.Component ,然后覆盖一些方法。
+ 我们需要使用 `Weex.registerComponent`注册该组件
+ 导出init的方法，用于组件的安装。


``` javascript
// 设置 标签属性 
const attr = {
  // ...
}
// 设置样式
const style = {
  // ...
}

// 设置事件响应
const event = {
  // ...
}
// 初始化函数
function init (Weex) {
  const Component = Weex.Component
  const extend = Weex.utils.extend

  // the component's constructor
  function Hello (data) {
    Component.call(this, data)
  }

  // extend the prototype
  Hello.prototype = Object.create(Component.prototype)
  extend(Hello.prototype, proto)

  // config the attributes, styles and events.
  extend(Hello.prototype, { attr })
  extend(Hello.prototype, {
    style: extend(Object.create(Component.prototype.style), style)
  })
  extend(Hello.prototype, { event })

  Weex.registerComponent('weex-hello', Hello)
}

// export the init method.
export default { init }
```
这是写一个扩展组件的基本结构，demo中覆盖了create方法，除此之外，还有其他一些常用的方法可以用:

+ createChildren 创建子节点

+ appendChild 在子节点列表里添加节点的时候

+ removeChild 移除子节点列表

你还可以去[源码](https://github.com/alibaba/weex/tree/dev/html5/browser/extend/components)查看更多的方法。

#### 使用组件

开发完成后，如果我们要使用的话，我们只需要在web端安装组件就行了。

``` javascript 

// import the original weex-html5.
import weex from 'weex-html5'
import polaroidPhoto from 'weex-polaroid-photo-web'
// install the component.
weex.install(polaroidPhoto)
```

然后在.we文件加入这样的标签就可以了。

``` html 
<template>
  <div>
    <weex-polaroid-photo text="hello" src="txt-color:#fff;bg-color:green"
      value="WEEX" onclick="handleClick">
    </weex-polaroid-photo>
  </div>
</template>
```
demo 预览效果如图。


### 添加一个API

你也可以添加一个api模块，你也可以为已经存在的api模块添加新的api.比如你可以创建一个user模块，并给他添加一些诸如`login`,`logout`等接口。开发者引入你的模块只需要

``` javascript
require('@weex-module/moduleName)[methodName](arg1, arg2...)
```

下面的示例将会详细介绍如何创建一个新的API模块

首先创建文件user.js,然后定义login/logout方法。

``` javascript
const user = {
  // for user to login.
  login (callbackId) {
    login.then(res => {
      this.sender.performCallback(callbackId, res)
    }).catch(err => {
      this.sender.performCallback(callbackId, err)
    })
  },

  // for user to logout.
  logout (callbackId) {
    logout.then(res => {
      this.sender.performCallback(callbackId, res)
    }).catch(err => {
      this.sender.performCallback(callbackId, err)
    })
  }
}

// add meta info to user module.
const meta = {
  user: [{
    name: 'login',
    args: ['function']
  }, {
    name: 'logout',
    args: ['function']
  }]
}

export default {
  init (Weex) {
    // Register your new module. The last parameter is your
    // new API module's meta info.
    Weex.registerApiModule('user', user, meta)
  }
}
```

完成之后，这样在你的项目中使用只需要添加下面的代码:

``` javascript
import Weex from 'weex-html5'
import user from 'weex-user-helper'

Weex.install(user)
```

在你的文件中使用如下:

``` javascript
<template>
  <div>
    <div class="btn" onclick="handleClick">
      <text>LOGIN</text>
    </div>
  </div>
</template>

<script>
  var userHelper = require('@weex-module/user')
  module.exports = {
    methods: {
      handleClick: function () {
        userHelper.login(function () {
          // ... do sth. in callback.
        })
      }
    }
  }
</script>
```



### 扩展阅读

[Andoird开发教程](https://weex-project.io/doc/advanced/extend-to-android.html) 

[iOS](https://weex-project.io/doc/advanced/extend-to-ios.html)

[WEEX English Doc](https://weex-project.io/doc/advanced/extend-to-html5.html)