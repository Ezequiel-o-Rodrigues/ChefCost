const webhookUrl = 'https://primary-production-a4fd7.up.railway.app/webhook/b3c3becf-670a-4e77-bc0b-ded510f5db89';

const testData = {
  type: 'text',
  content: 'Cadastrar açúcar, pacote de 1kg, paguei 5 reais.',
  userEmail: 'ezequielrod2020@gmail.com',
  timestamp: new Date().toISOString()
};

async function test() {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log('Resposta:', text);
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

test();
