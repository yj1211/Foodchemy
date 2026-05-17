const BASIC_ELEMENTS = ["🌱", "🧬", "🎲", "🔪", "💧", "🔥", "⏳", "🌍"];
const HIDDEN_ELEMENTS = ["🪴", "🍅", "🍞"];
const OVERLAP_DISTANCE = 72;

const RECIPES = [
  { ingredients: ["🥔", "🔪"], results: ["🍟"] },
  { ingredients: ["🐂", "🔪"], results: ["🥩"] },
  { ingredients: ["🐓", "🔪"], results: ["🍗"] },
  { ingredients: ["🐖", "🔪"], results: ["🍖", "🍖", "🍖", "🫁"] },
  { ingredients: ["🌱", "💧"], results: ["🪴"] },
  { ingredients: ["🪴", "🔪"], results: ["🍃"] },
  { ingredients: ["🍞", "🔪"], results: ["🍜"] },
  { ingredients: ["🍅", "🔥"], results: ["🥫"] },
  { ingredients: ["🍞", "🥩", "🧀"], results: ["🍔"] },
  { ingredients: ["🌾", "💧"], results: ["🍚"] },
  { ingredients: ["🌱", "🎲"], results: ["🥔", "🌽", "🌾"] },
  { ingredients: ["🧬", "🎲"], results: ["🦠"] },
  { ingredients: ["🪴", "🎲"], results: ["🐌"] },
  { ingredients: ["🌍", "🎲"], results: ["🇺🇸"] },
  { ingredients: ["🧬", "🧬"], results: ["♀️"] },
  { ingredients: ["🥚", "🔥"], results: ["🍳"] },
  { ingredients: ["🌽", "🔥"], results: ["🥖"] },
  { ingredients: ["🥖", "🔪"], results: ["🍞"] },
  { ingredients: ["🐂", "♀️"], results: ["🐄"] },
  { ingredients: ["🐓", "🇺🇸"], results: ["🦃"] },
  { ingredients: ["🐄", "💧"], results: ["🥛"] },
  { ingredients: ["🥛", "🦠"], results: ["🧀"] },
  { ingredients: ["🐓", "♀️"], results: ["🐔"] },
  { ingredients: ["🐔", "⏳"], results: ["🥚"] },
  { ingredients: ["🍜", "🥩"], results: ["牛肉麵"] },
  { ingredients: ["🍚", "🥩"], results: ["牛丼"] },
  { ingredients: ["🍚", "🦃"], results: ["火雞肉飯"] },
  { ingredients: ["🍚", "🍗"], results: ["海南雞飯"] },
  { ingredients: ["🍚", "🦆"], results: ["鴨香飯"] },
  { ingredients: ["💧", "💧"], results: ["🌊"] },
  { ingredients: ["🌊", "🎲"], results: ["🦐", "🐟"] },
  { ingredients: ["🍚", "🦐"], results: ["海鮮粥"] },
  { ingredients: ["🍃", "🍚"], results: ["🫔"] },
  { ingredients: ["🫔", "🍖"], results: ["肉粽"] },
  { ingredients: ["🍜", "🐟"], results: ["鱔魚意麵"] },
  { ingredients: ["🍜", "🌶️"], results: ["泡椒麵"] },
  { ingredients: ["🍞", "🍖"], results: ["🥟"] },
  { ingredients: ["🥟", "🔥"], results: ["煎餃"] },
  { ingredients: ["🍜", "🥟"], results: ["雲吞麵"] },
  { ingredients: ["🍔", "🍟"], results: ["麥當勞"] },
  { ingredients: ["🍚", "🔥"], results: ["炒飯"] },
  { ingredients: ["🍜", "🔥"], results: ["炒麵"] },
  { ingredients: ["🌱", "🌱"], results: ["⛰️"] },
  { ingredients: ["⛰️", "🎲"], results: ["🐂", "🐓", "🐖", "🦆"] },
  { ingredients: ["🫁", "🍜"], results: ["大腸麵線"] },
  { ingredients: ["🍖", "💧"], results: ["🍲"] },
  { ingredients: ["🍲", "🔥"], results: ["火鍋"] },
  { ingredients: ["🍖", "🔥"], results: ["燒肉"] },
  { ingredients: ["🐟", "🔪"], results: ["🍣"] },
  { ingredients: ["🍣", "🍚"], results: ["生魚片"] },
  { ingredients: ["🥩", "🔥"], results: ["牛排"] },
  { ingredients: ["🍗", "🔥"], results: ["炸雞"] },
  { ingredients: ["🍜", "🐌"], results: ["螺螄粉"] }
];

