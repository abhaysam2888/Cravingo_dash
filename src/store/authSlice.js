import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { account } from "../appwrite/appwrite.config";

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const user = await account.get();
      if (!user.labels?.includes("admin")) {
        await account.deleteSessions();
        return rejectWithValue("Not authorized");
      }
      return user;
    } catch {
      await account.deleteSessions();
      return rejectWithValue("No session");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuth: false,
    loading: true,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuth = false;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuth = true;
        state.loading = false;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null;
        state.isAuth = false;
        state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
