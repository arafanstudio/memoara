'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useSupabaseAuth } from './useSupabaseAuth'

export interface Reminder {
  id: number
  title: string
  description?: string
  dateTime: string
  priority: string
  category: string
  repeat: string
  notification: boolean
  completed: boolean
  createdAt: string
  completedAt?: string | null
}

export function useSupabaseReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { user } = useSupabaseAuth()
  const supabase = createClient()

  // Clear messages
  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  // Load reminders from Supabase
  const loadReminders = async () => {
    if (!user) return { success: false, reminders: [] }
  
    setLoading(true)
    clearMessages()
  
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('dateTime', { ascending: true })
  
      if (error) {
        setError(`Failed to load reminders: ${error.message}`)
        return { success: false, reminders: [] }
      }
  
      const formattedReminders = data.map(reminder => ({
        ...reminder,
        id: Number(reminder.id),
        dateTime: reminder.dateTime  // Ambil apa adanya dari DB
      }))
  
      setReminders(formattedReminders)
      setSuccess(`${formattedReminders.length} reminders loaded from Supabase`)
      return { success: true, reminders: formattedReminders }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to load reminders: ${errorMessage}`)
      return { success: false, reminders: [] }
    } finally {
      setLoading(false)
    }
  }
  

  // Save a single reminder to Supabase
  const saveReminder = async (reminder: Omit<Reminder, 'id'> & { id?: number }) => {
    if (!user) return { success: false }

    setLoading(true)
    clearMessages()

    try {
      const reminderData = {
        user_id: user.id,
        title: reminder.title,
        description: reminder.description || null,
        dateTime: reminder.dateTime,
        priority: reminder.priority,
        category: reminder.category,
        repeat: reminder.repeat,
        notification: reminder.notification,
        completed: reminder.completed,
        createdAt: reminder.createdAt,
        completedAt: reminder.completedAt || null
      }

      if (reminder.id) {
        // Update existing reminder
        const { error } = await supabase
          .from('reminders')
          .update(reminderData)
          .eq('id', reminder.id)
          .eq('user_id', user.id)

        if (error) {
          setError(`Failed to update reminder: ${error.message}`)
          return { success: false }
        }
      } else {
        // Insert new reminder
        const { error } = await supabase
          .from('reminders')
          .insert([reminderData])

        if (error) {
          setError(`Failed to save reminder: ${error.message}`)
          return { success: false }
        }
      }

      setSuccess('Reminder saved to Supabase')
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to save reminder: ${errorMessage}`)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  // Save all reminders to Supabase (bulk sync)
  const saveAllReminders = async (remindersToSave: Reminder[]) => {
    if (!user) return { success: false }

    setLoading(true)
    clearMessages()

    try {
      if (remindersToSave.length === 0) {
        // If no reminders to save, delete all existing reminders
        const { error: deleteError } = await supabase
          .from('reminders')
          .delete()
          .eq('user_id', user.id)

        if (deleteError) {
          setError(`Failed to clear reminders: ${deleteError.message}`)
          return { success: false }
        }

        setSuccess('All reminders cleared from Supabase')
        return { success: true }
      }

      // Use upsert to insert or update reminders
      const reminderData = remindersToSave.map(reminder => ({
        id: reminder.id, // Include the ID for upsert
        user_id: user.id,
        title: reminder.title,
        description: reminder.description || null,
        dateTime: reminder.dateTime,
        priority: reminder.priority,
        category: reminder.category,
        repeat: reminder.repeat,
        notification: reminder.notification,
        completed: reminder.completed,
        createdAt: reminder.createdAt,
        completedAt: reminder.completedAt || null
      }))

      const { error: upsertError } = await supabase
        .from('reminders')
        .upsert(reminderData, { 
          onConflict: 'id,user_id',
          ignoreDuplicates: false 
        })

      if (upsertError) {
        setError(`Failed to sync reminders: ${upsertError.message}`)
        return { success: false }
      }

      // Clean up any reminders in Supabase that are not in the local list
      const localIds = remindersToSave.map(r => r.id)
      if (localIds.length > 0) {
        const { error: cleanupError } = await supabase
          .from('reminders')
          .delete()
          .eq('user_id', user.id)
          .not('id', 'in', `(${localIds.join(',')})`)

        if (cleanupError) {
          console.warn('Failed to cleanup old reminders:', cleanupError.message)
          // Don't fail the entire operation for cleanup errors
        }
      }

      setSuccess(`${remindersToSave.length} reminders synced to Supabase`)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to sync reminders: ${errorMessage}`)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  // Delete a reminder from Supabase
  const deleteReminder = async (reminderId: number) => {
    if (!user) return { success: false }

    setLoading(true)
    clearMessages()

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId)
        .eq('user_id', user.id)

      if (error) {
        setError(`Failed to delete reminder: ${error.message}`)
        return { success: false }
      }

      setSuccess('Reminder deleted from Supabase')
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to delete reminder: ${errorMessage}`)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  // Delete all reminders from Supabase
  const deleteAllReminders = async () => {
    if (!user) return { success: false }

    setLoading(true)
    clearMessages()

    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('user_id', user.id)

      if (error) {
        setError(`Failed to delete all reminders: ${error.message}`)
        return { success: false }
      }

      setReminders([])
      setSuccess('All reminders deleted from Supabase')
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to delete all reminders: ${errorMessage}`)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  // Auto-load reminders when user signs in
  useEffect(() => {
    if (user) {
      loadReminders()
    } else {
      setReminders([])
    }
  }, [user])

  return {
    reminders,
    loading,
    error,
    success,
    loadReminders,
    saveReminder,
    saveAllReminders,
    deleteReminder,
    deleteAllReminders,
    clearMessages
  }
}

