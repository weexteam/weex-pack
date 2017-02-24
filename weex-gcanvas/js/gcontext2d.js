var GBridge = require("./gutil").GBridge;
var GLog = require("./gutil").GLog;

function GContext2D() {
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

//    GCanvas._forbiddenAutoReplaceCanvas =true;
//    this._apiCanvas  = document.createElement('canvas');
//    GCanvas._forbiddenAutoReplaceCanvas =false;
//    console.error("apicanvas="+this._apiCanvas);
//    this._apiContext = this._apiCanvas.getContext("2d");
//    this._apiContext.font = this._font;

    this._savedGlobalAlpha =[];
    this.timer =null;
}



function FillStylePattern(img, pattern) {
    this._style = pattern;
    this._img = img;
}

function FillStyleLinearGradient(x0, y0, x1, y1) {
    this._start_pos = { _x : x0, _y : y0 };
    this._end_pos = { _x : x1, _y : y1 };
    this._stop_count = 0;
    this._stops = [0, 0, 0, 0, 0];
}

FillStyleLinearGradient.prototype.addColorStop = function(pos, color) {
    if (this._stop_count < 5 && 0.0 <= pos && pos <= 1.0) {
        this._stops[this._stop_count] = { _pos : pos, _color : color };
        this._stop_count++;
    }
}

function FillStyleRadialGradient(x0, y0, r0, x1, y1, r1) {
    this._start_pos = { _x : x0, _y : y0, _r : r0 };
    this._end_pos = { _x : x1, _y : y1, _r : r1 };
    this._stop_count = 0;
    this._stops = [0, 0, 0, 0, 0];
}

FillStyleRadialGradient.prototype.addColorStop = function(pos, color) {
    if (this._stop_count < 5 && 0.0 <= pos && pos <= 1.0) {
        this._stops[this._stop_count] = { _pos : pos, _color : color };
        this._stop_count++;
    }
}

/**
 * Represents the alpha value to be used with drawing commands where 1 is
 * completely visible and 0 is fully transparent.
 *
 * @type {number}
 * @name GContext2D#globalAlpha
 */
Object.defineProperty(GContext2D.prototype, "globalAlpha", {
    get : function() {
        return this._globalAlpha;
    },
    set : function(value) {
        // if (this._globalAlpha != value) {
        this._globalAlpha = value;
        this._drawCommands = this._drawCommands.concat("a" + value.toFixed(6)
                + ";");
        // }
    }
});

/**
 * Represents the color or style to use inside shapes. It can only be a
 * string which must be parsed as CSS <color> value for now.
 *
 * @type {string}
 * @name GContext2D#fillStyle
 * @example // set context fillStyle context.fillStyle = 'rgb(121,194,245)';
 */
Object.defineProperty(GContext2D.prototype, "fillStyle", {
    get : function() {
        return this._fillStyle;
    },
    set : function(value) {
        this._fillStyle = value;

        if (typeof(value) == 'string') {
            this._drawCommands = this._drawCommands.concat("F" + value + ";");
        }
        else if (value instanceof FillStylePattern) {
            if (value._img instanceof Image) {
                if (!(value._img.src in this._images)) {
                    new_image = GCanvas.createImage();
                    new_image.width = value._img.width;
                    new_image.height = value._img.height;
                    new_image.src = value._img.src;
                    new_image.complete = value._img.complete;
                    this._images[value._img.src] = new_image;
                } else {
                    this._drawCommands = this._drawCommands.concat("G" + this._images[value._img.src]._id + "," + value._style + ";");
                 }
            }
            else if (value._img instanceof GCanvasImage){
                this._drawCommands = this._drawCommands.concat("G" + value._img._id + "," + value._style + ";");
            }
        }
        else if (value instanceof FillStyleLinearGradient) {
            var command = "D" + value._start_pos._x + "," + value._start_pos._y + ","
                + value._end_pos._x + "," + value._end_pos._y + "," + value._stop_count;

            for (i = 0; i < value._stop_count; ++i) {
                command += ("," + value._stops[i]._pos + "," + value._stops[i]._color);
            }
            this._drawCommands = this._drawCommands.concat(command + ";");
            //console.log('createLinearGradient command -> ' + command);
        }
        else if (value instanceof FillStyleRadialGradient) {
            var command = "H" + value._start_pos._x + "," + value._start_pos._y + "," + value._start_pos._r + ","
                + value._end_pos._x + "," + value._end_pos._y + "," + value._end_pos._r + "," + value._stop_count;

            for (i = 0; i < value._stop_count; ++i) {
                command += ("," + value._stops[i]._pos + "," + value._stops[i]._color);
            }
            this._drawCommands = this._drawCommands.concat(command + ";");
            //console.log('FillStyleRadialGradient command -> ' + command);
        }
    }
});

