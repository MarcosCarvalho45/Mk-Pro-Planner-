import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function gerarAgendaComIA(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um assistente que cria agendas no formato do Google Calendar para um mês inteiro.
Sempre gere eventos para TODOS os dias do mês, começando pela data informada no prompt.
Cada evento deve conter:
- "summary": título do evento,
- "location": local (pode ser vazio),
- "description": descrição do evento,
- "start": { "dateTime": ISO 8601, "timeZone": "America/Sao_Paulo" },
- "end": { "dateTime": ISO 8601, "timeZone": "America/Sao_Paulo" },
- "attendees": lista de emails,
- "reminders": { "useDefault": false, "overrides": [ { "method": "email", "minutes": 30 }, { "method": "popup", "minutes": 10 } ] }

Retorne SEMPRE um JSON único, sem texto adicional, no formato:

{
  "nomeAgenda": "string",
  "eventos": [
    {
      "summary": "string",
      "location": "string",
      "description": "string",
      "start": {
        "dateTime": "2025-05-23T10:00:00-03:00",
        "timeZone": "America/Sao_Paulo"
      },
      "end": {
        "dateTime": "2025-05-23T11:00:00-03:00",
        "timeZone": "America/Sao_Paulo"
      },
      "attendees": [
        { "email": "usuario1@example.com" },
        { "email": "usuario2@example.com" }
      ],
      "reminders": {
        "useDefault": false,
        "overrides": [
          { "method": "email", "minutes": 30 },
          { "method": "popup", "minutes": 10 }
        ]
      }
    }
  ]
}

A data inicial será extraída do prompt, no formato dd-MM-yyyy.
Não inclua nada além do JSON!`
        },
        { role: "user", content: prompt },
      ],
    });

    const texto = response.choices[0].message.content;

    if (!texto) {
      throw new Error('Texto para parsing está vazio ou nulo');
    }

    let agenda;
    try {
      agenda = JSON.parse(texto);
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON da resposta da IA:", parseError);
      console.error("Texto recebido:", texto);
      throw parseError;
    }

    if (
      !agenda ||
      typeof agenda.nomeAgenda !== 'string' ||
      !Array.isArray(agenda.eventos) ||
      agenda.eventos.some((evento: { summary: any; start: any; end: any; }) =>
        typeof evento.summary !== 'string' ||
        typeof evento.start !== 'object' ||
        typeof evento.end !== 'object'
      )
    ) {
      throw new Error('Formato inválido da agenda gerada pela IA');
    }

    return agenda;
  } catch (error) {
    console.error("Erro ao gerar agenda com IA:", error);
    throw error;
  }
}
