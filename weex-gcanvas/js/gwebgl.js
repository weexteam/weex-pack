var GBridge = require("./util").GBridge;
var GLog = require("./util").GLog;

function GContextWebGL(){
    GInitWebGLEnum(this);

    this._drawCommands = "";
    this._globalAlpha = 1.0;
    this._fillStyle = "rgb(0,0,0)";
    this._strokeStyle = "rgb(0,0,0)";
    this._lineWidth = 1;
    this._lineCap = "butt";
    this._lineJoin= "miter";
    this._miterLimit = 10;
    this._globalCompositeOperation = "source-over";
    this._textAlign = "start";
    this._textBaseline = "alphabetic";
    this._font = "10px sans-serif";
    this._images = {};
    this._canvases1 = {};
    this._canvases2 = {};
    this._getImageData = new Array();

    this._uniformMgr = {};
    this._uniformCount = 3;

    //GCanvas._forbiddenAutoReplaceCanvas =true;
    //this._apiCanvas  = document.createElement('canvas');
    //GCanvas._forbiddenAutoReplaceCanvas =false;
    //console.log("apicanvas="+this._apiCanvas);
    //this._apiContext = this._apiCanvas.getContext("2d");
    //this._apiContext.font = this._font;

    this._savedGlobalAlpha =[];
}


//////////////////////////////////////////////////////////////////////////


