let nome_do_contato = "";
let nome_da_empresa = "";
let email_do_contato = "";
let mensagem_consultor = ""; // Variável global para armazenar o texto especial
let prompt_GPT_formatado = "";
let origem_global = "";
let porte_global = "";
let interesse_global = "";
let assunto_formatado = "";
let info_econodata = "";
let perfil_linkedin = "";
let site_da_empresa = "";
let telefone_formatado = "";
let localidade_formatada = "";

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
    identificarInformacoesAutomaticamente();
    formatarTextoLeadConsultor();
    formatarPromptGPT();
  });

  document.getElementById("copiarTextoEspecial").addEventListener("click", copiarTextoEspecial);

});

// Função principal que identifica as informações automaticamente
function identificarInformacoesAutomaticamente() {
  const texto = document.getElementById("inputText").value;
  const textoMinusculo = texto.toLowerCase();
  
  localidade_formatada = "";
  const telefoneInfo = obterTelefoneFormatado(texto);
  telefone_formatado = telefoneInfo.telefone;
  
  const ddd = telefoneInfo.ddd; // Utilizado para telefones brasileiros
  const pais = telefoneInfo.pais; // Nome do país ou "Brasil"
  const ddi = telefoneInfo.ddi; // Código DDI, para telefones internacionais
  const localidadeRaw = telefoneInfo.localidade; // Nome da localidade ou país

  // Construir a linha de localidade somente se a informação estiver 100%
  // Exibir "DDD xx: [localidade]" para números brasileiros
  // ou "DDI xx: [nome do país]" para internacionais (ddi diferente de 55)

  if (ddd && localidadeRaw && localidadeRaw !== "DDD não reconhecido") {
    localidade_formatada = `\nDDD ${ddd}: ${localidadeRaw}`;
  } else if (
    !ddd &&
    ddi &&
    pais &&
    pais !== "Brasil" &&
    localidadeRaw &&
    localidadeRaw !== "Número não reconhecido"
  ) {
    localidade_formatada = `\nDDI ${ddi}: ${localidadeRaw}`;
  }

  info_econodata = obterEconodata(texto);
  
  origem_global = obterOrigem(textoMinusculo);
  interesse_global = obterInteresse(texto);
  porte_global = obterPorte(texto);

  nome_do_contato = obterNomeDoContato(texto);
  nome_da_empresa = obterEmpresa(texto);
  email_do_contato = obterEmail(texto);

  site_da_empresa = obterSiteEmpresa(texto);

  assunto_formatado = obterAssunto(texto);

  perfil_linkedin = obterLinkedin(texto);

  mensagem_fila_a = formatarTextoLeadFilaA()

  // Exibe as informações capturadas nos elementos HTML correspondentes
  document.getElementById("origemLead").textContent = origem_global;
  document.getElementById("interesseLead").textContent = interesse_global;
  document.getElementById("porteLead").textContent = porte_global;

  document.getElementById("info-econodata").textContent = info_econodata;

  document.getElementById("resultado").textContent = mensagem_fila_a;
}


async function carregarArquivoTxt(nomeVar, caminhoArquivo) {
  try {
    const resposta = await fetch(caminhoArquivo);
    if (!resposta.ok) {
      throw new Error(
        "Erro ao carregar " + caminhoArquivo + ": " + resposta.status
      );
    }
    const conteudo = await resposta.text();
    window[nomeVar] = conteudo; // Atribui o conteúdo à variável global
  } catch (erro) {
    console.error(erro);
  }
}

