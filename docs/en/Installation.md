# Sudoku Project Installation Guide

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Local Installation](#local-installation)
3. [Database Setup](#database-setup)
4. [Environment Configuration](#environment-configuration)
5. [Running the Project](#running-the-project)
6. [Server Deployment](#server-deployment)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements

| Component | Version | Note |
|-----------|---------|------|
| **Python** | 3.10+ | Recommended 3.11 or 3.12 |
| **PostgreSQL** | 15+ | SQLite can be used for development |
| **RAM** | 512 MB | For low load |
| **Disk** | 100 MB | Without static files |

### Software

- **Git** — for cloning repository
- **Poetry** or **pip** — for dependency management
- **Browser** — Chrome, Firefox, Safari, Edge

---

## Local Installation

### Step 1: Clone Repository

```bash
# Clone repository
git clone https://github.com/username/sudoku.git

# Navigate to project directory
cd sudoku
```

### Step 2: Create Virtual Environment

**Option A: Using Poetry (recommended)**

```bash
# Install Poetry (if not installed)
pip install poetry

# Install dependencies
poetry install

# Activate virtual environment
poetry shell
```

**Option B: Using venv**

```bash
# Create virtual environment
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Verify Installation

```bash
# Check Python version
python --version
# Python 3.11.x

# Check Django
python -c "import django; print(django.VERSION)"
# (5, 0, x, 'final', 0)
```

---

## Database Setup

### Option A: PostgreSQL (recommended for production)

#### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**MacOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download installer from https://www.postgresql.org/download/windows/

#### 2. Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE sudoku_db;

# Create user
CREATE USER sudoku_user WITH PASSWORD 'your_secure_password';

# Configure settings
ALTER ROLE sudoku_user SET client_encoding TO 'utf8';
ALTER ROLE sudoku_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sudoku_user SET timezone TO 'UTC';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sudoku_db TO sudoku_user;

# Exit
\q
```

#### 3. Verify Connection

```bash
psql -h localhost -U sudoku_user -d sudoku_db
# Enter password
# If connected successfully - all good
\q
```

### Option B: SQLite (for development)

SQLite doesn't require separate installation. Just change settings:

```python
# django_project/settings.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

---

## Environment Configuration

### Environment Variables

Create `.env` file in project root directory:

```bash
# .env

# Database
DATABASE_URL=postgresql://sudoku_user:your_password@localhost:5432/sudoku_db

# Django
SECRET_KEY=your-very-long-and-random-secret-key-here-min-50-chars
DEBUG=True

# Allowed hosts (for production)
ALLOWED_HOSTS=localhost,127.0.0.1

# Email (optional)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Generate SECRET_KEY

```python
# Run in Python console
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Or use online generator: https://djecrety.ir/

### Load Environment Variables

**Linux/Mac:**
```bash
export $(cat .env | xargs)
```

**Windows (PowerShell):**
```powershell
Get-Content .env | ForEach-Object {
    if ($_ -match "^(.+)=(.+)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
    }
}
```

**Or use python-dotenv:**
```python
# At the beginning of manage.py or settings.py
from dotenv import load_dotenv
load_dotenv()
```

---

## Running the Project

### Step 1: Apply Migrations

```bash
# Create migrations (if needed)
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

**Expected output:**
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions, sudoku
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  ...
  Applying sudoku.0001_initial... OK
  Applying sudoku.0002_emailverification... OK
```

### Step 2: Create Superuser (optional)

```bash
python manage.py createsuperuser
```

Enter:
- Username: admin
- Email: admin@example.com
- Password: (your password)

### Step 3: Collect Static Files (for production)

```bash
python manage.py collectstatic --noinput
```

### Step 4: Run Development Server

```bash
# Run on localhost:5000
python manage.py runserver 0.0.0.0:5000
```

### Step 5: Verify Operation

Open in browser:
- Home page: http://localhost:5000/
- Admin panel: http://localhost:5000/admin/

---

## Server Deployment

### Ubuntu VPS with Nginx and Gunicorn

#### 1. Server Preparation

```bash
# Connect to server
ssh root@your_server_ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install required software
sudo apt install python3 python3-pip python3-venv \
    postgresql postgresql-contrib \
    nginx supervisor git -y
```

#### 2. Create User

```bash
# Create system user
sudo adduser --system --group sudoku

# Create directory
sudo mkdir -p /var/www/sudoku
sudo chown sudoku:sudoku /var/www/sudoku
```

#### 3. Clone Project

```bash
cd /var/www/sudoku
sudo -u sudoku git clone https://github.com/username/sudoku.git .
```

#### 4. Setup Virtual Environment

```bash
# Create venv
sudo -u sudoku python3 -m venv venv

# Install dependencies
sudo -u sudoku ./venv/bin/pip install --upgrade pip
sudo -u sudoku ./venv/bin/pip install django psycopg2-binary gunicorn dj-database-url
```

#### 5. Environment Configuration

```bash
# Create environment file
sudo nano /var/www/sudoku/.env
```

Content:
```
DATABASE_URL=postgresql://sudoku_user:password@localhost:5432/sudoku_db
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
```

#### 6. Migrations and Static Files

```bash
cd /var/www/sudoku
source .env
sudo -u sudoku ./venv/bin/python manage.py migrate
sudo -u sudoku ./venv/bin/python manage.py collectstatic --noinput
```

#### 7. Gunicorn Configuration

```bash
# Create Gunicorn config file
sudo nano /var/www/sudoku/gunicorn_config.py
```

Content:
```python
# gunicorn_config.py
bind = "127.0.0.1:8000"
workers = 3
timeout = 120
accesslog = "/var/log/sudoku/access.log"
errorlog = "/var/log/sudoku/error.log"
capture_output = True
```

#### 8. Supervisor Configuration

```bash
# Create log directory
sudo mkdir -p /var/log/sudoku
sudo chown sudoku:sudoku /var/log/sudoku

# Create Supervisor config
sudo nano /etc/supervisor/conf.d/sudoku.conf
```

Content:
```ini
[program:sudoku]
directory=/var/www/sudoku
command=/var/www/sudoku/venv/bin/gunicorn django_project.wsgi:application -c gunicorn_config.py
user=sudoku
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/sudoku/supervisor.log
environment=
    DATABASE_URL="postgresql://sudoku_user:password@localhost:5432/sudoku_db",
    SECRET_KEY="your-production-secret-key",
    DEBUG="False",
    ALLOWED_HOSTS="your-domain.com"
```

```bash
# Reload Supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start sudoku
```

#### 9. Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/sudoku
```

Content:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Static files
    location /static/ {
        alias /var/www/sudoku/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files (if any)
    location /media/ {
        alias /var/www/sudoku/media/;
    }

    # Proxy to Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sudoku /etc/nginx/sites-enabled/

# Check configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 10. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

## Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'django'"

**Solution:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate      # Windows

# Install dependencies
pip install django
```

### Problem: "FATAL: password authentication failed"

**Solution:**
```bash
# Check pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Change auth method to md5 or scram-sha-256
# local   all   all   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Problem: "OperationalError: could not connect to server"

**Solution:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql

# Check DATABASE_URL
echo $DATABASE_URL
```

### Problem: "DisallowedHost"

**Solution:**
```python
# django_project/settings.py
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your-domain.com']
```

Or via environment variable:
```bash
export ALLOWED_HOSTS="localhost,127.0.0.1,your-domain.com"
```

### Problem: "CSRF verification failed"

**Solution:**
1. Make sure `{% csrf_token %}` is in the form
2. For production add:
```python
# settings.py
CSRF_TRUSTED_ORIGINS = ['https://your-domain.com']
```

### Problem: Static files not loading

**Solution:**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check settings
# settings.py
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
```

### Problem: 502 Bad Gateway error

**Solution:**
```bash
# Check Gunicorn logs
sudo tail -f /var/log/sudoku/error.log

# Check Supervisor status
sudo supervisorctl status sudoku

# Restart
sudo supervisorctl restart sudoku
```

---

## Useful Commands

### Django

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver 0.0.0.0:5000

# Django shell
python manage.py shell

# Check project
python manage.py check
```

### PostgreSQL

```bash
# Connect to database
psql -h localhost -U sudoku_user -d sudoku_db

# Database dump
pg_dump sudoku_db > backup.sql

# Restore database
psql sudoku_db < backup.sql
```

### Supervisor

```bash
# Status
sudo supervisorctl status

# Restart
sudo supervisorctl restart sudoku

# Logs
sudo tail -f /var/log/sudoku/supervisor.log
```

### Nginx

```bash
# Check configuration
sudo nginx -t

# Restart
sudo systemctl restart nginx

# Logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Quick Start (TL;DR)

```bash
# 1. Clone
git clone https://github.com/username/sudoku.git && cd sudoku

# 2. Virtual environment
python -m venv venv && source venv/bin/activate

# 3. Dependencies
pip install django psycopg2-binary dj-database-url

# 4. Environment variables
export DATABASE_URL="postgresql://user:pass@localhost:5432/sudoku_db"
export SECRET_KEY="your-secret-key"

# 5. Migrations
python manage.py migrate

# 6. Run
python manage.py runserver 0.0.0.0:5000

# 7. Open http://localhost:5000
```
