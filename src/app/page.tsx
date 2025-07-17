'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { AnimatedButton } from '@/components/ui/animated-button'
import { AnimatedCard } from '@/components/ui/animated-card'
import { Plus, Edit, Trash2, Check, Clock, Moon, Sun, Bell, Calendar, Filter, Settings } from 'lucide-react'
import { requestNotificationPermission, showNotification, scheduleNotification, checkNotificationSupport } from '@/utils/notifications'
import AlarmPage from '@/components/AlarmPage'
import LoginButton from '@/components/LoginButton'
import { useSession, signOut } from 'next-auth/react'
import { useGoogleDriveSync } from '@/hooks/useGoogleDriveSync'

export default function Home() {
  const { data: session } = useSession()
  const { syncStatus, saveToCloud, loadFromCloud, deleteFromCloud, clearMessages } = useGoogleDriveSync()
  
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [reminders, setReminders] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState(null)
  const [currentFilter, setCurrentFilter] = useState('all')
  const [showSettings, setShowSettings] = useState(false)
  const [showAlarmPage, setShowAlarmPage] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState("default")
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    priority: 'medium',
    category: 'personal',
    repeat: 'none',
    notification: true
  })

  const priorities = [
    { value: 'high', label: 'High', color: 'bg-red-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'low', label: 'Low', color: 'bg-green-500' }
  ]

  const categories = [
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'shopping', label: 'Shopping', icon: '🛒' },
    { value: 'study', label: 'Study', icon: '📚' },
    { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'other', label: 'Other', icon: '📝' }
  ]

  const repeatOptions = [
    { value: 'none', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  useEffect(() => {
    const adjustZoomForMobileRatio = () => {
      const isMobile = window.innerWidth <= 768
      const ratio = window.screen.height / window.screen.width
      const isTargetRatio = Math.abs(ratio - 20 / 9) < 0.05
  
      const body = document.body
  
      if (isMobile && isTargetRatio) {
        body.style.zoom = '0.8'
        body.style.overflowX = 'hidden'
        body.style.width = '100%' // cegah overflow horizontal
        body.style.height = '100%' // cegah scroll bawah
      } else {
        body.style.zoom = ''
        body.style.overflowX = ''
        body.style.width = ''
        body.style.height = ''
      }
    }
  
    adjustZoomForMobileRatio()
    window.addEventListener('resize', adjustZoomForMobileRatio)
  
    return () => {
      window.removeEventListener('resize', adjustZoomForMobileRatio)
    }
  }, [])  

  // Load data from localStorage on mount
  useEffect(() => {
    const savedReminders = localStorage.getItem('reminders')
    const savedDarkMode = localStorage.getItem("isDarkMode")
    
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders))
    }
    
    if (savedDarkMode) {
      const isDark = JSON.parse(savedDarkMode)
      setIsDarkMode(isDark)
      if (isDark) {
        document.documentElement.classList.add("dark")
      }
    }

    // PWA installation detection
    const checkPWAInstalled = () => {
      // Check if app is running in standalone mode (installed PWA)
      if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
        setIsPWAInstalled(true)
      }
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsPWAInstalled(false)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsPWAInstalled(true)
      setDeferredPrompt(null)
    }

    checkPWAInstalled()
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check notification support and permission
    const notificationSupport = checkNotificationSupport()
    setNotificationPermission(notificationSupport.permission)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Save reminders to localStorage only (no auto-sync)
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders))
  }, [reminders])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('isDarkMode', JSON.stringify(newDarkMode))
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Install PWA
  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    }
  }

  // Load from cloud when user signs in (auto-load preserved)
  useEffect(() => {
    if (session && reminders.length === 0) {
      loadFromCloud().then(result => {
        if (result.success && result.reminders.length > 0) {
          setReminders(result.reminders)
          showNotification('Reminders Synced!', {
            body: `${result.reminders.length} reminders loaded from Google Drive.`
          })
        }
      })
    }
  }, [session])

  // Request notification permission
  const handleNotificationPermission = async () => {
    const granted = await requestNotificationPermission()
    setNotificationPermission(granted ? 'granted' : 'denied')
    if (granted) {
      showNotification('Notifications Enabled!', {
        body: 'You will receive notifications for scheduled reminders.'
      })
    }
  }

  // Manual sync functions
  const handleManualSync = async () => {
    clearMessages()
    const result = await saveToCloud(reminders)
    if (result.success) {
      showNotification('Sync Complete!', {
        body: 'Your reminders have been saved to Google Drive.'
      })
    }
  }

  const handleLoadFromCloud = async () => {
    clearMessages()
    const result = await loadFromCloud()
    if (result.success && result.reminders.length > 0) {
      // Merge with existing reminders
      const existingIds = new Set(reminders.map(r => r.id))
      const newReminders = result.reminders.filter(r => !existingIds.has(r.id))
      
      if (newReminders.length > 0) {
        setReminders(prev => [...prev, ...newReminders])
        showNotification('Reminders Loaded!', {
          body: `${newReminders.length} new reminders loaded from Google Drive.`
        })
      } else {
        showNotification('Already Up to Date!', {
          body: 'No new reminders found in Google Drive.'
        })
      }
    }
  }

  const handleDeleteBackup = async () => {
    if (confirm('Are you sure you want to delete your backup from Google Drive? This action cannot be undone.')) {
      clearMessages()
      const result = await deleteFromCloud()
      if (result.success) {
        showNotification('Backup Deleted!', {
          body: 'Your backup has been removed from Google Drive.'
        })
      }
    }
  }

  // Filter reminders
  const filteredReminders = reminders.filter(reminder => {
    const now = new Date()
    const reminderTime = new Date(reminder.dateTime)
    
    switch (currentFilter) {
      case 'upcoming':
        return !reminder.completed && reminderTime > now
      case 'overdue':
        return !reminder.completed && reminderTime <= now
      case 'completed':
        return reminder.completed
      default:
        return true
    }
  })

  // Statistics
  const stats = {
    total: reminders.length,
    active: reminders.filter(r => !r.completed).length,
    overdue: reminders.filter(r => !r.completed && new Date(r.dateTime) <= new Date()).length,
    completed: reminders.filter(r => r.completed).length
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dateTime: '',
      priority: 'medium',
      category: 'personal',
      repeat: 'none',
      notification: true
    })
    setEditingReminder(null)
  }

  // Add or update reminder
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.dateTime) {
      alert('Please complete the title and time for the reminder')
      return
    }

    const reminderData = {
      ...formData,
      id: editingReminder ? editingReminder.id : Date.now(),
      completed: editingReminder ? editingReminder.completed : false,
      createdAt: editingReminder ? editingReminder.createdAt : new Date().toISOString(),
      completedAt: editingReminder ? editingReminder.completedAt : null
    }

    if (editingReminder) {
      setReminders(reminders.map(r => r.id === editingReminder.id ? reminderData : r))
    } else {
      setReminders([...reminders, reminderData])
    }

    // Schedule notification if enabled and permission granted
    if (reminderData.notification && notificationPermission === 'granted') {
      scheduleNotification(reminderData)
    }

    resetForm()
    setIsAddDialogOpen(false)
  }

  // Edit reminder
  const handleEdit = (reminder) => {
    setFormData({
      title: reminder.title,
      description: reminder.description || '',
      dateTime: reminder.dateTime,
      priority: reminder.priority,
      category: reminder.category,
      repeat: reminder.repeat,
      notification: reminder.notification
    })
    setEditingReminder(reminder)
    setIsAddDialogOpen(true)
  }

  // Delete reminder
  const handleDelete = (id) => {
    setReminders(reminders.filter(r => r.id !== id))
  }

  // Toggle completion
  const toggleComplete = (id) => {
    setReminders(reminders.map(r => 
      r.id === id 
        ? { 
            ...r, 
            completed: !r.completed,
            completedAt: !r.completed ? new Date().toISOString() : null
          }
        : r
    ))
  }

  // Format date time
  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime)
    const now = new Date()

    // Set both dates to start of day for comparison
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfReminderDay = new Date(date.getFullYear(), date.getMonth(), date.getDate())

    const diffTime = startOfReminderDay.getTime() - startOfToday.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    
    const timeStr = date.toLocaleTimeString("id-ID", { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
    
    if (diffDays === 0) {
      return `Today, ${timeStr}`
    } else if (diffDays === 1) {
      return `Tomorrow, ${timeStr}`
    } else if (diffDays === -1) {
      return `Yesterday, ${timeStr}`
    } else if (diffDays > 1 && diffDays <= 7) {
      return `In ${diffDays} days, ${timeStr}`;
    } else if (diffDays < -1 && diffDays >= -7) {
      return `${Math.abs(diffDays)} days ago, ${timeStr}`
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    }
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority)
    return priorityObj ? priorityObj.color : 'bg-gray-500'
  }

  // Get category info
  const getCategoryInfo = (category) => {
    return categories.find(c => c.value === category) || categories[0]
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {showAlarmPage ? (
        <AlarmPage onBack={() => setShowAlarmPage(false)} />
      ) : (
        <>
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center cursor-pointer" onClick={() => setShowAlarmPage(true)}>
                <Bell className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Memoara</h1>
                <p className="text-sm text-muted-foreground">Your Daily Reminder</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <AnimatedButton
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-5 h-5" />
              </AnimatedButton>
              <AnimatedButton
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </AnimatedButton>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Settings Panel */}
        {showSettings && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Enable dark mode for eye comfort</p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>App Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {isPWAInstalled 
                        ? 'The app is already installed' 
                        : 'The app is not installed yet'
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={isPWAInstalled ? "default" : "secondary"}>
                      {isPWAInstalled ? "Installed" : "Not Installed"}
                    </Badge>
                    {!isPWAInstalled && deferredPrompt && (
                      <Button size="sm" onClick={installPWA}>
                        Install
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notification</Label>
                    <p className="text-sm text-muted-foreground">
                      {notificationPermission === 'granted' 
                        ? 'Notifications allowed' 
                        : notificationPermission === 'denied'
                        ? 'Notifications blocked'
                        : 'Notifications not allowed yet'
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={notificationPermission === 'granted' ? "default" : "secondary"}>
                      {notificationPermission === 'granted' ? "Enabled" : "Disabled"}
                    </Badge>
                    {notificationPermission !== 'granted' && (
                      <Button size="sm" onClick={handleNotificationPermission}>
                        Allow
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Google Account</Label>
                    <p className="text-sm text-muted-foreground">
                      {session 
                        ? `Connected as ${session.user?.email}` 
                        : 'Link your Google account to sync reminders'
                      }
                      {session && syncStatus.lastSync && (
                        <span className="block text-xs text-green-600 dark:text-green-400">
                          Last sync: {new Date(syncStatus.lastSync).toLocaleString('id-ID')}
                        </span>
                      )}
                      {syncStatus.error && (
                        <span className="block text-xs text-red-600 dark:text-red-400">
                          Error: {syncStatus.error}
                        </span>
                      )}
                      {syncStatus.success && (
                        <span className="block text-xs text-green-600 dark:text-green-400">
                          {syncStatus.success}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {session ? (
                      <Badge variant="default">Connected</Badge>
                    ) : (
                      <LoginButton />
                    )}
                  </div>
                </div>
                {session && (
                  <div className="flex flex-row space-x-2 flex-wrap mt-3 justify-end">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleManualSync}
                      disabled={syncStatus.isLoading}
                    >
                      {syncStatus.isLoading ? 'Syncing...' : 'Sync'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleLoadFromCloud}
                      disabled={syncStatus.isLoading}
                    >
                      Load
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={handleDeleteBackup}
                      disabled={syncStatus.isLoading}
                    >
                      Delete Backup
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => signOut()}
                    >
                      Disconnect
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-0">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-blue-500">{stats.active}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-red-500">{stats.overdue}</div>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Button and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
                </DialogTitle>
                <DialogDescription>
                  {editingReminder ? 'Edit your reminder details' : 'Create a new reminder to stay organized'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-1 ml-1">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter reminder title..."
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="description" className="mb-1 ml-1">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Add a description (optional)..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="dateTime" className="mb-1 ml-1">Date & Time *</Label>
                  <Input
                    id="dateTime"
                    type="datetime-local"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority" className="mb-1 ml-1">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${priority.color}`}></div>
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className="mb-1 ml-1">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center space-x-2">
                              <span>{category.icon}</span>
                              <span>{category.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="repeat" className="mb-1 ml-1">Repeat</Label>
                  <Select value={formData.repeat} onValueChange={(value) => setFormData({...formData, repeat: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {repeatOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="notification"
                    checked={formData.notification}
                    onCheckedChange={(checked) => setFormData({...formData, notification: checked})}
                  />
                  <Label htmlFor="notification">Enable notifications</Label>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingReminder ? 'Save Changes' : 'Create Reminder'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Filter Tabs */}
          <Tabs value={currentFilter} onValueChange={setCurrentFilter} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Reminders List */}
        <div className="space-y-4">
          {filteredReminders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">No reminders yet</h3>
                <p className="text-muted-foreground">Tap the "Add Reminder" button<br />to create a new one</p>
              </CardContent>
            </Card>
          ) : (
            filteredReminders.map(reminder => {
              const categoryInfo = getCategoryInfo(reminder.category)
              const isOverdue = !reminder.completed && new Date(reminder.dateTime) <= new Date()
              
              return (
                <Card key={reminder.id} className={`py-4 transition-all duration-200 hover:shadow-md ${
                  reminder.completed ? 'opacity-70' : ''
                } ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`}>
                  <CardContent className="p-4 py-0">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full border ${reminder.completed ? 'bg-green-100 dark:bg-green-900' : ''}`}
                        onClick={() => toggleComplete(reminder.id)}
                      >
                        <Check className={`w-4 h-4 ${reminder.completed ? 'text-green-600' : 'text-muted-foreground'}`} />
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className={`font-semibold ${reminder.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {reminder.title}
                            </h3>
                            {reminder.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {reminder.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(reminder)}
                            >
                              <Edit className="w-4 h-4 mt-[2px]" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this reminder? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(reminder.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{formatDateTime(reminder.dateTime)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              <span className="mr-1">{categoryInfo.icon}</span>
                              {categoryInfo.label}
                            </Badge>
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(reminder.priority)}`}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
        </>
      )}
    </div>
  )
}

