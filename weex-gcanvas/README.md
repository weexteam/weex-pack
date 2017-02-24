# weex-gcanvas



一款支持.we页面中canvas标签的weex插件，支持文字渲染，图片加载，图形绘制等canvas常用操作

### 快速开始

``` bash
weexpack plugin add weex-gcanvas
```
你也可以使用本地插件添加，你可以clone 这个项目，然后存放到你本地目录添加
``` bash
weexpack plugin add ./weex-plugins/weex-plugin-gcanvas
```
编译得到你的ios或android playground app

编辑你的weex源代码demo.we

``` we

<template>
  <div id="test">
    <gcanvas id="canvas_holder" style="width:750;height:750;"></gcanvas>
  </div>
</template>
<script>
  var gcanvas=require('weex-gcanvas');
  
  module.exports = {
    created: function () {      
      console.log('created');     
      gcanvas.disable();
    },
    ready: function () {
      var ref = this._ids.canvas_holder.el.ref;
      gcanvas.start(ref, function(){
        var ctx = gcanvas.getContext('2d');
        
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 100, 100);
        
        ctx.fillStyle = 'black';
        ctx.fillRect(100, 100, 100, 100);
        ctx.fillRect(25, 210, 700, 5);
        
        ctx.arc(450, 200, 100, 0, Math.PI * 2, true);
        ctx.fill();
        
        var img = 'https://img.alicdn.com/tps/TB1TFNdKVXXXXbeaXXXXXXXXXXX-210-330.png';
        ctx.drawImage(img, 100, 200, 210, 330);
        //ctx.drawImage(img, 0,0,105,165, 100, 200, 210, 330);
        ctx.render();
      });
    }
  }
</script>


```

使用weex debug demo.we命令打开调试页面，扫码打开demo.we页面

# 支持的canvas API和属性

| 用途          | 用法         |   名称  | 支持情况  |
| ------------ | :-------------:| :-------:|:----------:|
| 颜色/样式/阴影     | 属性 | fillStyle | 部分支持 |
| 线条样式      | 属性      |  lineCap | 覆盖 |
| 线条样式 | 属性     |    lineJoin | 覆盖 |
| 线条样式 | 属性   |   lineWidth | 覆盖 |
| 线条样式 | 属性   | miterLimit | 覆盖 |
| 矩形 | 方法   | rect() | 覆盖 |
| 矩形 | 方法   | fillRect() | 覆盖 |
| 矩形 | 方法   | strokeRect() | 覆盖 |
| 矩形 | 方法   | clearRect() | 覆盖 |
| 路径 | 方法   | fill() | 覆盖 |
| 路径 | 方法   | stroke() | 覆盖 |
| 路径 | 方法   | beginPath() | 覆盖 |
| 路径 | 方法   | moveTo() | 覆盖 |
| 路径 | 方法   | closePath() | 覆盖 |
| 路径 | 方法   | lineTo() | 覆盖 |
| 路径 | 方法   | clip() | 覆盖 |
| 路径 | 方法   | quadraticCurveTo() | 覆盖 |
| 路径 | 方法   | bezierCurveTo() | 覆盖 |
| 路径 | 方法   | arc() | 覆盖 |
| 路径 | 方法   | arcTo() | 覆盖 |
| 路径 | 方法   | quadraticCurveTo() | 覆盖 |
| 转换 | 方法   | scale() | 覆盖 |
| 转换 | 方法   | rotate() | 覆盖 |
| 转换 | 方法   | translate() | 覆盖 |
| 转换 | 方法   | transform() | 覆盖 |
| 转换 | 方法   | setTransform() | 覆盖 |
| 文本 | 属性   |	font | 覆盖 |
| 文本 | 属性   |	textAlign | 覆盖 |
| 文本 | 属性   |	textBaseline | 覆盖 |
| 文本 | 方法   | fillText() | 覆盖 |
| 文本 | 方法   | strokeText() | 覆盖 |
| 文本 | 方法   | measureText() | 覆盖 |
| 图像绘制 | 方法   |	drawImage() | 覆盖 |
| 图像绘制 | 方法   | createImageData() | 覆盖 |
| 图像绘制 | 方法   | getImageData() | 覆盖 |
| 图像绘制 | 方法   | putImageData() | 覆盖 |
| 合成 | 属性   | globalAlpha | 覆盖 |
| 合成 | 属性   | globalAlpha | 覆盖 |
| 其他 | 方法   |	save() | 覆盖 |
| 其他 | 方法   | restore() | 覆盖 |
| 其他 | 方法   | getContext() | 新增 |
| 其他 | 方法   | loadTexture() | 新增 |
| 其他 | 方法   | unloadTexture() | 新增 |
| 其他 | 方法   | resetTransform() | 新增 |
| 其他 | 方法   | render() | 新增 |
| 其他 | 方法   | capture() | 新增 |
| 其他 | 方法   | resetClip() | 新增 |
| 其他 | 方法   | loadTexture() | 新增 |
| 其他 | 方法   | putImageData() | 覆盖 |

