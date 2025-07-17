'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Clock, ArrowLeft, Volume2, VolumeX, Repeat, RotateCcw } from 'lucide-react'

interface Alarm {
  id: number
  time: string
  label: string
  isActive: boolean
  repeatDays: string[]
  sound: string
  volume: number
  snoozeEnabled: boolean
  snoozeDuration: number
  createdAt: string
}

interface AlarmPageProps {
  onBack: () => void
}

export default function AlarmPage({ onBack }: AlarmPageProps) {
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null)
  
  const [formData, setFormData] = useState({
    time: '',
    label: '',
    repeatDays: [] as string[],
    sound: 'default',
    volume: 80,
    snoozeEnabled: true,
    snoozeDuration: 5
  })

  const weekDays = [
    { value: 'monday', label: 'Mon', fullName: 'Monday' },
    { value: 'tuesday', label: 'Tue', fullName: 'Tuesday' },
    { value: 'wednesday', label: 'Wed', fullName: 'Wednesday' },
    { value: 'thursday', label: 'Thu', fullName: 'Thursday' },
    { value: 'friday', label: 'Fri', fullName: 'Friday' },
    { value: 'saturday', label: 'Sat', fullName: 'Saturday' },
    { value: 'sunday', label: 'Sun', fullName: 'Sunday' }
  ]

  const alarmSounds = [
    { value: 'default', label: 'Default' },
    { value: 'gentle', label: 'Gentle Wake' },
    { value: 'nature', label: 'Nature Sounds' },
    { value: 'classic', label: 'Classic Bell' },
    { value: 'digital', label: 'Digital Beep' }
  ]

  const snoozeDurations = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' }
  ]

  // Load alarms from localStorage
  useEffect(() => {
    const savedAlarms = localStorage.getItem('alarms')
    if (savedAlarms) {
      setAlarms(JSON.parse(savedAlarms))
    }
  }, [])

  // Save alarms to localStorage
  useEffect(() => {
    localStorage.setItem('alarms', JSON.stringify(alarms))
  }, [alarms])

  // Reset form
  const resetForm = () => {
    setFormData({
      time: '',
      label: '',
      repeatDays: [],
      sound: 'default',
      volume: 80,
      snoozeEnabled: true,
      snoozeDuration: 5
    })
    setEditingAlarm(null)
  }

  // Add or update alarm
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.time.trim()) {
      alert('Please set the alarm time')
      return
    }

    const alarmData: Alarm = {
      id: editingAlarm ? editingAlarm.id : Date.now(),
      time: formData.time,
      label: formData.label || 'Alarm',
      isActive: editingAlarm ? editingAlarm.isActive : true,
      repeatDays: formData.repeatDays,
      sound: formData.sound,
      volume: formData.volume,
      snoozeEnabled: formData.snoozeEnabled,
      snoozeDuration: formData.snoozeDuration,
      createdAt: editingAlarm ? editingAlarm.createdAt : new Date().toISOString()
    }

    if (editingAlarm) {
      setAlarms(alarms.map(a => a.id === editingAlarm.id ? alarmData : a))
    } else {
      setAlarms([...alarms, alarmData])
    }

    resetForm()
    setIsAddDialogOpen(false)
  }

  // Edit alarm
  const handleEdit = (alarm: Alarm) => {
    setFormData({
      time: alarm.time,
      label: alarm.label,
      repeatDays: alarm.repeatDays,
      sound: alarm.sound,
      volume: alarm.volume,
      snoozeEnabled: alarm.snoozeEnabled,
      snoozeDuration: alarm.snoozeDuration
    })
    setEditingAlarm(alarm)
    setIsAddDialogOpen(true)
  }

  // Delete alarm
  const handleDelete = (id: number) => {
    setAlarms(alarms.filter(a => a.id !== id))
  }

  // Toggle alarm active state
  const toggleAlarm = (id: number) => {
    setAlarms(alarms.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ))
  }

  // Toggle repeat day
  const toggleRepeatDay = (day: string) => {
    const newRepeatDays = formData.repeatDays.includes(day)
      ? formData.repeatDays.filter(d => d !== day)
      : [...formData.repeatDays, day]
    
    setFormData({ ...formData, repeatDays: newRepeatDays })
  }

  // Format time display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Get repeat days display
  const getRepeatDaysDisplay = (repeatDays: string[]) => {
    if (repeatDays.length === 0) return 'Once'
    if (repeatDays.length === 7) return 'Every day'
    if (repeatDays.length === 5 && !repeatDays.includes('saturday') && !repeatDays.includes('sunday')) {
      return 'Weekdays'
    }
    if (repeatDays.length === 2 && repeatDays.includes('saturday') && repeatDays.includes('sunday')) {
      return 'Weekends'
    }
    return repeatDays.map(day => weekDays.find(d => d.value === day)?.label).join(', ')
  }

  // Get next alarm time
  const getNextAlarmTime = (alarm: Alarm) => {
    const now = new Date()
    const [hours, minutes] = alarm.time.split(':').map(Number)
    
    if (alarm.repeatDays.length === 0) {
      // One-time alarm
      const alarmTime = new Date()
      alarmTime.setHours(hours, minutes, 0, 0)
      
      if (alarmTime <= now) {
        alarmTime.setDate(alarmTime.getDate() + 1)
      }
      
      return alarmTime
    } else {
      // Recurring alarm
      const today = now.getDay()
      const todayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today]
      
      // Check if alarm should ring today
      if (alarm.repeatDays.includes(todayName)) {
        const todayAlarmTime = new Date()
        todayAlarmTime.setHours(hours, minutes, 0, 0)
        
        if (todayAlarmTime > now) {
          return todayAlarmTime
        }
      }
      
      // Find next day
      for (let i = 1; i <= 7; i++) {
        const nextDay = (today + i) % 7
        const nextDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][nextDay]
        
        if (alarm.repeatDays.includes(nextDayName)) {
          const nextAlarmTime = new Date()
          nextAlarmTime.setDate(now.getDate() + i)
          nextAlarmTime.setHours(hours, minutes, 0, 0)
          return nextAlarmTime
        }
      }
    }
    
    return null
  }

  // Format next alarm display
  const formatNextAlarm = (alarm: Alarm) => {
    const nextTime = getNextAlarmTime(alarm)
    if (!nextTime) return ''
    
    const now = new Date()
    const diffMs = nextTime.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHours < 24) {
      if (diffHours === 0) {
        return `in ${diffMinutes} minutes`
      }
      return `in ${diffHours}h ${diffMinutes}m`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Alarms</h1>
                  <p className="text-sm text-muted-foreground">Set your wake-up alarms</p>
                </div>
              </div>
            </div>
            
      {/* Add/Edit Alarm Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={resetForm}>
            <Plus className="w-4 h-4 mr-2" />
            Add Alarm
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAlarm ? 'Edit Alarm' : 'Add Alarm'}
            </DialogTitle>
            <DialogDescription>
              {editingAlarm ? 'Edit your alarm settings' : 'Set up a new alarm'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="time" className="mb-1 ml-1">Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="label" className="mb-1 ml-1">Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
                placeholder="Alarm label (optional)"
              />
            </div>
            
            <div>
              <Label className="mb-2 ml-1">Repeat Days</Label>
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={formData.repeatDays.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    className="h-10"
                    onClick={() => toggleRepeatDay(day.value)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="sound" className="mb-1 ml-1">Alarm Sound</Label>
              <Select value={formData.sound} onValueChange={(value) => setFormData({...formData, sound: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alarmSounds.map(sound => (
                    <SelectItem key={sound.value} value={sound.value}>
                      {sound.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="volume" className="mb-1 ml-1">Volume: {formData.volume}%</Label>
              <input
                id="volume"
                type="range"
                min="0"
                max="100"
                value={formData.volume}
                onChange={(e) => setFormData({...formData, volume: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="snooze"
                  checked={formData.snoozeEnabled}
                  onCheckedChange={(checked) => setFormData({...formData, snoozeEnabled: checked})}
                />
                <Label htmlFor="snooze">Enable snooze</Label>
              </div>
              
              {formData.snoozeEnabled && (
                <div>
                  <Label htmlFor="snoozeDuration" className="mb-1 ml-1">Snooze Duration</Label>
                  <Select 
                    value={formData.snoozeDuration.toString()} 
                    onValueChange={(value) => setFormData({...formData, snoozeDuration: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {snoozeDurations.map(duration => (
                        <SelectItem key={duration.value} value={duration.value.toString()}>
                          {duration.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingAlarm ? 'Save Changes' : 'Create Alarm'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-0">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-primary">{alarms.length}</div>
              <p className="text-sm text-muted-foreground">Total Alarms</p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-green-500">{alarms.filter(a => a.isActive).length}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Alarms List */}
        <div className="space-y-4">
          {alarms.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">⏰</div>
                <h3 className="text-lg font-semibold mb-2">No alarms set</h3>
                <p className="text-muted-foreground">Tap the "Add Alarm" button<br />to create your first alarm</p>
              </CardContent>
            </Card>
          ) : (
            alarms.map(alarm => (
              <Card key={alarm.id} className={`transition-all duration-200 hover:shadow-md ${
                !alarm.isActive ? 'opacity-50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl font-bold">
                          {formatTime(alarm.time)}
                        </div>
                        <Switch
                          checked={alarm.isActive}
                          onCheckedChange={() => toggleAlarm(alarm.id)}
                        />
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        <p className="font-medium">{alarm.label}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{getRepeatDaysDisplay(alarm.repeatDays)}</span>
                          {alarm.isActive && (
                            <span className="text-primary font-medium">
                              {formatNextAlarm(alarm)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Volume2 className="w-4 h-4" />
                            <span>{alarm.sound}</span>
                          </div>
                          {alarm.snoozeEnabled && (
                            <div className="flex items-center space-x-1">
                              <RotateCcw className="w-4 h-4" />
                              <span>{alarm.snoozeDuration}min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(alarm)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Alarm</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this alarm? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(alarm.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