/**
 * Represents the color or style for the lines. It can only be a string
 * which must be parsed as CSS <color> value for now.
 *
 * @type {string}
 * @name GContext2D#strokeStyle
 * @example // set context strokeStyle context.strokeStyle = 'rgb(121,194,245)';
 */
Object.defineProperty(GContext2D.prototype, "strokeStyle", {
    get : function() {
        return this._strokeStyle;
    },
    set : function(value) {
        this._strokeStyle = value;

        if (typeof(value) == 'string') {
            this._drawCommands = this._drawCommands.concat("S" + value + ";");
        }
        else if (value instanceof FillStylePattern) {
            if (value._img instanceof Image) {
                if (!(value._img.src in this._images)) {
                    new_image = GCanvas.createImage();
                    new_image.width = value._img.width;
                    new_image.height = value._img.height;
                    new_image.src = value._img.src;
                    new_image.complete = value._img.complete;
                    this._images[value._img.src] = new_image;
                } else {
                    this._drawCommands = this._drawCommands.concat("G" + this._images[value._img.src]._id + "," + value._style + ";");
                 }
            }
            else if (value._img instanceof GCanvasImage){
                this._drawCommands = this._drawCommands.concat("G" + value._img._id + "," + value._style + ";");
            }
        }
        else if (value instanceof FillStyleLinearGradient) {
            var command = "D" + value._start_pos._x + "," + value._start_pos._y + ","
                + value._end_pos._x + "," + value._end_pos._y + "," + value._stop_count;

            for (i = 0; i < value._stop_count; ++i) {
                command += ("," + value._stops[i]._pos + "," + value._stops[i]._color);
            }
            this._drawCommands = this._drawCommands.concat(command + ";");
            //console.log('createLinearGradient command -> ' + command);
        }
        else if (value instanceof FillStyleRadialGradient) {
            var command = "H" + value._start_pos._x + "," + value._start_pos._y + "," + value._start_pos._r + ","
                + value._end_pos._x + "," + value._end_pos._y + "," + value._end_pos._r + "," + value._stop_count;

            for (i = 0; i < value._stop_count; ++i) {
                command += ("," + value._stops[i]._pos + "," + value._stops[i]._color);
            }
            this._drawCommands = this._drawCommands.concat(command + ";");
            //console.log('FillStyleRadialGradient command -> ' + command);
        }
    }
});

/**
 * Represents the width of the lines.
 *
 * @type {number}
 * @name GContext2D#lineWidth
 * @example // set context lineWidth context.lineWidth = 2;
 */
Object.defineProperty(GContext2D.prototype, "lineWidth", {
    get : function() {
        return this._lineWidth;
    },
    set : function(value) {
        this._lineWidth = value;
        this._drawCommands = this._drawCommands.concat("W" + value
                + ";");
    }
});
/**
 * The lineCap property sets or returns the style of the end caps for a line.
 *
 * @type {number}
 * @name GContext2D#lineCap
 * @example // set context lineCap context.lineCap="round";
 */
Object.defineProperty(GContext2D.prototype, "lineCap", {
    get : function() {
        return this._lineCap;
    },
    set : function(value) {
        this._lineCap = value;
        this._drawCommands = this._drawCommands.concat("C" + value + ";");
    }
});


