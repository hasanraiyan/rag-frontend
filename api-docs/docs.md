# AI Chatbot Platform API Documentation

## Overview

This document provides comprehensive API documentation for the AI Chatbot Platform frontend team. The API is built with FastAPI and follows RESTful principles with JWT authentication.

**Base URL:** `http://localhost:8000/api/v1`

## Authentication

The API uses JWT (JSON Web Token) authentication with access and refresh tokens.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Token Refresh
Access tokens expire after a certain period. Use the refresh token to get new access tokens.

---

## Authentication Endpoints

### POST /auth/register
Register a new user and create a company.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "company_name": "Acme Corp",
  "company_slug": "acme-corp"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "is_verified": false,
    "company_id": "company_id",
    "role": "admin",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00Z",
    "last_login": null
  },
  "tokens": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ...",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

### POST /auth/register-simple
Register a user without creating a company.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "user": { /* User object */ },
  "tokens": { /* Token object */ }
}
```

### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### GET /auth/me
Get current user information.

**Response (200):**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_verified": true,
  "company_id": "company_id",
  "role": "admin",
  "avatar_url": null,
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-01T12:00:00Z"
}
```

### POST /auth/change-password
Change user password.

**Request Body:**
```json
{
  "current_password": "OldPass123",
  "new_password": "NewPass123"
}
```

### POST /auth/forgot-password
Request password reset OTP.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Reset password using OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "NewPass123"
}
```

### POST /auth/verify-email
Verify email using OTP.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### POST /auth/resend-verification
Resend email verification OTP.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

## Company Management

### GET /companies/me
Get current user's company with statistics.

**Response (200):**
```json
{
  "id": "company_id",
  "name": "Acme Corp",
  "slug": "acme-corp",
  "description": "Company description",
  "domain": "acme.com",
  "contact_email": "contact@acme.com",
  "logo_url": null,
  "primary_color": "#3B82F6",
  "secondary_color": "#1F2937",
  "subscription_plan": "free",
  "max_users": 5,
  "max_documents": 10,
  "max_storage_gb": 1,
  "is_active": true,
  "is_verified": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "stats": {
    "user_count": 1,
    "document_count": 5,
    "chatbot_count": 2,
    "session_count": 10,
    "storage_used_mb": 25.5
  }
}
```

### PUT /companies/{company_id}
Update company information (Admin only).

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "description": "Updated description",
  "contact_email": "new@email.com",
  "website": "https://company.com",
  "logo_url": "https://logo.url",
  "primary_color": "#FF0000",
  "secondary_color": "#00FF00"
}
```

### GET /companies/{company_id}/members
Get team members (Admin only).

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Number of records to return (default: 100)

**Response (200):**
```json
[
  {
    "id": "user_id",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "admin",
    "is_active": true,
    "avatar_url": null,
    "last_login": "2024-01-01T12:00:00Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### PUT /companies/{company_id}/members/{user_id}
Update team member (Admin only).

**Request Body:**
```json
{
  "role": "member",
  "is_active": false
}
```

### DELETE /companies/{company_id}/members/{user_id}
Remove team member (Admin only).

### POST /companies/{company_id}/invitations
Create team invitation (Admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "role": "member",
  "message": "Welcome to our team!"
}
```

### GET /companies/{company_id}/invitations
Get company invitations (Admin only).

**Query Parameters:**
- `status_filter`: Filter by invitation status
- `skip`: Number of records to skip
- `limit`: Number of records to return

### POST /companies/invitations/{token}/accept
Accept team invitation.

**Request Body:**
```json
{
  "token": "invitation_token",
  "full_name": "New User",
  "password": "SecurePass123"
}
```

---

## Chatbot Management

### GET /chatbots/
Get all chatbots for the current user's company.

