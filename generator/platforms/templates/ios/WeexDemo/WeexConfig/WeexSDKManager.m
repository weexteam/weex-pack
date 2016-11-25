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
#if DEBUG
    //If you are debugging in device , please change the host to current IP of your computer.
    url = [NSURL URLWithString:BUNDLE_URL];
#else
    url = [NSURL URLWithString:BUNDLE_URL];
#endif
    [self initWeexSDK];
    WXBaseViewController *demoController = [[WXBaseViewController alloc] initWithSourceURL:url];
    [[UIApplication sharedApplication] delegate].window.rootViewController = [[WXRootViewController alloc] initWithRootViewController: demoController];
}

+ (void)initWeexSDK {
    [WXAppConfiguration setAppGroup:@"AliApp"];
    [WXAppConfiguration setAppName:@"WeexDemo"];
    [WXAppConfiguration setAppVersion:@"1.8.3"];
    [WXAppConfiguration setExternalUserAgent:@"ExternalUA"];
    
    [WXSDKEngine initSDKEnviroment];
    
    WeexPlugin *loader = [WeexPlugin new];
    [loader registerWeexPlugin];
    
#ifdef DEBUG
    [WXLog setLogLevel:WXLogLevelLog];
#endif
}

@end
