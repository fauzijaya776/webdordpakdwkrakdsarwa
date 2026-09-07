@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   Push kode terbaru ke GitHub
echo   %CD%
echo ============================================
echo.
git add .
git commit -m "update: hapus password auth + opsi bahasa + perbaikan"
git push
echo.
echo ============================================
echo   Selesai. Kalau tidak ada error merah di atas,
echo   Vercel akan auto-deploy dalam ~1 menit.
echo ============================================
pause
