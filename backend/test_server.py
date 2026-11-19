import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

print("Testing server startup...")
print("Python version:", sys.version)

try:
    from flask import Flask
    print("Flask imported successfully")
    
    from services.acoustic_analyzer import AcousticAnalyzer
    print("AcousticAnalyzer imported successfully")
    
    analyzer = AcousticAnalyzer()
    print("AcousticAnalyzer instantiated")
    
    result = analyzer.initialize()
    print(f"Analyzer initialized: {result}")
    
    print("\nAll imports successful!")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
