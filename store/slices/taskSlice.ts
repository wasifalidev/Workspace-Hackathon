import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled'
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'no_priority'

export interface Task {
  id: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  dueDate: string | null
  startDate: string | null
  estimatePoints: number | null
  sortOrder: number
  createdBy: string | null
  createdAt: string
  updatedAt: string
  // Joined data
  assignee?: { id: string; fullName: string | null; avatarUrl: string | null }
  labels?: { id: string; name: string; color: string }[]
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assigneeId?: string[]
  labelId?: string[]
  dueDateFrom?: string
  dueDateTo?: string
  search?: string
}

interface TaskState {
  tasks: Task[]
  selectedTaskId: string | null
  filters: TaskFilters
  isLoading: boolean
  error: string | null
}

const initialState: TaskState = {
  tasks: [],
  selectedTaskId: null,
  filters: {},
  isLoading: false,
  error: null,
}

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload
      state.isLoading = false
    },
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload)
    },
    updateTask(state, action: PayloadAction<Partial<Task> & { id: string }>) {
      const idx = state.tasks.findIndex(t => t.id === action.payload.id)
      if (idx !== -1) {
        state.tasks[idx] = { ...state.tasks[idx], ...action.payload }
      }
    },
    removeTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(t => t.id !== action.payload)
      if (state.selectedTaskId === action.payload) state.selectedTaskId = null
    },
    // Optimistic: move task to new status with new sort_order
    moveTask(state, action: PayloadAction<{ taskId: string; newStatus: TaskStatus; newSortOrder: number }>) {
      const task = state.tasks.find(t => t.id === action.payload.taskId)
      if (task) {
        task.status = action.payload.newStatus
        task.sortOrder = action.payload.newSortOrder
      }
    },
    setSelectedTask(state, action: PayloadAction<string | null>) {
      state.selectedTaskId = action.payload
    },
    setFilters(state, action: PayloadAction<TaskFilters>) {
      state.filters = action.payload
    },
    clearFilters(state) {
      state.filters = {}
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

export const { setTasks, addTask, updateTask, removeTask, moveTask, setSelectedTask, setFilters, clearFilters, setLoading, setError } = taskSlice.actions
export default taskSlice.reducer
