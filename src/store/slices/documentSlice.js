import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks for document operations
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async ({ file, metadata }, { rejectWithValue, dispatch }) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Add metadata if provided
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }
      
      // Track upload progress
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          dispatch(updateUploadProgress({ documentId: file.name, progress: percentCompleted }));
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      
      const response = await api.post('/documents/upload', formData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      await api.delete(`/documents/${documentId}`);
      return documentId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const downloadDocument = createAsyncThunk(
  'documents/downloadDocument',
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/download/${documentId}`, {
        responseType: 'blob',
      });
      
      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use documentId
      const contentDisposition = response.headers['content-disposition'];
      let filename = documentId;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return documentId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Fetch a single document by ID
export const fetchDocumentById = createAsyncThunk(
  'documents/fetchDocumentById',
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchDocumentStatus = createAsyncThunk(
  'documents/fetchDocumentStatus',
  async (documentId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/${documentId}/status`);
      return { documentId, status: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchProcessingStats = createAsyncThunk(
  'documents/fetchProcessingStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/documents/processing-stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  documents: [],
  selectedDocument: null,
  uploadProgress: {}, // { documentId: progressPercentage }
  processingStatus: {}, // { documentId: status }
  processingStats: {}, // { documentId: { ...status } }
  processingSummary: null, // summary from /documents/processing-stats
  filters: {
    search: '',
    status: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  isLoading: false,
  error: null,
};

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setSelectedDocument: (state, action) => {
      state.selectedDocument = action.payload;
    },
    updateUploadProgress: (state, action) => {
      const { documentId, progress } = action.payload;
      state.uploadProgress[documentId] = progress;
    },
    updateProcessingStatus: (state, action) => {
      const { documentId, status } = action.payload;
      state.processingStatus[documentId] = status;
    },
    updateProcessingStats: (state, action) => {
      // action.payload: { [documentId]: { ...status } }
      state.processingStats = { ...state.processingStats, ...action.payload };
    },
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearUploadProgress: (state, action) => {
      const { documentId } = action.payload;
      delete state.uploadProgress[documentId];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchDocuments
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch documents' };
      })
      
      // uploadDocument
      .addCase(uploadDocument.pending, (state) => {
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        // Add the new document to the list
        state.documents.push(action.payload);
        // Clear upload progress for this document
        const documentId = action.payload.id || action.meta.arg.file.name;
        delete state.uploadProgress[documentId];
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.error = action.payload || { message: 'Failed to upload document' };
        // Clear upload progress for this document
        const documentId = action.meta.arg.file.name;
        delete state.uploadProgress[documentId];
      })
      
      // deleteDocument
      .addCase(deleteDocument.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        // Remove the deleted document from the list
        state.documents = state.documents.filter(doc => doc.id !== action.payload && doc._id !== action.payload);
        // Clear selected document if it was deleted
        if (state.selectedDocument && (state.selectedDocument.id === action.payload || state.selectedDocument._id === action.payload)) {
          state.selectedDocument = null;
        }
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload || { message: 'Failed to delete document' };
      })
      
      // downloadDocument cases don't modify state, but we'll handle errors
      .addCase(downloadDocument.rejected, (state, action) => {
        state.error = action.payload || { message: 'Failed to download document' };
      })

      // fetchDocumentById
      .addCase(fetchDocumentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedDocument = action.payload;
      })
      .addCase(fetchDocumentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch document details' };
      })

      // fetchProcessingStats
      .addCase(fetchProcessingStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProcessingStats.fulfilled, (state, action) => {
        // action.payload: summary object
        state.processingSummary = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchProcessingStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch processing stats' };
      })

      // fetchDocumentStatus
      .addCase(fetchDocumentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocumentStatus.fulfilled, (state, action) => {
        // action.payload: { documentId, status }
        state.processingStats = {
          ...state.processingStats,
          [action.payload.documentId]: action.payload.status,
        };
        state.isLoading = false;
      })
      .addCase(fetchDocumentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch document status' };
      });
  },
});

export const {
  setSelectedDocument,
  updateUploadProgress,
  updateProcessingStatus,
  updateProcessingStats,
  updateFilters,
  resetFilters,
  clearUploadProgress,
} = documentSlice.actions;

export default documentSlice.reducer;