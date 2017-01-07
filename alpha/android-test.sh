#!/bin/bash
rm -rf MyApp
weexpack create MyApp
cd MyApp
weexpack platform add android -d
cp -ri ../weex-chart-examples/* src
weexpack plugin add weex-chart -d
weexpack run android
