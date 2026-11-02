# Checkpoint voiceover — target 108 s (~265 spoken words at ~150 wpm)

Replace the `[TEAM NAME]` and `[MEMBER …]` placeholders. Record at 1280×800 or larger, with the browser zoomed to 90–100 %.
Pages: `index.html` (prototype) and `exploration.html` (graphs 1–5).

| Time | Show on screen | Voiceover |
|---|---|---|
| 0:00–0:07 | `index.html`, top of page (title and question visible) | "Hi, we're team [TEAM NAME]: [MEMBER 1], [MEMBER 2], [MEMBER 3], and [MEMBER 4]." |
| 0:07–0:21 | Scroll `exploration.html` to the header's gray data note; hover over it | "We're using CMIP6 climate model output from Google Cloud: monthly near-surface air temperature from one model, CESM2-WACCM, under a low-emissions scenario, SSP1-2.6, and a high-emissions one, SSP5-8.5. We averaged land grid cells in a California bounding box, area-weighted, into yearly means in degrees Celsius." |
| 0:21–0:32 | Graph 1: hover the crosshair around 2040, then 2100 | "Graph one shows the yearly trajectories. The two futures overlap until about mid-century. Then SSP1-2.6 levels off near sixteen degrees while SSP5-8.5 climbs past twenty-one." |
| 0:32–0:43 | Graph 2: point to the blue bars, then the 2059 annotation | "So we plotted the gap itself. Single years are noisy: low emissions is actually warmer in twenty-one years, the last in 2059." |
| 0:43–0:53 | Graph 3: hover the warmest blue dot (17.07), then the coolest orange dot (18.84) | "Graph three compares 2081 to 2100. The distributions don't overlap at all. Even the warmest low-emissions year is cooler than the coolest high-emissions year." |
| 0:53–1:03 | Graph 4: hover a year in the 2030s, then trace the smoothed lines | "Graph four shows year-to-year swings of about half a degree, as big as the whole emissions signal until about 2050. That told us to average over windows." |
| 1:03–1:14 | Graph 5: hover the four green bars from left to right | "Graph five averages the gap by twenty-year window: from a quarter degree in the near term to almost four degrees by century's end. California ends up ahead of the global gap." |
| 1:14–1:22 | Switch to `index.html`, title in view | "That led to our title, 'Two Futures, One Planet,' and our question: how does the temperature gap between these futures change over the century?" |
| 1:22–1:40 | Click **Near term 2021–2040** (gap +0.24 °C), click **End of century 2081–2100** (+3.92 °C), drag across about 2061–2080 (+2.26 °C), click **Global** (+1.83 °C) | "Here's our working prototype. Pick a window with a preset or by dragging, and both scenario averages and the gap update together. Near term the gap is a quarter degree; end of century it's nearly four. You can also switch to the global average." |
| 1:40–1:48 | Scroll to the "Status at the checkpoint" card | "Still to come: annotations, our design write-up, and visual polish. Adding more models is a stretch goal. Thanks for watching!" |

**Completed (shown live):** data pipeline and verified CSV, five exploratory graphs, brush and preset window selection, region toggle, linked readouts, hover tooltips.
**Planned (said as future work):** annotations, write-up, visual polish; multi-model spread is a stretch goal.

Word count: about 270. Read at a steady pace and it lands at about 105–110 s. If you're running long, trim the second sentence of the Graph 5 line.
