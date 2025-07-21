import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for chatbot operations
// Helper function to transform API response to frontend format
const transformChatbotResponse = (chatbot) => ({
  id: chatbot._id,
  name: chatbot.name,
  description: chatbot.description,
  companyId: chatbot.company_id,
  createdBy: chatbot.created_by,
  status: chatbot.status,
  visibility: chatbot.visibility,
  documentIds: chatbot.document_ids,
  publicLinkId: chatbot.public_link_id,
  publicLinkEnabled: chatbot.public_link_enabled,
  publicLinkExpiresAt: chatbot.public_link_expires_at,
  integrationEnabled: chatbot.integration_enabled,
  integrationCode: chatbot.integration_code,
  systemPrompt: chatbot.system_prompt,
  temperature: chatbot.temperature,
  maxTokens: chatbot.max_tokens,
  modelName: chatbot.model_name,
  totalConversations: chatbot.total_conversations,
  totalMessages: chatbot.total_messages,
  lastUsedAt: chatbot.last_used_at,
  createdAt: chatbot.created_at,
  updatedAt: chatbot.updated_at,
  settings: chatbot.settings,
  branding: {
    widgetPosition: chatbot.widget_position,
    widgetColor: chatbot.widget_color,
    widgetTitle: chatbot.widget_title,
  }
});

