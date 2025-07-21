# Public Chatbot API Documentation

## Overview

This documentation covers how to access and integrate public chatbots without authentication. Public chatbots can be embedded on websites, accessed via direct links, or integrated using JavaScript widgets.

**Base URL:** `http://localhost:8000/api/v1`

---

## Public Access Methods

### 1. Share Token Access
Direct access to chatbot using a share token for anonymous users.

### 2. Public Link Access  
Access via generated public link with unique token.

### 3. Widget Embedding
JavaScript widget that can be embedded on any website.

---

## Public Chat API Endpoints

### GET /public/chat/{share_token}
Initialize a public chat session with anonymous user.

**Parameters:**
- `share_token` (path): The chatbot's share token

**Response (200):**
```json
{
  "chatbot_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "chatbot_name": "Customer Support Bot",
  "session_id": "anonymous_session_123",
  "thread_id": "thread_456",
  "branding": {
    "primary_color": "#3B82F6",
    "secondary_color": "#1F2937",
    "logo_url": "https://company.com/logo.png",
    "widget_title": "Chat with us"
  }
}
```

**Error Responses:**
- `404`: Chat not found or not public

**Example Usage:**
```javascript
fetch('/api/v1/public/chat/abc123def456')
  .then(response => response.json())
  .then(data => {
    console.log('Chat initialized:', data);
    // Store session_id and thread_id for subsequent messages
  });
```

---

### POST /public/chat/{share_token}/message
Send a message in public chat session.

**Parameters:**
- `share_token` (path): The chatbot's share token

**Request Body:**
```json
{
  "content": "Hello, I need help with my order",
  "session_id": "anonymous_session_123"
}
```

**Response (200):**
```json
{
  "user_message": {
    "id": "msg_user_123",
    "content": "Hello, I need help with my order",
    "is_user_message": true,
    "metadata": {
      "user_type": "anonymous"
    },
    "created_at": "2024-01-01T10:00:00Z"
  },
  "ai_message": {
    "id": "msg_ai_456",
    "content": "I'd be happy to help you with your order! Could you please provide your order number?",
    "is_user_message": false,
    "metadata": {
      "model": "gemma-3-27b-it",
      "temperature": 0.7
    },
    "created_at": "2024-01-01T10:00:02Z"
  }
}
```

**Error Responses:**
- `404`: Chat not found or not public
- `500`: Error processing message

**Example Usage:**
```javascript
const sendMessage = async (shareToken, message, sessionId) => {
  const response = await fetch(`/api/v1/public/chat/${shareToken}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: message,
      session_id: sessionId
    })
  });
  
  return response.json();
};
```

---

### GET /public/chat/{share_token}/messages/{session_id}
Retrieve message history for a public chat session.

**Parameters:**
- `share_token` (path): The chatbot's share token
- `session_id` (path): The anonymous session ID

**Response (200):**
```json
[
  {
    "id": "msg_1",
    "content": "Hello, I need help",
    "is_user_message": true,
    "metadata": {
      "user_type": "anonymous"
    },
    "created_at": "2024-01-01T10:00:00Z"
  },
  {
    "id": "msg_2",
    "content": "I'd be happy to help you!",
    "is_user_message": false,
    "metadata": {
      "model": "gemma-3-27b-it"
    },
    "created_at": "2024-01-01T10:00:02Z"
  }
]
```

**Example Usage:**
```javascript
const getMessageHistory = async (shareToken, sessionId) => {
  const response = await fetch(`/api/v1/public/chat/${shareToken}/messages/${sessionId}`);
  return response.json();
};
```

---

## Widget Integration API

### GET /public/widget/{chatbot_id}
Get widget configuration for embedding.

**Parameters:**
- `chatbot_id` (path): The chatbot ID

**Response (200):**
```json
{
  "chatbot_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "Customer Support",
  "share_token": "abc123def456",
  "branding": {
    "primary_color": "#3B82F6",
    "secondary_color": "#1F2937",
    "logo_url": "https://company.com/logo.png"
  },
  "settings": {
    "widget_position": "bottom-right",
    "widget_title": "Chat with us",
    "widget_color": "#3B82F6"
  }
}
```

---

### GET /public/widget/{chatbot_id}/embed.js
Get JavaScript embed code for the chatbot widget.

**Parameters:**
- `chatbot_id` (path): The chatbot ID

**Response (200):**
```javascript
// Returns JavaScript code for embedding the widget
(function() {
  // Widget initialization code
  var chatWidget = {
    init: function() {
      // Create widget UI
      this.createWidget();
      this.bindEvents();
    },
    
    createWidget: function() {
      // Widget HTML structure
    },
    
    sendMessage: function(message) {
      // Send message to API
    }
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      chatWidget.init();
    });
  } else {
    chatWidget.init();
  }
})();
```

---

## Integration Examples

### 1. Simple HTML Integration

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Website</h1>
    
    <!-- Chatbot Widget Integration -->
    <script>
        (function() {
            var script = document.createElement('script');
            script.src = 'http://localhost:8000/api/v1/public/widget/YOUR_CHATBOT_ID/embed.js';
            script.async = true;
            document.head.appendChild(script);
        })();
    </script>
</body>
</html>
```

