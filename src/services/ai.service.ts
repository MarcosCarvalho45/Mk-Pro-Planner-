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
          content: `Você é um assistente especializado em gerar agendas mensais no formato do Google Calendar.

Sempre gere eventos para **todos os dias do mês**, iniciando a partir da **data fornecida no prompt** (formato: dd-MM-yyyy).  
Cada dia deve conter **eventos contínuos cobrindo todos os horários do dia**.  
Se não for especificada uma atividade para determinado horário, preencha com um horário de sono padrão (das 23h às 07h).

Cada evento deve conter os seguintes campos:

- "summary": título do evento  
- "location": local (pode ser vazio)  
- "description": descrição do evento  
- "start":  
  - "dateTime": data e hora no formato ISO 8601  
  - "timeZone": "America/Sao_Paulo"  
- "end":  
  - "dateTime": data e hora no formato ISO 8601  
  - "timeZone": "America/Sao_Paulo"  
- "attendees": lista de e-mails  
- "reminders":  
  - "useDefault": false  
  - "overrides":  
    - { "method": "email", "minutes": 30 }  
    - { "method": "popup", "minutes": 10 }

O retorno **deve ser um único JSON** com a seguinte estrutura:

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

**Não adicione nenhuma explicação ou texto adicional. Apenas o JSON puro.**`
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
