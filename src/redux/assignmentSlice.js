import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper to get token safely
const getConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

// --- EXISTING THUNKS ---

export const fetchAssignments = createAsyncThunk('assignments/getAll', async (status, thunkAPI) => {
  try {
    const url = status ? `${API_URL}/assignments?status=${status}` : `${API_URL}/assignments`;
    const response = await axios.get(url, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments');
  }
});

export const createAssignment = createAsyncThunk('assignments/create', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/assignments`, data, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create assignment');
  }
});

export const updateStatus = createAsyncThunk('assignments/updateStatus', async ({id, status}, thunkAPI) => {
  try {
    const response = await axios.put(`${API_URL}/assignments/${id}/status`, { status }, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update status');
  }
});

export const submitAssignment = createAsyncThunk('assignments/submit', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/submissions`, data, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to submit assignment');
  }
});



//  Fetch Submissions for a specific assignment
export const fetchSubmissions = createAsyncThunk('assignments/fetchSubmissions', async (assignmentId, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/submissions/${assignmentId}`, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch submissions');
  }
});

//  Mark a submission for REDO
export const markRedo = createAsyncThunk('assignments/markRedo', async (submissionId, thunkAPI) => {
  try {
    const response = await axios.put(`${API_URL}/submissions/${submissionId}/status`, { status: 'REDO_REQUESTED' }, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to mark redo');
  }
});

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: { 
    items: [], 
    submissions: [], 
    isLoading: false, 
    isError: false, 
    message: '' 
  },
  extraReducers: (builder) => {
    builder
      // Fetch Assignments
      .addCase(fetchAssignments.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update Assignment Status
      .addCase(updateStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a._id === action.payload._id);
        if(index !== -1) state.items[index] = action.payload;
      })
      // Submit
      .addCase(submitAssignment.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      
      
      
      // Fetch Submissions
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload; // Store fetched submissions
      })
      // Mark Redo
      .addCase(markRedo.fulfilled, (state, action) => {
        // Update the specific submission in the list to show 'REDO_REQUESTED'
        const index = state.submissions.findIndex(s => s._id === action.payload._id);
        if(index !== -1) state.submissions[index] = action.payload;
      });
  },
});

export default assignmentSlice.reducer;