# Sudoku Project Architecture

## Table of Contents

1. [General Overview](#general-overview)
2. [MVC Architectural Pattern](#mvc-architectural-pattern)
3. [Server-side Structure](#server-side-structure)
4. [Client-side Structure](#client-side-structure)
5. [Data Flows](#data-flows)
6. [System Components](#system-components)
7. [Security](#security)

---

## General Overview

The project is built on a **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                        │
│                      (Frontend)                             │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  HTML5   │  │   CSS3   │  │ sudoku.js│  │ chat.js  │    │
│  │Templates │  │  Styles  │  │Game Logic│  │  Chat    │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTP/HTTPS (JSON, HTML)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                     │
│                        (Backend)                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  Django Framework                     │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────┐  │  │
│  │  │  urls.py   │  │  views.py  │  │ SudokuGenerator│  │  │
│  │  │  Routes    │  │ Controllers│  │ Business Logic │  │  │
│  │  └────────────┘  └────────────┘  └────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │ SQL via Django ORM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
│                       (Database)                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   PostgreSQL                          │  │
│  │  ┌─────────────┐ ┌──────────────┐ ┌───────────────┐  │  │
│  │  │ auth_user   │ │ gameresult   │ │ chatmessage   │  │  │
│  │  └─────────────┘ └──────────────┘ └───────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## MVC Architectural Pattern

Django uses the **MVT** (Model-View-Template) pattern, which is a variation of classic MVC:

### MVC vs MVT Comparison

| Classic MVC | Django MVT | Purpose |
|-------------|------------|---------|
| Model | Model | Data handling (DB) |
| View | Template | Data display |
| Controller | View | Business logic, request processing |

### MVT Structure in the Project

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP REQUEST                            │
│                    (from user's browser)                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       URL DISPATCHER                            │
│                         (urls.py)                               │
│                                                                 │
│  Determines which View handles the request based on URL:       │
│  - /game/ → game_view                                          │
│  - /chat/ → chat_view                                          │
│  - /leaderboard/ → leaderboard_view                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           VIEW                                  │
│                        (views.py)                               │
│                                                                 │
│  Processes request and forms response:                         │
│  1. Input data validation                                      │
│  2. Model interaction                                          │
│  3. Business logic invocation                                  │
│  4. Template selection or JSON formation                       │
└────────┬────────────────────────────────────────┬───────────────┘
         │                                        │
         ▼                                        ▼
┌─────────────────────────┐        ┌─────────────────────────────┐
│         MODEL           │        │         TEMPLATE            │
│       (models.py)       │        │  (templates/*.html)         │
│                         │        │                             │
│  Defines data structure │        │  Generates HTML based on    │
│  and interacts with     │        │  context from View          │
│  the database           │        │                             │
└────────┬────────────────┘        └──────────────┬──────────────┘
         │                                        │
         ▼                                        │
┌─────────────────────────┐                       │
│       DATABASE          │                       │
│     (PostgreSQL)        │                       │
└─────────────────────────┘                       │
                                                  ▼
                              ┌─────────────────────────────────────┐
                              │            HTTP RESPONSE            │
                              │      (HTML page or JSON)            │
                              └─────────────────────────────────────┘
```

---

## Server-side Structure

### Backend File Organization

```
django_project/              # Django project configuration
├── __init__.py              # Package initialization
├── settings.py              # Project settings
│   ├── DEBUG                # Development mode
│   ├── DATABASES            # DB connection
│   ├── INSTALLED_APPS       # Installed applications
│   ├── TEMPLATES            # Template settings
│   └── STATIC_URL           # Static files path
├── urls.py                  # Main router
├── wsgi.py                  # WSGI entry point
└── asgi.py                  # ASGI entry point

sudoku/                      # Main application
├── __init__.py
├── apps.py                  # Application configuration
├── models.py                # Data models
│   ├── GameResult           # Game results
│   ├── ChatMessage          # Chat messages
│   ├── EmailVerification    # Email verification
│   └── SudokuGenerator      # Puzzle generator
├── views.py                 # Request handlers
│   ├── Authentication       # register, login, logout
│   ├── Game                 # game, submit, hint
│   └── Social               # chat, leaderboard
├── urls.py                  # Application routes
├── admin.py                 # Django Admin
└── migrations/              # DB migrations
```

### Backend Component Descriptions

#### 1. settings.py — Project Configuration

```python
# Main settings
DEBUG = True/False               # Development mode
SECRET_KEY = '...'               # Secret key
ALLOWED_HOSTS = ['domain.com']   # Allowed hosts

# Database
DATABASES = {
    'default': dj_database_url.parse(DATABASE_URL)
}

# Applications
INSTALLED_APPS = [
    'django.contrib.admin',      # Admin panel
    'django.contrib.auth',       # Authorization
    'django.contrib.sessions',   # Sessions
    'sudoku',                    # Our application
]

# Templates
TEMPLATES = [
    {
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
    }
]

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
```

#### 2. models.py — Data Models

```python
# GameResult — stores game results
class GameResult(models.Model):
    user = models.ForeignKey(User)       # Link to user
    difficulty = models.CharField()      # easy/medium/hard
    time_seconds = models.IntegerField() # Time in seconds
    hints_used = models.IntegerField()   # 0-3 hints
    completed = models.BooleanField()    # True/False
    created_at = models.DateTimeField()  # Auto date

# ChatMessage — stores messages
class ChatMessage(models.Model):
    user = models.ForeignKey(User)       # Author
    message = models.TextField()         # Text
    created_at = models.DateTimeField()  # Time

# SudokuGenerator — puzzle generator (not a DB model)
class SudokuGenerator:
    @staticmethod
    def generate_full_board()            # Board generation
    @staticmethod
    def create_puzzle(difficulty)        # Puzzle creation
    @staticmethod
    def check_solution(puzzle, answer)   # Verification
```

#### 3. views.py — Request Handlers

```python
# View types in the project:

# 1. Functional View (Function-Based View)
def home(request):
    return render(request, 'home.html')

# 2. View with authorization
@login_required
def game_view(request):
    difficulty = request.GET.get('difficulty', 'medium')
    puzzle, solution = SudokuGenerator.create_puzzle(difficulty)
    request.session['solution'] = solution
    return render(request, 'game.html', {'puzzle': puzzle})

# 3. API View (returns JSON)
@login_required
@require_POST
def submit_game(request):
    data = json.loads(request.body)
    # Processing...
    return JsonResponse({'status': 'success'})
```

---

## Client-side Structure

### Frontend File Organization

```
templates/                   # HTML templates
├── base.html                # Base template (layout)
│   ├── <head>               # Meta, CSS, Title
│   ├── <nav>                # Navigation
│   ├── {% block content %}  # Page content
│   └── <script>             # JavaScript
├── home.html                # Home page
├── game.html                # Game board
├── leaderboard.html         # Leaderboard
├── chat.html                # Chat
└── registration/            # Authorization
    ├── login.html
    └── register.html

static/                      # Static files
├── css/
│   └── style.css            # All styles (824 lines)
│       ├── CSS Variables    # Colors, sizes
│       ├── Base Styles      # Base styles
│       ├── Navigation       # Menu
│       ├── Game Board       # Sudoku board
│       ├── Number Pad       # Number panel
│       ├── Modals           # Modal windows
│       └── Responsive       # Responsiveness
└── js/
    ├── main.js              # Navigation (39 lines)
    ├── sudoku.js            # Game logic (394 lines)
    └── chat.js              # Chat (89 lines)
```

### JavaScript Module Descriptions

#### 1. sudoku.js — Game Logic

```javascript
// Global variables
let puzzle = [];              // Initial board
let solution = [];            // Solution
let currentBoard = [];        // Current state
let selectedCell = null;      // Selected cell
let mistakes = 0;             // Mistake count
let hints = 0;                // Hints used
let notesMode = false;        // Notes mode
let cellNotes = {};           // Cell notes
let timerInterval = null;     // Timer interval
let seconds = 0;              // Seconds

// Main functions
function buildBoard()         // Build DOM
function handleCellClick(i,j) // Handle click
function enterNumber(num)     // Enter number
function updateHighlighting() // Highlighting
function checkWin()           // Check victory
function showWin()            // Victory modal
function showGameOver()       // Game over modal
function toggleNotesMode()    // Toggle notes
function getHint()            // Get hint
function startTimer()         // Start timer
function updateTimer()        // Update timer
function navigateCell(dir)    // Arrow navigation
```

#### 2. chat.js — Chat Functionality

```javascript
// Variables
let lastMessageId = 0;        // Last message ID

// Functions
function loadMessages()       // Load messages
function pollMessages()       // Poll server (every 3s)
function addMessage(msg)      // Add message to DOM
function sendMessage()        // Send message
function escapeHtml(text)     // HTML escape (security)
```

#### 3. main.js — General Functionality

```javascript
// Functions
function toggleMenu()         // Open/close menu
document.addEventListener()   // Initialization
```

---

## Data Flows

### 1. Game Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GAME START                                  │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  1. User selects difficulty (Easy/Medium/Hard)                     │
│     → GET /game/?difficulty=medium                                  │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  2. Server generates puzzle                                        │
│     → SudokuGenerator.create_puzzle('medium')                       │
│     → session['puzzle'] = puzzle                                    │
│     → session['solution'] = solution                                │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  3. Client receives HTML with board                                │
│     → game.html with {{ puzzle|safe }}                              │
│     → sudoku.js calls buildBoard()                                  │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  4. User plays                                                     │
│     → Click on cell → handleCellClick()                            │
│     → Enter number → enterNumber()                                  │
│     → Error checking                                               │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  5. Victory or defeat                                              │
│     Victory: checkWin() → showWin() → POST /game/submit/           │
│     Defeat: mistakes >= 3 → showGameOver()                         │
└───────────────────────────┬─────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│  6. Save result                                                    │
│     → GameResult.objects.create(user, difficulty, time, hints)     │
│     → Redirect to leaderboard                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Authentication Flow

```
┌────────────────────────────────────────────────────────────┐
│                     REGISTRATION                           │
├────────────────────────────────────────────────────────────┤
│  1. GET /register/                                         │
│     → Display form                                         │
│                                                            │
│  2. POST /register/                                        │
│     → Validation (username, password1, password2)          │
│     → User.objects.create_user()                           │
│     → Redirect /login/                                     │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                        LOGIN                               │
├────────────────────────────────────────────────────────────┤
│  1. GET /login/                                            │
│     → Display form                                         │
│                                                            │
│  2. POST /login/                                           │
│     → authenticate(username, password)                      │
│     → login(request, user)                                 │
│     → Create session                                       │
│     → Redirect /                                           │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                        LOGOUT                              │
├────────────────────────────────────────────────────────────┤
│  GET /logout/                                              │
│  → logout(request)                                         │
│  → Delete session                                          │
│  → Redirect /                                              │
└────────────────────────────────────────────────────────────┘
```

### 3. Chat Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CHAT SYSTEM                                 │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────┐
│  Page Load    │   │    Send       │   │     Update        │
│               │   │   Message     │   │   (polling)       │
└───────┬───────┘   └───────┬───────┘   └─────────┬─────────┘
        │                   │                     │
        ▼                   ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────┐
│ GET /chat/    │   │POST /chat/send│   │GET /chat/messages │
│               │   │ {message: ""}  │   │ ?last_id=123      │
│ Last 50       │   │               │   │                   │
│ messages      │   │ ChatMessage   │   │ New messages      │
└───────────────┘   │ .create()     │   │ with id > last_id │
                    └───────────────┘   └───────────────────┘
                                                │
                                                ▼
                                        ┌───────────────────┐
                                        │ setInterval(      │
                                        │   pollMessages,   │
                                        │   3000            │
                                        │ )                 │
                                        └───────────────────┘
```

---

## System Components

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BROWSER                                       │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      HTML PAGES                                  │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐    │   │
│  │  │   home    │ │   game    │ │   chat    │ │  leaderboard  │    │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      JAVASCRIPT                                  │   │
│  │  ┌───────────────────┐  ┌───────────────────────────────────┐   │   │
│  │  │     sudoku.js     │  │           chat.js                 │   │   │
│  │  │ - Game logic      │  │ - Message polling                 │   │   │
│  │  │ - Validation      │  │ - Send/receive                    │   │   │
│  │  │ - UI interaction  │  │ - DOM manipulation                │   │   │
│  │  └───────────────────┘  └───────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        CSS                                       │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                     style.css                              │  │   │
│  │  │ - CSS Variables (colors, sizes)                           │  │   │
│  │  │ - Flexbox/Grid layouts                                    │  │   │
│  │  │ - Animations and transitions                              │  │   │
│  │  │ - Responsive design                                       │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DJANGO SERVER                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       URL ROUTING                                │   │
│  │  ┌────────────────────────────────────────────────────────────┐ │   │
│  │  │  django_project/urls.py → sudoku/urls.py                   │ │   │
│  │  └────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                          VIEWS                                   │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │   │
│  │  │    Auth    │ │    Game    │ │    Chat    │ │ Leaderboard│   │   │
│  │  │ register   │ │ game_view  │ │ chat_view  │ │ leaderboard│   │   │
│  │  │ login      │ │ submit     │ │ send_msg   │ │ _view      │   │   │
│  │  │ logout     │ │ get_hint   │ │ get_msgs   │ │            │   │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         MODELS                                   │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────────────┐  │   │
│  │  │ GameResult │ │ChatMessage │ │     SudokuGenerator        │  │   │
│  │  │            │ │            │ │ - generate_full_board()    │  │   │
│  │  │            │ │            │ │ - create_puzzle()          │  │   │
│  │  │            │ │            │ │ - check_solution()         │  │   │
│  │  └────────────┘ └────────────┘ └────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       DJANGO ORM                                 │   │
│  │  Automatic conversion of Python objects to SQL queries          │   │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SQL
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          POSTGRESQL                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  auth_user       │  sudoku_gameresult  │  sudoku_chatmessage    │   │
│  │  ───────────     │  ─────────────────  │  ───────────────────   │   │
│  │  id              │  id                 │  id                    │   │
│  │  username        │  user_id (FK)       │  user_id (FK)          │   │
│  │  password        │  difficulty         │  message               │   │
│  │  email           │  time_seconds       │  created_at            │   │
│  │  ...             │  hints_used         │                        │   │
│  │                  │  completed          │                        │   │
│  │                  │  created_at         │                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Security

### Implemented Security Mechanisms

#### 1. CSRF Protection (Cross-Site Request Forgery)

```html
<!-- In every form -->
<form method="POST">
    {% csrf_token %}
    <!-- form fields -->
</form>
```

```javascript
// In JavaScript requests
fetch('/api/endpoint/', {
    method: 'POST',
    headers: {
        'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify(data)
});
```

#### 2. Authorization (@login_required)

```python
from django.contrib.auth.decorators import login_required

@login_required
def game_view(request):
    # Only for authorized users
    pass
```

#### 3. HTTP Method Validation

```python
from django.views.decorators.http import require_POST

@require_POST
def submit_game(request):
    # POST requests only
    pass
```

#### 4. XSS Protection (Cross-Site Scripting)

```javascript
// In chat.js
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Usage
addMessage({
    username: escapeHtml(msg.username),
    message: escapeHtml(msg.message)
});
```

#### 5. Session-based Authentication

```python
# Django automatically manages sessions
# Storage in DB or files
SESSION_ENGINE = 'django.contrib.sessions.backends.db'
```

#### 6. Password Protection

```python
# Django automatically hashes passwords
# Uses PBKDF2 with SHA256
from django.contrib.auth.hashers import make_password

password_hash = make_password('user_password')
# Result: pbkdf2_sha256$260000$salt$hash
```

### Security Table

| Threat | Protection | Implementation |
|--------|------------|----------------|
| CSRF | CSRF Token | `{% csrf_token %}` in forms |
| XSS | Escaping | `escapeHtml()` in JavaScript |
| SQL Injection | ORM | Django ORM instead of raw SQL |
| Brute Force | Session limits | Django sessions |
| Unauthorized Access | @login_required | View decorators |

---

## Conclusion

The "Sudoku" project architecture is based on proven principles:

1. **Separation of concerns** — each component has a clear role
2. **Modularity** — easy to extend and modify
3. **Security** — protection against main web vulnerabilities
4. **Scalability** — possibility of horizontal scaling

This architecture ensures reliable and productive web application operation.