/**
 * Sets or returns the type of corner created, when two lines meet
 *
 * @type {number}
 * @name GContext2D#lineJoin
 * @example // set context lineJoin context.lineJoin="round";
 */
Object.defineProperty(GContext2D.prototype, "lineJoin", {
    get : function() {
        return this._lineJoin;
    },
    set : function(value) {
        this._lineJoin = value;
        this._drawCommands = this._drawCommands.concat("J" + value + ";");
    }
});


/**
 * Sets or returns the maximum miter length
 *
 * @type {number}
 * @name GContext2D#miterLimit
 * @example // set context miterLimit context.miterLimit=10;
 */
Object.defineProperty(GContext2D.prototype, "miterLimit", {
    get : function() {
        return this._miterLimit;
    },
    set : function(value) {
        this._miterLimit = value;
        this._drawCommands = this._drawCommands.concat("M" + value + ";");
    }
});

/**
 * Represents the globalCompositeOperation value to be used with drawing
 * commands where 1 is completely visible and 0 is fully transparent.
 *
 * @type {number}
 * @name GContext2D#globalCompositeOperation
 */
Object.defineProperty(GContext2D.prototype, "globalCompositeOperation", {
    get : function() {
        return this._globalCompositeOperation;
    },

    set : function(value) {
        // if (this._globalCompositeOperation != value) {

        this._globalCompositeOperation = value;
        mode = 0;
        switch (value) {
        case "source-over":
            mode = 0;
            break;
        case "source-atop":
            mode = 5;
            break;
        case "source-in":
            mode = 0;
            break;
        case "source-out":
            mode = 2;
            break;
        case "destination-over":
            mode = 4;
            break;
        case "destination-atop":
            mode = 4;
            break;
        case "destination-in":
            mode = 4;
            break;
        case "destination-out":
            mode = 3;
            break;
        case "lighter":
            mode = 1;
            break;
        case "copy":
            mode = 2;
            break;
        case "xor":
            mode = 6;
            break;
        default:
            mode = 0;
        }

        this._drawCommands = this._drawCommands.concat("B" + mode + ";");
        // }
    }
});

/**
 * Represents the textAlign value to be used with drawing commands
 *
 * @type {number}
 * @name GContext2D#textAlign
 */
Object.defineProperty(GContext2D.prototype, "textAlign", {
    get : function() {
        return this._textAlign;
    },

    set : function(value) {
        // if (this._textAlign != value) {
        this._textAlign = value;
        Align = 0;
        switch (value) {
        case "start":
            Align = 0;
            break;
        case "end":
            Align = 1;
            break;
        case "left":
            Align = 2;
            break;
        case "center":
            Align = 3;
            break;
        case "right":
            Align = 4;
            break;
        default:
            Align = 0;
        }

        this._drawCommands = this._drawCommands.concat("A" + Align + ";");
        // }
    }

});

/**
 * Represents the _textBaseline value to be used with drawing commands
 *
 * @type {number}
 * @name GContext2D#_textBaseline
 */
Object.defineProperty(GContext2D.prototype, "textBaseline", {
    get : function() {
        return this._textBaseline;
    },

    set : function(value) {
        this._textBaseline = value;
        var baseline = 0;
        switch (value) {
        case "alphabetic":
            baseline = 0;
            break;
        case "middle":
            baseline = 1;
            break;
        case "top":
            baseline = 2;
            break;
        case "hanging":
            baseline = 3;
            break;
        case "bottom":
            baseline = 4;
            break;
        case "ideographic":
            baseline = 5;
            break;
        default:
            baseline = 0;
            break;
        }

        this._drawCommands = this._drawCommands.concat("E" + baseline + ";");
    }

});

/**
 * Represents the textAlign value to be used with drawing commands
 *
 * @type {number}
 * @name GContext2D#textAlign
 */
Object.defineProperty(GContext2D.prototype, "font", {
    get : function() {
        return this._font;
    },
    set : function(value) {
        // if (this._font != value) {
        this._font = value;
        //this._apiContext.font = this._font;
        this._drawCommands = this._drawCommands.concat("j" + value + ";");
        // }
    }

});