function GInitWebGLEnum(obj){

    //GUtil.setConfig("encode_type", 1);

    var i=1;
    obj.activeTextureId=(i++)+",";
    obj.attachShaderId=(i++)+",";
    obj.bindAttribLocationId=(i++)+",";
    obj.bindBufferId=(i++)+",";
    obj.bindFramebufferId=(i++)+",";
    obj.bindRenderbufferId=(i++)+",";
    obj.bindTextureId=(i++)+",";
    obj.blendColorId=(i++)+",";
    obj.blendEquationId=(i++)+",";
    obj.blendEquationSeparateId=(i++)+",";
    obj.blendFuncId=(i++)+",";
    obj.blendFuncSeparateId=(i++)+",";
    obj.bufferDataId=(i++)+",";
    obj.bufferSubDataId=(i++)+",";
    obj.checkFramebufferStatusId=(i++)+",";
    obj.clearId=(i++)+",";
    obj.clearColorId=(i++)+",";
    obj.clearDepthId=(i++)+",";
    obj.clearStencilId=(i++)+",";
    obj.colorMaskId=(i++)+",";
    obj.compileShaderId=(i++)+",";
    obj.compressedTexImage2DId=(i++)+",";
    obj.compressedTexSubImage2DId=(i++)+",";
    obj.copyTexImage2DId=(i++)+",";
    obj.copyTexSubImage2DId=(i++)+",";
    obj.createBufferId=(i++)+",";
    obj.createFramebufferId=(i++)+",";
    obj.createProgramId=(i++)+",";
    obj.createRenderbufferId=(i++)+",";
    obj.createShaderId=(i++)+",";
    obj.createTextureId=(i++)+",";
    obj.cullFaceId=(i++)+",";
    obj.deleteBufferId=(i++)+",";
    obj.deleteFramebufferId=(i++)+",";
    obj.deleteProgramId=(i++)+",";
    obj.deleteRenderbufferId=(i++)+",";
    obj.deleteShaderId=(i++)+",";
    obj.deleteTextureId=(i++)+",";
    obj.depthFuncId=(i++)+",";
    obj.depthMaskId=(i++)+",";
    obj.depthRangeId=(i++)+",";
    obj.detachShaderId=(i++)+",";
    obj.disableId=(i++)+",";
    obj.disableVertexAttribArrayId=(i++)+",";
    obj.drawArraysId=(i++)+",";
    obj.drawArraysInstancedANGLEId=(i++)+",";
    obj.drawElementsId=(i++)+",";
    obj.drawElementsInstancedANGLEId=(i++)+",";
    obj.enableId=(i++)+",";
    obj.enableVertexAttribArrayId=(i++)+",";
    obj.flushId=(i++)+",";
    obj.framebufferRenderbufferId=(i++)+",";
    obj.framebufferTexture2DId=(i++)+",";
    obj.frontFaceId=(i++)+",";
    obj.generateMipmapId=(i++)+",";
    obj.getActiveAttribId=(i++)+",";
    obj.getActiveUniformId=(i++)+",";
    obj.getAttachedShadersId=(i++)+",";
    obj.getAttribLocationId=(i++)+",";
    obj.getBufferParameterId=(i++)+",";
    obj.getContextAttributesId=(i++)+",";
    obj.getErrorId=(i++)+",";
    obj.getExtensionId=(i++)+",";
    obj.getFramebufferAttachmentParameterId=(i++)+",";
    obj.getParameterId=(i++)+",";
    obj.getProgramInfoLogId=(i++)+",";
    obj.getProgramParameterId=(i++)+",";
    obj.getRenderbufferParameterId=(i++)+",";
    obj.getShaderInfoLogId=(i++)+",";
    obj.getShaderParameterId=(i++)+",";
    obj.getShaderPrecisionFormatId=(i++)+",";
    obj.getShaderSourceId=(i++)+",";
    obj.getSupportedExtensionsId=(i++)+",";
    obj.getTexParameterId=(i++)+",";
    obj.getUniformId=(i++)+",";
    obj.getUniformLocationId=(i++)+",";
    obj.getVertexAttribId=(i++)+",";
    obj.getVertexAttribOffsetId=(i++)+",";
    obj.isBufferId=(i++)+",";
    obj.isContextLostId=(i++)+",";
    obj.isEnabledId=(i++)+",";
    obj.isFramebufferId=(i++)+",";
    obj.isProgramId=(i++)+",";
    obj.isRenderbufferId=(i++)+",";
    obj.isShaderId=(i++)+",";
    obj.isTextureId=(i++)+",";
    obj.lineWidthId=(i++)+",";
    obj.linkProgramId=(i++)+",";
    obj.pixelStoreiId=(i++)+",";
    obj.polygonOffsetId=(i++)+",";
    obj.readPixelsId=(i++)+",";
    obj.renderbufferStorageId=(i++)+",";
    obj.sampleCoverageId=(i++)+",";
    obj.scissorId=(i++)+",";
    obj.shaderSourceId=(i++)+",";
    obj.stencilFuncId=(i++)+",";
    obj.stencilFuncSeparateId=(i++)+",";
    obj.stencilMaskId=(i++)+",";
    obj.stencilMaskSeparateId=(i++)+",";
    obj.stencilOpId=(i++)+",";
    obj.stencilOpSeparateId=(i++)+",";
    obj.texImage2DId=(i++)+",";
    obj.texParameterfId=(i++)+",";
    obj.texParameteriId=(i++)+",";
    obj.texSubImage2DId=(i++)+",";
    obj.uniform1fId=(i++)+",";
    obj.uniform1fvId=(i++)+",";
    obj.uniform1iId=(i++)+",";
    obj.uniform1ivId=(i++)+",";
    obj.uniform2fId=(i++)+",";
    obj.uniform2fvId=(i++)+",";
    obj.uniform2iId=(i++)+",";
    obj.uniform2ivId=(i++)+",";
    obj.uniform3fId=(i++)+",";
    obj.uniform3fvId=(i++)+",";
    obj.uniform3iId=(i++)+",";
    obj.uniform3ivId=(i++)+",";
    obj.uniform4fId=(i++)+",";
    obj.uniform4fvId=(i++)+",";
    obj.uniform4iId=(i++)+",";
    obj.uniform4ivId=(i++)+",";
    obj.uniformMatrix2fvId=(i++)+",";
    obj.uniformMatrix3fvId=(i++)+",";
    obj.uniformMatrix4fvId=(i++)+",";
    obj.useProgramId=(i++)+",";
    obj.validateProgramId=(i++)+",";
    obj.vertexAttribDivisorANGLEId=(i++)+",";
    obj.vertexAttrib2fvId=(i++)+",";
    obj.vertexAttribPointerId=(i++)+",";
    obj.viewportId=(i++)+",";


    obj.COMPILE_STATUS = 11;

    obj.DEPTH_BUFFER_BIT=1;
    obj.STENCIL_BUFFER_BIT=2;
    obj.COLOR_BUFFER_BIT=4;


    //used for:texParameteri
    //native variable:s_texture_target
    obj.TEXTURE_2D=0;
    obj.TEXTURE_CUBE_MAP=1;
    obj.TEXTURE_CUBE_MAP_POSITIVE_X=1;
    obj.TEXTURE_CUBE_MAP_NEGATIVE_X=2;
    obj.TEXTURE_CUBE_MAP_POSITIVE_Y=3;
    obj.TEXTURE_CUBE_MAP_NEGATIVE_Y=4;
    obj.TEXTURE_CUBE_MAP_POSITIVE_Z=5;
    obj.TEXTURE_CUBE_MAP_NEGATIVE_Z=6;

    i=0;
    obj.VERTEX_SHADER = i++;//
    obj.FRAGMENT_SHADER = i++;
    obj.ARRAY_BUFFER = i++;//
    obj.ELEMENT_ARRAY_BUFFER=i++;
    obj.FLOAT = i++;//
    obj.FIXED = i++;
    obj.POINTS=i++;//
    obj.LINES=i++;
    obj.LINE_STRIP=i++;
    obj.LINE_LOOP=i++;
    obj.TRIANGLES=i++;
    obj.TRIANGLE_STRIP=i++;
    obj.TRIANGLE_FAN=i++;
    obj.STREAM_DRAW=i++;//
    obj.STATIC_DRAW=i++;
    obj.DYNAMIC_DRAW=i++;
    obj.UNSIGNED_BYTE=i++;//
    obj.UNSIGNED_SHORT = i++;
    obj.CW=i++;//
    obj.CCW=i++;
    obj.FRONT = i++;//
    obj.BACK=i++;
    obj.FRONT_AND_BACK=i++;
    obj.NEVER=i++;//
    obj.LESS=i++;
    obj.EQUAL=i++;
    obj.LEQUAL=i++;
    obj.GREATER=i++;
    obj.NOTEQUAL=i++;
    obj.GEQUAL=i++;
    obj.ALWAYS=i++;
    obj.BLEND=i++;//
    obj.CULL_FACE=i++;
    obj.DEPTH_TEST=i++;
    obj.POLYGON_OFFSET_FILL=i++;
    obj.SCISSOR_TEST=i++;
    obj.NEAREST=i++;//
    obj.LINEAR=i++;
    obj.NEAREST_MIPMAP_NEAREST=i++;
    obj.LINEAR_MIPMAP_NEAREST=i++;
    obj.NEAREST_MIPMAP_LINEAR=i++;
    obj.LINEAR_MIPMAP_LINEAR=i++;
    obj.REPEAT=i++;
    obj.CLAMP_TO_EDGE=i++;
    obj.MIRRORED_REPEAT=i++;
    obj.ZERO=i++;//func:blendFunc
    obj.ONE=i++;
    obj.SRC_COLOR=i++;
    obj.DST_COLOR=i++;
    obj.SRC_ALPHA=i++;
    obj.DST_ALPHA=i++;
    obj.ONE_MINUS_SRC_COLOR=i++;
    obj.ONE_MINUS_DST_COLOR=i++;
    obj.ONE_MINUS_SRC_ALPHA=i++;
    obj.ONE_MINUS_DST_ALPHA=i++;
    obj.SRC_ALPHA_SATURATE=i++;
    obj.FUNC_ADD=i++;//
    obj.FUNC_SUBTRACT=i++;
    obj.FUNC_REVERSE_SUBTRACT=i++;
    obj.ALPHA=i++;//
    obj.LUMINANCE=i++;
    obj.LUMINANCE_ALPHA=i++;
    obj.RGB=i++;
    obj.RGBA=i++;
    obj.TEXTURE_MIN_FILTER=i++;//
    obj.TEXTURE_MAG_FILTER=i++;
    obj.TEXTURE_WRAP_S=i++;
    obj.TEXTURE_WRAP_T=i++;
    obj.RGBA4=i++;//
    obj.RGB565=i++;
    obj.RGB5_A1=i++;
    obj.DEPTH_COMPONENT16=i++;
    obj.DEPTH_STENCIL=i++;
    obj.COLOR_ATTACHMENT0=i++;//
    obj.DEPTH_ATTACHMENT=i++;
    obj.STENCIL_ATTACHMENT=i++;
    obj.DEPTH_STENCIL_ATTACHMENT=i++;
    obj.TEXTURE0=i++;//
    obj.TEXTURE1=i++;
    obj.TEXTURE2=i++;
    obj.TEXTURE3=i++;
    obj.TEXTURE4=i++;
    obj.TEXTURE5=i++;
    obj.TEXTURE6=i++;
    obj.TEXTURE7=i++;
    obj.TEXTURE8=i++;
    obj.TEXTURE9=i++;
    obj.TEXTURE10=i++;
    obj.TEXTURE11=i++;
    obj.TEXTURE12=i++;
    obj.TEXTURE13=i++;
    obj.TEXTURE14=i++;
    obj.TEXTURE15=i++;
    obj.TEXTURE16=i++;
    obj.TEXTURE17=i++;
    obj.TEXTURE18=i++;
    obj.TEXTURE19=i++;
    obj.TEXTURE20=i++;
    obj.TEXTURE21=i++;
    obj.TEXTURE22=i++;
    obj.TEXTURE23=i++;
    obj.TEXTURE24=i++;
    obj.TEXTURE25=i++;
    obj.TEXTURE26=i++;
    obj.TEXTURE27=i++;
    obj.TEXTURE28=i++;
    obj.TEXTURE29=i++;
    obj.TEXTURE30=i++;
    obj.TEXTURE31=i++;
    obj.GL_ACTIVE_TEXTURE=i++;
    obj.PACK_ALIGNMENT=i++;
    obj.UNPACK_ALIGNMENT=i++;
    obj.UNPACK_FLIP_Y_WEBGL=i++;

}

