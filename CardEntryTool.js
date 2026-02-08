const defaultURL = "https://www.dnd5eapi.co";

const apiQueries = {
  spells: "/api/2014/spells",
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
  return await apiFetch(defaultURL + apiQueries.spells + "/" + spellIndex);
}

function getComponents(components, material = "") {
  var compList = "";
  components.forEach((component) => {
    compList += component + ", ";
  });
  compList = compList.slice(0, -2); // Remove trailing comma and space

  if (material) compList += ` (${material})`;

  return compList;
}

function getSubclasses(subclasses) {
  if (!subclasses || subclasses.length === 0) {
    return "";
  }

  const subclassNames = subclasses.map((subclass) => subclass.name);
  return `[${subclassNames.join(", ")}]`;
}

function formatDescription(descArray) {
  if (!descArray || descArray.length === 0) {
    return "|";
  }

  // Join paragraphs and indent each line with 4 spaces
  const fullDesc = descArray.join("\n\n");
  const indentedDesc = fullDesc
    .split("\n")
    .map((line) => "    " + line)
    .join("\n");

  return "|\n" + indentedDesc;
}

function getClassNames(classes) {
  const classNames = classes.map((cls) => cls.name);
  return `[${classNames.join(", ")}]`;
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Copied to clipboard!");
    alert("Spells copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy:", error);
    alert("Failed to copy to clipboard");
  }
}

// ===== CONFIGURATION =====
// Change this to filter by class: 'Druid', 'Wizard', 'Cleric', 'Bard', etc.
// Set to null or empty string to get ALL spells
const FILTER_CLASS = "Bard";
// =========================

// Main execution
var spellList = await getSpell("");
var filteredSpells = []; // Store spell objects for sorting

spellList = spellList.results;

// Fetch all spells
for (let i = 0; i < spellList.length; i++) {
  var spell = await getSpell(spellList[i].index);

  // Filter by class if specified
  if (FILTER_CLASS) {
    const hasClass = spell.classes.some((cls) => cls.name === FILTER_CLASS);
    if (hasClass) {
      filteredSpells.push(spell);
    }
  } else {
    // No filter, add all spells
    filteredSpells.push(spell);
  }
}

// Sort by level, then by name
filteredSpells.sort((a, b) => {
  if (a.level !== b.level) {
    return a.level - b.level; // Sort by level first
  }
  return a.name.localeCompare(b.name); // Then sort alphabetically by name
});

// Build the output string
var allSpells = "";

for (let spell of filteredSpells) {
  // Format description with proper YAML multiline format
  const description = formatDescription(spell.desc);

  // Get subclasses if they exist
  const subclasses = getSubclasses(spell.subclasses);
  const subclassLine = subclasses ? `  subclasses: ${subclasses}\n` : "";

  // Get all classes for this spell
  // const classes = getClassNames(spell.classes);
  const classes = `[${FILTER_CLASS}]`;

  allSpells += `- name: ${spell.name}
  level: ${spell.level}
  school: ${spell.school.name}
  classes: ${classes}
${subclassLine}  casting_time: ${spell.casting_time}
  range: ${spell.range}
  components: ${getComponents(spell.components, spell.material || "")}
  duration: ${spell.duration}
  description: ${description}

`;
}

// Copy all spells to clipboard
await copyToClipboard(allSpells);
console.log(allSpells); // Also log to console for verification
