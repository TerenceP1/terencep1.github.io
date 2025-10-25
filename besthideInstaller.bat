@echo off
REM Create a PowerShell script file
(
echo $zipUrl = "https://terencep1.github.io/mainZip.zip"  # URL of the zip file
echo $zipPath = "mainZip.zip"                      # Save ZIP in current directory
echo $extractPath = "."                         # Current directory
echo echo "please ignore everything you see except when it asks you to do something"
echo pause
echo # Download the ZIP
echo Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
echo # Extract the ZIP in the current directory
echo Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
echo cd "mainZip"
echo .\installer.ps1
) > mainInstaller.ps1

REM Run the PowerShell script
powershell -ExecutionPolicy Bypass -File "%CD%\mainInstaller.ps1"

pause
