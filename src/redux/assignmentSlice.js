import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.user?.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

// --- THUNKS ---

export const fetchAssignments = createAsyncThunk('assignments/getAll', async (status, thunkAPI) => {
  try {
    const url = status ? `${API_URL}/assignments?status=${status}` : `${API_URL}/assignments`;
    const response = await axios.get(url, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const createAssignment = createAsyncThunk('assignments/create', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/assignments`, data, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const updateStatus = createAsyncThunk('assignments/updateStatus', async ({id, status}, thunkAPI) => {
  try {
    const response = await axios.put(`${API_URL}/assignments/${id}/status`, { status }, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const editAssignment = createAsyncThunk('assignments/edit', async ({id, data}, thunkAPI) => {
  try {
    const response = await axios.put(`${API_URL}/assignments/${id}`, data, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const deleteAssignment = createAsyncThunk('assignments/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/assignments/${id}`, getConfig(thunkAPI));
    return id; 
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const submitAssignment = createAsyncThunk('assignments/submit', async (data, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/submissions`, data, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

export const fetchSubmissions = createAsyncThunk('assignments/fetchSubmissions', async (assignmentId, thunkAPI) => {
  try {
    const response = await axios.get(`${API_URL}/submissions/${assignmentId}`, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

// NEW: Mark Reviewed
export const markReviewed = createAsyncThunk('assignments/markReviewed', async (submissionId, thunkAPI) => {
  try {
    const response = await axios.put(`${API_URL}/submissions/${submissionId}/review`, {}, getConfig(thunkAPI));
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message);
  }
});

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: { items: [], submissions: [], isLoading: false, isError: false, message: '' },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a._id === action.payload._id);
        if(index !== -1) state.items[index] = action.payload;
      })
      .addCase(editAssignment.fulfilled, (state, action) => {
        const index = state.items.findIndex(a => a._id === action.payload._id);
        if(index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a._id !== action.payload);
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.submissions = action.payload;
      })
      .addCase(markReviewed.fulfilled, (state, action) => {
        const index = state.submissions.findIndex(s => s._id === action.payload._id);
        if(index !== -1) state.submissions[index] = action.payload;
      });
  },
});

export default assignmentSlice.reducer;