function GAttribLocation() {
    this.id = (++GAttribLocation.idCounter);
}
GAttribLocation.idCounter = 0;
GAttribLocation.mapKey = [];
GAttribLocation.mapVal = [];


function GProgram() {
    this.id = (++GProgram.idCounter);
}
GProgram.idCounter = 0;

function GShader() {
    this.id = (++GShader.idCounter);
}
GShader.idCounter = 0;

function GTexture() {
    this.id = (GTexture.idCounter++);
}
GTexture.idCounter = 0;

function GUniformLocation() {
    this.id = (++GUniformLocation.idCounter);
}
GUniformLocation.idCounter = 0;
GUniformLocation.mapKey = [];
GUniformLocation.mapVal = [];

function GWebGLBuffer() {
    this.id = (++GWebGLBuffer.idCounter);
}
GWebGLBuffer.idCounter = 0;

function GWebGLFramebuffer() {
    this.id = (++GWebGLFramebuffer.idCounter);
}
GWebGLFramebuffer.idCounter = 0;

function GWebGLRenderbuffer() {
    this.id = (++GWebGLRenderbuffer.idCounter);
}
GWebGLRenderbuffer.idCounter = 0;

function GWebGLShaderPrecisionFormat(){
}


//todo
function GarrToBase64(buffer) {
    var binary = ''
    //var bytes = new Uint8Array( buffer );
    var bytes = new Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] )
    }
    //return window.btoa( binary );
    var b = new Buffer(binary);
    var s = b.toString('base64');
    return s;

}
//////////////////////////////////////////////////////////////////////////



