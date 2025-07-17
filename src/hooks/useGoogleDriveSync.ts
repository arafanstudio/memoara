import { useState } from 'react'
import { useSession } from 'next-auth/react'

export interface SyncStatus {
  isLoading: boolean
  lastSync: string | null
  error: string | null
  success: string | null
}

export function useGoogleDriveSync() {
  const { data: session } = useSession()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    lastSync: null,
    error: null,
    success: null
  })

  const clearMessages = () => {
    setSyncStatus(prev => ({ ...prev, error: null, success: null }))
  }

  const saveToCloud = async (reminders: any[]) => {
    if (!session) {
      setSyncStatus(prev => ({ 
        ...prev, 
        error: 'Please sign in with Google to sync reminders' 
      }))
      return { success: false }
    }

    setSyncStatus(prev => ({ ...prev, isLoading: true, error: null, success: null }))

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          reminders
        })
      })

      const result = await response.json()

      if (result.success) {
        const now = new Date().toISOString()
        setSyncStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          lastSync: now,
          success: `Reminders ${result.action} to Google Drive successfully!`
        }))
        localStorage.setItem('lastCloudSync', now)
        return { success: true, result }
      } else {
        setSyncStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error || 'Failed to save reminders to Google Drive' 
        }))
        return { success: false, error: result.error }
      }
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Network error while syncing to Google Drive' 
      }))
      return { success: false, error: 'Network error' }
    }
  }

  const loadFromCloud = async () => {
    if (!session) {
      setSyncStatus(prev => ({ 
        ...prev, 
        error: 'Please sign in with Google to load reminders' 
      }))
      return { success: false, reminders: [] }
    }

    setSyncStatus(prev => ({ ...prev, isLoading: true, error: null, success: null }))

    try {
      const response = await fetch('/api/sync', {
        method: 'GET'
      })

      const result = await response.json()

      if (result.success) {
        setSyncStatus(prev => ({ 
          ...prev, 
          isLoading: false,
          lastSync: result.lastSync || null,
          success: result.reminders.length > 0 
            ? `Loaded ${result.reminders.length} reminders from Google Drive!`
            : 'No reminders found in Google Drive'
        }))
        
        if (result.lastSync) {
          localStorage.setItem('lastCloudSync', result.lastSync)
        }
        
        return { success: true, reminders: result.reminders || [] }
      } else {
        setSyncStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error || 'Failed to load reminders from Google Drive' 
        }))
        return { success: false, reminders: [] }
      }
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Network error while loading from Google Drive' 
      }))
      return { success: false, reminders: [] }
    }
  }

  const deleteFromCloud = async () => {
    if (!session) {
      setSyncStatus(prev => ({ 
        ...prev, 
        error: 'Please sign in with Google to delete backup' 
      }))
      return { success: false }
    }

    setSyncStatus(prev => ({ ...prev, isLoading: true, error: null, success: null }))

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete'
        })
      })

      const result = await response.json()

      if (result.success) {
        setSyncStatus(prev => ({ 
          ...prev, 
          isLoading: false,
          lastSync: null,
          success: result.message || 'Backup deleted from Google Drive successfully!'
        }))
        localStorage.removeItem('lastCloudSync')
        return { success: true }
      } else {
        setSyncStatus(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error || 'Failed to delete backup from Google Drive' 
        }))
        return { success: false }
      }
    } catch (error) {
      setSyncStatus(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Network error while deleting from Google Drive' 
      }))
      return { success: false }
    }
  }

  return {
    syncStatus,
    saveToCloud,
    loadFromCloud,
    deleteFromCloud,
    clearMessages
  }
}

