'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, User, Trophy, Zap, Shield, Heart, Brain, CheckCircle, Circle } from 'lucide-react'

interface Quest {
  id: number
  title: string
  description: string
  type: 'exercise' | 'health' | 'productivity'
  expReward: number
  completed: boolean
  icon: string
}

interface PlayerStats {
  level: number
  exp: number
  expToNext: number
  strength: number
  agility: number
  vitality: number
  intelligence: number
}

interface GamificationPageProps {
  onBack: () => void
}

export default function GamificationPage({ onBack }: GamificationPageProps) {
  const [currentView, setCurrentView] = useState<'quests' | 'status'>('quests')
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([])
  const [playerStats, setPlayerStats] = useState<PlayerStats>({
    level: 1,
    exp: 0,
    expToNext: 100,
    strength: 10,
    agility: 10,
    vitality: 10,
    intelligence: 10
  })

  // Generate daily quests
  const generateDailyQuests = (): Quest[] => {
    const questTemplates = [
      { title: 'Push Up 10x', description: 'Complete 10 push-ups to build strength', type: 'exercise' as const, expReward: 25, icon: '💪' },
      { title: 'Sit Up 10x', description: 'Do 10 sit-ups for core strength', type: 'exercise' as const, expReward: 25, icon: '🏋️' },
      { title: 'Walk/Run 1km', description: 'Walk or run at least 1 kilometer', type: 'health' as const, expReward: 30, icon: '🏃' },
      { title: 'Drink 8 Glasses of Water', description: 'Stay hydrated throughout the day', type: 'health' as const, expReward: 20, icon: '💧' },
      { title: 'Read for 30 Minutes', description: 'Read a book or educational material', type: 'productivity' as const, expReward: 35, icon: '📚' },
      { title: 'Meditate for 10 Minutes', description: 'Practice mindfulness and meditation', type: 'health' as const, expReward: 30, icon: '🧘' },
      { title: 'Complete 3 Tasks', description: 'Finish 3 important tasks from your to-do list', type: 'productivity' as const, expReward: 40, icon: '✅' },
      { title: 'Stretch for 15 Minutes', description: 'Do stretching exercises for flexibility', type: 'exercise' as const, expReward: 20, icon: '🤸' }
    ]

    // Select 4 random quests for today
    const shuffled = questTemplates.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 4).map((quest, index) => ({
      ...quest,
      id: index + 1,
      completed: false
    }))
  }

  // Load data from localStorage
  useEffect(() => {
    const savedQuests = localStorage.getItem('dailyQuests')
    const savedStats = localStorage.getItem('playerStats')
    const lastQuestDate = localStorage.getItem('lastQuestDate')
    const today = new Date().toDateString()

    // Check if we need to generate new quests (new day or no quests exist)
    if (!lastQuestDate || lastQuestDate !== today || !savedQuests) {
      const newQuests = generateDailyQuests()
      setDailyQuests(newQuests)
      localStorage.setItem('dailyQuests', JSON.stringify(newQuests))
      localStorage.setItem('lastQuestDate', today)
    } else {
      try {
        const parsedQuests = JSON.parse(savedQuests)
        if (Array.isArray(parsedQuests) && parsedQuests.length > 0) {
          setDailyQuests(parsedQuests)
        } else {
          // If saved quests are invalid, generate new ones
          const newQuests = generateDailyQuests()
          setDailyQuests(newQuests)
          localStorage.setItem('dailyQuests', JSON.stringify(newQuests))
          localStorage.setItem('lastQuestDate', today)
        }
      } catch (error) {
        // If parsing fails, generate new quests
        const newQuests = generateDailyQuests()
        setDailyQuests(newQuests)
        localStorage.setItem('dailyQuests', JSON.stringify(newQuests))
        localStorage.setItem('lastQuestDate', today)
      }
    }

    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats)
        setPlayerStats(parsedStats)
      } catch (error) {
        // If parsing fails, keep default stats
        console.error('Failed to parse player stats:', error)
      }
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('dailyQuests', JSON.stringify(dailyQuests))
  }, [dailyQuests])

  useEffect(() => {
    localStorage.setItem('playerStats', JSON.stringify(playerStats))
  }, [playerStats])

  // Complete quest and gain EXP
  const completeQuest = (questId: number) => {
    const quest = dailyQuests.find(q => q.id === questId)
    if (!quest || quest.completed) return

    // Mark quest as completed
    setDailyQuests(prev => prev.map(q => 
      q.id === questId ? { ...q, completed: true } : q
    ))

    // Calculate stat gains based on quest type
    let statGains = { strength: 0, agility: 0, vitality: 0, intelligence: 0 }
    switch (quest.type) {
      case 'exercise':
        statGains.strength = Math.floor(Math.random() * 3) + 1
        statGains.vitality = Math.floor(Math.random() * 2) + 1
        break
      case 'health':
        statGains.vitality = Math.floor(Math.random() * 3) + 1
        statGains.agility = Math.floor(Math.random() * 2) + 1
        break
      case 'productivity':
        statGains.intelligence = Math.floor(Math.random() * 3) + 1
        statGains.agility = Math.floor(Math.random() * 2) + 1
        break
    }

    // Update player stats
    setPlayerStats(prev => {
      const newExp = prev.exp + quest.expReward
      let newLevel = prev.level
      let expToNext = prev.expToNext
      let remainingExp = newExp

      // Check for level up
      while (remainingExp >= expToNext) {
        remainingExp -= expToNext
        newLevel++
        expToNext = newLevel * 100 // Each level requires level * 100 EXP
      }

      return {
        level: newLevel,
        exp: remainingExp,
        expToNext: expToNext,
        strength: prev.strength + statGains.strength,
        agility: prev.agility + statGains.agility,
        vitality: prev.vitality + statGains.vitality,
        intelligence: prev.intelligence + statGains.intelligence
      }
    })
  }

  const getQuestTypeColor = (type: Quest['type']) => {
    switch (type) {
      case 'exercise': return 'bg-red-500'
      case 'health': return 'bg-green-500'
      case 'productivity': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getQuestTypeName = (type: Quest['type']) => {
    switch (type) {
      case 'exercise': return 'Exercise'
      case 'health': return 'Health'
      case 'productivity': return 'Productivity'
      default: return 'Other'
    }
  }

  const completedQuests = dailyQuests.filter(q => q.completed).length
  const totalQuests = dailyQuests.length
  const completionPercentage = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Gamification</h1>
                <p className="text-sm text-muted-foreground">Level up your daily habits</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView(currentView === 'quests' ? 'status' : 'quests')}
            >
              {currentView === 'quests' ? <User className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {currentView === 'quests' ? (
          <>
            {/* Daily Quest Progress */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5" />
                  <span>Daily Progress</span>
                </CardTitle>
                <CardDescription>
                  Complete your daily quests to gain experience and improve your stats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {completedQuests} of {totalQuests} quests completed
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(completionPercentage)}%
                    </span>
                  </div>
                  <Progress value={completionPercentage} className="h-2" />
                  
                  {completedQuests === totalQuests && totalQuests > 0 && (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl mb-2">🎉</div>
                      <p className="font-semibold text-green-700 dark:text-green-300">
                        All quests completed!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Great job! Come back tomorrow for new challenges.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Daily Quests */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Today's Quests</h2>
              {dailyQuests.map(quest => (
                <Card key={quest.id} className={`transition-all duration-300 ${
                  quest.completed ? 'opacity-70 bg-green-50 dark:bg-green-900/20' : 'hover:shadow-md'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full border transition-all duration-300 ${
                          quest.completed ? 'bg-green-100 dark:bg-green-900 border-green-500' : ''
                        }`}
                        onClick={() => completeQuest(quest.id)}
                        disabled={quest.completed}
                      >
                        {quest.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-2xl">{quest.icon}</span>
                          <h3 className={`font-semibold ${
                            quest.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {quest.title}
                          </h3>
                        </div>
                        <p className={`text-sm ${
                          quest.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
                        }`}>
                          {quest.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="outline" className="text-xs">
                            <div className={`w-2 h-2 rounded-full ${getQuestTypeColor(quest.type)} mr-1`}></div>
                            {getQuestTypeName(quest.type)}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Zap className="w-4 h-4" />
                            <span>+{quest.expReward} EXP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Player Status */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Player Status</span>
                </CardTitle>
                <CardDescription>
                  Your current level and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Level and EXP */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      Level {playerStats.level}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Experience</span>
                        <span>{playerStats.exp} / {playerStats.expToNext}</span>
                      </div>
                      <Progress 
                        value={(playerStats.exp / playerStats.expToNext) * 100} 
                        className="h-3"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-red-500">{playerStats.strength}</div>
                  <p className="text-sm text-muted-foreground">Strength (STR)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{playerStats.agility}</div>
                  <p className="text-sm text-muted-foreground">Agility (AGI)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-500">{playerStats.vitality}</div>
                  <p className="text-sm text-muted-foreground">Vitality (VIT)</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Brain className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-500">{playerStats.intelligence}</div>
                  <p className="text-sm text-muted-foreground">Intelligence (INT)</p>
                </CardContent>
              </Card>
            </div>

            {/* Achievement Summary */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Today's Achievement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{completedQuests}</div>
                    <p className="text-sm text-muted-foreground">Quests Completed</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {dailyQuests.reduce((total, quest) => total + (quest.completed ? quest.expReward : 0), 0)}
                    </div>
                    <p className="text-sm text-muted-foreground">EXP Gained</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

