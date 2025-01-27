function carregarTexto(nomeArquivo) {
    fetch(nomeArquivo)
        .then(response => response.text())
        .then(texto => {
            navigator.clipboard.writeText(texto)
                .then(() => {
                    mostrarPopUp("Texto copiado com sucesso!");
                }).catch(err => {
                    console.error("Erro ao copiar texto: ", err);
                    mostrarPopUp("Erro ao copiar texto.");
                });
        }).catch(err => {
            console.error("Erro ao carregar o arquivo: ", err);
            mostrarPopUp("Erro ao carregar o arquivo.");
        });
}

function mostrarPopUp(mensagem) {
    const popUp = document.getElementById("popUp");
    popUp.textContent = mensagem; // Altera o texto do pop-up para refletir a ação ou erro.
    popUp.classList.add("active");
    setTimeout(() => {
        popUp.classList.remove("active");
    }, 3000); // O pop-up desaparece após 3 segundos
}