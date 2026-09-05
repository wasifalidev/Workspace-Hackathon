import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthUser {
  id: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  isPlatformAdmin: boolean
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isInitialized: boolean
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isInitialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
      state.isLoading = false
      state.isInitialized = true
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    updateProfile(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
    clearAuth(state) {
      state.user = null
      state.isLoading = false
    },
  },
})

export const { setUser, setLoading, updateProfile, clearAuth } = authSlice.actions
export default authSlice.reducer
