const inputBox = document.getElementById("input-box");
const listContainer = document.getElementById("list-container");

function addTask() {
    if (inputBox.value === '') {
        alert("Você deve escrever algo!");
    } else {
        let li = document.createElement("li");
        li.innerHTML = inputBox.value;
        listContainer.appendChild(li);
        let span = document.createElement("span");
        span.innerHTML = "\u00D7";
        li.appendChild(span);

        // Adiciona um evento de clique no span para remover a tarefa
        span.onclick = function () {
            this.parentElement.remove();
            saveData();
        }

        inputBox.value = "";
        saveData();
    }
}

listContainer.addEventListener("click", function (e) {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        saveData();
    }
}, false);

function saveData() {
    localStorage.setItem("data", listContainer.innerHTML);
}

function showTask() {
    listContainer.innerHTML = localStorage.getItem("data");
    // Reatribui o evento de clique nos spans após carregar
    let spans = listContainer.getElementsByTagName("span");
    for (let span of spans) {
        span.onclick = function () {
            this.parentElement.remove();
            saveData();
        }
    }
}

document.addEventListener('DOMContentLoaded', showTask);

// Modificação aqui para usar "keydown" em vez de "keypress"
inputBox.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault(); // Previne a quebra de linha em caixas de texto (comportamento padrão do Enter)
        addTask();
    }
});