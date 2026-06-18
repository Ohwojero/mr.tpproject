import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "admin" | "manager" | "salesgirl";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

function loadAuthState(): AuthState {
  try {
    const serialized = localStorage.getItem("auth");
    if (!serialized) return { user: null, isAuthenticated: false };
    return JSON.parse(serialized) as AuthState;
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

function saveAuthState(state: AuthState) {
  try {
    localStorage.setItem("auth", JSON.stringify(state));
  } catch {
    // ignore write errors
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, isAuthenticated: false } as AuthState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
  preloadedState: {
    auth: typeof window !== "undefined" ? loadAuthState() : { user: null, isAuthenticated: false },
  },
});

store.subscribe(() => {
  if (typeof window !== "undefined") {
    saveAuthState(store.getState().auth);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const { login, logout } = authSlice.actions;