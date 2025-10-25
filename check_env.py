#!/usr/bin/env python3
"""
CheapFuel Environment Checker
Verifies that all required dependencies and configurations are in place
"""

import sys
import os
from pathlib import Path

def print_status(message, status):
    """Print status with color coding"""
    colors = {
        'success': '\033[92m✓',
        'error': '\033[91m✗',
        'warning': '\033[93m⚠',
        'info': '\033[94mℹ'
    }
    reset = '\033[0m'
    print(f"{colors.get(status, '')} {message}{reset}")

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print_status(f"Python {version.major}.{version.minor}.{version.micro} installed", 'success')
        return True
    else:
        print_status(f"Python {version.major}.{version.minor} found, but 3.8+ required", 'error')
        return False

def check_node_version():
    """Check Node.js version"""
    import subprocess
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        version = result.stdout.strip()
        print_status(f"Node.js {version} installed", 'success')
        return True
    except FileNotFoundError:
        print_status("Node.js not found", 'error')
        return False

def check_python_packages():
    """Check if required Python packages are installed"""
    required = [
        'flask', 'flask_cors', 'flask_sqlalchemy', 
        'requests', 'dotenv', 'jwt', 'werkzeug'
    ]
    missing = []
    
    for package in required:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing.append(package)
    
    if not missing:
        print_status("All Python packages installed", 'success')
        return True
    else:
        print_status(f"Missing Python packages: {', '.join(missing)}", 'error')
        print_status("Run: cd backend && pip install -r requirements.txt", 'info')
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    env_path = Path(__file__).parent / 'backend' / '.env'
    
    if not env_path.exists():
        print_status("Backend .env file not found", 'error')
        print_status("Create backend/.env with GOOGLE_MAPS_API_KEY and SECRET_KEY", 'info')
        return False
    
    with open(env_path) as f:
        content = f.read()
    
    has_api_key = 'GOOGLE_MAPS_API_KEY' in content and 'your_' not in content
    has_secret = 'SECRET_KEY' in content
    
    if has_api_key and has_secret:
        print_status("Backend .env file configured", 'success')
        return True
    else:
        if not has_api_key:
            print_status("GOOGLE_MAPS_API_KEY not set in .env", 'warning')
        if not has_secret:
            print_status("SECRET_KEY not set in .env", 'warning')
        return False

def check_frontend_env():
    """Check frontend .env"""
    env_path = Path(__file__).parent / 'frontend' / '.env'
    
    if env_path.exists():
        print_status("Frontend .env file exists", 'success')
        return True
    else:
        print_status("Frontend .env file not found (optional)", 'warning')
        return True

def check_npm_packages():
    """Check if npm packages are installed"""
    node_modules = Path(__file__).parent / 'frontend' / 'node_modules'
    
    if node_modules.exists():
        print_status("Frontend npm packages installed", 'success')
        return True
    else:
        print_status("Frontend packages not installed", 'error')
        print_status("Run: cd frontend && npm install", 'info')
        return False

def check_database():
    """Check if database exists or can be created"""
    db_path = Path(__file__).parent / 'backend' / 'cheapfuel.db'
    
    if db_path.exists():
        print_status("Database file exists", 'success')
        return True
    else:
        print_status("Database will be created on first run", 'info')
        return True

def main():
    """Run all checks"""
    print("🚗 CheapFuel Environment Checker\n")
    print("=" * 50)
    
    checks = [
        ("Python Version", check_python_version),
        ("Node.js Version", check_node_version),
        ("Python Packages", check_python_packages),
        ("Backend Configuration", check_env_file),
        ("Frontend Configuration", check_frontend_env),
        ("Frontend Packages", check_npm_packages),
        ("Database", check_database),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n{name}:")
        results.append(check_func())
    
    print("\n" + "=" * 50)
    
    if all(results):
        print_status("\n✨ Environment is ready! Run ./run.sh to start the app", 'success')
        return 0
    else:
        print_status("\n⚠️  Some checks failed. Fix the issues above and try again", 'warning')
        return 1

if __name__ == '__main__':
    sys.exit(main())

