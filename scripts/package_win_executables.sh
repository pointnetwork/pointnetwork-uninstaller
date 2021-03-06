#!/bin/bash

# This script will rename, add execution permissions and compress point executables.

VERSION=$(awk -F'"' '/"version": ".+"/{ print $4; exit; }' package.json)

WIN_FILE="./out/make/squirrel.windows/x64/pointnetwork-uninstaller-${VERSION} Setup.exe"

mkdir -p ./out/win_executables/pkg
chmod +x "$WIN_FILE"
mv "$WIN_FILE" ./out/win_executables/pkg/pointnetwork-uninstaller.exe
7z a ./out/win_executables/pointnetwork-uninstaller.zip ./out/win_executables/pkg/pointnetwork-uninstaller.exe
