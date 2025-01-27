document.addEventListener("DOMContentLoaded", function () {
    console.log("Página carregada com sucesso!");

    // Implementação do seletor dropdown
    const selectField = document.getElementById('selectField');
    const list = document.getElementById('list');
    const options = document.querySelectorAll('.options');

    selectField.addEventListener('click', function () {
        list.classList.toggle('hide');
    });

    options.forEach(option => {
        option.addEventListener('click', function () {
            window.location.href = option.getAttribute('data-url');
        });
    });

    // Selecionando os botões pelo ID e adicionando eventos de clique
    document.getElementById('calendarBtn').addEventListener('click', function () {
        window.location.href = 'calendar/calendario.html';
    });

    document.getElementById('notesBtn').addEventListener('click', function () {
        window.location.href = 'notes/notes.html';
    });

    document.getElementById('textFormatterBtn').addEventListener('click', function () {
        window.location.href = 'leads/leads.html';
    });

    document.getElementById('LinkedinBtn').addEventListener('click', function () {
        window.location.href = 'bdr/index.html';
    });
});