import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Project {
  id: string
  workspaceId: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  status: 'active' | 'archived' | 'completed'
  createdBy: string | null
  createdAt: string
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  error: string | null
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects(state, action: PayloadAction<Project[]>) {
      state.projects = action.payload
      state.isLoading = false
    },
    setCurrentProject(state, action: PayloadAction<Project | null>) {
      state.currentProject = action.payload
    },
    addProject(state, action: PayloadAction<Project>) {
      state.projects.unshift(action.payload)
    },
    updateProject(state, action: PayloadAction<Partial<Project> & { id: string }>) {
      const idx = state.projects.findIndex(p => p.id === action.payload.id)
      if (idx !== -1) state.projects[idx] = { ...state.projects[idx], ...action.payload }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = { ...state.currentProject, ...action.payload }
      }
    },
    removeProject(state, action: PayloadAction<string>) {
      state.projects = state.projects.filter(p => p.id !== action.payload)
      if (state.currentProject?.id === action.payload) state.currentProject = null
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

export const { setProjects, setCurrentProject, addProject, updateProject, removeProject, setLoading, setError } = projectSlice.actions
export default projectSlice.reducer
