## Features

### Authentication System
- User registration with email
- Secure login/logout
- Session management

### Sudoku Game
- **Three Difficulty Levels**: Easy, Medium, Hard
- **Smart Highlighting**: Highlights all instances of the same number when selecting a cell
- **Notes/Pencil Marks**: Toggle notes mode to add multiple candidates per cell
- **Hint System**: Limited to 3 hints per game
- **Mistake Tracking**: 3 mistakes allowed before game over
- **Auto-Win Detection**: Automatically detects when puzzle is solved
- **Timer**: Tracks your solving time
- **Auto-Hide Numbers**: Number buttons disappear when all 9 instances are placed

### Leaderboard
- Global rankings by difficulty
- Tracks completion time and hints used
- Shows player usernames and achievements

### Chat System
- Real-time player chat
- Auto-refresh messages
- Timestamps for each message

## Tech Stack

- **Backend**: Django 5.0
- **Database**: PostgreSQL
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Design**: Minimalist dark theme with red accents

## Design

The application follows a "samurai style" minimalist aesthetic:
- **Background**: Pure black (#000000)
- **Primary Color**: Dark red (#8B0000)
- **Hover Effects**: Bright red (#FF0000)
- **Card Background**: Dark gray (#1A1A1A)
- **Text**: White (#FFFFFF)

## Installation

### Prerequisites
- Python 3.11+
- PostgreSQL database

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sudoku-game.git
cd sudoku-game
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/sudoku"
export SECRET_KEY="your-secret-key"
export SENDGRID_API_KEY="your-sendgrid-api-key"
export SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Start the server:
```bash
python manage.py runserver 0.0.0.0:5000
```

6. Open http://localhost:5000 in your browser

## Project Structure

```
sudoku-game/
├── django_project/          # Django project configuration
│   ├── settings.py          # Main settings
│   ├── urls.py              # Root URL routing
│   └── wsgi.py              # WSGI configuration
│
├── sudoku/                  # Main application
│   ├── models.py            # Database models
│   ├── views.py             # View functions
│   ├── urls.py              # App URL patterns
│   └── admin.py             # Admin configuration
│
├── templates/               # HTML templates
│   ├── base.html            # Base layout with navigation
│   ├── home.html            # Landing page
│   ├── game.html            # Sudoku game board
│   ├── leaderboard.html     # Rankings page
│   ├── chat.html            # Player chat
│   └── registration/        # Auth templates
│       ├── login.html
│       └── register.html
│
├── static/                  # Static assets
│   ├── css/
│   │   └── style.css        # All styles
│   └── js/
│       ├── main.js          # Common scripts
│       ├── sudoku.js        # Game logic
│       └── chat.js          # Chat functionality
│
├── manage.py                # Django CLI
└── README.md                # This file
```

## Database Models

### GameResult
Stores completed game records:
- `user` - Foreign key to User
- `difficulty` - Game difficulty (easy/medium/hard)
- `time_seconds` - Completion time in seconds
- `hints_used` - Number of hints used (0-3)
- `completed_at` - Timestamp

### ChatMessage
Stores chat messages:
- `user` - Foreign key to User
- `message` - Message text
- `created_at` - Timestamp

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Home page |
| `/game/<difficulty>/` | GET | Start new game |
| `/game/hint/` | POST | Get hint for selected cell |
| `/game/save-result/` | POST | Save completed game |
| `/leaderboard/` | GET | View rankings |
| `/chat/` | GET | Chat page |
| `/chat/send/` | POST | Send message |
| `/chat/messages/` | GET | Get recent messages |
| `/register/` | GET/POST | User registration |
| `/login/` | GET/POST | User login |
| `/logout/` | POST | User logout |

## Game Controls

### Desktop
- **Click** on a cell to select it
- **Click** a number button to fill the cell
- **Click X** to clear a cell
- **Click Notes** to toggle pencil marks mode
- **Click Hint** to reveal correct number (limited to 3)

### Mobile
- Same as desktop, optimized touch interface
- Responsive grid sizing for smaller screens

## Screenshots

The game features:
- Clean hamburger navigation menu
- Centered game board with red border accents
- Number pad below the board
- Game stats showing time, mistakes, and hints

## Deployment on Ubuntu VPS

### Step 1: Server Setup

Connect to your VPS via SSH:
```bash
ssh root@your_server_ip
```

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Required Software

Install Python, PostgreSQL, Nginx, and other dependencies:
```bash
sudo apt install python3 python3-pip python3-venv postgresql postgresql-contrib nginx supervisor git -y
```

### Step 3: Create PostgreSQL Database

```bash
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE sudoku_db;
CREATE USER sudoku_user WITH PASSWORD 'your_secure_password';
ALTER ROLE sudoku_user SET client_encoding TO 'utf8';
ALTER ROLE sudoku_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sudoku_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE sudoku_db TO sudoku_user;
\q
```

### Step 4: Create Application User

```bash
sudo adduser --system --group sudoku
sudo mkdir -p /var/www/sudoku
sudo chown sudoku:sudoku /var/www/sudoku
```

### Step 5: Clone and Setup Application

```bash
cd /var/www/sudoku
sudo -u sudoku git clone https://github.com/yourusername/sudoku-game.git .
```

Create virtual environment:
```bash
sudo -u sudoku python3 -m venv venv
sudo -u sudoku ./venv/bin/pip install --upgrade pip
sudo -u sudoku ./venv/bin/pip install django psycopg2-binary gunicorn dj-database-url
```

### Step 6: Configure Environment Variables

Create environment file:
```bash
sudo nano /var/www/sudoku/.env
```

Add the following:
```
DATABASE_URL=postgresql://sudoku_user:your_secure_password@localhost:5432/sudoku_db
SECRET_KEY=your-very-long-random-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your_domain.com,your_server_ip
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

Create a script to load environment:
```bash
sudo nano /var/www/sudoku/load_env.sh
```

```bash
#!/bin/bash
export $(cat /var/www/sudoku/.env | xargs)
```

### Step 7: Update Django Settings for Production

Edit `django_project/settings.py` and ensure:
```python
import os

DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
```

### Step 8: Run Migrations and Collect Static

```bash
cd /var/www/sudoku
source .env
sudo -u sudoku ./venv/bin/python manage.py migrate
sudo -u sudoku ./venv/bin/python manage.py collectstatic --noinput
```

### Step 9: Configure Gunicorn with Supervisor

Create Gunicorn config:
```bash
sudo nano /etc/supervisor/conf.d/sudoku.conf
```

Add:
```ini
[program:sudoku]
command=/var/www/sudoku/venv/bin/gunicorn --workers 3 --bind unix:/var/www/sudoku/sudoku.sock django_project.wsgi:application
directory=/var/www/sudoku
user=sudoku
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/sudoku/gunicorn.log
environment=DATABASE_URL="postgresql://sudoku_user:your_secure_password@localhost:5432/sudoku_db",SECRET_KEY="your-secret-key",DEBUG="False",ALLOWED_HOSTS="your_domain.com"
```

Create log directory and start:
```bash
sudo mkdir -p /var/log/sudoku
sudo chown sudoku:sudoku /var/log/sudoku
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start sudoku
```

### Step 10: Configure Nginx

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/sudoku
```

Add:
```nginx
server {
    listen 80;
    server_name your_domain.com your_server_ip;

    location /static/ {
        alias /var/www/sudoku/staticfiles/;
    }

    location / {
        proxy_pass http://unix:/var/www/sudoku/sudoku.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/sudoku /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 11: Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Step 12: Setup SSL with Let's Encrypt (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com
```

### Useful Commands

Check application status:
```bash
sudo supervisorctl status sudoku
```

View logs:
```bash
sudo tail -f /var/log/sudoku/gunicorn.log
```

Restart application:
```bash
sudo supervisorctl restart sudoku
```

Update application:
```bash
cd /var/www/sudoku
sudo -u sudoku git pull
sudo -u sudoku ./venv/bin/pip install -r requirements.txt
sudo -u sudoku ./venv/bin/python manage.py migrate
sudo -u sudoku ./venv/bin/python manage.py collectstatic --noinput
sudo supervisorctl restart sudoku
```

### Troubleshooting

**502 Bad Gateway**: Check if Gunicorn is running:
```bash
sudo supervisorctl status sudoku
sudo tail -50 /var/log/sudoku/gunicorn.log
```

**Static files not loading**: Ensure collectstatic was run and Nginx config points to correct path.

**Database connection error**: Verify PostgreSQL is running and credentials are correct:
```bash
sudo systemctl status postgresql
```

## License

MIT License - feel free to use and modify for your own projects.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Author

Built with Django and love for puzzle games.
