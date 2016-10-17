# Weex Engineering Development Kit

[中文版文档](./README.md)

### Weexpack introduction
Weexpack is our next generation of engineering development kits. It allows developers to create weex projects with simple commands and run the project on different development platforms.

### pre-environmental requirements

- Currently only supported on Mac.
- Configure the [Node.js] [1] environment and install the [npm] [2] package manager.
- Configure iOS development environment:
    - Install [Xcode IDE] [3] to launch Xcode once so that Xcode automatically installs the Developer Tools and confirms the usage protocol.
- Configure the Android development environment:
    - Install [Android Studio] [4] and open the new project. Open the menu bar, open the [AVD Manager] [5], the new Android emulator and start. (If you have installed [Docker] [6], close the Docker Server.)
    - Or just download the [Android SDK] [7], run the command line [AVD Manager] [8], create a new Android emulator and launch it.

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

On the ios platform, run the project:

    $ weexpack run ios

In the android platform, run the project:

    $ weexpack run android

On the html5 platform, run the project:

    $ weexpack run html5

For developers who have a packaged release, you can make changes directly to the playground project. Follow-up, weexpack will be further added to the packaging, testing and other functions.


  [1]: https://nodejs.org/
  [2]: https://www.npmjs.com/
  [3]: https://itunes.apple.com/us/app/xcode/id497799835?mt=12
  [4]: https://developer.android.com/studio/install.html
  [5]: https://developer.android.com/studio/run/managing-avds.html
  [6]: https://www.docker.com/
  [7]: https://developer.android.com/studio/releases/sdk-tools.html
  [8]: https://developer.android.com/studio/run/managing-avds.html
