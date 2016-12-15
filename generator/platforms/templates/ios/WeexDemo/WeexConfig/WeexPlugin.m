//
//  WeexPlugin.m
//  WeexDemo
//
//  Created by yangshengtao on 16/11/15.
//  Copyright © 2016年 taobao. All rights reserved.
//

#import "WeexPlugin.h"
#import "DemoDefine.h"
#import "WeexConfigParser.h"
#import <WeexSDK/WeexSDK.h>
@interface WeexPlugin ()

@property (nonatomic, readwrite, strong) NSXMLParser* configParser;
@property (nonatomic, readwrite, copy) NSString* configFile;
@property (nonatomic, readwrite, strong) NSArray *pluginNames;
@property (nonatomic, readwrite, strong) NSDictionary* settings;

@end

@implementation WeexPlugin

@synthesize configParser, configFile;
- (id)init
{
    self = [super init];
    if (self != nil) {
        [self loadSettings];
    }
    return self;
}

- (void)registerWeexPlugin
{
    [self.pluginNames enumerateObjectsUsingBlock:^(id  _Nonnull obj, NSUInteger idx, BOOL * _Nonnull stop) {
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

-(NSString*)configFilePath
{
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

- (void)loadSettings
{
    WeexConfigParser *delegate = [[WeexConfigParser alloc] init];
    [self parseSettingsWithParser:delegate];
    self.pluginNames = [NSArray arrayWithArray:delegate.pluginNames];
    self.settings = [NSDictionary dictionaryWithDictionary:delegate.settings];
}


- (NSURL *)jsBundleURL
{
    if (!self.settings) {
        return nil;
    }
    NSURL *jsBundleUrl = nil;
    if (self.settings[@"launch_locally"] && [self.settings[@"launch_locally"] boolValue]) {
        NSString *jsFile = self.settings[@"local_url"];
        if (jsFile && ![jsFile isEqualToString:@""]) {
            jsBundleUrl = [NSURL URLWithString:[NSString stringWithFormat:@"file://%@/bundlejs/%@",[NSBundle mainBundle].bundlePath,jsFile]];
        }else {
            jsBundleUrl = [NSURL URLWithString:[NSString stringWithFormat:@"file://%@/bundlejs/index.js",[NSBundle mainBundle].bundlePath]];
        }
    }else {
        NSString *hostAddress = self.settings[@"launch_url"];
        if (hostAddress && ![hostAddress isEqualToString:@""]) {
            jsBundleUrl = [NSURL URLWithString:[NSString stringWithFormat:@"http://%@:8080/dist/index.js",hostAddress]];
        }else {
            jsBundleUrl = [NSURL URLWithString:[NSString stringWithFormat:@"http://%@:8080/dist/index.js", [self getPackageHost]]];
        }
    }
    return jsBundleUrl;
}

- (NSString *)getPackageHost
{
    static NSString *ipGuess;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        NSString *ipPath = [[NSBundle mainBundle] pathForResource:@"ip" ofType:@"txt"];
        ipGuess = [[NSString stringWithContentsOfFile:ipPath encoding:NSUTF8StringEncoding error:nil]
                   stringByTrimmingCharactersInSet:[NSCharacterSet newlineCharacterSet]];
    });
    
    NSString *host = ipGuess ?: @"localhost";
    return host;
}

@end
