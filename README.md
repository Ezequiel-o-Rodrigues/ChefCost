Este projeto, o ChefCost, é um ecossistema inteligente de gestão de custos para gastronomia. Ele não é apenas um site com banco de dados; é uma aplicação "AI-First" onde a interface principal de entrada é um chat capaz de entender texto, voz e imagens.

Aqui está a explicação detalhada de como tudo funciona, desde o código no seu repositório GitHub até a automação complexa no n8n.

1. A Arquitetura Geral

O projeto é dividido em três camadas:

Frontend (Next.js/React): Onde o Chef interage. Ele captura o áudio do microfone, fotos de notas fiscais ou mensagens de texto.

Orquestrador (n8n): O "cérebro" fora do servidor. Ele recebe os dados brutos, decide o que fazer, consulta a IA e manipula o banco de dados.

Banco de Dados (PostgreSQL/Neon): Onde as receitas e insumos são armazenados de forma estruturada para o site exibir em tabelas e dashboards.

2. O Fluxo de Dados (No n8n)

Seu fluxo no n8n é um dos mais completos para esse tipo de aplicação. Vamos seguir o caminho de uma mensagem:

A. Entrada Multimodal (O início de tudo)

Quando o Chef manda algo no site, o n8n recebe via Webhook. O nó Switch inicial identifica o tipo de arquivo:

Texto: Vai direto para a limpeza.

Imagem (GPT-4o Vision): O n8n converte o base64 em arquivo e usa o modelo gpt-4o para "ler" a imagem (como uma nota fiscal de mercado ou uma foto de receita escrita à mão).

Áudio (Whisper): O áudio é convertido e enviado para o modelo de transcrição da OpenAI, transformando a voz do Chef em texto.

B. O Cérebro: AI Agent + Code JS

O nó Edit Fields centraliza tudo em uma variável chamada message. Essa mensagem entra no AI Agent (Mestre do Chef).

O Prompt: Você configurou a IA para não apenas conversar, mas para ser um gerador de JSON. Ela decide se o usuário quer:

save: Cadastrar algo.

query: Consultar dados (BI).

chat: Só conversar.

Nó Code (JavaScript): Este nó é vital. Ele pega a resposta de texto da IA e a transforma em um objeto JSON real que o n8n consegue ler campo por campo (action, data, sql).

C. A Execução (Roteamento Dinâmico)

O Switch1 lê a action definida pela IA:

Rota save: O Switch2 verifica se é um material ou recipe.

Se for Material, o nó Postgres insere nome, preço e já calcula o price_per_min_unit (preço por grama/ml).

Se for Recipe, ele preenche o cabeçalho da receita na tabela recipes.

Rota query: A IA escreve uma query SQL (ex: "Qual meu lucro médio?"). O nó Postgres executa esse comando diretamente no seu banco Neon.

Rota chat: Vai direto para a resposta final.

D. Humanização e Resposta

Se o Chef fez uma pergunta de BI (query), os dados que voltam do Postgres são números "frios". O nó Basic LLM Chain recebe esses dados e os transforma em uma frase amigável: "Chef, verifiquei aqui e seu Bolo de Cenoura é seu item mais lucrativo hoje!".

3. Integração com o Código (GitHub: ChefCost)

No seu repositório, a mágica acontece na conexão entre o chat e o Webhook do n8n.

Endpoint de Chat: No seu backend (provavelmente em /api/chat ou similar), você tem uma função que dispara um fetch(POST) para a URL do Webhook que está no início do seu n8n.

Payload de Segurança: O código envia o user_email (ou user_id) em cada requisição. Isso é fundamental, pois no n8n, a IA usa esse e-mail para garantir que o SQL gerado tenha sempre um WHERE user_id = 'email_do_chef', impedindo que um usuário veja os dados de outro.

Multimodalidade no Código: Seu frontend trata o áudio usando a MediaRecorder API e converte para base64, enviando para o n8n processar.

4. Pontos Fortes do seu Projeto

Custo Computacional Otimizado: Você usa o gpt-5-mini (ou 4o-mini) para a lógica pesada e apenas o gpt-4o para visão, economizando tokens.

Memória de Longo Prazo: O nó Postgres Chat Memory permite que o Chef diga: "Lembra daquele bolo que cadastrei ontem? Aumente o preço dele em 10%". A IA consegue buscar o contexto das conversas passadas.

BI Automatizado: O fato de a IA gerar o próprio SQL dá ao Chef um analista de dados 24h por dia dentro do chat.

Próximos Passos Sugeridos:

Cadastro de Itens da Receita: Como vimos, sua tabela recipes não tem os ingredientes. Você pode criar uma tabela recipe_items e usar o nó Split in Batches no n8n para salvar cada ingrediente vindo do array items[] da IA.

Feedback Visual: No frontend, quando o n8n responder que salvou um material, você pode fazer o site dar um "refresh" automático na tabela de materiais para o Chef ver o dado aparecendo em tempo real.

Este projeto é um excelente exemplo de SaaS com IA aplicada, resolvendo uma dor real (o tédio de preencher planilhas de custos) através de uma interface natural.
