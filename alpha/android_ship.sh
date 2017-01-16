#!/bin/bash
project_name="MyApp"
plugin="/Users/budao/weex-plugins/weex-plugin-chart"
#src_path="/Users/budao/weex-plugins/weex-plugin-chart"


while getopts "n:p:s:h" arg
do
    case $arg in
        n)
        echo "porject name is : $OPTARG"
        project_name=$OPTARG
        ;;
        p)
        echo "plugin path is : $OPTARG"
        plugin=$OPTARG
        ;;
        s)
        echo "src path is : $OPTARG"
        src_path=$OPTARG
        ;;
        h)
        echo "Usage: android_test_local.sh [-d plugin][-s src_path][-n project_name]"
        echo "-p plugin name or path"
        echo "-s src_path"
        echo "-n project_name"
        exit 1
        ;;
        ?)
        echo "unknown argument"
        exit 1
        ;;
    esac
done

rm -rf $project_name

weexpack create $project_name
cd $project_name && cnpm install

weexpack platform add android -d

weexpack plugin add "$plugin" -d

if [ -n "$src_path" ]; then
    cp -rvi "$src_path" src
fi

adb devices
weexpack run android
