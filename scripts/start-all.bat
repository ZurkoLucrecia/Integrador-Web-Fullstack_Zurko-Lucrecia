@echo off
echo Iniciando Campus Virtual...

echo Iniciando servidor backend...
start cmd /k "cd servidor && npm start"

timeout /t 5

echo Iniciando cliente frontend...
start cmd /k "cd cliente && npm run dev"

echo.
echo Servidor backend corriendo en: http://localhost:3001
echo Cliente frontend corriendo en: http://localhost:5174
echo.
echo Presiona cualquier tecla para salir...
pause >nul