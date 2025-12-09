// Main Application Logic and Event Handlers

// Store all cards globally
let allLoadedCards = [];

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    ClassManager.initialize();

    initialiseLevelFilters();
    initialiseTypeFilters();

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
