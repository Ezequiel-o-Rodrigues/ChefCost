const webhookUrl = 'https://primary-production-a4fd7.up.railway.app/webhook/b3c3becf-670a-4e77-bc0b-ded510f5db89';

async function sendTest(label, payload) {
  console.log(`\n--- Teste: ${label} ---`);
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log('Resposta:', text);
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

async function run() {
  // Teste 1: Cadastrar insumo
  await sendTest('CADASTRAR INSUMO', {
    type: 'text',
    content: 'Cadastra pra mim: Farinha de Trigo, pacote de 1kg, paguei R$4,90.',
    userEmail: 'ezequielrod2020@gmail.com',
    timestamp: new Date().toISOString()
  });

  await new Promise(r => setTimeout(r, 1500));

  // Teste 2: Consulta BI
  await sendTest('CONSULTA BI', {
    type: 'text',
    content: 'Qual é a minha receita com maior margem de lucro?',
    userEmail: 'ezequielrod2020@gmail.com',
    timestamp: new Date().toISOString()
  });

  await new Promise(r => setTimeout(r, 1500));

  // Teste 3: Conversa simples
  await sendTest('CONVERSA SIMPLES', {
    type: 'text',
    content: 'Olá! Como você pode me ajudar?',
    userEmail: 'ezequielrod2020@gmail.com',
    timestamp: new Date().toISOString()
  });
}

run();
