@echo off
start "Backend" /D "D:\Usuario\Documents\PROGRAMACIÓN\campusvirtual\servidor" node src/index.js
start "Frontend" /D "D:\Usuario\Documents\PROGRAMACIÓN\campusvirtual\cliente" npm run dev
echo Servers started. Check the new command prompt windows for output.
pause