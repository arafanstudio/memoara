'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ArrowLeft, User, Trophy, Zap, Shield, Heart, Brain, CheckCircle, Circle, Loader2 } from 'lucide-react'
import { useSupabaseGamification } from '@/hooks/useSupabaseGamification'
import { createClient } from '@/utils/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { Skeleton } from '@/components/ui/skeleton'

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

export default function GamificationPageSupabase({ onBack }: GamificationPageProps) {
  const [currentView, setCurrentView] = useState<'quests' | 'status'>('quests')
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  
  const supabase = createClient()
  const { dailyQuests, playerStats, loading, error, completeQuest } = useSupabaseGamification(user)

  // Demo data for non-authenticated users
  const demoQuests: Quest[] = [
    { id: 1, title: 'Push Up 10x', description: 'Complete 10 push-ups to build strength', type: 'exercise', expReward: 25, completed: false, icon: '💪' },
    { id: 2, title: 'Drink 8 Glasses of Water', description: 'Stay hydrated throughout the day', type: 'health', expReward: 20, completed: false, icon: '💧' },
    { id: 3, title: 'Read for 30 Minutes', description: 'Read a book or educational material', type: 'productivity', expReward: 35, completed: false, icon: '📚' },
    { id: 4, title: 'Meditate for 10 Minutes', description: 'Practice mindfulness and meditation', type: 'health', expReward: 30, completed: false, icon: '🧘' }
  ]

  const demoStats: PlayerStats = {
    level: 1,
    exp: 0,
    expToNext: 100,
    strength: 10,
    agility: 10,
    vitality: 10,
    intelligence: 10
  }

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setAuthLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setAuthLoading(false)
        if (session?.user) {
          setShowLoginDialog(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Sign in with Google
  const signInWithGoogle = async () => {
    setIsSigningIn(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      console.error('Error signing in with Google:', error)
      setIsSigningIn(false)
    }
  }

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  // Handle quest completion - show login dialog if not authenticated
  const handleQuestComplete = (questId: number) => {
    if (!user) {
      setShowLoginDialog(true)
      return
    }
    completeQuest(questId)
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

  // Use real data if authenticated, demo data if not
  const currentQuests = user ? dailyQuests : demoQuests
  const currentStats = user ? playerStats : demoStats
  const isLoading = user ? loading : false

  const completedQuests = currentQuests.filter(q => q.completed).length
  const totalQuests = currentQuests.length
  const completionPercentage = totalQuests > 0 ? (completedQuests / totalQuests) * 100 : 0

  // Skeleton loading components
  const QuestSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const StatCardSkeleton = () => (
    <Card>
      <CardContent className="p-4 text-center">
        <Skeleton className="h-6 w-6 mx-auto mb-2" />
        <Skeleton className="h-8 w-12 mx-auto mb-1" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </CardContent>
    </Card>
  );

  // Show error state only for authenticated users
  if (user && error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Gamification</h1>
                <p className="text-sm text-muted-foreground">Level up your daily habits</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="w-5 h-5" />
              <span>Sign in to Continue</span>
            </DialogTitle>
            <DialogDescription>
              Sign in to save your progress and track your daily quests
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Button 
              onClick={signInWithGoogle} 
              className="w-full"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in with Google'
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowLoginDialog(false)}
              className="w-full"
            >
              Continue Browsing
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header - Always visible, only Sign In/Out button shows loading */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Gamification</h1>
                <p className="text-sm text-muted-foreground">Level up your daily habits</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView(currentView === 'quests' ? 'status' : 'quests')}
              >
                {currentView === 'quests' ? <User className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
              </Button>
              {authLoading ? (
                <Skeleton className="h-9 w-20 rounded-md" />
              ) : user ? (
                <Button variant="ghost" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowLoginDialog(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {currentView === 'quests' ? (
          <>
            {/* Daily Quest Progress - Bagian dinamis dibuat skeleton */}
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
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>

            {/* Daily Quests - Bagian dinamis dibuat skeleton */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Today's Quests</h2>
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={`quest-skeleton-${i}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center space-x-2">
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-5 w-48" />
                          </div>
                          <Skeleton className="h-4 w-64" />
                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center space-x-1">
                              <Skeleton className="h-3 w-3 rounded-full" />
                              <Skeleton className="h-5 w-16" />
                            </div>
                            <div className="flex items-center space-x-1">
                              <Skeleton className="h-4 w-4" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                currentQuests.map(quest => (
                  <Card 
                    key={quest.id} 
                    className={`transition-all duration-300 ${
                      quest.completed ? 'opacity-70 bg-green-50 dark:bg-green-900/20' : 'hover:shadow-md'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`rounded-full border transition-all duration-300 ${
                            quest.completed ? 'bg-green-100 dark:bg-green-900 border-green-500' : ''
                          }`}
                          onClick={() => handleQuestComplete(quest.id)}
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
                ))
              )}
            </div>
          </>
        ) : (
          <>
            {/* Player Status - Bagian dinamis dibuat skeleton */}
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
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Skeleton className="h-10 w-24 mx-auto mb-4" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        Level {currentStats.level}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Experience</span>
                          <span>{currentStats.exp} / {currentStats.expToNext}</span>
                        </div>
                        <Progress 
                          value={(currentStats.exp / currentStats.expToNext) * 100} 
                          className="h-3"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats - Bagian dinamis dibuat skeleton */}
            <div className="grid grid-cols-2 gap-4">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={`stat-skeleton-${i}`}>
                    <CardContent className="p-4 text-center">
                      <Skeleton className="h-6 w-6 mx-auto mb-2" />
                      <Skeleton className="h-8 w-12 mx-auto mb-1" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Zap className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="text-2xl font-bold text-red-500">{currentStats.strength}</div>
                      <p className="text-sm text-muted-foreground">Strength (STR)</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Shield className="w-6 h-6 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold text-blue-500">{currentStats.agility}</div>
                      <p className="text-sm text-muted-foreground">Agility (AGI)</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Heart className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold text-green-500">{currentStats.vitality}</div>
                      <p className="text-sm text-muted-foreground">Vitality (VIT)</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Brain className="w-6 h-6 text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold text-purple-500">{currentStats.intelligence}</div>
                      <p className="text-sm text-muted-foreground">Intelligence (INT)</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Achievement Summary - Bagian dinamis dibuat skeleton */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Today's Achievement</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <Skeleton className="h-8 w-12 mx-auto mb-1" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                    <div>
                      <Skeleton className="h-8 w-12 mx-auto mb-1" />
                      <Skeleton className="h-4 w-24 mx-auto" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">{completedQuests}</div>
                      <p className="text-sm text-muted-foreground">Quests Completed</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {currentQuests.reduce((total, quest) => total + (quest.completed ? quest.expReward : 0), 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">EXP Gained</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}