/**
 * Loads an image into the plugin to be used as a texture in the GCanvas.
 * Generally this method is never called directly. Instead, it is called
 * indirectly through GCanvasImage instances upon setting their
 * {@link GCanvasImage#src|GCanvasImage.src} property.
 *
 * @param {GCanvasImage}
 *            image The image to be loaded into the GCanvas plugin.
 * @param {function}
 *            [successCallback] A callback that is fired when the image has
 *            been successfully loaded.
 * @param {function}
 *            [errorCallback] A callback that is fired when there was an
 *            error in loading the image.
 * @example // create a new image and load // it from a relative URL path
 *          var myImage = GCanvas.createImage(); myImage.src =
 *          "images/spritesheet.jpg"; // calls loadTexture for you
 * @private
 */
GContext2D.prototype.loadTexture = function(image, successCallback, errorCallback) {
    // if (successCallback && typeof successCallback !== 'function') {
    //     throw new Error(
    //             'GContext2D.loadTexture failure: successCallback parameter not a function');
    // }
    // if (errorCallback && typeof errorCallback !== 'function') {
    //     throw new Error(
    //             'GContext2D.loadTexture failure: errorCallback parameter not a function');
    // }

    // GCanvas._toNative(successCallback, errorCallback, 'GCanvas',
    //         'loadTexture', [ image.src, image._id ]);
};

/**
 * Unloads an image from the GCanvas plugin. Generally this method is
 * never called directly. Instead, it is called indirectly through
 * GCanvasImage instances upon setting their
 * {@link GCanvasImage#src|GCanvasImage.src} property to a false value
 * such as <code>null</code> or an empty string (<code>""</code>).
 *
 * @param {GCanvasImage}
 *            image The image to be unloaded from the GCanvas plugin.
 * @example // unload an image from memory myImage.src = null; // calls
 *          unloadTexture for you
 * @private
 */
GContext2D.prototype.unloadTexture = function(image) {
    // GCanvas._toNative(null, null, 'GCanvas', 'unloadTexture',
    //         [ image._id ]);
};

/**
 * Defines the 2D matrix transform applied to drawings within the context.
 *
 * @param {number}
 *            a The value that affects the positioning of pixels along the x
 *            axis when scaling or rotating the context.
 * @param {number}
 *            b The value that affects the positioning of pixels along the y
 *            axis when rotating or skewing the context.
 * @param {number}
 *            c The value that affects the positioning of pixels along the x
 *            axis when rotating or skewing the context.
 * @param {number}
 *            d The value that affects the positioning of pixels along the y
 *            axis when scaling or rotating the context.
 * @param {number}
 *            tx The distance by which to translate the context along the x
 *            axis.
 * @param {number}
 *            ty The distance by which to translate the context along the y
 *            axis.
 */
GContext2D.prototype.setTransform = function(a, b, c, d, tx, ty) {
    this._drawCommands = this._drawCommands.concat("t"
            + (a === 1 ? "1" : a.toFixed(6)) + ","
            + (b === 0 ? "0" : b.toFixed(6)) + ","
            + (c === 0 ? "0" : c.toFixed(6)) + ","
            + (d === 1 ? "1" : d.toFixed(6)) + "," + tx + "," + ty + ";");
};

/**
 * Defines an added 2D matrix transform applied to drawings within the
 * context.
 *
 * @param {number}
 *            a The value added to the value that affects the positioning of
 *            pixels along the x axis when scaling or rotating the context.
 * @param {number}
 *            b The value added to the value that affects the positioning of
 *            pixels along the y axis when rotating or skewing the context.
 * @param {number}
 *            c The value added to the value that affects the positioning of
 *            pixels along the x axis when rotating or skewing the context.
 * @param {number}
 *            d The value added to the value that affects the positioning of
 *            pixels along the y axis when scaling or rotating the context.
 * @param {number}
 *            tx The value added to the distance by which to translate the
 *            context along the x axis.
 * @param {number}
 *            ty The value added to the distance by which to translate the
 *            context along the y axis.
 */