**Response (200):**
```json
[
  {
    "id": "chatbot_id",
    "name": "Customer Support Bot",
    "description": "Handles customer inquiries",
    "company_id": "company_id",
    "created_by": "user_id",
    "model_name": "gpt-3.5-turbo",
    "system_prompt": "You are a helpful assistant...",
    "temperature": 0.7,
    "max_tokens": 1000,
    "visibility": "private",
    "is_public": false,
    "public_link_enabled": false,
    "public_link_id": null,
    "share_token": "abc123",
    "integration_enabled": false,
    "widget_color": "#3B82F6",
    "widget_position": "bottom-right",
    "widget_title": "Chat with us",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /chatbots/
Create a new chatbot.

**Request Body:**
```json
{
  "name": "Customer Support Bot",
  "description": "Handles customer inquiries"
}
```

### GET /chatbots/{chatbot_id}
Get specific chatbot details.

### PUT /chatbots/{chatbot_id}
Update chatbot.

**Request Body:**
```json
{
  "name": "Updated Bot Name",
  "description": "Updated description",
  "model_name": "gpt-4",
  "system_prompt": "Updated system prompt",
  "temperature": 0.8,
  "max_tokens": 2000,
  "visibility": "public",
  "widget_color": "#FF0000",
  "widget_position": "bottom-left",
  "widget_title": "Help Center"
}
```

### DELETE /chatbots/{chatbot_id}
Delete chatbot.

### GET /chatbots/{chatbot_id}/documents
Get documents assigned to chatbot.

### POST /chatbots/{chatbot_id}/documents/{document_id}/assign
Assign document to chatbot (Admin only).

### POST /chatbots/{chatbot_id}/documents/{document_id}/unassign
Unassign document from chatbot (Admin only).

### POST /chatbots/{chatbot_id}/public-link/generate
Generate public link for chatbot (Admin only).

**Response (200):**
```json
{
  "public_link": "unique_token_123"
}
```

### POST /chatbots/{chatbot_id}/public-link/disable
Disable public link (Admin only).

### GET /chatbots/public/{public_link_id}
Get public chatbot by link ID (No auth required).

---

## Chat System

### GET /chat/{chatbot_id}/threads
Get all chat threads for user and chatbot.

**Response (200):**
```json
[
  {
    "thread_id": "thread_123",
    "thread_title": "Customer Inquiry",
    "user_type": "authenticated",
    "is_active": true,
    "last_message_at": "2024-01-01T12:00:00Z",
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### POST /chat/{chatbot_id}/threads
Create new chat thread.

**Request Body:**
```json
{
  "title": "New Conversation"
}
```

### GET /chat/{chatbot_id}/threads/{thread_id}/messages
Get messages for a thread.

**Response (200):**
```json
[
  {
    "id": "message_id",
    "content": "Hello, how can I help?",
    "is_user_message": false,
    "metadata": {},
    "created_at": "2024-01-01T10:00:00Z"
  }
]
```

### POST /chat/{chatbot_id}/threads/{thread_id}/message
Send message to thread.

**Request Body:**
```json
{
  "content": "I need help with my order",
  "metadata": {}
}
```

**Response (200):**
```json
{
  "user_message": {
    "id": "msg_1",
    "content": "I need help with my order",
    "is_user_message": true,
    "metadata": {},
    "created_at": "2024-01-01T10:00:00Z"
  },
  "ai_message": {
    "id": "msg_2",
    "content": "I'd be happy to help with your order...",
    "is_user_message": false,
    "metadata": {},
    "created_at": "2024-01-01T10:00:01Z"
  }
}
```

### PUT /chat/{chatbot_id}/threads/{thread_id}/rename
Rename chat thread.

**Request Body:**
```json
{
  "title": "Order Support"
}
```

### DELETE /chat/{chatbot_id}/threads/{thread_id}
Delete chat thread.

### POST /chat/{chatbot_id}/search
Search chatbot's knowledge base.

**Request Body:**
```json
{
  "query": "How to return an item?",
  "top_k": 5
}
```

**Response (200):**
```json
{
  "results": [
    {
      "score": 0.95,
      "content": "To return an item, please follow these steps...",
      "document_id": "doc_123",
      "chunk_index": 5,
      "metadata": {
        "document_name": "return_policy.pdf",
        "document_type": "pdf"
      }
    }
  ]
}
```

### WebSocket /chat/ws/{chatbot_id}
Real-time chat WebSocket connection.

**Send Message:**
```json
{
  "type": "message",
  "thread_id": "thread_123",
  "content": "Hello",
  "user_id": "user_123"
}
```

**Receive Response:**
```json
{
  "type": "message",
  "thread_id": "thread_123",
  "user_message": { /* Message object */ },
  "ai_message": { /* Message object */ }
}
```

---

## Public Chat API (No Authentication Required)

### GET /public/chat/{share_token}
Initialize public chat session.

**Response (200):**
```json
{
  "chatbot_id": "bot_123",
  "chatbot_name": "Support Bot",
  "session_id": "session_456",
  "thread_id": "thread_789",
  "branding": {
    "primary_color": "#3B82F6",
    "logo_url": "https://logo.url"
  }
}
```

### POST /public/chat/{share_token}/message
Send message in public chat.

**Request Body:**
```json
{
  "content": "Hello, I need help",
  "session_id": "session_456"
}
```

### GET /public/chat/{share_token}/messages/{session_id}
Get messages for public chat session.

### GET /public/widget/{chatbot_id}
Get widget configuration for embedding.

### GET /public/widget/{chatbot_id}/embed.js
Get JavaScript embed code for widget.

---

## Document Management

### GET /documents/
Get all documents for company.

**Response (200):**
```json
[
  {
    "id": "doc_123",
    "filename": "policy.pdf",
    "original_filename": "company_policy.pdf",
    "file_type": "pdf",
    "file_size": 1024000,
    "mime_type": "application/pdf",
    "title": "Company Policy",
    "description": "Employee handbook",
    "status": "completed",
    "chunk_count": 25,
    "vector_ids": ["vec_1", "vec_2"],
    "processing_error": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /documents/upload
Upload and process document.

**Request (multipart/form-data):**
- `file`: Document file (PDF, DOCX, TXT)
- `title`: Document title (optional)
- `description`: Document description (optional)

**Response (200):**
```json
{
  "id": "doc_123",
  "filename": "processed_file.pdf",
  "status": "completed",
  /* ... other document fields */
}
```

### GET /documents/{document_id}
Get document details.

### PUT /documents/{document_id}
Update document by uploading new file.

### DELETE /documents/{document_id}
Delete document and cleanup vectors.

### GET /documents/{document_id}/status
Get detailed document processing status.

**Response (200):**
```json
{
  "document_id": "doc_123",
  "filename": "policy.pdf",
  "status": "completed",
  "processing_error": null,
  "processing_started_at": "2024-01-01T10:00:00Z",
  "processing_completed_at": "2024-01-01T10:05:00Z",
  "chunk_count": 25,
  "vector_count": 25,
  "assigned_bots": 2,
  "file_size_mb": 1.5,
  "can_be_processed": true,
  "is_processed": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T10:05:00Z"
}
```

### POST /documents/{document_id}/reprocess
Reprocess document.

### GET /documents/processing-stats
Get processing statistics for company.

**Response (200):**
```json
{
  "status_counts": {
    "pending": 2,
    "processing": 1,
    "completed": 15,
    "failed": 0
  },
  "total_documents": 18,
  "total_storage_mb": 125.5,
  "total_chunks": 450,
  "total_vectors": 450
}
```

### GET /documents/download/{document_id}
Download document file.

---

## Error Responses

### Common Error Codes

**400 Bad Request:**
```json
{
  "detail": "Validation error message"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**
```json
{
  "detail": "Not enough permissions"
}
```

**404 Not Found:**
```json
{
  "detail": "Resource not found"
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error"
}
```

---

## Data Models

### User Roles
- `admin`: Full access to company resources
- `member`: Limited access to assigned resources

### Document Status
- `pending`: Awaiting processing
- `processing`: Currently being processed
- `completed`: Successfully processed
- `failed`: Processing failed

### Chatbot Visibility
- `private`: Only company members can access
- `public`: Publicly accessible via share token

### User Types (Chat)
- `authenticated`: Logged-in users
- `anonymous`: Public chat users

---

## Rate Limits

- Authentication endpoints: 5 requests per minute
- File upload: 10 requests per minute
- Chat messages: 60 requests per minute
- General API: 100 requests per minute

---

## File Upload Limits

- Maximum file size: 10MB
- Supported formats: PDF, DOCX, TXT
- Maximum files per company: Based on subscription plan

---

## WebSocket Events

### Chat WebSocket Events

**Client to Server:**
```json
{
  "type": "message",
  "thread_id": "thread_123",
  "content": "Hello",
  "metadata": {}
}
```

**Server to Client:**
```json
{
  "type": "typing",
  "thread_id": "thread_123"
}
```

```json
{
  "type": "message",
  "thread_id": "thread_123",
  "user_message": { /* Message object */ },
  "ai_message": { /* Message object */ }
}
```

```json
{
  "type": "error",
  "error": "Error message"
}
```

---

## Integration Examples

### JavaScript Widget Integration

```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'http://localhost:8000/api/v1/public/widget/CHATBOT_ID/embed.js';
    document.head.appendChild(script);
  })();
</script>
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useChat = (chatbotId, threadId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (content) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/chat/${chatbotId}/threads/${threadId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ content })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, data.user_message, data.ai_message]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, sendMessage, loading };
};
```