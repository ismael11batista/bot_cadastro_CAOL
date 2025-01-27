// Referências globais
let draggedElement;
let placeholder;
let prevX;
let prevY;
let newIndex;

// Obtem elementos irmãos arrastáveis
const getDraggableSiblings = (element) => {
    return Array.from(element.parentNode.children).filter(child => {
        return child.draggable;
    });
}

// Cria placeholder
const createPlaceholder = () => {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    return placeholder;
}

// Atualiza posição do placeholder  
const updatePlaceholderPosition = () => {
    placeholder.style.transform = `translate(${prevX}px, ${prevY}px)`;
}

// Calcula novo índice com busca binária
const calculateNewIndex = (siblings, cursorY) => {

    // Implementação busca binária  
    // Retorna novo índice  
    return newIndex;
}

// Atualiza índice no DOM
const updateElementIndex = (element, newIndex) => {

    // Remove elemento
    element.parentNode.removeChild(element);

    // Infere elemento anterior novo índice  
    const prevElement = siblings[newIndex - 1];

    // Insere no novo índice
    if (prevElement) {
        prevElement.parentNode.insertBefore(element, prevElement.nextSibling);
    } else {
        element.parentNode.prepend(element);
    }

}

// Eventos
document.addEventListener('touchstart', handleInteractionStart);

document.addEventListener('touchmove', handleInteractionMove);

document.addEventListener('touchend', handleInteractionEnd);

// Funções de interação
function handleInteractionStart(e) {

    if (!e.target.draggable) return;

    draggedElement = e.target;

    prevX = e.touches[0].clientX;

    prevY = e.touches[0].clientY;

    placeholder = createPlaceholder();

    draggedElement.parentNode.insertBefore(placeholder, draggedElement);

    draggedElement.style.transition = 'none';

}

function handleInteractionMove(e) {

    const newX = e.touches[0].clientX;
    const newY = e.touches[0].clientY;

    const distX = newX - prevX;
    const distY = newY - prevY;

    draggedElement.style.transform = `translate(${distX}px, ${distY}px)`;

    const siblings = getDraggableSiblings(draggedElement);

    newIndex = calculateNewIndex(siblings, newY);

    updatePlaceholderPosition();

    prevX = newX;
    prevY = newY;

}

function handleInteractionEnd(e) {

    draggedElement.style.removeProperty('transform');
    draggedElement.style.removeProperty('transition');

    draggedElement.parentNode.removeChild(placeholder);

    updateElementIndex(draggedElement, newIndex);

    draggedElement = null;
    placeholder = null;
    prevX = null;
    prevY = null;
    newIndex = null;
}