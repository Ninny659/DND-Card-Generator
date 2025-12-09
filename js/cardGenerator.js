// Card Generation and Sheet Building Functions
const CardGenerator = {
    /**
     * Calculate border color based on spell classes
     */
    classBorderColor(classes) {
        if (!classes || !Array.isArray(classes) || classes.length === 0) {
            return '#3a2f2f';
        }

        const validClasses = classes.filter(c => CLASS_DATA[c]);

        if (validClasses.length === 0) return '#3a2f2f';
        if (validClasses.length === 1) return CLASS_DATA[validClasses[0]].colour;

        return this.mixColors(validClasses.map(c => CLASS_DATA[c].colour));
    },

    /**
     * Mix multiple hex colors by averaging RGB values
     */
    mixColors(hexColors) {
        const rgbs = hexColors.map(hex => ({
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16)
        }));

        const avg = {
            r: Math.round(rgbs.reduce((sum, rgb) => sum + rgb.r, 0) / rgbs.length),
            g: Math.round(rgbs.reduce((sum, rgb) => sum + rgb.g, 0) / rgbs.length),
            b: Math.round(rgbs.reduce((sum, rgb) => sum + rgb.b, 0) / rgbs.length)
        };

        return `#${avg.r.toString(16).padStart(2, '0')}${avg.g.toString(16).padStart(2, '0')}${avg.b.toString(16).padStart(2, '0')}`;
    },

    /**
     * Generate HTML for class badges
     */
    classBadgesHTML(classes) {
        if (!classes) return '';

        return classes.map(c =>
            `<span class="badge">${CLASS_DATA[c]?.abv || c}</span>`
        ).join('');
    },

    /**
     * Format spell level label
     */
    levelLabel(lvl) {
        return lvl === 0 ? 'Cantrip' : 'Level ' + lvl;
    },

    /**
         * Create a card for any type (spell, weapon, armor, etc.)
         * @param {Object} data - The card data
         * @param {String} cardType - The type of card ('spell', 'weapon', 'armor', etc.)
         * @param {Array} fields - Array of field definitions for this card type
         */
    createCard(data, cardType = 'spell', fields = CARD_FIELDS) {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.borderColor = this.classBorderColor(data.classes);

        // Store data reference and type
        card._data = data;
        card._spell = data; // Keep for backward compatibility
        card._cardType = cardType;

        // Add right-click listener
        card.addEventListener('contextmenu', (e) => ContextMenu.show(e, card, data, cardType));

        // Fixed header sections
        const title = document.createElement('div');
        title.className = 'title';
        title.innerText = data.name || 'Unnamed';

        const badges = document.createElement('div');
        badges.style.textAlign = 'center';
        badges.innerHTML = this.classBadgesHTML(data.classes);

        const classLine = document.createElement('div');
        classLine.className = 'class-line';

        // Different subtitle based on card type
        if (cardType === 'spell') {
            classLine.innerHTML = `<strong>${this.levelLabel(data.level)}</strong> • ${data.school || ''}`;
        } else if (cardType === 'weapon') {
            classLine.innerHTML = `<strong>${data.type || 'Weapon'}</strong> • ${data.damage || ''}`;
        } else if (cardType === 'armor') {
            classLine.innerHTML = `<strong>${data.type || 'Armor'}</strong> • AC ${data.armorClass || ''}`;
        } else {
            // Generic fallback
            classLine.innerHTML = `<strong>${cardType}</strong>`;
        }

        card.appendChild(title);
        card.appendChild(badges);
        card.appendChild(classLine);

        // Dynamic fields
        fields.forEach(field => {
            const value = data[field.key];
            if (!value && field.key !== 'description') return;

            const fieldLabel = document.createElement('div');
            fieldLabel.className = 'section-label';
            fieldLabel.innerText = field.label;

            const fieldValue = document.createElement('div');
            if (field.isLongText) {
                fieldValue.className = 'text';
                fieldValue.innerHTML = (value || '').replace(/\n/g, '<br>');
            } else {
                fieldValue.innerText = value || '—';
            }

            card.appendChild(fieldLabel);
            card.appendChild(fieldValue);
        });

        return card;
    },

    /**
     * Create a backing sheet for double-sided printing
     */
    createBackingSheet(count) {
        console.log('Creating backing sheet with', count, 'cards');
        console.log('Backing image URL exists:', !!CONFIG.backingImageUrl);
        console.log('Backing image URL length:', CONFIG.backingImageUrl ? CONFIG.backingImageUrl.length : 0);

        const sheet = document.createElement('div');
        sheet.className = 'sheet backing-sheet';

        // Check if mirroring is enabled
        const mirrorCheckbox = document.getElementById('mirrorBacking');
        if (mirrorCheckbox && mirrorCheckbox.checked) {
            sheet.style.transform = 'scaleX(-1)';
        }

        for (let i = 0; i < count; i++) {
            const backing = document.createElement('div');
            backing.className = 'card backing-card';

            if (CONFIG.backingImageUrl) {
                // Set background using shorthand to ensure it works
                backing.style.background = `url("${CONFIG.backingImageUrl}") center/cover no-repeat`;
                backing.style.backgroundColor = '#f0f0f0'; // Fallback color to see if card exists

                console.log('Backing card', i + 1, 'created with image');
            } else {
                console.log('No backing image URL available for card', i + 1);
                backing.style.backgroundColor = '#ffcccc'; // Red tint to show missing image
                const text = document.createElement('div');
                text.textContent = 'No image';
                text.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100%; color: #999;';
                backing.appendChild(text);
            }

            backing.style.border = '3px double #3a2f2f';

            sheet.appendChild(backing);
        }

        console.log('Backing sheet created');
        return sheet;
    },

    /**
     * Build sheets from card elements
     */
    buildSheets(cards) {
        const sheets = [];
        const frontCards = cards.filter(c => !c.classList.contains('backing-card'));

        // Create front sheets
        for (let i = 0; i < frontCards.length; i += CONFIG.cardsPerPage) {
            const pageCards = frontCards.slice(i, i + CONFIG.cardsPerPage);
            const sheet = document.createElement('div');
            sheet.className = 'sheet';

            // Clone cards and re-attach event listeners
            pageCards.forEach(originalCard => {
                const clone = originalCard.cloneNode(true);
                clone._spell = originalCard._spell; // Preserve spell reference
                clone._data = originalCard._data; // Preserve data reference
                clone._cardType = originalCard._cardType; // Preserve card type

                // Re-attach context menu listener
                const data = clone._data || clone._spell;
                const cardType = clone._cardType || 'spell';
                clone.addEventListener('contextmenu', (e) => ContextMenu.show(e, clone, data, cardType));

                sheet.appendChild(clone);
            });

            sheets.push(sheet);
        }

        // Add backing sheets if image is uploaded
        if (CONFIG.backingImageUrl) {
            const numPages = Math.ceil(frontCards.length / CONFIG.cardsPerPage);
            for (let page = 0; page < numPages; page++) {
                const cardsOnThisPage = Math.min(
                    CONFIG.cardsPerPage,
                    frontCards.length - (page * CONFIG.cardsPerPage)
                );
                const backingSheet = this.createBackingSheet(cardsOnThisPage);
                sheets.push(backingSheet);
            }
        }

        return sheets;
    },

    /**
     * Enable drag-and-drop sorting on sheets
     */
    enableDrag() {
        document.querySelectorAll('.sheet').forEach(sheet => {
            if (sheet._sortable) return;

            sheet._sortable = new Sortable(sheet, {
                animation: 150,
                ghostClass: 'sortable-ghost'
            });
        });
    }
};