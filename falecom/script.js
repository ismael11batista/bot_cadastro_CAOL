/* ================================  
   Código Completo do JavaScript  
   Extração Separada de Variáveis para Facilitar a Manutenção  
   ================================ */

/* --- Funções de Extração de Dados --- */

// Extrai e formata o nome a partir do texto
function obterNome(texto) {
  const nomeRegexes = [
    /(?<=para:\s)(.*?)(?=\s<)/,
    /(?<=From: ')(.*?)(?=' via Falecom)/,
    /(?<=From: falecom@agence.com.br <falecom@agence.com.br> On Behalf Of )(.*?)(?=\r?\nSent:)/,
    /(?<=From: falecom@agence.com.br <falecom@agence.com.br> On Behalf Of )(.*?)(?=\nSent:)/,
  ];
  let nomeFormatado = "";
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
  return nomeFormatado;
}

// Extrai o primeiro email válido a partir do texto
function obterEmail(texto) {
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
  const todosEmails = texto.match(emailRegex) || [];
  const emailsValidos = todosEmails.filter(
    (email) => !emailsIgnorados.includes(email.toLowerCase())
  );
  return emailsValidos.length > 0 ? emailsValidos[0].toLowerCase() : "";
}

// Extrai o primeiro telefone válido a partir do texto
function obterTelefone(texto) {
  const telefoneRegexes = [
    /\b(?:\+?(\d{1,3}))?[-. ]?(\d{2,3})[-. ]?(\d{4,5})[-. ]?(\d{4})\b/g,
    /\+\d{1,3}\s?$\d{1,3}$\s?\d{4,5}-\d{4}/g,
    /\+\d{1,3}\s?$\d{1,3}$\s?\d{3,4}-\d{4}/g,
  ];
  const telefonesIgnorados = [
    "+5512992117495",
    "+551121577514",
    "11987654321",
    "+56227998951",
    "+56974529257",
    "+551135542187",
  ];

  let todosTelefones = [];
  telefoneRegexes.forEach((regex) => {
    const encontrados = [...texto.matchAll(regex)].map((match) => match[0]);
    todosTelefones = [...todosTelefones, ...encontrados];
  });
  const telefonesValidos = todosTelefones.filter(
    (telefone) => !telefonesIgnorados.includes(telefone.replace(/[-. ()]/g, ""))
  );
  return telefonesValidos.length > 0 ? telefonesValidos[0] : "";
}

// Extrai e formata o assunto a partir do texto
function obterAssunto(texto) {
  const assuntoRegexes = [
    /(?<=Subject: )([\s\S]*?)(?=\d{1,2} de \w+\. de \d{4}, \d{1,2}:\d{2})/,
    /(?<=Subject: )([\s\S]*?)(?=\n\n\n)/,
  ];
  // Listas para processamento adicional do assunto
  const iniciosParaRemoverAssunto = [
    "Ismael Borges Batista",
    // Adicione mais inícios se necessário
  ];
  const termosParaRemoverAssunto = [
    // Adicione termos específicos para remoção, se necessário
  ];
  const termosParaCorteAssunto = [
    "Atenciosamente",
    "Obrigado",
    "Obrigada",
    "[Mensagem cortada]",
    "Exibir toda a mensagem",
  ];

  let assuntoFormatado = "\n\nASSUNTO_FORMATADO\n";
  for (const regex of assuntoRegexes) {
    const assuntoMatch = texto.match(regex);
    if (assuntoMatch) {
      let assunto = assuntoMatch[0].trim();
      // Processamento adicional: remover linhas e termos indesejados e ajustar quebras de linha
      assunto = removerLinhasPorInicio(assunto, iniciosParaRemoverAssunto);
      assunto = removerTermosEspecificos(assunto, termosParaRemoverAssunto);
      assunto = ajustarQuebrasDeLinha(assunto);
      assunto = removerTextoAposTermos(assunto, termosParaCorteAssunto);
      assuntoFormatado = assunto.charAt(0).toUpperCase() + assunto.slice(1);
      break;
    }
  }
  return assuntoFormatado;
}

