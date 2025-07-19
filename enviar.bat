@echo off
echo.
echo ===================================
echo  Enviando alteracoes para o GitHub 
echo ===================================
echo.

:: Pede ao usuario para digitar a mensagem do commit
set /p commitMessage="Digite a mensagem do commit e pressione Enter: "

:: Executa os comandos do Git
echo.
echo --- Adicionando todos os arquivos...
git add .

echo.
echo --- Criando o commit...
git commit -m "%commitMessage%"

echo.
echo --- Enviando para o GitHub (branch main)...
git push origin main

echo.
echo --- Processo concluido! ---
echo.
pause
