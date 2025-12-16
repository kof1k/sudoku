# Інструкція з встановлення проекту "Судоку"

## Зміст

1. [Системні вимоги](#системні-вимоги)
2. [Локальне встановлення](#локальне-встановлення)
3. [Налаштування бази даних](#налаштування-бази-даних)
4. [Конфігурація середовища](#конфігурація-середовища)
5. [Запуск проекту](#запуск-проекту)
6. [Розгортання на сервері](#розгортання-на-сервері)
7. [Усунення проблем](#усунення-проблем)

---

## Системні вимоги

### Мінімальні вимоги

| Компонент | Версія | Примітка |
|-----------|--------|----------|
| **Python** | 3.10+ | Рекомендовано 3.11 або 3.12 |
| **PostgreSQL** | 15+ | Можна використати SQLite для розробки |
| **RAM** | 512 MB | Для невеликого навантаження |
| **Диск** | 100 MB | Без статичних файлів |

### Програмне забезпечення

- **Git** — для клонування репозиторію
- **Poetry** або **pip** — для управління залежностями
- **Браузер** — Chrome, Firefox, Safari, Edge

---

## Локальне встановлення

### Крок 1: Клонування репозиторію

```bash
# Клонуємо репозиторій
git clone https://github.com/username/sudoku.git

# Переходимо в директорію проекту
cd sudoku
```

### Крок 2: Створення віртуального середовища

**Варіант A: З використанням Poetry (рекомендовано)**

```bash
# Встановлюємо Poetry (якщо не встановлено)
pip install poetry

# Встановлюємо залежності
poetry install

# Активуємо віртуальне середовище
poetry shell
```

**Варіант B: З використанням venv**

```bash
# Створюємо віртуальне середовище
python -m venv venv

# Активуємо (Linux/Mac)
source venv/bin/activate

# Активуємо (Windows)
venv\Scripts\activate

# Встановлюємо залежності
pip install -r requirements.txt
```

### Крок 3: Перевірка встановлення

```bash
# Перевіряємо версію Python
python --version
# Python 3.11.x

# Перевіряємо Django
python -c "import django; print(django.VERSION)"
# (5, 0, x, 'final', 0)
```

---

## Налаштування бази даних

### Варіант A: PostgreSQL (рекомендовано для production)

#### 1. Встановлення PostgreSQL

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
Завантажте інсталятор з https://www.postgresql.org/download/windows/

#### 2. Створення бази даних

```bash
# Підключаємося до PostgreSQL
sudo -u postgres psql

# Створюємо базу даних
CREATE DATABASE sudoku_db;

# Створюємо користувача
CREATE USER sudoku_user WITH PASSWORD 'your_secure_password';

# Налаштовуємо параметри
ALTER ROLE sudoku_user SET client_encoding TO 'utf8';
ALTER ROLE sudoku_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sudoku_user SET timezone TO 'UTC';

# Надаємо права
GRANT ALL PRIVILEGES ON DATABASE sudoku_db TO sudoku_user;

# Виходимо
\q
```

#### 3. Перевірка підключення

```bash
psql -h localhost -U sudoku_user -d sudoku_db
# Введіть пароль
# Якщо підключились успішно - все добре
\q
```

### Варіант B: SQLite (для розробки)

SQLite не потребує окремого встановлення. Просто змініть налаштування:

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

## Конфігурація середовища

### Змінні середовища

Створіть файл `.env` у кореневій директорії проекту:

```bash
# .env

# База даних
DATABASE_URL=postgresql://sudoku_user:your_password@localhost:5432/sudoku_db

# Django
SECRET_KEY=your-very-long-and-random-secret-key-here-min-50-chars
DEBUG=True

# Дозволені хости (для production)
ALLOWED_HOSTS=localhost,127.0.0.1

# Email (опціонально)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Генерація SECRET_KEY

```python
# Запустіть у Python консолі
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

Або використайте онлайн генератор: https://djecrety.ir/

### Завантаження змінних середовища

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

**Або використовуйте python-dotenv:**
```python
# На початку manage.py або settings.py
from dotenv import load_dotenv
load_dotenv()
```

---

## Запуск проекту

### Крок 1: Застосування міграцій

```bash
# Створення міграцій (якщо потрібно)
python manage.py makemigrations

# Застосування міграцій
python manage.py migrate
```

**Очікуваний вивід:**
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

### Крок 2: Створення суперкористувача (опціонально)

```bash
python manage.py createsuperuser
```

Введіть:
- Username: admin
- Email: admin@example.com
- Password: (ваш пароль)

### Крок 3: Збір статичних файлів (для production)

```bash
python manage.py collectstatic --noinput
```

### Крок 4: Запуск сервера розробки

```bash
# Запуск на localhost:5000
python manage.py runserver 0.0.0.0:5000
```

### Крок 5: Перевірка роботи

Відкрийте у браузері:
- Головна сторінка: http://localhost:5000/
- Адмін-панель: http://localhost:5000/admin/

---

## Розгортання на сервері

### Ubuntu VPS з Nginx та Gunicorn

#### 1. Підготовка сервера

```bash
# Підключення до сервера
ssh root@your_server_ip

# Оновлення системи
sudo apt update && sudo apt upgrade -y

# Встановлення необхідного ПЗ
sudo apt install python3 python3-pip python3-venv \
    postgresql postgresql-contrib \
    nginx supervisor git -y
```

#### 2. Створення користувача

```bash
# Створюємо системного користувача
sudo adduser --system --group sudoku

# Створюємо директорію
sudo mkdir -p /var/www/sudoku
sudo chown sudoku:sudoku /var/www/sudoku
```

#### 3. Клонування проекту

```bash
cd /var/www/sudoku
sudo -u sudoku git clone https://github.com/username/sudoku.git .
```

#### 4. Налаштування віртуального середовища

```bash
# Створюємо venv
sudo -u sudoku python3 -m venv venv

# Встановлюємо залежності
sudo -u sudoku ./venv/bin/pip install --upgrade pip
sudo -u sudoku ./venv/bin/pip install django psycopg2-binary gunicorn dj-database-url
```

#### 5. Конфігурація середовища

```bash
# Створюємо файл середовища
sudo nano /var/www/sudoku/.env
```

Вміст:
```
DATABASE_URL=postgresql://sudoku_user:password@localhost:5432/sudoku_db
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
```

#### 6. Міграції та статика

```bash
cd /var/www/sudoku
source .env
sudo -u sudoku ./venv/bin/python manage.py migrate
sudo -u sudoku ./venv/bin/python manage.py collectstatic --noinput
```

#### 7. Налаштування Gunicorn

```bash
# Створюємо файл конфігурації Gunicorn
sudo nano /var/www/sudoku/gunicorn_config.py
```

Вміст:
```python
# gunicorn_config.py
bind = "127.0.0.1:8000"
workers = 3
timeout = 120
accesslog = "/var/log/sudoku/access.log"
errorlog = "/var/log/sudoku/error.log"
capture_output = True
```

#### 8. Налаштування Supervisor

```bash
# Створюємо директорію для логів
sudo mkdir -p /var/log/sudoku
sudo chown sudoku:sudoku /var/log/sudoku

# Створюємо конфігурацію Supervisor
sudo nano /etc/supervisor/conf.d/sudoku.conf
```

Вміст:
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
# Перезавантажуємо Supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start sudoku
```

#### 9. Налаштування Nginx

```bash
# Створюємо конфігурацію Nginx
sudo nano /etc/nginx/sites-available/sudoku
```

Вміст:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Статичні файли
    location /static/ {
        alias /var/www/sudoku/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Медіа файли (якщо є)
    location /media/ {
        alias /var/www/sudoku/media/;
    }

    # Проксі до Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Безпека
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

```bash
# Активуємо сайт
sudo ln -s /etc/nginx/sites-available/sudoku /etc/nginx/sites-enabled/

# Перевіряємо конфігурацію
sudo nginx -t

# Перезавантажуємо Nginx
sudo systemctl restart nginx
```

#### 10. SSL сертифікат (Let's Encrypt)

```bash
# Встановлюємо Certbot
sudo apt install certbot python3-certbot-nginx -y

# Отримуємо сертифікат
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Автоматичне оновлення
sudo systemctl enable certbot.timer
```

---

## Усунення проблем

### Проблема: "ModuleNotFoundError: No module named 'django'"

**Рішення:**
```bash
# Переконайтеся, що віртуальне середовище активоване
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate      # Windows

# Встановіть залежності
pip install django
```

### Проблема: "FATAL: password authentication failed"

**Рішення:**
```bash
# Перевірте pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Змініть метод автентифікації на md5 або scram-sha-256
# local   all   all   md5

# Перезапустіть PostgreSQL
sudo systemctl restart postgresql
```

### Проблема: "OperationalError: could not connect to server"

**Рішення:**
```bash
# Перевірте статус PostgreSQL
sudo systemctl status postgresql

# Запустіть, якщо не запущено
sudo systemctl start postgresql

# Перевірте DATABASE_URL
echo $DATABASE_URL
```

### Проблема: "DisallowedHost"

**Рішення:**
```python
# django_project/settings.py
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your-domain.com']
```

Або через змінну середовища:
```bash
export ALLOWED_HOSTS="localhost,127.0.0.1,your-domain.com"
```

### Проблема: "CSRF verification failed"

**Рішення:**
1. Переконайтеся, що `{% csrf_token %}` є у формі
2. Для production додайте:
```python
# settings.py
CSRF_TRUSTED_ORIGINS = ['https://your-domain.com']
```

### Проблема: Статичні файли не завантажуються

**Рішення:**
```bash
# Зберіть статику
python manage.py collectstatic --noinput

# Перевірте налаштування
# settings.py
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']
```

### Проблема: Помилка 502 Bad Gateway

**Рішення:**
```bash
# Перевірте логи Gunicorn
sudo tail -f /var/log/sudoku/error.log

# Перевірте статус Supervisor
sudo supervisorctl status sudoku

# Перезапустіть
sudo supervisorctl restart sudoku
```

---

## Корисні команди

### Django

```bash
# Створення міграцій
python manage.py makemigrations

# Застосування міграцій
python manage.py migrate

# Створення суперкористувача
python manage.py createsuperuser

# Запуск сервера
python manage.py runserver 0.0.0.0:5000

# Django shell
python manage.py shell

# Перевірка проекту
python manage.py check
```

### PostgreSQL

```bash
# Підключення до бази
psql -h localhost -U sudoku_user -d sudoku_db

# Дамп бази
pg_dump sudoku_db > backup.sql

# Відновлення бази
psql sudoku_db < backup.sql
```

### Supervisor

```bash
# Статус
sudo supervisorctl status

# Перезапуск
sudo supervisorctl restart sudoku

# Логи
sudo tail -f /var/log/sudoku/supervisor.log
```

### Nginx

```bash
# Перевірка конфігурації
sudo nginx -t

# Перезапуск
sudo systemctl restart nginx

# Логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## Швидкий старт (TL;DR)

```bash
# 1. Клонування
git clone https://github.com/username/sudoku.git && cd sudoku

# 2. Віртуальне середовище
python -m venv venv && source venv/bin/activate

# 3. Залежності
pip install django psycopg2-binary dj-database-url

# 4. Змінні середовища
export DATABASE_URL="postgresql://user:pass@localhost:5432/sudoku_db"
export SECRET_KEY="your-secret-key"

# 5. Міграції
python manage.py migrate

# 6. Запуск
python manage.py runserver 0.0.0.0:5000

# 7. Відкрити http://localhost:5000
```
