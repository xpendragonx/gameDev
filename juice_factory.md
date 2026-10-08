# 🍎 The Apple Juice Factory — Segment by Segment (ASCII)

Source: video walkthrough of an apple juice plant (Macintosh apples, ~90% of
production at the October harvest, 20,000–40,000 tons of apples per year).

Each canvas below is one stage of the line. Read them in order.

---

## 0. THE WHOLE LINE (overview map)

```
  OCTOBER HARVEST                                                    ALL YEAR ROUND
  ───────────────                                                    ──────────────

 [1]INSPECT  [2]SILO   [3]WASH    [4]GRIND   [5]MACERATE  [6]PRESS   [7]QC   [8]FILTER
  ~~~~~~~~   |‾‾‾|    ~~~~~~     \\\\//     ┌───┐ ┌───┐   ╔═══╗     ┌─┐     ╱╲╱╲
 o o o o o   | o |   o~o~o~o    -> ░░░ ->   │▒▒▒│ │▒▒▒│ ->║ ▼ ║ ->  │●│ ->  ╲╱╲╱  ->
 ═══════════> |_o_|  ═════════>            └───┘ └───┘   ╚═══╝     └─┘
                │ stepped chute            60-90 min      juice

 -> [9]TANKS -> [10]PASTEURIZE -> [11]ULTRAFILTER -> [12]QC -> [13]STERILE STORAGE
      ▐█▌          22°→88°→50°C     ┊┊┊┊ membrane    ✔ taste     ▐█▌ ▐█▌ ▐█▌ 110,000 L

 -> [14] DRINK BOXES (100/min)  ┐
                                ├-> [16] LABEL -> SHIP 🚚
 -> [15] BOTTLES    (120/min)   ┘
```

---

## 1. RECEPTION & INSPECTION CONVEYOR

Apples ride up the belt. Inspectors watch. The belt tumbles apples *backwards*,
so wet leaves and trash stick to the belt and are carried away.

```
                                                         ___
                                                        /   \   INSPECTION
                                                       | o o |  STATION
                                                       |  ‿  |    👁
                       <<< apples tumble BACKWARD >>>  /|     |\
                                                      / |_____| \
        TRUCK                                            ┃┃
   ┌───────────┐                                         ┃┃
   │ ◯ ◯ ◯ ◯ ◯ │       ◯ ◯                ◯ ◯ ◯          ┃┃
   │◯◯◯◯◯◯◯◯◯◯◯│ ──┐  ◯◯◯◯◯  ◯          ◯◯◯◯◯ ◯  ◯     ┃┃
   └─┬───────┬─┘   │ ╱──────────────────────────────────────────╲
     ◉       ◉     └▶  ➜  ➜  ➜  ➜  ➜  ➜  ➜  ➜  ➜  ➜  ➜  ➜  ➜  ➜  ╲▶  to silos
   ═══════════       ╲_◉___◉___◉___◉___◉___◉___◉___◉___◉___◉___◉__╱
                          ↑                ↑
                    leaf ❦ ❦ ❦ stick   twig ⌇ stick
                    to the wet belt    to the wet belt
```

---

## 2. SILOS & THE STEPPED CHUTE

Apples rest in silos for several hours. The stepped chute slows the fall so
nothing gets bruised.

```
        ┌───────┐   ┌───────┐   ┌───────┐
        │ ◯ ◯ ◯ │   │ ◯ ◯ ◯ │   │ ◯ ◯ ◯ │      SILOS
        │◯ ◯ ◯ ◯│   │◯ ◯ ◯ ◯│   │◯ ◯ ◯ ◯│      "rest for
        │◯◯ ◯ ◯◯│   │◯◯ ◯ ◯◯│   │◯◯ ◯ ◯◯│       several hours"
        │◯◯◯◯◯◯◯│   │◯◯◯◯◯◯◯│   │◯◯◯◯◯◯◯│
        └─╲   ╱─┘   └─╲   ╱─┘   └─╲   ╱─┘
           ╲ ╱         ╲ ╱         ╲ ╱
            V           V           V
            │           │           │
      ══════╧═══════════╧═══════════╧══════╗
                                           ║
                    STEPPED CHUTE          ║
                                       ┌───╜
                                  ◯    │
                                ┌─────┘      ◯  bounce.. soft landing
                           ◯    │
                         ┌──────┘
                    ◯    │
                  ┌──────┘
             ◯    │
           ┌──────┘
      ◯    │
    ┌──────┘
    │            ◯ ──────────────────▶  to washing
════╧════════════════════════════════
```

