@echo off
echo ========================================
echo Firebase Cleanup and Audio Generation
echo ========================================
echo.

cd /d "%~dp0backend"

echo Step 1: Auditing Firebase for duplicates...
echo.
python audit_firebase.py
echo.

if exist firebase_audit_report.json (
    echo ✓ Audit complete! Check firebase_audit_report.json
    echo.
    
    echo Step 2: Generating reference audio...
    echo.
    python generate_all_reference_audio.py
    echo.
    
    echo ========================================
    echo COMPLETE!
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Review firebase_audit_report.json for duplicates
    echo 2. Run firebase_cleanup_script.js to remove duplicates
    echo 3. Reference audio is ready in public/reference_audio/
    echo.
) else (
    echo ✗ Audit failed. Check Firebase credentials in audit_firebase.py
    echo.
)

pause
