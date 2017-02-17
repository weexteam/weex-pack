# 从零开始开发weex plugin(web篇)

在weex中，组件(component ), api或者loader都可以扩展，使用weexpack工具可以帮助你快速构建第三方插件。下面主要介绍下我们如何开发一个web端的插件，让weex扩展的功能能够在浏览器进行支持。

### 快速开始

我们可以使用weexpack plugin create weex-plugin-your_plugin_name 去自动创建一个插件模版。

然后我们进入我们的web目录。初始化我们项目`npm init`。需要指定我们的入口文件，比如默认的`index.js`。如果我们是支持vue的组件，我们也可以简历对应的.vue文件然后在package.json中修改对应的入口即好。

### 支持vue的写法

#### 创建一个模块
首先我们可以输入命令创建一个插件模版

``` bash
weexpack plugin create weex-confirm 
```

weex最新的版本支持vue的语法，如果我们是用vue来进行weex项目的开发，我们可以这样开始一个模块的写法:

``` js
const confirm = {  
  ask (msg, callbackId) {
    if(window.confirm(msg)) {
      this.sender.performCallback(callbackId)
    }
  }
  //... other methods
}

weex.registerModule('confirm', confirm);

```
而在我们的.vue中使用注册的模块，只需要这样写:

``` js

<template>
 ...
</template>
<script>
  const confirm = weex.requireModule('confirm');
  export default {
    methods: {
      clickHandle() {
        confirm.ask('test',funcion() {
          // ...
        })
      }
    }
  }
</script>
```

#### 创建一个组件

weex在web端的渲染现在交给了vue，因此写法上vue一致，你可以前往[官方文档](https://cn.vuejs.org/v2/guide/components.html)里查看如何进行组件的开发。

我们还是创建一个插件项目

``` bash
weexpack plugin create weex-hello
```

我们创建一个weex-hello.vue在web目录下。
``` js
<template>
  <div class="wh-container">
    <p>Hello {{name}}</p>
  </div>
</template>
<style scoped>
  .wh-container {
    color: red;
  }
</style>
<script>
  export default {
    props: [],
    data () {
      return {}
    }
  }
</script>
```

接下来我们需要**注册组件**，让我们在我们的源文件可以正常使用这些组件。我们需要编辑我们的index.js

``` js
import Vue from 'vue'
import weexHello from 'weex-hello.vue'
// 全局注册 weexHello 组件
Vue.component('weex-hello', weexHello)

```

这个时候你在项目文件中就可以直接这样用了:

``` js
<template>
  <div>
    <weex-hello name="world"></weex-hello>
  </div>
</template>

```

#### 进行测试

我们需要在初始化的一个项目

``` bash
weexpack create hellotest

```

创建完项目目录后，我们需要进入项目，在里面添加这个插件

``` bash
weexpack plugin add ./weex-hello
```

然后编辑项目目录里的/src/index.vue

然后加上我们的`<weex-hello name="world"></weex-hello>`，然后运行命令

``` bash 
weexpack build web 
```
然后你就可以预览我们的文件查看效果:

``` bash
weexpack run web 
```


### 支持老版本.we的写法

#### 创建一个模块

使用老版本的weex添加一个api模块的写法与新版有些不一致(下面会有个语法对比)。比如你可以创建一个user模块，并给他添加一些诸如`login`,`logout`等接口。开发者引入你的模块只需要


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

#### 创建一个组件

同理我们使用`weexpack plugin create weex-hello`命令创建一个插件开发项目。

接下来，我们可以在目录下建立 index.js,简单说下index.js基本内容。

+ 我们需要继承Weex.Component ,然后覆盖一些方法。
+ 我们需要使用 `Weex.registerComponent`注册该组件
+ 导出init的方法，用于组件的安装。


``` javascript
const proto = {
  create() {
    const node = document.createElement('div');
    node.append(documen.createTextNode('hello' + this.name))
    return node;
  },
};
// 设置 标签属性 
const attr = {
  name(val) {
    
  }
}
// 设置样式
const style = {
  // ...
}

// 设置事件响应
const event = {
  
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

你还可以去[源码](https://github.com/alibaba/weex/blob/dev/html5/render/browser/dom/componentManager.js)查看更多的方法。

使用组件流程和前面写的一致，程序会自动执行`weex.install`的流程，然后将插件打包js的内容里面。



### weex 与 vue 插件开发的语法差异

<table width="100%">
  <thead>
    <tr>
      <th>功能</th>
      <th>vue</th>
      <th>week</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>注册组件</td>
      <td>Vue.component('weex-hello', Hello)</td>
      <td>Weex.registerComponent('weex-hello', Hello)</td>
   </tr>
   <tr>
      <td>注册模块</td >
      <td>weex.registerModule('confirm, confirm)</td>
      <td>Weex.registerApiModule('confirm', confirm, meta)</td>
   </tr>
   <tr>
      <td>使用模块</td>
      <td>weex. weex.requireModule('confirm)</td>
      <td>var confirm = require('@weex-module/confirm')</td>
   </tr>
  </tbody>
</table>


### 目录参考

我们web目录下实际是一个独立的项目，因此你可以安装依赖并进行构建。如果你vue项目使用了其他的辅助依赖，比如你用sass或者依赖了其他类库，建议你自己本地进行构建，暴漏给外面构建好的资源。因为weexpack 本身的build 命令只支持对weex项目进行打包。参考的目录:

```
- web/
   index.js
   vue/
   lib/
   we/
webpack.config.js
```

项目可以通过webpack命令进行内容的打包，前端也可以自行扩展。



### 参考DEMO

+ [weex-action-sheet](https://github.com/weex-plugins/weex-action-sheet)

+ [weex-amap](https://github.com/weex-plugins/weex-amap)


### 扩展阅读

[Andoird开发教程](https://weex-project.io/doc/advanced/extend-to-android.html) 

[iOS](https://weex-project.io/doc/advanced/extend-to-ios.html)

[WEEX English Doc](https://weex-project.io/doc/advanced/extend-to-html5.html)