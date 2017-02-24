//
//  WXGCanvasModule.m
//  Pods
//
//  Created by Alibaba on 16/8/16.
//
//

#import "WXGCanvasModule.h"
#import "WXGCanvasComponent.h"
#import <GCanvas/GCVCommon.h>
#import <GCanvas/GCanvasPlugin.h>
#import <WeexSDK/WXComponentManager.h>
#import <SDWebImage/SDWebImageManager.h>

@interface WXGCanvasModule()<GLKViewDelegate>
    
@property (nonatomic, weak) WXGCanvasComponent *gcanvasComponent;
@property (nonatomic, strong) NSString* componentRel;
@property (nonatomic, strong) GCanvasPlugin* gcanvasPlugin;
@property (nonatomic, assign) CGFloat devicePixelRatio;
@property (nonatomic, assign) BOOL gcanvasInitalized;

@end


@implementation WXGCanvasModule

@synthesize weexInstance;

WX_EXPORT_METHOD(@selector(getDeviceInfo:callback:));
WX_EXPORT_METHOD(@selector(enable:callback:));
WX_EXPORT_METHOD(@selector(disable:callback:));
WX_EXPORT_METHOD(@selector(render:));
WX_EXPORT_METHOD(@selector(preLoadImage:callback:));
WX_EXPORT_METHOD(@selector(setContextType:));
WX_EXPORT_METHOD(@selector(setLogLevel:));


- (void)dealloc
{
    [NSObject cancelPreviousPerformRequestsWithTarget:self];
    [[GCVCommon sharedInstance] clearLoadImageDict];
}

#pragma mark - Weex Export Method

- (void)getDeviceInfo:(NSDictionary *)args callback:(WXModuleCallback)callback
{
    callback(@{@"result":@"success", @"data":@{@"platform":@"iOS"}});
}

- (void)enable:(NSDictionary *)args callback:(WXModuleCallback)callback
{
    GCVLOG_METHOD(@"args=%@", args);
    if (!args || !args[@"componentId"])
    {
        callback(@{@"result":@"fail", @"errorMsg":@"input args is error."});
        return;
    }
    
    self.componentRel = args[@"componentId"];//由于component的初始化可能比module慢，所以只在第一次使用时在对component进行初始化处理
    self.gcanvasPlugin = [[GCanvasPlugin alloc] init];
    
    callback(@{@"result":@"success"});
}

- (void)disable:(NSDictionary *)args callback:(WXModuleCallback)callback
{
    GCVLOG_METHOD(@"args=%@", args);
    callback(@{@"result":@"success"});
}

- (void)render:(NSArray *)commands
{
    GCVLOG_METHOD(@"commands=%@, gcanvasComponent=%@", commands, self.gcanvasComponent);
    [self.gcanvasPlugin addCommands:commands];
    [self execCommand];
}

//预加载image，便于后续渲染时可以同步执行
- (void)preLoadImage:(NSString *)src callback:(WXModuleCallback)callback
{
    GCVLOG_METHOD(@" PreLoadImage start...");
    
    [GCVCommon sharedInstance].imageLoader = self;
    [[GCVCommon sharedInstance] addPreLoadImage:src completion:^(GCVImageCache *imageCache) {
        if (!imageCache)
        {
            callback(@{});
            return;
        }
        CGImageRef cgimageRef = imageCache.image.CGImage;
        CGFloat width = CGImageGetWidth(cgimageRef);
        CGFloat height = CGImageGetHeight(cgimageRef);
        callback(@{@"width":@(width), @"height":@(height)});
        
//        GLuint tid = imageCache.textureId;
//        if (tid == 0) {
//            tid = [GCVCommon bindTexture:imageCache.image];
//            imageCache.textureId = tid;
//            [self.gcanvasPlugin addTextureId:tid withAppId:tid width:width height:height];
//        }
//        
//        callback(@{@"width":@(width), @"height":@(height), @"textureId":@(tid)});
        
//        CGSize size = imageCache.image.size;
//        CGFloat scale = [UIScreen mainScreen].nativeScale;
//        callback(@{@"width":@(size.width*scale), @"height":@(size.height*scale), @"textureId":@(imageCache.textureId)});
        
        
//        [self.gcanvasPlugin execCommands];
    }];
}