GContextWebGL.prototype.render = function() {
    var commands = this._drawCommands;
    this._drawCommands = "";
    GLog.d("GContextWebGL#render() called, commands is "+ commands);
    if (commands != null && commands != "") {
        //GCanvas._toNative(null, null, 'GCanvas', 'render', [ commands ]);
        GBridge.callRender(commands)
    }
};


//////////////////////////////////////////////////////////////////////////

////////////////////////////// WEBGL API //////////////////////////////////

GContextWebGL.prototype.activeTexture = function(texture){
    this._drawCommands += (this.activeTextureId + texture + ";");
};

GContextWebGL.prototype.attachShader = function(program, shader){
    this._drawCommands += (this.attachShaderId + program.id + "," + shader.id + ";");
};

GContextWebGL.prototype.bindAttribLocation = function(program, index, name){
    this._drawCommands += (this.bindAttribLocationId + program.id + "," + index + "," + name + ";");
};

GContextWebGL.prototype.bindBuffer = function(target, buffer){
    this._drawCommands += (this.bindBufferId + target + "," + ((null == buffer)?-1:buffer.id) + ";");
};

GContextWebGL.prototype.FRAMEBUFFER = 0;
GContextWebGL.prototype.bindFramebuffer = function(target, buf){
    this._drawCommands += (this.bindFramebufferId + target + "," + ((null == buf)?-1:buf.id) + ";");
};

GContextWebGL.prototype.RENDERBUFFER = 0;
GContextWebGL.prototype.bindRenderbuffer = function(target, buf){
    this._drawCommands += (this.bindRenderbufferId + target + "," + ((null == buf)?-1:buf.id) + ";");
};

GContextWebGL.prototype.bindTexture = function(target, texture){
    this._drawCommands += (this.bindTextureId + target + "," + ((null == texture)?-1:texture.id) + ";");
};

GContextWebGL.prototype.blendEquation = function(mode){
    this._drawCommands += (this.blendEquationId + mode + ";");
};

GContextWebGL.prototype.blendEquationSeparate = function(modeRGB, modeAlpha){
    this._drawCommands += (this.blendEquationSeparateId + modeRGB + "," + modeAlpha  + ";");
};


GContextWebGL.prototype.blendFunc = function(sfactor, dfactor){
    this._drawCommands += (this.blendFuncId + sfactor + "," + dfactor  + ";");
};

GContextWebGL.prototype.blendFuncSeparate = function(srcRGB, dstRGB, srcAlpha, dstAlpha){
    this._drawCommands += (this.blendFuncSeparateId + srcRGB + "," + dstRGB + "," + srcAlpha + "," + dstAlpha  + ";");
};


//todo
GContextWebGL.prototype.bufferData = function(target, param, usage){
    //GLog.d("[bufferData] before:_drawCommands.length=" + this._drawCommands.length);
    this._drawCommands += (this.bufferDataId + target + "," + GarrToBase64(param.buffer) + "," + usage + ";");

    //GLog.d("[bufferData] after :_drawCommands.length=" + this._drawCommands.length);

    //if (this._drawCommands.length > 10240)
    //    this.render();
    // TODO: param is " number or ArrayBuffer"
};

GContextWebGL.prototype.FRAMEBUFFER_COMPLETE = 0;
GContextWebGL.prototype.checkFramebufferStatus_ = function(target){
    return this.FRAMEBUFFER_COMPLETE;// TODO:
};

GContextWebGL.prototype.clear = function(mask){
    this._drawCommands += (this.clearId + mask + ";");
};

GContextWebGL.prototype.clearColor = function(r, g, b, a){
    this._drawCommands += (this.clearColorId + r + "," + g + "," + b + "," + a + ";");
};

GContextWebGL.prototype.clearDepth = function(depth){
    this._drawCommands += (this.clearDepthId + depth + ";");
};

GContextWebGL.prototype.clearStencil = function(s){
    this._drawCommands += (this.clearStencilId + s + ";");
};

GContextWebGL.prototype.colorMask = function(r, g, b, a){
    this._drawCommands += (this.colorMaskId + r?1:0 + "," + g?1:0 + "," + b?1:0 + "," + a?1:0 + ";");
};

GContextWebGL.prototype.compileShader = function(shader) {
    this._drawCommands += (this.compileShaderId + shader.id + ";");
};

