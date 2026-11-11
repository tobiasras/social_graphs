(() => {
  "use strict";
  const data = window.RECIPE_NETWORK_DATA;
  const worldCountries = window.WORLD_COUNTRIES || [];
  const mapUnit = 5.5;
  const mode = document.getElementById("network-mode");
  const ingredientView = document.getElementById("ingredient-view");
  const recipeView = document.getElementById("recipe-view");
  const cuisineSelect = document.getElementById("recipe-cuisine");
  const thresholdInput = document.getElementById("recipe-threshold");
  const canvas = document.getElementById("recipe-canvas");
  const windowEl = document.getElementById("recipe-window");
  const tooltip = document.getElementById("recipe-tooltip");
  const ctx = canvas.getContext("2d");
  const format = new Intl.NumberFormat("en-US");
  let nodes = [], neighbors = [], postings = new Map(), selected = null;
  let width = 1, height = 1, scale = 1, fitScale = 1, offsetX = 0, offsetY = 0;
  let drag = null, pending = false, buildToken = 0;
  let lineProgress = 1;
  const landPath = new Path2D(), icePath = new Path2D();
  for (const [name, rings] of worldCountries) {
    const path = name === "Antarctica" ? icePath : landPath;
    for (const ring of rings) {
      if (ring.length < 3) continue;
      path.moveTo(ring[0][0] * mapUnit, -ring[0][1] * mapUnit);
      for (let i = 1; i < ring.length; i++) path.lineTo(ring[i][0] * mapUnit, -ring[i][1] * mapUnit);
      path.closePath();
    }
  }

  function screenX(node) { return node.lon * mapUnit * scale + offsetX; }
  function screenY(node) { return -node.lat * mapUnit * scale + offsetY; }
  function requestDraw() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; draw(); });
  }
  function fit() {
    if (width < 1 || height < 1) return;
    fitScale = Math.min((width - 50) / (360 * mapUnit), (height - 50) / (180 * mapUnit));
    scale = fitScale;
    offsetX = width / 2;
    offsetY = height / 2;
    requestDraw();
  }
  function resize() {
    if (recipeView.hidden) return;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    fit();
    if (cuisineSelect.value !== "all") focusCuisine();
  }
  function focusCuisine() {
    if (!nodes.length) return;
    const xs = nodes.map(node => node.lon * mapUnit);
    const ys = nodes.map(node => -node.lat * mapUnit);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    scale = Math.min(fitScale * 40,
      (width - 90) / Math.max(35, maxX - minX),
      (height - 90) / Math.max(35, maxY - minY));
    offsetX = width / 2 - (minX + maxX) * scale / 2;
    offsetY = height / 2 - (minY + maxY) * scale / 2;
    requestDraw();
  }
  function zoomAt(factor, x, y) {
    const next = Math.max(fitScale * 0.5, Math.min(fitScale * 40, scale * factor));
    offsetX = x - (x - offsetX) * next / scale;
    offsetY = y - (y - offsetY) * next / scale;
    scale = next;
    requestDraw();
  }
  function draw() {
    if (recipeView.hidden) return;
    ctx.fillStyle = "#e7f0e9";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(150,187,191,.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let lon = -150; lon <= 150; lon += 30) {
      const x = lon * mapUnit * scale + offsetX;
      ctx.moveTo(x, -90 * mapUnit * scale + offsetY);
      ctx.lineTo(x, 90 * mapUnit * scale + offsetY);
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = -lat * mapUnit * scale + offsetY;
      ctx.moveTo(-180 * mapUnit * scale + offsetX, y);
      ctx.lineTo(180 * mapUnit * scale + offsetX, y);
    }
    ctx.stroke();
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#24444b";
    ctx.fill(landPath, "evenodd");
    ctx.strokeStyle = "#4b6970";
    ctx.lineWidth = 1 / scale;
    ctx.stroke(landPath);
    ctx.fillStyle = "#34535a";
    ctx.fill(icePath, "evenodd");
    ctx.stroke(icePath);
    ctx.restore();
    if (selected !== null) {
      for (const edge of neighbors) {
        const other = edge.a === selected ? edge.b : edge.a;
        ctx.beginPath();
        ctx.moveTo(screenX(nodes[selected]), screenY(nodes[selected]));
        const endX = screenX(nodes[other]), endY = screenY(nodes[other]);
        ctx.lineTo(screenX(nodes[selected]) + (endX - screenX(nodes[selected])) * lineProgress,
          screenY(nodes[selected]) + (endY - screenY(nodes[selected])) * lineProgress);
        ctx.strokeStyle = data.cuisines[nodes[other].cuisine]?.color || "#9da99e";
        ctx.globalAlpha = 0.4 + 0.5 * Math.min(1, edge.shared / 8);
        ctx.lineWidth = 1.2 + Math.min(3, edge.shared * 0.4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    const radius = Math.min(3, 1.1 + 0.38 * Math.log2(Math.max(1, scale / fitScale)));
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i], x = screenX(node), y = screenY(node);
      if (x < -15 || x > width + 15 || y < -15 || y > height + 15) continue;
      ctx.fillStyle = data.cuisines[node.cuisine]?.color || "#9da99e";
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    const antarcticaX = offsetX, antarcticaY = 78 * mapUnit * scale + offsetY;
    if (antarcticaX > 0 && antarcticaX < width && antarcticaY > 0 && antarcticaY < height) {
      ctx.font = "bold 11px Segoe UI, Arial, sans-serif";
      ctx.fillStyle = "#e8f2ef";
      ctx.fillText("ANTARCTICA - UNASSIGNED", antarcticaX + 12, antarcticaY + 28);
    }
    if (selected !== null) {
      const node = nodes[selected];
      ctx.beginPath();
      ctx.arc(screenX(node), screenY(node), 7, 0, 2 * Math.PI);
      ctx.fillStyle = "#ca553f";
      ctx.fill();
      ctx.strokeStyle = "#e8f2ef";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = "bold 13px Segoe UI, Arial, sans-serif";
      ctx.fillStyle = "#213a2e";
      ctx.fillText(node.row[0], screenX(node) + 12, screenY(node) - 10);
      if (lineProgress < 1) {
        lineProgress = Math.min(1, lineProgress + 0.07);
        requestDraw();
      }
    }
  }
  function buildNetwork() {
    const cuisine = cuisineSelect.value;
    const eligible = data.recipes.map((row, id) => id)
      .filter(id => cuisine === "all" || data.recipes[id][2].includes(Number(cuisine)));
    nodes = eligible.map(id => {
      const row = data.recipes[id];
      const mapped = row[2].findIndex(index =>
        !data.cuisines[index].mapLabel.startsWith("Antarctica"));
      const place = cuisine === "all" ? Math.max(0, mapped) : row[2].indexOf(Number(cuisine));
      const [lon, lat] = row[4][place];
      return { id, row, cuisine: row[2][place], lon, lat };
    });
    postings = new Map();
    nodes.forEach((node, index) => {
      for (const ingredient of node.row[3]) {
        if (!postings.has(ingredient)) postings.set(ingredient, []);
        postings.get(ingredient).push(index);
      }
    });
    neighbors = [];
    selected = null;
    lineProgress = 1;
    renderSelection();
    updateSummary();
    resize();
  }
  function updateSummary() {
    const threshold = Math.max(1, Math.min(20, Number(thresholdInput.value) || 3));
    thresholdInput.value = threshold;
    document.getElementById("recipe-summary").textContent =
      format.format(nodes.length) + " recipes shown · " +
      (selected === null ? "select a recipe to reveal links" :
        format.format(neighbors.length) + " links from the selected recipe") +
      " with at least " + threshold + " shared ingredients";
  }
  function updateConnections() {
    neighbors = [];
    if (selected !== null) {
      const counts = new Map();
      for (const ingredient of nodes[selected].row[3]) {
        for (const other of postings.get(ingredient) || []) {
          if (other !== selected) counts.set(other, (counts.get(other) || 0) + 1);
        }
      }
      const threshold = Math.max(1, Math.min(20, Number(thresholdInput.value) || 3));
      for (const [other, shared] of counts) {
        if (shared >= threshold) neighbors.push({ a: selected, b: other, shared });
      }
      neighbors.sort((a, b) => b.shared - a.shared);
      lineProgress = neighbors.length > 1500 ? 1 : 0;
    }
    updateSummary();
    renderSelection();
    requestDraw();
  }
  function scheduleBuild() {
    const token = ++buildToken;
    document.getElementById("recipe-summary").textContent = "Building recipe network…";
    setTimeout(() => { if (token === buildToken) buildNetwork(); }, 0);
  }
  function renderSelection() {
    const title = document.getElementById("recipe-detail-title");
    const detail = document.getElementById("recipe-detail");
    const source = document.getElementById("recipe-source");
    const list = document.getElementById("recipe-neighbors");
    list.replaceChildren();
    source.hidden = true;
    if (selected === null) {
      title.textContent = "Choose a recipe";
      detail.textContent = "Click a dot to see its ingredients and connected recipes.";
      return;
    }
    const node = nodes[selected];
    title.textContent = node.row[0];
    detail.textContent = node.row[3].length + " ingredients: " +
      node.row[3].map(id => data.ingredients[id]).join(", ") + ". " +
      neighbors.length + " connected recipes meet the current threshold.";
    if (/^https?:\/\//.test(node.row[1])) {
      source.href = node.row[1];
      source.hidden = false;
    }
    const foods = new Set(node.row[3]);
    for (const edge of neighbors.slice(0, 12)) {
      const other = nodes[edge.a === selected ? edge.b : edge.a];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "recipe-neighbor";
      button.textContent = other.row[0];
      const shared = document.createElement("small");
      shared.textContent = edge.shared + " shared: " + other.row[3]
        .filter(id => foods.has(id)).map(id => data.ingredients[id]).join(", ");
      button.appendChild(shared);
      button.addEventListener("click", () => {
        selected = edge.a === selected ? edge.b : edge.a;
        updateConnections();
      });
      list.appendChild(button);
    }
    requestDraw();
  }
  function hitNode(x, y) {
    let best = null, distance = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      const dx = screenX(nodes[i]) - x, dy = screenY(nodes[i]) - y;
      const d = dx * dx + dy * dy;
      if (d < 100 && d < distance) { best = i; distance = d; }
    }
    return best;
  }

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All cuisines";
  cuisineSelect.appendChild(allOption);
  data.cuisines.forEach((cuisine, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = cuisine.name + " (" + format.format(cuisine.recipes) + ")";
    cuisineSelect.appendChild(option);
  });
  cuisineSelect.value = "all";
  mode.addEventListener("change", () => {
    const recipes = mode.value === "recipes";
    ingredientView.hidden = recipes;
    recipeView.hidden = !recipes;
    if (recipes) scheduleBuild();
  });
  cuisineSelect.addEventListener("change", scheduleBuild);
  thresholdInput.addEventListener("change", updateConnections);
  new ResizeObserver(resize).observe(windowEl);
  canvas.addEventListener("pointerdown", event => {
    const box = canvas.getBoundingClientRect();
    const x = event.clientX - box.left, y = event.clientY - box.top;
    drag = { x, y, node: hitNode(x, y), moved: false };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", event => {
    const box = canvas.getBoundingClientRect();
    const x = event.clientX - box.left, y = event.clientY - box.top;
    if (drag) {
      const dx = x - drag.x, dy = y - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true;
      if (drag.moved) {
        offsetX += dx;
        offsetY += dy;
        requestDraw();
      }
      drag.x = x; drag.y = y;
      return;
    }
    const hit = hitNode(x, y);
    tooltip.style.display = hit === null ? "none" : "block";
    if (hit !== null) {
      tooltip.style.left = Math.max(5, Math.min(width - 280, x + 12)) + "px";
      tooltip.style.top = Math.max(5, y - 35) + "px";
      tooltip.textContent = nodes[hit].row[0] + " · " + nodes[hit].row[3].length + " ingredients";
    }
  });
  canvas.addEventListener("pointerup", () => {
    if (drag && !drag.moved && drag.node !== null) {
      selected = drag.node;
      updateConnections();
    }
    drag = null;
    canvas.classList.remove("dragging");
  });
  canvas.addEventListener("pointercancel", () => { drag = null; canvas.classList.remove("dragging"); });
  canvas.addEventListener("pointerleave", () => { if (!drag) tooltip.style.display = "none"; });
  canvas.addEventListener("wheel", event => {
    event.preventDefault();
    const box = canvas.getBoundingClientRect();
    zoomAt(Math.exp(-event.deltaY * 0.001), event.clientX - box.left, event.clientY - box.top);
  }, { passive: false });
  document.getElementById("recipe-zoom-in").addEventListener("click", () => zoomAt(1.6, width / 2, height / 2));
  document.getElementById("recipe-zoom-out").addEventListener("click", () => zoomAt(1 / 1.6, width / 2, height / 2));
  document.getElementById("recipe-fit").addEventListener("click", fit);
})();
