# Sudoku Game - Database Documentation

## Overview

This project uses **PostgreSQL** as the primary database, connected via Django ORM.

---

## Database Configuration

### Connection
The database connection is configured via the `DATABASE_URL` environment variable:

```
DATABASE_URL=postgres://username:password@host:port/database_name
```

### Django Settings (django_project/settings.py)
```python
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))
}
```

---

## Database Tables

### 1. User (Django Built-in)

Django's built-in User model for authentication.

**Table name:** `auth_user`

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| username | VARCHAR(150) | Unique username |
| email | VARCHAR(254) | Email address (optional) |
| password | VARCHAR(128) | Hashed password |
| first_name | VARCHAR(150) | First name |
| last_name | VARCHAR(150) | Last name |
| is_active | BOOLEAN | Account is active |
| is_staff | BOOLEAN | Can access admin panel |
| is_superuser | BOOLEAN | Has all permissions |
| date_joined | DATETIME | Registration date |
| last_login | DATETIME | Last login date |

**Example:**
```sql
SELECT id, username, email, date_joined FROM auth_user;
```

---

### 2. GameResult

Stores completed game records for the leaderboard.

**Table name:** `sudoku_gameresult`

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| user_id | INTEGER | Foreign key to auth_user |
| difficulty | VARCHAR(10) | 'easy', 'medium', or 'hard' |
| time_seconds | INTEGER | Time to complete in seconds |
| hints_used | INTEGER | Number of hints used (0-3) |
| completed | BOOLEAN | Game was completed |
| created_at | DATETIME | When game was completed |

**Relationships:**
- `user_id` → `auth_user.id` (Many-to-One)

**Ordering:** By time_seconds (ascending), then hints_used (ascending)

**Example queries:**
```sql
-- Get all results for a user
SELECT * FROM sudoku_gameresult WHERE user_id = 1;

-- Get leaderboard (best times)
SELECT u.username, g.difficulty, g.time_seconds, g.hints_used, g.created_at
FROM sudoku_gameresult g
JOIN auth_user u ON g.user_id = u.id
WHERE g.difficulty = 'medium'
ORDER BY g.time_seconds ASC, g.hints_used ASC
LIMIT 10;

-- Count games by difficulty
SELECT difficulty, COUNT(*) as count
FROM sudoku_gameresult
GROUP BY difficulty;
```

---

### 3. ChatMessage

Stores chat messages between players.

**Table name:** `sudoku_chatmessage`

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| user_id | INTEGER | Foreign key to auth_user |
| message | TEXT | Message content (max 500 chars) |
| created_at | DATETIME | When message was sent |

**Relationships:**
- `user_id` → `auth_user.id` (Many-to-One)

**Ordering:** By created_at (descending - newest first)

**Example queries:**
```sql
-- Get last 50 messages
SELECT u.username, c.message, c.created_at
FROM sudoku_chatmessage c
JOIN auth_user u ON c.user_id = u.id
ORDER BY c.created_at DESC
LIMIT 50;

-- Get messages from specific user
SELECT * FROM sudoku_chatmessage WHERE user_id = 1;

-- Delete old messages (older than 7 days)
DELETE FROM sudoku_chatmessage
WHERE created_at < NOW() - INTERVAL '7 days';
```

---

### 4. EmailVerification (Not currently used)

Stores email verification codes. Currently disabled but available for future use.

**Table name:** `sudoku_emailverification`

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-increment |
| user_id | INTEGER | Foreign key to auth_user (unique) |
| code | VARCHAR(6) | 6-digit verification code |
| is_verified | BOOLEAN | Email is verified |
| created_at | DATETIME | When code was created |

**Relationships:**
- `user_id` → `auth_user.id` (One-to-One)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│    auth_user    │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password        │
│ ...             │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴────────────────────┐
    │                         │
    ▼                         ▼
┌─────────────────┐   ┌─────────────────┐
│  GameResult     │   │  ChatMessage    │
├─────────────────┤   ├─────────────────┤
│ id (PK)         │   │ id (PK)         │
│ user_id (FK)    │   │ user_id (FK)    │
│ difficulty      │   │ message         │
│ time_seconds    │   │ created_at      │
│ hints_used      │   └─────────────────┘
│ completed       │
│ created_at      │
└─────────────────┘
```

---

## Django ORM Usage

### Models (sudoku/models.py)

```python
from django.db import models
from django.contrib.auth.models import User

class GameResult(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='game_results')
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    time_seconds = models.IntegerField()
    hints_used = models.IntegerField(default=0)
    completed = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['time_seconds', 'hints_used']


class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    message = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
```

### Query Examples in Python

```python
from django.contrib.auth.models import User
from sudoku.models import GameResult, ChatMessage

# Create a game result
user = User.objects.get(username='player1')
result = GameResult.objects.create(
    user=user,
    difficulty='medium',
    time_seconds=245,
    hints_used=1
)

# Get leaderboard for medium difficulty
leaderboard = GameResult.objects.filter(
    difficulty='medium'
).select_related('user').order_by('time_seconds', 'hints_used')[:10]

# Get user's best time per difficulty
from django.db.models import Min
best_times = GameResult.objects.filter(user=user).values('difficulty').annotate(
    best_time=Min('time_seconds')
)

# Get last 50 chat messages
messages = ChatMessage.objects.select_related('user').order_by('-created_at')[:50]

# Send a message
ChatMessage.objects.create(user=user, message='Hello everyone!')

# Delete user and all related data (CASCADE)
user.delete()  # Also deletes all GameResults and ChatMessages
```

---

## Database Management Commands

### Migrations

```bash
# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Rollback to specific migration
python manage.py migrate sudoku 0001
```

### Database Shell

```bash
# Django shell (Python)
python manage.py shell

# Database shell (SQL)
python manage.py dbshell
```

### Docker Commands

```bash
# Access PostgreSQL in Docker
docker-compose exec db psql -U sudoku -d sudoku

# Run migrations in Docker
docker-compose exec web python manage.py migrate

# Create superuser in Docker
docker-compose exec web python manage.py createsuperuser
```

---

## Backup and Restore

### Backup

```bash
# SQL dump
docker-compose exec db pg_dump -U sudoku sudoku > backup.sql

# Compressed
docker-compose exec db pg_dump -U sudoku sudoku | gzip > backup.sql.gz
```

### Restore

```bash
# From SQL file
cat backup.sql | docker-compose exec -T db psql -U sudoku -d sudoku

# From compressed
gunzip -c backup.sql.gz | docker-compose exec -T db psql -U sudoku -d sudoku
```

---

## Statistics Queries

```sql
-- Total users
SELECT COUNT(*) FROM auth_user;

-- Total games played
SELECT COUNT(*) FROM sudoku_gameresult;

-- Games by difficulty
SELECT difficulty, COUNT(*) as games, AVG(time_seconds) as avg_time
FROM sudoku_gameresult
GROUP BY difficulty;

-- Top 10 players by games completed
SELECT u.username, COUNT(g.id) as games
FROM auth_user u
JOIN sudoku_gameresult g ON u.id = g.user_id
GROUP BY u.id, u.username
ORDER BY games DESC
LIMIT 10;

-- Average time by difficulty
SELECT difficulty, 
       AVG(time_seconds) as avg_time,
       MIN(time_seconds) as best_time,
       MAX(time_seconds) as worst_time
FROM sudoku_gameresult
GROUP BY difficulty;
```

---

*Last updated: December 2025*
