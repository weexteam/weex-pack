/////////////////////////////////////////////////////////////////
//GLog
/////////////////////////////////////////////////////////////////
var GLOG_DEBUG	= 0;
var GLOG_INFO   = 1;
var GLOG_WARN   = 2;
var GLOG_ERROR	= 3;
var GLOG_NULL   = -1;

var GLog = {};
GLog._nullFunc = function(){};
GLog.d = GLog._nullFunc;
GLog.i = GLog._nullFunc
GLog.w = GLog._nullFunc;
GLog.e = GLog._nullFunc;
GLog._nativeEnable = false;
GLog._setNativeLevel = function(level){
	/*
	if (!this._nativeEnable)
		return;
	if (level == GLOG_DEBUG)
		GCanvas._toNative(null, null, 'GCanvas', 'setLogLevel', [ "debug" ]);
	else if (level == GLOG_INFO)
		GCanvas._toNative(null, null, 'GCanvas', 'setLogLevel', [ "info" ]);
	else if (level == GLOG_WARN)
		GCanvas._toNative(null, null, 'GCanvas', 'setLogLevel', [ "warn" ]);
	else if (level == GLOG_ERROR)
		GCanvas._toNative(null, null, 'GCanvas', 'setLogLevel', [ "error" ]);
	else 
		GCanvas._toNative(null, null, 'GCanvas', 'setLogLevel', [ "fatal" ]);	
     */
}
GLog._refresh = function(){

	
	if (this.enable == false){
		this._setNativeLevel(GLOG_NULL);
		this.d = this._nullFunc;
		this.i = this._nullFunc
		this.w = this._nullFunc;
		this.e = this._nullFunc;
	}
	else
	{
		if (this.level <= GLOG_ERROR)
			this.e = function(msg){ console.error(msg);};
		else
			this.e = this._nullFunc;
			
		if (this.level <= GLOG_WARN)
			this.w = function(msg){ console.warn(msg);};
		else
			this.w = this._nullFunc;
		
		if (this.level <= GLOG_INFO)
			this.i = function(msg){ console.info(msg);
				var args = {
					msg:msg
				}
			//WindVane.call("GLog", "writeLog", args || {}, null, null);
		};
		else
			this.i = this._nullFunc;
		
		if (this.level <= GLOG_DEBUG)
			this.d = function(msg){ console.info(msg);
				var args = {
					msg:msg
				}
			//WindVane.call("GLog", "writeLog", args || {}, null, null);
		};
		else
			this.d = this._nullFunc;
		
		this._setNativeLevel(this.level);	
	}
}
GLog.enable = function(){
	this.enable = true;
	this._refresh();
}
GLog.disable = function(){
	this.enable = false;
	this._refresh();
}
GLog.setLevel = function(level){
	console.info("[setLevel] "+ this.level + "=>" + level);
	this.level = level;
	this.enable = true;
	this._refresh();
}

//GLog.setLevel(GLOG_WARN);
GLog.setLevel(GLOG_DEBUG);

module.exports.GLog = GLog