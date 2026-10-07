// Lemon farm: ASCII top-down map. Clear debris, plant lemon trees, harvest.
// Every tile is a 4x2 character sprite. Pure logic + text rendering, no DOM,
// so it runs in the browser and in Node.

const W = 12, H = 8;          // map size in tiles (48 x 16 characters on screen)

const TILE = {
  GROUND: '.',
  FENCE: '#',
  WEEDS: '"',
  LOG: '=',
  ROCK: 'O',
  STUMP: '%',
  SAPLING: 'i',
  TREE: 'Y',
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
const LEMON_STEPS = 8;      // steps for a tree to grow one more lemon
const MAX_LEMONS = 4;
const LEMON_PRICE = 2;      // coins per lemon sold
const CHOP_HITS = { [TILE.SAPLING]: 1, [TILE.TREE]: 3 };
const WOOD_COINS = 3;       // coins from chopping down a full tree

// Each sprite is two strings of exactly 4 characters.
const SPRITE = {
  [TILE.GROUND]:  ['    ', '    '],
  [TILE.FENCE]:   ['####', '####'],
  [TILE.WEEDS]:   [' "\'"', '"\'" '],
  [TILE.LOG]:     ['____', '(__)'],
  [TILE.ROCK]:    [' __ ', '/__\\'],
  [TILE.STUMP]:   ['.==.', '|__|'],
  [TILE.SAPLING]: ['  v ', '  | '],
};
const AIM = ['[  ]', '[  ]'];            // shown on the cleared ground you are facing
const PLAYER = [' o  ', '/|\\ '];

// Lemon slots inside the braces: {  } none, {. } 1, {: } 2, {:.} 3, {::} 4
const LEMON_SLOTS = ['  ', '. ', ': ', ':.', '::'];
const treeSprite = (n) => ['{' + LEMON_SLOTS[n] + '}', ' || '];

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
      const weeds = nearWeeds ? 0.30 : 0.06;
      if (r < weeds) row.push(TILE.WEEDS);
      else if (r < weeds + 0.07) row.push(TILE.ROCK);
      else if (r < weeds + 0.11) row.push(TILE.LOG);
      else if (r < weeds + 0.14) row.push(TILE.STUMP);
      else row.push(TILE.GROUND);
    }
    map.push(row);
  }
  // Clear a starting yard so the player never spawns walled in.
  for (let y = 1; y <= 2; y++) for (let x = 1; x <= 2; x++) map[y][x] = TILE.GROUND;

  return {
    seed, map, W, H,
    player: { x: 1, y: 1, face: { x: 1, y: 0 } },
    coins: 0, lemons: 0, saplings: 3,
    step: 0,
    hits: {},      // "x,y" -> damage dealt to debris so far
    age: {},       // "x,y" -> step the sapling was planted
    trees: {},     // "x,y" -> { n: lemons on the tree, at: step of last change }
    msg: 'Arrow keys / WASD to move. Walk into debris to clear it. P plants, E harvests, C chops a tree, B buys a sapling.',
  };
}

const key = (x, y) => `${x},${y}`;
const at = (g, x, y) => g.map[y][x];
const front = (g) => ({ x: g.player.x + g.player.face.x, y: g.player.y + g.player.face.y });

function advance(g) {
  g.step++;
  for (const k of Object.keys(g.age)) {
    if (g.step - g.age[k] >= GROW_STEPS) {
      const [x, y] = k.split(',').map(Number);
      g.map[y][x] = TILE.TREE;
      g.trees[k] = { n: 0, at: g.step };
      delete g.age[k];
      g.msg = 'A sapling grew into a lemon tree!';
    }
  }
  for (const t of Object.values(g.trees)) {
    if (t.n < MAX_LEMONS && g.step - t.at >= LEMON_STEPS) {
      t.n++; t.at = g.step;
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
    g.msg = 'A lemon tree is in the way. Press E to pick its lemons.';
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
  const tree = g.trees[key(x, y)];
  if (tree && tree.n > 0) {
    g.lemons += tree.n;
    g.msg = `Picked ${tree.n} lemon${tree.n > 1 ? 's' : ''}!`;
    tree.n = 0; tree.at = g.step;
  } else if (tree) g.msg = 'No lemons on that tree yet.';
  else g.msg = 'Nothing to harvest there.';
  advance(g);
}

function buySapling(g) {
  if (g.coins >= SAPLING_COST) {
    g.coins -= SAPLING_COST; g.saplings++;
    g.msg = 'Bought a sapling.';
  } else g.msg = `A sapling costs ${SAPLING_COST} coins.`;
}

function sellLemons(g) {
  if (g.lemons < 1) { g.msg = 'You have no lemons to sell.'; return; }
  const earned = g.lemons * LEMON_PRICE;
  g.msg = `Sold ${g.lemons} lemon${g.lemons > 1 ? 's' : ''} for ${earned} coins.`;
  g.coins += earned;
  g.lemons = 0;
}

function chop(g) {
  const { x, y } = front(g);
  const t = at(g, x, y), k = key(x, y), need = CHOP_HITS[t];
  if (!need) { g.msg = 'There is no lemon tree in front of you to chop down.'; return; }
  g.hits[k] = (g.hits[k] || 0) + 1;
  if (g.hits[k] < need) {
    g.msg = `Chopping the tree... (${g.hits[k]}/${need})`;
  } else {
    delete g.hits[k];
    g.map[y][x] = TILE.GROUND;
    if (t === TILE.SAPLING) {
      delete g.age[k];
      g.saplings++;
      g.msg = 'Dug up the sapling. It goes back in your bag.';
    } else {
      const n = g.trees[k].n;
      delete g.trees[k];
      g.lemons += n;
      g.coins += WOOD_COINS;
      g.msg = `Chopped down the tree! +${WOOD_COINS} coins` + (n ? ` and ${n} lemon${n > 1 ? 's' : ''}.` : '.');
    }
  }
  advance(g);
}

function spriteAt(g, x, y) {
  if (x === g.player.x && y === g.player.y) return PLAYER;
  const t = at(g, x, y);
  if (t === TILE.TREE) return treeSprite(g.trees[key(x, y)].n);
  if (t === TILE.GROUND) {
    const f = front(g);
    if (f.x === x && f.y === y) return AIM;
  }
  return SPRITE[t];
}

function render(g) {
  const lines = [];
  for (let y = 0; y < H; y++) {
    let top = '', bottom = '';
    for (let x = 0; x < W; x++) {
      const s = spriteAt(g, x, y);
      top += s[0]; bottom += s[1];
    }
    lines.push(top, bottom);
  }
  lines.push('');
  lines.push(`Coins: ${g.coins}   Lemons: ${g.lemons}   Saplings: ${g.saplings}   Step: ${g.step}`);
  lines.push(g.msg);
  lines.push('Tree lemons: {  } 0   {. } 1   {: } 2   {:.} 3   {::} 4     [  ] = tile you are facing');
  return lines.join('\n');
}

const api = { newGame, move, plant, harvest, buySapling, sellLemons, chop, render, TILE, DEBRIS, W, H,
              SAPLING_COST, LEMON_PRICE, GROW_STEPS, LEMON_STEPS, MAX_LEMONS };
if (typeof module !== 'undefined') module.exports = api;
else window.Farm = api;
