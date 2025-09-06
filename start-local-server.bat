@echo off
REM Запуск локального PHP сервера на порту 8000

REM Проверяем, установлен ли PHP
php --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo PHP не найден. Пожалуйста, установите PHP и добавьте его в PATH.
    pause
    exit /b 1
)

REM Запускаем PHP сервер
echo Запуск локального PHP сервера на http://localhost:8000
start "" php -S localhost:8000 -t .
