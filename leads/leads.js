let NomeDoContato = "";
let NomeDaEmpresa = "";
let EmailDoContato = "";
let TextoLeadConsultor = ""; // Variável global para armazenar o texto especial
let EmailFormatado = "";
var textoFormatadoGlobal = ""; // Variável global para armazenar o texto formatado
let PromptGPTFormatado = "";

// Definição das constantes de interesse
const DEFAULT_SERVICES = {
  BACKGROUND_CHECK: "Background Check",
  CONSULTORIA: "Consultoria de Ti",
  DESENVOLVIMENTO_MOBILE: "Desenvolvimento Mobile",
  DESENVOLVIMENTO_WEB: "Desenvolvimento Web",
  E_COMMERCE: "e-Commerce",
  EAD_MOODLE: "EAD - e-Learning Moodle",
  HEADHUNTING: "Headhunting de Ti",
  HOSPEDAGEM: "Hospedagem",
  INTELIGENCIA_ARTIFICIAL: "Inteligência Artificial",
  OUTSOURCING: "Outsourcing de Ti",
  RPA: "Robotic Process Automation (RPA)",
};

// Gerar DEFAULT_INTERESTS adicionando "Interesse: " antes de cada serviço
const DEFAULT_INTERESTS = Object.fromEntries(
  Object.entries(DEFAULT_SERVICES).map(([key, value]) => [
    key,
    `Interesse: ${value}`,
  ])
);

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("inputText").addEventListener("input", function () {
    identificarInformacoesAutomaticamente(); // Função existente
    obterInformacoesEconodata();
    formatarTextoLeadConsultor(); // Chamada da função para formatar e exibir detalhes do lead
    formatarPromptGPT();
  });

  document
    .getElementById("copiarTextoEspecial")
    .addEventListener("click", copiarTextoEspecial);
  document
    .getElementById("copiarLeadFaleCom")
    .addEventListener("click", copiarLeadFaleComParaClipboard);
});

// Função interna para extrair e formatar o nome
function obterNomeDoContato(texto) {
  const nomeRegex = /Nome: (.+)|Name: (.+)/i;
  const nomeMatch = texto.match(nomeRegex);
  if (nomeMatch) {
    const nome = nomeMatch[1] || nomeMatch[2];
    return nome
      .split(" ")
      .map(
        (palavra) =>
          palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
      )
      .join(" ");
  } else {
    return "não informado";
  }
}