GContextWebGL.prototype.createBuffer = function(){
    var buffer = new GWebGLBuffer();
    this._drawCommands += (this.createBufferId + buffer.id + ";");
    return buffer;
};

GContextWebGL.prototype.createFramebuffer = function(){
    var framebuffer = new GWebGLFramebuffer();
    this._drawCommands += (this.createFramebufferId + framebuffer.id + ";");
    return framebuffer;
};

GContextWebGL.prototype.createRenderbuffer = function(){
    var renderbuffer= new GWebGLRenderbuffer();
    this._drawCommands += (this.createRenderbufferId + renderbuffer.id + ";");
    return renderbuffer;
};

GContextWebGL.prototype.createProgram = function(){
    var program = new GProgram();
    this._drawCommands += (this.createProgramId + program.id + ";");
    return program;
};

GContextWebGL.prototype.createShader = function(type) {
    var shader = new GShader();
    this._drawCommands += (this.createShaderId + shader.id + "," + type + ";");
    return shader;
};

GContextWebGL.prototype.createTexture = function() {
    var texture = new GTexture();
    this._drawCommands += (this.createTextureId + texture.id + ";");
    return texture;
};

GContextWebGL.prototype.cullFace = function(mode){
    this._drawCommands += (this.cullFaceId + mode + ";");
};

GContextWebGL.prototype.deleteBuffer = function(buffer){
    this._drawCommands += (this.deleteBufferId + buffer.id + ";");
};

GContextWebGL.prototype.deleteFramebuffer = function(framebuffer){
    this._drawCommands += (this.deleteFramebufferId + framebuffer.id + ";");
};

GContextWebGL.prototype.deleteProgram = function(program){
    this._drawCommands += (this.deleteProgramId + program.id + ";");
};

GContextWebGL.prototype.deleteRenderbuffer = function(renderbuffer){
    this._drawCommands += (this.deleteRenderbufferId + renderbuffer.id + ";");
};

GContextWebGL.prototype.deleteShader = function(shader){
    this._drawCommands += (this.deleteShaderId + shader.id + ";");
};

GContextWebGL.prototype.deleteTexture = function(texture){
    this._drawCommands += (this.deleteTextureId + texture.id + ";");
};

GContextWebGL.prototype.depthFunc = function(func){
    this._drawCommands += (this.depthFuncId + func + ";");
};

GContextWebGL.prototype.depthMask = function(flag){
    this._drawCommands += (this.depthMaskId + (flag?1:0) + ";");
};

GContextWebGL.prototype.disable = function(cap){
    this._drawCommands += (this.disableId + cap + ";");
};


GContextWebGL.prototype.disableVertexAttribArray = function(index){
    this._drawCommands += (this.disableVertexAttribArrayId + index + ";");
};



GContextWebGL.prototype.drawArrays = function(mode, first, count){
    this._drawCommands += (this.drawArraysId + mode + "," + first + "," + count +  ";");
};

GContextWebGL.prototype.drawElements = function(mode, count, type, offset){
    this._drawCommands += (this.drawElementsId + mode + "," + count + "," + type + "," + offset +  ";");
};

GContextWebGL.prototype.enable = function(cap){
    this._drawCommands += (this.enableId + cap + ";");
};

GContextWebGL.prototype.enableVertexAttribArray = function(index){
    this._drawCommands += (this.enableVertexAttribArrayId + index + ";");
};

GContextWebGL.prototype.flush = function(){
    this._drawCommands += (this.flushId + ";");
};

GContextWebGL.prototype.generateMipmap = function(target){
    this._drawCommands += (this.generateMipmapId + target + ";");
};

GContextWebGL.prototype.framebufferRenderbuffer = function(target, attachment, renderbuffertarget, renderbuffer){
    this._drawCommands += (this.framebufferRenderbufferId + target + "," + attachment + "," + renderbuffertarget + "," + renderbuffer.id + ";");
};

GContextWebGL.prototype.framebufferTexture2D = function(target, attachment, textarget, texture, level){
    this._drawCommands += (this.framebufferTexture2DId + target + "," + attachment + "," + textarget + "," + texture.id + "," + level + ";");
};

GContextWebGL.prototype.frontFace = function(mode){
    this._drawCommands += (this.frontFaceId + mode + ";");
};

GContextWebGL.prototype.getAttribLocation   = function(program, name) {
    var key = program.id + ":" + name;
    var index = GAttribLocation.mapKey.indexOf(key);
    if (index > -1){
        //GLog.d("[getAttribLocation] " + key + "=" + GAttribLocation.mapVal[index].id);
        return GAttribLocation.mapVal[index];
    }

    var id = GAttribLocation.idCounter++;
    this._drawCommands += (this.getAttribLocationId + program.id + "," + name + "," + id + ";");

    GAttribLocation.mapKey.push(key);
    GAttribLocation.mapVal.push(id);
    //GLog.d("[GAttribLocation] " + key + "=" + id);

    return id;
};

