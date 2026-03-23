import { authService } from './authService';

export const assistantService = {
  sendMessage: async (text: string, userEmail: string) => {
    const response = await fetch(`${window.location.origin}/api/assistant`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ type: 'text', content: text, userEmail, timestamp: new Date().toISOString() }),
    });
    if (!response.ok) throw new Error('Falha ao enviar mensagem');
    return await response.json();
  },

  sendFile: async (file: File, userEmail: string) => {
    return new Promise<{ message: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const response = await fetch(`${window.location.origin}/api/assistant`, {
            method: 'POST',
            headers: authService.getAuthHeaders(),
            body: JSON.stringify({
              type: file.type.startsWith('audio/') ? 'audio' : 'image',
              fileName: file.name,
              fileData: reader.result,
              userEmail,
              timestamp: new Date().toISOString(),
            }),
          });
          if (!response.ok) throw new Error('Falha ao enviar arquivo');
          resolve(await response.json());
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  },
};
