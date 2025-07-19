import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

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

interface UserGamificationData {
  id?: string
  user_id: string
  daily_quests: Quest[]
  player_stats: PlayerStats
  last_quest_date: string
  created_at?: string
  updated_at?: string
}

export function useSupabaseGamification(user: User | null) {
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

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

  // Load user gamification data from Supabase
  const loadGamificationData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      const today = new Date().toDateString()

      if (!data || data.last_quest_date !== today) {
        // Create new daily quests for today
        const newQuests = generateDailyQuests()
        const newData: Omit<UserGamificationData, 'id' | 'created_at' | 'updated_at'> = {
          user_id: user.id,
          daily_quests: newQuests,
          player_stats: data?.player_stats || playerStats,
          last_quest_date: today
        }

        const { data: upsertedData, error: upsertError } = await supabase
          .from('user_gamification')
          .upsert(newData, { onConflict: 'user_id' })
          .select()
          .single()

        if (upsertError) throw upsertError

        setDailyQuests(newQuests)
        setPlayerStats(newData.player_stats)
      } else {
        // Use existing data
        setDailyQuests(data.daily_quests)
        setPlayerStats(data.player_stats)
      }
    } catch (err) {
      console.error('Error loading gamification data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load gamification data')
    } finally {
      setLoading(false)
    }
  }

  // Save gamification data to Supabase
  const saveGamificationData = async (quests: Quest[], stats: PlayerStats) => {
    if (!user) return

    try {
      const today = new Date().toDateString()
      const updateData: Partial<UserGamificationData> = {
        daily_quests: quests,
        player_stats: stats,
        last_quest_date: today
      }

      const { error: updateError } = await supabase
        .from('user_gamification')
        .update(updateData)
        .eq('user_id', user.id)

      if (updateError) throw updateError
    } catch (err) {
      console.error('Error saving gamification data:', err)
      setError(err instanceof Error ? err.message : 'Failed to save gamification data')
    }
  }

  // Complete quest and gain EXP
  const completeQuest = async (questId: number) => {
    const quest = dailyQuests.find(q => q.id === questId)
    if (!quest || quest.completed) return

    // Mark quest as completed
    const updatedQuests = dailyQuests.map(q => 
      q.id === questId ? { ...q, completed: true } : q
    )
    setDailyQuests(updatedQuests)

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
    const newExp = playerStats.exp + quest.expReward
    let newLevel = playerStats.level
    let expToNext = playerStats.expToNext
    let remainingExp = newExp

    // Check for level up
    while (remainingExp >= expToNext) {
      remainingExp -= expToNext
      newLevel++
      expToNext = newLevel * 100 // Each level requires level * 100 EXP
    }

    const updatedStats: PlayerStats = {
      level: newLevel,
      exp: remainingExp,
      expToNext: expToNext,
      strength: playerStats.strength + statGains.strength,
      agility: playerStats.agility + statGains.agility,
      vitality: playerStats.vitality + statGains.vitality,
      intelligence: playerStats.intelligence + statGains.intelligence
    }

    setPlayerStats(updatedStats)

    // Save to Supabase
    await saveGamificationData(updatedQuests, updatedStats)
  }

  // Load data when user changes
  useEffect(() => {
    loadGamificationData()
  }, [user])

  return {
    dailyQuests,
    playerStats,
    loading,
    error,
    completeQuest,
    refreshData: loadGamificationData
  }
}

