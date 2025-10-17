class DragAndDropContainer {
  constructor(containerId, itemID) {
    this.container = document.getElementById(containerId);
    this.itemClass = itemID;
    this.draggedItem = null;
    this.placeholder = document.createElement('div');
    this.placeholder.className = 'placeholder';
    this.initEvents();
  }

  initEvents() {
    this.container.addEventListener('dragstart', (e) => this.onDragStart(e));
    this.container.addEventListener('dragend', (e) => this.onDragEnd(e));
    this.container.addEventListener('dragover', (e) => this.onDragOver(e));
    this.container.addEventListener('drop', (e) => this.onDrop(e));
  }

  onDragStart(e) {
    if (e.target.parentNode.classList.contains(this.itemClass)) {
      console.log('Drag start:', e.target);

      this.draggedItem = e.target.parentNode;
      this.draggedItem.classList.add('dragging');

      const rect = this.draggedItem.getBoundingClientRect();
      this.placeholder.style.width = `${rect.width}px`;
      this.placeholder.style.height = `${rect.height}px`;

      // Ajoute un écouteur de mouvement de souris pour suivre la souris
      document.addEventListener('mousemove', this.onMouseMove.bind(this));

      // Prépare l'élément pour suivre la souris
      this.updateDraggedItemPosition(e);
    }
  }

  onDragEnd(e) {
    if (this.draggedItem) {
      console.log('Drag ended:', e.target);

      // Retirer la classe 'dragging' et réinitialiser la position de l'élément
      this.draggedItem.classList.remove('dragging');
      this.draggedItem.style.position = ''; // Réinitialiser la position
      this.draggedItem.style.left = ''; // Réinitialiser le 'left'
      this.draggedItem.style.top = ''; // Réinitialiser le 'top'

      // Supprimer l'écouteur de mouvement de la souris
      document.removeEventListener('mousemove', this.onMouseMove.bind(this));

      if (this.placeholder.parentNode) {
        this.placeholder.parentNode.removeChild(this.placeholder);
      }
      this.draggedItem = null;
    }
  }

  onDragOver(e) {
    e.preventDefault();
    const afterElement = this.getDragAfterElement(e.clientX);
    if (afterElement == null) {
      this.container.appendChild(this.placeholder);
    } else {
      this.container.insertBefore(this.placeholder, afterElement);
    }
  }

  onDrop(e) {
    e.preventDefault();
    if (this.placeholder.parentNode && this.draggedItem) {
      this.container.insertBefore(this.draggedItem, this.placeholder);
      this.placeholder.parentNode.removeChild(this.placeholder);
      saveFavoritesToLocalStorage(); // Sauvegarde à chaque drop
    }
  }

  onMouseMove(e) {
    if (this.draggedItem) {
      this.updateDraggedItemPosition(e);
    }
  }

  updateDraggedItemPosition(e) {
    // Déplace l'élément pour qu'il suive la souris
    this.draggedItem.style.position = 'absolute';
    this.draggedItem.style.left = `${e.clientX - this.draggedItem.offsetWidth / 2}px`;
    this.draggedItem.style.top = `${e.clientY - this.draggedItem.offsetHeight / 2}px`;
  }

  getDragAfterElement(x) {
    const draggableElements = [...this.container.querySelectorAll(`.${this.itemClass}:not(.dragging)`)];
    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - (box.left + box.width / 2);
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
}

// Initialisation DragAndDrop
const dndContainer = new DragAndDropContainer('tiles-container', 'fav-link');
