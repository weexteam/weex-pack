//
//  WXGCanvasComponent.m
//  Pods
//
//  Created by Alibaba on 16/8/16.
//
//

#import "WXGCanvasComponent.h"
#import <GLKit/GLKit.h>
#import <GCanvas/GCVCommon.h>


@interface WXGCanvasComponent()

@property(nonatomic, assign) CGRect frame;
    
@end

@implementation WXGCanvasComponent


/**
 *  @abstract Initializes a new component using the specified  properties.
 *
 *  @param ref          the identity string of component
 *  @param type         component type
 *  @param styles       component's styles
 *  @param attributes   component's attributes
 *  @param events       component's events
 *  @param weexInstance the weexInstance with which the component associated
 *
 *  @return A WXComponent instance.
 */
- (instancetype)initWithRef:(NSString *)ref
                       type:(NSString*)type
                     styles:(nullable NSDictionary *)styles
                 attributes:(nullable NSDictionary *)attributes
                     events:(nullable NSArray *)events
               weexInstance:(WXSDKInstance *)weexInstance{
    GCVLOG_METHOD(@"ref=%@, type=%@, styles=%@, attributes=%@, events=%@, weexInstance=%@", ref, type, styles, attributes, events, weexInstance)
    self = [super initWithRef:ref type:type styles:styles attributes:attributes events:events weexInstance:weexInstance];
    if (self )
    {
        CGPoint origin = [[UIScreen mainScreen] bounds].origin;
        CGSize size = [[UIScreen mainScreen] bounds].size;
        
        if (styles[@"left"])
        {
            origin.x = [styles[@"left"] floatValue];
        }
        
        if (styles[@"top"])
        {
            origin.y = [styles[@"top"] floatValue];
        }
        
        if (styles[@"width"])
        {
            size.width = [styles[@"width"] floatValue];
        }
        
        if (styles[@"height"])
        {
            size.height = [styles[@"height"] floatValue];
        }
        
        self.frame = CGRectMake(origin.x, origin.y, size.width, size.height);
        
        GLKView *glkview = [[GLKView alloc] initWithFrame:self.frame];
        glkview.context = [[EAGLContext alloc] initWithAPI:kEAGLRenderingAPIOpenGLES2];
        [EAGLContext setCurrentContext:glkview.context];
        glkview.enableSetNeedsDisplay = NO;
        glkview.userInteractionEnabled = NO;
        glkview.drawableDepthFormat = GLKViewDrawableDepthFormat24;
        glkview.layer.borderWidth = 0.5f;
        
        self.glkview = glkview;
        self.componetFrame = self.frame;
        
        GCVLOG_METHOD(@"frame=(%.2f, %.2f) * (%.2f, %.2f)", self.frame.origin.x, self.frame.origin.y, self.frame.size.width, self.frame.size.height);
    }
    
    return self;
}


- (UIView *)loadView
{
    return self.glkview;
}

@end