GContextWebGL.prototype.getExtension = function(name) {
    //GLog.w("[getExtension] " + name);
    return null;
//	var ret = new Object();
//	return ret;// TODO: need call opengl es
};

GContextWebGL.prototype.OFFSET = 24;
GContextWebGL.prototype.MAX_TEXTURE_IMAGE_UNITS = GContextWebGL.prototype.OFFSET+0;
GContextWebGL.prototype.MAX_VERTEX_TEXTURE_IMAGE_UNITS = GContextWebGL.prototype.OFFSET+1;
GContextWebGL.prototype.MAX_TEXTURE_SIZE = GContextWebGL.prototype.OFFSET+2;
GContextWebGL.prototype.MAX_CUBE_MAP_TEXTURE_SIZE = GContextWebGL.prototype.OFFSET+3;
GContextWebGL.prototype.MAX_TEXTURE_MAX_ANISOTROPY_EXT = GContextWebGL.prototype.OFFSET+4;
GContextWebGL.prototype.COMPRESSED_TEXTURE_FORMATS = GContextWebGL.prototype.OFFSET+5;
GContextWebGL.prototype.MAX_VERTEX_UNIFORM_VECTORS=GContextWebGL.prototype.OFFSET+6;
GContextWebGL.prototype.ALIASED_POINT_SIZE_RANGE=GContextWebGL.prototype.OFFSET+7;


//TODO
GContextWebGL.prototype.getParameter = function(name) {
    if (typeof(GCanvas._glParams) == 'undefined'){
        return null;
    }
    if (name == this.ALIASED_POINT_SIZE_RANGE){
        var f32ar =  new Float32Array(2);
        f32ar[0]= 1;
        f32ar[1]= 256;
        return f32ar;
    }
    //GLog.d("[GContextWebGL::getParameter] " + name + "=" + GCanvas._glParams[name]);
    return GCanvas._glParams[name];
    // TODO: unsupport this code:var _compressedTextureFormats = _glExtensionCompressedTextureS3TC ? _gl.getParameter( _gl.COMPRESSED_TEXTURE_FORMATS ) : [];
};

GContextWebGL.prototype.getProgramInfoLog = function(program){
    return ''; // TODO:need asyn deal
};

GContextWebGL.prototype.getProgramParameter = function(program){
//	this._drawCommands = this._drawCommands.concat("getProgramParameter" + program.id + ";");
    return true; // TODO:need asyn deal
};

GContextWebGL.prototype.getShaderInfoLog = function(shader){
    return ''; // TODO:need asyn deal
};

GContextWebGL.prototype.getShaderParameter = function(shader, pname){
//	this._drawCommands +=("getShaderParameter" + shader.id + "," + pname + ";");
    return true; // TODO:need asyn deal
};


GContextWebGL.prototype.scissor = function(x, y, w, h) {
    this._drawCommands += (this.scissorId + x + "," + y + ","
    + w+ "," + h + ";");
};


GContextWebGL.prototype.getShaderPrecisionFormat = function(shader, pname){
    //var ret = new GWebGLShaderPrecisionFormat();
    //ret.range = 127;
    //ret.precision = 23;
    //if (shader == gl.VERTEX_SHADER) {
    //    switch (pname) {
    //        case gl.LOW_FLOAT:
    //        {
    //            ret.range = GCanvas._glParams[0];
    //            ret.precision = GCanvas._glParams[1];
    //            break;
    //        }
    //        case gl.MEDIUM_FLOAT:
    //        {
    //            ret.range = GCanvas._glParams[2];
    //            ret.precision = GCanvas._glParams[3];
    //            break;
    //        }
    //        case gl.HIGH_FLOAT:
    //        {
    //            ret.range = GCanvas._glParams[4];
    //            ret.precision = GCanvas._glParams[5];
    //            break;
    //        }
    //        case gl.LOW_INT:
    //        {
    //            ret.range = GCanvas._glParams[6];
    //            ret.precision = GCanvas._glParams[7];
    //            break;
    //        }
    //        case gl.MEDIUM_INT:
    //        {
    //            ret.range = GCanvas._glParams[8];
    //            ret.precision = GCanvas._glParams[9];
    //            break;
    //        }
    //        case gl.HIGH_INT:
    //        {
    //            ret.range = GCanvas._glParams[10];
    //            ret.precision = GCanvas._glParams[11];
    //            break;
    //        }
    //
    //    } //end switch
    //}
    //if (shader == gl.FRAGMENT_SHADER) {
    //    switch (pname) {
    //        case gl.LOW_FLOAT:
    //        {
    //            ret.range = GCanvas._glParams[12];
    //            ret.precision = GCanvas._glParams[13];
    //            break;
    //        }
    //        case gl.MEDIUM_FLOAT:
    //        {
    //            ret.range = GCanvas._glParams[14];
    //            ret.precision = GCanvas._glParams[15];
    //            break;
    //        }
    //        case gl.HIGH_FLOAT:
    //        {
    //            ret.range = GCanvas._glParams[16];
    //            ret.precision = GCanvas._glParams[17];
    //            break;
    //        }
    //        case gl.LOW_INT:
    //        {
    //            ret.range = GCanvas._glParams[18];
    //            ret.precision = GCanvas._glParams[19];
    //            break;
    //        }
    //        case gl.MEDIUM_INT:
    //        {
    //            ret.range = GCanvas._glParams[20];
    //            ret.precision = GCanvas._glParams[21];
    //            break;
    //        }
    //        case gl.HIGH_INT:
    //        {
    //            ret.range = GCanvas._glParams[22];
    //            ret.precision = GCanvas._glParams[23];
    //            break;
    //        }
    //
    //    } //end switch
    //}
    //
    //return ret;
};

