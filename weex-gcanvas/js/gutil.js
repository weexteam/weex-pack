/////////////////////////////////////////////////////////////////
//GBridge
/////////////////////////////////////////////////////////////////
var GLog = require('./glog').GLog;

var inWeex = typeof callNative !== 'undefined';
var debug = true;
var canvasModule;

/*
__weex_define__('@weex-temp/x', function (__weex_require__) {
    canvasModule = __weex_require__('@weex-module/gcanvas');
});
*/

canvasModule=typeof weex!=='undefined'?weex.requireModule('gcanvas'):__weex_require__('@weex-module/gcanvas');

var GBridge = {
    /**执行render指令*/
    callRender: function (commands) {
        if (!inWeex) {
            return;
        }
        GLog.d('bridge#callRender() commands is ' + commands);
        canvasModule.render([commands]);
    },

    /**预加载图片*/
    preLoadImage: function (src, cb) {
        if (!inWeex) {
            return;
        }
        GLog.d('bridge#preLoadImage() image url is ' + src);
        canvasModule.preLoadImage(src, function (e) {
            cb && cb(e);
        });
    },

    /**
     * 获取canvas引用
     * @param ref wx-canvas 引用
     * @param configArray 配置参数
     **/
    callEnable: function (ref, configArray, callback) {
        if (!inWeex) {
            return;
        }
        var params = {
            componentId: ref,
            config:configArray
        };
        canvasModule.enable(params, function (e) {
            GLog.d('bridge#callEnable() return val:' + JSON.stringify(e));
            callback && callback(e);
        });
    },


    /**
     * 释放gcanvas引擎
     * @param ref wx-canvas 引用
     * @param configArray 配置参数
     **/
    callDisable: function () {
        if (!inWeex) {
            return;
        }
        var params = {
            
        };
        canvasModule.disable(params, function(e){
            GLog.d('bridge#callDisable() return val:' + JSON.stringify(e));
        });
    },

    /**
     * 获取设备信息(android)
     * @param callback 设备信息
     **/
    getDeviceInfo: function (callback) {
        if (!inWeex) {
            return;
        }
        canvasModule.getDeviceInfo({}, function (e) {
            GLog.d('bridge#getDeviceInfo() return val:' + JSON.stringify(e));
            callback && callback(e);
        });
    },

    /**
     *
     * 设置context类型,2d或者webgl
     *
     * @param context_type 0代表2d,1代表3d
     * */
    setContextType: function (context_type){
        if(context_type != 0 && context_type != 1){
            GLog.d('bridge#setContextType(): invalid context type===>' + context_type);
            return;
        }
        GLog.d('bridge#setContextType(): context type is ' + context_type);
        canvasModule.setContextType(context_type);
    },

    /**
     *
     * 设置日志级别
     *
     * @param context_type 0代表2d,1代表3d
     * */
    setLogLevel: function (level){
        GLog.d('bridge#setLogLevel(): native logLevel ' + level);
        canvasModule.setLogLevel(level);
    },

    /**
     *
     * 设置opengl渲染质量
     *
     * @param context_type 0代表2d,1代表3d
     * */
    setHiQuality: function (quality){
        GLog.d('bridge#setHiQuality(): quality: ' + quality);
        canvasModule.setHiQuality(quality);
    }
};


module.exports = {
    GBridge: GBridge,
    GLog: GLog
};