GContext2D.prototype.transform = function(a, b, c, d, tx, ty) {
    this._drawCommands = this._drawCommands.concat("f"
            + (a === 1 ? "1" : a.toFixed(6)) + ","
            + (b === 0 ? "0" : b.toFixed(6)) + ","
            + (c === 0 ? "0" : c.toFixed(6)) + ","
            + (d === 1 ? "1" : d.toFixed(6)) + "," + tx + "," + ty + ";");
};

/**
 * Restores the 2D matrix transform to the identity matrix. This is
 * equivalent to calling <code>context.setTransform(1,0,0,1,0,0)</code>.
 */
GContext2D.prototype.resetTransform = function() {
    this._drawCommands = this._drawCommands.concat("m;");
};

/**
 * Scales the 2D matrix transform along the x and y axes.
 *
 * @param {number}
 *            a The value added to the value that affects the positioning of
 *            pixels along the x axis when scaling or rotating the context.
 * @param {number}
 *            d The value added to the value that affects the positioning of
 *            pixels along the y axis when scaling or rotating the context.
 */
GContext2D.prototype.scale = function(a, d) {
    this._drawCommands = this._drawCommands.concat("k" + a.toFixed(6) + ","
            + d.toFixed(6) + ";");
};

/**
 * Rotates the 2D matrix transform by a specified number of radians.
 *
 * @param {number}
 *            angle The value in radians to rotate the context.
 */
GContext2D.prototype.rotate = function(angle) {
    this._drawCommands = this._drawCommands
            .concat("r" + angle.toFixed(6) + ";");
};

/**
 * Moves the 2D matrix transform along the x and y axes.
 *
 * @param {number}
 *            tx The value added to the distance by which to translate the
 *            context along the x axis.
 * @param {number}
 *            ty The value added to the distance by which to translate the
 *            context along the y axis.
 */
GContext2D.prototype.translate = function(tx, ty) {
    this._drawCommands = this._drawCommands.concat("l" + tx + "," + ty + ";");
};

/**
 * Sets a save point for the current context transform. This allows you to
 * arbitrarily modify the transform and restore it back to its to its
 * original state at the time save() was called by using restore().
 *
 * @see GContext2D#restore
 */
GContext2D.prototype.save = function() {
    this._savedGlobalAlpha.push(this._globalAlpha);
    this._drawCommands = this._drawCommands.concat("v;");
};

/**
 * Restores the state of the context transform to the state at the point in
 * time when save() was last called.
 *
 * @see GContext2D#save
 */
GContext2D.prototype.restore = function() {
    this._drawCommands = this._drawCommands.concat("e;");
    this._globalAlpha = this._savedGlobalAlpha.pop();
};


GContext2D.prototype.drawImage = function(image, // image
sx, sy, sw, sh, // source (or destination if fewer args)
dx, dy, dw, dh) { // destination

    GLog.d("[GContext2D.drawImage] start...");

    if (typeof image !== 'string') {
        image = image.src;
    }
    
    GBridge.preLoadImage(image);

    var numArgs = arguments.length;

    this._drawCommands += ("d" + numArgs + "," + image + "," 
            + sx + "," + sy + "," + sw + "," + sh + "," 
            + dx + "," + dy + "," + dw + "," + dh + ";");
};

/**
 * Informs the drawing context that drawing commands have completed for the
 * current frame and the should be sent to the GCanvas plugin for drawing
 * to the screen.
 * <p>
 * This method is unique to GContext2D and does not exist within the HTML
 * 2D context, so the utility method {@link GCanvas.render} should be
 * used to make it easy to call or not call this method depending on the
 * context you are currently working with.
 * </p>
 *
 * @example // makes necessary GCanvas render call // if canvas being
 *          used is GCanvas var myCanvas = GCanvas.create(); var
 *          myContext = myCanvas.getContext("2d");
 *  // ... myContext.translate(10,10); myContext.rotate(Math.PI); //
 * ...
 *  // after all context calls are complete // for the current frame:
 * GCanvas.render(); // calls GContext2D.render()
 */

