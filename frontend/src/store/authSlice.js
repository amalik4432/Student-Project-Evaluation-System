import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  userId: "",
  role: "",
  userName: "",
  userID: "",
  isAuthenticated: false,
  input: {
    token: "",
    userID: "",
    user_id: "",
    loginAs: "",
    userName: "",
  },
  auth: { uid: false },
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const next = {
        token: action.payload.token,
        userId: action.payload.userId,
        role: action.payload.role,
        userName: action.payload.userName,
        userID: action.payload.userID,
        isAuthenticated: true,
      };
      Object.assign(state, next);
      state.input = {
        token: next.token,
        userID: next.userID,
        user_id: next.userId,
        loginAs: next.role,
        userName: next.userName,
      };
      state.auth.uid = true;
    },
    restore: (state, action) => {
      const user = action.payload;
      state.userId = user.id || user._id || "";
      state.role = user.role || "";
      state.userName = user.name || "";
      state.userID = user.rollNo || user.empId || user.id || "";
      state.isAuthenticated = true;
      state.input = {
        token: "",
        userID: state.userID,
        user_id: state.userId,
        loginAs: state.role,
        userName: state.userName,
      };
      state.auth.uid = true;
    },
    logout: (state) => {
      state.token = "";
      state.userId = "";
      state.role = "";
      state.userName = "";
      state.userID = "";
      state.isAuthenticated = false;
      state.input = initialState.input;
      state.auth.uid = false;
    },
  },
});

export const authActions = authSlice.actions;
export default authSlice;
