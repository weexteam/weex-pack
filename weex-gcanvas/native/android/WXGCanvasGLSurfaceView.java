package com.alibaba.weex.extend.component;


import android.content.Context;
import android.graphics.Canvas;
import android.view.MotionEvent;
import android.view.SurfaceHolder;

import com.taobao.gcanvas.GCanvasView;
import com.taobao.weex.dom.WXDomObject;
import com.taobao.weex.ui.view.gesture.WXGesture;
import com.taobao.weex.ui.view.gesture.WXGestureObservable;


public class WXGCanvasGLSurfaceView extends GCanvasView implements WXGestureObservable {


    private WXGesture wxGesture;

    public WXGCanvasGLSurfaceView(Context context, WXDomObject element) {
        super(context);

    }


    @Override
    protected void onDraw(Canvas canvas) {

        super.onDraw(canvas);

    }

    @Override
    public void registerGestureListener(WXGesture wxGesture) {
        this.wxGesture = wxGesture;
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        boolean result = super.onTouchEvent(event);
        if (wxGesture != null) {
            result |= wxGesture.onTouch(this, event);
        }
        return result;
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right,
                            int bottom) {

        super.onLayout(changed, left, top, right, bottom);

    }


    @Override
    public void surfaceDestroyed(SurfaceHolder holder) {

        super.surfaceDestroyed(holder);


    }

}
