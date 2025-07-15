const baseTodoId = 'todoitem';
let todoList = JSON.parse(localStorage.getItem('todoList')) || [];

const PRIORITIES = {
    high: { name: 'Высокий', class: 'high-priority', order: 1 },
    medium: { name: 'Средний', class: 'medium-priority', order: 2 },
    low: { name: 'Низкий', class: 'low-priority', order: 3 },
    none: { name: 'Без приоритета', class: 'no-priority', order: 4 }
};

function saveToLocalStorage() {
    localStorage.setItem('todoList', JSON.stringify(todoList));
}

function deleteElement(id) {
    const index = todoList.findIndex(item => item.id === id);
    todoList.splice(index, 1);
    saveToLocalStorage();
    document.getElementById(baseTodoId + id).remove();
}

function deleteSelected() {
    const checkboxes = document.querySelectorAll('.todo-checkbox:checked');
    const idsToDelete = Array.from(checkboxes).map(checkbox => parseInt(checkbox.dataset.id));
    
    idsToDelete.forEach(id => {
        const index = todoList.findIndex(item => item.id === id);
        if (index !== -1) {
            todoList.splice(index, 1);
            document.getElementById(baseTodoId + id).remove();
        }
    });
    
    saveToLocalStorage();
}

function addToDo() {
    const form = document.forms.toDoForm;

    const newTodo = {
        id: createNewId(),
        title: form.elements.title.value,
        priority: form.elements.priority.value,
        color: form.elements.color.value,
        description: form.elements.description.value,
        date: form.elements.date.value,
        createdAt: new Date().toISOString()
    };

    todoList.push(newTodo);
    saveToLocalStorage();
    renderTodos(getCurrentSortMode());
    form.reset();
}

function createNewId() {
    return todoList.length === 0 ? 
        1 : Math.max(...todoList.map(todo => todo.id)) + 1;
}

function addToDoToHtml(newToDo) {
    const div = document.createElement('div');
    div.id = baseTodoId + newToDo.id;
    div.className = 'row my-2 task-card';

    div.innerHTML = `<div class="col">
                        <div class="card">
                            <div class="card-header d-flex justify-content-between align-items-center" style="background-color: ${newToDo.color}">
                                <div class="form-check">
                                    <input class="form-check-input todo-checkbox" type="checkbox" data-id="${newToDo.id}">
                                </div>
                                <div>
                                    ${newToDo.date ? `<span class="badge bg-secondary">${newToDo.date}</span>` : ''}
                                    <span class="badge ${PRIORITIES[newToDo.priority].class} priority-badge">
                                        ${PRIORITIES[newToDo.priority].name}
                                    </span>
                                </div>
                            </div>
                            <div class="card-body">
                                <h5 class="card-title">${newToDo.title}</h5>
                                <p class="card-text">${newToDo.description}</p>
                                <button type="button" class="btn btn-link text-danger" onclick="deleteElement(${newToDo.id})">
                                    Удалить
                                </button>
                            </div>
                        </div>
                     </div>`;
                     
    return div;
}

function getCurrentSortMode() {
    return document.querySelector('.sort-btn.active').id === 'sortByDateBtn' ? 'date' : 'creation';
}

function renderTodos(sortBy = 'date') {
    const todosContainer = document.getElementById('todosContainer');
    todosContainer.innerHTML = '';

    // Создаем секции для каждого приоритета
    Object.entries(PRIORITIES).forEach(([priorityKey, priorityData]) => {
        const section = document.createElement('div');
        section.className = `priority-section ${priorityData.class}`;
        
        const title = document.createElement('h3');
        title.className = `priority-title ${priorityData.class}`;
        title.textContent = priorityData.name;
        section.appendChild(title);

        const sectionContent = document.createElement('div');
        
        // Фильтруем и сортируем задачи для этой секции
        const filteredTodos = todoList.filter(todo => todo.priority === priorityKey);
        
        const sortedTodos = [...filteredTodos].sort((a, b) => {
            if (sortBy === 'date') {
                if (!a.date && !b.date) return new Date(b.createdAt) - new Date(a.createdAt);
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(a.date) - new Date(b.date);
            } else {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        // Добавляем задачи в секцию
        sortedTodos.forEach(todo => {
            sectionContent.appendChild(addToDoToHtml(todo));
        });

        section.appendChild(sectionContent);
        todosContainer.appendChild(section);
    });
}

function loadTodos() {
    renderTodos(getCurrentSortMode());
}