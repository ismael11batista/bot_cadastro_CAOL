let dataAtual = new Date();
let dataAnterior = new Date(dataAtual.getTime());
dataAnterior.setDate(dataAnterior.getDate() - 1);

const hojeChave = chaveData(new Date()); // Chave da data atual
const diaAtualChave = chaveData(dataAtual); // Chave da data visualizada na interface


function chaveData(data) {
    let dia = ('0' + data.getDate()).slice(-2);
    let mes = ('0' + (data.getMonth() + 1)).slice(-2);
    let ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
}

function atualizarInterface() {
    document.getElementById('data-atual').textContent = formatarData(dataAtual);
    document.getElementById('data-anterior').textContent = formatarData(dataAnterior);
    recuperarTarefas();
    adicionarIconesDeCopiar(); // Chamada da nova função para adicionar ícones
}

// Função para adicionar ícones de cópia
function adicionarIconesDeCopiar() {
    document.querySelectorAll('.dia').forEach(dia => {
        const iconeCopiar = document.createElement('span');
        iconeCopiar.innerHTML = '&#128203;'; // Unicode para ícone de clipe de papel, exemplo
        iconeCopiar.classList.add('icone-copiar');
        iconeCopiar.style.cursor = 'pointer';

        // Definindo o atributo data-dia baseado no ID do container do dia
        const diaId = dia.id.includes('atual') ? 'atual' : 'anterior';
        iconeCopiar.setAttribute('data-dia', diaId);

        iconeCopiar.onclick = copiarAtividadesDia;

        if (!dia.querySelector('.icone-copiar')) {
            dia.insertBefore(iconeCopiar, dia.firstChild);
        }
    });
}

function copiarAtividadesDia() {
    const dia = this.getAttribute('data-dia');
    // Seleciona apenas o texto das atividades, excluindo o conteúdo de outros elementos como botões
    const tarefas = Array.from(document.getElementById(`tarefas-${dia}`).children).map(li => {
        const textoTarefa = li.querySelector('span.editable').textContent.trim(); // Ajuste seletor conforme necessário
        return textoTarefa;
    }).join('. ') + '.';

    navigator.clipboard.writeText(tarefas)
        .then(() => mostrarPopUp('Atividades copiadas para a área de transferência!'))
        .catch(err => console.error('Falha ao copiar atividades:', err));
}


function mostrarPopUp(mensagem) {
    let popUp = document.querySelector('.pop-up');
    if (!popUp) {
        popUp = document.createElement('div');
        popUp.className = 'pop-up';
        document.body.appendChild(popUp);
    }
    popUp.textContent = mensagem;

    // Ativa o pop-up
    popUp.classList.add('active');

    // Desativa e remove o pop-up após 1 segundo
    setTimeout(() => {
        popUp.classList.remove('active');
        setTimeout(() => popUp.remove(), 500); // Espera a transição de desaparecimento antes de remover
    }, 1000);
}

function formatarData(data) {
    const opcoes = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return data.toLocaleDateString('pt-BR', opcoes).replace(',', ' -');
}

function adicionarTarefa(dia) {
    const entradaId = `entrada-${dia}`;
    const tarefasId = `tarefas-${dia}`;
    const inputValue = document.getElementById(entradaId).value.trim();
    const dataChave = dia === 'atual' ? chaveData(dataAtual) : chaveData(dataAnterior);

    if (inputValue) {
        const ul = document.getElementById(tarefasId);
        const li = criarElementoTarefa(inputValue, dataChave);
        ul.appendChild(li);
        document.getElementById(entradaId).value = '';
        salvarTarefas(dia);
    }
}

function criarElementoTarefa(texto, data) {
    const li = document.createElement('li');
    li.setAttribute('draggable', true);
    li.classList.add('draggable');

    const span = document.createElement('span');
    span.textContent = texto;
    span.setAttribute('contenteditable', true);
    span.classList.add('editable');

    // Adiciona evento para salvar ao pressionar Enter
    span.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Impede a quebra de linha
            span.blur(); // Remove o foco do elemento, simulando "salvar"
        }
    });

    span.addEventListener('blur', (e) => {
        const novoTexto = e.target.textContent.trim();
        if (!novoTexto) {
            li.remove();
        }
        salvarTarefas(data === chaveData(dataAtual) ? 'atual' : 'anterior');
    });

    li.appendChild(span);

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.className = 'btn-excluir';
    btnExcluir.onclick = function () {
        li.remove();
        salvarTarefas(data === chaveData(dataAtual) ? 'atual' : 'anterior');
        document.getElementById(`entrada-${data === chaveData(dataAtual) ? 'atual' : 'anterior'}`).focus();
    };
    li.appendChild(btnExcluir);

    li.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', null);
        li.classList.add('dragging');
    });

    li.addEventListener('dragend', e => {
        li.classList.remove('dragging');
        const dia = data === chaveData(dataAtual) ? 'atual' : 'anterior';
        salvarTarefas(dia);
    });

    return li;
}

