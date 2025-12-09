// Configuration and Constants
const CONFIG = {
    cardsPerPage: 9,
    selectedClasses: [],
    selectedLevels: [],
    selectedTypes: [],
    backingImageUrl: null
};

const CLASS_DATA = {
    'Wizard': {
        abv: 'WIZ',
        colour: '#a500a5ff',
        cards: './cards/wizard.yml'
    },
    'Artificer': {
        abv: 'ART',
        colour: '#9e5b20ff',
        cards: './cards/artificer.yml'
    },
    'Druid': {
        abv: 'DRU',
        colour: '#059200ff',
        cards: './cards/druid.yml'
    },
    'Cleric': {
        abv: 'CLE',
        colour: '#abbfc0ff',
        cards: './cards/cleric.yml'
    },
    'Bard': {
        abv: 'BARD',
        colour: '#ff69b4',
        cards: './cards/bard.yml'
    },
    'Sorcerer': {
        abv: 'SOR',
        colour: '#330063ff',
        cards: './cards/sorcerer.yml'
    },
    'Warlock': {
        abv: 'WAR',
        colour: '#b1006dff',
        cards: './cards/warlock.yml'
    },
    'Paladin': {
        abv: 'PAL',
        colour: '#ffae00ff',
        cards: './cards/paladin.yml'
    },
    'Ranger': {
        abv: 'RAN',
        colour: '#228b22',
        cards: './cards/ranger.yml'
    },
    'Fighter': {
        abv: 'FIG',
        colour: '#8b4513',
        cards: './cards/fighter.yml'
    },
    'Rogue': {
        abv: 'ROG',
        colour: '#2f4f4f',
        cards: './cards/rogue.yml'
    },
    'Monk': {
        abv: 'MONK',
        colour: '#4682b4',
        cards: './cards/monk.yml'
    },
    'Barbarian': {
        abv: 'BARB',
        colour: '#dc143c',
        cards: './cards/barbarian.yml'
    }
};

const CARD_FIELDS = [
    { key: 'casting_time', label: 'Casting Time' },
    { key: 'range', label: 'Range' },
    { key: 'components', label: 'Components' },
    { key: 'duration', label: 'Duration' },
    { key: 'description', label: 'Description', isLongText: true }
];

// For Spell cards
const AVAILABLE_FIELDS = [
    { key: 'casting_time', label: 'Casting Time' },
    { key: 'range', label: 'Range' },
    { key: 'components', label: 'Components' },
    { key: 'duration', label: 'Duration' },
    { key: 'concentration', label: 'Concentration' },
    { key: 'ritual', label: 'Ritual' },
    { key: 'attack_save', label: 'Attack/Save' },
    { key: 'damage', label: 'Damage' },
    { key: 'higher_level', label: 'At Higher Levels' },
    { key: 'description', label: 'Description', isLongText: true }
];

// For weapon cards
const WEAPON_FIELDS = [
    { key: 'damage', label: 'Damage' },
    { key: 'attackBonus', label: 'Attack Bonus' },
    { key: 'range', label: 'Range' },
    { key: 'properties', label: 'Properties' },
    { key: 'attunement', label: 'Attunement' },
    { key: 'description', label: 'Description', isLongText: true }
];

// For armor cards
const ARMOR_FIELDS = [
    { key: 'armorClass', label: 'Armour Class' },
    { key: 'type', label: 'Armour Type' },
    { key: 'stealthDisadvantage', label: 'Stealth Disadvantage' },
    { key: 'weight', label: 'Weight' },
    { key: 'attunement', label: 'Attunement' },
    { key: 'description', label: 'Description', isLongText: true }
];

const CARD_TYPES = [
    { key: 'spell', label: 'Spell', fields: CARD_FIELDS },
    { key: 'weapon', label: 'Weapon', fields: WEAPON_FIELDS },
    { key: 'armor', label: 'Armor', fields: ARMOR_FIELDS }
];

const EXAMPLE_SPELLS = `
- name: Disguise Self
  level: 1
  school: Illusion
  classes: [Wizard]
  casting_time: 1 Action
  range: Self
  components: V, S
  duration: 1 hour
  description: |
    You make yourself — including clothing, armour, weapons, and belongings — appear different.
    No saving throw, but Investigation check (DC = spell save DC) can reveal illusion.

- name: Cure Wounds
  level: 1
  school: Evocation
  classes: [Cleric, Druid, Bard]
  casting_time: 1 Action
  range: Touch
  components: V, S
  duration: Instantaneous
  description: |
    A creature you touch regains hit points equal to 1d8 + your spellcasting ability modifier.
    This spell has no effect on undead or constructs.

- name: Identify
  level: 1
  school: Divination
  classes: [Wizard, Artificer]
  casting_time: 1 Minute
  range: Touch
  components: V, S, M (a pearl worth at least 100 gp)
  duration: Instantaneous
  description: |
    You choose one object that you must touch throughout the casting. If it is a magic item or some other magic-imbued object, you learn its properties and how to use them.`;