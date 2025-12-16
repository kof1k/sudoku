# Sudoku Web Game

## School Project in Computer Science

**Project Type:** Web Application
**Technologies:** Python, Django, PostgreSQL, JavaScript, HTML5, CSS3
**Year:** 2024-2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Project Goals and Objectives](#project-goals-and-objectives)
3. [Theoretical Background](#theoretical-background)
4. [Features](#features)
5. [Technologies and Tools](#technologies-and-tools)
6. [Project Structure](#project-structure)
7. [Module Descriptions](#module-descriptions)
8. [Installation Guide](#installation-guide)
9. [User Manual](#user-manual)
10. [Conclusions](#conclusions)

---

## Introduction

### What is Sudoku?

**Sudoku** (Japanese: 数独, "single numbers") is a logic-based number puzzle game. Classic Sudoku consists of a 9×9 grid divided into 9 squares of 3×3 (called "regions" or "blocks").

### Game Rules

1. The 9×9 grid is divided into 9 squares of 3×3
2. Each cell must contain a number from 1 to 9
3. Each number can appear only once:
   - In each row
   - In each column
   - In each 3×3 square

### History of Sudoku

Sudoku appeared in the late 1970s in Japan. The game became popular worldwide in the early 2000s. The name "Sudoku" comes from the Japanese expression "Suuji wa dokushin ni kagiru" (数字は独身に限る), meaning "the digits must be single."

---

## Project Goals and Objectives

### Project Goal

Develop an interactive web application for playing Sudoku with the ability to:
- Generate new puzzles of varying difficulty
- Track player progress
- Enable social interaction between users

### Project Objectives

1. **Study** algorithms for generating and solving Sudoku
2. **Develop** the server-side using Django framework
3. **Create** an intuitive user interface
4. **Implement** authentication and registration system
5. **Integrate** leaderboard and chat system
6. **Ensure** responsive design for mobile devices

### Project Relevance

- Sudoku develops logical thinking and concentration
- Web version is accessible from any device
- Social features increase player motivation
- Project demonstrates modern web development technologies

---

## Theoretical Background

### Sudoku Generation Algorithm

The **backtracking algorithm** is used to generate puzzles:

#### Generation Stages:

1. **Creating a Full Board**
   - Initialize an empty 9×9 grid
   - Sequentially fill cells with numbers 1-9
   - Validate each number placement
   - If a number doesn't fit — backtrack

2. **Creating the Puzzle**
   - Copy the full board
   - Randomly remove cells based on difficulty:
     - **Easy**: 30 cells removed (51 remaining)
     - **Medium**: 40 cells removed (41 remaining)
     - **Hard**: 50 cells removed (31 remaining)

#### Algorithm Pseudocode:

```
Function FILL_BOARD(board):
    For each cell (i, j):
        If cell is empty:
            For each number from 1 to 9 (random order):
                If number IS_VALID(board, i, j, number):
                    Place number in cell
                    If FILL_BOARD(board) = SUCCESS:
                        Return SUCCESS
                    Clear cell (backtracking)
            Return FAILURE
    Return SUCCESS

Function IS_VALID(board, row, column, number):
    Check if number NOT in row
    Check if number NOT in column
    Check if number NOT in 3×3 block
    Return result
```

### MVC Architecture

The project is built on the **MVC** (Model-View-Controller) architectural pattern:

```
┌─────────────────────────────────────────────────────────┐
│                         User                            │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                Controller (Views)                       │
│  - HTTP request handling                               │
│  - Business logic                                       │
│  - Model interaction                                    │
└──────────┬────────────────────────────┬─────────────────┘
           │                            │
           ▼                            ▼
┌─────────────────────┐    ┌─────────────────────────────┐
│   Model (Models)    │    │      View (Templates)       │
│  - GameResult       │    │  - HTML templates           │
│  - ChatMessage      │    │  - CSS styles               │
│  - User             │    │  - JavaScript               │
└──────────┬──────────┘    └─────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│     Database        │
│    (PostgreSQL)     │
└─────────────────────┘
```

### Client-Server Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                  │
│  │   HTML5    │  │   CSS3     │  │ JavaScript │                  │
│  │ Templates  │  │   Styles   │  │   Logic    │                  │
│  └────────────┘  └────────────┘  └────────────┘                  │
│                                                                  │
│  Files: game.html, sudoku.js, chat.js, style.css                │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTP (JSON)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                        SERVER (Django)                           │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   URL Router    │  │     Views       │  │     Models      │   │
│  │   (urls.py)     │  │   (views.py)    │  │   (models.py)   │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                  │
│  Files: views.py, models.py, urls.py                            │
└────────────────────────────┬─────────────────────────────────────┘
                             │ SQL (ORM)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
├──────────────────────────────────────────────────────────────────┤
│  Tables: auth_user, sudoku_gameresult, sudoku_chatmessage        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. Authentication System

| Feature | Description |
|---------|-------------|
| Registration | Create new account with username, email, and password |
| Login | Authenticate using username and password |
| Logout | End user session |
| Sessions | Maintain authentication state between requests |

### 2. Sudoku Game

| Feature | Description |
|---------|-------------|
| Generation | Automatic creation of new puzzles |
| Difficulty | Three levels: Easy, Medium, Hard |
| Timer | Track solving time |
| Mistakes | Mistake counter (maximum 3) |
| Hints | Hint system (maximum 3) |
| Notes | Mode for marking possible options |
| Highlighting | Highlight related cells |
| Auto-win | Automatic solution detection |

### 3. Leaderboard

| Feature | Description |
|---------|-------------|
| Ranking | Top 50 players by time |
| Filters | Sort by difficulty |
| Statistics | Time, hints, completion date |

### 4. Player Chat

| Feature | Description |
|---------|-------------|
| Messages | Send text messages |
| Updates | Auto-refresh every 3 seconds |
| History | Store last 50 messages |

---

## Technologies and Tools

### Backend (Server-side)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.10+ | Programming language |
| **Django** | 5.0 | Web framework |
| **PostgreSQL** | 15+ | Database |
| **psycopg2** | 2.9.11 | PostgreSQL adapter for Python |
| **dj-database-url** | 3.0.1 | Database URL parser |

### Frontend (Client-side)

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic page markup |
| **CSS3** | Styling and animations |
| **JavaScript** | Interactivity and game logic |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Git** | Version control system |
| **Poetry** | Python dependency management |
| **Ruff** | Code linter |
| **VS Code** | Code editor |

---

## Project Structure

```
sudoku/
├── manage.py                 # Django CLI utility
├── pyproject.toml            # Project configuration
├── poetry.lock               # Dependency versions
│
├── django_project/           # Main Django configuration
│   ├── __init__.py
│   ├── settings.py           # Project settings
│   ├── urls.py               # Main routing
│   ├── wsgi.py               # WSGI configuration
│   └── asgi.py               # ASGI configuration
│
├── sudoku/                   # Main application
│   ├── __init__.py
│   ├── apps.py               # Application configuration
│   ├── models.py             # Database models
│   ├── views.py              # Request handlers
│   ├── urls.py               # Application routes
│   ├── admin.py              # Administration
│   ├── tests.py              # Tests
│   └── migrations/           # Database migrations
│
├── templates/                # HTML templates
│   ├── base.html             # Base template
│   ├── home.html             # Home page
│   ├── game.html             # Game page
│   ├── leaderboard.html      # Leaderboard
│   ├── chat.html             # Player chat
│   └── registration/         # Authentication templates
│       ├── login.html
│       └── register.html
│
├── static/                   # Static files
│   ├── css/
│   │   └── style.css         # All styles (824 lines)
│   └── js/
│       ├── main.js           # General functionality
│       ├── sudoku.js         # Game logic (394 lines)
│       └── chat.js           # Chat functionality
│
└── docs/                     # Documentation
    ├── README.md             # Ukrainian version
    ├── Architecture.md       # Project architecture
    ├── Algorithms.md         # Algorithm descriptions
    ├── API.md                # API documentation
    ├── Database.md           # Database structure
    ├── Installation.md       # Installation guide
    └── en/                   # English version
        └── README.md         # This file
```

---

## Module Descriptions

### models.py — Data Models

#### GameResult Class
Stores completed game results.

```python
class GameResult(models.Model):
    user = ForeignKey(User)           # Player
    difficulty = CharField()          # Difficulty: easy/medium/hard
    time_seconds = IntegerField()     # Solving time (seconds)
    hints_used = IntegerField()       # Hints used (0-3)
    completed = BooleanField()        # Completed
    created_at = DateTimeField()      # Completion date
```

#### ChatMessage Class
Stores chat messages.

```python
class ChatMessage(models.Model):
    user = ForeignKey(User)           # Author
    message = TextField()             # Text (up to 500 characters)
    created_at = DateTimeField()      # Send time
```

#### SudokuGenerator Class
Puzzle generator with methods:
- `generate_full_board()` — generate full board
- `create_puzzle(difficulty)` — create puzzle
- `check_solution()` — verify solution

### views.py — Request Handlers

| Function | Method | URL | Description |
|----------|--------|-----|-------------|
| `home` | GET | `/` | Home page |
| `register_view` | GET/POST | `/register/` | Registration |
| `login_view` | GET/POST | `/login/` | Login |
| `logout_view` | GET | `/logout/` | Logout |
| `game_view` | GET | `/game/` | Start game |
| `submit_game` | POST | `/game/submit/` | Save result |
| `get_hint` | GET | `/game/hint/` | Get hint |
| `leaderboard_view` | GET | `/leaderboard/` | Leaderboard |
| `chat_view` | GET | `/chat/` | Chat page |
| `send_message` | POST | `/chat/send/` | Send message |
| `get_messages` | GET | `/chat/messages/` | Get messages |

### sudoku.js — Game Logic

| Function | Description |
|----------|-------------|
| `buildBoard()` | Build 9×9 board DOM structure |
| `handleCellClick()` | Handle cell click |
| `enterNumber()` | Enter number with validation |
| `updateHighlighting()` | Update cell highlighting |
| `checkWin()` | Check win condition |
| `showWin()` | Display victory modal |
| `showGameOver()` | Display game over modal |
| `toggleNotesMode()` | Toggle notes mode |
| `getHint()` | Request hint from server |
| `startTimer()` | Start timer |
| `navigateCell()` | Keyboard navigation |

---

## Installation Guide

### System Requirements

- **Python** 3.10 or newer
- **PostgreSQL** 15 or newer
- **Git** for cloning repository

### Step 1: Clone Repository

```bash
git clone https://github.com/username/sudoku.git
cd sudoku
```

### Step 2: Install Dependencies

```bash
# Install Poetry (if not installed)
pip install poetry

# Install project dependencies
poetry install
```

### Step 3: Configure Database

```bash
# Enter PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE sudoku_db;
CREATE USER sudoku_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE sudoku_db TO sudoku_user;
\q
```

### Step 4: Set Environment Variables

```bash
export DATABASE_URL="postgresql://sudoku_user:password@localhost:5432/sudoku_db"
export SECRET_KEY="your-secret-key-here"
```

### Step 5: Apply Migrations

```bash
python manage.py migrate
```

### Step 6: Run Server

```bash
python manage.py runserver 0.0.0.0:5000
```

### Step 7: Open in Browser

Open http://localhost:5000

---

## User Manual

### Registration and Login

1. Click the **Register** button on the home page
2. Enter username, email (optional), and password
3. After registration, log in using the **Login** button

### Starting a Game

1. On the home page, select difficulty level:
   - **Easy** — for beginners (51 filled cells)
   - **Medium** — intermediate level (41 filled cells)
   - **Hard** — for experienced players (31 filled cells)
2. Click on the selected level

### Game Controls

#### Entering Numbers
1. Click on an empty cell
2. Select a number on the panel below (1-9)
3. To delete a number, press **X**

#### Notes Mode
1. Click the **Notes** button to activate
2. Add possible options to a cell
3. Notes are automatically removed when entering a number

#### Hints
1. Click the **Hint** button for a hint
2. Only 3 hints available per game
3. Hint shows the correct number for the selected cell

#### Mistakes
- Entering an incorrect number adds a mistake
- Maximum 3 mistakes — then game over

### Leaderboard

1. Go to **Leaderboard** via menu
2. View top 50 players
3. Filter by difficulty: All / Easy / Medium / Hard

### Chat

1. Go to **Chat** via menu
2. Enter a message and click **Send**
3. Messages auto-update every 3 seconds

---

## Conclusions

### Project Results

As a result of the project, a fully functional web application for playing Sudoku was created with the following features:

1. **Automatic generation** — backtracking algorithm creates unique puzzles
2. **Three difficulty levels** — from easy to hard
3. **Authentication system** — user registration and login
4. **Leaderboard** — motivation through competition
5. **Social chat** — communication between players
6. **Responsive design** — mobile device support
7. **Intuitive interface** — ease of use

### Skills Acquired

- Web application development with Django
- Working with PostgreSQL databases
- Creating interactive interfaces with JavaScript
- Applying algorithms (backtracking)
- Designing client-server architecture

### Future Development

- Adding new game modes (tournaments, multiplayer)
- Social media integration
- Player statistics and achievements
- Mobile application

---

## References

1. Django Documentation — https://docs.djangoproject.com/
2. PostgreSQL Documentation — https://www.postgresql.org/docs/
3. MDN Web Docs — https://developer.mozilla.org/
4. Sudoku Algorithms — https://en.wikipedia.org/wiki/Sudoku_solving_algorithms
5. CSS Tricks — https://css-tricks.com/

---

**Project Author:** [Your Name]
**Completion Date:** 2024-2025
**License:** MIT License