### 2. React Component Integration

```jsx
import React, { useState, useEffect } from 'react';

const PublicChatbot = ({ shareToken }) => {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [threadId, setThreadId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize chat session
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const response = await fetch(`/api/v1/public/chat/${shareToken}`);
        const data = await response.json();
        
        setSessionId(data.session_id);
        setThreadId(data.thread_id);
        
        // Load existing messages
        const messagesResponse = await fetch(
          `/api/v1/public/chat/${shareToken}/messages/${data.session_id}`
        );
        const existingMessages = await messagesResponse.json();
        setMessages(existingMessages);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      }
    };

    if (shareToken) {
      initializeChat();
    }
  }, [shareToken]);

  const sendMessage = async (content) => {
    if (!sessionId || loading) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/public/chat/${shareToken}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          session_id: sessionId
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, data.user_message, data.ai_message]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="messages">
        {messages.map(msg => (
          <div key={msg.id} className={msg.is_user_message ? 'user-message' : 'ai-message'}>
            {msg.content}
          </div>
        ))}
      </div>
      
      <ChatInput onSend={sendMessage} disabled={loading} />
    </div>
  );
};

export default PublicChatbot;
```

### 3. Vanilla JavaScript Integration

```javascript
class PublicChatbot {
  constructor(shareToken, containerId) {
    this.shareToken = shareToken;
    this.container = document.getElementById(containerId);
    this.sessionId = null;
    this.threadId = null;
    this.messages = [];
    
    this.init();
  }

  async init() {
    try {
      // Initialize chat session
      const response = await fetch(`/api/v1/public/chat/${this.shareToken}`);
      const data = await response.json();
      
      this.sessionId = data.session_id;
      this.threadId = data.thread_id;
      
      // Create UI
      this.createUI(data.branding);
      
      // Load existing messages
      await this.loadMessages();
    } catch (error) {
      console.error('Failed to initialize chatbot:', error);
    }
  }

  createUI(branding) {
    this.container.innerHTML = `
      <div class="chatbot-widget" style="--primary-color: ${branding.primary_color}">
        <div class="chatbot-header">
          <h3>${branding.widget_title || 'Chat'}</h3>
        </div>
        <div class="chatbot-messages" id="messages"></div>
        <div class="chatbot-input">
          <input type="text" id="messageInput" placeholder="Type your message...">
          <button id="sendButton">Send</button>
        </div>
      </div>
    `;

    // Bind events
    document.getElementById('sendButton').addEventListener('click', () => {
      this.sendMessage();
    });

    document.getElementById('messageInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }

  async loadMessages() {
    try {
      const response = await fetch(
        `/api/v1/public/chat/${this.shareToken}/messages/${this.sessionId}`
      );
      const messages = await response.json();
      
      this.messages = messages;
      this.renderMessages();
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  async sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;

    try {
      const response = await fetch(`/api/v1/public/chat/${this.shareToken}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: message,
          session_id: this.sessionId
        })
      });

      const data = await response.json();
      
      this.messages.push(data.user_message, data.ai_message);
      this.renderMessages();
      
      input.value = '';
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  renderMessages() {
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';

    this.messages.forEach(msg => {
      const messageDiv = document.createElement('div');
      messageDiv.className = msg.is_user_message ? 'user-message' : 'ai-message';
      messageDiv.textContent = msg.content;
      messagesContainer.appendChild(messageDiv);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
}

// Usage
const chatbot = new PublicChatbot('your_share_token_here', 'chatbot-container');
```

### 4. WordPress Plugin Integration

```php
<?php
// WordPress plugin integration
function add_chatbot_widget() {
    $chatbot_id = get_option('chatbot_id');
    if ($chatbot_id) {
        echo '<script>
            (function() {
                var script = document.createElement("script");
                script.src = "http://localhost:8000/api/v1/public/widget/' . $chatbot_id . '/embed.js";
                script.async = true;
                document.head.appendChild(script);
            })();
        </script>';
    }
}
add_action('wp_footer', 'add_chatbot_widget');
?>
```

---

## Widget Customization

### CSS Styling
The widget can be customized using CSS variables:

```css
.chatbot-widget {
  --primary-color: #3B82F6;
  --secondary-color: #1F2937;
  --text-color: #374151;
  --background-color: #FFFFFF;
  --border-radius: 8px;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### Position Options
- `bottom-right` (default)
- `bottom-left`
- `top-right`
- `top-left`
- `center`

### Configuration Options
```javascript
window.chatbotConfig = {
  position: 'bottom-right',
  theme: 'light', // 'light' or 'dark'
  primaryColor: '#3B82F6',
  title: 'Chat with us',
  placeholder: 'Type your message...',
  welcomeMessage: 'Hello! How can I help you today?'
};
```

---

## Security Considerations

### Rate Limiting
- Public endpoints have rate limiting to prevent abuse
- 60 requests per minute per IP address
- 10 messages per minute per session

### Content Filtering
- Messages are filtered for inappropriate content
- Spam detection is enabled
- Long messages are truncated

### Session Management
- Anonymous sessions expire after 24 hours of inactivity
- Session IDs are cryptographically secure
- No personal data is stored for anonymous users

---

## Error Handling

### Common Error Responses

**404 - Chatbot Not Found:**
```json
{
  "detail": "Chat not found or not public"
}
```

**429 - Rate Limited:**
```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

**500 - Processing Error:**
```json
{
  "detail": "Error processing message: Unable to generate response"
}
```

### Error Handling in JavaScript

```javascript
const handleApiError = (error, response) => {
  if (response.status === 404) {
    console.error('Chatbot not found or not public');
    // Show user-friendly message
  } else if (response.status === 429) {
    console.error('Rate limit exceeded');
    // Show rate limit message
  } else {
    console.error('Unexpected error:', error);
    // Show generic error message
  }
};
```

---

## Testing

### Test Share Token
For development and testing, you can use these endpoints:

```bash
# Initialize test chat
curl -X GET "http://localhost:8000/api/v1/public/chat/test_token_123"

# Send test message
curl -X POST "http://localhost:8000/api/v1/public/chat/test_token_123/message" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello", "session_id": "test_session"}'
```

### Widget Testing
```html
<!-- Test widget integration -->
<div id="chatbot-test"></div>
<script src="http://localhost:8000/api/v1/public/widget/test_chatbot_id/embed.js"></script>
```

---

This documentation provides everything needed to integrate public chatbots into websites and applications without requiring user authentication.