const https = require('https');

const webhookUrl = 'https://primary-production-a4fd7.up.railway.app/webhook/b3c3becf-670a-4e77-bc0b-ded510f5db89';

const testData = {
  type: 'text',
  content: 'Teste de comunicação do Chef Assistant: Olá n8n! Estou testando o cadastro de novos insumos por voz.',
  userEmail: 'ezequielrod2020@gmail.com',
  timestamp: new Date().toISOString()
};

const data = JSON.stringify(testData);

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(webhookUrl, options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('Erro no teste:', error);
});

req.write(data);
req.end();