/* --- Função Principal para Formatar o Lead --- */
function FormatarLeadFaleCom(texto) {
  const nomeFormatado = obterNome(texto);
  const emailFormatado = obterEmail(texto);
  const telefoneFormatado = obterTelefone(texto);
  const assuntoFormatado = obterAssunto(texto);

  const textoFormatado = `Nome: ${nomeFormatado}\nEmpresa: \nEmail: ${emailFormatado}\nEstou interessado em: \nTelefone: ${telefoneFormatado}\nComentários: ${assuntoFormatado}\nAgence - falecom@agence.com.br`;
  window.textoFormatadoGlobal = textoFormatado; // Armazena globalmente, se necessário
  return textoFormatado;
}

/* --- Funções Auxiliares --- */

// Remove o texto a partir de termos específicos
function removerTextoAposTermos(texto, termosParaCorte) {
  for (const termo of termosParaCorte) {
    const index = texto.indexOf(termo);
    if (index !== -1) {
      texto = texto.substring(0, index);
    }
  }
  return texto.trim();
}

// Remove linhas que começam com algum dos termos fornecidos
function removerLinhasPorInicio(texto, iniciosParaRemover) {
  let linhas = texto.split("\n");
  linhas = linhas.filter(
    (linha) => !iniciosParaRemover.some((inicio) => linha.startsWith(inicio))
  );
  return linhas.join("\n");
}

// Remove termos específicos ignorando maiúsculas e minúsculas
function removerTermosEspecificos(texto, termosParaRemover) {
  termosParaRemover.forEach((termo) => {
    texto = texto.replace(new RegExp(termo, "gi"), "");
  });
  return texto;
}

// Adiciona quebras de linha antes de horários (formato HH:MM)
function ajustarQuebrasDeLinha(texto) {
  const linhas = texto.split("\n");
  let textoAjustado = "";
  for (let i = 0; i < linhas.length; i++) {
    if (linhas[i].match(/\b\d{1,2}:\d{2}\b/) && i > 0 && linhas[i - 1] !== "") {
      textoAjustado += "\n";
    }
    textoAjustado += linhas[i] + (i < linhas.length - 1 ? "\n" : "");
  }
  return textoAjustado;
}

