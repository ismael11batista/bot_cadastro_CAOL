let NomeDoContato = "";
let NomeDaEmpresa = "";
let EmailDoContato = "";
let TextoLeadConsultor = ""; // Variável global para armazenar o texto especial
let EmailFormatado = "";
var textoFormatadoGlobal = ""; // Variável global para armazenar o texto formatado
let PromptGPTFormatado = "";

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

// Função interna para extrair e formatar o e-mail
function obterEmail(texto) {
  const emailRegex = /E-mail: (.+)|Email: (.+)/i;
  const emailMatch = texto.match(emailRegex);
  if (emailMatch) {
    return (emailMatch[1] || emailMatch[2]).toLowerCase();
  } else {
    return "não informado";
  }
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

// Função interna para identificar a origem
function obterOrigem(textoMinusculo) {
  if (
    textoMinusculo.includes("agencechatbot76@gmail.com") ||
    textoMinusculo.includes("origem: chatbot")
  ) {
    return "Origem: Inbound Chatbot";
  } else if (
    textoMinusculo.includes("origem: telefone") ||
    textoMinusculo.includes("origem: ligação")
  ) {
    return "Origem: Ligação ao Escritório";
  } else if (textoMinusculo.includes("origem: whats")) {
    return "Origem: Inbound Whatsapp";
  } else if (
    textoMinusculo.includes("origem: inbound lp mobile")
  ) {
    return "Origem: Formulário LP Mobile";
  } else if (textoMinusculo.includes("falecom@agence.com.br")) {
    return "Origem: Inbound E-mail";
  } else if (textoMinusculo.includes("fale conosco - agence")) {
    return "Origem: Formulário Fale Conosco";
  } else if (
    textoMinusculo.includes("origem: outbound e-mail") ||
    textoMinusculo.includes("origem: outbound email")
  ) {
    return "Origem: Outbound E-mail";
  } else if (textoMinusculo.includes("origem: outbound linkedin")) {
    return "Origem: Outbound Linkedin";
  } else if (textoMinusculo.includes("origem: outbound bdr")) {
    return "Origem: Outbound BDR";
  } else {
    return "Origem: não identificada";
  }
}

// Função interna para identificar o interesse
function obterInteresse(texto) {
  const necessidadeRegex = /Necessidade: (.+)/i;
  const interesseRegex = /Estou interessado em: (.+)/i;
  const necessidadeMatch = texto.match(necessidadeRegex);
  const interesseMatch = texto.match(interesseRegex);

  let interesse = "Interesse: não informado";

  if (necessidadeMatch) {
    interesse = "Interesse: " + necessidadeMatch[1];
  } else if (interesseMatch) {
    interesse = "Interesse: " + interesseMatch[1];
  } else if (texto.includes("© 2024 Agence. Todos os direitos reservados.")) {
    interesse = "Interesse: Desenvolvimento Mobile";
  }

  // Verifica se o interesse contém termos específicos
  if (interesse.toLowerCase().includes("rpa")) {
    interesse = "Interesse: Robotic Process Automation (RPA)";
  } else if (interesse.toLowerCase().includes("consultoria")) {
    interesse = "Interesse: Consultoria de Ti";
  } else if (
    interesse.toLowerCase().includes("aplicativo") ||
    interesse.toLowerCase().includes("mobile")
  ) {
    interesse = "Interesse: Desenvolvimento Mobile";
  } else if (interesse.toLowerCase().includes("headhunting")) {
    interesse = "Interesse: Headhunting de Ti";
  } else if (interesse.toLowerCase().includes("outsourcing")) {
    interesse = "Interesse: Outsourcing de Ti";
  } else if (interesse.toLowerCase().includes("web")) {
    interesse = "Interesse: Desenvolvimento Web";
  } else if (interesse.toLowerCase().includes("commerce")) {
    interesse = "Interesse: e-Commerce";
  } else if (interesse.toLowerCase().includes("moodle")) {
    interesse = "Interesse: EAD - e-Learning Moodle";
  }

  return interesse;
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
function obterQuantidadeFuncionarios(texto) {
  const funcionariosRegex =
    /icone Quantidade de Funcionários\s*Quantidade de Funcionários\s*([\s\S]*?)(?:icone like|icone dislike|$)/i;

  const match = texto.match(funcionariosRegex);
  if (match && match[1]) {
    // Remove espaços extras e a palavra "funcionários" do final
    let quantidade = match[1]
      .replace(/^[\s\n]+|[\s\n]+$/g, "")
      .replace(/\s*funcionários\s*$/i, "")
      .trim();
    return `Número de Funcionários: ${quantidade}`;
  }

  // Fallback para outros padrões possíveis
  const fallbackRegexes = [
    /Quantidade de Funcionários\s*:\s*([^<\n]+)/i,
    /(\d+\s*a\s*\d+)\s*funcionários/i,
  ];

  for (let regex of fallbackRegexes) {
    const fallbackMatch = texto.match(regex);
    if (fallbackMatch && fallbackMatch[1]) {
      let quantidade = fallbackMatch[1].trim();
      return `Número de Funcionários: ${quantidade}`;
    }
  }

  return "Número de Funcionários: não informado";
}

function obterFaturamentoAnual(texto) {
  const faturamentoRegex =
    /icone Faturamento Anual\s*Faturamento Anual\s*([\s\S]*?)(?:icone like|icone dislike|$)/i;

  const match = texto.match(faturamentoRegex);
  if (match && match[1]) {
    let faturamento = match[1].replace(/^[\s\n]+|[\s\n]+$/g, "").trim();
    if (faturamento.toLowerCase() === "desconhecido") {
      return "Faturamento Anual: Desconhecido";
    }
    return `Faturamento Anual: ${faturamento}`;
  }

  // Fallback para outros padrões possíveis
  const fallbackRegexes = [
    /Faturamento Anual\s*:\s*([^<\n]+)/i,
    /Faturamento Anual\s*(R?\$?\s*[\d,.]+ (?:mil|milh(?:ão|ões))(?: a R?\$?\s*[\d,.]+ (?:mil|milh(?:ão|ões)))?)/i,
  ];

  for (let regex of fallbackRegexes) {
    const fallbackMatch = texto.match(regex);
    if (fallbackMatch && fallbackMatch[1]) {
      let faturamento = fallbackMatch[1].trim();
      return `Faturamento Anual: ${faturamento}`;
    }
  }

  return "Faturamento Anual: não informado";
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

  let EmailFormatado = obterEmail(texto);
  let siteDaEmpresa = EmailFormatado.split("@")[1];
  siteDaEmpresa = "www." + siteDaEmpresa;

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

  const resultadoTexto = `Chegou lead na ${nomeDaFila} para o @\n\nContato: ${NomeDoContato}\nEmpresa: ${NomeDaEmpresa}\nTelefone: ${telefone}${localidadeTexto}\n${interesse}\n${origem} \n\n${infoEconodata}Site da Empresa: ${siteDaEmpresa}\n\nLinkedin: ${perfilLinkedin}\n--------------------------------------------------------\npróximo da fila é o @`;
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
  const cnpjRegex = /CNPJ: (\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i;
  // Procurando pelo CNPJ no texto
  const cnpjMatch = texto.match(cnpjRegex);

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

Além disso, e segundo meu contexto como potencial fornecedor de ${interesse}, e sabendo que é esse o serviço desejado por essa empresa, quais seriam as 5 melhores perguntas que posso fazer a eles nessa primeira reunião que terei com eles. Considere também que esse lead da empresa ${NomeDaEmpresa} chegou com o seguinte texto no formulário do fale conosco: "${assuntoFormatado}"

Quais são os principais clientes e concorrentes diretos da ${NomeDaEmpresa}? E o que estão fazendo de inovação nesse ramo que sou potencial fornecedor.

Considerando esse contexto e o cenário que temos aqui, que tipos de perguntas poderíamos fazer a eles? Além disso, quais perguntas eles poderiam nos fazer, e quais seriam boas respostas que poderíamos oferecer?

Por favor me dê isso tudo em português do Brasil, o texto deve ser formatado de forma limpa e direta, sem o uso de cabeçalhos ou marcadores especiais, sem qualquer tipo de aspas ou caracteres que possam dar problema em códigos de sistemas.`;
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
