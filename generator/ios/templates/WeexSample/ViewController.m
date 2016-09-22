//
//  ViewController.m
//  WeexSample
//
//  Created by zifan.zx on 6/12/16.
//  Copyright © 2016. All rights reserved.
//

#import "ViewController.h"

#import <WeexSDK/WeexSDK.h>

@interface ViewController ()

@property (nonatomic, strong) WXSDKInstance *instance;
@property (nonatomic, strong) UIView *weexView;
@property (nonatomic, assign) CGFloat weexHeight;

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    _weexHeight = self.view.frame.size.height - 64;
    [self.navigationController.navigationBar setHidden:YES];
    [self render];
}

- (void)dealloc
{
    [_instance destroyInstance];
}

- (void)render
{
    _instance = [[WXSDKInstance alloc] init];
    _instance.viewController = self;
    CGFloat width = self.view.frame.size.width;
    _instance.frame = CGRectMake(self.view.frame.size.width-width, 0, width, _weexHeight);
    
    __weak typeof(self) weakSelf = self;
    _instance.onCreate = ^(UIView *view) {
        [weakSelf.weexView removeFromSuperview];
        weakSelf.weexView = view;
        [weakSelf.view addSubview:weakSelf.weexView];
        UIAccessibilityPostNotification(UIAccessibilityScreenChangedNotification, weakSelf.weexView);
    };
    _instance.onFailed = ^(NSError *error) {
        NSLog(@"failed %@",error);
    };
    
    _instance.renderFinish = ^(UIView *view) {
        NSLog(@"render finish");
    };
    
    _instance.updateFinish = ^(UIView *view) {
        NSLog(@"update Finish");
    };
    NSString *url = [NSString stringWithFormat:@"file://%@/hello.js",[NSBundle mainBundle].bundlePath];
    
    [_instance renderWithURL:[NSURL URLWithString:url] options:@{@"bundleUrl":url} data:nil];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
