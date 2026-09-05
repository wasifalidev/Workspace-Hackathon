import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ActivityLog {
  id: string
  workspaceId: string | null
  projectId: string | null
  taskId: string | null
  actorId: string | null
  action: string
  metadata: Record<string, unknown>
  createdAt: string
  actor?: { fullName: string | null; avatarUrl: string | null }
}

interface ActivityState {
  logs: ActivityLog[]
  isLoading: boolean
}

const initialState: ActivityState = {
  logs: [],
  isLoading: false,
}

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setLogs(state, action: PayloadAction<ActivityLog[]>) {
      state.logs = action.payload
      state.isLoading = false
    },
    prependLog(state, action: PayloadAction<ActivityLog>) {
      state.logs.unshift(action.payload)
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setLogs, prependLog, setLoading } = activitySlice.actions
export default activitySlice.reducer
