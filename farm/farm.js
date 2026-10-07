// Lemon farm: ASCII top-down map. Clear debris, plant lemon trees, harvest.
// Pure logic + text rendering, no DOM, so it runs in the browser and in Node.

const W = 40, H = 20;

const TILE = {
  GROUND: '.',
  FENCE: '#',
  WEEDS: '"',
  LOG: '=',
  ROCK: 'O',
  STUMP: '%',
  SAPLING: 'i',
  TREE: 'Y',
  FRUIT: '&',   // mature tree with lemons ready
};

// hits to clear, coins earned
const DEBRIS = {
  [TILE.WEEDS]: { hits: 1, coins: 1, name: 'weeds' },
  [TILE.LOG]:   { hits: 2, coins: 3, name: 'a log' },
  [TILE.ROCK]:  { hits: 3, coins: 2, name: 'a rock' },
  [TILE.STUMP]: { hits: 4, coins: 4, name: 'a stump' },
};

const SAPLING_COST = 5;
const GROW_STEPS = 30;      // steps for sapling -> tree
const FRUIT_STEPS = 20;     // steps for tree -> fruiting
const LEMONS_PER_HARVEST = 3;

// Small seeded RNG (mulberry32) so a farm can be reproduced from its seed.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function newGame(seed = Date.now()) {
  const rand = rng(seed);
  const map = [];
  for (let y = 0; y < H; y++) {
    const row = [];
    for (let x = 0; x < W; x++) {
      const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1;
      if (edge) { row.push(TILE.FENCE); continue; }
      const r = rand();
      // weeds clump: more likely next to existing weeds
      const nearWeeds = row[x - 1] === TILE.WEEDS || (map[y - 1] && map[y - 1][x] === TILE.WEEDS);
      const weeds = nearWeeds ? 0.30 : 0.05;
      if (r < weeds) row.push(TILE.WEEDS);
      else if (r < weeds + 0.04) row.push(TILE.ROCK);
      else if (r < weeds + 0.06) row.push(TILE.LOG);
      else if (r < weeds + 0.075) row.push(TILE.STUMP);
      else row.push(TILE.GROUND);
    }
    map.push(row);
  }
  // Clear a starting yard so the player never spawns walled in.
  const start = { x: 2, y: 2 };
  for (let y = 1; y <= 4; y++) for (let x = 1; x <= 4; x++) map[y][x] = TILE.GROUND;

  return {
    seed, map, W, H,
    player: { ...start, face: { x: 1, y: 0 } },
    coins: 0, lemons: 0, saplings: 3,
    step: 0,
    hits: {},      // "x,y" -> damage dealt to debris so far
    age: {},       // "x,y" -> step when planted / last harvested
    msg: 'Arrow keys / WASD to move. Walk into debris to clear it. P plants, E harvests, B buys a sapling.',
  };
}

const key = (x, y) => `${x},${y}`;
const at = (g, x, y) => g.map[y][x];
const front = (g) => ({ x: g.player.x + g.player.face.x, y: g.player.y + g.player.face.y });

function advance(g) {
  g.step++;
  for (const k of Object.keys(g.age)) {
    const [x, y] = k.split(',').map(Number);
    const t = at(g, x, y);
    const elapsed = g.step - g.age[k];
    if (t === TILE.SAPLING && elapsed >= GROW_STEPS) {
      g.map[y][x] = TILE.TREE; g.age[k] = g.step;
      g.msg = 'A sapling grew into a lemon tree!';
    } else if (t === TILE.TREE && elapsed >= FRUIT_STEPS) {
      g.map[y][x] = TILE.FRUIT; g.age[k] = g.step;
      g.msg = 'A tree is bearing lemons (&). Press E next to it to harvest.';
    }
  }
}

function move(g, dx, dy) {
  g.player.face = { x: dx, y: dy };
  const nx = g.player.x + dx, ny = g.player.y + dy;
  const t = at(g, nx, ny);
  if (t === TILE.GROUND) {
    g.player.x = nx; g.player.y = ny;
  } else if (DEBRIS[t]) {
    const d = DEBRIS[t], k = key(nx, ny);
    g.hits[k] = (g.hits[k] || 0) + 1;
    if (g.hits[k] >= d.hits) {
      delete g.hits[k];
      g.map[ny][nx] = TILE.GROUND;
      g.coins += d.coins;
      g.msg = `Cleared ${d.name}! +${d.coins} coin${d.coins > 1 ? 's' : ''}.`;
    } else {
      g.msg = `Chopping ${d.name}... (${g.hits[k]}/${d.hits})`;
    }
  } else if (t === TILE.FENCE) {
    g.msg = "That's the fence.";
  } else {
    g.msg = 'A lemon tree is in the way.';
  }
  advance(g);
}

function plant(g) {
  const { x, y } = front(g);
  if (at(g, x, y) !== TILE.GROUND) g.msg = 'You can only plant on cleared ground in front of you.';
  else if (g.saplings < 1) g.msg = `Out of saplings. Press B to buy one (${SAPLING_COST} coins).`;
  else {
    g.saplings--;
    g.map[y][x] = TILE.SAPLING;
    g.age[key(x, y)] = g.step;
    g.msg = 'Planted a lemon sapling.';
  }
  advance(g);
}

function harvest(g) {
  const { x, y } = front(g);
  if (at(g, x, y) === TILE.FRUIT) {
    g.map[y][x] = TILE.TREE;
    g.age[key(x, y)] = g.step;
    g.lemons += LEMONS_PER_HARVEST;
    g.msg = `Harvested ${LEMONS_PER_HARVEST} lemons!`;
  } else g.msg = 'Nothing to harvest there.';
  advance(g);
}

function buySapling(g) {
  if (g.coins >= SAPLING_COST) {
    g.coins -= SAPLING_COST; g.saplings++;
    g.msg = 'Bought a sapling.';
  } else g.msg = `A sapling costs ${SAPLING_COST} coins.`;
}

function render(g) {
  const lines = [];
  for (let y = 0; y < H; y++) {
    let line = '';
    for (let x = 0; x < W; x++) {
      if (x === g.player.x && y === g.player.y) line += '@';
      else line += g.map[y][x];
    }
    lines.push(line);
  }
  lines.push('');
  lines.push(`Coins: ${g.coins}   Lemons: ${g.lemons}   Saplings: ${g.saplings}   Step: ${g.step}`);
  lines.push(g.msg);
  lines.push('Legend: @ you  # fence  " weeds  = log  O rock  % stump  i sapling  Y tree  & ripe tree');
  return lines.join('\n');
}

const api = { newGame, move, plant, harvest, buySapling, render, TILE, DEBRIS, W, H,
              SAPLING_COST, GROW_STEPS, FRUIT_STEPS };
if (typeof module !== 'undefined') module.exports = api;
else window.Farm = api;
