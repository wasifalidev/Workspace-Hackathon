import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  createTaskModalOpen: boolean
  createProjectModalOpen: boolean
  createWorkspaceModalOpen: boolean
  taskDetailPanelOpen: boolean
  theme: 'dark' | 'light' | 'system'
  toasts: Toast[]
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

const initialState: UiState = {
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  createTaskModalOpen: false,
  createProjectModalOpen: false,
  createWorkspaceModalOpen: false,
  taskDetailPanelOpen: false,
  theme: 'dark',
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload
    },
    openCommandPalette(state) {
      state.commandPaletteOpen = true
    },
    closeCommandPalette(state) {
      state.commandPaletteOpen = false
    },
    toggleCommandPalette(state) {
      state.commandPaletteOpen = !state.commandPaletteOpen
    },
    openCreateTaskModal(state) {
      state.createTaskModalOpen = true
    },
    closeCreateTaskModal(state) {
      state.createTaskModalOpen = false
    },
    openCreateProjectModal(state) {
      state.createProjectModalOpen = true
    },
    closeCreateProjectModal(state) {
      state.createProjectModalOpen = false
    },
    openCreateWorkspaceModal(state) {
      state.createWorkspaceModalOpen = true
    },
    closeCreateWorkspaceModal(state) {
      state.createWorkspaceModalOpen = false
    },
    openTaskDetailPanel(state) {
      state.taskDetailPanelOpen = true
    },
    closeTaskDetailPanel(state) {
      state.taskDetailPanelOpen = false
    },
    setTheme(state, action: PayloadAction<'dark' | 'light' | 'system'>) {
      state.theme = action.payload
    },
    addToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
      state.toasts.push({ ...action.payload, id: Date.now().toString() })
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(t => t.id !== action.payload)
    },
  },
})

export const {
  toggleSidebar, setSidebarCollapsed,
  openCommandPalette, closeCommandPalette, toggleCommandPalette,
  openCreateTaskModal, closeCreateTaskModal,
  openCreateProjectModal, closeCreateProjectModal,
  openCreateWorkspaceModal, closeCreateWorkspaceModal,
  openTaskDetailPanel, closeTaskDetailPanel,
  setTheme, addToast, removeToast,
} = uiSlice.actions
export default uiSlice.reducer
