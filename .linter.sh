#!/bin/bash
cd /home/kavia/workspace/code-generation/drawmaster-hub-93360-93367/drawmaster_hub
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

