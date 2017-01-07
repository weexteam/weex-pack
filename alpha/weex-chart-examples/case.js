/**
 * Created by godsong on 16/12/12.
 */

//var Canvas=require('../../../js/core/gcanvas');
var Canvas=require('weex-gcanvas');

//字体渲染测试
exports.case0 = function (GM,context) {


var margin = 30;    
context = Canvas.getContext('2d');


/*
context.font="30px";
context.fillText("1 abc 你好 123 ~!@#$%^&*()_+",20,50);

context.font="30px Arial";
context.fillText("2 abc 你好 123 ~!@#$%^&*()_+",20,50 + margin);

context.font="30px sans-serif";
context.fillText("3 abc 你好 123 ~!@#$%^&*()_+",20,50 + margin*2);
*/

//context.font="30px NotoSansSC";
//context.fillText("4 abc 你好 123 ~!@#$%^&*()_+",20,250);
context.font="30px sans-serif";
context.fillText("font test",20,50 + margin*3);

context.font="30px sans-serif";
context.fillText("5.1 abcdefghijklmn ABCDEFGHIJKLMNOPQRSTUVWXYZ",20,50 + margin*4);

context.font="30px serif";
context.fillText("5.2 abcdefghijklmn ABCDEFGHIJKLMNOPQRSTUVWXYZ",20,50 + margin*5);

context.font="30px SimSun";
context.fillText("你好 阿里巴巴 淘宝 天猫 阿里云 菜鸟",20,50 + margin*6);

context.font="30px Arial";
context.fillText("你好 阿里巴巴 淘宝 天猫 阿里云 菜鸟",20,50 + margin*7);

context.font="30px serif";
context.fillText("5.3 1234567890",20,50 + margin*8);

context.font="30px sans-serif";
context.fillText("5.4 1234567890",20,50 + margin*9);

context.font="30px sans-serif";
context.fillText("5.5 ~!@#$%^&*()_+{}|[]\:\";''<>?,./",20, 50 + margin*10);

context.font="30px serif";
context.fillText("5.6 ~!@#$%^&*()_+{}|[]\:\";''<>?,./",20, 50 + margin*11);

context.render();


};

