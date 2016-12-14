//
//  WeexSDKManager.m
//  WeexDemo
//
//  Created by yangshengtao on 16/11/14.
//  Copyright © 2016年 taobao. All rights reserved.
//

#import "WeexSDKManager.h"
#import "DemoDefine.h"
#import "WeexPlugin.h"
#import <WeexSDK/WeexSDK.h>

@implementation WeexSDKManager

+ (void)setup {
    NSURL *url = nil;
    WeexPlugin *loader = [WeexPlugin new];
#if DEBUG
    //If you are debugging in device , please change the host to current IP of your computer.
    url = [loader jsBundleURL];
    if (!url) {
        url = [NSURL URLWithString:BUNDLE_URL];
    }
#else
    url = [NSURL URLWithString:BUNDLE_URL];
#endif
    [self initWeexSDK];
    
    [loader registerWeexPlugin];
    
    WXBaseViewController *demoController = [[WXBaseViewController alloc] initWithSourceURL:url];
    [[UIApplication sharedApplication] delegate].window.rootViewController = [[WXRootViewController alloc] initWithRootViewController: demoController];
}

+ (void)initWeexSDK {
    [WXAppConfiguration setAppGroup:@"AliApp"];
    [WXAppConfiguration setAppName:@"WeexDemo"];
    [WXAppConfiguration setAppVersion:@"1.8.3"];
    [WXAppConfiguration setExternalUserAgent:@"ExternalUA"];
    
    [WXSDKEngine initSDKEnviroment];
    
#ifdef DEBUG
    [WXLog setLogLevel:WXLogLevelLog];
#endif
}

@end