const playfield = document.getElementById("playfield");
const elementGrid = document.getElementById("element-grid");
const discoveredCount = document.getElementById("discovered-count");
const message = document.getElementById("message");
const resetBoardButton = document.getElementById("reset-board");
const newGameButton = document.getElementById("new-game");
const developerModeCheckbox = document.getElementById("developer-mode");
const ingredientTreeButton = document.getElementById("ingredient-tree-button");
const recipeTreeButton = document.getElementById("recipe-tree-button");
const recipeTreeModal = document.getElementById("recipe-tree-modal");
const recipeTreeList = document.getElementById("recipe-tree-list");
const recipeTreeTitle = document.getElementById("recipe-tree-title");
const closeRecipeTreeButton = document.getElementById("close-recipe-tree");

const INGREDIENT_RECIPES = RECIPES.filter((recipe) => recipe.results.every(isIngredientToken));
const RECIPE_RESULT_RECIPES = RECIPES.filter((recipe) => recipe.results.some((result) => !isIngredientToken(result)));
const ingredientResults = new Set(INGREDIENT_RECIPES.flatMap((recipe) => recipe.results));
const ALL_ELEMENTS = new Set([...BASIC_ELEMENTS, ...HIDDEN_ELEMENTS, ...ingredientResults]);

let discoveredElements = new Set(BASIC_ELEMENTS);
let discoveredRecipes = new Set();
let instances = new Map();
let nextId = 1;
let dragState = null;
let paletteDragState = null;
let currentCompendiumMode = "ingredient";

function isIngredientToken(value) {
  return /[\p{Extended_Pictographic}\p{Regional_Indicator}\uFE0F]/u.test(value);
}

function renderRecipeTree(mode = currentCompendiumMode) {
  currentCompendiumMode = mode;
  recipeTreeList.innerHTML = "";
  recipeTreeTitle.textContent = mode === "ingredient" ? "食材合成樹" : "食譜合成樹";

  const sourceRecipes = mode === "ingredient" ? INGREDIENT_RECIPES : RECIPE_RESULT_RECIPES;

  sourceRecipes.forEach((recipe) => {
    const row = document.createElement("article");
    row.className = "recipe-row";

    const inputs = document.createElement("div");
    inputs.className = "recipe-inputs";
    recipe.ingredients.forEach((emoji, index) => {
      if (index > 0) {
        const plus = document.createElement("span");
        plus.className = "recipe-note";
        plus.textContent = "+";
        inputs.appendChild(plus);
      }
      inputs.appendChild(createEmojiChip(emoji));
    });

    const outputWrap = document.createElement("div");
    outputWrap.className = "recipe-output";

    const arrow = document.createElement("span");
    arrow.className = "recipe-arrow";
    arrow.textContent = "→";
    outputWrap.appendChild(arrow);

    recipe.results.forEach((emoji) => {
      const recipeDiscovered = mode === "recipe" && isRecipeDiscovered(emoji);
      outputWrap.appendChild(createEmojiChip(emoji, { discovered: recipeDiscovered }));
    });

    if (recipe.results.length > 1) {
      const chance = document.createElement("span");
      chance.className = "recipe-note";
      chance.textContent = `各 ${Math.round(100 / recipe.results.length)}% 機率`;
      outputWrap.appendChild(chance);
    }

    row.appendChild(inputs);
    row.appendChild(outputWrap);
    recipeTreeList.appendChild(row);
  });
}

function isRecipeDiscovered(recipeName) {
  return discoveredRecipes.has(recipeName);
}

