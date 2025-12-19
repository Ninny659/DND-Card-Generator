// Main Application Logic and Event Handlers

// Store all cards globally
let allLoadedCards = [];

let selectedCards = new Set();
let lastClickedCard = null;

function setupCardSelection() {
    document.addEventListener('click', (e) => {
        // Check if clicking on a card
        const card = e.target.closest('.card');
        if (!card || card.classList.contains('backing-card')) return;

        // Ignore if right-clicking (context menu)
        if (e.button === 2) return;

        // Handle different selection modes
        if (e.ctrlKey || e.metaKey) {
            // Ctrl/Cmd: Toggle selection
            toggleCardSelection(card);
        } else if (e.shiftKey && lastClickedCard) {
            // Shift: Range select
            rangeSelectCards(lastClickedCard, card);
        } else {
            // Normal click: Select only this card
            clearSelection();
            selectCard(card);
        }

        lastClickedCard = card;
    });

    // Clear selection when clicking outside cards
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.card') && !e.target.closest('#cardContextMenu')) {
            clearSelection();
        }
    });
}

function selectCard(card) {
    selectedCards.add(card);
    card.classList.add('selected');
}

function deselectCard(card) {
    selectedCards.delete(card);
    card.classList.remove('selected');
}

function toggleCardSelection(card) {
    if (selectedCards.has(card)) {
        deselectCard(card);
    } else {
        selectCard(card);
    }
}

function clearSelection() {
    selectedCards.forEach(card => {
        card.classList.remove('selected');
    });
    selectedCards.clear();
    lastClickedCard = null;
}

function rangeSelectCards(startCard, endCard) {
    const allCards = Array.from(document.querySelectorAll('.card:not(.backing-card)'));
    const startIndex = allCards.indexOf(startCard);
    const endIndex = allCards.indexOf(endCard);

    if (startIndex === -1 || endIndex === -1) return;

    const [start, end] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];

    for (let i = start; i <= end; i++) {
        selectCard(allCards[i]);
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    ClassManager.initialize();

    initialiseLevelFilters();
    initialiseTypeFilters();

    setupCardSelection();

    const createCardBtn = document.getElementById('createCardBtn');
    if (createCardBtn) {
        createCardBtn.addEventListener('click', (e) => {
            showCreateCardMenu(e);
        });
    }

    // Duplicate class options for import tab
    const importClassOptions = document.getElementById('class_options_import');
    if (importClassOptions) {
        Object.keys(CLASS_DATA).forEach(className => {
            const li = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = className;
            checkbox.id = className.toLowerCase() + '_import';

            const label = document.createElement('label');
            label.htmlFor = className.toLowerCase() + '_import';
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(className));

            li.appendChild(label);
            importClassOptions.appendChild(li);
        });
    }
});

