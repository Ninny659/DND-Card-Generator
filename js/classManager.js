// Class Selection Management
const ClassManager = {
    /**
     * Initialize class selection checkboxes
     */
    initialize() {
        const classOptionsUl = document.getElementById('class_options');
        classOptionsUl.innerHTML = '';

        Object.keys(CLASS_DATA).forEach(className => {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = className;
            checkbox.id = className.toLowerCase();

            const label = document.createElement('label');
            label.htmlFor = className.toLowerCase();
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(className));

            li.appendChild(label);
            classOptionsUl.appendChild(li);
        });
    },

    /**
     * Update selected classes array
     */
    updateSelectedClasses() {
        CONFIG.selectedClasses.length = 0;
        
        const checkboxes = document.querySelectorAll("#class_options input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                CONFIG.selectedClasses.push(checkbox.name);
            }
        });
        
        console.log('Selected classes:', CONFIG.selectedClasses);
    }
};