GContextWebGL.prototype.getUniformLocation = function(program, name) {

    var key = program.id + ":" + name;
    var index = GUniformLocation.mapKey.indexOf(key);
    if (index > -1){
        //GLog.d("[getUniformLocation] " + key + "=" + GUniformLocation.mapVal[index].id);
        return GUniformLocation.mapVal[index];
    }

    var uniform = new GUniformLocation();
    this._drawCommands += (this.getUniformLocationId + program.id + "," + name + "," + uniform.id + ";");

    GUniformLocation.mapKey.push(key);
    GUniformLocation.mapVal.push(uniform);
    //GLog.d("[getUniformLocation] " + key + "=" + uniform.id);
    return uniform;
};

GContextWebGL.prototype.isContextLost = function(){
    return false;
};
GContextWebGL.prototype.lineWidth = function(width){
    this._drawCommands += (this.lineWidthId + width + ";");
};

GContextWebGL.prototype.linkProgram = function(program){
    this._drawCommands += (this.linkProgramId + program.id + ";");
};

GContextWebGL.prototype.pixelStorei = function(pname, param){
    if (true == param)
        param = 1;
    else if (false == param)
        param = 0;
    this._drawCommands += (this.pixelStoreiId + pname + "," + param + ";");
};

GContextWebGL.prototype.shaderSource = function(shader, source){
    var b = new Buffer(source);
    var s = b.toString('base64');

    this._drawCommands += (this.shaderSourceId + shader.id + "," + /*window.btoa(s)*/s + ";");
};



GContextWebGL.prototype.renderbufferStorage = function(target, internalformat, width, height){
    this._drawCommands += (this.renderbufferStorageId + target + "," + internalformat + "," + width + "," + height + ";");
};




//texImage2D(webgl.TEXTURE_2D, 0, webgl.RGB, webgl.RGB, webgl.UNSIGNED_BYTE, img);
//WebGLRenderingContext.texImage2D(target, level, internalformat, width, height, border, format, type, pixels);
//texImage2D( _gl.TEXTURE_2D, 0, _gl.RGB, 16, 16, 0, _gl.RGB, _gl.UNSIGNED_BYTE, null );
GContextWebGL.prototype.texImage2D = function(target, level, internalformat){
    var argc = arguments.length;
    //GLog.d("[texImage2D]arguments.length=" + argc);

    if (6==argc){
        var image = arguments[5];
        var imgData;
        if (image instanceof HTMLCanvasElement){
            imgData = image.toDataURL("image/jpeg");
        }else{
            imgData = image.src;
        }
        this._drawCommands += (this.texImage2DId + argc + "," + target + "," + level
        + "," + internalformat + "," + arguments[3] + "," + arguments[4]
        + "," + imgData + ";");
        GLog.d("[texImage2D] finish..." + imgData.length);
    }else if (9==argc){
        var image = arguments[5];
        this._drawCommands += (this.texImage2DId + argc + "," + target + "," + level
        + "," + internalformat + "," + arguments[3] + "," + arguments[4]
        + "," + arguments[5] + "," + arguments[6] + "," + arguments[7]
        + "," + arguments[8] + ";");
    }
};

GContextWebGL.prototype.texParameteri = function(target, pname, param){
    this._drawCommands += (this.texParameteriId + target + "," + pname + "," + param + ";");
};


GContextWebGL.prototype.uniform1f = function(location, value){
    this._drawCommands += (this.uniform1fId + location.id + "," + value + ";");
};

function trans2ArrayType(type, ar){
    if (ar instanceof type)
        return ar;
    var len = ar.length;
    var f32ar = new type(len);
    for (var i = 0; i < len; i++) {
        f32ar[i]=ar[i];
    }
    return f32ar;
}

GContextWebGL.prototype.uniformXXv = function(id, value, type, cmd){
    if (value.length == 0)
        return;

    value = trans2ArrayType(type, value);
    this._drawCommands += (cmd + id + ","
    + GarrToBase64(value.buffer) + ";");
};

GContextWebGL.prototype.uniform1f = function(location, value){
    this._drawCommands += (this.uniform1fId  + location.id + "," + value + ";");
};

GContextWebGL.prototype.uniform1fv = function(location, value){
    this.uniformXXv(location.id, value, Float32Array, this.uniform1fvId );
};