// Função interna para extrair e formatar a empresa
function obterEmpresa(texto) {
  const empresaRegex = /Empresa: (.+)|Enterprise: (.+)/i;
  const empresaMatch = texto.match(empresaRegex);
  if (empresaMatch) {
    const empresa = empresaMatch[1] || empresaMatch[2];

    // Regex para encontrar partes entre aspas simples
    const upperCaseParts = empresa.match(/'([^']+)'/g) || [];

    // Remover aspas simples e manter maiúsculas
    const upperCaseWords = upperCaseParts.map((part) => part.replace(/'/g, ""));

    return empresa
      .split(" ")
      .map((palavra) => {
        // Verifica se a palavra está na lista de palavras que devem ficar em maiúsculas
        if (upperCaseWords.includes(palavra.replace(/'/g, ""))) {
          return palavra.replace(/'/g, "").toUpperCase();
        } else {
          return (
            palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
          );
        }
      })
      .join(" ");
  } else {
    return "não informado";
  }
}

// Função interna para extrair o perfil do LinkedIn
function obterLinkedin(texto) {
  const linkedinRegex = /https:\/\/www\.linkedin\.com\/in\/[^/?\s]+/i;
  const linkedinMatch = texto.match(linkedinRegex);
  if (linkedinMatch) {
    return linkedinMatch[0].split("?")[0];
  } else {
    return "ainda não identificado";
  }
}

// Função principal que formata o nome
function copiarNome() {
  const texto = document.getElementById("inputText").value;
  const nomeFormatado = obterNomeDoContato(texto);
  if (nomeFormatado) {
    NomeDoContato = nomeFormatado;
    copiarParaClipboard(nomeFormatado);
  } else {
    copiarParaClipboard("Nome nao identificado");
    mostrarPopUp("Nome nao identificado");
  }
}

// Função principal que formata a empresa
function copiarEmpresa() {
  const texto = document.getElementById("inputText").value;
  const empresaFormatada = obterEmpresa(texto);
  if (empresaFormatada) {
    NomeDaEmpresa = empresaFormatada;
    copiarParaClipboard(empresaFormatada);
  } else {
    copiarParaClipboard("Sem informação");
    mostrarPopUp("Empresa não identificada.");
  }
}

// Função principal que formata o perfil do LinkedIn
function copiarLinkedin() {
  const texto = document.getElementById("inputText").value;
  const perfilLinkedin = obterLinkedin(texto);
  if (perfilLinkedin) {
    copiarParaClipboard(perfilLinkedin);
  } else {
    copiarParaClipboard("Linkedin não identificado.");
    mostrarPopUp("Linkedin não identificado");
  }
}

// Função para formatar o assunto internamente
function obterAssunto(texto) {
  // Encontrar a última ocorrência de "Agence"
  const ultimaOcorrenciaAgence = texto.lastIndexOf("Agence");
  if (ultimaOcorrenciaAgence === -1) {
    return "não encontrado";
  }

  // Encontrar a ocorrência de "Comentários:" antes da última ocorrência de "Agence"
  const comentariosIndex = texto.lastIndexOf(
    "Comentários:",
    ultimaOcorrenciaAgence
  );
  if (comentariosIndex === -1) {
    return "não encontrado";
  }

  // Capturar o texto entre "Comentários:" e a última ocorrência de "Agence"
  let assunto = texto
    .substring(comentariosIndex + "Comentários:".length, ultimaOcorrenciaAgence)
    .trim();

  // Aplicar trim em todas as linhas e substituir múltiplas quebras de linha por duas quebras de linha
  assunto = trimLinhasESubstituirQuebras(assunto);

  // Formatar o texto capturado
  let assuntoFormatado = assunto.toLowerCase();
  assuntoFormatado = assuntoFormatado.replace(
    /([.!?]\s*)([a-z])/g,
    (match, p1, p2) => p1 + p2.toUpperCase()
  );
  assuntoFormatado = assuntoFormatado.replace(
    /\n\n([a-z])/g,
    (match, p1) => "\n\n" + p1.toUpperCase()
  ); // Capitaliza o início de cada parágrafo
  assuntoFormatado = assuntoFormatado.replace("© 2024", "").trim();
  return assuntoFormatado.charAt(0).toUpperCase() + assuntoFormatado.slice(1);
}

function trimLinhasESubstituirQuebras(texto) {
  // Aplica trim em todas as linhas e substitui múltiplas quebras de linha por duas quebras de linha
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .join("\n\n")
    .replace(/\n{3,}/g, "\n\n"); // Garante que não haja mais de duas quebras de linha consecutivas
}

function substituirQuebrasLinha(texto) {
  // Substitui múltiplas quebras de linha por duas quebras de linhas
  return texto.replace(/\n+/g, "\n\n");
}

// Função principal que usa a função interna para formatar o assunto
function copiarAssunto() {
  const texto = document.getElementById("inputText").value;
  const assuntoFormatado = obterAssunto(texto);
  if (assuntoFormatado) {
    copiarParaClipboard(assuntoFormatado);
    mostrarPopUp("Assunto formatado e copiado para a área de transferência");
  } else {
    copiarParaClipboard("Campo de assunto não encontrado.");
    mostrarPopUp("Campo de assunto não encontrado.");
  }
}

function copiarParaClipboard(texto) {
  navigator.clipboard
    .writeText(texto)
    .then(() => {
      mostrarPopUp(
        "Texto copiado: " +
          texto.substring(0, 30) +
          (texto.length > 30 ? "..." : "")
      );
    })
    .catch((err) => {
      console.error("Erro ao copiar texto: ", err);
    });
}

function mostrarPopUp(mensagem) {
  let popUp = document.querySelector(".pop-up");
  if (!popUp) {
    popUp = document.createElement("div");
    popUp.className = "pop-up";
    document.body.appendChild(popUp);
  }
  popUp.textContent = mensagem;

  popUp.classList.add("active");

  setTimeout(() => {
    popUp.classList.remove("active");
  }, 1000);
}

function obterEmail(texto) {
  // Lista de expressões regulares para capturar o e-mail
  const regexList = [
    /Email lead:\s*([\w.-]+@[\w.-]+\.\w+)/i,
    /E-mail lead:\s*([\w.-]+@[\w.-]+\.\w+)/i,
    /Email:\s*([\w.-]+@[\w.-]+\.\w+)/i,
    /E-mail:\s*([\w.-]+@[\w.-]+\.\w+)/i,
  ];

  for (const regex of regexList) {
    const emailMatch = texto.match(regex);
    if (emailMatch && emailMatch[1]) {
      return emailMatch[1].toLowerCase();
    }
  }

  return "não informado";
}

// Função principal que formata o e-mail
function copiarEmail() {
  const texto = document.getElementById("inputText").value;
  const emailFormatado = obterEmail(texto);
  if (emailFormatado) {
    EmailDoContato = emailFormatado; // Atualiza a variável global corretamente
    EmailFormatado = emailFormatado; // Mantém esta linha se precisar do email formatado em minúsculas em outra parte do código
    copiarParaClipboard(emailFormatado);
  } else {
    copiarParaClipboard("email@email.com");
    mostrarPopUp("e-mail não encontrado.");
  }
}

function formatarTelefone(numeros) {
  const dddsBrasil = {
    11: "São Paulo - SP",
    12: "São José dos Campos - SP",
    13: "Santos - SP",
    14: "Bauru - SP",
    15: "Sorocaba - SP",
    16: "Ribeirão Preto - SP",
    17: "São José do Rio Preto - SP",
    18: "Presidente Prudente - SP",
    19: "Campinas - SP",
    21: "Rio de Janeiro - RJ",
    22: "Campos dos Goytacazes - RJ",
    24: "Volta Redonda - RJ",
    27: "Vila Velha/Vitória - ES",
    28: "Cachoeiro de Itapemirim - ES",
    31: "Belo Horizonte - MG",
    32: "Juiz de Fora - MG",
    33: "Governador Valadares - MG",
    34: "Uberlândia - MG",
    35: "Poços de Caldas - MG",
    37: "Divinópolis - MG",
    38: "Montes Claros - MG",
    41: "Curitiba - PR",
    42: "Ponta Grossa - PR",
    43: "Londrina - PR",
    44: "Maringá - PR",
    45: "Foz do Iguaçú - PR",
    46: "Francisco Beltrão/Pato Branco - PR",
    47: "Joinville - SC",
    48: "Florianópolis - SC",
    49: "Chapecó - SC",
    51: "Porto Alegre - RS",
    53: "Pelotas - RS",
    54: "Caxias do Sul - RS",
    55: "Santa Maria - RS",
    61: "Brasília - DF",
    62: "Goiânia - GO",
    63: "Palmas - TO",
    64: "Rio Verde - GO",
    65: "Cuiabá - MT",
    66: "Rondonópolis - MT",
    67: "Campo Grande - MS",
    68: "Rio Branco - AC",
    69: "Porto Velho - RO",
    71: "Salvador - BA",
    73: "Ilhéus - BA",
    74: "Juazeiro - BA",
    75: "Feira de Santana - BA",
    77: "Barreiras - BA",
    79: "Aracaju - SE",
    81: "Recife - PE",
    82: "Maceió - AL",
    83: "João Pessoa - PB",
    84: "Natal - RN",
    85: "Fortaleza - CE",
    86: "Teresina - PI",
    87: "Petrolina - PE",
    88: "Juazeiro do Norte - CE",
    89: "Picos - PI",
    91: "Belém - PA",
    92: "Manaus - AM",
    93: "Santarém - PA",
    94: "Marabá - PA",
    95: "Boa Vista - RR",
    96: "Macapá - AP",
    97: "Coari - AM",
    98: "São Luís - MA",
    99: "Imperatriz - MA",
  };

  const ddiList = {
    1: "Estados Unidos/Canadá",
    7: "Rússia/Cazaquistão",
    20: "Egito",
    27: "África do Sul",
    30: "Grécia",
    31: "Países Baixos",
    32: "Bélgica",
    33: "França",
    34: "Espanha",
    36: "Hungria",
    39: "Itália",
    40: "Romênia",
    41: "Suíça",
    43: "Áustria",
    44: "Reino Unido",
    45: "Dinamarca",
    46: "Suécia",
    47: "Noruega",
    48: "Polônia",
    49: "Alemanha",
    51: "Peru",
    52: "México",
    53: "Cuba",
    54: "Argentina",
    55: "Brasil",
    56: "Chile",
    57: "Colômbia",
    58: "Venezuela",
    60: "Malásia",
    61: "Austrália",
    62: "Indonésia",
    63: "Filipinas",
    64: "Nova Zelândia",
    65: "Cingapura",
    66: "Tailândia",
    81: "Japão",
    82: "Coreia do Sul",
    84: "Vietnã",
    86: "China",
    90: "Turquia",
    91: "Índia",
    92: "Paquistão",
    93: "Afeganistão",
    94: "Sri Lanka",
    95: "Mianmar",
    98: "Irã",
    212: "Marrocos",
    213: "Argélia",
    216: "Tunísia",
    218: "Líbia",
    220: "Gâmbia",
    221: "Senegal",
    222: "Mauritânia",
    223: "Mali",
    224: "Guiné",
    225: "Costa do Marfim",
    226: "Burkina Faso",
    227: "Níger",
    228: "Togo",
    229: "Benim",
    230: "Maurício",
    231: "Libéria",
    232: "Serra Leoa",
    233: "Gana",
    234: "Nigéria",
    235: "Chade",
    236: "República Centro-Africana",
    237: "Camarões",
    238: "Cabo Verde",
    239: "São Tomé e Príncipe",
    240: "Guiné Equatorial",
    241: "Gabão",
    242: "Congo",
    243: "República Democrática do Congo",
    244: "Angola",
    245: "Guiné-Bissau",
    246: "Diego Garcia",
    247: "Ascensão",
    248: "Seychelles",
    249: "Sudão",
    250: "Ruanda",
    251: "Etiópia",
    252: "Somália",
    253: "Djibouti",
    254: "Quênia",
    255: "Tanzânia",
    256: "Uganda",
    257: "Burundi",
    258: "Moçambique",
    260: "Zâmbia",
    261: "Madagascar",
    262: "Reunião",
    263: "Zimbábue",
    264: "Namíbia",
    265: "Malawi",
    266: "Lesoto",
    267: "Botsuana",
    268: "Suazilândia",
    269: "Comores",
    290: "Santa Helena",
    291: "Eritreia",
    297: "Aruba",
    298: "Ilhas Faroé",
    299: "Groenlândia",
    350: "Gibraltar",
    351: "Portugal",
    352: "Luxemburgo",
    353: "Irlanda",
    354: "Islândia",
    355: "Albânia",
    356: "Malta",
    357: "Chipre",
    358: "Finlândia",
    359: "Bulgária",
    370: "Lituânia",
    371: "Letônia",
    372: "Estônia",
    373: "Moldávia",
    374: "Armênia",
    375: "Bielorrússia",
    376: "Andorra",
    377: "Mônaco",
    378: "San Marino",
    379: "Cidade do Vaticano",
    380: "Ucrânia",
    381: "Sérvia",
    382: "Montenegro",
    383: "Kosovo",
    385: "Croácia",
    386: "Eslovênia",
    387: "Bósnia e Herzegovina",
    389: "Macedônia do Norte",
    420: "República Tcheca",
    421: "Eslováquia",
    423: "Liechtenstein",
    500: "Ilhas Malvinas",
    501: "Belize",
    502: "Guatemala",
    503: "El Salvador",
    504: "Honduras",
    505: "Nicarágua",
    506: "Costa Rica",
    507: "Panamá",
    508: "São Pedro e Miquelon",
    509: "Haiti",
    590: "Guadalupe",
    591: "Bolívia",
    592: "Guiana",
    593: "Equador",
    594: "Guiana Francesa",
    595: "Paraguai",
    596: "Martinica",
    597: "Suriname",
    598: "Uruguai",
    599: "Antilhas Holandesas",
    670: "Timor-Leste",
    672: "Antártida",
    673: "Brunei",
    674: "Nauru",
    675: "Papua-Nova Guiné",
    676: "Tonga",
    677: "Ilhas Salomão",
    678: "Vanuatu",
    679: "Fiji",
    680: "Palau",
    681: "Wallis e Futuna",
    682: "Ilhas Cook",
    683: "Niue",
    685: "Samoa",
    686: "Kiribati",
    687: "Nova Caledônia",
    688: "Tuvalu",
    689: "Polinésia Francesa",
    690: "Tokelau",
    691: "Micronésia",
    692: "Ilhas Marshall",
    850: "Coreia do Norte",
    852: "Hong Kong",
    853: "Macau",
    855: "Camboja",
    856: "Laos",
    880: "Bangladesh",
    886: "Taiwan",
    960: "Maldivas",
    961: "Líbano",
    962: "Jordânia",
    963: "Síria",
    964: "Iraque",
    965: "Kuwait",
    966: "Arábia Saudita",
    967: "Iêmen",
    968: "Omã",
    970: "Palestina",
    971: "Emirados Árabes Unidos",
    972: "Israel",
    973: "Bahrein",
    974: "Catar",
    975: "Butão",
    976: "Mongólia",
    977: "Nepal",
    992: "Tajiquistão",
    993: "Turcomenistão",
    994: "Azerbaijão",
    995: "Geórgia",
    996: "Quirguistão",
    998: "Uzbequistão",
  };

  // Remover caracteres não numéricos
  numeros = numeros.replace(/\D/g, "");

  // Verificar se é um número brasileiro
  if (numeros.startsWith("55")) {
    const ddd = numeros.substring(2, 4);
    if (dddsBrasil.hasOwnProperty(ddd)) {
      const localidade = dddsBrasil[ddd];
      const formatado = "+55 " + ddd + " " + numeros.substring(4);
      return { formatado, localidade, ddd, pais: "Brasil" };
    } else {
      return {
        formatado: numeros,
        localidade: "DDD não reconhecido",
        ddd: null,
        pais: "Brasil",
      };
    }
  }

  // Se não for brasileiro, verificar outros DDIs
  let ddi = "";
  let pais = "";
  for (let i = 3; i > 0; i--) {
    let possibleDDI = numeros.substring(0, i);
    if (ddiList.hasOwnProperty(possibleDDI)) {
      ddi = possibleDDI;
      pais = ddiList[ddi];
      break;
    }
  }

  if (ddi !== "") {
    // Número internacional
    const formatado = "+" + ddi + " " + numeros.substring(ddi.length);
    return { formatado, localidade: pais, ddd: null, pais: pais };
  } else {
    // Número não reconhecido
    return {
      formatado: numeros,
      localidade: "Número não reconhecido",
      ddd: null,
      pais: "Desconhecido",
    };
  }
}

// Função principal que usa a função interna para formatar o telefone
function copiarTelefone() {
  const texto = document.getElementById("inputText").value;
  const telefoneRegex = /Telefone:.*?(\d[\d\s().-]*)/i;
  const telefoneMatch = texto.match(telefoneRegex);

  if (telefoneMatch) {
    let numeros = telefoneMatch[1].replace(/\D/g, "");
    const resultado = formatarTelefone(numeros);

    copiarParaClipboard(resultado.formatado);

    let mensagem = `Telefone formatado e copiado com sucesso!`;
    if (resultado.pais === "Brasil") {
      mensagem += ` País: Brasil, Localidade: ${resultado.localidade}`;
    } else {
      mensagem += ` País: ${resultado.pais}`;
    }

    mostrarPopUp(mensagem);
  } else {
    copiarParaClipboard("0000000000000");
    mostrarPopUp("Telefone não encontrado");
  }
}

function obterTelefoneFormatado(texto) {
  const telefoneRegex = /Telefone:.*?(\d[\d\s().-]*)/i;
  const telefoneMatch = texto.match(telefoneRegex);

  if (telefoneMatch && telefoneMatch[1].trim() !== "") {
    let numeros = telefoneMatch[1].replace(/\D/g, "");
    const resultado = formatarTelefone(numeros);
    return {
      telefone: resultado.formatado,
      localidade: resultado.localidade,
      ddd: resultado.ddd,
      pais: resultado.pais,
    };
  } else {
    return {
      telefone: "não informado",
      localidade: "",
      ddd: null,
      pais: "",
    };
  }
}

// Função interna para extrair e formatar a localidade a partir do telefone
function obterLocalidade(texto) {
  const telefoneInfo = obterTelefoneFormatado(texto);

  if (telefoneInfo.telefone !== "não informado") {
    if (telefoneInfo.pais === "Brasil") {
      return telefoneInfo.localidade; // Retorna apenas a localidade, sem o DDD
    } else {
      return telefoneInfo.pais;
    }
  } else {
    return null;
  }
}

// Função principal que formata a localidade
function copiarLocalidade() {
  const texto = document.getElementById("inputText").value;
  const localidadeTexto = obterLocalidade(texto);
  if (localidadeTexto) {
    copiarParaClipboard(localidadeTexto);
    mostrarPopUp("Localidade copiada com sucesso!");
  } else {
    copiarParaClipboard("Localidade não identificada.");
    mostrarPopUp("Localidade não identificada");
  }
}

function obterOrigem(texto) {
  const textoMinusculo = texto.toLowerCase();

  const originMappings = [
    {
      triggers: ["agencechatbot76@gmail.com", "origem: chatbot"],
      value: "Origem: Inbound Chatbot",
    },
    {
      triggers: ["origem: telefone", "origem: ligação"],
      value: "Origem: Ligação ao Escritório",
    },
    {
      triggers: ["origem: whats"],
      value: "Origem: Inbound Whatsapp",
    },
    {
      triggers: ["origem: inbound lp mobile"],
      value: "Origem: Formulário LP Mobile",
    },
    {
      triggers: ["falecom@agence.com.br"],
      value: "Origem: Inbound E-mail",
    },
    {
      triggers: ["fale conosco - agence"],
      value: "Origem: Formulário Fale Conosco",
    },
    {
      triggers: ["[leads] [pop-up", "Identificador: pop-up-"],
      value: "Origem: Formulário Pop-up",
    },
    {
      triggers: ["novo lead gerado pela lp de inteligência artificial"],
      value: "Origem: Formulário LP IA",
    },
    {
      triggers: ["origem: outbound e-mail", "origem: outbound email"],
      value: "Origem: Outbound E-mail",
    },
    {
      triggers: ["origem: outbound linkedin"],
      value: "Origem: Outbound Linkedin",
    },
    {
      triggers: ["origem: outbound bdr"],
      value: "Origem: Outbound BDR",
    },
  ];

  for (const mapping of originMappings) {
    for (const trigger of mapping.triggers) {
      if (textoMinusculo.includes(trigger)) {
        return mapping.value;
      }
    }
  }

  return "Origem: não identificada";
}

function obterInteresse(texto) {
  // Definição dos padrões para extração inicial do interesse
  const extractors = [
    { regex: /Necessidade:\s*(.+)/i },
    { regex: /Estou interessado em:\s*(.+)/i },
    { regex: /Identificador: pop-up-\s*(.+)/i },
  ];

  // Definição dos mapeamentos de listas de valores para interesses padronizados
  const interestMappings = [
    {
      triggers: [
        "rpa",
        "automação",
        "automation",
        "automatización",
        "automacao",
      ],
      value: DEFAULT_SERVICES.RPA,
    },
    {
      triggers: ["consultoria", "consulting", "consultoría"],
      value: DEFAULT_SERVICES.CONSULTORIA,
    },
    {
      triggers: ["aplicativo", "mobile", "app", "aplicaciones"],
      value: DEFAULT_SERVICES.DESENVOLVIMENTO_MOBILE,
    },
    {
      triggers: ["headhunting", "recrutamento", "reclutamiento", "selección"],
      value: DEFAULT_SERVICES.HEADHUNTING,
    },
    {
      triggers: ["outsourcing", "alocação", "asignación", "alocacao"],
      value: DEFAULT_SERVICES.OUTSOURCING,
    },
    {
      triggers: ["web"],
      value: DEFAULT_SERVICES.DESENVOLVIMENTO_WEB,
    },
    {
      triggers: ["commerce"],
      value: DEFAULT_SERVICES.E_COMMERCE,
    },
    {
      triggers: ["moodle", "e-learning"],
      value: DEFAULT_SERVICES.EAD_MOODLE,
    },
    {
      triggers: ["alojamiento", "hospedagem", "hosting"],
      value: DEFAULT_SERVICES.HOSPEDAGEM,
    },
    {
      triggers: ["soluções em ia", "artificial intelligence", "intel"],
      value: DEFAULT_SERVICES.INTELIGENCIA_ARTIFICIAL,
    },
    {
      triggers: [
        "verificación",
        "background check",
        "verificação",
        "verificacao",
      ],
      value: DEFAULT_SERVICES.BACKGROUND_CHECK,
    },
  ];

  // Função auxiliar para extrair o interesse inicial
  const extrairInteresseInicial = (texto, extractors) => {
    for (const extractor of extractors) {
      const match = texto.match(extractor.regex);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  };

  // Função auxiliar para mapear o interesse com base nas listas de triggers
  // Agora, somente interesses que possuírem triggers mapeados serão permitidos
  const mapearInteresse = (interesse, mappings) => {
    const interesseLower = interesse.toLowerCase();
    for (const mapping of mappings) {
      for (const trigger of mapping.triggers) {
        if (interesseLower.includes(trigger.toLowerCase())) {
          return mapping.value;
        }
      }
    }
    return "não informado"; // Retorna "não informado" se não encontrar mapeamento
  };

  // Extração do interesse inicial
  let interesse = extrairInteresseInicial(texto, extractors);

  // Caso não tenha sido extraído, verificar condição específica
  if (
    !interesse &&
    texto.includes("© 2024 Agence. Todos os direitos reservados.")
  ) {
    interesse = "Desenvolvimento Mobile";
  }

  // Definir o valor padrão caso não seja encontrado nenhum interesse
  interesse = interesse || "não informado";

  // Mapeamento do interesse para a versão padronizada, somente se for mapeado
  const interessePadronizado = mapearInteresse(interesse, interestMappings);

  return `Interesse: ${interessePadronizado}`;
}

function obterPorte(texto) {
  const linhas = texto.split("\n");
  const portesValidos = [
    "Micro",
    "Pequeno",
    "Médio",
    "Grande",
    "Individual",
    "Desconhecido",
  ];

  for (let i = 0; i < linhas.length - 1; i++) {
    if (linhas[i].trim() === "Porte") {
      const portePotencial = linhas[i + 1].trim();
      if (portesValidos.includes(portePotencial)) {
        return `Porte da Empresa: ${portePotencial}`;
      }
    }
  }

  return "Porte da Empresa: não informado";
}

// Função para obter a quantidade de funcionários
function limparQuantidade(valor) {
  // Remove espaços extras, quebra em linha e remove a palavra "funcionários" se estiver no final
  let quantidade = valor.replace(/^[\s\n]+|[\s\n]+$/g, "").trim();
  quantidade = quantidade.split(/\r?\n/)[0].trim();
  quantidade = quantidade.replace(/funcionários\s*$/i, "").trim();
  return quantidade;
}

function obterQuantidadeFuncionarios(texto) {
  // Lista de regexes para capturar a quantidade de funcionários
  const regexes = [
    /icone Quantidade de Funcionários\s*Quantidade de Funcionários\s*([\s\S]*?)(?=icone like|icone dislike|$)/i,
    /Quantidade de Funcionários\s*:\s*([^<\n\r]+)/i,
    /(\d+\s*a\s*\d+)\s*funcionários/i,
    /(\d{1,3}(?:[.,]\d{3})*\s*a\s*\d{1,3}(?:[.,]\d{3})*)\s*funcionários/i,
    /icone\s+Funcionários\s+Funcionários\s+(Acima\s+de\s+[\d.,]+\s*funcionários)\s+Ícone\s+de\s+dados\s+da\s+receita\s+federal/i,

    // Aqui você pode adicionar outros regexes se necessário
  ];

  for (const regex of regexes) {
    const correspondencia = texto.match(regex);
    if (correspondencia && correspondencia[1]) {
      const quantidadeLimpa = limparQuantidade(correspondencia[1]);
      return `Número de Funcionários: ${quantidadeLimpa}`;
    }
  }

  return "Número de Funcionários: não informado";
}

// Função para obter o faturamento anual
function obterFaturamentoAnual(texto) {
  const faturamentoRegex =
    /icone Faturamento Anual\s*Faturamento Anual\s*([\s\S]*?)(?:icone like|icone dislike|$)/i;

  const match = texto.match(faturamentoRegex);
  if (match && match[1]) {
    let faturamento = match[1]
      .replace(/^[\s\n\r]+|[\s\n\r]+$/g, "") // Remove espaços e quebras de linha no início e fim
      .trim();

    // Trunca na primeira quebra de linha
    faturamento = faturamento.split(/\r?\n/)[0].trim();

    if (faturamento.toLowerCase() === "desconhecido") {
      return "Faturamento Anual: Desconhecido";
    }
    return `Faturamento Anual: ${faturamento}`;
  }

  // Fallback para outros padrões possíveis
  const fallbackRegexes = [
    /Faturamento Anual\s*:\s*([^<\n\r]+)/i,
    /Faturamento Anual\s*(R?\$?\s*[\d,.]+ (?:mil|milh(?:ão|ões))(?: a R?\$?\s*[\d,.]+ (?:mil|milh(?:ão|ões)))?)/i,
  ];

  for (let regex of fallbackRegexes) {
    const fallbackMatch = texto.match(regex);
    if (fallbackMatch && fallbackMatch[1]) {
      let faturamento = fallbackMatch[1].trim();

      // Trunca na primeira quebra de linha
      faturamento = faturamento.split(/\r?\n/)[0].trim();

      return `Faturamento Anual: ${faturamento}`;
    }
  }

  return "Faturamento Anual: não informado";
}

// Extrai o email usando a função auxiliar já existente
function obterSiteEmpresa(texto) {
  // Extrai o email usando a função auxiliar já existente
  let emailFormatado = obterEmail(texto);

  // Caso não seja possível extrair o email, retorna COMPANY_URL
  if (!emailFormatado) return "COMPANY_URL";

  // Obtém a parte do domínio do email
  let dominioSite = emailFormatado.split("@")[1];
  if (!dominioSite) return "COMPANY_URL";

  // Lista dos domínios pessoais que devem resultar em COMPANY_URL
  const dominiosPessoais = [
    "gmail.com", // Google, o mais usado no Brasil
    "hotmail.com", // Microsoft, popular desde os anos 2000
    "yahoo.com", // Yahoo, ainda presente no Brasil
    "outlook.com", // Microsoft, crescente uso no Brasil
    "live.com", // Microsoft, usado por contas antigas
    "icloud.com", // Apple, comum entre usuários de iPhone no Brasil
    "bol.com.br", // BOL, histórico e ainda usado no Brasil
    "uol.com.br", // UOL, popular localmente
    "terra.com.br", // Terra, provedor tradicional brasileiro
    "ig.com.br", // iG, outro provedor nacional relevante
    "aol.com", // AOL, menos comum, mas com usuários no Brasil
    "protonmail.com", // Proton, nicho de privacidade com adoção crescente
    "me.com", // Apple, domínio legado no Brasil
    "mac.com", // Apple, outro domínio legado no Brasil
    "globo.com",
  ];

  // Verifica se o domínio extraído é um email pessoal (comparação exata)
  let dominioLower = dominioSite.toLowerCase();
  for (let personal of dominiosPessoais) {
    if (dominioLower === personal) {
      return "COMPANY_URL";
    }
  }

  // Para outros domínios, adiciona 'www.' na frente
  return "www." + dominioSite;
}

// Função principal que identifica as informações automaticamente
function identificarInformacoesAutomaticamente() {
  const texto = document.getElementById("inputText").value;
  const textoMinusculo = texto.toLowerCase();

  const origem = obterOrigem(textoMinusculo);
  const interesse = obterInteresse(texto);
  const porte = obterPorte(texto);

  // Exibe as informações capturadas nos elementos HTML correspondentes
  document.getElementById("origemLead").textContent = origem;
  document.getElementById("interesseLead").textContent = interesse;
  document.getElementById("porteLead").textContent = porte;
}

function formatarTextoLeadFilaA() {
  const texto = document.getElementById("inputText").value;
  const textoMinusculo = texto.toLowerCase();

  const NomeDoContato = obterNomeDoContato(texto);
  const NomeDaEmpresa = obterEmpresa(texto);

  const siteDaEmpresa = obterSiteEmpresa(texto);

  const origem = obterOrigem(textoMinusculo);
  const interesse = obterInteresse(texto);

  // Usando a nova função obterTelefoneFormatado
  const telefoneInfo = obterTelefoneFormatado(texto);
  const telefone = telefoneInfo.telefone;
  const localidade = telefoneInfo.localidade;
  const ddd = telefoneInfo.ddd;

  let infoEconodata = obterEconodata(texto);

  // Verifica se infoEconodata não está vazia e adiciona espaços
  if (infoEconodata) {
    infoEconodata = `${infoEconodata}\n\n`;
  }

  let perfilLinkedin = obterLinkedin(texto);

  const localidadeTexto = ddd ? `\nDDD ${ddd}: ${localidade}` : "";

  // Verifica se a origem contém a palavra "outbound"
  let nomeDaFila = "Fila A"; // Valor padrão
  if (origem.toLowerCase().includes("outbound")) {
    nomeDaFila = "Fila Outbound";
  }

  const resultadoTexto = `Chegou lead na ${nomeDaFila} para o @\n\nContato: ${NomeDoContato}\nEmpresa: ${NomeDaEmpresa}\nTelefone: ${telefone}${localidadeTexto}\n${interesse}\n${origem} \n\n${infoEconodata}Site da empresa: ${siteDaEmpresa}\n\nLinkedin: ${perfilLinkedin}\n--------------------------------------------------------\npróximo da fila é o @`;
  document.getElementById("resultado").textContent = resultadoTexto;
}

function copiarTextoLeadFilaA() {
  const textoParaCopiar = document.getElementById("resultado").textContent;
  navigator.clipboard
    .writeText(textoParaCopiar)
    .then(() => {
      mostrarPopUp("Texto copiado com sucesso!");
    })
    .catch((err) => {
      console.error("Erro ao copiar texto: ", err);
      mostrarPopUp("Falha ao copiar texto.");
    });
}

document
  .getElementById("inputText")
  .addEventListener("input", formatarTextoLeadFilaA);

// Garante que a formatação seja feita automaticamente ao carregar a página, se houver texto preenchido.
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("inputText").value) {
    formatarTextoLeadFilaA();
  }
});

// Função principal para obter todas as informações e retornar a string infoEconodata
function obterEconodata(texto) {
  let infoEconodata = "";

  // Definindo as expressões regulares para cada tipo de informação

  // 1. Regex específico para CNPJ após ", opera com o CNPJ "
  const cnpjRegexSpecific =
    /, opera com o CNPJ (\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i;

  // 2. Outros regexes para CNPJ (mantidos conforme o código original)
  const cnpjRegexOriginal = /CNPJ: (\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i;
  // Adicione aqui outros regexes de CNPJ se existirem, por exemplo:
  // const cnpjRegexAlternative = /outro padrão de regex para CNPJ/i;

  // Array de regexes na ordem de prioridade
  const cnpjRegexes = [
    cnpjRegexSpecific,
    cnpjRegexOriginal /*, cnpjRegexAlternative */,
  ];

  let cnpjMatch = null;

  // Iterar sobre os regexes até encontrar um match
  for (let regex of cnpjRegexes) {
    cnpjMatch = texto.match(regex);
    if (cnpjMatch) {
      break; // Sai do loop ao encontrar o primeiro match
    }
  }

  // Se o CNPJ for encontrado, adiciona as informações à string infoEconodata
  if (cnpjMatch) {
    infoEconodata += `CNPJ: ${cnpjMatch[1]}\n`;
    infoEconodata += obterPorte(texto) + "\n";
    infoEconodata += obterQuantidadeFuncionarios(texto) + "\n";
    infoEconodata += obterFaturamentoAnual(texto);
  }

  return infoEconodata.trim();
}

// Função principal que identifica informações adicionais e exibe no HTML
function obterInformacoesEconodata() {
  const texto = document.getElementById("inputText").value;
  const infoEconodata = obterEconodata(texto);

  // Exibindo as informações
  document.getElementById("informacoesAdicionais").textContent = infoEconodata;
}

function copiarInformacoesEconodata() {
  const textoParaCopiar = document.getElementById(
    "informacoesAdicionais"
  ).textContent;
  navigator.clipboard
    .writeText(textoParaCopiar)
    .then(() => {
      mostrarPopUp("Econodata copiado");
    })
    .catch((err) => {
      console.error("Erro ao copiar informações adicionais: ", err);
      mostrarPopUp("Falha ao copiar informações adicionais.");
    });
}

function PesquisarLinkedin() {
  const texto = document.getElementById("inputText").value;
  NomeDoContato = obterNomeDoContato(texto);
  NomeDaEmpresa = obterEmpresa(texto);

  if (NomeDoContato && NomeDaEmpresa) {
    const query = `${NomeDoContato} ${NomeDaEmpresa} Linkedin`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  } else {
    mostrarPopUp("Nome do contato e/ou nome da empresa não identificados.");
  }
}

function SiteDaEmpresa() {
  const texto = document.getElementById("inputText").value;
  EmailDoContato = obterEmail(texto); // Isso garantirá que EmailDoContato esteja atualizado

  if (EmailDoContato) {
    const dominio = EmailDoContato.split("@")[1];
    const dominiosPessoais = [
      "gmail.com",
      "hotmail.com",
      "icloud.com",
      "yahoo.com",
      "outlook.com",
      "aol.com",
      "mail.com",
      "protonmail.com",
      "zoho.com",
      "gmx.com",
      "yandex.com",
      "fastmail",
      "tutanota.com",
      "terra.com.br",
      "uol.com.br",
    ];

    if (!dominiosPessoais.includes(dominio.toLowerCase())) {
      const url = `http://www.${dominio}`;
      window.open(url, "_blank");
      copiarParaClipboard("cnpj da " + dominio);
    } else {
      mostrarPopUp("O e-mail fornecido é pessoal");
    }
  } else {
    mostrarPopUp("E-mail do contato não identificado");
  }
}

function formatarTextoLeadConsultor() {
  const texto = document.getElementById("inputText").value;
  const textoMinusculo = texto.toLowerCase();

  const origem = obterOrigem(textoMinusculo);
  const interesse = obterInteresse(texto);

  let NomeDoContato = obterNomeDoContato(texto);
  let NomeDaEmpresa = obterEmpresa(texto);
  let EmailFormatado = obterEmail(texto);

  let assuntoFormatado = obterAssunto(texto);

  const telefoneInfo = obterTelefoneFormatado(texto);
  const localidadeTexto = telefoneInfo.ddd
    ? `\nDDD ${telefoneInfo.ddd}: ${telefoneInfo.localidade}`
    : "";

  TextoLeadConsultor = `Chegou lead para você.\n\nContato: ${NomeDoContato}\nEmpresa: ${NomeDaEmpresa}\nE-mail: ${EmailFormatado}\nTelefone: ${telefoneInfo.telefone}${localidadeTexto}\n${interesse}\n${origem}\n\nAssunto: ${assuntoFormatado}`;

  // Atualizando o elemento HTML com o texto especial
  document.getElementById("detalhesLead").textContent = TextoLeadConsultor;
}

function copiarTextoLeadConsultor() {
  formatarTextoLeadConsultor(); // Garante que o texto especial esteja atualizado
  navigator.clipboard
    .writeText(TextoLeadConsultor)
    .then(() => {
      mostrarPopUp("Texto copiado!");
    })
    .catch((err) => {
      console.error("Erro ao copiar o texto especial: ", err);
      mostrarPopUp("Falha ao copiar o texto especial.");
    });
}

function formatarPromptGPT() {
  const texto = document.getElementById("inputText").value;
  const textoMinusculo = texto.toLowerCase();

  const origem = obterOrigem(textoMinusculo);

  let interesse = obterInteresse(texto);
  interesse = interesse.replace("Interesse: ", "");

  let NomeDaEmpresa = obterEmpresa(texto);
  let EmailFormatado = obterEmail(texto);

  let siteDaEmpresa = EmailFormatado.split("@")[1];
  siteDaEmpresa = "www." + siteDaEmpresa;

  let assuntoFormatado = obterAssunto(texto);

  PromptGPTFormatado = `Acesse o site ${siteDaEmpresa} e me traga um resumo do que essa empresa faz, seus principais serviços e principais clientes.

Além disso, e segundo meu contexto como potencial fornecedor de ${interesse}, e sabendo que é esse o serviço desejado por essa empresa, quais seriam as perguntas que eu devo fazer utilizando a metodologia GPCTBA & CI nessa primeira reunião que terei com eles. Considere também que esse lead da empresa ${NomeDaEmpresa} chegou com o seguinte texto no formulário do fale conosco: "${assuntoFormatado}"

Quais são os principais clientes e concorrentes diretos da ${NomeDaEmpresa}? E o que estão fazendo de inovação nesse ramo que sou potencial fornecedor.

Considerando esse contexto e o cenário que temos aqui, que tipos de perguntas poderíamos fazer a eles? Além disso, quais perguntas eles poderiam nos fazer, e quais seriam boas respostas que poderíamos oferecer?

Por favor me dê isso tudo em português do Brasil, o texto deve ser formatado de forma limpa e direta, sem qualquer tipo de aspas simples ou duplas.

Abaixo está a referência que você deve seguir para trazer a resposta no formato esperado. Os bullet points são feitos com hífens e é deixado uma linha vazia entre as perguntas, também entre as perguntas e as respostas. Além disso, existe uma string "TEXTO_EXTRAORDINÁRIO" entre duas sessões específicas uma linha vazia antes e uma linha vazia depois. Verifique cautelosamente o formato de resposta referência abaixo:

<exemploResposta>
A instituição de ensino superior mencionada é uma entidade pública que oferece cursos de graduação e pós-graduação, além de realizar pesquisas e atividades de extensão. Seus principais serviços incluem educação, pesquisa científica e extensão universitária, com foco em atender às demandas sociais e econômicas da região. A instituição atua em diversas áreas do conhecimento, como áreas A, B, C, D e E.

Como potencial fornecedor de soluções de automação de processos robóticos (RPA), ao se preparar para uma reunião utilizando a metodologia GPCTBA & CI, considere as seguintes perguntas:

- Pergunta 1

- Pergunta 2

- Pergunta 3

- Pergunta 4

- Pergunta 5

- Pergunta 6

- Pergunta 7

- Pergunta 8


TEXTO_EXTRAORDINÁRIO


### **Perguntas que a instituição pode nos fazer**

- Pergunta 1

R: Resposta 1

- Pergunta 2

R: Resposta 2

- Pergunta 3

R: Resposta 3

- Pergunta 4

R: Resposta 4

- Pergunta 5

R: Resposta 5


#### **Principais clientes da instituição**

Os principais clientes da instituição incluem grupo A, grupo B e grupo C. Concorrentes diretos podem ser outras instituições na região e no país que oferecem serviços semelhantes.

Em termos de inovação, a instituição está investindo em projetos de automação para aumentar a eficiência operacional, além de integrar suas atividades de pesquisa com plataformas de divulgação científica, promover a participação de grupo específico nas áreas de interesse e desenvolver parcerias nacionais e internacionais.

</exemploResposta>
`;
}

function copiarPromptGPT() {
  formatarPromptGPT(); // Garante que o texto especial esteja atualizado
  navigator.clipboard
    .writeText(PromptGPTFormatado)
    .then(() => {
      mostrarPopUp("Texto copiado!");
    })
    .catch((err) => {
      console.error("Erro ao copiar o texto especial: ", err);
      mostrarPopUp("Falha ao copiar o texto especial.");
    });
}

function removerLinhasPorInicio(texto, iniciosParaRemover) {
  // Divide o texto em linhas para processamento
  let linhas = texto.split("\n");
  // Filtra as linhas, removendo aquelas que começam com algum dos inícios especificados
  linhas = linhas.filter(
    (linha) => !iniciosParaRemover.some((inicio) => linha.startsWith(inicio))
  );
  // Reconstitui o texto com as linhas restantes
  return linhas.join("\n");
}

function removerTermosEspecificos(texto, termosParaRemover) {
  termosParaRemover.forEach((termo) => {
    // Usando expressão regular para substituir o termo por uma string vazia globalmente, ignorando maiúsculas e minúsculas
    texto = texto.replace(new RegExp(termo, "gi"), "");
  });
  return texto;
}

function ajustarQuebrasDeLinha(texto) {
  // Primeiro, substitui múltiplas quebras de linha por uma única quebra de linha
  // Segundo, remove linhas que contêm somente espaços ou são totalmente vazias
  return texto.replace(/\n+/g, "\n").replace(/^\s*$(?:\r\n?|\n)/gm, "");
}

function removerTextoAposTermos(texto, termos) {
  let indiceMinimo = texto.length;
  termos.forEach((termo) => {
    const indice = texto.indexOf(termo);
    if (indice !== -1 && indice < indiceMinimo) {
      indiceMinimo = indice;
    }
  });
  return indiceMinimo !== texto.length
    ? texto.substring(0, indiceMinimo)
    : texto;
}

function FormatarLeadFaleCom(texto) {
  // Regexes e listas de exclusão para cada categoria
  const nomeRegexes = [
    /(?<=para:\s)(.*?)(?=\s<)/,
    /(?<=From: ')(.*?)(?=' via Falecom)/,
    /(?<=From: falecom@agence.com.br <falecom@agence.com.br> On Behalf Of )(.*?)(?=\r?\nSent:)/,
    /(?<=From: falecom@agence.com.br <falecom@agence.com.br> On Behalf Of )(.*?)(?=\nSent:)/,
  ];
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailsIgnorados = [
    "carlos.arruda@agence.cl",
    "ismael.batista@sp.agence.com.br",
    "falecom@agence.com.br",
    "pedro.catini@agence.com.br",
    "daniel.silva@sp.agence.com.br",
    "carlos.carvalho@agence.com.br",
    "danilo.camargo@sp.agence.com.br",
  ];
  const telefoneRegexes = [
    /\b(?:\+?(\d{1,3}))?[-. ]?(\d{2,3})[-. ]?(\d{4,5})[-. ]?(\d{4})\b/g,
    /\+\d{1,3}\s?\(\d{1,3}\)\s?\d{4,5}-\d{4}/g,
    /\+\d{1,3}\s?\(\d{1,3}\)\s?\d{3,4}-\d{4}/g,
  ];
  const telefonesIgnorados = [
    "+5512992117495",
    "+551121577514",
    "11987654321",
    "+56227998951",
    "+56974529257",
    "+551135542187",
  ];
  const assuntoRegexes = [
    /(?<=Subject: )([\s\S]*?)(?=\d{1,2} de \w+\. de \d{4}, \d{1,2}:\d{2})/,
    /(?<=Subject: )([\s\S]*?)(?=\n\n\n)/,
  ];

  // Variáveis de resultado
  let nomeFormatado = "";
  let emailFormatado = "";
  let telefoneFormatado = "";
  let assuntoFormatado = `\n\nASSUNTO_FORMATADO\n`;

  // Processamento de nome
  for (const regex of nomeRegexes) {
    const nomeMatch = texto.match(regex);
    if (nomeMatch) {
      nomeFormatado = nomeMatch[0]
        .split(" ")
        .map(
          (palavra) =>
            palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase()
        )
        .join(" ");
      break;
    }
  }

  // Processamento de email
  const todosEmails = texto.match(emailRegex) || [];
  const emailsValidos = todosEmails.filter(
    (email) => !emailsIgnorados.includes(email.toLowerCase())
  );

  if (emailsValidos.length > 0) {
    emailFormatado = emailsValidos[0].toLowerCase();
  }

  // Processamento de telefone
  let todosTelefones = [];
  telefoneRegexes.forEach((regex) => {
    const telefonesEncontrados = [...texto.matchAll(regex)].map(
      (match) => match[0]
    );
    todosTelefones = [...todosTelefones, ...telefonesEncontrados];
  });
  const telefonesValidos = todosTelefones.filter(
    (telefone) => !telefonesIgnorados.includes(telefone.replace(/[-. ()]/g, ""))
  );
  if (telefonesValidos.length > 0) {
    telefoneFormatado = telefonesValidos[0];
  }

  // Processamento de assunto com lógica específica
  const iniciosParaRemoverAssunto = [
    "Ismael Borges Batista",
    // Adicione mais inícios para remover conforme necessário
  ];

  const termosParaRemoverAssunto = [
    // Adicione mais termos para remover conforme necessário
  ];

  const termosParaCorteAssunto = [
    "Atenciosamente",
    "Obrigado",
    "Obrigada",
    "obrigado",
    "obrigada",
    "[Mensagem cortada]",
    "Exibir toda a mensagem",
    // Adicione mais termos conforme necessário
  ];

  for (const regex of assuntoRegexes) {
    const assuntoMatch = texto.match(regex);
    if (assuntoMatch) {
      let assunto = assuntoMatch[0].trim();

      // Processamento adicional do assunto com lógica específica
      assunto = removerLinhasPorInicio(assunto, iniciosParaRemoverAssunto);
      assunto = removerTermosEspecificos(assunto, termosParaRemoverAssunto);
      assunto = ajustarQuebrasDeLinha(assunto);
      assunto = removerTextoAposTermos(assunto, termosParaCorteAssunto);

      assuntoFormatado = assunto.charAt(0).toUpperCase() + assunto.slice(1);
      break; // Garante que apenas o último assunto seja processado e formatado
    }
  }

  // Construção do texto formatado
  let textoFormatado = `Nome: ${nomeFormatado}\nEmpresa: \nEmail: ${emailFormatado}\nEstou interessado em: \nTelefone: ${telefoneFormatado}\nComentários: ${assuntoFormatado}\nAgence - falecom@agence.com.br`;

  // Exibição do resultado e/ou outras ações
  textoFormatadoGlobal = textoFormatado; // Armazena o texto formatado na variável global

  // Retorno do texto formatado, caso necessário
  return textoFormatado;
}

function copiarLeadFaleComParaClipboard() {
  const texto = document.getElementById("inputText").value; // Obtém o texto de entrada
  FormatarLeadFaleCom(texto); // Formata o texto e atualiza a variável global

  // Verifica se o textoFormatadoGlobal não está vazio
  if (textoFormatadoGlobal !== "") {
    navigator.clipboard
      .writeText(textoFormatadoGlobal)
      .then(() => {
        mostrarPopUp("Texto copiado para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar o texto do Lead FaleCom: ", err);
        mostrarPopUp("Falha ao copiar o texto do Lead FaleCom.");
      });
  } else {
    mostrarPopUp("Nenhum texto disponível para copiar.");
  }
}

function copiarLinkWhatsapp() {
  const texto = document.getElementById("inputText").value;
  const telefoneRegex = /Telefone:.*?(\d[\d\s().-]*)/i;
  const telefoneMatch = texto.match(telefoneRegex);

  // Extrair e formatar o nome do contato
  const nomeFormatado = obterNomeDoContato(texto);
  const firstName = nomeFormatado.split(" ")[0];

  if (telefoneMatch) {
    const numeros = telefoneMatch[1].replace(/\D/g, "");
    const resultado = formatarTelefone(numeros);

    // Certifique-se de que 'formatarTelefone' retorna um objeto com a propriedade 'formatado'
    if (resultado && resultado.formatado) {
      const numeroLimpo = resultado.formatado.replace(/\D/g, "");

      // Criar a mensagem personalizada
      const mensagem =
        encodeURIComponent(`Olá ${firstName}, tudo bom? Meu nome é Bruna Dória, da Agence Consultoria.

Recebi seu contato pois preencheu o nosso chatbot do site. Você possui alguma demanda de tecnologia?

Desenvolvimento de software, robotização de processos, profissionais de TI? Algo nesse sentido? 😁`);

      // Corrigir o link do WhatsApp
      const linkWhatsApp = `https://api.whatsapp.com/send?phone=${numeroLimpo}&text=${mensagem}`;

      // Copiar a mensagem para a área de transferência
      navigator.clipboard.writeText(linkWhatsApp).then(
        function () {
          mostrarPopUp(`Mensagem copiada: ${linkWhatsApp}`);
        },
        function () {
          mostrarPopUp("Falha ao copiar a mensagem.");
        }
      );
    } else {
      mostrarPopUp("Erro ao formatar o número de telefone.");
    }
  } else {
    mostrarPopUp("Telefone não encontrado");
  }
}

// Função para obter as perguntas padrão com base no interesse
function obterPerguntasDefault(interesse) {
  let perguntasDefault = "";

  switch (interesse) {
    case DEFAULT_INTERESTS.CONSULTORIA:
      perguntasDefault = `#### Checklist de Consultoria de Ti

- **Objetivos e Processos**

- Qual é o objetivo principal do projeto?

- Como funciona esse processo hoje? Existe alguma ferramenta em uso hoje pelos usuários? Tem um nome ou foi desenvolvido internamente?

- Você está considerando alguma integração com outros sistemas legados da empresa ou outros sites externos? Quais e por favor liste a forma de integração existente como API, Webservices, etc?


- **Documentação e Identidade**

- Já tem algum protótipo ou documentação do projeto?

- Você tem um manual de identidade visual do projeto?

- Você pode fornecer acesso à documentação relevante como personas de usuários, fluxos de trabalho ou diretrizes de design? Além de um simples manual do usuário caso seja somente isso que vocês tenham?


- **Tecnologia e Infraestrutura**

- Quais são as premissas de infra-estrutura e arquitetura?

- Existe preferência por alguma tecnologia (PHP, .NET C#, Python, Java, Node.JS, etc)?

- Existe preferência por algum banco de dados (MySQL, PostgreSQL, Oracle, SQL Server, MongoDB)?


- **Orçamento e Prazos**

- Você tem alguma expectativa para as datas de início e término do projeto?

- Existe um orçamento máximo já estabelecido para o projeto?

- Qual é o prazo esperado para a implementação da solução?


- **Equipe e Tomadores de Decisão**

- Quem é o principal responsável pelo projeto do lado de vocês?

- Como a sua empresa realiza o processo de compras?

- Quais serão os demais participantes do processo de compra?

- Qual o grau de influência de cada participante?

- Existe alguém que possa impedir a compra (gatekeeper)?

- Se sim, por qual motivo?


- **Experiência Anterior e Competitividade**

- Você já recebeu outros orçamentos? Qual foi a experiência?

- Você tem exemplos de sistemas concorrentes? Em caso afirmativo, liste os links.


- **Estrutura Organizacional**

- Tem alguma consultoria externa de RH e/ou TI?

- Tem time de TI Devs interno? Quantos?

- Tem time de TI Infra/Help Desk? Quantos?


### Perguntas Auxiliares (Transversais a Diversos Serviços)

- **Estrutura Organizacional**

- Tem time de TI Devs interno? Quantos?

- Tem time de TI Infra/Help Desk? Quantos?


- **Segurança e Compliance**

- Vocês têm algum requisito de segurança?

- Se sim, tem alguma documentação padrão a ser seguida?


- **Usuários e Escalabilidade**
  
- Para o caso de o sistema ser de grande porte:

- Qual público de usuários que deverá utilizar esse sistema web/app mobile?

- Qual seria o número total de usuários previstos para o sistema web/app mobile?

- E qual seria o número de usuários simultâneos esperados para o sistema web/app mobile?`;
      break;

    case DEFAULT_INTERESTS.RPA:
      perguntasDefault = `#### Checklist para Validação de Requerimentos de RPA

**1. Escopo do Processo**

- Quantas etapas o processo possui e qual é a sua complexidade?

- Quantos sistemas são necessários acessar (ERP, Planilhas, e-mails, FTP, etc.)?


**2. Integração de Sistemas**

- Quais sistemas e aplicativos precisam ser integrados?

- Os sistemas requerem integração via API? Existe disponibilidade de APIs disponíveis para automação? Sim/Não

- A integração requer leitura e escrita em dados de aplicações legadas? Sim/Não


**3. Volume de Processamento**

- Qual é o volume de tarefas/processos que precisam ser automatizados?

- Com que frequência esses processos ocorrem (diariamente, semanalmente, mensalmente)?


**4. Escalabilidade e Suporte**
   
- Há planos antecipados de expansão dos processos automatizados? Sim/Não

- Precisa de suporte técnico e manutenção (Sistemas que passam constantemente por atualizações)?


**5. Flexibilidade e Personalização**

- É possível que o processo seja atualizado dentro de pouco tempo? Sim/Não


**6. Segurança e Governança**

- Existem requisitos específicos de segurança ou conformidade que precisam ser atendidos?

- Como os dados sensíveis serão tratados durante a automação?


**7. Deployment**

- Qual é a infraestrutura preferida para executar o processo de automação: remoto ou local?

- Há requisitos específicos de implantação (ex: Deve ser iniciado de forma automática, iniciado por uma pessoa, etc.)?


**8. Orçamento e Prazos**

- Qual é o orçamento estimado para o projeto de automação?

- Qual é o prazo esperado para a implementação da solução?`;
      break;

    case DEFAULT_INTERESTS.DESENVOLVIMENTO_MOBILE:
      perguntasDefault = `#### Checklist para Validação de Requerimentos de Desenvolvimento Mobile

- **Requisitos e Funcionalidades**

- Quais funcionalidades ou características específicas você gostaria de ver incorporadas no aplicativo móvel?

- Você possui software personalizado ou utiliza apenas soluções prontas?

- Qual público de usuários que deverá utilizar esse sistema web/app mobile?

- Qual seria o número total de usuários previstos para o sistema web/app mobile?

- E qual seria o número de usuários simultâneos esperados para o sistema web/app mobile?


- **Tecnologia e Integração**

- Existe preferência por alguma tecnologia (PHP, .NET C#, Python, Java, Node.JS, etc)?

- Em caso mobile, tecnologia (iOS Swift ou Objective-C, Android Kotlin ou Java, Flutter, React Native)?

- Existe preferência por algum banco de dados (MySQL, PostgreSQL, Oracle, SQL Server, MongoDB)?

- Vocês têm ferramentas, frameworks ou linguagens de programação preferenciais para o desenvolvimento do aplicativo? Incluindo banco de dados preferencial?

- Existem sistemas ou softwares atualmente usados internamente que precisam de integração com o aplicativo móvel proposto?


- **Design e Experiência do Usuário**

- Você tem exemplos de sistemas concorrentes? Em caso afirmativo, liste os links.

- Você pode fornecer acesso à documentação relevante como personas de usuários, fluxos de trabalho ou diretrizes de design? Além de um simples manual do usuário caso seja somente isso que vocês tenham?


- **Infraestrutura e Hospedagem**

- Podemos considerar o armazenamento da aplicação? Vamos ficar encarregados da Hospedagem também ou você vai hospedar?

- Acerca de hospedagem, vocês trabalham com algum serviço específico de Cloud? Poderia ficar hosteado conosco ou necessariamente teria que ficar no seu ambiente?


- **Documentação e Manutenção**

- Já tem algum protótipo ou documentação do projeto?

- É necessário documentar o projeto?

- Se sim, você tem algum formato de documentação padrão? Quais são os documentos necessários para o projeto? Artefatos que devemos contemplar?

- Com que frequência a SDI antecipa a atualização de conteúdo ou a adição de novas funcionalidades ao aplicativo? Atualizações regulares podem exigir suporte contínuo, por isso é essencial entender seus requisitos antecipadamente.


- **Suporte e Operacional**
  
- O atendimento de suporte e manutenção desejado seria 24 x 7 ou 8 x 5?

- Você precisará de uma configuração de VPN para trabalhar com vocês?


- **Orçamento e Prazos**

- Você tem alguma expectativa para as datas de início e término do projeto?

- Existe um orçamento máximo já estabelecido para o projeto?


### **Perguntas Auxiliares**

- **Estrutura Organizacional**

- Tem time de TI Devs interno? Quantos?

- Tem time de TI Infra/Help Desk? Quantos?


- **Segurança e Compliance**

- Vocês têm algum requisito de segurança?

- Se sim, tem alguma documentação padrão a ser seguida?


- **Usuários e Escalabilidade**

- Para o caso de o sistema ser de grande porte:

- Qual público de usuários que deverá utilizar esse sistema web/app mobile?

- Qual seria o número total de usuários previstos para o sistema web/app mobile?

- E qual seria o número de usuários simultâneos esperados para o sistema web/app mobile?`;
      break;

    case DEFAULT_INTERESTS.DESENVOLVIMENTO_WEB:
      perguntasDefault = `#### Checklist para Validação de Requerimentos de Desenvolvimento Web

- **Requisitos e Funcionalidades**

- Quais funcionalidades ou características específicas você gostaria de ver incorporadas no aplicativo móvel?

- Você possui software personalizado ou utiliza apenas soluções prontas?

- Qual público de usuários que deverá utilizar esse sistema web/app mobile?

- Qual seria o número total de usuários previstos para o sistema web/app mobile?

- E qual seria o número de usuários simultâneos esperados para o sistema web/app mobile?


- **Tecnologia e Integração**

- Existe preferência por alguma tecnologia (PHP, .NET C#, Python, Java, Node.JS, etc)?

- Em caso mobile, tecnologia (iOS Swift ou Objective-C, Android Kotlin ou Java, Flutter, React Native)?

- Existe preferência por algum banco de dados (MySQL, PostgreSQL, Oracle, SQL Server, MongoDB)?

- Vocês têm ferramentas, frameworks ou linguagens de programação preferenciais para o desenvolvimento do aplicativo? Incluindo banco de dados preferencial?

- Existem sistemas ou softwares atualmente usados internamente que precisam de integração com o aplicativo móvel proposto?


- **Design e Experiência do Usuário**

- Você tem exemplos de sistemas concorrentes? Em caso afirmativo, liste os links.

- Você pode fornecer acesso à documentação relevante como personas de usuários, fluxos de trabalho ou diretrizes de design? Além de um simples manual do usuário caso seja somente isso que vocês tenham?


- **Infraestrutura e Hospedagem**

- Podemos considerar o armazenamento da aplicação? Vamos ficar encarregados da Hospedagem também ou você vai hospedar?

- Acerca de hospedagem, vocês trabalham com algum serviço específico de Cloud? Poderia ficar hosteado conosco ou necessariamente teria que ficar no seu ambiente?


- **Documentação e Manutenção**

- Já tem algum protótipo ou documentação do projeto?

- É necessário documentar o projeto?

- Se sim, você tem algum formato de documentação padrão? Quais são os documentos necessários para o projeto? Artefatos que devemos contemplar?

- Com que frequência a SDI antecipa a atualização de conteúdo ou a adição de novas funcionalidades ao aplicativo? Atualizações regulares podem exigir suporte contínuo, por isso é essencial entender seus requisitos antecipadamente.


- **Suporte e Operacional**

- O atendimento de suporte e manutenção desejado seria 24 x 7 ou 8 x 5?

- Você precisará de uma configuração de VPN para trabalhar com vocês?


- **Orçamento e Prazos**
  
- Você tem alguma expectativa para as datas de início e término do projeto?
  
- Existe um orçamento máximo já estabelecido para o projeto?


### Perguntas Auxiliares (Transversais a Diversos Serviços)

- **Estrutura Organizacional**

- Tem time de TI Devs interno? Quantos?

- Tem time de TI Infra/Help Desk? Quantos?


- **Segurança e Compliance**

- Vocês têm algum requisito de segurança?

- Se sim, tem alguma documentação padrão a ser seguida?


- **Usuários e Escalabilidade**

- Para o caso de o sistema ser de grande porte:

- Qual público de usuários que deverá utilizar esse sistema web/app mobile?

- Qual seria o número total de usuários previstos para o sistema web/app mobile?

- E qual seria o número de usuários simultâneos esperados para o sistema web/app mobile?`;
      break;

    case DEFAULT_INTERESTS.EAD_MOODLE:
      perguntasDefault = `#### Checklist para Validação de Requerimentos de e-Learning Moodle

- **Requisitos e Funcionalidades**

- Quais funcionalidades ou características específicas você gostaria de ver incorporadas no aplicativo móvel?

- Você possui software personalizado ou utiliza apenas soluções prontas?

- Qual público de usuários que deverá utilizar esse sistema web/app mobile?

- Qual seria o número total de usuários previstos para o sistema web/app mobile?

- E qual seria o número de usuários simultâneos esperados para o sistema web/app mobile?


- **Tecnologia e Integração**

- Existe preferência por alguma tecnologia (PHP, .NET C#, Python, Java, Node.JS, etc)?

- Em caso mobile, tecnologia (iOS Swift ou Objective-C, Android Kotlin ou Java, Flutter, React Native)?

- Existe preferência por algum banco de dados (MySQL, PostgreSQL, Oracle, SQL Server, MongoDB)?

- Vocês têm ferramentas, frameworks ou linguagens de programação preferenciais para o desenvolvimento do aplicativo? Incluindo banco de dados preferencial?

- Existem sistemas ou softwares atualmente usados internamente que precisam de integração com o aplicativo móvel proposto?


- **Design e Experiência do Usuário**

- Você tem exemplos de sistemas concorrentes? Em caso afirmativo, liste os links.

- Você pode fornecer acesso à documentação relevante como personas de usuários, fluxos de trabalho ou diretrizes de design? Além de um simples manual do usuário caso seja somente isso que vocês tenham?


- **Infraestrutura e Hospedagem**

- Podemos considerar o armazenamento da aplicação? Vamos ficar encarregados da Hospedagem também ou você vai hospedar?

- Acerca de hospedagem, vocês trabalham com algum serviço específico de Cloud? Poderia ficar hosteado conosco ou necessariamente teria que ficar no seu ambiente?


- **Documentação e Manutenção**

- Já tem algum protótipo ou documentação do projeto?

- É necessário documentar o projeto?

- Se sim, você tem algum formato de documentação padrão? Quais são os documentos necessários para o projeto? Artefatos que devemos contemplar?

- Com que frequência a SDI antecipa a atualização de conteúdo ou a adição de novas funcionalidades ao aplicativo? Atualizações regulares podem exigir suporte contínuo, por isso é essencial entender seus requisitos antecipadamente.


- **Suporte e Operacional**

- O atendimento de suporte e manutenção desejado seria 24 x 7 ou 8 x 5?

- Você precisará de uma configuração de VPN para trabalhar com vocês?


- **Orçamento e Prazos**

- Você tem alguma expectativa para as datas de início e término do projeto?

- Existe um orçamento máximo já estabelecido para o projeto?


### Perguntas Auxiliares

- **Estrutura Organizacional**

- Tem time de TI Devs interno? Quantos?

- Tem time de TI Infra/Help Desk? Quantos?


- **Segurança e Compliance**

- Vocês têm algum requisito de segurança?

- Se sim, tem alguma documentação padrão a ser seguida?


- **Usuários e Escalabilidade**

- Para o caso de o sistema ser de grande porte:

- Qual público de usuários que deverá utilizar esse sistema web/app mobile?

- Qual seria o número total de usuários previstos para o sistema web/app mobile?

- E qual seria o número de usuários simultâneos esperados para o sistema web/app mobile?`;
      break;

    case DEFAULT_INTERESTS.E_COMMERCE:
      perguntasDefault = `#### Checklist para Validação de Requerimentos de e-Commerce


- **Requisitos e Funcionalidades**

- Quais funcionalidades ou características específicas você gostaria de ver incorporadas no aplicativo móvel?

- Você possui software personalizado ou utiliza apenas soluções prontas?

- Qual público de usuários que deverá utilizar esse sistema web/app mobile?

- Qual seria o número total de usuários previstos para o sistema web/app mobile?

- E qual seria o número de usuários simultâneos esperados para o sistema web/app mobile?


- **Tecnologia e Integração**

- Existe preferência por alguma tecnologia (PHP, .NET C#, Python, Java, Node.JS, etc)?

- Em caso mobile, tecnologia (iOS Swift ou Objective-C, Android Kotlin ou Java, Flutter, React Native)?

- Existe preferência por algum banco de dados (MySQL, PostgreSQL, Oracle, SQL Server, MongoDB)?

- Vocês têm ferramentas, frameworks ou linguagens de programação preferenciais para o desenvolvimento do aplicativo? Incluindo banco de dados preferencial?

- Existem sistemas ou softwares atualmente usados internamente que precisam de integração com o aplicativo móvel proposto?


- **Design e Experiência do Usuário**

- Você tem exemplos de sistemas concorrentes? Em caso afirmativo, liste os links.

- Você pode fornecer acesso à documentação relevante como personas de usuários, fluxos de trabalho ou diretrizes de design? Além de um simples manual do usuário caso seja somente isso que vocês tenham?


- **Infraestrutura e Hospedagem**

- Podemos considerar o armazenamento da aplicação? Vamos ficar encarregados da Hospedagem também ou você vai hospedar?

- Acerca de hospedagem, vocês trabalham com algum serviço específico de Cloud? Poderia ficar hosteado conosco ou necessariamente teria que ficar no seu ambiente?


- **Documentação e Manutenção**

- Já tem algum protótipo ou documentação do projeto?

- É necessário documentar o projeto?

- Se sim, você tem algum formato de documentação padrão? Quais são os documentos necessários para o projeto? Artefatos que devemos contemplar?

- Com que frequência a SDI antecipa a atualização de conteúdo ou a adição de novas funcionalidades ao aplicativo? Atualizações regulares podem exigir suporte contínuo, por isso é essencial entender seus requisitos antecipadamente.


- **Suporte e Operacional**

- O atendimento de suporte e manutenção desejado seria 24 x 7 ou 8 x 5?

- Você precisará de uma configuração de VPN para trabalhar com vocês?


- **Orçamento e Prazos**

- Você tem alguma expectativa para as datas de início e término do projeto?

- Existe um orçamento máximo já estabelecido para o projeto?


### Perguntas Auxiliares

- **Estrutura Organizacional**

- Tem time de TI Devs interno? Quantos?

- Tem time de TI Infra/Help Desk? Quantos?


- **Segurança e Compliance**

- Vocês têm algum requisito de segurança?

- Se sim, tem alguma documentação padrão a ser seguida?


- **Usuários e Escalabilidade**

- Para o caso de o sistema ser de grande porte:

- Qual público de usuários que deverá utilizar esse sistema web/app mobile?

- Qual seria o número total de usuários previstos para o sistema web/app mobile?

- E qual seria o número de usuários simultâneos esperados para o sistema web/app mobile?`;
      break;

    case DEFAULT_INTERESTS.OUTSOURCING:
      perguntasDefault = `### **4. Outsourcing e Headhunting**

- **Necessidades de Contratação**

- Vocês vêm enfrentando problemas na contratação de funcionários?

- Atualmente tem vagas em aberto com dificuldade no preenchimento?


- **Retenção e Rotatividade**

- Como é a rotatividade destes funcionários? É comum eles ficarem pouco e saírem logo depois de contratados?


- **Perfis e Qualificações**

- Quantidade e Senioridade dos profissionais: Junior (Até 2 anos de experiência), Pleno (De 3 a 5 anos) ou Sênior (De 6 anos para mais).

- Conhecimento de programação necessária: ASP, .NET, PHP, Ruby, Python, Java, etc.

- Conhecimento de programação em algum framework específico? Cake, Zend, Laravel, Rails, Django, etc.

- Conhecimento de programação desejável: ASP, .NET, PHP, Ruby, Python, Java, etc.

- Conhecimento de banco de dados necessário: SQL Server, MySQL, PostgreSQL, Oracle, etc.


- **Custos e Regimes de Contratação**

- Qual o custo por hora/homem que vocês têm com esses funcionários?

- Qual o regime de contratação? CLT ou PJ?


- **Logística e Localização**

- Localização que deverá ficar o profissional: Bairro/Rua/Referência/Etc.

- Obrigatoriamente o profissional deverá ficar in-loco ou poderia ser remoto (sendo remoto o preço pode cair de 20% a 30%):

- Tempo estimado de alocação: 6 meses? 1 ano? Indeterminado?

- Data de início necessário para o profissional: Imediata? Daqui 1 semana? 1 mês?


- **Treinamento e Adaptação**
- Qual o tempo de treinamento e de adaptação?

Considerando o contexto, perguntas adicionais poderiam incluir: 

- Como vocês estão atualmente inovando na área de tecnologia?

- Quais são os desafios enfrentados ao tentar integrar novas tecnologias em seus serviços atuais?`;
      break;

    case DEFAULT_INTERESTS.HEADHUNTING:
      perguntasDefault = `### **4. Outsourcing e Headhunting**

- **Necessidades de Contratação**

- Vocês vêm enfrentando problemas na contratação de funcionários?

- Atualmente tem vagas em aberto com dificuldade no preenchimento?


- **Retenção e Rotatividade**

- Como é a rotatividade destes funcionários? É comum eles ficarem pouco e saírem logo depois de contratados?


- **Perfis e Qualificações**

- Quantidade e Senioridade dos profissionais: Junior (Até 2 anos de experiência), Pleno (De 3 a 5 anos) ou Sênior (De 6 anos para mais).

- Conhecimento de programação necessária: ASP, .NET, PHP, Ruby, Python, Java, etc.

- Conhecimento de programação em algum framework específico? Cake, Zend, Laravel, Rails, Django, etc.

- Conhecimento de programação desejável: ASP, .NET, PHP, Ruby, Python, Java, etc.

- Conhecimento de banco de dados necessário: SQL Server, MySQL, PostgreSQL, Oracle, etc.


- **Custos e Regimes de Contratação**

- Qual o custo por hora/homem que vocês têm com esses funcionários?

- Qual o regime de contratação? CLT ou PJ?


- **Logística e Localização**

- Localização que deverá ficar o profissional: Bairro/Rua/Referência/Etc.

- Obrigatoriamente o profissional deverá ficar in-loco ou poderia ser remoto (sendo remoto o preço pode cair de 20% a 30%):

- Tempo estimado de alocação: 6 meses? 1 ano? Indeterminado?

- Data de início necessário para o profissional: Imediata? Daqui 1 semana? 1 mês?


- **Treinamento e Adaptação**
- Qual o tempo de treinamento e de adaptação?

Considerando o contexto, perguntas adicionais poderiam incluir: 

- Como vocês estão atualmente inovando na área de tecnologia?

- Quais são os desafios enfrentados ao tentar integrar novas tecnologias em seus serviços atuais?`;
      break;

    case DEFAULT_INTERESTS.INTELIGENCIA_ARTIFICIAL:
      perguntasDefault = `#### Checklist para Validação de Requerimentos de Desenvolvimento de Soluções de IA Generativa

**Objetivos e Aplicações de IA Generativa**

- Quais são os principais objetivos que você deseja alcançar com a solução de IA generativa? (Ex.: automação de respostas, geração de conteúdo, assistentes virtuais, etc.)

- Que tipo de saída generativa você espera do modelo? (Ex.: textos naturais, respostas em linguagem específica, resumos, traduções, código, etc.)


**Dados e Fontes**

- Que tipos de dados você possui ou planeja utilizar para treinar o LLM?

- Os dados já estão organizados e limpos, ou será necessário suporte para coleta e pré-processamento?

- Você tem dados sensíveis ou proprietários que exigem tratamento especial?


**Público e Usuários**

- Quem será o público-alvo ou os usuários finais da solução? (Ex.: colaboradores internos, clientes externos.)


**Desempenho e Escalabilidade**

- Quais são os requisitos de desempenho esperados do modelo? (Ex.: tempo de resposta, precisão nas respostas.)

- Qual é o volume estimado de interações simultâneas que o LLM precisará processar?


**Tecnologia e Integração**

- A solução precisará integrar-se com sistemas existentes? Se sim, quais? (Ex.: CRMs, ERPs, plataformas de chat.)

- Há preferência por um modelo específico para o desenvolvimento? (Ex.: OpenAI, Grok, Claude, Gemini.)


**Design e Experiência do Usuário**

- Como os usuários irão interagir com a solução? (Ex.: chatbot, API, interface web ou mobile.)


**Segurança e Compliance**

- Quais são os requisitos de segurança mais importantes para a solução? (Ex.: criptografia, proteção contra ataques.)

- A solução precisa cumprir alguma regulamentação específica? (Ex.: LGPD, GDPR.)


**Orçamento e Prazos**

- Qual é a data prevista para o início do projeto e a expectativa de entrega?

- Você tem um orçamento máximo definido para o desenvolvimento? Se sim, qual?


**Estrutura Organizacional e Colaboração**

- Quem será o ponto de contato principal do seu lado para gerenciar o projeto?`;
      break;

    default:
      perguntasDefault = "";
      break;
  }

  return perguntasDefault;
}

// Função para copiar as perguntas padrão com base no interesse identificado
function copiarPerguntasDefault() {
  const texto = document.getElementById("inputText").value;
  const interesse = obterInteresse(texto);

  const interesse_ajustado = interesse.split(":")[1]?.trim() || interesse;

  if (interesse) {
    const perguntas = obterPerguntasDefault(interesse);

    if (perguntas) {
      // Copiar as perguntas para a área de transferência
      navigator.clipboard.writeText(perguntas).then(
        function () {
          mostrarPopUp(
            `Perguntas de ${interesse_ajustado} copiadas com sucesso.`
          );
        },
        function () {
          mostrarPopUp(
            `Falha ao copiar as perguntas de ${interesse_ajustado}.`
          );
        }
      );
    } else {
      mostrarPopUp(`${interesse}`);
    }
  } else {
    mostrarPopUp(`${interesse}`);
  }
}
