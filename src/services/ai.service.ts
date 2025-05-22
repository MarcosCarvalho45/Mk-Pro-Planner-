import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function gerarAgendaComIA(prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      // store: true, // remova se não usar essa opção explicitamente
      messages: [
        {
          role: "system",
          content: `Você é um assistente que cria agendas inteligentes e detalhadas para um mês inteiro.
Sempre gere tarefas para TODOS os dias do mês, começando pelo dia informado na solicitação.
Cada tarefa deve conter:
- "titulo": uma breve descrição da tarefa,
- "descricao": detalhes do que fazer,
- "dia": a data da tarefa no formato "dd-MM-yyyy",
- "diaSemana": o nome do dia da semana (ex: "segunda-feira"),
- "hora": horário para a tarefa no formato "HH:mm".

Retorne SEMPRE SOMENTE um array JSON no seguinte formato, sem qualquer texto adicional:
{
  "nomeAgenda": "string",
  "tarefas": [
    {
      "titulo": "string",
      "descricao": "string",
      "dia": "dd-MM-yyyy",
      "diaSemana": "segunda-feira",
      "hora": "HH:mm"
    }
  ]
}

O dia inicial para a agenda será sempre extraído do prompt do usuário, que conterá a data no formato dd-MM-yyyy.
Garanta que a agenda contenha tarefas para TODOS os dias do mês, iniciando pela data inicial solicitada.

NÃO inclua cumprimentos, explicações, ou texto fora do JSON.`
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
      !Array.isArray(agenda.tarefas) ||
      agenda.tarefas.some((tarefa: { titulo: any; descricao: any; dia: any; diaSemana: any; hora: any; }) =>
        typeof tarefa.titulo !== 'string' ||
        typeof tarefa.descricao !== 'string' ||
        typeof tarefa.dia !== 'string' ||
        typeof tarefa.diaSemana !== 'string' ||
        typeof tarefa.hora !== 'string'
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
