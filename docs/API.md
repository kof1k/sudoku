# API Документація проекту "Судоку"

## Зміст

1. [Загальна інформація](#загальна-інформація)
2. [Маршрути (URLs)](#маршрути-urls)
3. [Аутентифікація](#аутентифікація)
4. [Гра](#гра)
5. [Чат](#чат)
6. [Лідерборд](#лідерборд)
7. [Коди відповідей](#коди-відповідей)

---

## Загальна інформація

### Базовий URL
```
http://localhost:5000/
```

### Формат даних
- **Запити:** HTML forms або JSON
- **Відповіді:** HTML сторінки або JSON

### Аутентифікація
- Використовується session-based аутентифікація Django
- CSRF токен обов'язковий для POST запитів

### CSRF Токен
Для POST запитів необхідно включити CSRF токен:

**В HTML формах:**
```html
<form method="POST">
    {% csrf_token %}
    <!-- поля форми -->
</form>
```

**В JavaScript (fetch):**
```javascript
fetch('/api/endpoint/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
    },
    body: JSON.stringify(data)
});

// Функція для отримання cookie
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

## Маршрути (URLs)

### Таблиця всіх маршрутів

| Метод | URL | View | Опис | Авторизація |
|-------|-----|------|------|-------------|
| GET | `/` | `home` | Головна сторінка | - |
| GET/POST | `/register/` | `register_view` | Реєстрація | - |
| GET/POST | `/login/` | `login_view` | Вхід | - |
| GET | `/logout/` | `logout_view` | Вихід | - |
| GET | `/game/` | `game_view` | Початок гри | Required |
| POST | `/game/submit/` | `submit_game` | Збереження результату | Required |
| GET | `/game/hint/` | `get_hint` | Отримання підказки | Required |
| GET | `/leaderboard/` | `leaderboard_view` | Таблиця лідерів | - |
| GET | `/chat/` | `chat_view` | Сторінка чату | Required |
| POST | `/chat/send/` | `send_message` | Відправка повідомлення | Required |
| GET | `/chat/messages/` | `get_messages` | Отримання повідомлень | Required |

### Діаграма маршрутів

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
    │ Django Admin│  │ sudoku.urls │  │   Статика   │
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

## Аутентифікація

### POST /register/ — Реєстрація користувача

**Опис:** Створює новий обліковий запис користувача.

**Запит:**
```
Content-Type: application/x-www-form-urlencoded

username=johndoe&email=john@example.com&password1=securePass123&password2=securePass123
```

**Параметри:**
| Параметр | Тип | Обов'язковий | Опис |
|----------|-----|--------------|------|
| username | string | Так | Ім'я користувача (макс. 150 символів) |
| email | string | Ні | Email адреса |
| password1 | string | Так | Пароль |
| password2 | string | Так | Підтвердження пароля |

**Відповідь (успіх):**
```
HTTP/1.1 302 Found
Location: /login/
```

**Відповідь (помилка):**
```html
HTTP/1.1 200 OK
Content-Type: text/html

<!-- HTML сторінка з помилками валідації -->
<ul class="errorlist">
    <li>Username already exists</li>
</ul>
```

**Можливі помилки:**
- Username вже існує
- Паролі не співпадають
- Пароль занадто короткий (< 8 символів)
- Пароль занадто простий

---

### POST /login/ — Вхід користувача

**Опис:** Авторизує користувача та створює сесію.

**Запит:**
```
Content-Type: application/x-www-form-urlencoded

username=johndoe&password=securePass123
```

**Параметри:**
| Параметр | Тип | Обов'язковий | Опис |
|----------|-----|--------------|------|
| username | string | Так | Ім'я користувача |
| password | string | Так | Пароль |

**Відповідь (успіх):**
```
HTTP/1.1 302 Found
Location: /
Set-Cookie: sessionid=abc123...; HttpOnly; Path=/
```

**Відповідь (помилка):**
```html
HTTP/1.1 200 OK

<!-- HTML сторінка з помилкою -->
<p class="error">Invalid username or password</p>
```

---

### GET /logout/ — Вихід користувача

**Опис:** Завершує сесію користувача.

**Запит:**
```
GET /logout/ HTTP/1.1
Cookie: sessionid=abc123...
```

**Відповідь:**
```
HTTP/1.1 302 Found
Location: /
Set-Cookie: sessionid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/
```

---

## Гра

### GET /game/ — Початок нової гри

**Опис:** Генерує нову головоломку та повертає ігрову сторінку.

**Авторизація:** Обов'язкова

**Запит:**
```
GET /game/?difficulty=medium HTTP/1.1
Cookie: sessionid=abc123...
```

**Параметри URL:**
| Параметр | Тип | За замовчуванням | Опис |
|----------|-----|------------------|------|
| difficulty | string | "medium" | Складність: "easy", "medium", "hard" |

**Відповідь:**
```html
HTTP/1.1 200 OK
Content-Type: text/html

<!-- HTML сторінка гри з вбудованими даними -->
<script>
    const puzzle = [[3,0,1,...], ...];    // Головоломка
    const solution = [[3,5,1,...], ...];  // Розв'язок (для перевірки)
</script>
```

**Сесія:**
Сервер зберігає в сесії:
```python
request.session['puzzle'] = puzzle
request.session['solution'] = solution
request.session['difficulty'] = difficulty
```

---

### POST /game/submit/ — Збереження результату гри

**Опис:** Зберігає результат завершеної гри в базу даних.

**Авторизація:** Обов'язкова

**Запит:**
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

**Параметри тіла:**
| Параметр | Тип | Обов'язковий | Опис |
|----------|-----|--------------|------|
| solution | array[9][9] | Так | Рішення користувача |
| time | integer | Так | Час у секундах |
| hints | integer | Так | Кількість використаних підказок (0-3) |
| difficulty | string | Так | Складність гри |

**Відповідь (успіх):**
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

**Відповідь (помилка — неправильне рішення):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "error",
    "message": "Invalid solution"
}
```

**Відповідь (помилка — не авторизовано):**
```
HTTP/1.1 302 Found
Location: /login/?next=/game/submit/
```

---

### GET /game/hint/ — Отримання підказки

**Опис:** Повертає правильне число для випадкової порожньої клітинки.

**Авторизація:** Обов'язкова

**Запит:**
```
GET /game/hint/ HTTP/1.1
Cookie: sessionid=abc123...
```

**Відповідь (успіх):**
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

**Відповідь (помилка — немає порожніх клітинок):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "error",
    "message": "No empty cells"
}
```

**Відповідь (помилка — немає дошки в сесії):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "error",
    "message": "No active game"
}
```

---

## Чат

### GET /chat/ — Сторінка чату

**Опис:** Повертає HTML сторінку чату з останніми повідомленнями.

**Авторизація:** Обов'язкова

**Запит:**
```
GET /chat/ HTTP/1.1
Cookie: sessionid=abc123...
```

**Відповідь:**
```html
HTTP/1.1 200 OK
Content-Type: text/html

<!-- HTML сторінка чату -->
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

### POST /chat/send/ — Відправка повідомлення

**Опис:** Відправляє нове повідомлення в чат.

**Авторизація:** Обов'язкова

**Запит:**
```json
POST /chat/send/ HTTP/1.1
Content-Type: application/json
X-CSRFToken: abc123...
Cookie: sessionid=xyz789...

{
    "message": "Hello, everyone!"
}
```

**Параметри тіла:**
| Параметр | Тип | Обов'язковий | Опис |
|----------|-----|--------------|------|
| message | string | Так | Текст повідомлення (макс. 500 символів) |

**Відповідь (успіх):**
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

**Відповідь (помилка — порожнє повідомлення):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "error",
    "message": "Message cannot be empty"
}
```

**Відповідь (помилка — занадто довге):**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
    "status": "error",
    "message": "Message too long (max 500 characters)"
}
```

---

### GET /chat/messages/ — Отримання нових повідомлень

**Опис:** Повертає повідомлення, створені після вказаного ID (для polling).

**Авторизація:** Обов'язкова

**Запит:**
```
GET /chat/messages/?last_id=120 HTTP/1.1
Cookie: sessionid=abc123...
```

**Параметри URL:**
| Параметр | Тип | За замовчуванням | Опис |
|----------|-----|------------------|------|
| last_id | integer | 0 | ID останнього відомого повідомлення |

**Відповідь:**
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

**Використання для polling:**
```javascript
// Опитування кожні 3 секунди
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

## Лідерборд

### GET /leaderboard/ — Таблиця лідерів

**Опис:** Повертає HTML сторінку з топ-50 результатів.

**Авторизація:** Не обов'язкова

**Запит:**
```
GET /leaderboard/?difficulty=medium HTTP/1.1
```

**Параметри URL:**
| Параметр | Тип | За замовчуванням | Опис |
|----------|-----|------------------|------|
| difficulty | string | "all" | Фільтр: "all", "easy", "medium", "hard" |

**Відповідь:**
```html
HTTP/1.1 200 OK
Content-Type: text/html

<!-- HTML сторінка з таблицею -->
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

**Контекст шаблону:**
```python
{
    'results': [
        {
            'user__username': 'champion123',
            'difficulty': 'medium',
            'time_seconds': 165,
            'hints_used': 0,
            'created_at': datetime(2024, 12, 16, 14, 30)
        },
        ...
    ],
    'difficulty': 'medium'  # Активний фільтр
}
```

---

## Коди відповідей

### HTTP статус-коди

| Код | Опис | Коли використовується |
|-----|------|----------------------|
| 200 | OK | Успішний запит |
| 302 | Found | Редірект (після login/logout) |
| 400 | Bad Request | Некоректні дані |
| 401 | Unauthorized | Потрібна авторизація |
| 403 | Forbidden | Доступ заборонено (CSRF) |
| 404 | Not Found | Сторінка не знайдена |
| 405 | Method Not Allowed | Неправильний HTTP метод |
| 500 | Internal Server Error | Помилка сервера |

### JSON статуси

Для JSON відповідей використовуються власні статуси:

```json
// Успіх
{
    "status": "success",
    "data": { ... }
}

// Помилка
{
    "status": "error",
    "message": "Error description"
}
```

---

## Приклади використання

### Повний цикл гри (JavaScript)

```javascript
// 1. Перевірка авторизації
async function checkAuth() {
    const response = await fetch('/');
    // Якщо редірект на /login/ - користувач не авторизований
}

// 2. Початок гри
async function startGame(difficulty) {
    window.location.href = `/game/?difficulty=${difficulty}`;
}

// 3. Отримання підказки
async function getHint() {
    const response = await fetch('/game/hint/');
    const data = await response.json();

    if (data.status === 'success') {
        const { row, col, value } = data;
        fillCell(row, col, value);
    }
}

// 4. Збереження результату
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

### Інтеграція чату (JavaScript)

```javascript
class ChatClient {
    constructor() {
        this.lastMessageId = 0;
        this.pollInterval = null;
    }

    // Почати опитування
    start() {
        this.loadInitialMessages();
        this.pollInterval = setInterval(() => {
            this.pollNewMessages();
        }, 3000);
    }

    // Зупинити опитування
    stop() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }

    // Завантажити початкові повідомлення
    async loadInitialMessages() {
        const response = await fetch('/chat/messages/?last_id=0');
        const data = await response.json();
        data.messages.forEach(msg => this.addMessage(msg));
    }

    // Опитування нових повідомлень
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

    // Відправка повідомлення
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

    // Додавання повідомлення в DOM
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

    // Екранування HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Форматування часу
    formatTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Використання
const chat = new ChatClient();
chat.start();
```

---

## Помилки та їх обробка

### Типові помилки

| Ситуація | Код | Повідомлення |
|----------|-----|--------------|
| Не авторизовано | 302 | Редірект на /login/ |
| Невірний CSRF | 403 | CSRF verification failed |
| Неправильний метод | 405 | Method Not Allowed |
| Невірне рішення | 200 | {"status": "error", "message": "Invalid solution"} |
| Порожнє повідомлення | 200 | {"status": "error", "message": "Message cannot be empty"} |

### Обробка помилок на клієнті

```javascript
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);

        // Перевірка редіректу (не авторизовано)
        if (response.redirected) {
            window.location.href = response.url;
            return null;
        }

        // Перевірка HTTP помилок
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        // Перевірка бізнес-помилок
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

## Версіонування API

Поточна версія API: **v1** (без явного версіонування в URL)

У майбутніх версіях може бути додано:
- `/api/v2/game/` — REST API з JSON
- WebSocket для чату замість polling
- OAuth2 авторизація
