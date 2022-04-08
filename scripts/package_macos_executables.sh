#!/bin/bash

# This script will rename, add execution permissions and compress point executables.

MAC_FILE=./out/pointnetwork-uninstaller-darwin-x64/pointnetwork-uninstaller.app

mkdir -p ./out/mac_executables/pkg
chmod +x $MAC_FILE
mv $MAC_FILE ./out/mac_executables/pkg/pointnetwork-uninstaller.app
tar -czvf ./out/mac_executables/pointnetwork-uninstaller.tar.gz -C ./out/mac_executables/pkg ./pointnetwork-uninstaller.app
