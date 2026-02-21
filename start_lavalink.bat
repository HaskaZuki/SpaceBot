@echo off
title Lavalink Server
echo Checking for Java...
java -version
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Java is not installed or not in your PATH!
    echo Please download and install Java 17 or higher from:
    echo https://adoptium.net/temurin/releases/?version=17
    echo.
    pause
    exit
)

echo.
echo Java found! Starting Lavalink...
cd lavalink
java -jar Lavalink.jar
pause