function createEmojiChip(emoji, options = {}) {
  const chip = document.createElement("span");
  chip.className = "emoji-chip";
  if (!isIngredientToken(emoji)) {
    chip.classList.add("text-chip");
  }
  if (options.discovered) {
    chip.classList.add("discovered-chip");
  }
  chip.textContent = emoji;
  return chip;
}

function elementSortKey(emoji) {
  const basicIndex = BASIC_ELEMENTS.indexOf(emoji);
  return basicIndex === -1 ? [1, emoji] : [0, basicIndex];
}

function sortUnlockedElements() {
  return [...getVisibleUnlockedElements()].sort((left, right) => {
    const [leftGroup, leftValue] = elementSortKey(left);
    const [rightGroup, rightValue] = elementSortKey(right);
    if (leftGroup !== rightGroup) {
      return leftGroup - rightGroup;
    }
    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return leftValue - rightValue;
    }
    return String(leftValue).localeCompare(String(rightValue));
  });
}

function getVisibleUnlockedElements() {
  return developerModeCheckbox.checked ? ALL_ELEMENTS : discoveredElements;
}

function renderUnlockedPanel() {
  elementGrid.innerHTML = "";

  sortUnlockedElements().forEach((emoji) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "element-button";
    button.textContent = emoji;
    button.setAttribute("aria-label", `生成 ${emoji}`);
    button.addEventListener("pointerdown", onPalettePointerDown);
    button.addEventListener("keydown", (event) => onPaletteKeyDown(event, emoji));
    elementGrid.appendChild(button);
  });
}

function updateDiscoveredCount() {
  const total = ALL_ELEMENTS.size;
  const suffix = developerModeCheckbox.checked ? "（開發者模式：全解鎖檢視）" : "";
  discoveredCount.textContent = `已發現：${discoveredElements.size} / ${total}${suffix}`;
}

function setMessage(text) {
  message.textContent = text;
}

function getPlayfieldRect() {
  return playfield.getBoundingClientRect();
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function randomPlayfieldPosition() {
  const rect = getPlayfieldRect();
  return {
    x: 54 + Math.random() * Math.max(80, rect.width - 108),
    y: 54 + Math.random() * Math.max(80, rect.height - 108)
  };
}

function createInstance(emoji, x, y) {
  const id = nextId++;
  const element = document.createElement("div");
  element.className = "emoji-instance";
  element.textContent = emoji;
  element.dataset.instanceId = String(id);
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  element.addEventListener("pointerdown", onPointerDown);
  element.addEventListener("contextmenu", onInstanceContextMenu);
  playfield.appendChild(element);

  instances.set(id, { id, emoji, x, y, element });
  return id;
}

function spawnFromPanel(emoji) {
  const { x, y } = randomPlayfieldPosition();
  createInstance(emoji, x, y);
  setMessage(`已放入 ${emoji}，把它拖去和其他元素重合。`);
}

function createPalettePreview(emoji) {
  const preview = document.createElement("div");
  preview.className = "emoji-instance dragging palette-preview";
  preview.textContent = emoji;
  preview.style.left = "-999px";
  preview.style.top = "-999px";
  document.body.appendChild(preview);
  return preview;
}

function updateInstancePosition(instance) {
  instance.element.style.left = `${instance.x}px`;
  instance.element.style.top = `${instance.y}px`;
}

function onPointerDown(event) {
  const element = event.currentTarget;
  const instanceId = Number(element.dataset.instanceId);
  const instance = instances.get(instanceId);
  if (!instance) {
    return;
  }

  const playfieldRect = getPlayfieldRect();
  dragState = {
    id: instanceId,
    pointerId: event.pointerId,
    offsetX: event.clientX - playfieldRect.left - instance.x,
    offsetY: event.clientY - playfieldRect.top - instance.y
  };

  element.classList.add("dragging");
  element.setPointerCapture(event.pointerId);
  element.style.zIndex = "10";
  element.addEventListener("pointermove", onPointerMove);
  element.addEventListener("pointerup", onPointerUp);
  element.addEventListener("pointercancel", onPointerUp);
}

function onInstanceContextMenu(event) {
  event.preventDefault();

  const element = event.currentTarget;
  const instanceId = Number(element.dataset.instanceId);
  const instance = instances.get(instanceId);
  if (!instance) {
    return;
  }

  deleteInstance(instanceId);
  setMessage(`已移除 ${instance.emoji}。`);
}

function onPalettePointerDown(event) {
  if (event.button !== 0) {
    return;
  }

  const button = event.currentTarget;
  const emoji = button.textContent;
  const preview = createPalettePreview(emoji);

  paletteDragState = {
    emoji,
    pointerId: event.pointerId,
    preview,
    didMove: false,
  };

  updatePalettePreviewPosition(event.clientX, event.clientY);
  button.setPointerCapture(event.pointerId);
  button.addEventListener("pointermove", onPalettePointerMove);
  button.addEventListener("pointerup", onPalettePointerUp);
  button.addEventListener("pointercancel", onPalettePointerUp);
}

function updatePalettePreviewPosition(clientX, clientY) {
  if (!paletteDragState) {
    return;
  }

  paletteDragState.preview.style.left = `${clientX}px`;
  paletteDragState.preview.style.top = `${clientY}px`;
}

function onPalettePointerMove(event) {
  if (!paletteDragState || paletteDragState.pointerId !== event.pointerId) {
    return;
  }

  paletteDragState.didMove = true;
  updatePalettePreviewPosition(event.clientX, event.clientY);
}

function onPalettePointerUp(event) {
  const button = event.currentTarget;

  button.removeEventListener("pointermove", onPalettePointerMove);
  button.removeEventListener("pointerup", onPalettePointerUp);
  button.removeEventListener("pointercancel", onPalettePointerUp);

  if (!paletteDragState || paletteDragState.pointerId !== event.pointerId) {
    return;
  }

  const { emoji, didMove, preview } = paletteDragState;
  const dropPosition = getDropPositionInPlayfield(event.clientX, event.clientY);
  preview.remove();
  paletteDragState = null;

  if (dropPosition) {
    createInstance(emoji, dropPosition.x, dropPosition.y);
    setMessage(`已拖入 ${emoji}，把它和其他材料重合試試看。`);
    return;
  }

  if (!didMove) {
    spawnFromPanel(emoji);
  }
}

function onPaletteKeyDown(event, emoji) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  spawnFromPanel(emoji);
}

