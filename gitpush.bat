@echo off
title Git Performance Commit

echo [1/3] Dodawanie wszystkich zmian do stage (git add .)
git add .
timeout /t 1 >nul

echo [2/3] Tworzenie commita o nazwie "PERFORMANCE"
git commit -m "PERFORMANCE"
timeout /t 1 >nul

echo [3/3] Wysylanie zmian na repozytorium (git push)
git push
timeout /t 1 >nul

echo.
echo Wszystkie komendy zostaly wykonane pomyslnie!
timeout /t 1 >nul

exit