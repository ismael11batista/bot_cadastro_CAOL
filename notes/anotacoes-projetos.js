document.addEventListener('DOMContentLoaded', function () {
    const btnAdicionarAnotacao = document.getElementById("btn-adicionar");
    const listaAnotacoes = document.getElementById("lista-anotacoes");
    const novaAnotacao = document.getElementById("nova-anotacao");

    btnAdicionarAnotacao.addEventListener('click', adicionarAnotacao);

    novaAnotacao.addEventListener('keydown', function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            adicionarAnotacao();
        }
    });

    function adicionarAnotacao() {
        if (novaAnotacao.value.trim() === '') {
            alert("Você deve escrever algo!");
        } else {
            let li = document.createElement("li");
            li.textContent = novaAnotacao.value;
            let span = document.createElement("span");
            span.textContent = "\u00D7";
            span.className = "remover-anotacao";
            li.appendChild(span);

            // Adicionar funcionalidade de remoção
            span.addEventListener('click', function (e) {
                e.stopPropagation(); // Impede que o evento de clique no li seja disparado
                li.remove();
                salvarAnotacoes();
            });

            listaAnotacoes.appendChild(li);
            novaAnotacao.value = "";
            salvarAnotacoes();
        }
    }

    function salvarAnotacoes() {
        localStorage.setItem("anotacoes", listaAnotacoes.innerHTML);
    }

    function carregarAnotacoes() {
        listaAnotacoes.innerHTML = localStorage.getItem("anotacoes") || "";
        let spans = listaAnotacoes.getElementsByClassName("remover-anotacao");
        for (let span of spans) {
            span.addEventListener('click', function (e) {
                e.stopPropagation();
                span.parentElement.remove();
                salvarAnotacoes();
            });
        }
    }

    carregarAnotacoes();
});