/* --- Função para Ajustar o Texto de Entrada --- */
function ajustarTexto() {
  let texto = document.getElementById("inputText").value;

  // Remover dias da semana em caixa alta
  const diasSemana = [
    "SEGUNDA-FEIRA",
    "TERÇA-FEIRA",
    "QUARTA-FEIRA",
    "QUINTA-FEIRA",
    "SEXTA-FEIRA",
    "SÁBADO",
    "DOMINGO",
    "HOJE",
  ];
  diasSemana.forEach((dia) => {
    texto = texto.replace(new RegExp(dia + "\\n", "g"), "");
  });

  // Remover Emojis
  texto = texto.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}\u{1FC00}-\u{1FCFF}\u{1FD00}-\u{1FDFF}\u{1FE00}-\u{1FEFF}\u{1FF00}-\u{1FFFF}]+/gu,
    ""
  );

  // Listas de remoção para linhas e termos
  const iniciosParaRemover = [
    "Nenhum selecionado",
    "Como usar o E-mail de Agence.com.br ",
    "Conversa aberta.",
    "Pular para o conteúdo",
    "De: Felipe Santos",
    "Enviada em:",
    "Para: ",
    "Assunto:",
    "ATENÇÃO:  Esta mensagem é de REMETENTE EXTERNO",
    "*** NOVO *** NÃO digite sua SENHA WEG",
    "Negócios Especiais  •",
    "AGENCE CONSULTING – CORPORATE ",
    "Brasil – São Paulo - SP",
    "Brasil – Campo Grande",
    "www.agence.com.br  |  www.agence.global",
    "LEGAL NOTICE",
    "Caixa de entrada",
    "Externa",
    "Importante",
    "1 de",
    "RES: ",
    "HOJE",
    "[Mensagem cortada]  Exibir toda a mensagem",
    "_______________",
    "Obter o Outlook para Android",
    "Enviado: ",
    "Sent: ",
    "From: Felipe H. Santos",
    "Email já foi Respondido",
    "Resposta positiva",
    "Re: ",
    "To: ",
    "Subject: ",
    "De: Felipe H",
    "...",
    "para mim",
    "Área de anexos",
    'De: "Felipe Santos"',
    "Enviadas: ",
    "Resposta negativa",
    "This message",
    '"Esta mensagem',
    '"This message',
    "seg.,",
    "ter.,",
    "qua., ",
    "qui., ",
    "sex., ",
    "From: Felipe H. Santos ",
    "Como usar o E-mail de Os.agence.com.br com leitores de tela",
    "Já foi Respondida",
    "Resposta Positiva",
    "www.agence.com.br  |  agence.global",
    "Tel.: +55 (11) 3554-2187",
    "Marketing & Vendas",
    "Ismael Borges Batista",
    "Esta mensagem e seus anexos podem conter informações confidenciais ou privilegiadas,",
    "https://www.agence.com.br/  |  https://www.agence.global/",
    "1 anexo",
    "Anexos",
    "Brasil – São Paulo • Brasil – Campo Grande • Colombia – Bogotá • USA – New York",
    "Novos Negócios • Nuevos Negocios • Business Development",
    "para Ismael",
    "De: Ismael B. Batista - ismael.batista@os.agence.com.br",
    "Esta mensagem contém informações de propriedade",
  ];
  const termosParaRemover = [
    "Conexão de 1º grau",
    "· 1º",
    "felipe.santos@agence.com.br",
    "Atenciosamente,",
    "Felipe H. Santos",
    "ZjQcmQRYFpfptBannerStart",
    "ZjQcmQRYFpfptBannerEnd",
    "Book time",
    "From: Felipe Santos <>",
    "Diretora de Expansão e Novos Negócios",
  ];

  texto = removerLinhasPorInicio(texto, iniciosParaRemover);
  texto = removerTermosEspecificos(texto, termosParaRemover);
  texto = ajustarQuebrasDeLinha(texto);
  // Remove linhas extras indesejadas (ex.: aquelas iniciadas por "Ver perfil de" ou padrões de envio)
  texto = texto
    .split("\n")
    .filter((linha) => !linha.startsWith("Ver perfil de"))
    .filter(
      (linha) =>
        !linha.match(/enviou as seguintes mensagens às \d{1,2}:\d{2}/) &&
        !linha.match(/enviou a seguinte mensagem às \d{1,2}:\d{2}/)
    )
    .join("\n");
  texto = texto.replace(/\n\n+/g, "\n\n").trim();

  // Usa a função principal para extrair e formatar os dados do lead
  const textoFormatado = FormatarLeadFaleCom(texto);
  document.getElementById("adjustedText").innerText = textoFormatado;
}

/* --- Função para Copiar o Texto Ajustado para a Área de Transferência --- */
function copiarTextoParaClipboard() {
  const textoAjustado = document.getElementById("adjustedText").innerText;
  navigator.clipboard
    .writeText(textoAjustado)
    .then(() => {
      mostrarPopUp("Texto copiado para a área de transferência!");
    })
    .catch((err) => {
      console.error("Erro ao copiar texto: ", err);
      mostrarPopUp("Erro ao copiar texto.");
    });
}

/* --- Função para Exibir Pop-Up de Mensagens --- */
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
  }, 3000);
}

/* --- Eventos e Inicializações --- */
// Atualiza o texto ajustado conforme o conteúdo do inputText muda
document.getElementById("inputText").addEventListener("input", ajustarTexto);
// Copia o texto ajustado ao clicar no botão copyToClipboard
document
  .getElementById("copyToClipboard")
  .addEventListener("click", copiarTextoParaClipboard);
// Ajusta o texto ao carregar a página
window.onload = ajustarTexto;