function getDropPositionInPlayfield(clientX, clientY) {
  const rect = getPlayfieldRect();
  const isInside =
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom;

  if (!isInside) {
    return null;
  }

  return {
    x: clamp(clientX - rect.left, 30, rect.width - 30),
    y: clamp(clientY - rect.top, 30, rect.height - 30)
  };
}

function onPointerMove(event) {
  if (!dragState || dragState.pointerId !== event.pointerId) {
    return;
  }

  const instance = instances.get(dragState.id);
  if (!instance) {
    return;
  }

  const rect = getPlayfieldRect();
  instance.x = clamp(event.clientX - rect.left - dragState.offsetX, 30, rect.width - 30);
  instance.y = clamp(event.clientY - rect.top - dragState.offsetY, 30, rect.height - 30);
  updateInstancePosition(instance);
}

function onPointerUp(event) {
  const element = event.currentTarget;
  const instanceId = Number(element.dataset.instanceId);

  element.classList.remove("dragging");
  element.style.zIndex = "";
  element.removeEventListener("pointermove", onPointerMove);
  element.removeEventListener("pointerup", onPointerUp);
  element.removeEventListener("pointercancel", onPointerUp);

  if (dragState && dragState.pointerId === event.pointerId) {
    dragState = null;
  }

  tryMerge(instanceId);
}