// Exemplo: Carregando o arquivo de perguntas para consultoria e venda
Promise.all([
  carregarArquivoTxt(
    "PerguntasBackgroundCheck",
    "perguntas/perguntas_background.txt"
  ),

  carregarArquivoTxt(
    "PerguntasConsultoria",
    "perguntas/perguntas_consultoria.txt"
  ),

  carregarArquivoTxt("PerguntaseCommerce", "perguntas/perguntas_ecommerce.txt"),

  carregarArquivoTxt(
    "PerguntasHeadhunting",
    "perguntas/perguntas_headhunting.txt"
  ),

  carregarArquivoTxt(
    "PerguntasInteligenciaArtificial",
    "perguntas/perguntas_ia.txt"
  ),

  carregarArquivoTxt("PerguntasMobile", "perguntas/perguntas_mobile.txt"),

  carregarArquivoTxt("PerguntasMoodle", "perguntas/perguntas_moodle.txt"),

  carregarArquivoTxt(
    "PerguntasOutsourcing",
    "perguntas/perguntas_outsourcing.txt"
  ),

  carregarArquivoTxt("PerguntasRPA", "perguntas/perguntas_rpa.txt"),

  carregarArquivoTxt("PerguntasWeb", "perguntas/perguntas_web.txt"),
]);

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
  if (nome_do_contato) {
    nome_do_contato = nome_do_contato;
    copiarParaClipboard(nome_do_contato);
  } else {
    copiarParaClipboard("Nome nao identificado");
    mostrarPopUp("Nome nao identificado");
  }
}

// Função principal que formata a empresa
function copiarEmpresa() {
  if (nome_da_empresa) {
    nome_da_empresa = nome_da_empresa;
    copiarParaClipboard(nome_da_empresa);
  } else {
    copiarParaClipboard("Sem informação");
    mostrarPopUp("Empresa não identificada.");
  }
}

