import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Workspace {
  id: string
  name: string
  slug: string
  icon: string | null
  color: string | null
  description: string | null
  defaultView: 'board' | 'list' | 'calendar'
  ownerId: string
  role?: 'owner' | 'admin' | 'member' | 'viewer'
  createdAt: string
}

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  isLoading: boolean
  error: string | null
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,
}

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspaces(state, action: PayloadAction<Workspace[]>) {
      state.workspaces = action.payload
      state.isLoading = false
    },
    setCurrentWorkspace(state, action: PayloadAction<Workspace | null>) {
      state.currentWorkspace = action.payload
    },
    addWorkspace(state, action: PayloadAction<Workspace>) {
      state.workspaces.unshift(action.payload)
    },
    updateWorkspace(state, action: PayloadAction<Partial<Workspace> & { id: string }>) {
      const idx = state.workspaces.findIndex(w => w.id === action.payload.id)
      if (idx !== -1) state.workspaces[idx] = { ...state.workspaces[idx], ...action.payload }
      if (state.currentWorkspace?.id === action.payload.id) {
        state.currentWorkspace = { ...state.currentWorkspace, ...action.payload }
      }
    },
    removeWorkspace(state, action: PayloadAction<string>) {
      state.workspaces = state.workspaces.filter(w => w.id !== action.payload)
      if (state.currentWorkspace?.id === action.payload) state.currentWorkspace = null
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
      state.isLoading = false
    },
  },
})

export const { setWorkspaces, setCurrentWorkspace, addWorkspace, updateWorkspace, removeWorkspace, setLoading, setError } = workspaceSlice.actions
export default workspaceSlice.reducer
