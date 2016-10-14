package com.alibaba.weex;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.text.TextUtils;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.alibaba.weex.commons.AbsWeexActivity;
import com.alibaba.weex.commons.util.AppConfig;
import com.google.zxing.client.android.CaptureActivity;
import com.taobao.weex.WXRenderErrorCode;
import com.taobao.weex.WXSDKInstance;
import com.taobao.weex.utils.WXSoInstallMgrSdk;

public class IndexActivity extends AbsWeexActivity {

  private static final String TAG = "IndexActivity";
  private static final int CAMERA_PERMISSION_REQUEST_CODE = 0x1;
  private static final String DEFAULT_IP = "your_current_IP";
  private static String sCurrentIp = DEFAULT_IP;//"127.0.0.1"; // your_current_IP

  private ProgressBar mProgressBar;
  private TextView mTipView;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_index);
    setContainer((ViewGroup) findViewById(R.id.index_container));
    Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
    setSupportActionBar(toolbar);

    mProgressBar = (ProgressBar) findViewById(R.id.index_progressBar);
    mTipView = (TextView) findViewById(R.id.index_tip);
    mProgressBar.setVisibility(View.VISIBLE);
    mTipView.setVisibility(View.VISIBLE);


    if (!WXSoInstallMgrSdk.isCPUSupport()) {
      mProgressBar.setVisibility(View.INVISIBLE);
      mTipView.setText(R.string.cpu_not_support_tip);
      return;
    }

    loadUrl(isLocalPage() ? AppConfig.getLocalUrl() : AppConfig.getLaunchUrl());
  }

  @Override
  protected boolean isLocalPage() {
    // return TextUtils.equals(sCurrentIp, DEFAULT_IP);
    return AppConfig.isLaunchLocally();
  }

  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
    getMenuInflater().inflate(isLocalPage() ? R.menu.main_scan : R.menu.main, menu);
    return super.onCreateOptionsMenu(menu);
  }

  protected void preRenderPage() {
    mProgressBar.setVisibility(View.VISIBLE);
  }

  @Override
  public boolean onOptionsItemSelected(MenuItem item) {
    switch (item.getItemId()) {
      case R.id.action_refresh:
        createWeexInstance();
        renderPage();
        break;
      case R.id.action_scan:
        scanQrCode();
        break;
      default:
        break;
    }

    return super.onOptionsItemSelected(item);
  }

  private void scanQrCode() {
    runWithPermissionsCheck(CAMERA_PERMISSION_REQUEST_CODE, Manifest.permission.CAMERA, new Runnable() {
      @Override
      public void run() {
        Intent intent = new Intent(IndexActivity.this, CaptureActivity.class);
        intent.setPackage(getPackageName());
        startActivity(intent);
      }
    });
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    if (requestCode == CAMERA_PERMISSION_REQUEST_CODE && grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
      scanQrCode();
    } else {
      Toast.makeText(this, "request camera permission fail!", Toast.LENGTH_SHORT).show();
    }
  }

  @Override
  public void onRenderSuccess(WXSDKInstance instance, int width, int height) {
    mProgressBar.setVisibility(View.GONE);
    mTipView.setVisibility(View.GONE);
  }

  @Override
  public void onException(WXSDKInstance instance, String errCode, String msg) {
    mProgressBar.setVisibility(View.GONE);
    mTipView.setVisibility(View.VISIBLE);
    if (TextUtils.equals(errCode, WXRenderErrorCode.WX_NETWORK_ERROR)) {
      mTipView.setText(R.string.index_tip);
    } else {
      mTipView.setText("render error:" + msg);
    }
  }

}