GContext2D.prototype.render = function(flag) {
    if (typeof flag === "undefined"){
        clearInterval(this.timer);
        this.timer = null;
    }
    var commands = this._drawCommands;
    this._drawCommands = "";
    if (commands != null && commands != "") {
        GLog.d("GContext2D#render() called, commands is "+ commands);
        GBridge.callRender(commands)
    }
};

/**
 * Implementation of GCanvas.capture.
 *
 * @private
 */
GContext2D.prototype.capture = function(x, y, w, h, fileName, successCallback, errorCallback) {
    // if (successCallback && typeof successCallback !== 'function') {
    //     throw new Error('successCallback parameter not a function');
    // }
    // if (errorCallback && typeof errorCallback !== 'function') {
    //     throw new Error('errorCallback parameter not a function');
    // }

    // GCanvas._toNative(successCallback, errorCallback, 'GCanvas',
    //         'capture', [ x, y, w, h, fileName ]);
};


GContext2D.prototype.createPattern = function(img, pattern) {
    return new FillStylePattern(img, pattern);
};

/**
 * Implementation of GCanvas.createLinearGradient(x0, y0, x1, y1).
 *
 * @private
 */
 GContext2D.prototype.createLinearGradient = function(x0, y0, x1, y1) {
    return new FillStyleLinearGradient(x0, y0, x1, y1);
};

/**
 * Implementation of GCanvas.createRadialGradient(x0, y0, x1, y1).
 *
 * @private
 */
 GContext2D.prototype.createRadialGradient = function(x0, y0, r0, x1, y1, r1) {
    return new FillStyleRadialGradient(x0, y0, r0, x1, y1, r1);
};

GContext2D.prototype.strokeRect = function(x, y, w, h, successCallback,
        errorCallback) {
    this._drawCommands = this._drawCommands.concat("s" + x + "," + y + "," + w
            + "," + h + ";");
};

GContext2D.prototype.clearRect = function(x, y, w, h, successCallback,
        errorCallback) {
    // TODO: enable it later.
    this._drawCommands = this._drawCommands.concat("c" + x + "," + y + "," + w
        + "," + h + ";");
}

GContext2D.prototype.clip = function(successCallback, errorCallback) {
    this._drawCommands = this._drawCommands.concat("p;");
}

GContext2D.prototype.resetClip = function(successCallback, errorCallback) {
    this._drawCommands = this._drawCommands.concat("q;");
}

GContext2D.prototype.closePath = function(successCallback, errorCallback) {
    this._drawCommands = this._drawCommands.concat("o;");
}

GContext2D.prototype.moveTo = function(x, y, successCallback, errorCallback) {
    this._drawCommands = this._drawCommands.concat("g" + x.toFixed(6) + ","
            + y.toFixed(6) + ";");
}

GContext2D.prototype.lineTo = function(x, y, successCallback, errorCallback) {
    this._drawCommands = this._drawCommands.concat("i" + x.toFixed(6) + ","
            + y.toFixed(6) + ";");
}

GContext2D.prototype.quadraticCurveTo = function(cpx, cpy, x, y,
        successCallback, errorCallback) {
    this._drawCommands = this._drawCommands.concat("u" + cpx + "," + cpy + ","
            + x + "," + y + ";");
}

GContext2D.prototype.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y,
        successCallback, errorCallback) {
    this._drawCommands = this._drawCommands.concat("z" + cp1x + "," + cp1y
            + "," + cp2x + "," + cp2y + "," + x + "," + y + ";");
}

GContext2D.prototype.arcTo = function(x1, y1, x2, y2, radius,
        successCallback, errorCallback) {
    this._drawCommands = this._drawCommands.concat("h" + x1 + "," + y1 + ","
            + x2 + "," + y2 + "," + radius + ";");
}

/**
 * Resets the current default path.
 *
 * @param null
 */
GContext2D.prototype.beginPath = function() {
    this._drawCommands = this._drawCommands.concat("b;");
};

