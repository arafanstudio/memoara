import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { GoogleDriveService } from '@/lib/googleDrive'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in with Google' },
        { status: 401 }
      )
    }

    const { action, reminders } = await request.json()
    const driveService = new GoogleDriveService(session.accessToken as string)

    switch (action) {
      case 'save':
        if (!reminders) {
          return NextResponse.json(
            { error: 'Reminders data is required for save action' },
            { status: 400 }
          )
        }
        const saveResult = await driveService.saveReminders(reminders)
        return NextResponse.json(saveResult)

      case 'load':
        const loadResult = await driveService.loadReminders()
        return NextResponse.json(loadResult)

      case 'delete':
        const deleteResult = await driveService.deleteBackup()
        return NextResponse.json(deleteResult)

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: save, load, or delete' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in with Google' },
        { status: 401 }
      )
    }

    const driveService = new GoogleDriveService(session.accessToken as string)
    const result = await driveService.loadReminders()
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Sync API GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

