import api from './apiService'
import { auth } from './firebase'

export const analyzeVoice = async (
  audioBlob,
  filename = 'recording.webm'
) => {
  const currentUser = auth.currentUser

  if (!currentUser) {
    throw new Error('User not authenticated')
  }

  const token = await currentUser.getIdToken()

  const formData = new FormData()
  formData.append('audio', audioBlob, filename)

  const response = await api.post(
    '/api/v1/voice/analyze',
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 120000,
    }
  )

  return response.data
}