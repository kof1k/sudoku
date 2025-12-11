# Sudoku Game

## Overview
A full-featured Sudoku puzzle game built with Django. Includes user authentication, game play with varying difficulty levels, leaderboard rankings, and a player chat system.

## Features
- **User Authentication**: Register, login, and logout functionality
- **Sudoku Game**: Play Sudoku puzzles with Easy, Medium, and Hard difficulty levels
- **Leaderboard**: Track and display best game results by time and hints used
- **Chat System**: Real-time chat between players with auto-refresh

## Tech Stack
- **Backend**: Django 5.0
- **Database**: PostgreSQL
- **Frontend**: HTML, CSS, JavaScript (vanilla)

## Project Structure
```
/
├── django_project/       # Django project settings
│   ├── settings.py       # Main configuration
│   ├── urls.py          # URL routing
│   └── wsgi.py          # WSGI config
├── sudoku/              # Main app
│   ├── models.py        # Database models (GameResult, ChatMessage, SudokuGenerator)
│   ├── views.py         # View functions
│   └── urls.py          # App URL patterns
├── templates/           # HTML templates
│   ├── base.html        # Base layout
│   ├── home.html        # Home page
│   ├── game.html        # Sudoku game board
│   ├── leaderboard.html # Results ranking
│   ├── chat.html        # Player chat
│   └── registration/    # Auth templates
├── static/
│   ├── css/style.css    # Styling
│   └── js/              # JavaScript files
│       ├── main.js      # Common scripts
│       ├── sudoku.js    # Game logic
│       └── chat.js      # Chat functionality
└── manage.py            # Django management script
```

## Running the Application
The app runs on port 5000 using the command:
```bash
python manage.py runserver 0.0.0.0:5000
```

## Database
Uses PostgreSQL connected via DATABASE_URL environment variable.

Models:
- **GameResult**: Stores completed game records (user, difficulty, time, hints)
- **ChatMessage**: Stores chat messages between players
## Recent Changes
- December 11, 2025: Initial implementation with all core features
