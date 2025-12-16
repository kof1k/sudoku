# Sudoku Project API Documentation

## Table of Contents

1. [General Information](#general-information)
2. [Routes (URLs)](#routes-urls)
3. [Authentication](#authentication)
4. [Game](#game)
5. [Chat](#chat)
6. [Leaderboard](#leaderboard)
7. [Response Codes](#response-codes)

---

## General Information

### Base URL
```
http://localhost:5000/
```

### Data Format
- **Requests:** HTML forms or JSON
- **Responses:** HTML pages or JSON

### Authentication
- Session-based Django authentication is used
- CSRF token is required for POST requests

### CSRF Token
For POST requests, include the CSRF token:

**In HTML forms:**
```html
<form method="POST">
    {% csrf_token %}
    <!-- form fields -->
</form>
```

**In JavaScript (fetch):**
```javascript
fetch('/api/endpoint/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify(data)
});

// Function to get cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
}
```

---

## Routes (URLs)

### All Routes Table

| Method | URL | View | Description | Auth Required |
|--------|-----|------|-------------|---------------|
| GET | `/` | `home` | Home page | No |
| GET/POST | `/register/` | `register_view` | Registration | No |
| GET/POST | `/login/` | `login_view` | Login | No |
| GET | `/logout/` | `logout_view` | Logout | No |
| GET | `/game/` | `game_view` | Start game | Yes |
| POST | `/game/submit/` | `submit_game` | Save result | Yes |
| GET | `/game/hint/` | `get_hint` | Get hint | Yes |
| GET | `/leaderboard/` | `leaderboard_view` | Leaderboard | No |
| GET | `/chat/` | `chat_view` | Chat page | Yes |
| POST | `/chat/send/` | `send_message` | Send message | Yes |
| GET | `/chat/messages/` | `get_messages` | Get messages | Yes |

### Routes Diagram

```
                    ┌─────────────────┐
                    │  django_project │
                    │    urls.py      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
    │   /admin/   │  │     /       │  │  /static/   │
    │ Django Admin│  │ sudoku.urls │  │   Static    │
    └─────────────┘  └──────┬──────┘  └─────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
    ┌─────────┐       ┌─────────┐        ┌─────────┐
    │  Auth   │       │  Game   │        │ Social  │
    │ /login/ │       │ /game/  │        │ /chat/  │
    │/register│       │/submit/ │        │/leader/ │
    │/logout/ │       │ /hint/  │        └─────────┘
    └─────────┘       └─────────┘
```

---

## Authentication

### POST /register/ — User Registration

**Description:** Creates a new user account.

**Request:**
```
Content-Type: application/x-www-form-urlencoded

username=johndoe&email=john@example.com&password1=securePass123&password2=securePass123
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | Username (max 150 chars) |
| email | string | No | Email address |
| password1 | string | Yes | Password |
| password2 | string | Yes | Password confirmation |

**Response (success):**
```
HTTP/1.1 302 Found
Location: /login/
```

**Response (error):**
```html
HTTP/1.1 200 OK
Content-Type: text/html

<!-- HTML page with validation errors -->
<ul class="errorlist">
    <li>Username already exists</li>
</ul>
```

**Possible errors:**
- Username already exists
- Passwords don't match
- Password too short (< 8 characters)
- Password too simple

---

### POST /login/ — User Login

**Description:** Authenticates user and creates session.

**Request:**
```
Content-Type: application/x-www-form-urlencoded

username=johndoe&password=securePass123
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | Yes | Username |
| password | string | Yes | Password |

**Response (success):**
```
HTTP/1.1 302 Found
Location: /
Set-Cookie: sessionid=abc123...; HttpOnly; Path=/
```

**Response (error):**
```html
HTTP/1.1 200 OK

<!-- HTML page with error -->
<p class="error">Invalid username or password</p>
```

---

### GET /logout/ — User Logout

**Description:** Ends user session.

**Request:**
```
GET /logout/ HTTP/1.1
Cookie: sessionid=abc123...
```

**Response:**
```
HTTP/1.1 302 Found
Location: /
Set-Cookie: sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/
```

---

## Game

### GET /game/ — Start New Game

**Description:** Generates new puzzle and returns game page.

**Authorization:** Required

**Request:**
```
GET /game/?difficulty=medium HTTP/1.1
Cookie: sessionid=abc123...
```

**URL Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| difficulty | string | "medium" | Difficulty: "easy", "medium", "hard" |

**Response:**
```html
HTTP/1.1 200 OK
Content-Type: text/html

<!-- HTML game page with embedded data -->
<script>
    const puzzle = [[3,0,1,...], ...];    // Puzzle
    const solution = [[3,5,1,...], ...];  // Solution (for validation)
</script>
```

**Session:**
Server stores in session:
```python
request.session['puzzle'] = puzzle
request.session['solution'] = solution
request.session['difficulty'] = difficulty
```

---

### POST /game/submit/ — Save Game Result

**Description:** Saves completed game result to database.

**Authorization:** Required

**Request:**
```json
POST /game/submit/ HTTP/1.1
Content-Type: application/json
X-CSRFToken: abc123...
Cookie: sessionid=xyz789...

{
    "solution": [[3,5,1,8,2,6,7,9,4], ...],
    "time": 245,
    "hints": 2,
    "difficulty": "medium"
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| solution | array[9][9] | Yes | User's solution |
| time | integer | Yes | Time in seconds |
| hints | integer | Yes | Hints used (0-3) |
| difficulty | string | Yes | Game difficulty |

**Response (success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "success",
    "message": "Game result saved",
    "time": 245,
    "hints": 2
}
```

**Response (error — invalid solution):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "error",
    "message": "Invalid solution"
}
```

**Response (error — not authorized):**
```
HTTP/1.1 302 Found
Location: /login/?next=/game/submit/
```

---

### GET /game/hint/ — Get Hint

**Description:** Returns correct number for a random empty cell.

**Authorization:** Required

**Request:**
```
GET /game/hint/ HTTP/1.1
Cookie: sessionid=abc123...
```

**Response (success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "success",
    "row": 3,
    "col": 5,
    "value": 7
}
```

**Response (error — no empty cells):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "error",
    "message": "No empty cells"
}
```

**Response (error — no board in session):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "error",
    "message": "No active game"
}
```

---

## Chat

### GET /chat/ — Chat Page

**Description:** Returns HTML chat page with recent messages.

**Authorization:** Required

**Request:**
```
GET /chat/ HTTP/1.1
Cookie: sessionid=abc123...
```

**Response:**
```html
HTTP/1.1 200 OK
Content-Type: text/html

<!-- HTML chat page -->
<div id="messages">
    <div class="message">
        <span class="username">user1</span>
        <span class="text">Hello!</span>
        <span class="time">14:30</span>
    </div>
    ...
</div>
```

---

### POST /chat/send/ — Send Message

**Description:** Sends new message to chat.

**Authorization:** Required

**Request:**
```json
POST /chat/send/ HTTP/1.1
Content-Type: application/json
X-CSRFToken: abc123...
Cookie: sessionid=xyz789...

{
    "message": "Hello, everyone!"
}
```

**Body Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| message | string | Yes | Message text (max 500 chars) |

**Response (success):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "success",
    "message": {
        "id": 123,
        "username": "johndoe",
        "message": "Hello, everyone!",
        "created_at": "2024-12-16T14:30:00Z"
    }
}
```

**Response (error — empty message):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "error",
    "message": "Message cannot be empty"
}
```

**Response (error — too long):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "error",
    "message": "Message too long (max 500 characters)"
}
```

---

### GET /chat/messages/ — Get New Messages

**Description:** Returns messages created after specified ID (for polling).

**Authorization:** Required

**Request:**
```
GET /chat/messages/?last_id=120 HTTP/1.1
Cookie: sessionid=abc123...
```

**URL Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| last_id | integer | 0 | ID of last known message |

**Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "success",
    "messages": [
        {
            "id": 121,
            "username": "user1",
            "message": "Hi there!",
            "created_at": "2024-12-16T14:31:00Z"
        },
        {
            "id": 122,
            "username": "user2",
            "message": "How are you?",
            "created_at": "2024-12-16T14:32:00Z"
        }
    ]
}
```

**Polling Usage:**
```javascript
// Poll every 3 seconds
let lastMessageId = 0;

setInterval(async () => {
    const response = await fetch(`/chat/messages/?last_id=${lastMessageId}`);
    const data = await response.json();

    if (data.messages.length > 0) {
        data.messages.forEach(msg => {
            addMessageToDOM(msg);
            lastMessageId = Math.max(lastMessageId, msg.id);
        });
    }
}, 3000);
```

---

## Leaderboard

### GET /leaderboard/ — Leaderboard

**Description:** Returns HTML page with top 50 results.

**Authorization:** Not required

**Request:**
```
GET /leaderboard/?difficulty=medium HTTP/1.1
```

**URL Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| difficulty | string | "all" | Filter: "all", "easy", "medium", "hard" |

**Response:**
```html
HTTP/1.1 200 OK
Content-Type: text/html

<!-- HTML page with table -->
<table>
    <thead>
        <tr>
            <th>#</th>
            <th>Player</th>
            <th>Difficulty</th>
            <th>Time</th>
            <th>Hints</th>
            <th>Date</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1</td>
            <td>champion123</td>
            <td>Medium</td>
            <td>2:45</td>
            <td>0</td>
            <td>16.12.2024</td>
        </tr>
        ...
    </tbody>
</table>
```

---

## Response Codes

### HTTP Status Codes

| Code | Description | When Used |
|------|-------------|-----------|
| 200 | OK | Successful request |
| 302 | Found | Redirect (after login/logout) |
| 400 | Bad Request | Invalid data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied (CSRF) |
| 404 | Not Found | Page not found |
| 405 | Method Not Allowed | Wrong HTTP method |
| 500 | Internal Server Error | Server error |

### JSON Statuses

For JSON responses, custom statuses are used:

```json
// Success
{
    "status": "success",
    "data": { ... }
}

// Error
{
    "status": "error",
    "message": "Error description"
}
```

---

## Usage Examples

### Full Game Cycle (JavaScript)

```javascript
// 1. Check authentication
async function checkAuth() {
    const response = await fetch('/');
    // If redirect to /login/ - user not authenticated
}

// 2. Start game
async function startGame(difficulty) {
    window.location.href = `/game/?difficulty=${difficulty}`;
}

// 3. Get hint
async function getHint() {
    const response = await fetch('/game/hint/');
    const data = await response.json();

    if (data.status === 'success') {
        const { row, col, value } = data;
        fillCell(row, col, value);
    }
}

// 4. Save result
async function submitGame(solution, time, hints, difficulty) {
    const response = await fetch('/game/submit/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            solution,
            time,
            hints,
            difficulty
        })
    });

    const data = await response.json();
    if (data.status === 'success') {
        showVictoryModal();
    }
}
```

### Chat Integration (JavaScript)

```javascript
class ChatClient {
    constructor() {
        this.lastMessageId = 0;
        this.pollInterval = null;
    }

    // Start polling
    start() {
        this.loadInitialMessages();
        this.pollInterval = setInterval(() => {
            this.pollNewMessages();
        }, 3000);
    }

    // Stop polling
    stop() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }

    // Load initial messages
    async loadInitialMessages() {
        const response = await fetch('/chat/messages/?last_id=0');
        const data = await response.json();
        data.messages.forEach(msg => this.addMessage(msg));
    }

    // Poll for new messages
    async pollNewMessages() {
        const response = await fetch(
            `/chat/messages/?last_id=${this.lastMessageId}`
        );
        const data = await response.json();

        data.messages.forEach(msg => {
            this.addMessage(msg);
            this.lastMessageId = Math.max(this.lastMessageId, msg.id);
        });
    }

    // Send message
    async sendMessage(text) {
        const response = await fetch('/chat/send/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ message: text })
        });

        return await response.json();
    }

    // Add message to DOM
    addMessage(msg) {
        const container = document.getElementById('messages');
        const div = document.createElement('div');
        div.className = 'message';
        div.innerHTML = `
            <span class="username">${this.escapeHtml(msg.username)}</span>
            <span class="text">${this.escapeHtml(msg.message)}</span>
            <span class="time">${this.formatTime(msg.created_at)}</span>
        `;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    // HTML escaping
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Time formatting
    formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Usage
const chat = new ChatClient();
chat.start();
```

---

## Errors and Handling

### Common Errors

| Situation | Code | Message |
|-----------|------|---------|
| Not authorized | 302 | Redirect to /login/ |
| Invalid CSRF | 403 | CSRF verification failed |
| Wrong method | 405 | Method Not Allowed |
| Invalid solution | 200 | {"status": "error", "message": "Invalid solution"} |
| Empty message | 200 | {"status": "error", "message": "Message cannot be empty"} |

### Client-side Error Handling

```javascript
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);

        // Check for redirect (not authorized)
        if (response.redirected) {
            window.location.href = response.url;
            return null;
        }

        // Check HTTP errors
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        // Check business errors
        if (data.status === 'error') {
            throw new Error(data.message);
        }

        return data;

    } catch (error) {
        console.error('API Error:', error.message);
        showErrorNotification(error.message);
        return null;
    }
}
```

---

## API Versioning

Current API version: **v1** (no explicit versioning in URL)

Future versions may include:
- `/api/v2/game/` — REST API with JSON
- WebSocket for chat instead of polling
- OAuth2 authentication