---

## 3. WASHING: WATER BATH + COOL SHOWER

Fallen apples bring pebbles. The first bath sinks the stones; a cool shower
finishes the job.

```
   apples in                                   cool shower
       │                                     ╷  ╷  ╷  ╷  ╷  ╷  ╷
       ▼                                  ┌──┴──┴──┴──┴──┴──┴──┴──┐
   ◯ ◯ ◯ ◯                                │ ○  ○  ○  ○  ○  ○  ○   │
 ┌──────────────────────────────┐         │ ' ' ' ' ' ' ' ' ' ' ' │
 │~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~│         │  ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯ ◯  │
 │~ ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯ ~~~~│  ──────▶│ ═══════════════════════ ──▶ to grinder
 │~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~│         └────────────────────────┘
 │~~ ▪  ▪   ▪  ▪ (pebbles) ~~~~~│                 │ ┊ ┊ ┊
 │~~ ▪▪▪  ▪▪▪   ▪▪ sink ~~~~~~~~│                 ▼ ┊ ┊  drain
 └──────────────┬───────────────┘
        pebble  │
        trap  ▼▼▼▼▼
              [▪▪▪▪▪]  <- removed here
         WATER BATH                         SHOWER
```

---

## 4. THE GRINDER → "GRATINGS" (mash)

Apples are cut into little pieces. Enzymes are added to break down the
cell structure, so the maximum amount of juice can be extracted.

```
            ◯   ◯   ◯
             ╲  │  ╱
              ╲ │ ╱           ENZYME
         ┌─────╲│╱─────┐      DOSING
         │      V      │   ┌──────┐
         │  ╱╲ ╱╲ ╱╲   │   │ ⚗⚗⚗ │
         │ ╱  ╳  ╳  ╲  │   │ enz. │
         │ ╲  ╳  ╳  ╱  │   └──┬───┘
         │  ╲╱ ╲╱ ╲╱   │◀─────┘ drip.. drip..
         │ (cutting     │
         │   blades)    │
         └──────┬───────┘
                │
                ▼
        ░░▒▒░░▒▒░░▒▒░░    "GRATINGS"
         ░▒░▒░▒░▒░▒░▒     (apple mash)
              │
              ▼ to maceration
```

---

## 5. MACERATION RESERVOIRS (60–90 min)

The enzymes get to work while the mash waits.

```
          ┌──────────┐      ┌──────────┐      ┌──────────┐
          │ ⌚ 60-90  │      │ ⌚ 60-90  │      │ ⌚ 60-90  │
          │    min    │      │    min    │      │    min    │
          ├──────────┤      ├──────────┤      ├──────────┤
 mash ═══▶│▒░▒░▒░▒░▒░│      │▒░▒░▒░▒░▒░│      │▒░▒░▒░▒░▒░│
          │░▒░▒░▒░▒░▒│      │░▒░▒░▒░▒░▒│      │░▒░▒░▒░▒░▒│
          │▒░▒░▒░▒░▒░│      │▒░▒░▒░▒░▒░│      │▒░▒░▒░▒░▒░│
          │░▒░▒░▒░▒░▒│      │░▒░▒░▒░▒░▒│      │░▒░▒░▒░▒░▒│
          └─────┬────┘      └─────┬────┘      └─────┬────┘
                │                 │                 │
        ════════╧═════════════════╧═════════════════╧════▶ to press
                              (pump)  ⟳
```

---

## 6. HYDRAULIC PRESS

Mash is pumped into a powerful press. Filter sleeves keep back the skins,
seeds and stems — only juice gets through.

