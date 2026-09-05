import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface SettingsState {
  theme: 'dark' | 'light' | 'system'
  defaultView: 'board' | 'list' | 'calendar'
  sidebarCollapsed: boolean
  notifyTaskAssigned: boolean
  notifyTaskMentioned: boolean
  notifyTaskDueSoon: boolean
  notifyCommentAdded: boolean
  isLoading: boolean
}

const initialState: SettingsState = {
  theme: 'dark',
  defaultView: 'board',
  sidebarCollapsed: false,
  notifyTaskAssigned: true,
  notifyTaskMentioned: true,
  notifyTaskDueSoon: true,
  notifyCommentAdded: true,
  isLoading: false,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      return { ...state, ...action.payload, isLoading: false }
    },
    setTheme(state, action: PayloadAction<'dark' | 'light' | 'system'>) {
      state.theme = action.payload
    },
    setDefaultView(state, action: PayloadAction<'board' | 'list' | 'calendar'>) {
      state.defaultView = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setSettings, setTheme, setDefaultView, setLoading } = settingsSlice.actions
export default settingsSlice.reducer
