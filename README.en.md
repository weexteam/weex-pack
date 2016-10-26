# Weex Engineering Development Kit

[中文版文档](./README.md)

### Weexpack introduction
Weexpack is our next generation of engineering development kits. It allows developers to create weex projects with simple commands and run the project on different development platforms.

### pre-environmental requirements

- Currently only supported on Mac.
- Configure the [Node.js] [1] environment and install the [npm] [2] package manager.
- Configure iOS development environment:
    - Install [Xcode IDE] [3] to launch Xcode once so that Xcode automatically installs the Developer Tools and confirms the usage protocol.
    - Install cocoaPods
- Configure the Android development environment:
    - Install [Android Studio] [4] and open the new project. Open the menu bar, open the [AVD Manager] [5], the new Android emulator and start. (If you have installed [Docker] [6], close the Docker Server.)
    - Or just download the [Android SDK] [7], run the command line [AVD Manager] [8], create a new Android emulator and launch it.
    - Make sure that Android build-tool version is 23.0.2

### Instructions

First, install the weex-pack command globally:

    $ npm install -g weexpack

Then, create the weex project:

    $ weexpack init appName

Weexpack automatically creates a new directory named appName and pulls the project template to that directory.

The final resulting directory structure looks like this:

    -> / appName
    .
    |—— .gitignore
    |—— README.md
    |—— package.json
    |—— webpack.config.js
    |—— /src
    |     |—— index.we
    |—— /html5
    |     |—— index.html
    |—— /ios
    |     |—— /playground
    |     |—— /sdk
    |     |—— /WXDevtool
    |—— /android
    |     |—— /playground
    |     |—— /appframework


Next, go to the directory, and install the dependencies:

    $ cd appName && npm install

### IOS platform

For simulator

    $ weexpack run ios
    
Build ipa

    $ weexpack build ios
    
this command will prompt for CodeSign, Profile(provisioning profile), AppId to build ipa. Other information like AppName, weex bundle could be configured as you like in the file ios.config.json. After this command, ipa file could be created under the directory /playground/build/ipa_build/.

Note: For details about various requirements to deploy to a device, refer to the Launch Your App On Devices section of Apple's [About App Distribution Workflows][9]. Briefly, you need to do the following before deploying:

      1.CodeSign should be installed to keychain, click keychain to get the id; 
      2.provisioning profile need UUID. you could use the file mobileprovision_UUID.sh to generate UUID as follows:
      
     $ ./mobileprovision_UUID.sh abcpath
     abcpath is the path of provisioning profile file.

### Android platform

In the android platform, package and running could be done with one command:

    $ weexpack run android
    
You could configure the following in android.config.json

    -AppName: the name of the project
    -AppId: application_id the name of the package
    -SplashText: the text in welcome page
    -WeexBundle: the bundle file (could be local file or remote url). Local file please put under the src directory 

### Html5 platform

On the html5 platform, run the project:

    $ weexpack run web

For developers who have a packaged release, you can make changes directly to the playground project. Follow-up, weexpack will be further added to the packaging, testing and other functions.


  [1]: https://nodejs.org/
  [2]: https://www.npmjs.com/
  [3]: https://itunes.apple.com/us/app/xcode/id497799835?mt=12
  [4]: https://developer.android.com/studio/install.html
  [5]: https://developer.android.com/studio/run/managing-avds.html
  [6]: https://www.docker.com/
  [7]: https://developer.android.com/studio/releases/sdk-tools.html
  [8]: https://developer.android.com/studio/run/managing-avds.html
  [9]: https://developer.apple.com/library/content/documentation/IDEs/Conceptual/AppDistributionGuide/Introduction/Introduction.html