```
                    ▼ ▼ ▼  HYDRAULIC FORCE  ▼ ▼ ▼
                 ╔═══════════════════════════════╗
                 ║         ▓▓▓▓▓▓▓▓▓▓▓▓▓        ║  <- piston
                 ╠═══════════════════════════════╣
   mash ═══▶     ║  ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐     ║
   (pump)        ║  │░│  │░│  │░│  │░│  │░│     ║
                 ║  │▒│  │▒│  │▒│  │▒│  │▒│     ║  <- FILTER SLEEVES
                 ║  │░│  │░│  │░│  │░│  │░│     ║     keep:
                 ║  └┬┘  └┬┘  └┬┘  └┬┘  └┬┘     ║     skins  ░
                 ║   ┊    ┊    ┊    ┊    ┊      ║     seeds  ●
                 ╚═══╪════╪════╪════╪════╪══════╝     stems  ⌇
                     ┊    ┊    ┊    ┊    ┊
                     ▼    ▼    ▼    ▼    ▼
                 ┌─────────────────────────────┐
                 │ 🍏  J U I C E  🍏  ~~~~~~~~~ │ ═══▶ to filtering
                 └─────────────────────────────┘
   waste cake ░▒░▒ ──▶ out the back (skins · seeds · stems)
```

---

## 7. QUALITY CONTROL — SAMPLING

Quality is checked at every stage. Samples are drawn off to make sure the
fabrication parameters are respected.

```
      juice pipe
   ═══════╤═══════════════════════════▶
          │
          ┴  <- sample tap
          ┊
          ▼                         CHECKLIST
        ┌───┐                      ┌───────────────┐
        │   │                      │ [✔] Brix      │
        │ ● │  sample              │ [✔] Acidity   │
        │   │  vial       🔬       │ [✔] Color     │
        └───┘                      │ [✔] Parameters│
                  ┌──────────┐     └───────────────┘
        👷 ──────▶│ ◔ ◑ ◕ ◉ │  lab station
                  └──────────┘
```

---

## 8. FIRST FILTRATION (the sieve)

The smallest remaining undesirable particles are held back.

```
   juice in  ═══════╗
                    ║
              ┌─────╨─────┐
              │  ○ ○ ○ ○  │
              │ ○ ○ ○ ○ ○ │   ← particles
              │ ╲╱╲╱╲╱╲╱╲╱│
              │ ╱╲╱╲╱╲╱╲╱╲│   ← SIEVE (fine mesh)
              │ ╲╱╲╱╲╱╲╱╲╱│
              │  ┊ ┊ ┊ ┊  │
              │  ┊ ┊ ┊ ┊  │   ← clearer juice
              └─────╥─────┘
                    ║
   juice out ═══════╝▶
```

---

## 9. BUFFER RESERVOIRS ("immense reservoirs")

Juice flows from one stage to the next through huge tanks.

```
      ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
     ╱               ╲   ╱               ╲   ╱               ╲
    │    ~~~~~~~~     │ │    ~~~~~~~~     │ │    ~~~~~~~~     │
    │  ▓▓▓▓▓▓▓▓▓▓▓▓   │ │  ▓▓▓▓▓▓▓▓▓▓▓▓   │ │  ▓▓▓▓▓▓▓▓▓▓▓▓   │
    │  ▓▓ JUICE ▓▓▓   │ │  ▓▓ JUICE ▓▓▓   │ │  ▓▓ JUICE ▓▓▓   │
    │  ▓▓▓▓▓▓▓▓▓▓▓▓   │ │  ▓▓▓▓▓▓▓▓▓▓▓▓   │ │  ▓▓▓▓▓▓▓▓▓▓▓▓   │
    │  ▓▓▓▓▓▓▓▓▓▓▓▓   │ │  ▓▓▓▓▓▓▓▓▓▓▓▓   │ │  ▓▓▓▓▓▓▓▓▓▓▓▓   │
    └──┬─────────┬────┘ └──┬─────────┬────┘ └──┬─────────┬────┘
       ║         ║         ║         ║         ║         ║
  ═════╩═════════╩═════════╩═════════╩═════════╩═════════╩═════▶ next: pasteurization
```

---

## 10. PASTEURIZATION — HEAT EXCHANGER

Juice enters at 22 °C, is heated to 88 °C, then cooled back down to 50 °C.

