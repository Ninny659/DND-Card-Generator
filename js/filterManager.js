// Level and Type Filter Management
function initialiseLevelFilters() {
    const levelOptions = document.getElementById('level_options');
    
    // Create level filters (0-9 for cantrip through 9th level)
    for (let i = 0; i <= 9; i++) {
        const li = document.createElement('li');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        
        checkbox.type = 'checkbox';
        checkbox.value = i;
        checkbox.checked = true; // All checked by default
        
        const levelText = i === 0 ? 'Cantrip' : `Level ${i}`;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(levelText));
        li.appendChild(label);
        levelOptions.appendChild(li);
        
        // Add to selectedLevels
        CONFIG.selectedLevels.push(i);
        
        // Add change listener
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!CONFIG.selectedLevels.includes(i)) {
                    CONFIG.selectedLevels.push(i);
                }
            } else {
                CONFIG.selectedLevels = CONFIG.selectedLevels.filter(lvl => lvl !== i);
            }
            filterDisplayedCards();
        });
    }
}

function initialiseTypeFilters() {
    const typeOptions = document.getElementById('type_options');
    
    // Create type filters based on CARD_TYPES
    CARD_TYPES.forEach(cardType => {
        const li = document.createElement('li');
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        
        checkbox.type = 'checkbox';
        checkbox.value = cardType.key;
        checkbox.checked = true; // All checked by default
        
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(cardType.label));
        li.appendChild(label);
        typeOptions.appendChild(li);
        
        // Add to selectedTypes
        CONFIG.selectedTypes.push(cardType.key);
        
        // Add change listener
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!CONFIG.selectedTypes.includes(cardType.key)) {
                    CONFIG.selectedTypes.push(cardType.key);
                }
            } else {
                CONFIG.selectedTypes = CONFIG.selectedTypes.filter(type => type !== cardType.key);
            }
            filterDisplayedCards();
        });
    });
}