#!/bin/bash

#plugin_path="/Users/budao/weex-plugins/weex-plugin-chart"
while getopts "d:h" arg
do
    case $arg in
        d)
        echo "plugin path is :$OPTARG"
        plugin_path=$OPTARG
        ;;
        h)
        echo "Usage: android_test_local.sh [-d plugin_path]"
        echo "-d plugin dir"
        exit 1
        ;;
        ?)
        echo "unknown argument"
        exit 1
        ;;
    esac
done

rm -rf MyApp

weexpack create MyApp
cd MyApp && cnpm install

weexpack platform add android -d

weexpack plugin add "$plugin_path" -d
cp -ri "$plugin_path/examples/" src

adb devices
weexpack run android
