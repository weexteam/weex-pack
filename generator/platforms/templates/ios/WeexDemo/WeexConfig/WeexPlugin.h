//
//  WeexPlugin.h
//  WeexDemo
//
//  Created by yangshengtao on 16/11/15.
//  Copyright © 2016年 taobao. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface WeexPlugin : NSObject

@property (nonatomic, readonly, copy) NSString* configFile;


- (void)registerWeexPlugin;

- (NSURL *)jsBundleURL;

@end
