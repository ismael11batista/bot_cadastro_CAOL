function ajustarValor(valor) {
    valor = valor.replace("R$ ", "").replace(".", "").replace(",", ".");
    return parseFloat(valor) || 0;
}

function calcularTotais() {
    // Fábrica
    const consultoriaRequisitos = ajustarValor(document.getElementById('consultoriaRequisitos1').value) + 
                                  ajustarValor(document.getElementById('consultoriaRequisitos2').value);
    const desenvolvimentoMobile = ajustarValor(document.getElementById('desenvolvimentoMobile1').value) + 
                                  ajustarValor(document.getElementById('desenvolvimentoMobile2').value);
    const desenvolvimentoWeb = ajustarValor(document.getElementById('desenvolvimentoWeb1').value) + 
                               ajustarValor(document.getElementById('desenvolvimentoWeb2').value);
    const eCommerce = ajustarValor(document.getElementById('eCommerce1').value) + 
                      ajustarValor(document.getElementById('eCommerce2').value);
    const eadMoodle = ajustarValor(document.getElementById('eadMoodle1').value) + 
                      ajustarValor(document.getElementById('eadMoodle2').value);
    const rpa = ajustarValor(document.getElementById('rpa1').value) + 
                ajustarValor(document.getElementById('rpa2').value);

    // Staff Augmentation
    const headhunting = ajustarValor(document.getElementById('headhunting1').value) + 
                        ajustarValor(document.getElementById('headhunting2').value);
    const outsourcing = ajustarValor(document.getElementById('outsourcing1').value) + 
                        ajustarValor(document.getElementById('outsourcing2').value);
    const backgroundCheck = ajustarValor(document.getElementById('backgroundCheck1').value) + 
                            ajustarValor(document.getElementById('backgroundCheck2').value);

    // Display
    const display = ajustarValor(document.getElementById('display1').value) +
                    ajustarValor(document.getElementById('display2').value);

    const totalFabrica = consultoriaRequisitos + desenvolvimentoMobile + desenvolvimentoWeb + 
                         eCommerce + eadMoodle + rpa;
    const totalStaffAugmentation = headhunting + outsourcing + backgroundCheck;
    const totalGeral = totalFabrica + totalStaffAugmentation + display;

    document.getElementById('resultados').innerHTML = `
        <h3>Resultados por Serviço:</h3>
        <p class="clicavel">Consultoria de TI: R$ <span>${consultoriaRequisitos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p class="clicavel">Desenvolvimento Mobile: R$ <span>${desenvolvimentoMobile.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p class="clicavel">Desenvolvimento Web: R$ <span>${desenvolvimentoWeb.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p class="clicavel">e-Commerce: R$ <span>${eCommerce.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p class="clicavel">e-Learning Moodle: R$ <span>${eadMoodle.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p class="clicavel">RPA - Robotic Process Automation: R$ <span>${rpa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p class="clicavel">Headhunting de TI: R$ <span>${headhunting.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p class="clicavel">Outsourcing de TI: R$ <span>${outsourcing.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p class="clicavel">Background Check: R$ <span>${backgroundCheck.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        
        <h3>Resultados por Categoria:</h3>
        <p id="totalFabrica" class="clicavel">Total Fábrica: R$ <span>${totalFabrica.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p id="totalStaffAugmentation" class="clicavel">Total Staff Augmentation: R$ <span>${totalStaffAugmentation.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p id="totalDisplay" class="clicavel">Total Display: R$ <span>${display.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p id="totalGeral" class="clicavel">Total Geral: R$ <span>${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
    `;

    adicionarOuvintesDeCliqueParaTotais();
}

function adicionarOuvintesDeCliqueParaTotais() {
    document.querySelectorAll('.clicavel').forEach(elemento => {
        elemento.addEventListener('click', function () {
            const textoParaCopiar = this.querySelector('span').textContent.trim();
            copiarParaClipboard(textoParaCopiar);
        });
    });
}

function copiarParaClipboard(texto) {
    navigator.clipboard.writeText(texto)
        .then(() => {
            console.log('Texto copiado com sucesso!');
            mostrarPopUp('Valor copiado para a área de transferência!');
        })
        .catch(err => console.error('Falha ao copiar texto:', err));
}

function mostrarPopUp(mensagem) {
    let popUp = document.querySelector('.pop-up');
    if (!popUp) {
        popUp = document.createElement('div');
        popUp.className = 'pop-up';
        document.body.appendChild(popUp);
    }
    popUp.textContent = mensagem;
    popUp.classList.add('active');

    setTimeout(() => {
        popUp.classList.remove('active');
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    calcularTotais();
});