// File Reading and Loading Functions
const FileHandler = {
    /**
     * Read a file from a URL
     */
    async readFile(location) {
        try {
            const response = await fetch(location);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return await response.text();
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
            return '';
        }
    },

    /**
     * Load and merge spells from selected classes
     */
    async loadSpellsFromClasses(selectedClasses) {
        if (selectedClasses.length === 0) {
            return [];
        }

        const spellMap = new Map();

        for (const className of selectedClasses) {
            const classInfo = CLASS_DATA[className];
            if (!classInfo || !classInfo.cards) continue;

            try {
                const yamlText = await this.readFile(classInfo.cards);
                if (!yamlText) continue;

                const spells = jsyaml.load(yamlText);
                if (!Array.isArray(spells)) continue;

                spells.forEach(spell => {
                    const spellName = spell.name;

                    if (spellMap.has(spellName)) {
                        // Merge classes for existing spell
                        const existingSpell = spellMap.get(spellName);
                        if (!existingSpell.classes.includes(className)) {
                            existingSpell.classes.push(className);
                        }
                    } else {
                        // Add new spell
                        const newSpell = { ...spell };
                        if (!newSpell.classes) {
                            newSpell.classes = [];
                        }
                        if (!newSpell.classes.includes(className)) {
                            newSpell.classes.push(className);
                        }
                        spellMap.set(spellName, newSpell);
                    }
                });

            } catch (error) {
                console.error(`Error loading spells for ${className}:`, error);
            }
        }

        return Array.from(spellMap.values());
    },

    /**
     * Handle backing image file upload
     */
    handleBackingImageUpload(file) {
        if (!file) {
            CONFIG.backingImageUrl = null;
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            CONFIG.backingImageUrl = event.target.result;
            console.log('Backing image loaded:', CONFIG.backingImageUrl ? 'Success' : 'Failed');
            console.log('Image data length:', CONFIG.backingImageUrl ? CONFIG.backingImageUrl.length : 0);
        };
        reader.onerror = (error) => {
            console.error('Error reading backing image:', error);
            CONFIG.backingImageUrl = null;
        };
        reader.readAsDataURL(file);
    }
};