//设置Context类型
- (void)setContextType:(NSUInteger)type
{
    if (type == 0) {
        NSLog(@"GCanvas 2D");
    }else{
        NSLog(@"WebGL 3D");
    }
}

//设置Context类型
- (void)setLogLevel:(NSUInteger)level
{
    
}

#pragma mark - Private
- (WXGCanvasComponent *)gcanvasComponent
{
    if (!_gcanvasComponent)
    {
        dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
        WXPerformBlockOnComponentThread(^{
            _gcanvasComponent = (WXGCanvasComponent *)[self.weexInstance componentForRef:self.componentRel];
            GCVLOG_METHOD(@" _gcanvasComponent=%@", _gcanvasComponent);
            if (_gcanvasComponent && [_gcanvasComponent isKindOfClass:[WXGCanvasComponent class]])
            {
                _gcanvasComponent.glkview.delegate = self;
            }
            dispatch_semaphore_signal(semaphore);
        });
        dispatch_semaphore_wait(semaphore, DISPATCH_TIME_FOREVER);
    }
    return _gcanvasComponent;
}

- (void)execCommand
{
    GCVLOG_METHOD(@" start... self.gcanvasComponent=%@", self.gcanvasComponent);
    if (self.gcanvasComponent.isViewLoaded)
    {
        if ([self.gcanvasComponent isKindOfClass:[WXGCanvasComponent class]])
        {
            GCVLOG_METHOD(@" call glkView display");
            [self.gcanvasComponent.glkview display];
        }
        else
        {
            [self.gcanvasPlugin removeCommands];
        }
    }
    else
    {
        //gcanvasComponent组件未加载则延迟执行命令
        [self performSelector:@selector(execCommand) withObject:nil afterDelay:0.05f];
    }
}

#pragma mark - GLKViewDelegate
- (void)glkView:(GLKView*)view drawInRect:(CGRect)rect
{
    GCVLOG_METHOD(@"rect=(%.2f, %.2f) * (%.2f, %.2f)", rect.origin.x, rect.origin.y, rect.size.width, rect.size.height);
    
    if(!self.gcanvasComponent.glkview.context)
    {
        return;
    }
    
    if (!self.gcanvasInitalized)
    {
        //初始化EAGLContext
        [EAGLContext setCurrentContext:self.gcanvasComponent.glkview.context];
        
        //设置gcanvas像素比率
        self.devicePixelRatio = self.gcanvasComponent.calculatedFrame.size.width * [UIScreen mainScreen].nativeScale / self.gcanvasComponent.componetFrame.size.width ;
        [self.gcanvasPlugin setDevicePixelRatio:self.devicePixelRatio];
        
        //设置gcanvas frame
        CGRect compFrame = self.gcanvasComponent.componetFrame;
        CGRect gcanvasFrame = CGRectMake(compFrame.origin.x,
                                         compFrame.origin.y,
                                         compFrame.size.width*self.devicePixelRatio,
                                         compFrame.size.height*self.devicePixelRatio);
        [self.gcanvasPlugin setFrame:gcanvasFrame];
        
        self.gcanvasInitalized = YES;
    }
    
//    glViewport(0, 0, view.drawableWidth, view.drawableHeight);
//    GLint vpArray[4];
//    glGetIntegerv(GL_VIEWPORT,vpArray);
    
    [self.gcanvasPlugin execCommands];
}

#pragma mark - GCVImageLoaderProtocol
- (void)loadImage:(NSURL*)url completed:(GCVLoadImageCompletion)completion
{
    [[SDWebImageManager sharedManager] downloadImageWithURL:url
                                                    options:0
                                                   progress:nil
                                                  completed:^(UIImage *image, NSError *error, SDImageCacheType cacheType, BOOL finished, NSURL *imageURL) {
                                                      completion(image, error, finished, url);
    }];
}
@end



