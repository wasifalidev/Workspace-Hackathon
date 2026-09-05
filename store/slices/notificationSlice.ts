import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  recipientId: string
  actorId: string | null
  type: string
  title: string
  message: string | null
  taskId: string | null
  projectId: string | null
  workspaceId: string | null
  isRead: boolean
  createdAt: string
  actor?: { fullName: string | null; avatarUrl: string | null }
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.isRead).length
      state.isLoading = false
    },
    addNotification(state, action: PayloadAction<Notification>) {
      state.notifications.unshift(action.payload)
      if (!action.payload.isRead) state.unreadCount++
    },
    markAsRead(state, action: PayloadAction<string>) {
      const n = state.notifications.find(n => n.id === action.payload)
      if (n && !n.isRead) {
        n.isRead = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead(state) {
      state.notifications.forEach(n => { n.isRead = true })
      state.unreadCount = 0
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
  },
})

export const { setNotifications, addNotification, markAsRead, markAllAsRead, setLoading } = notificationSlice.actions
export default notificationSlice.reducer
