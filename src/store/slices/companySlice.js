import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import CompanyService from '../../services/companyService';

// Async thunks
export const fetchCurrentCompany = createAsyncThunk(
  'company/fetchCurrentCompany',
  async (_, { rejectWithValue }) => {
    try {
      return await CompanyService.getCurrentCompany();
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateCompany = createAsyncThunk(
  'company/updateCompany',
  async ({ companyId, companyData }, { rejectWithValue }) => {
    try {
      return await CompanyService.updateCompany(companyId, companyData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchTeamMembers = createAsyncThunk(
  'company/fetchTeamMembers',
  async (companyId, { rejectWithValue }) => {
    try {
      return await CompanyService.getTeamMembers(companyId);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateTeamMember = createAsyncThunk(
  'company/updateTeamMember',
  async ({ companyId, userId, userData }, { rejectWithValue }) => {
    try {
      return await CompanyService.updateTeamMember(companyId, userId, userData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const removeTeamMember = createAsyncThunk(
  'company/removeTeamMember',
  async ({ companyId, userId }, { rejectWithValue }) => {
    try {
      await CompanyService.removeTeamMember(companyId, userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchInvitations = createAsyncThunk(
  'company/fetchInvitations',
  async ({ companyId, params }, { rejectWithValue }) => {
    try {
      return await CompanyService.getInvitations(companyId, params);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createInvitation = createAsyncThunk(
  'company/createInvitation',
  async ({ companyId, invitationData }, { rejectWithValue }) => {
    try {
      return await CompanyService.createInvitation(companyId, invitationData);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const cancelInvitation = createAsyncThunk(
  'company/cancelInvitation',
  async ({ companyId, invitationId }, { rejectWithValue }) => {
    try {
      await CompanyService.cancelInvitation(companyId, invitationId);
      return invitationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const uploadCompanyLogo = createAsyncThunk(
  'company/uploadLogo',
  async ({ companyId, file }, { rejectWithValue }) => {
    try {
      return await CompanyService.uploadLogo(companyId, file);
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  company: null,
  teamMembers: [],
  invitations: [],
  isLoading: false,
  error: null,
  successMessage: null,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCurrentCompany
      .addCase(fetchCurrentCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.company = action.payload;
      })
      .addCase(fetchCurrentCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch company data' };
      })
      
      // updateCompany
      .addCase(updateCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.isLoading = false;
        state.company = action.payload;
        state.successMessage = 'Company information updated successfully';
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to update company' };
      })
      
      // fetchTeamMembers
      .addCase(fetchTeamMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teamMembers = action.payload;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch team members' };
      })
      
      // updateTeamMember
      .addCase(updateTeamMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTeamMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teamMembers = state.teamMembers.map(member => 
          member.id === action.payload.id ? action.payload : member
        );
        state.successMessage = 'Team member updated successfully';
      })
      .addCase(updateTeamMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to update team member' };
      })
      
      // removeTeamMember
      .addCase(removeTeamMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teamMembers = state.teamMembers.filter(member => member.id !== action.payload);
        state.successMessage = 'Team member removed successfully';
      })
      .addCase(removeTeamMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to remove team member' };
      })
      
      // fetchInvitations
      .addCase(fetchInvitations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitations = action.payload;
      })
      .addCase(fetchInvitations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to fetch invitations' };
      })
      
      // createInvitation
      .addCase(createInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitations = [action.payload, ...state.invitations];
        state.successMessage = 'Invitation sent successfully';
      })
      .addCase(createInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to create invitation' };
      })
      
      // cancelInvitation
      .addCase(cancelInvitation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitations = state.invitations.filter(invitation => invitation.id !== action.payload);
        state.successMessage = 'Invitation cancelled successfully';
      })
      .addCase(cancelInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to cancel invitation' };
      })
      
      // uploadCompanyLogo
      .addCase(uploadCompanyLogo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadCompanyLogo.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.company) {
          state.company.logo_url = action.payload.logo_url;
        }
        state.successMessage = 'Company logo uploaded successfully';
      })
      .addCase(uploadCompanyLogo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || { message: 'Failed to upload company logo' };
      });
  },
});

export const { clearError, clearSuccessMessage } = companySlice.actions;
export default companySlice.reducer;