```
   JUICE IN                                              JUICE OUT
    22 °C                                                  50 °C
      │                                                      ▲
      ▼        HEATING                COOLING                │
   ┌───────────────────────┐   ┌────────────────────────┐    │
   │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │   │ ░░░░░░░░░░░░░░░░░░░░░░ │    │
   │ ▒ 🔥 hot plates 🔥   ▒ │──▶│ ░ ❄ cold plates ❄    ░ │────┘
   │ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │   │ ░░░░░░░░░░░░░░░░░░░░░░ │
   └───────────────────────┘   └────────────────────────┘
        peak: 88 °C

   TEMPERATURE PROFILE
   °C
   90 │              ╭──╮
   80 │             ╱    ╲
   70 │            ╱      ╲
   60 │           ╱        ╲
   50 │          ╱          ╲___________ 50
   40 │         ╱
   30 │        ╱
   22 │ ──────╯
      └──────────────────────────────────▶ time
```

---

## 11. ENZYMES + ULTRAFILTRATION

More enzymes hydrate the pectin. Then membranes with microscopic pores hold
back even the smallest particles — the juice comes out perfectly clear.

```
                    enzymes
                    ┌─────┐
                    │ ⚗⚗  │
                    └──┬──┘
                       ┊ (hydrate pectin)
   juice ═════════════▶▼══════════════╗
                                      ║
        ULTRAFILTRATION MODULE        ║
   ┌──────────────────────────────────╨───────────┐
   │ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ │
   │ ┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃┃ │ <- membrane
   │ ┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊┊ │    (microscopic pores)
   └───────────┬──────────────────────┬───────────┘
               │ clear juice          │ retained particles
               ▼                      ▼
        ✨ CLEAR JUICE ✨          [○○○ waste]

    zoom into a pore:    ·  ·  ○  ·  ·   <- big particle: BLOCKED
                       ═══╗╔═══╗╔═══╗╔═══
                          ║║   ║║   ║║
                       . . ║║ . ║║ . ║║ .  <- juice molecules pass
```

---

## 12. FINAL QUALITY CHECK

Clarity, flavor, color and natural fruit sugar content are verified.

```
                  ┌───────────────────────────────────┐
                  │        FINAL  QC  PANEL           │
                  ├───────────────────────────────────┤
     ╔═══╗        │ CLARITY   [██████████] 100%  ✔    │
     ║ ● ║  ───▶  │ FLAVOR    [█████████░]  95%  ✔    │
     ║ ● ║        │ COLOR     [██████████] 100%  ✔    │
     ╚═══╝        │ SUGAR     [███████░░░]  70%  ✔    │
   glass of       │           (natural fruit sugar)   │
   juice          └───────────────────────────────────┘
```

---

## 13. STERILE STORAGE (no preservatives)

Because apples are pressed in October, part of the juice is stored sterile
until bottling during the rest of the year. Each tank holds 110,000 L.
**No preserving agent is added.**

```
       ┌─────┐       ┌─────┐       ┌─────┐       ┌─────┐
      ╱       ╲     ╱       ╲     ╱       ╲     ╱       ╲
     │ 110,000 │   │ 110,000 │   │ 110,000 │   │ 110,000 │
     │    L    │   │    L    │   │    L    │   │    L    │
     │ ▓▓▓▓▓▓▓ │   │ ▓▓▓▓▓▓▓ │   │ ▓▓▓▓▓▓▓ │   │ ▓▓▓▓▓▓▓ │
     │ ▓▓▓▓▓▓▓ │   │ ▓▓▓▓▓▓▓ │   │ ▓▓▓▓▓▓▓ │   │ ▓▓▓▓▓▓▓ │
     │ ▓▓▓▓▓▓▓ │   │ ▓▓▓▓▓▓▓ │   │ ▓▓▓▓▓▓▓ │   │ ▓▓▓▓▓▓▓ │
     └────┬────┘   └────┬────┘   └────┬────┘   └────┬────┘
          ║             ║             ║             ║
   ═══════╩═════════════╩═════════════╩═════════════╩════▶ to bottling
         STERILE WAREHOUSE — 🚫 NO PRESERVATIVES 🚫
```

---

## 14. DRINK-BOX LINE (100 per minute)

Small drinking containers are filled, hermetically sealed, and two sprays of
hot glue attach the straw to the side.

