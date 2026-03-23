import { authService } from './authService';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || '';

export const assistantService = {
  sendMessage: async (text: string, userEmail: string) => {
    if (!WEBHOOK_URL) {
      console.warn('n8n Webhook URL not configured');
      return { success: false, message: 'Configuração do assistente pendente.' };
    }

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeaders(),
        },
        body: JSON.stringify({
          type: 'text',
          content: text,
          userEmail,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Error sending message to assistant:', error);
      throw error;
    }
  },

  sendFile: async (file: File, userEmail: string) => {
    if (!WEBHOOK_URL) {
      console.warn('n8n Webhook URL not configured');
      return { success: false, message: 'Configuração do assistente pendente.' };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', file.type.startsWith('audio/') ? 'audio' : 'image');
    formData.append('userEmail', userEmail);
    formData.append('timestamp', new Date().toISOString());

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeaders(),
          // Don't set Content-Type, fetch will set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to send file');
      return await response.json();
    } catch (error) {
      console.error('Error sending file to assistant:', error);
      throw error;
    }
  },
};