/**
 * Paint the specified rectangular area using the fillStyle. If either
 * height or width are zero, this method has no effect.
 *
 * @param {number}
 *            x The x location of the source clipping rectangle
 * @param {number}
 *            y The y location of the source clipping rectangle
 * @param {number}
 *            w The width of the rectangle
 * @param {number}
 *            h The height of the rectangle
 */
GContext2D.prototype.fillRect = function(x, y, w, h) {
    this._drawCommands = this._drawCommands.concat("n" + x + "," + y + "," + w
            + "," + h + ";");
};

/**
 * Adds a new closed subpath to the path, representing the given rectangle.
 *
 * @param {number}
 *            x The x location of the rectangle
 * @param {number}
 *            y The y location of the rectangle
 * @param {number}
 *            w The width of the rectangle
 * @param {number}
 *            h The height of the rectangle
 */
GContext2D.prototype.rect = function(x, y, w, h) {
    this._drawCommands = this._drawCommands.concat("w" + x + "," + y + "," + w
            + "," + h + ";");
};

/**
 * Fills the subpaths of the current default path or the given path with the
 * current fill style.
 *
 * @param {string}
 *            path The given path to fill.
 */
GContext2D.prototype.fill = function(path) {
    this._drawCommands = this._drawCommands.concat("L;");
};

/**
 * Strokes the subpaths of the current default path or the given path with
 * the current stroke style.
 *
 * @param {string}
 *            path The given path to stroke.
 */
GContext2D.prototype.stroke = function(path) {
    this._drawCommands = this._drawCommands.concat("x;");
};

/**
 * Adds points to the subpath such that the arc described by the
 * circumference of the circle described by the arguments, starting at the
 * given start angle and ending at the given end angle, going in the given
 * direction (defaulting to clockwise), is added to the path, connected to
 * the previous point by a straight line.
 *
 * @param {number}
 *            x
 * @param {number}
 *            y
 * @param {number}
 *            radius
 * @param {number}
 *            startAngle
 * @param {number}
 *            endAngle
 * @param {string}
 *            anticlockwise
 */
GContext2D.prototype.arc = function(x, y, radius, startAngle, endAngle,
        anticlockwise) {

    var ianticlockwise = 0;
    if (anticlockwise)
        ianticlockwise = 1;

    this._drawCommands = this._drawCommands.concat("y" + x + "," + y + ","
            + radius + "," + startAngle + "," + endAngle + "," + ianticlockwise
            + ";");
};



GContext2D.prototype.fillText = function(text, x, y) {
    var tmptext =text.replace(/!/g,"!!");
        tmptext =tmptext.replace(/,/g,"!,");
        tmptext =tmptext.replace(/;/g,"!;");
    this._drawCommands = this._drawCommands.concat("T" + tmptext + "," + x + ","
            + y + ",0.0;");
};

GContext2D.prototype.strokeText = function(text, x, y) {
    this._drawCommands = this._drawCommands.concat("U" + text + "," + x + ","
            + y + ",0.0;");
};


//TODO:这个api有用需要原生的canvas对象，所以不支持
GContext2D.prototype.measureText = function(text) {
    return -1;
    //return this._apiContext.measureText(text);
};

GContext2D.prototype.isPointInPath = function(x,y) {
    return true;
};


/////////////////////////////////////////////////////////////////
//base64
/////////////////////////////////////////////////////////////////

function GarrToBase64(buffer) {
    var binary = ''
    var bytes = new Uint8Array( buffer )
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] )
    }
    return window.btoa( binary );
}

function _GcharDecode (nChr) {
  return nChr > 64 && nChr < 91 ?
      nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
    : nChr > 47 && nChr < 58 ?
      nChr + 4
    : nChr === 43 ?
      62
    : nChr === 47 ?
      63
    :
      0;
}

function Gbase64ToArr (sBase64, nBlocksSize) {
  var
    sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
    nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2, taBytes = new Uint8Array(nOutLen);

  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUint24 |= _GcharDecode(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
      }
      nUint24 = 0;

    }
  }

  return taBytes;
}



