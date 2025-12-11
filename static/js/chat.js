document.addEventListener('DOMContentLoaded', function() {
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    
    let lastMessageId = 0;
    const messages = chatBox.querySelectorAll('.chat-message');
    if (messages.length > 0) {
        lastMessageId = parseInt(messages[messages.length - 1].dataset?.id) || 0;
    }
    
    chatBox.scrollTop = chatBox.scrollHeight;
    
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const message = messageInput.value.trim();
        if (!message) return;
        
        fetch('/chat/send/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                addMessage(data.message);
                messageInput.value = '';
            }
        });
    });
    
    function addMessage(msg) {
        const noMessages = chatBox.querySelector('.no-messages');
        if (noMessages) noMessages.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.dataset.id = msg.id;
        messageDiv.innerHTML = `
            <span class="message-user">${escapeHtml(msg.user)}</span>
            <span class="message-time">${msg.created_at}</span>
            <p class="message-text">${escapeHtml(msg.text)}</p>
        `;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
        lastMessageId = msg.id;
    }
    
    function pollMessages() {
        fetch(`/chat/messages/?last_id=${lastMessageId}`)
            .then(response => response.json())
            .then(data => {
                data.messages.forEach(msg => {
                    if (msg.id > lastMessageId) {
                        addMessage(msg);
                    }
                });
            });
    }
    
    setInterval(pollMessages, 3000);
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