// Função principal que formata o perfil do LinkedIn
function copiarLinkedin() {

  if (perfil_linkedin) {
    copiarParaClipboard(perfil_linkedin);
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
  if (assunto_formatado) {
    copiarParaClipboard(assunto_formatado);
    mostrarPopUp("Assunto copiado!");
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
  if (email_do_contato) {
    copiarParaClipboard(email_do_contato);
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

    // Tenta extrair o DDI para telefones não brasileiros (sem DDD)
    let ddi = "";
    if (!resultado.ddd) {
      // O formato esperado para números internacionais é: "+<DDI> ..."
      const ddiRegex = /^\+(\d{1,3})\s/;
      const ddiMatch = resultado.formatado.match(ddiRegex);
      if (ddiMatch) {
        ddi = ddiMatch[1];
      }
    }

    return {
      telefone: resultado.formatado,
      localidade: resultado.localidade,
      ddd: resultado.ddd,
      pais: resultado.pais,
      ddi: ddi,
    };
  } else {
    return {
      telefone: "não informado",
      localidade: "",
      ddd: null,
      pais: "",
      ddi: "",
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
      triggers: ["fale conosco - agence", "mensagem enviada através do site agence"],
      value: "Origem: Formulário Fale Conosco",
    },
    {
      triggers: ["[leads] [pop-up", "identificador: pop-up-", "popup"],
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
      triggers: ["verificación", "backg", "verificação", "verificacao"],
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
  // Remove espaços extras, quebra de linha e se existir a palavra "funcionários" no final
  let quantidade = valor.replace(/^[\s\n]+|[\s\n]+$/g, "").trim();
  quantidade = quantidade.split(/\r?\n/)[0].trim();
  quantidade = quantidade.replace(/funcionários\s*$/i, "").trim();
  return quantidade;
}

function obterQuantidadeFuncionarios(texto) {
  // Defina os marcadores que delimitam os dados de funcionários
  const marcadorInicio = "Busque por nome da empresa ou CNPJ"; // Altere conforme necessário
  const marcadorFim = "Natureza Jurídica"; // Altere conforme necessário

  // Se os marcadores existirem, extraímos somente o trecho entre eles
  let textoAnalise = texto;
  const inicio = texto.indexOf(marcadorInicio);
  const fim = texto.indexOf(marcadorFim, inicio + marcadorInicio.length);
  if (inicio !== -1 && fim !== -1) {
    textoAnalise = texto.substring(inicio + marcadorInicio.length, fim).trim();
  }

  // Lista de regexes para capturar a quantidade de funcionários
  const regexes = [
    /icone Quantidade de Funcionários\s*Quantidade de Funcionários\s*([\s\S]*?)(?=icone like|icone dislike|$)/i,
    /Quantidade de Funcionários\s*:\s*([^<\n\r]+)/i,
    /(\d+\s*a\s*\d+)\s*funcionários/i,
    /(\d{1,3}(?:[.,]\d{3})*\s*a\s*\d{1,3}(?:[.,]\d{3})*)\s*funcionários/i,
    /icone\s+Funcionários\s+Funcionários\s+(Acima\s+de\s+[\d.,]+\s*funcionários)\s+Ícone\s+de\s+dados\s+da\s+receita\s+federal/i,
    // Outros regexes se necessário
  ];

  for (const regex of regexes) {
    const correspondencia = textoAnalise.match(regex);
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
  // // Extrai o email usando a função auxiliar já existente
  let emailFormatado = obterEmail(texto);

  // Caso não seja possível extrair o email, retorna COMPANY_URL
  if (!emailFormatado) return "COMPANY_URL";

  // Obtém a parte do domínio do email
  let dominio_do_site = emailFormatado.split("@")[1];
  if (!dominio_do_site) return "COMPANY_URL";

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
  let dominioLower = dominio_do_site.toLowerCase();
  for (let personal of dominiosPessoais) {
    if (dominioLower === personal) {
      return "COMPANY_URL";
    }
  }

  // Para outros domínios, adiciona 'www.' na frente
  return "www." + dominio_do_site;
}

function formatarTextoLeadFilaA() {

  if (info_econodata) {
    info_econodata_fila_a = `${info_econodata}\n\n`;
  } else info_econodata_fila_a = "";

  if (perfil_linkedin.includes("https://www.linkedin.com")) {
    dois_pontos = ":";
  } else {
    dois_pontos = "";
  }

  let nome_fila = "Fila A"; // Valor padrão
  if (origem_global.toLowerCase().includes("outbound")) {
    nome_fila = "Fila Outbound";
  }

  const mensagem_fila_a = `Chegou lead na ${nome_fila} para o @\n\nEmpresa: ${nome_da_empresa}\nContato: ${nome_do_contato}\nTelefone: ${telefone_formatado}${localidade_formatada}\nE-mail: ${email_do_contato}\n${interesse_global}\n${origem_global}\nLinkedin${dois_pontos} ${perfil_linkedin}\n\n${info_econodata_fila_a}Site da empresa: ${site_da_empresa}\n--------------------------------------------------------\npróximo da fila é o @`;

  return mensagem_fila_a;
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

function obterEconodata(texto) {
  let info_econodata = "";

  const cnpjRegexSpecific =
    /, opera com o CNPJ (\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i;

  const cnpjRegexOriginal = /CNPJ: (\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i;

  // Array de regexes na ordem de prioridade
  const cnpjRegexes = [
    cnpjRegexSpecific,
    cnpjRegexOriginal,
  ];

  let cnpjMatch = null;

  // Iterar sobre os regexes até encontrar um match
  for (let regex of cnpjRegexes) {
    cnpjMatch = texto.match(regex);
    if (cnpjMatch) {
      break; // Sai do loop ao encontrar o primeiro match
    }
  }

  // Se o CNPJ for encontrado, adiciona as informações à string info_econodata
  if (cnpjMatch) {
    info_econodata += `CNPJ: ${cnpjMatch[1]}\n`;
    info_econodata += obterPorte(texto) + "\n";
    info_econodata += obterQuantidadeFuncionarios(texto) + "\n";
    info_econodata += obterFaturamentoAnual(texto);
  }

  return info_econodata.trim();
}

function copiarInformacoesEconodata() {
  const textoParaCopiar = document.getElementById(
    "info-econodata"
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
  nome_do_contato = obterNomeDoContato(texto);
  nome_da_empresa = obterEmpresa(texto);

  if (nome_do_contato && nome_da_empresa) {
    const query = `${nome_do_contato} ${nome_da_empresa} Linkedin`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  } else {
    mostrarPopUp("Nome do contato e/ou nome da empresa não identificados.");
  }
}

function SiteDaEmpresa() {

  if (email_do_contato) {
    const dominio = email_do_contato.split("@")[1];
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

  mensagem_consultor = `Chegou lead para você.\n\nEmpresa: ${nome_da_empresa}\nContato: ${nome_do_contato}\nTelefone: ${telefone_formatado}${localidade_formatada}\nE-mail: ${email_do_contato}\n${interesse_global}\n${origem_global}\n\nAssunto: ${assunto_formatado}`;

  // Atualizando o elemento HTML com o texto especial
  document.getElementById("mensagem-consultor").textContent = mensagem_consultor;
}

function copiarTextoLeadConsultor() {
  formatarTextoLeadConsultor(); // Garante que o texto especial esteja atualizado
  navigator.clipboard
    .writeText(mensagem_consultor)
    .then(() => {
      mostrarPopUp("Texto copiado!");
    })
    .catch((err) => {
      console.error("Erro ao copiar o texto especial: ", err);
      mostrarPopUp("Falha ao copiar o texto especial.");
    });
}

function formatarPromptGPT() {

  let interesse_formatado = interesse_global.split(": ")[1]

  prompt_GPT_formatado = `Acesse o site ${site_da_empresa} e me traga um resumo do que essa empresa faz, seus principais serviços e principais clientes.

Além disso, e segundo meu contexto como potencial fornecedor de ${interesse_formatado}, e sabendo que é esse o serviço desejado por essa empresa, quais seriam as perguntas que eu devo fazer utilizando a metodologia GPCTBA & CI nessa primeira reunião que terei com eles. Considere também que esse lead da empresa ${nome_da_empresa} chegou com o seguinte texto no formulário do fale conosco: "${assunto_formatado}"

Quais são os principais clientes e concorrentes diretos da ${nome_da_empresa}? E o que estão fazendo de inovação nesse ramo que sou potencial fornecedor.

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
    .writeText(prompt_GPT_formatado)
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
      perguntasDefault = PerguntasConsultoria;
      break;

    case DEFAULT_INTERESTS.BACKGROUND_CHECK:
      perguntasDefault = PerguntasBackgroundCheck;
      break;

    case DEFAULT_INTERESTS.RPA:
      perguntasDefault = PerguntasRPA;
      break;

    case DEFAULT_INTERESTS.DESENVOLVIMENTO_MOBILE:
      perguntasDefault = PerguntasMobile;
      break;

    case DEFAULT_INTERESTS.DESENVOLVIMENTO_WEB:
      perguntasDefault = PerguntasWeb;
      break;

    case DEFAULT_INTERESTS.EAD_MOODLE:
      perguntasDefault = PerguntasMoodle;
      break;

    case DEFAULT_INTERESTS.E_COMMERCE:
      perguntasDefault = PerguntaseCommerce;
      break;

    case DEFAULT_INTERESTS.OUTSOURCING:
      perguntasDefault = PerguntasOutsourcing;
      break;

    case DEFAULT_INTERESTS.HEADHUNTING:
      perguntasDefault = PerguntasHeadhunting;
      break;

    case DEFAULT_INTERESTS.INTELIGENCIA_ARTIFICIAL:
      perguntasDefault = PerguntasInteligenciaArtificial;
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

/* Classe que encapsula a lógica de um Popup Editor de forma modular */
class PopupEditor {
  constructor(options) {
    // As opções devem incluir os elementos do DOM:
    // openButton, popupContainer, closeButton, textArea, copyButton.
    // Também pode receber uma função "formatter" para transformar o texto, se necessário.
    this.openButton = options.openButton;
    this.popupContainer = options.popupContainer;
    this.closeButton = options.closeButton;
    this.textArea = options.textArea;
    this.copyButton = options.copyButton;
    this.formatter = options.formatter || (text => text);

    this._attachEvents();
  }

  _attachEvents() {
    // Abre o popup ao clicar no botão de abrir
    if (this.openButton) {
      this.openButton.addEventListener('click', () => {
        this.open();
      });
    }
    // Fecha o popup ao clicar no botão de fechar
    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => {
        this.close();
      });
    }
    // Fecha o popup ao clicar fora do conteúdo
    window.addEventListener('click', (event) => {
      if (event.target === this.popupContainer) {
        this.close();
      }
    });
    // Fecha o popup ao pressionar ESC
    document.addEventListener('keydown', (event) => {
      if (event.key === "Escape") {
        this.close();
      }
    });
    // Evento para copiar o texto (já formatado, se função for fornecida)
    if (this.copyButton) {
      this.copyButton.addEventListener('click', () => {
        this.copy();
      });
    }
  }

  open() {
    this.popupContainer.style.display = 'flex';
    // Opcional: focar a área de texto ao abrir
    if (this.textArea) {
      this.textArea.focus();
    }
  }

  close() {
    this.popupContainer.style.display = 'none';
  }

  copy() {
    const rawText = this.textArea.value;
    const formattedText = this.formatter(rawText);
    navigator.clipboard.writeText(formattedText).then(() => {
      this._showPopUpMessage('Texto copiado!');
      // Fecha o popup após copiar
      this.close();
    }).catch((err) => {
      this._showPopUpMessage('Erro ao copiar o texto');
      console.error(err);
    });
  }

  _showPopUpMessage(message) {
    // Exibe o popup de mensagem (exemplo simples)
    let messageElem = document.querySelector('.pop-up-message');
    if (!messageElem) {
      messageElem = document.createElement('div');
      messageElem.className = 'pop-up-message';
      // Estilo básico; pode ser customizado via CSS
      messageElem.style.position = 'fixed';
      messageElem.style.top = '20px';
      messageElem.style.right = '20px';
      messageElem.style.padding = '10px 20px';
      messageElem.style.background = '#333';
      messageElem.style.color = '#fff';
      messageElem.style.borderRadius = '4px';
      messageElem.style.zIndex = '1000';
      document.body.appendChild(messageElem);
    }
    messageElem.textContent = message;
    messageElem.style.opacity = '1';
    setTimeout(() => {
      messageElem.style.opacity = '0';
    }, 1000);
  }
}

function formatText(text) {
  const texto = document.getElementById("inputText").value;
  const interesse = obterInteresse(texto);
  const perguntasDefault = obterPerguntasDefault(interesse);
  
  const lines = text.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim() !== '');
  const result = [];

  nonEmptyLines.forEach(line => {
    let formattedLine = line;

    // Se linha termina com "?", adiciona prefixo "- "
    if (line.trim().endsWith('?')) {
      formattedLine = '- ' + line;
    }

    // Regra 1: "TEXTO_EXTRAORDINÁRIO" com 2 quebras de linha antes e depois
    if (line.indexOf("TEXTO_EXTRAORDINÁRIO") !== -1) {
      result.push('');
      result.push('');
      result.push(formattedLine);  // Será substituído depois
      result.push('');
      result.push('');
    }
    // Regra 2: "Principais clientes" (ignora case) – se a linha tiver até 100 caracteres
    else if (line.toLowerCase().indexOf("principais clientes") !== -1) {
      if (line.trim().length <= 100) {
        result.push('');
        result.push('');
        result.push('**' + formattedLine + '**');
      } else {
        result.push('');
        result.push(formattedLine);
      }
    }
    // Regra 3: "Perguntas" e "nos fazer": envolve com asteriscos
    else if (line.indexOf("Perguntas") !== -1 && line.indexOf("nos fazer") !== -1) {
      result.push('**' + formattedLine + '**');
    }
    // Regra 4: "termos de inovação": insere linha vazia antes
    else if (line.indexOf("termos de inovação") !== -1) {
      result.push('');
      result.push(formattedLine);
    }
    // Regra 5: linhas que contenham ":" ou "R: " ou "?"
    else if (line.indexOf(':') !== -1 || line.indexOf("R: ") !== -1 || line.indexOf('?') !== -1) {
      result.push('');
      result.push(formattedLine);
    }
    // Regra 6: caso contrário, insere normalmente
    else {
      result.push(formattedLine);
    }
  });

  // Junta todas as linhas formatadas
  let finalText = result.join('\n');
  // Realiza a substituição global do termo "TEXTO_EXTRAORDINÁRIO"
  finalText = finalText.split("TEXTO_EXTRAORDINÁRIO").join(perguntasDefault);
  
  return finalText;
}


/* Exemplo de utilização do PopupEditor */
document.addEventListener('DOMContentLoaded', () => {
  const popupEditorInstance = new PopupEditor({
    openButton: document.getElementById('openPopupEditor'),
    popupContainer: document.getElementById('popupEditor'),
    closeButton: document.getElementById('closePopup'),
    textArea: document.getElementById('popupText'),
    copyButton: document.getElementById('popupCopyText'),
    formatter: formatText // Função para formatação customizada
  });
});