function distance(left, right) {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

function findNearbyInstances(anchor) {
  return [...instances.values()].filter((candidate) => {
    return candidate.id !== anchor.id && distance(anchor, candidate) <= OVERLAP_DISTANCE;
  });
}

function getSortedIngredients(emojis) {
  return [...emojis].sort().join("|");
}

function matchRecipe(emojis) {
  const signature = getSortedIngredients(emojis);
  return RECIPES.find((recipe) => {
    return getSortedIngredients(recipe.ingredients) === signature;
  }) || null;
}

function chooseResult(recipe) {
  const index = Math.floor(Math.random() * recipe.results.length);
  return recipe.results[index];
}

function resolveRecipe(recipe, consumedInstances) {
  const result = chooseResult(recipe);
  const ingredientText = consumedInstances.map((item) => item.emoji).join(" + ");
  const isIngredientResult = isIngredientToken(result);
  const isNew = isIngredientResult ? !discoveredElements.has(result) : !discoveredRecipes.has(result);

  consumedInstances.forEach((instance) => deleteInstance(instance.id));

  if (isIngredientResult) {
    const centerX = consumedInstances.reduce((sum, item) => sum + item.x, 0) / consumedInstances.length;
    const centerY = consumedInstances.reduce((sum, item) => sum + item.y, 0) / consumedInstances.length;
    createInstance(result, centerX, centerY);
    discoveredElements.add(result);
    renderUnlockedPanel();
    updateDiscoveredCount();
  } else {
    discoveredRecipes.add(result);
    renderRecipeTree();
  }

  setMessage(isNew ? `${ingredientText} = ${result}\n新發現：${result}` : `${ingredientText} = ${result}`);
}

function tryMerge(anchorId) {
  const anchor = instances.get(anchorId);
  if (!anchor) {
    return;
  }

  const nearby = findNearbyInstances(anchor);
  const candidates = [anchor, ...nearby];

  for (const recipeSize of [3, 2]) {
    if (candidates.length < recipeSize) {
      continue;
    }

    const combos = getCombinations(candidates, recipeSize);
    for (const combo of combos) {
      if (!combo.some((item) => item.id === anchor.id)) {
        continue;
      }

      const recipe = matchRecipe(combo.map((item) => item.emoji));
      if (!recipe) {
        continue;
      }

      resolveRecipe(recipe, combo);
      return;
    }
  }
}

function getCombinations(items, size) {
  const results = [];

  function backtrack(startIndex, current) {
    if (current.length === size) {
      results.push([...current]);
      return;
    }

    for (let index = startIndex; index < items.length; index += 1) {
      current.push(items[index]);
      backtrack(index + 1, current);
      current.pop();
    }
  }

  backtrack(0, []);
  return results;
}

function deleteInstance(id) {
  const instance = instances.get(id);
  if (!instance) {
    return;
  }

  instance.element.remove();
  instances.delete(id);
}

function resetBoard() {
  [...instances.keys()].forEach((id) => deleteInstance(id));
  setMessage("已清空場上元素，解鎖進度會保留。");
}

function newGame() {
  resetBoard();
  discoveredElements = new Set(BASIC_ELEMENTS);
  discoveredRecipes = new Set();
  renderUnlockedPanel();
  renderRecipeTree();
  updateDiscoveredCount();
  setMessage("新遊戲開始，回到 8 個基本元素。");
}

function openRecipeTree(mode) {
  renderRecipeTree(mode);
  recipeTreeModal.classList.add("open");
  recipeTreeModal.setAttribute("aria-hidden", "false");
}

function closeRecipeTree() {
  recipeTreeModal.classList.remove("open");
  recipeTreeModal.setAttribute("aria-hidden", "true");
}

resetBoardButton.addEventListener("click", resetBoard);
newGameButton.addEventListener("click", newGame);
ingredientTreeButton.addEventListener("click", () => openRecipeTree("ingredient"));
recipeTreeButton.addEventListener("click", () => openRecipeTree("recipe"));
closeRecipeTreeButton.addEventListener("click", closeRecipeTree);
recipeTreeModal.addEventListener("click", (event) => {
  if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
    closeRecipeTree();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && recipeTreeModal.classList.contains("open")) {
    closeRecipeTree();
  }
});
developerModeCheckbox.addEventListener("change", () => {
  renderUnlockedPanel();
  updateDiscoveredCount();
  if (developerModeCheckbox.checked) {
    setMessage("開發者模式已開啟，元素面板暫時全解鎖。");
  } else {
    setMessage("開發者模式已關閉，已回到你目前擁有的元素。");
  }
});

renderUnlockedPanel();
renderRecipeTree("ingredient");
updateDiscoveredCount();
setMessage("把 emoji 拖進中央區塊，讓配方材料重合來合成新食物。");
