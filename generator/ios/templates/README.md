# WeexOCExample

#### You must replace file in WeexSample/lib/WeexSDK.framework and then WeexSample project can run correctly

### How to  get WeexSDK.framework

recommend you to <a href="#compile">compile</a> from Weex source [here](https://github.com/alibaba/weex),so that you can get the new feature, and can build your own Weex SDK after modifying

- clone [Weex](https://github.com/alibaba/weex) project  
  you can use SSH
  
	```
	git clone git@github.com:alibaba/weex.git
	```
  or use https   
  
	```
	git clone https://github.com/alibaba/weex.git
	```
  	    
- open WeexSDK.xcodeproj in `weex/ios/sdk`  
  switch target just below  
  ![img](http://img1.tbcdn.cn/L1/461/1/4fe050b36e7fea52f121e73790b1fdb7ea934e97)
  
- Build this project or use the xcode default hot key `⌘ + b`

- Finally you can find `Products` directory in `weex/ios/sdk`, `WeexSDK.framework` was here

  ![img](http://img4.tbcdn.cn/L1/461/1/52594fea03ee1154845d0f897558b81b4b5bef2e)

### Integrate to your Objective-C project
- Import the framework you get above and import system framework
  ![img](http://img1.tbcdn.cn/L1/461/1/ce309c54c7b3dd3607d7a3d07c44bfd0e0e10f86) 
- Add `SocketRocket`：copy [here](https://github.com/alibaba/weex/tree/dev/ios/sdk/WeexSDK/dependency) `SRWebSocket.h/m` to your own Project  （if cocoaPods is used in your project，add `pod 'SocketRocket'` to Podfie )
- Add `main.js`(which is in the `WeexSDK.framework`) to your main bundle
  ![img](http://img1.tbcdn.cn/L1/461/1/bb3998595bafe9c9336411160c0b6bd3eeb843ef)
  
#### important
add `-ObjC` to your project build settings,just like this

![img](http://img3.tbcdn.cn/L1/461/1/430ae522f5031ff728c95efea49219a11e6852b3)

