## 开发Weex的web端插件

打开通过`weex plugin create`命令生成的模板项目。

### 命令


运行 `npm start` 可运行调试服务器，打开浏览器，访问 http://localhost:12580/ 便可看到插件的演示效果。

运行 `npm run dev:examples:web` 可进入实时编译模式。

运行 `npm run build` 可打包JS文件。

运行 `npm run build:examples:web` 可打包 `example` 中的例子。

### 开发

web端主要分为组件开发与模块开发
- 组件一般用于业务的视图逻辑
- 模块一般用于Native API接口的调用

** 组件开发代码示例：(div组件为例) **
```
const _css = `
body > .weex-div {
  min-height: 100%;
}
`
function getDiv (weex) {
  const {
    extractComponentStyle,
    trimTextVNodes
  } = weex
  return {
    name: 'weex-div',
    render (createElement) {
      return createElement('html:div', {
        attrs: { 'weex-type': 'div' },
        staticClass: 'weex-div weex-ct',
        staticStyle: extractComponentStyle(this)
      }, trimTextVNodes(this.$slots.default))
    },
    _css
  }
}
function init(weex) {
   const div = getDiv(weex)
   weex.registerComponent('div', div)
}
export default {
  init:init
}
```

** 模块开发代码示例：（weexalert为例）**
```
const weexalert = {
  show() {
      weexalert("module WeexPluginDemo is created sucessfully ")
  }
};
const meta = {
   WeexPluginDemo: [{
    name: 'show',
    args: []
  }]
};
function init(weex) {
  weex.registerModule('weexalert', weexalert, meta);
}
export default {
  init:init
}
```

### 测试

运行 `npm start` 可运行调试服务器，打开浏览器，访问 http://localhost:12580/ 便可看到插件的演示效果。