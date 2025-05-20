// src/services/ai.service.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function gerarAgendaComIA(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      "store": true,
      messages: [
        {
          role: "system", content: `Você é um assistente que cria agendas inteligentes.
            Responda SEMPRE com um array JSON e NADA mais.
            Formato:
            [
              {
                "titulo": "string",
                "descricao": "string",
                "data": "YYYY-MM-DD",
                "hora": "HH:mm"
              }
            ]
            Não inclua explicações, cumprimentos ou texto fora do JSON.` },
        { role: "user", content: prompt },
      ],
    });

    // A resposta vem no choices[0].message.content
    const texto = response.choices[0].message.content;

    // Supondo que o texto seja JSON, parse para objeto
    if (!texto) {
      throw new Error('Texto para parsing está vazio ou nulo');
    }

    const agenda = JSON.parse(texto);

    return agenda;
  } catch (error) {
    console.error("Erro ao gerar agenda com IA:", error);
    throw error;
  }
}
