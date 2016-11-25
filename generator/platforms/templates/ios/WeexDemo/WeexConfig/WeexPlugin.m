//
//  WeexPlugin.m
//  WeexDemo
//
//  Created by yangshengtao on 16/11/15.
//  Copyright © 2016年 taobao. All rights reserved.
//

#import "WeexPlugin.h"
#import "WXEventModule.h"
#import "WXImgLoaderDefaultImpl.h"
#import "WeexConfigParser.h"
#import <WeexSDK/WeexSDK.h>
@interface WeexPlugin ()

@property (nonatomic, readwrite, strong) NSXMLParser* configParser;
@property (nonatomic, readwrite, copy) NSString* configFile;

@end

@implementation WeexPlugin

@synthesize configParser, configFile;

- (void)registerWeexPlugin {
    
    [self loadSettings];
}

- (void)loadSettings {
    WeexConfigParser *delegate = [[WeexConfigParser alloc] init];
    [self parseSettingsWithParser:delegate];
    [delegate.pluginNames enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
        NSDictionary *pluginInfo = (NSDictionary *)obj;
        if ([pluginInfo[@"name"] isEqualToString:@"handle"] && pluginInfo[@"protocol"]) {
            
            [WXSDKEngine registerHandler:[NSClassFromString(pluginInfo[@"ios-package"]) new]
                                          withProtocol:NSProtocolFromString(pluginInfo[@"protocol"])];
        }else if ([pluginInfo[@"name"] isEqualToString:@"component"] && pluginInfo[@"ios-package"]) {
            [WXSDKEngine registerComponent:pluginInfo[@"api"] withClass:NSClassFromString(pluginInfo[@"ios-package"])];
        }else if ([pluginInfo[@"name"] isEqualToString:@"module"] && pluginInfo[@"ios-package"]) {
            [WXSDKEngine registerModule:pluginInfo[@"api"] withClass:NSClassFromString(pluginInfo[@"ios-package"])];
        }
    }];
}

- (void)parseSettingsWithParser:(NSObject <NSXMLParserDelegate>*)delegate
{
    // read from config.xml in the app bundle
    NSString* path = [self configFilePath];
    
    NSURL* url = [NSURL fileURLWithPath:path];
    
    self.configParser = [[NSXMLParser alloc] initWithContentsOfURL:url];
    if (self.configParser == nil) {
        NSLog(@"Failed to initialize XML parser.");
        return;
    }
    [self.configParser setDelegate:((id < NSXMLParserDelegate >)delegate)];
    [self.configParser parse];
}

-(NSString*)configFilePath{
    NSString* path = self.configFile ?: @"config.xml";
    
    // if path is relative, resolve it against the main bundle
    if(![path isAbsolutePath]){
        NSString* absolutePath = [[NSBundle mainBundle] pathForResource:path ofType:nil];
        if(!absolutePath){
            NSAssert(NO, @"ERROR: %@ not found in the main bundle!", path);
        }
        path = absolutePath;
    }
    
    // Assert file exists
    if (![[NSFileManager defaultManager] fileExistsAtPath:path]) {
        NSAssert(NO, @"ERROR: %@ does not exist. Please run cordova-ios/bin/cordova_plist_to_config_xml path/to/project.", path);
        return nil;
    }
    
    return path;
}

@end