```
   FILLER           SEALER              GLUE GUN          OUT
   ┌─────┐          ┌──────┐            ┌────────┐
   │  ▼  │          │ ▓▓▓▓ │             ╲  ╲ ╱  ╱
   │juice│          │ seal │              ╲ ·╳· ╱   2 sprays of
   └──┬──┘          └──┬───┘               ╲ ╱     hot glue
      ┊                │                    ▼
      ▼                ▼                 ┌──────┐
  ┌──────┐         ┌──────┐         ┌───┬┤straw ├┐
  │      │         │▓▓▓▓▓▓│         │   ││ ░░░░ ││     ┌──────┐
  │ ░░░░ │  ──▶    │ ░░░░ │  ──▶    │   │└──────┘│ ──▶ │ 🧃🧃 │
  │ ░░░░ │         │ ░░░░ │         └───┴────────┘     │ 🧃🧃 │
  └──────┘         └──────┘                            └──────┘
 ════════════════════════════════════════════════════════════▶
                      conveyor  ·  100 boxes / minute
```

---

## 15. BOTTLE LINE (120 per minute)

Bottles are washed and disinfected with hydrogen peroxide in a white sterile
room, rinsed with sterile water, filled with pasteurized juice, and capped —
all in a sterile environment.

```
 ┌─ STERILE ROOM ───────────────────────────────────────────────────────────┐
 │                                                                          │
 │   WASH + H₂O₂         RINSE            FILL              CAP             │
 │   DISINFECT           (sterile water)  120 / min                         │
 │                                                                          │
 │   ╷  ╷  ╷  ╷          ╷  ╷  ╷          ┌──────┐         ┌──────┐        │
 │   ┊  ┊  ┊  ┊          ┊  ┊  ┊          │ JUICE│         │  ▓▓  │        │
 │   ┊  ┊  ┊  ┊          ┊  ┊  ┊          └──┬───┘         └──┬───┘        │
 │                                             ┊                ▼            │
 │   ┌─┐ ┌─┐ ┌─┐        ┌─┐ ┌─┐ ┌─┐          ┌┴┐             ┌▓┐             │
 │   │ │ │ │ │ │        │ │ │ │ │ │          │░│             │░│             │
 │   │ │ │ │ │ │  ───▶  │ │ │ │ │ │  ───▶    │░│    ───▶     │░│    ───▶     │
 │   │ │ │ │ │ │        │ │ │ │ │ │          │░│             │░│             │
 │   └─┘ └─┘ └─┘        └─┘ └─┘ └─┘          └─┘             └─┘             │
 │ ═══════════════════════════════════════════════════════════════════════▶ │
 └──────────────────────────────────────────────────────────────────────────┘
```

---

## 16. LABELING & SHIPPING

Bottles are labeled and sent out. 20,000–40,000 tons of apples become juice
every year, available any time thanks to perfect preservation.

```
  LABELER                        PACKING                    SHIPPING DOCK
                                                          ┌─────────────────┐
   ┌──────┐                      ┌─────────┐              │  ┌───────────┐  │
   │ label│                      │ ▮ ▮ ▮ ▮ │              │  │ 🍎 JUICE  │  │
   │ roll │                      │ ▮ ▮ ▮ ▮ │    ┌───────┐ │  │  PALLETS  │  │
   └──┬───┘                      │ ▮ ▮ ▮ ▮ │──▶ │ PALLET│─┼▶ └───────────┘  │
      │ ⟲                        └─────────┘    └───────┘ │                  │
      ▼                                                    └──┬──────────────┘
    ┌─┐  ┌─┐   ┌─┐                                             │
    │🍎│▶│🍎│▶  │🍎│ ──▶ ═════════════════▶                  ┌───┴─────────────┐
    │ │  │ │   │ │                                          │ 🚚 ═══╗  ╔═══╗  │
    └─┘  └─┘   └─┘                                    ═══════ ◉═◉ ╚══╝   ◉═◉ ═══
                                                              Enjoy any time of year!
```

---

### Quick facts

| Stage                | Key number                    |
|----------------------|-------------------------------|
| Harvest share        | ~90% of production in October |
| Maceration           | 60–90 minutes                 |
| Pasteurization       | 22 °C → 88 °C → 50 °C         |
| Storage tank         | 110,000 L each                |
| Drink boxes          | 100 / minute                  |
| Bottles              | 120 / minute                  |
| Annual apples        | 20,000 – 40,000 tons          |