/////////////////////////////////////////////////////////////////
//GCanvasImage
/////////////////////////////////////////////////////////////////
function GImageData(w, h) {
    GLog.d("GImageData wh=" + w + "," + h);
    this.width = w;
    this.height = h;
    this.data = new Uint8Array(w*h*4);
}

GContext2D.prototype.createImageData = function(w, h) {
    GLog.d("GContext2D::createImageData wh=" + w + "," + h);
    return new GImageData(w,h);
};


GContext2D.prototype._putImageData = function(data,dx, dy, sw, sh,  dw, dh){
    this._drawCommands = this._drawCommands.concat("P"
        + dx + ","
        + dy + ","
        + sw + ","
        + sh + ","
        + dw + ","
        + dh + ","
        + GarrToBase64(data) + ";");
}
GContext2D.prototype.putImageData = function(imgData, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
    GLog.d("GContext2D::putImageData [" + arguments.length + "] "
        + "dest_xy=(" + x + "," + y + ") "
        + "dirty_xy=(" + dirtyX + "," + dirtyY + ") "
        + "dirty_wh=(" + dirtyWidth + "," + dirtyHeight + ") ");

    if (arguments.length <= 3){
        this._putImageData(imgData.data, x, y, imgData.width, imgData.height, imgData.width, imgData.height);
    }
    else{
        var destData = new Uint8Array(dirtyWidth*dirtyHeight*4);
        var imgPos;
        var destPos = 0
        for(var i =0; i < dirtyHeight; i++){
            imgPos = (imgData.width*(dirtyY + i) + dirtyX)*4;
            for(var j=0; j< dirtyWidth; ++j){
                destData[destPos++]=imgData.data[imgPos++];
                destData[destPos++]=imgData.data[imgPos++];
                destData[destPos++]=imgData.data[imgPos++];
                destData[destPos++]=imgData.data[imgPos++];
            }
        }

        this._putImageData(destData, x+dirtyX, y+dirtyY, dirtyWidth, dirtyHeight, dirtyWidth, dirtyHeight);
    }
};


GContext2D.prototype.getImageDataAsyn = function(x, y, w, h) {
    return '';
    // GLog.d("GContext2D::getImageDataAsyn xy=(" + x + "," + y + "), wh=(" + w + ","+ h +")");
    // GCanvas._instance.getContext().render("auto");
    // var len = w*h;
    // var imgData = new GImageData(w,h);
    // imgData._x = x;
    // imgData._y = y;
    // imgData._dataGet = 0;
    // imgData._split = 0;
    // var me = this;
    // me._getImageData.push(imgData);

    // var h2 = Math.floor(262144/w);// 2^18
    // if (h2 < h)
    //     imgData._split = 1;

    // function getImageDataAsynSuccess(getData) {
    //     var destData = me._getImageData[0];
    //     GLog.d("GContext2D::getImageDataAsyn: dataGet=" + destData._dataGet);
    //     if (0 == destData._split){// one part
    //         destData.data = Gbase64ToArr(getData);
    //         destData._dataGet += destData.data.length;
    //     }else{// multi parts
    //         var taBytes  = Gbase64ToArr(getData);
    //         destData._dataGet += taBytes.length;
    //         for (var i=0;i<taBytes.length;i++){
    //             destData.data[destData._dataGet+i] = taBytes[i];
    //         }
    //     }

    //     if (destData._dataGet >= (destData._x*destData._y)){
    //         if (typeof destData.onload === 'function') {
    //             GLog.d("GContext2D::getImageDataAsyn: callback exec.");
    //             destData.onload();
    //         }
    //         me._getImageData.splice(0,1);//delete first data
    //     }
    // }

    // for(var i=0; i<h; i+= h2){
    //     GCanvas._toNative(getImageDataAsynSuccess, getImageDataAsynSuccess, 'GCanvas',
    //             'getImageData', [ x, y+i, w, (i+h2>h)?(h-i):h2 ]);
    // }


    // return imgData;
};



module.exports = GContext2D;
