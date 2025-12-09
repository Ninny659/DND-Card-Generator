// Context Menu for Card Editing
const ContextMenu = {
    menu: null,
    currentCard: null,
    currentSpell: null,
    currentCardType: 'spell',

    /**
     * Create context menu element
     */
    create() {
        if (this.menu) return this.menu;

        const menu = document.createElement('div');
        menu.id = 'cardContextMenu';
        menu.style.cssText = `
            position: fixed;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 4px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 10000;
            display: none;
            min-width: 180px;
        `;
        document.body.appendChild(menu);
        return menu;
    },

    /**
     * Show context menu
     */
    show(e, card, data, cardType = 'spell') {
        e.preventDefault();

        this.currentCard = card;
        this.currentSpell = data; // Keep the name for backward compatibility
        this.currentCardType = cardType;

        const menu = this.create();
        menu.innerHTML = '';

        // Get existing field keys from the card
        const existingFields = this.getExistingFields();

        // Add field option with submenu
        const addFieldItem = this.createMenuItem('+ Add Field ▶');
        const addSubmenu = this.createAddFieldSubmenu(existingFields);
        addFieldItem.appendChild(addSubmenu);
        this.attachSubmenuBehavior(addFieldItem, addSubmenu);
        menu.appendChild(addFieldItem);

        // Only show edit/remove if there are fields to edit
        if (existingFields.length > 0) {
            // Separator
            menu.appendChild(this.createSeparator());

            // Edit field option with submenu
            const editFieldItem = this.createMenuItem('✏️ Edit Field ▶');
            const editSubmenu = this.createEditSubmenu(existingFields);
            editFieldItem.appendChild(editSubmenu);
            this.attachSubmenuBehavior(editFieldItem, editSubmenu);
            menu.appendChild(editFieldItem);

            // Remove field option with submenu
            const removeFieldItem = this.createMenuItem('🗑️ Remove Field ▶');
            const removeSubmenu = this.createRemoveSubmenu(existingFields);
            removeFieldItem.appendChild(removeSubmenu);
            this.attachSubmenuBehavior(removeFieldItem, removeSubmenu);
            menu.appendChild(removeFieldItem);
        }

        // Separator before card operations
        menu.appendChild(this.createSeparator());

        // Change color option
        const colorItem = this.createMenuItem('🎨 Change Border Color');
        colorItem.onclick = () => {
            this.changeBorderColor();
            this.hide();
        };
        menu.appendChild(colorItem);

        // Separator before card operations
        menu.appendChild(this.createSeparator());

        // Create card option
        const createCardItem = this.createMenuItem('🔨 Create Card ▶');
        const createCardItemSubmenu = this.createAddCardSubmenu(CARD_TYPES);
        createCardItem.appendChild(createCardItemSubmenu);
        this.attachSubmenuBehavior(createCardItem, createCardItemSubmenu);
        menu.appendChild(createCardItem);


        // Duplicate card option
        const duplicateItem = this.createMenuItem('📋 Duplicate Card');
        duplicateItem.onclick = () => {
            this.duplicateCard();
            this.hide();
        };
        menu.appendChild(duplicateItem);

        // Remove card option
        const removeCardItem = this.createMenuItem('❌ Remove Card');
        removeCardItem.onclick = () => {
            this.removeCard();
            this.hide();
        };
        menu.appendChild(removeCardItem);

        // Position menu with proper scroll offset
        menu.style.display = 'block';

        let left = e.clientX;
        let top = e.clientY;

        menu.style.left = '0px';
        menu.style.top = '0px';
        const menuRect = menu.getBoundingClientRect();

        if (left + menuRect.width > window.innerWidth) {
            left = window.innerWidth - menuRect.width - 5;
        }

        if (top + menuRect.height > window.innerHeight) {
            top = window.innerHeight - menuRect.height - 5;
        }

        menu.style.left = left + 'px';
        menu.style.top = top + 'px';

        this.menu = menu;
    },

    /**
         * Get existing field keys from the current card
         */
    getExistingFields() {
        if (!this.currentCard) return [];

        const fields = [];
        const labels = this.currentCard.querySelectorAll('.section-label');

        labels.forEach(label => {
            const fieldLabel = label.innerText;

            // Get available fields based on card type
            const availableFields = this.getAvailableFieldsForCardType();

            // Find matching field definition
            const field = availableFields.find(f => f.label === fieldLabel);
            if (field) {
                fields.push(field);
            }
        });

        return fields;
    },

    /**
     * Get available fields based on current card type
     */
    getAvailableFieldsForCardType() {
        const cardType = this.currentCardType || (this.currentCard ? this.currentCard._cardType : null) || 'spell';

        if (cardType === 'weapon') {
            return WEAPON_FIELDS;
        } else if (cardType === 'armor') {
            return ARMOR_FIELDS;
        } else {
            return AVAILABLE_FIELDS; // Default to spell fields
        }
    },

    /**
     * Create a menu item
     */
    createMenuItem(text) {
        const item = document.createElement('div');
        item.className = 'context-menu-item';
        item.innerHTML = text;
        item.style.cssText = 'padding: 8px 12px; cursor: pointer; position: relative;';
        item.onmouseover = () => item.style.background = '#f0f0f0';
        item.onmouseout = () => item.style.background = 'white';
        return item;
    },

    /**
         * Create submenu for adding different card types
         * @param {Array} cardTypes - Array of card type definitions
         */
    createAddCardSubmenu(cardTypes) {
        const submenu = this.createSubmenuContainer();

        cardTypes.forEach(cardType => {
            const cardItem = this.createSubmenuItem(cardType.label, () => {
                this.createNewCard(cardType);
                this.hide();
            });
            submenu.appendChild(cardItem);
        });

        return submenu;
    },

    /**
     * Create submenu for editing fields
     */
    createEditSubmenu(existingFields) {
        const submenu = this.createSubmenuContainer();

        existingFields.forEach(field => {
            const fieldItem = this.createSubmenuItem(field.label, () => {
                this.editField(field);
                this.hide();
            });
            submenu.appendChild(fieldItem);
        });

        return submenu;
    },

    /**
     * Create submenu for removing fields
     */
    createRemoveSubmenu(existingFields) {
        const submenu = this.createSubmenuContainer();

        existingFields.forEach(field => {
            const fieldItem = this.createSubmenuItem(field.label, () => {
                this.removeField(field);
                this.hide();
            });
            submenu.appendChild(fieldItem);
        });

        return submenu;
    },

    /**
     * Create submenu container
     */
    createSubmenuContainer() {
        const submenu = document.createElement('div');
        submenu.style.cssText = `
            position: absolute;
            left: 100%;
            top: 0;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 4px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            display: none;
            min-width: 150px;
            max-height: 300px;
            overflow-y: auto;
        `;
        return submenu;
    },

    /**
     * Create submenu item
     */
    createSubmenuItem(text, onClick) {
        const item = document.createElement('div');
        item.textContent = text;
        item.style.cssText = 'padding: 8px 12px; cursor: pointer;';
        item.onmouseover = () => item.style.background = '#f0f0f0';
        item.onmouseout = () => item.style.background = 'white';
        item.onclick = onClick;
        return item;
    },

    /**
     * Attach show/hide behavior to submenu
     */
    attachSubmenuBehavior(parent, submenu) {
        if (!parent || !submenu) return;

        parent.addEventListener('mouseenter', () => {
            parent.style.background = '#f0f0f0';
            submenu.style.display = 'block';
        });

        parent.addEventListener('mouseleave', (e) => {
            // Check if mouse is moving to the submenu
            const rect = submenu.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;

            // If not hovering over submenu, hide it
            if (!(x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)) {
                setTimeout(() => {
                    if (!submenu.matches(':hover')) {
                        submenu.style.display = 'none';
                        parent.style.background = 'white';
                    }
                }, 100);
            }
        });

        submenu.addEventListener('mouseleave', () => {
            submenu.style.display = 'none';
            parent.style.background = 'white';
        });
    },

    /**
     * Create separator line
     */
    createSeparator() {
        const separator = document.createElement('div');
        separator.style.cssText = 'height: 1px; background: #ddd; margin: 4px 0;';
        return separator;
    },

    /**
     * Find field elements in card by field key
     */
    findFieldElements(field) {
        if (!this.currentCard) return null;

        const labels = this.currentCard.querySelectorAll('.section-label');
        for (let label of labels) {
            if (label.innerText === field.label) {
                return {
                    label: label,
                    value: label.nextElementSibling
                };
            }
        }
        return null;
    },

    /**
     * Create submenu for adding fields (not card types)
     */
    createAddFieldSubmenu(existingFields) {
        const submenu = this.createSubmenuContainer();

        // Get available fields for this card type
        const availableFields = this.getAvailableFieldsForCardType();

        // Filter out fields that already exist
        const existingKeys = existingFields.map(f => f.key);
        const availableToAdd = availableFields.filter(f => !existingKeys.includes(f.key));

        if (availableToAdd.length === 0) {
            const noFields = document.createElement('div');
            noFields.textContent = 'All fields added';
            noFields.style.cssText = 'padding: 8px 12px; color: #999; font-style: italic;';
            submenu.appendChild(noFields);
        } else {
            availableToAdd.forEach(field => {
                const fieldItem = this.createSubmenuItem(field.label, () => {
                    this.addFieldToCard(field);
                    this.hide();
                });
                submenu.appendChild(fieldItem);
            });
        }

        return submenu;
    },

    /**
     * Add field to card
     */
    addFieldToCard(field) {
        if (!this.currentCard || !this.currentSpell) return;

        // Prompt for value with multi-line support for long text
        let value;
        if (field.isLongText) {
            value = prompt(`Enter value for ${field.label}:\n(Use \\n for line breaks)`);
        } else {
            value = prompt(`Enter value for ${field.label}:`);
        }

        if (value === null) return;

        // Update spell object
        this.currentSpell[field.key] = value;

        // Find insertion point (before description/text if exists, otherwise at end)
        const textElements = this.currentCard.querySelectorAll('.text');
        const lastTextElement = textElements[textElements.length - 1];
        const insertBefore = lastTextElement ? lastTextElement.previousElementSibling : null;

        // Create field elements
        const fieldLabel = document.createElement('div');
        fieldLabel.className = 'section-label';
        fieldLabel.innerText = field.label;

        const fieldValue = document.createElement('div');
        if (field.isLongText) {
            fieldValue.className = 'text';
            fieldValue.innerHTML = value.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
        } else {
            fieldValue.innerText = value;
        }

        // Insert into card
        if (insertBefore) {
            this.currentCard.insertBefore(fieldLabel, insertBefore);
            this.currentCard.insertBefore(fieldValue, insertBefore);
        } else {
            this.currentCard.appendChild(fieldLabel);
            this.currentCard.appendChild(fieldValue);
        }
    },

    /**
     * Edit existing field
     */
    editField(field) {
        if (!this.currentCard || !this.currentSpell) return;

        const elements = this.findFieldElements(field);
        if (!elements) {
            alert(`Could not find field: ${field.label}`);
            return;
        }

        // Get current value
        const currentValue = field.isLongText
            ? elements.value.innerHTML.replace(/<br>/g, '\n')
            : elements.value.innerText;

        // Prompt for new value
        let newValue;
        if (field.isLongText) {
            newValue = prompt(`Edit ${field.label}:\n(Use \\n for line breaks)`, currentValue);
        } else {
            newValue = prompt(`Edit ${field.label}:`, currentValue);
        }

        if (newValue === null) return;

        // Update spell object
        this.currentSpell[field.key] = newValue;

        // Update DOM
        if (field.isLongText) {
            elements.value.innerHTML = newValue.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
        } else {
            elements.value.innerText = newValue;
        }
    },

    /**
     * Remove field from card
     */
    removeField(field) {
        if (!this.currentCard || !this.currentSpell) return;

        if (!confirm(`Remove "${field.label}" from this card?`)) return;

        const elements = this.findFieldElements(field);
        if (!elements) return;

        // Remove from DOM
        elements.label.remove();
        elements.value.remove();

        // Remove from spell object
        delete this.currentSpell[field.key];
    },


    /**
     * Duplicate card
     */
    duplicateCard() {
        if (!this.currentCard || !this.currentSpell) return;

        // Clone the spell object
        const duplicatedSpell = JSON.parse(JSON.stringify(this.currentSpell));

        // Get the card type from the current card
        const cardType = this.currentCard._cardType || 'spell';

        // Get the appropriate fields for this card type
        const cardTypeInfo = CARD_TYPES.find(ct => ct.key === cardType);
        const fields = cardTypeInfo ? cardTypeInfo.fields : CARD_FIELDS;

        // Create new card
        const newCard = CardGenerator.createCard(duplicatedSpell, cardType, fields);

        // Copy border color if customized
        if (this.currentCard.style.borderColor) {
            newCard.style.borderColor = this.currentCard.style.borderColor;
        }

        // Find the original card in allLoadedCards
        const originalIndex = allLoadedCards.findIndex(card =>
            card._data === this.currentSpell ||
            card._spell === this.currentSpell ||
            (card._data && card._data.name === this.currentSpell.name)
        );

        // Add to allLoadedCards array after the original
        if (originalIndex !== -1) {
            allLoadedCards.splice(originalIndex + 1, 0, newCard);
        } else {
            allLoadedCards.push(newCard);
        }

        // Rebuild sheets to include new card
        filterDisplayedCards();
    },

    /**
     * Remove card
     */
    removeCard() {
        if (!this.currentCard || !this.currentSpell) return;

        if (!confirm('Remove this card?')) return;

        // Remove from allLoadedCards array
        const index = allLoadedCards.findIndex(card =>
            card._data === this.currentSpell ||
            card._spell === this.currentSpell ||
            (card._data && card._data.name === this.currentSpell.name) ||
            (card._spell && card._spell.name === this.currentSpell.name)
        );

        if (index > -1) {
            allLoadedCards.splice(index, 1);
        }

        // Rebuild sheets
        filterDisplayedCards();
    },

    /**
     * Create a new card of specified type
     */
    createNewCard(cardType) {
        // Prompt for card name
        const name = prompt(`Enter name for new ${cardType.label}:`);
        if (!name) return;

        // Create base data object
        const newData = {
            name: name,
            classes: [] // Empty classes array - user can customize later
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
    },

    /**
     * Change border color of card
     */
    changeBorderColor() {
        if (!this.currentCard) return;

        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = this.currentCard.style.borderColor || '#3a2f2f';

        const currentColor = this.currentCard.style.borderColor;
        if (currentColor && currentColor.startsWith('rgb')) {
            colorInput.value = this.rgbToHex(currentColor);
        }

        colorInput.style.position = 'absolute';
        colorInput.style.left = '-9999px';
        document.body.appendChild(colorInput);

        colorInput.addEventListener('change', (e) => {
            this.currentCard.style.borderColor = e.target.value;
            colorInput.remove();
        });

        colorInput.addEventListener('blur', () => {
            setTimeout(() => colorInput.remove(), 100);
        });

        colorInput.click();
    },

    /**
     * Convert RGB color to hex
     */
    rgbToHex(rgb) {
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return '#3a2f2f';

        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);

        return '#' +
            r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0');
    },

    /**
     * Hide context menu
     */
    hide() {
        if (this.menu) {
            this.menu.style.display = 'none';
        }
    }
};

// Hide context menu when clicking elsewhere
document.addEventListener('click', () => ContextMenu.hide());

document.addEventListener('scroll', () => ContextMenu.hide());