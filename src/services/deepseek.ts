interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function generateAIReport(prompt: string): Promise<string> {
  const API_URL = 'https://api.deepseek.ai/v1/chat/completions';
  const API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

  if (!API_KEY) {
    throw new Error('DeepSeek API key não encontrada. Configure a variável de ambiente NEXT_PUBLIC_DEEPSEEK_API_KEY');
  }

  const messages: Message[] = [
    {
      role: 'user',
      content: prompt
    }
  ];

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error?.message || response.statusText;
      throw new Error(`Erro na API do DeepSeek (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Resposta inválida da API do DeepSeek');
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao chamar a API do DeepSeek:', error);
    if (error instanceof Error) {
      throw new Error(`Falha ao gerar relatório: ${error.message}`);
    }
    throw new Error('Erro inesperado ao gerar relatório');
  }
} 