function navegar(direcao) {
    if (direcao === 'anterior') {
        dataAtual.setDate(dataAtual.getDate() - 1);
        dataAnterior.setDate(dataAnterior.getDate() - 1);
    } else if (direcao === 'proximo') {
        dataAtual.setDate(dataAtual.getDate() + 1);
        dataAnterior.setDate(dataAnterior.getDate() + 1);
    }
    atualizarInterface();
    document.getElementById('entrada-anterior').focus();
}

function salvarTarefas(dia) {
    const dataChave = dia === 'atual' ? chaveData(dataAtual) : chaveData(dataAnterior);
    const tarefas = Array.from(document.getElementById(`tarefas-${dia}`).children).map(li => {
        const texto = li.querySelector('span').textContent;
        return { texto, data: dataChave };
    });
    localStorage.setItem(`tarefas_${dataChave}`, JSON.stringify(tarefas));
}

function recuperarTarefas() {
    const tarefasAnterior = JSON.parse(localStorage.getItem(`tarefas_${chaveData(dataAnterior)}`)) || [];
    const tarefasAtual = JSON.parse(localStorage.getItem(`tarefas_${chaveData(dataAtual)}`)) || [];

    const ulAnterior = document.getElementById('tarefas-anterior');
    ulAnterior.innerHTML = '';
    tarefasAnterior.forEach(tarefa => {
        ulAnterior.appendChild(criarElementoTarefa(tarefa.texto, tarefa.data));
    });

    const ulAtual = document.getElementById('tarefas-atual');
    ulAtual.innerHTML = '';
    tarefasAtual.forEach(tarefa => {
        ulAtual.appendChild(criarElementoTarefa(tarefa.texto, tarefa.data));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    atualizarInterface();
    document.getElementById('entrada-anterior').focus();
});

document.addEventListener('keydown', function (event) {
    const activeElement = document.activeElement;
    const dia = activeElement.id.includes('anterior') ? 'anterior' : 'atual';

    if (event.key === 'Enter') {
        if (activeElement.tagName === 'BUTTON') {
            activeElement.click();
        } else if (activeElement.tagName === 'TEXTAREA') {
            adicionarTarefa(dia);
        }
        event.preventDefault();

    } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        focusNextElement(false);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        focusNextElement(true);
    }
});

function focusNextElement(isShiftTab) {
    const focusableElements = Array.from(document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
    const currentIndex = focusableElements.indexOf(document.activeElement);
    let nextIndex = isShiftTab ? currentIndex - 1 : currentIndex + 1;

    if (nextIndex >= focusableElements.length) {
        nextIndex = 0;
    } else if (nextIndex < 0) {
        nextIndex = focusableElements.length - 1;
    }

    focusableElements[nextIndex].focus();
}

document.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
        return;
    }
    const ul = draggable.closest('ul');
    if (afterElement.element == null) {
        ul.appendChild(draggable);
    } else {
        ul.insertBefore(draggable, afterElement.element.nextElementSibling);
    }
});

document.addEventListener('drop', e => {
    if (e.target.className.includes('draggable')) {
        const draggable = document.querySelector('.dragging');
        const ul = draggable.closest('ul');
        const dia = ul.id.includes('anterior') ? 'anterior' : 'atual';
        salvarTarefas(dia);
    }
});

function getDragAfterElement(y) {
    const draggableElements = [...document.querySelectorAll('.draggable:not(.dragging)')];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY });
}

if (diaAtualChave === hojeChave) {
    document.querySelector('.dia#dia-atual').classList.add('hoje');
} else {
    document.querySelector('.dia#dia-atual').classList.remove('hoje');
}