/* Function to show the card type selection menu 
*/
function showCreateCardMenu(e) {
    // Create a temporary menu
    const menu = document.createElement('div');
    menu.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 4px 0;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 150px;
    `;
    
    // Add card type options
    CARD_TYPES.forEach(cardType => {
        const item = document.createElement('div');
        item.textContent = cardType.label;
        item.style.cssText = 'padding: 8px 12px; cursor: pointer;';
        item.onmouseover = () => item.style.background = '#f0f0f0';
        item.onmouseout = () => item.style.background = 'white';
        item.onclick = () => {
            createNewCardFromButton(cardType);
            document.body.removeChild(menu);
        };
        menu.appendChild(item);
    });
    
    // Position menu near the button
    const btnRect = e.target.getBoundingClientRect();
    menu.style.left = btnRect.left + 'px';
    menu.style.top = (btnRect.bottom + 5) + 'px';
    
    document.body.appendChild(menu);
    
    // Close menu when clicking elsewhere
    const closeMenu = (event) => {
        if (!menu.contains(event.target)) {
            if (document.body.contains(menu)) {
                document.body.removeChild(menu);
            }
            document.removeEventListener('click', closeMenu);
        }
    };
    
    // Delay adding the listener so this click doesn't immediately close it
    setTimeout(() => {
        document.addEventListener('click', closeMenu);
    }, 10);
}

function createNewCardFromButton(cardType) {
    // Prompt for card name
    const name = prompt(`Enter name for new ${cardType.label}:`);
    if (!name) return;

    // Create base data object
    const newData = {
        name: name,
        classes: []
    };

    // Add default values based on card type
    if (cardType.key === 'spell') {
        newData.level = 0;
        newData.school = '';
    } else if (cardType.key === 'weapon') {
        newData.type = 'Weapon';
        newData.damage = '';
    } else if (cardType.key === 'armor') {
        newData.type = 'Armor';
        newData.armorClass = '';
    }

    // Create the card using CardGenerator
    const newCard = CardGenerator.createCard(newData, cardType.key, cardType.fields);

    // Add to allLoadedCards array
    allLoadedCards.push(newCard);

    // Rebuild sheets to include new card
    filterDisplayedCards();
}

/**
 * Filter cards in preview based on selected classes
 */
function filterDisplayedCards() {
    const previewArea = document.getElementById('previewArea');
    previewArea.innerHTML = '';

    // Filter cards by class, level, and type
    const filtered = allLoadedCards.filter(card => {
        const data = card._data || card._spell;
        const cardType = card._cardType || 'spell';

        // Filter by card type
        if (!CONFIG.selectedTypes.includes(cardType)) {
            return false;
        }

        // Filter by level (only for spells)
        if (cardType === 'spell') {
            const level = data.level !== undefined ? data.level : 0;
            if (!CONFIG.selectedLevels.includes(level)) {
                return false;
            }
        }

        // Filter by class (if any classes are selected)
        if (CONFIG.selectedClasses.length === 0) {
            return true; // No class filter active
        }

        const cardClasses = data.classes || [];
        return cardClasses.some(c => CONFIG.selectedClasses.includes(c));
    });

    // Build and display sheets
    const sheets = CardGenerator.buildSheets(filtered);
    sheets.forEach(sheet => previewArea.appendChild(sheet));
    CardGenerator.enableDrag();
}

/**
 * Rebuild sheets from visible cards
 */
function rebuildSheets(visibleCards) {
    const preview = document.getElementById('previewArea');
    preview.innerHTML = '';

    if (visibleCards.length === 0) {
        preview.innerHTML = '<p style="padding: 20px; background: white;">No cards match the selected classes.</p>';
        return;
    }

    // Update allLoadedCards references to match the visible cards
    // This ensures context menu operations work on the correct card objects
    const sheets = CardGenerator.buildSheets(visibleCards);
    sheets.forEach(s => preview.appendChild(s));

    CardGenerator.enableDrag();
}

/**
 * Store cards when generating
 */
function generateCardsFromYAML() {
    const raw = document.getElementById('yamlInput').value.trim();
    if (!raw) {
        document.getElementById('previewArea').innerHTML = '';
        allLoadedCards = [];
        return;
    }

    let spells;
    try {
        spells = jsyaml.load(raw);
    } catch (e) {
        console.error('YAML parse error:', e.message);
        return;
    }

    if (!Array.isArray(spells)) {
        console.error('YAML must be an array of spell objects.');
        return;
    }

    // Create cards and store them
    allLoadedCards = spells.map(s => CardGenerator.createCard(s));

    const preview = document.getElementById('previewArea');
    preview.innerHTML = '';

    // Apply current filter
    filterDisplayedCards();
}

// Auto-generate cards when YAML changes
let generateTimeout;
document.getElementById('yamlInput').addEventListener('input', () => {
    clearTimeout(generateTimeout);
    generateTimeout = setTimeout(() => {
        generateCardsFromYAML();
    }, 500); // Debounce 500ms
});

// Load Example Button
document.getElementById('loadExample').addEventListener('click', async () => {
    try {
        let spells;

        // Get selected classes from import tab
        const importCheckboxes = document.querySelectorAll("#class_options_import input[type='checkbox']:checked");
        const importSelectedClasses = Array.from(importCheckboxes).map(cb => cb.name);

        if (importSelectedClasses.length > 0) {
            spells = await FileHandler.loadSpellsFromClasses(importSelectedClasses);

            if (spells.length === 0) {
                alert('No spells found for selected classes. Check file paths.');
                return;
            }
        } else {
            spells = jsyaml.load(EXAMPLE_SPELLS);
        }

        const cleanYAML = jsyaml.dump(spells);
        document.getElementById('yamlInput').value = cleanYAML;

        // Trigger auto-generation
        generateCardsFromYAML();

        console.log(`Loaded ${spells.length} spells`);

    } catch (error) {
        console.error('Error loading spells:', error);
        alert('Error loading spells: ' + error.message);
    }
});

// Backing File Upload
document.getElementById('backingFile').addEventListener('change', (e) => {
    FileHandler.handleBackingImageUpload(e.target.files[0]);

    // Regenerate sheets if cards exist
    if (allLoadedCards.length > 0) {
        filterDisplayedCards();
    }
});

// Download PDF Button
document.getElementById('downloadPdf').addEventListener('click', () => {
    const preview = document.getElementById('previewArea');
    if (!preview.querySelector('.sheet')) {
        alert('Generate cards first');
        return;
    }

    // Create a clean container with only sheets
    const printContainer = document.createElement('div');
    printContainer.style.cssText = 'margin: 0; padding: 0; background: white;';

    preview.querySelectorAll('.sheet').forEach(sheet => {
        const clone = sheet.cloneNode(true);
        clone.style.margin = '0';
        clone.style.border = 'none';
        clone.style.boxShadow = 'none';
        printContainer.appendChild(clone);
    });

    html2pdf().set({
        margin: 0,
        filename: 'spell_cards_a4.pdf',
        image: {
            type: 'jpeg',
            quality: 0.98
        },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    }).from(printContainer).save();
});

// Save Cards Button
document.getElementById('saveCards').addEventListener('click', () => {
    const preview = document.getElementById('previewArea');
    const cards = preview.querySelectorAll('.card:not(.backing-card)');

    if (cards.length === 0) {
        alert('No cards to save. Generate cards first.');
        return;
    }

    const spellsData = [];

    cards.forEach(card => {
        const spell = card._spell;
        if (spell) {
            const borderColor = card.style.borderColor;
            if (borderColor) {
                spell._customBorderColor = borderColor;
            }
            spellsData.push(spell);
        }
    });

    const yamlOutput = jsyaml.dump(spellsData);
    const blob = new Blob([yamlOutput], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'saved_cards.yml';
    a.click();

    URL.revokeObjectURL(url);

    console.log(`Saved ${spellsData.length} cards`);
});

// Load Saved Cards Button
document.getElementById('loadSavedCards').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yml,.yaml';

    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const spells = jsyaml.load(text);

            if (!Array.isArray(spells)) {
                alert('Invalid file format. Must be a YAML array of spells.');
                return;
            }

            // Create and store cards
            allLoadedCards = spells.map(spell => {
                const card = CardGenerator.createCard(spell);

                if (spell._customBorderColor) {
                    card.style.borderColor = spell._customBorderColor;
                }

                return card;
            });

            // Apply current filter
            filterDisplayedCards();

            console.log(`Loaded ${spells.length} cards`);

        } catch (error) {
            console.error('Error loading file:', error);
            alert('Error loading file: ' + error.message);
        }
    });

    input.click();
});

// Tab switching functionality
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;

        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    });
});

// Class Selection Handler for Editor tab - with filtering
document.getElementById("class_options").addEventListener('click', () => {
    // Small delay to let checkbox state update
    setTimeout(() => {
        CONFIG.selectedClasses.length = 0;
        const checkboxes = document.querySelectorAll("#class_options input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                CONFIG.selectedClasses.push(checkbox.name);
            }
        });

        console.log('=== Filter Update ===');
        console.log('Selected classes:', CONFIG.selectedClasses);

        // Only filter if cards exist
        if (allLoadedCards.length > 0) {
            filterDisplayedCards();
        }
    }, 10);
});

document.addEventListener('keydown', (e) => {
    // Check for Ctrl+P (Windows/Linux) or Cmd+P (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        alert('Please use the "Download PDF" button to print your cards.');
        return false;
    }
});