//点图
exports.case1 = function (GM) {
    GM.Global.pixelRatio = 1;
    var Util = GM.Util;
    var data = [
        {"time": '2016-08-08 00:00:00', "tem": 10},
        {"time": '2016-08-08 00:10:00', "tem": 22},
        {"time": '2016-08-08 00:30:00', "tem": 20},
        {"time": '2016-08-09 00:35:00', "tem": 26},
        {"time": '2016-08-09 01:00:00', "tem": 20},
        {"time": '2016-08-09 01:20:00', "tem": 26},
        {"time": '2016-08-10 01:40:00', "tem": 28},
        {"time": '2016-08-10 02:00:00', "tem": 20},
        {"time": '2016-08-10 02:20:00', "tem": 28}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    var defs = {
        time: {
            type: 'timeCat',
            mask: 'mm/dd',
            tickCount: 3
        },
        tem: {
            tickCount: 5,
            min: 0
        }
    };
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.axis('time', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.source(data, defs);
    chart.point().position('time*tem');
    chart.render();
};

//折线图
exports.case2 = function (GM) {

    GM.Global.pixelRatio = 1;
    var Util = GM.Util;
    var data = [
        {"time": '2016-08-08 00:00:00', "tem": 10},
        {"time": '2016-08-08 00:10:00', "tem": 22},
        {"time": '2016-08-08 00:30:00', "tem": 20},
        {"time": '2016-08-09 00:35:00', "tem": 26},
        {"time": '2016-08-09 01:00:00', "tem": 20},
        {"time": '2016-08-09 01:20:00', "tem": 26},
        {"time": '2016-08-10 01:40:00', "tem": 28},
        {"time": '2016-08-10 02:00:00', "tem": 20},
        {"time": '2016-08-10 02:20:00', "tem": 28}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    var defs = {
        time: {
            type: 'timeCat',
            mask: 'mm/dd',
            tickCount: 3,
            range: [0, 1]
        },
        tem: {
            tickCount: 5,
            min: 0
        }
    };
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.axis('time', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.source(data, defs);
    chart.line().position('time*tem');
    chart.render();

};

//平滑折线图
exports.case3 = function (GM) {

    GM.Global.pixelRatio = 1;
    var Util = GM.Util;
    var data = [
        {"time": '周一', "tem": 10, "city": "beijing"},
        {"time": '周二', "tem": 22, "city": "beijing"},
        {"time": '周三', "tem": 20, "city": "beijing"},
        {"time": '周四', "tem": 26, "city": "beijing"},
        {"time": '周五', "tem": 20, "city": "beijing"},
        {"time": '周六', "tem": 26, "city": "beijing"},
        {"time": '周日', "tem": 28, "city": "beijing"},
        {"time": '周一', "tem": 5, "city": "newYork"},
        {"time": '周二', "tem": 12, "city": "newYork"},
        {"time": '周三', "tem": 26, "city": "newYork"},
        {"time": '周四', "tem": 20, "city": "newYork"},
        {"time": '周五', "tem": 28, "city": "newYork"},
        {"time": '周六', "tem": 26, "city": "newYork"},
        {"time": '周日', "tem": 20, "city": "newYork"}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    var defs = {
        time: {
            tickCount: 7,
            range: [0, 1]
        },
        tem: {
            tickCount: 5,
            min: 0
        }
    };
    //配置time刻度文字样式
    var label = {
        fill: '#979797',
        font: '14px SimSun',
        offset: 6
    };



    chart.axis('time', {
        label: function (text, index, total) {

            var cfg = Util.mix({}, label);
            // 第一个点左对齐，最后一个点右对齐，其余居中，只有一个点时左对齐
            if (index === 0) {
                cfg.textAlign = 'start';
            }
            if (index > 0 && index === total - 1) {
                cfg.textAlign = 'end';
            }
            return cfg;
        }
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: 'sans-serif'
        }
    });
    chart.source(data, defs);
    chart.line().position('time*tem').color('city').shape('smooth');
    chart.render();

};

//带点折线图
exports.case4 = function (GM) {

    //双精度
    GM.Global.pixelRatio = 1;
    var Util = GM.Util;
    var data = [
        {"time": '2016-08-08 00:00:00', "tem": 10},
        {"time": '2016-08-08 00:10:00', "tem": 22},
        {"time": '2016-08-08 00:30:00', "tem": 20},
        {"time": '2016-08-09 00:35:00', "tem": 26},
        {"time": '2016-08-09 01:00:00', "tem": 20},
        {"time": '2016-08-09 01:20:00', "tem": 26},
        {"time": '2016-08-10 01:40:00', "tem": 28},
        {"time": '2016-08-10 02:00:00', "tem": 20},
        {"time": '2016-08-10 02:20:00', "tem": 28}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    var defs = {
        time: {
            type: 'timeCat',
            mask: 'yyyy-mm-dd',
            tickCount: 2,
            range: [0, 1]
        },
        tem: {
            tickCount: 5,
            min: 0
        }
    };
    //配置time刻度文字样式
    var label = {
        fill: '#979797',
        font: '14px sans-serif',
        offset: 6
    };
    chart.axis('time', {
        label: function (text, index, total) {
            var cfg = Util.mix({}, label);
            // 第一个点左对齐，最后一个点右对齐，其余居中，只有一个点时左对齐
            if (index === 0) {
                cfg.textAlign = 'start';
            }
            if (index > 0 && index === total - 1) {
                cfg.textAlign = 'end';
            }
            return cfg;
        }
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.source(data, defs);
    chart.line().position('time*tem').shape('smooth');
    chart.point().position('time*tem');
    chart.render();
};

//区域图
exports.case5 = function (GM) {

    var Util = GM.Util;
    // 双精度
    GM.Global.pixelRatio = 1;
    var data = [
        {"time": '2016-08-08 00:00:00', "tem": 10, "city": "beijing"},
        {"time": '2016-08-08 00:10:00', "tem": 22, "city": "beijing"},
        {"time": '2016-08-08 00:30:00', "tem": 16, "city": "beijing"},
        {"time": '2016-08-09 00:35:00', "tem": 26, "city": "beijing"},
        {"time": '2016-08-09 01:00:00', "tem": 12, "city": "beijing"},
        {"time": '2016-08-09 01:20:00', "tem": 26, "city": "beijing"},
        {"time": '2016-08-10 01:40:00', "tem": 18, "city": "beijing"},
        {"time": '2016-08-10 02:00:00', "tem": 26, "city": "beijing"},
        {"time": '2016-08-10 02:20:00', "tem": 12, "city": "beijing"},
        {"time": '2016-08-08 00:00:00', "tem": 28, "city": "newYork"},
        {"time": '2016-08-08 00:10:00', "tem": 16, "city": "newYork"},
        {"time": '2016-08-08 00:30:00', "tem": 26, "city": "newYork"},
        {"time": '2016-08-09 00:35:00', "tem": 12, "city": "newYork"},
        {"time": '2016-08-09 01:00:00', "tem": 26, "city": "newYork"},
        {"time": '2016-08-09 01:20:00', "tem": 20, "city": "newYork"},
        {"time": '2016-08-10 01:40:00', "tem": 29, "city": "newYork"},
        {"time": '2016-08-10 02:00:00', "tem": 16, "city": "newYork"},
        {"time": '2016-08-10 02:20:00', "tem": 22, "city": "newYork"}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data, {
        time: {
            type: 'timeCat',
            mask: 'yyyy-mm-dd',
            tickCount: 3,
            range: [0, 1]
        },
        tem: {
            tickCount: 5,
            min: 0
        }
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    //配置time刻度文字样式
    var label = {
        fill: '#979797',
        font: '14px sans-serif',
        offset: 6
    };
    chart.axis('time', {
        label: function (text, index, total) {
            var cfg = Util.mix({}, label);
            // 第一个点左对齐，最后一个点右对齐，其余居中，只有一个点时左对齐
            if (index === 0) {
                cfg.textAlign = 'start';
            }
            if (index > 0 && index === total - 1) {
                cfg.textAlign = 'end';
            }
            return cfg;
        }
    });
    chart.area().position('time*tem').color('city').shape('smooth').style({
        opacity: 0.6
    });
    chart.render();
};


//带事件的重叠区域图
exports.case6 = function (GM) {

    GM.Global.pixelRatio = 1;
    var data = [
        {"month": 12, "tem": 7, "city": "tokyo"},
        {"month": 1, "tem": 6.9, "city": "tokyo"},
        {"month": 2, "tem": 9.5, "city": "tokyo"},
        {"month": 3, "tem": 14.5, "city": "tokyo"},
        {"month": 4, "tem": 18.2, "city": "tokyo"},
        {"month": 5, "tem": 21.5, "city": "tokyo"},
        {"month": 6, "tem": 25.2, "city": "tokyo"},
        {"month": 7, "tem": 26.5, "city": "tokyo"},
        {"month": 8, "tem": 23.3, "city": "tokyo"},
        {"month": 9, "tem": 18.3, "city": "tokyo"},
        {"month": 10, "tem": 13.9, "city": "tokyo"},
        {"month": 11, "tem": 9.6, "city": "tokyo"},
        {"month": 12, "tem": 0, "city": "newYork"},
        {"month": 1, "tem": 0.8, "city": "newYork"},
        {"month": 2, "tem": 5.7, "city": "newYork"},
        {"month": 3, "tem": 11.3, "city": "newYork"},
        {"month": 4, "tem": 17, "city": "newYork"},
        {"month": 5, "tem": 22, "city": "newYork"},
        {"month": 6, "tem": 24.8, "city": "newYork"},
        {"month": 7, "tem": 24.1, "city": "newYork"},
        {"month": 8, "tem": 20.1, "city": "newYork"},
        {"month": 9, "tem": 14.1, "city": "newYork"},
        {"month": 10, "tem": 8.6, "city": "newYork"},
        {"month": 11, "tem": 2.5, "city": "newYork"},
        {"month": 12, "tem": 2, "city": "berlin"},
        {"month": 1, "tem": 0.6, "city": "berlin"},
        {"month": 2, "tem": 3.5, "city": "berlin"},
        {"month": 3, "tem": 8.4, "city": "berlin"},
        {"month": 4, "tem": 13.5, "city": "berlin"},
        {"month": 5, "tem": 17, "city": "berlin"},
        {"month": 6, "tem": 18.6, "city": "berlin"},
        {"month": 7, "tem": 17.9, "city": "berlin"},
        {"month": 8, "tem": 14.3, "city": "berlin"},
        {"month": 9, "tem": 9, "city": "berlin"},
        {"month": 10, "tem": 3.9, "city": "berlin"},
        {"month": 11, "tem": 1, "city": "berlin"}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data, {
        month: {
            tickCount: 12
        },
        tem: {
            tickCount: 5
        }
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.axis('month', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.areaStack().position('month*tem').color('city').shape('smooth').style({
        opacity: 0.6
    });
    chart.render();
    function getPoint(canvas, x, y) {
        var bbox = canvas.getBoundingClientRect();
        return {
            x: x - bbox.left,
            y: y - bbox.top
        };
    }

};

//柱状图
exports.case7 = function (GM) {

    GM.Global.pixelRatio = 1;
    var data = [
        {"tem": 10, "city": "tokyo"},
        {"tem": 4, "city": "newYork"},
        {"tem": 3, "city": "berlin"}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data, {
        tem: {
            tickCount: 5
        }
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('city', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        },
        grid: null
    });
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.interval().position('city*tem').color('city');
    chart.render();

};

//区间柱状图
exports.case8 = function (GM) {

    GM.Global.pixelRatio = 1;
    var data = [
        {"month": '周一', "tem": [0, 7]},
        {"month": '周二', "tem": [7, 5]},
        {"month": '周三', "tem": [5, 9.5]},
        {"month": '周四', "tem": [9.5, 14.5]},
        {"month": '周五', "tem": [14.5, 10.2]},
        {"month": '周六', "tem": [10.2, 21.5]},
        {"month": '周日', "tem": [21.5, 25.2]}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data, {
        tem: {
            tickCount: 5
        }
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('month', {
        label: {
            fontSize: 14,
            fontFamily: "SimSun"

        },
        grid: null
    });
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.interval().position('month*tem').color('tem', function (tem) {
        if (tem[1] >= tem[0]) {
            return 'red'
        } else {
            return 'green';
        }
    });
    chart.render();

};

//层叠柱状图
exports.case9 = function (GM) {

    GM.Global.pixelRatio = 1;
    var data = [
        {"time": "周一", "tem": 6.9, "city": "tokyo"},
        {"time": "周二", "tem": 9.5, "city": "tokyo"},
        {"time": "周三", "tem": 14.5, "city": "tokyo"},
        {"time": "周四", "tem": 18.2, "city": "tokyo"},
        {"time": "周五", "tem": 21.5, "city": "tokyo"},
        {"time": "周六", "tem": 25.2, "city": "tokyo"},
        {"time": "周日", "tem": 26.5, "city": "tokyo"},
        {"time": "周一", "tem": 0.8, "city": "newYork"},
        {"time": "周二", "tem": 5.7, "city": "newYork"},
        {"time": "周三", "tem": 11.3, "city": "newYork"},
        {"time": "周四", "tem": 17, "city": "newYork"},
        {"time": "周五", "tem": 22, "city": "newYork"},
        {"time": "周六", "tem": 24.8, "city": "newYork"},
        {"time": "周日", "tem": 24.1, "city": "newYork"},
        {"time": "周一", "tem": 0.6, "city": "berlin"},
        {"time": "周二", "tem": 3.5, "city": "berlin"},
        {"time": "周三", "tem": 8.4, "city": "berlin"},
        {"time": "周四", "tem": 13.5, "city": "berlin"},
        {"time": "周五", "tem": 17, "city": "berlin"},
        {"time": "周六", "tem": 18.6, "city": "berlin"},
        {"time": "周日", "tem": 17.9, "city": "berlin"}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data, {
        tem: {
            tickCount: 5
        }
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('time', {
        label: {
            fontSize: 14,
            fontFamily: "SimSun"
        },
        grid: null
    });
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.intervalStack().position('time*tem').color('city');
    chart.render();

};


//玉玦图
exports.case10 = function (GM) {

    GM.Global.pixelRatio = 1;
    var data = [
        {"tem": 7, "city": "tokyo"},
        {"tem": 4, "city": "newYork"},
        {"tem": 3, "city": "berlin"}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data, {
        tem: {
            min: 0,
            max: 10
        }
    });
    chart.axis(false);
    chart.coord('polar', {
        transposed: true,
        inner: 0.5
    });
    chart.interval().position('city*tem').color('city');
    chart.render();

};

//自定义shape的柱状图
exports.case11 = function (GM) {

    GM.Global.pixelRatio = 1;
    var data = [
        {"tem": 500, "city": "一月"},
        {"tem": -50, "city": "二月"},
        {"tem": 450, "city": "五月"},
        {"tem": -40, "city": "六月"},
        {"tem": 690, "city": "七月"},
        {"tem": 346, "city": "八月"},
    ];
    var drawShape = function (points, canvas, cfg) {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        if (points.length > 1) {
            for (var i = 1; i <= points.length - 1; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
        }
        ctx.fillStyle = cfg.fill;
        ctx.fill();
    };
    //自定义绘制数据的的形状
    var Shape = GM.Shape;
    Shape.registShape('interval', 'polygon', {
        getShapePoints: function (cfg) {
            var x = cfg.x;
            var y = cfg.y;
            var y0 = cfg.y0;
            var width = cfg.size;
            return [
                {x: x - width / 2, y: y0},
                {x: x, y: y},
                {x: x + width / 2, y: y0}
            ];
        },
        drawShape: function (cfg, canvas) {
            var points = this.parsePoints(cfg.points);
            var style = cfg.style || {};
            style.fill = cfg.color;
            drawShape(points, canvas, style);
        }
    });
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data, {
        tem: {
            tickCount: 5,
        }
    });
    chart.axis('city', {
        label: {
            fontSize: 14,
            fontFamily: 'SimSun'
        },
        line: null,
        grid: null
    });
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: 'sans-serif'
        },
        grid: {
            stroke: '#f8f8f8',
        }
    });
    chart.interval().position('city*tem').color('tem*city', function (tem, city) {
        if (city === '八月') {
            return '#f5623a';
        }
        if (tem >= 0) {
            return '#f8bdad';
        }
        if (tem < 0) {
            return '#99d6c0';
        }
    }).shape('polygon');
    // 绘制数据
    chart.render();

};

//饼图
exports.case12 = function (GM) {

    GM.Global.pixelRatio = 1;
    var data = [
        {a: '1', b: 0.3, c: '1'},
        {a: '1', b: 0.3, c: '2'},
        {a: '1', b: 0.4, c: '3'}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data);
    chart.coord('polar', {
        transposed: true,
        inner: 0
    });
    chart.axis(false);
    chart.intervalStack().position('a*b').color('c');
    chart.render();

};

//嵌套饼图
exports.case13 = function (GM) {


    GM.Global.pixelRatio = 1;
    var data = [
        {a: '1', b: 0.2, c: '1'},
        {a: '2', b: 0.5, c: '1'},
        {a: '3', b: 0.4, c: '1'},
        {a: '1', b: 0.8, c: '2'},
        {a: '2', b: 0.5, c: '2'},
        {a: '3', b: 0.6, c: '2'}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data);
    chart.coord('polar', {
        transposed: true,
        inner: 0.5
    });
    chart.axis(false);
    chart.intervalStack().position('a*b').color('c');
    chart.render();


};

//玫瑰饼图
exports.case14 = function (GM) {


    GM.Global.pixelRatio = 1;
    var data = [
        {"tem": 7, "city": "tokyo"},
        {"tem": 4, "city": "newYork"},
        {"tem": 3, "city": "berlin"}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data, {
        tem: {
            min: 0,
            nice: false
        }
    });
    chart.coord('polar', {
        inner: 0
    });
    chart.axis(false);
    chart.interval().position('city*tem').color('city');
    chart.render();


};

//雷达图
exports.case15 = function (GM) {


    GM.Global.pixelRatio = 1;
    var data = [
        {name: '张飞', props: '智力', value: 65},
        {name: '张飞', props: '武力', value: 97},
        {name: '张飞', props: '政治', value: 50},
        {name: '张飞', props: '统帅', value: 92},
        {name: '张飞', props: '忠诚', value: 100},
        {name: '关羽', props: '智力', value: 80},
        {name: '关羽', props: '武力', value: 94},
        {name: '关羽', props: '政治', value: 70},
        {name: '关羽', props: '统帅', value: 95},
        {name: '关羽', props: '忠诚', value: 99}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.coord('polar');
    chart.source(data, {
        value: {
            min: 0,
            tickInterval: 20
        }
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('props', {
        label: {
            fontSize: 14,
            fontFamily: "SimSun"
        },
        line: null
    });
    chart.axis('value', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.line().position('props*value').color('name');
    chart.render();


};

//带缩放动画的区域雷达图
exports.case16 = function (GM) {

    GM.Global.pixelRatio = 1;
    var data = [
        {name: '张飞', props: '智力', value: 65},
        {name: '张飞', props: '武力', value: 97},
        {name: '张飞', props: '政治', value: 50},
        {name: '张飞', props: '统帅', value: 92},
        {name: '张飞', props: '忠诚', value: 100},
        {name: '关羽', props: '智力', value: 80},
        {name: '关羽', props: '武力', value: 94},
        {name: '关羽', props: '政治', value: 70},
        {name: '关羽', props: '统帅', value: 95},
        {name: '关羽', props: '忠诚', value: 99}
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.coord('polar');
    chart.source(data, {
        value: {
            min: 0,
            tickInterval: 20
        }
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('props', {
        label: {
            fontSize: 14,
            fontFamily: "SimSun"
        },
        line: null
    });
    chart.axis('value', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.area().position('props*value').color('name').style({
        opacity: 0.6
    });
    // x和y轴同时缩放的动画
  //  chart.animate().scalexy();
    chart.render();

}

//股票图
exports.case17 = function (GM) {

    var Util = GM.Util;
    GM.Global.pixelRatio = 1;
    //获取本地数据
    var data = [
        {
            time: "2015-11-19",
            start: 8.18,
            max: 8.33,
            min: 7.98,
            end: 8.32,
            volumn: 1810,
            money: 14723.56
        },
        {
            time: "2015-11-18",
            start: 8.37,
            max: 8.6,
            min: 8.03,
            end: 8.09,
            volumn: 2790.37,
            money: 23309.19
        },
        {
            time: "2015-11-17",
            start: 8.7,
            max: 8.78,
            min: 8.32,
            end: 8.37,
            volumn: 3729.04,
            money: 31709.71
        },
        {
            time: "2015-11-16",
            start: 8.18,
            max: 8.69,
            min: 8.05,
            end: 8.62,
            volumn: 3095.44,
            money: 26100.69
        },
        {
            time: "2015-11-13",
            start: 8.01,
            max: 8.75,
            min: 7.97,
            end: 8.41,
            volumn: 5815.58,
            money: 48562.37
        },
        {
            time: "2015-11-12",
            start: 7.76,
            max: 8.18,
            min: 7.61,
            end: 8.15,
            volumn: 4742.6,
            money: 37565.36
        },
        {
            time: "2015-11-11",
            start: 7.55,
            max: 7.81,
            min: 7.49,
            end: 7.8,
            volumn: 3133.82,
            money: 24065.42
        },
        {
            time: "2015-11-10",
            start: 7.5,
            max: 7.68,
            min: 7.44,
            end: 7.57,
            volumn: 2670.35,
            money: 20210.58
        },
        {
            time: "2015-11-09",
            start: 7.65,
            max: 7.66,
            min: 7.3,
            end: 7.58,
            volumn: 2841.79,
            money: 21344.36
        },
        {
            time: "2015-11-06",
            start: 7.52,
            max: 7.71,
            min: 7.48,
            end: 7.64,
            volumn: 2725.44,
            money: 20721.51
        },
        {
            time: "2015-11-05",
            start: 7.48,
            max: 7.57,
            min: 7.29,
            end: 7.48,
            volumn: 3520.85,
            money: 26140.83
        },
        {
            time: "2015-11-04",
            start: 7.01,
            max: 7.5,
            min: 7.01,
            end: 7.46,
            volumn: 3591.47,
            money: 26285.52
        },
        {
            time: "2015-11-03",
            start: 7.1,
            max: 7.17,
            min: 6.82,
            end: 7,
            volumn: 2029.21,
            money: 14202.33
        },
        {
            time: "2015-11-02",
            start: 7.09,
            max: 7.44,
            min: 6.93,
            end: 7.17,
            volumn: 3191.31,
            money: 23205.11
        },
        {
            time: "2015-10-30",
            start: 6.98,
            max: 7.27,
            min: 6.84,
            end: 7.18,
            volumn: 3522.61,
            money: 25083.44
        },
        {
            time: "2015-10-29",
            start: 6.94,
            max: 7.2,
            min: 6.8,
            end: 7.05,
            volumn: 2752.27,
            money: 19328.44
        },
        {
            time: "2015-10-28",
            start: 7.01,
            max: 7.14,
            min: 6.8,
            end: 6.85,
            volumn: 2311.11,
            money: 16137.32
        },
        {
            time: "2015-10-27",
            start: 6.91,
            max: 7.31,
            min: 6.48,
            end: 7.18,
            volumn: 3172.9,
            money: 21827.3
        },
        {
            time: "2015-10-26",
            start: 6.9,
            max: 7.08,
            min: 6.87,
            end: 6.95,
            volumn: 2769.31,
            money: 19337.44
        },
        {
            time: "2015-10-23",
            start: 6.71,
            max: 6.85,
            min: 6.58,
            end: 6.79,
            volumn: 2483.18,
            money: 16714.31
        },
        {
            time: "2015-10-22",
            start: 6.38,
            max: 6.67,
            min: 6.34,
            end: 6.65,
            volumn: 2225.88,
            money: 14465.56
        },
        {
            time: "2015-10-21",
            start: 7.08,
            max: 7.1,
            min: 6.41,
            end: 6.41,
            volumn: 2891.47,
            money: 19585.98
        },
        {
            time: "2015-10-20",
            start: 6.88,
            max: 7.19,
            min: 6.85,
            end: 7.12,
            volumn: 2389.62,
            money: 16813.58
        },
        {
            time: "2015-10-19",
            start: 7.1,
            max: 7.14,
            min: 6.8,
            end: 6.94,
            volumn: 2786.61,
            money: 19474.72
        },
        {
            time: "2015-10-16",
            start: 6.92,
            max: 7.38,
            min: 6.73,
            end: 7.15,
            volumn: 3289.27,
            money: 22963.97
        },
        {
            time: "2015-10-15",
            start: 6.63,
            max: 6.9,
            min: 6.6,
            end: 6.89,
            volumn: 2440.37,
            money: 16575.84
        }
    ];
    //数据处理
    data.sort(function (obj1, obj2) {
        return obj1.time > obj2.time ? 1 : -1;
    });
    data.forEach(function (obj) {
        obj.range = [obj.start, obj.end, obj.max, obj.min];
        obj.trend = (obj.start <= obj.end) ? 0 : 1;
    });
    var chart = new GM.Chart({
        id: 'c1'
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('range', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    //配置time刻度文字样式
    var label = {
        fill: '#979797',
        font: '14px sans-serif',
        offset: 6
    };
    chart.axis('time', {
        label: function (text, index, total) {
            var cfg = Util.mix({}, label);
            // 第一个点左对齐，最后一个点右对齐，其余居中，只有一个点时左对齐
            if (index === 0) {
                cfg.textAlign = 'start';
            }
            if (index > 0 && index === total - 1) {
                cfg.textAlign = 'end';
            }
            return cfg;
        }
    });
    chart.source(data, {
        range: {
            tickCount: 5
        },
        time: {
            tickCount: 3
        }
    });
    chart.schema().position('time*range')
        .color('trend', function (trend) {
            return ['#C00000', '#19B24B'][trend];
        })
        .shape('candle');
    chart.render();

};

//双 Y 轴
exports.case18 = function (GM) {
    GM.Global.pixelRatio = 1;
    var data = [
        {"time": "周一", "tem": 6.9, "rain": 10},
        {"time": "周二", "tem": 9.5, "rain": 13},
        {"time": "周三", "tem": 14.5, "rain": 14},
        {"time": "周四", "tem": 18.2, "rain": 10},
        {"time": "周五", "tem": 21.5, "rain": 12},
        {"time": "周六", "tem": 25.2, "rain": 16},
        {"time": "周日", "tem": 26.5, "rain": 13},
    ];
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data, {
        tem: {
            tickCount: 5,
            max: 30,
            min: 0
        },
        rain: {
            tickCount: 5,
            min: 0
        }
    });
    //配置刻度文字大小，供PC端显示用(移动端可以使用默认值20px)
    chart.axis('time', {
        label: {
            fontSize: 14,
            fontFamily: "SimSun"
        },
        grid: null
    });
    chart.axis('tem', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.axis('rain', {
        label: {
            fontSize: 14,
            fontFamily: "sans-serif"
        }
    });
    chart.interval().position('time*tem');
    chart.line().position('time*rain').color('#5ed470').size(2).shape('smooth');
    chart.point().position('time*rain').color('#5ed470');
    chart.render();
};

exports.case19 = function (GM) {


    GM.Global.pixelRatio = 1;//双精度
    var Shape = GM.Shape;
    var G = GM.G;
    var data = [{pointer: '当前收益', value: 5, length: 2, y: 1.05}];
    //自定义绘制数据的的形状      
    Shape.registShape('point', 'dashBoard', {
        getShapePoints: function (cfg) {
            var x = cfg.x;
            var y = cfg.y;
            return [
                {x: x, y: y},
                {x: x, y: 0.5}
            ]
        },
        drawShape: function (cfg, canvas) {
            var point1 = cfg.points[0];
            var point2 = cfg.points[1];
            point1 = this.parsePoint(point1);
            point2 = this.parsePoint(point2);
            G.drawLines([point1, point2], canvas, {
                stroke: '#18b7d6',
                lineWidth: 2
            });
            var text = cfg.origin._origin.value.toString();
            G.drawText(text + '%', cfg.center, canvas, {
                fillStyle: '#f75b5b',
                font: '30px serif',
                textAlign: 'center',
                textBaseline: 'bottom'
            });
            G.drawText(cfg.origin._origin.pointer, cfg.center, canvas, {
                fillStyle: '#ccc',
                font: '30px SimSun',
                textAlign: 'center',
                textBaseline: 'top'
            });
        }
    });
    var chart = new GM.Chart({
        id: 'c1'
    });
    chart.source(data, {
        'value': {type: 'linear', min: 0, max: 15, tickCount: 6},
        'length': {type: 'linear', min: 0, max: 10},
        y: {type: 'linear', min: 0, max: 1}
    });
    chart.coord('polar', {
        inner: 0,
        startAngle: -1.25 * Math.PI,
        endAngle: 0.25 * Math.PI
    });
    //配置value轴刻度线
    chart.axis('value', {
        tickLine: {
            strokeStyle: '#b9e6ef',
            lineWidth: 2,
            value: -5
        },
        //label: null,
        label: {
            fontSize: 14,
            fontFamily: "serif"
        },
        grid: null,
        line: null
    });
    chart.axis('y', false);
    //绘制仪表盘辅助元素
    chart.guide().arc([0, 1.05], [4.8, 1.05], {
        strokeStyle: '#18b7d6',
        lineWidth: 5,
        lineCap: 'round'
    });
    chart.guide().arc([5.2, 1.05], [9.8, 1.05], {
        strokeStyle: '#ccc',
        lineWidth: 5,
        lineCap: 'round'
    });
    chart.guide().arc([10.2, 1.05], [15, 1.05], {
        strokeStyle: '#ccc',
        lineWidth: 5,
        lineCap: 'round'
    });
    chart.guide().arc([0, 1.2], [15, 1.2], {
        strokeStyle: '#ccc',
        lineWidth: 1
    });
    chart.guide().text([-0.5, 1.3], '0.00%', {
        fillStyle: '#ccc',
        font: '18px serif',
        textAlign: 'center'
    });
    chart.guide().text([7.5, 0.7], '7.50%', {
        fillStyle: '#ccc',
        font: '18px serif',
        textAlign: 'center'
    });
    chart.guide().text([15.5, 1.3], '15.00%', {
        fillStyle: '#ccc',
        font: '18px serif',
        textAlign: 'center'
    });
    chart.point().position('value*y').size('length').color('#18b7d6').shape('dashBoard');
    chart.render();


};


//带缩放动画和自定义背景的柱状图
exports.case21 = function () {


};
//带平铺动画的多类型线图
exports.case22 = function () {
};

//带缩放动画的横向柱状图
exports.case23 = function () {
};
//带平铺动画的环形饼图
exports.case24 = function () {


};
//带html辅助元素的折线图
exports.case25 = function (GM) {
};