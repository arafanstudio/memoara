import { google } from 'googleapis'

export class GoogleDriveService {
  private drive: any
  
  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    this.drive = google.drive({ version: 'v3', auth })
  }

  async saveReminders(reminders: any[]) {
    try {
      const fileName = 'memoara-reminders.json'
      const fileContent = JSON.stringify({
        reminders,
        lastSync: new Date().toISOString(),
        version: '1.0'
      }, null, 2)

      // Check if file already exists in appDataFolder
      const existingFiles = await this.drive.files.list({
        q: `name='${fileName}' and parents in 'appDataFolder' and trashed=false`,
        spaces: 'appDataFolder',
        fields: 'files(id, name)'
      })

      if (existingFiles.data.files && existingFiles.data.files.length > 0) {
        // Update existing file
        const fileId = existingFiles.data.files[0].id
        const response = await this.drive.files.update({
          fileId,
          media: {
            mimeType: 'application/json',
            body: fileContent
          }
        })
        return { success: true, fileId: response.data.id, action: 'updated' }
      } else {
        // Create new file
        const response = await this.drive.files.create({
          requestBody: {
            name: fileName,
            parents: ['appDataFolder'] // Store in app-specific folder
          },
          media: {
            mimeType: 'application/json',
            body: fileContent
          }
        })
        return { success: true, fileId: response.data.id, action: 'created' }
      }
    } catch (error) {
      console.error('Error saving reminders to Google Drive:', error)
      return { success: false, error: error.message }
    }
  }

  async loadReminders() {
    try {
      const fileName = 'memoara-reminders.json'
      
      // Find the file in appDataFolder
      const files = await this.drive.files.list({
        q: `name='${fileName}' and parents in 'appDataFolder' and trashed=false`,
        spaces: 'appDataFolder',
        fields: 'files(id, name, modifiedTime)'
      })

      if (!files.data.files || files.data.files.length === 0) {
        return { success: true, reminders: [], message: 'No backup found' }
      }

      const fileId = files.data.files[0].id
      
      // Download file content
      const response = await this.drive.files.get({
        fileId,
        alt: 'media'
      })

      const { reminders = [], lastSync, version } = response.data
      return {
        success: true,
        reminders,
        lastSync,
        version
      }
    } catch (error) {
      console.error('Error loading reminders from Google Drive:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteBackup() {
    try {
      const fileName = 'memoara-reminders.json'
      
      const files = await this.drive.files.list({
        q: `name='${fileName}' and parents in 'appDataFolder' and trashed=false`,
        spaces: 'appDataFolder',
        fields: 'files(id, name)'
      })

      if (files.data.files && files.data.files.length > 0) {
        const fileId = files.data.files[0].id
        await this.drive.files.delete({ fileId })
        return { success: true, message: 'Backup deleted successfully' }
      }

      return { success: true, message: 'No backup found to delete' }
    } catch (error) {
      console.error('Error deleting backup from Google Drive:', error)
      return { success: false, error: error.message }
    }
  }
}