export const fetchChatbots = createAsyncThunk(
  'chatbots/fetchChatbots',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chatbots');
      // Transform the response to match frontend expectations
      const transformedData = response.data.map(transformChatbotResponse);
      return transformedData;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchChatbot = createAsyncThunk(
  'chatbots/fetchChatbot',
  async (chatbotId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chatbots/${chatbotId}`);
      return transformChatbotResponse(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createChatbot = createAsyncThunk(
  'chatbots/createChatbot',
  async (chatbotData, { rejectWithValue }) => {
    try {
      // Transform frontend data to API format
      const apiData = {
        name: chatbotData.name,
        description: chatbotData.description,
        visibility: chatbotData.visibility,
        public_link_enabled: chatbotData.publicLinkEnabled,
        integration_enabled: chatbotData.integrationEnabled,
        system_prompt: chatbotData.systemPrompt,
        temperature: chatbotData.temperature,
        max_tokens: chatbotData.maxTokens,
        model_name: chatbotData.modelName,
        widget_position: chatbotData.branding?.widgetPosition,
        widget_color: chatbotData.branding?.widgetColor,
        widget_title: chatbotData.branding?.widgetTitle,
      };
      
      const response = await api.post('/chatbots', apiData);
      return transformChatbotResponse(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateChatbot = createAsyncThunk(
  'chatbots/updateChatbot',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      // Transform frontend data to API format
      const apiData = {
        name: data.name,
        description: data.description,
        visibility: data.visibility,
        public_link_enabled: data.publicLinkEnabled,
        integration_enabled: data.integrationEnabled,
        system_prompt: data.systemPrompt,
        temperature: data.temperature,
        max_tokens: data.maxTokens,
        model_name: data.modelName,
        widget_position: data.branding?.widgetPosition,
        widget_color: data.branding?.widgetColor,
        widget_title: data.branding?.widgetTitle,
      };
      
      const response = await api.put(`/chatbots/${id}`, apiData);
      return transformChatbotResponse(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteChatbot = createAsyncThunk(
  'chatbots/deleteChatbot',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/chatbots/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const assignDocument = createAsyncThunk(
  'chatbots/assignDocument',
  async ({ chatbotId, documentId }, { rejectWithValue, dispatch }) => {
    try {
      // Assign the document
      const response = await api.post(`/chatbots/${chatbotId}/documents/${documentId}/assign`);
      
      // After successful assignment, fetch the document details to add to the state
      try {
        const docResponse = await api.get(`/documents/${documentId}`);
        const doc = docResponse.data;
        
        // Transform document to match frontend format
        const transformedDoc = {
          id: doc._id,
          originalFilename: doc.original_filename || doc.filename,
          filename: doc.filename,
          fileType: doc.file_type,
          fileSize: doc.file_size,
          status: doc.status,
          chunkCount: doc.chunk_count || 0,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at
        };
        
        return { chatbotId, documentId, data: transformedDoc };
      } catch (docError) {
        console.error('Failed to fetch document details after assignment:', docError);
        // Return minimal data if document fetch fails
        return { chatbotId, documentId, data: { id: documentId } };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const unassignDocument = createAsyncThunk(
  'chatbots/unassignDocument',
  async ({ chatbotId, documentId }, { rejectWithValue }) => {
    try {
      // Use the correct endpoint for unassigning documents
      await api.post(`/chatbots/${chatbotId}/documents/${documentId}/unassign`);
      return { chatbotId, documentId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchChatbotDocuments = createAsyncThunk(
  'chatbots/fetchChatbotDocuments',
  async (chatbotId, { rejectWithValue }) => {
    try {
      // Use the direct endpoint to get all assigned documents for a chatbot
      const response = await api.get(`/chatbots/${chatbotId}/documents`);
      
      // Transform documents to match frontend format
      const documents = response.data.map(doc => ({
        id: doc._id,
        originalFilename: doc.original_filename || doc.filename,
        filename: doc.filename,
        fileType: doc.file_type,
        fileSize: doc.file_size,
        status: doc.status,
        chunkCount: doc.chunk_count || 0,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at
      }));
      
      return { chatbotId, documents };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const generatePublicLink = createAsyncThunk(
  'chatbots/generatePublicLink',
  async (chatbotId, { rejectWithValue }) => {
    try {
      // Use the correct endpoint for generating public links
      const response = await api.post(`/chatbots/${chatbotId}/public-link/generate`);
      return { 
        chatbotId, 
        publicLink: response.data.public_link,
        publicLinkEnabled: true
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const togglePublicLink = createAsyncThunk(
  'chatbots/togglePublicLink',
  async ({ chatbotId, enabled }, { rejectWithValue, dispatch }) => {
    try {
      if (enabled) {
        // Generate a new public link
        return dispatch(generatePublicLink(chatbotId)).unwrap();
      } else {
        // Disable the public link
        await api.post(`/chatbots/${chatbotId}/public-link/disable`);
        return { 
          chatbotId, 
          publicLinkEnabled: false 
        };
      }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchPublicChatbot = createAsyncThunk(
  'chatbots/fetchPublicChatbot',
  async (publicLinkId, { rejectWithValue }) => {
    try {
      // Use the endpoint for fetching a public chatbot
      const response = await api.get(`/chatbots/public/${publicLinkId}`);
      return transformChatbotResponse(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  chatbots: [],
  selectedChatbot: null,
  assignedDocuments: {}, // { chatbotId: [documents] }
  publicLinks: {}, // { chatbotId: publicLinkData }
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  filters: {
    search: '',
    visibility: 'all', // 'all', 'public', 'private'
  },
};

const chatbotSlice = createSlice({
  name: 'chatbots',
  initialState,
  reducers: {
    setSelectedChatbot: (state, action) => {
      state.selectedChatbot = action.payload;
    },
    clearSelectedChatbot: (state) => {
      state.selectedChatbot = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    resetChatbotState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chatbots
      .addCase(fetchChatbots.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatbots.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chatbots = action.payload;
      })
      .addCase(fetchChatbots.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch single chatbot
      .addCase(fetchChatbot.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatbot.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the chatbot in the list if it exists, otherwise add it
        const index = state.chatbots.findIndex(bot => bot.id === action.payload.id);
        if (index !== -1) {
          state.chatbots[index] = action.payload;
        } else {
          state.chatbots.push(action.payload);
        }
        state.selectedChatbot = action.payload;
      })
      .addCase(fetchChatbot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create chatbot
      .addCase(createChatbot.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createChatbot.fulfilled, (state, action) => {
        state.isCreating = false;
        state.chatbots.push(action.payload);
      })
      .addCase(createChatbot.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      
      // Update chatbot
      .addCase(updateChatbot.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateChatbot.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.chatbots.findIndex(bot => bot.id === action.payload.id);
        if (index !== -1) {
          state.chatbots[index] = action.payload;
        }
        if (state.selectedChatbot?.id === action.payload.id) {
          state.selectedChatbot = action.payload;
        }
      })
      .addCase(updateChatbot.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Delete chatbot
      .addCase(deleteChatbot.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteChatbot.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.chatbots = state.chatbots.filter(bot => bot.id !== action.payload);
        if (state.selectedChatbot?.id === action.payload) {
          state.selectedChatbot = null;
        }
        // Clean up related data
        delete state.assignedDocuments[action.payload];
        delete state.publicLinks[action.payload];
      })
      .addCase(deleteChatbot.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Assign document
      .addCase(assignDocument.fulfilled, (state, action) => {
        const { chatbotId, documentId, data } = action.payload;
        if (!state.assignedDocuments[chatbotId]) {
          state.assignedDocuments[chatbotId] = [];
        }
        // Add document if not already assigned
        if (!state.assignedDocuments[chatbotId].find(doc => 
          (doc.id === documentId) || (doc._id === documentId)
        )) {
          state.assignedDocuments[chatbotId].push(data);
        }
        
        // Also update the chatbot's document_ids if it exists in state
        const chatbot = state.chatbots.find(bot => bot.id === chatbotId);
        if (chatbot && chatbot.documentIds && !chatbot.documentIds.includes(documentId)) {
          chatbot.documentIds.push(documentId);
        }
      })
      
      // Unassign document
      .addCase(unassignDocument.fulfilled, (state, action) => {
        const { chatbotId, documentId } = action.payload;
        if (state.assignedDocuments[chatbotId]) {
          state.assignedDocuments[chatbotId] = state.assignedDocuments[chatbotId]
            .filter(doc => 
              (doc.id !== documentId) && (doc._id !== documentId)
            );
        }
        
        // Also update the chatbot's document_ids if it exists in state
        const chatbot = state.chatbots.find(bot => bot.id === chatbotId);
        if (chatbot && chatbot.documentIds) {
          chatbot.documentIds = chatbot.documentIds.filter(id => id !== documentId);
        }
      })
      
      // Fetch chatbot documents
      .addCase(fetchChatbotDocuments.fulfilled, (state, action) => {
        const { chatbotId, documents } = action.payload;
        state.assignedDocuments[chatbotId] = documents;
      })
      
      // Generate public link
      .addCase(generatePublicLink.fulfilled, (state, action) => {
        const { chatbotId, publicLink, publicLinkEnabled } = action.payload;
        
        // Store the public link
        state.publicLinks[chatbotId] = publicLink;
        
        // Update the chatbot's public link status
        const chatbot = state.chatbots.find(bot => bot.id === chatbotId);
        if (chatbot) {
          chatbot.publicLinkId = publicLink;
          chatbot.publicLinkEnabled = publicLinkEnabled;
        }
        
        // Update selected chatbot if it's the same one
        if (state.selectedChatbot?.id === chatbotId) {
          state.selectedChatbot.publicLinkId = publicLink;
          state.selectedChatbot.publicLinkEnabled = publicLinkEnabled;
        }
      })
      
      // Toggle public link
      .addCase(togglePublicLink.fulfilled, (state, action) => {
        const { chatbotId, publicLinkEnabled, publicLink } = action.payload;
        
        // Update the chatbot's public link status
        const chatbot = state.chatbots.find(bot => bot.id === chatbotId);
        if (chatbot) {
          chatbot.publicLinkEnabled = publicLinkEnabled;
          if (publicLink) {
            chatbot.publicLinkId = publicLink;
          }
        }
        
        // Update selected chatbot if it's the same one
        if (state.selectedChatbot?.id === chatbotId) {
          state.selectedChatbot.publicLinkEnabled = publicLinkEnabled;
          if (publicLink) {
            state.selectedChatbot.publicLinkId = publicLink;
          }
        }
        
        // Store the public link if provided
        if (publicLink) {
          state.publicLinks[chatbotId] = publicLink;
        }
      })
      
      // Fetch public chatbot
      .addCase(fetchPublicChatbot.fulfilled, (state, action) => {
        // Add the public chatbot to the list if it's not already there
        const exists = state.chatbots.some(bot => bot.id === action.payload.id);
        if (!exists) {
          state.chatbots.push(action.payload);
        }
      });
  },
});

export const {
  setSelectedChatbot,
  clearSelectedChatbot,
  setFilters,
  clearError,
  resetChatbotState,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;