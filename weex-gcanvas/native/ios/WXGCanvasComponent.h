//
//  WXGCanvasComponent.h
//  Pods
//
//  Created by Alibaba on 16/8/16.
//
//

#import <UIKit/UIKit.h>
#import <WeexSDK/WXComponent.h>
#import <GLKit/GLKit.h>

@interface WXGCanvasComponent : WXComponent

@property(nonatomic, strong) GLKView* glkview;
@property(nonatomic, assign) CGRect componetFrame;
    
@end