GContextWebGL.prototype.uniform1i = function(location, value){
    if (true == value)
        value= 1;
    else if (false == value)
        value = 0;
    this._drawCommands += (this.uniform1iId + location.id + "," + value + ";");
};

GContextWebGL.prototype.uniform1iv = function(location, value){
    this.uniformXXv(location.id, value, Int32Array, this.uniform1ivId );
};

GContextWebGL.prototype.uniform2f = function(location, x, y){
    this._drawCommands += (this.uniform2fId  + location.id + "," + x + "," + y + ";");
};

GContextWebGL.prototype.uniform2fv = function(location, value){
    this.uniformXXv(location.id, value, Float32Array, this.uniform2fvId);
};

GContextWebGL.prototype.uniform2i = function(location, x, y){
    this._drawCommands += (this.uniform2iId + location.id + "," + x + "," + y + ";");
};

GContextWebGL.prototype.uniform2iv = function(location, value){
    this.uniformXXv(location.id, value, Int32Array, this.uniform2ivId );
};

GContextWebGL.prototype.uniform3f = function(location, x, y, z){
    this._drawCommands += (this.uniform3fId + location.id + "," + x + "," + y + "," + z + ";");
};

GContextWebGL.prototype.uniform3fv = function(location, value){
    this.uniformXXv(location.id, value, Float32Array, this.uniform3fvId);
};

GContextWebGL.prototype.uniform3i = function(location, x, y, z){
    this._drawCommands += (this.uniform3iId + location.id + "," + x + "," + y + "," + z + ";");
};

GContextWebGL.prototype.uniform3iv = function(location, value){
    this.uniformXXv(location.id, value, Int32Array, this.uniform3ivId );
};

GContextWebGL.prototype.uniform4f = function(location, x, y, z, w){
    this._drawCommands += (this.uniform4fId + location.id + "," + x + "," + y + "," + z + "," + w + ";");
};

GContextWebGL.prototype.uniform4fv = function(location, value){
    this.uniformXXv(location.id, value, Float32Array, this.uniform4fvId);
};

GContextWebGL.prototype.uniform4i = function(location, x, y, z, w){
    this._drawCommands += (this.uniform4iId + location.id + "," + x + "," + y + "," + z + "," + w + ";");
};

GContextWebGL.prototype.uniform4iv = function(location, value){
    this.uniformXXv(location.id, value, Int32Array, this.uniform4ivId );
};



GContextWebGL.prototype.uniformMatrixXfv = function(location, transpose, value, apiId){
    if (value.length == 0)
        return;
    this._drawCommands += (apiId + location.id + "," + (transpose?1:0));
    // if (0 == GUtil.encode_type){
        this._drawCommands += ",";
        this._drawCommands += (GarrToBase64(value.buffer));
    // }
    // else {
        // for (var i = 0; i < value.length; i++) {
        //     this._drawCommands += ",";
        //     this._drawCommands += value[i].toFixed(3);
        // }
    // }
    this._drawCommands += (";");
};


GContextWebGL.prototype.uniformMatrix2fv = function(location, transpose, value){
    this.uniformMatrixXfv(location, transpose, value, this.uniformMatrix2fvId);
};

GContextWebGL.prototype.uniformMatrix3fv = function(location, transpose, value){
    this.uniformMatrixXfv(location, transpose, value, this.uniformMatrix3fvId);
};

GContextWebGL.prototype.uniformMatrix4fv = function(location, transpose, value){
    this.uniformMatrixXfv(location, transpose, value, this.uniformMatrix4fvId);
};


GContextWebGL.prototype.useProgram = function(program){
    this._drawCommands += (this.useProgramId + program.id + ";");
};

GContextWebGL.prototype.validateProgram = function(program){
    // TODO:
};

GContextWebGL.prototype.vertexAttrib2fv = function(index, value){
    this._drawCommands += this.vertexAttrib2fvId + index;
    for (var i = 0; i < value.length; i++) {
        this._drawCommands += ",";
        this._drawCommands += value[i].toFixed(3);
    }
};

GContextWebGL.prototype.vertexAttribPointer = function(index, size, type, normalized, stride, offset){
    this._drawCommands += (this.vertexAttribPointerId + index + "," + size + ","
    + type + "," + (normalized?1:0) + "," + stride + "," + offset + ";");
};


GContextWebGL.prototype.viewport = function(x, y, w, h) {
    this._drawCommands += (this.viewportId + x + "," + y + ","
    + w+ "," + h + ";");
};



//function autoInjectMetaViewport(){
//    var metas = document.getElementsByTagName("meta");
//    for (var i_matas = 0; i_matas < metas.length; ++i_matas) {
//        var meta_name = metas[i_matas].getAttribute("name");
//        if (meta_name == "viewport") {
//            return;
//        }
//    }
//    var injectMeta = "<meta n" + "ame='viewport' content='width=device-width, initial-scale=1.0' />"
//    GLog.d("[autoInjectMetaViewport] injectMeta:" + injectMeta);
//    document.write(injectMeta);
//};
//
//autoInjectMetaViewport();






module.exports = GContextWebGL;
