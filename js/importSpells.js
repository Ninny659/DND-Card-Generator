var spellList = await getSpell();

spellList = spellList.results;

for (let i = 0; i < spellList.length; i++) {
  var spell = await getSpell(spellList[i].index);
  var classList = spell.classes;

  console.log(spell);

  classList.forEach((classes) => {
    console.log(`${classes.name} - ${spell.name}`);
  });
}

const defaultURL = "https://www.dnd5eapi.co";

const apiQueries = {
  "ability-scores": "/api/2014/ability-scores",
  alignments: "/api/2014/alignments",
  backgrounds: "/api/2014/backgrounds",
  classes: "/api/2014/classes",
  conditions: "/api/2014/conditions",
  "damage-types": "/api/2014/damage-types",
  equipment: "/api/2014/equipment",
  "equipment-categories": "/api/2014/equipment-categories",
  feats: "/api/2014/feats",
  features: "/api/2014/features",
  languages: "/api/2014/languages",
  "magic-items": "/api/2014/magic-items",
  "magic-schools": "/api/2014/magic-schools",
  monsters: "/api/2014/monsters",
  proficiencies: "/api/2014/proficiencies",
  races: "/api/2014/races",
  "rule-sections": "/api/2014/rule-sections",
  rules: "/api/2014/rules",
  skills: "/api/2014/skills",
  spells: "/api/2014/spells",
  subclasses: "/api/2014/subclasses",
  subraces: "/api/2014/subraces",
  traits: "/api/2014/traits",
  "weapon-properties": "/api/2014/weapon-properties",
};

async function apiFetch(url, method = "GET") {
  let output = await fetch(url, {
    method: method,
  }).catch((error) => {
    console.log(error);
  });

  return await output.json();
}

async function getSpell(spellIndex) {
  return await apiFetch(defaultURL + apiQueries.spells + '/' + spellIndex);
}

async function getEquipment(equipmentIndex) {
  return await apiFetch(defaultURL + apiQueries.equipment + '/' + equipmentIndex);
}

async function getClass(classIndex) {
  return await apiFetch(defaultURL + apiQueries.classes + '/' + classIndex);
}