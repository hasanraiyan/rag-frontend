import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for chat operations
export const createChatThread = createAsyncThunk(
  'chat/createChatThread',
  async (chatbotId, { rejectWithValue }) => {
    try {
      // Send the required title field in the request body
      const response = await api.post(`/chat/${chatbotId}/threads`, {
        title: "New Chat Thread"
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchChatThreads = createAsyncThunk(
  'chat/fetchChatThreads',
  async (chatbotId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/${chatbotId}/threads`);
      return { chatbotId, threads: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  'chat/sendChatMessage',
  async ({ chatbotId, threadId, content, metadata = { source: 'web' } }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/chat/${chatbotId}/threads/${threadId}/message`, {
        content,
        metadata
      });
      
      // Handle the API response format
      let userMessage, aiMessage;
      
      if (response.data.user_message && response.data.ai_message) {
        // Format from the example
        userMessage = response.data.user_message;
        aiMessage = response.data.ai_message;
      } else if (Array.isArray(response.data) && response.data.length >= 2) {
        // Alternative format where it might return an array of messages
        userMessage = response.data[0];
        aiMessage = response.data[1];
      } else {
        // Fallback format
        userMessage = {
          id: `user-${Date.now()}`,
          content: content,
          is_user_message: true,
          metadata: metadata,
          created_at: new Date().toISOString()
        };
        
        aiMessage = {
          id: `ai-${Date.now()}`,
          content: response.data.content || response.data.message || 'No response',
          is_user_message: false,
          metadata: response.data.metadata || {},
          created_at: new Date().toISOString()
        };
      }
      
      return {
        threadId,
        userMessage,
        aiMessage
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async ({ chatbotId, threadId }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/${chatbotId}/threads/${threadId}/messages`);
      
      // Handle the case where the API might return an array of messages or an object with a messages property
      const messagesData = Array.isArray(response.data) ? response.data : 
                          (response.data.messages || []);
      
      return { threadId, messages: messagesData };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteChatThread = createAsyncThunk(
  'chat/deleteChatThread',
  async ({ chatbotId, threadId }, { rejectWithValue }) => {
    try {
      await api.delete(`/chat/${chatbotId}/threads/${threadId}`);
      return { threadId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const renameChatThread = createAsyncThunk(
  'chat/renameChatThread',
  async ({ chatbotId, threadId, title }, { rejectWithValue }) => {
    try {
      await api.put(`/chat/${chatbotId}/threads/${threadId}/rename`, { title });
      return { threadId, title };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  threads: {}, // { chatbotId: [threads] }
  messages: {}, // { threadId: [messages] }
  activeThread: null,
  isLoading: false,
  isSending: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveThread: (state, action) => {
      state.activeThread = action.payload;
    },
    clearActiveThread: (state) => {
      state.activeThread = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetChatState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create chat thread
      .addCase(createChatThread.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChatThread.fulfilled, (state, action) => {
        state.isLoading = false;
        const chatbotId = action.meta.arg;
        
        // Initialize threads array for this chatbot if it doesn't exist
        if (!state.threads[chatbotId]) {
          state.threads[chatbotId] = [];
        }
        
        // Add the new thread
        state.threads[chatbotId].unshift(action.payload);
        
        // Set as active thread
        state.activeThread = action.payload;
        
        // Initialize messages array for this thread
        state.messages[action.payload.thread_id] = [];
      })
      .addCase(createChatThread.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch chat threads
      .addCase(fetchChatThreads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatThreads.fulfilled, (state, action) => {
        state.isLoading = false;
        const { chatbotId, threads } = action.payload;
        state.threads[chatbotId] = threads;
      })
      .addCase(fetchChatThreads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Send chat message
      .addCase(sendChatMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isSending = false;
        const { threadId, userMessage, aiMessage } = action.payload;
        
        // Initialize messages array for this thread if it doesn't exist
        if (!state.messages[threadId]) {
          state.messages[threadId] = [];
        }
        
        // Add the user message and AI response
        state.messages[threadId].push(userMessage);
        state.messages[threadId].push(aiMessage);
        
        // Update the thread's last_message_at timestamp
        const chatbotId = action.meta.arg.chatbotId;
        if (state.threads[chatbotId]) {
          const threadIndex = state.threads[chatbotId].findIndex(t => t.thread_id === threadId);
          if (threadIndex !== -1) {
            state.threads[chatbotId][threadIndex].last_message_at = aiMessage.created_at;
          }
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      })
      
      // Fetch chat messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { threadId, messages } = action.payload;
        state.messages[threadId] = messages;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete chat thread
      .addCase(deleteChatThread.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteChatThread.fulfilled, (state, action) => {
        state.isLoading = false;
        const { threadId } = action.payload;
        const chatbotId = action.meta.arg.chatbotId;
        
        // Remove the thread from the threads list
        if (state.threads[chatbotId]) {
          state.threads[chatbotId] = state.threads[chatbotId].filter(
            thread => thread.thread_id !== threadId
          );
        }
        
        // Remove the messages for this thread
        delete state.messages[threadId];
        
        // Clear active thread if it was the deleted one
        if (state.activeThread && state.activeThread.thread_id === threadId) {
          state.activeThread = null;
        }
      })
      .addCase(deleteChatThread.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Rename chat thread
      .addCase(renameChatThread.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(renameChatThread.fulfilled, (state, action) => {
        state.isLoading = false;
        const { threadId, title } = action.payload;
        const chatbotId = action.meta.arg.chatbotId;
        
        // Update the thread title in the threads list
        if (state.threads[chatbotId]) {
          const threadIndex = state.threads[chatbotId].findIndex(
            thread => thread.thread_id === threadId
          );
          
          if (threadIndex !== -1) {
            state.threads[chatbotId][threadIndex].thread_title = title;
          }
        }
        
        // Update active thread if it was the renamed one
        if (state.activeThread && state.activeThread.thread_id === threadId) {
          state.activeThread.thread_title = title;
        }
      })
      .addCase(renameChatThread.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setActiveThread,
  clearActiveThread,
  clearError,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;