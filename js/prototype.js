// Interactive prototype: pick a time window (brush or presets) and compare both scenarios and their gap.
(async function () {
  const { proj, meta } = await loadData();
  const el = document.querySelector("#proto");
  const W = 960, H = 400;
  const { svg, g, w, h } = makeSvg(el, { width: W, height: H, margin: { top: 20, right: 150, bottom: 40, left: 52 } });
  const x = d3.scaleLinear().domain([2015, 2100]).range([0, w]);
  const state = { a: 2081, b: 2100, region: "ca" };
  const col = (k) => (state.region === "glob" ? "global_" : "") + k;

  const gridG = g.append("g").attr("class", "grid");
  const xAxisG = g.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`);
  const yAxisG = g.append("g").attr("class", "axis");
  g.append("text").attr("class", "axis-title").attr("y", -8).text("Annual mean near-surface air temperature (°C)");
  g.append("text").attr("class", "axis-title").attr("x", w).attr("y", h + 34).attr("text-anchor", "end").text("Year — drag across the chart to choose a window");

  const shade = g.append("rect").attr("y", 0).attr("height", h).style("fill", "var(--band)");
  const lines = g.append("g");
  const pLow = lines.append("path").style("fill", "none").style("stroke", SC.low.color).style("stroke-width", 1.6).style("stroke-opacity", 0.55);
  const pHigh = lines.append("path").style("fill", "none").style("stroke", SC.high.color).style("stroke-width", 1.6).style("stroke-opacity", 0.55);
  const meanLow = g.append("line").style("stroke", SC.low.color).style("stroke-width", 3).style("stroke-linecap", "round");
  const meanHigh = g.append("line").style("stroke", SC.high.color).style("stroke-width", 3).style("stroke-linecap", "round");
  const bracket = g.append("path").style("fill", "none").style("stroke", "var(--text-primary)").style("stroke-width", 1.5);
  const lblLow = g.append("text").attr("class", "label").attr("dy", "0.35em");
  const lblHigh = g.append("text").attr("class", "label").attr("dy", "0.35em");
  const lblGap = g.append("text").attr("class", "label").style("font-weight", 600).attr("dy", "0.35em");

  const y = d3.scaleLinear().range([h, 0]);
  function rescaleY() {
    const ext = d3.extent(proj.flatMap(d => [d[col("ssp126_c")], d[col("ssp585_c")]]));
    y.domain([Math.floor(ext[0]) - 0.5, Math.ceil(ext[1]) + 0.5]);
    gridG.call(d3.axisLeft(y).ticks(6).tickSize(-w).tickFormat(""));
    yAxisG.call(d3.axisLeft(y).ticks(6));
    xAxisG.call(d3.axisBottom(x).ticks(9).tickFormat(d3.format("d")));
    const ln = k => d3.line().x(d => x(d.year)).y(d => y(d[col(k)]));
    pLow.datum(proj).attr("d", ln("ssp126_c"));
    pHigh.datum(proj).attr("d", ln("ssp585_c"));
  }

  // Brush (snaps to whole years, minimum 5-year window)
  const brush = d3.brushX().extent([[0, 0], [w, h]])
    .on("brush", ({ selection, sourceEvent }) => { if (selection && sourceEvent) { const [a, b] = toYears(selection); update(a, b, false); } })
    .on("end", ({ selection, sourceEvent }) => {
      if (!sourceEvent) return;
      if (!selection) { brushG.call(brush.move, [x(state.a), x(state.b)]); return; }
      let [a, b] = toYears(selection);
      if (b - a < 4) { b = Math.min(2100, a + 4); a = b - 4; }
      setWindow(a, b);
    });
  const brushG = g.append("g").attr("class", "brush").call(brush);
  function toYears([x0, x1]) { return [Math.round(x.invert(x0)), Math.round(x.invert(x1))]; }

  // Hover tooltip (on top of brush overlay via pointer events on the brush group)
  const tt = tooltip(el);
  const vline = g.append("line").attr("y1", 0).attr("y2", h).style("stroke", "var(--text-muted)").style("opacity", 0).style("pointer-events", "none");
  brushG.on("pointermove.tt", function (ev) {
    const yr = Math.round(x.invert(d3.pointer(ev, g.node())[0]));
    const d = proj[yr - 2015]; if (!d) return;
    vline.attr("x1", x(yr)).attr("x2", x(yr)).style("opacity", 1);
    placeTooltip(tt, el, ev, `<b>${yr}</b>
      <div class="tt-row"><span><span class="sw" style="background:var(--high)"></span>SSP5-8.5</span><b>${fmt(d[col("ssp585_c")])} °C</b></div>
      <div class="tt-row"><span><span class="sw" style="background:var(--low)"></span>SSP1-2.6</span><b>${fmt(d[col("ssp126_c")])} °C</b></div>
      <div class="tt-row"><span>Gap</span><b>${signed(d[col("gap_c")])} °C</b></div>`);
  }).on("pointerleave.tt", () => { vline.style("opacity", 0); hideTooltip(tt); });

  function update(a, b, moveBrush = true) {
    state.a = a; state.b = b;
    const m = windowMeans(proj, a, b, state.region === "glob" ? "global_" : "");
    shade.attr("x", x(a)).attr("width", Math.max(1, x(b) - x(a)));
    meanLow.attr("x1", x(a)).attr("x2", x(b)).attr("y1", y(m.low)).attr("y2", y(m.low));
    meanHigh.attr("x1", x(a)).attr("x2", x(b)).attr("y1", y(m.high)).attr("y2", y(m.high));
    const bx = x(b) + 8;
    bracket.attr("d", `M${bx - 4},${y(m.high)}H${bx}V${y(m.low)}H${bx - 4}`);
    lblHigh.attr("x", w + 8).attr("y", y(proj[proj.length - 1][col("ssp585_c")])).text("SSP5-8.5");
    lblLow.attr("x", w + 8).attr("y", y(proj[proj.length - 1][col("ssp126_c")])).text("SSP1-2.6");
    const endLabels = b <= 2092 ? 1 : 0; lblHigh.style("opacity", endLabels); lblLow.style("opacity", endLabels);
    const gy = (y(m.high) + y(m.low)) / 2;
    const gapRight = bx + 6 + 80 < w + 150;
    lblGap.attr("x", gapRight ? bx + 6 : x(a) - 6).attr("text-anchor", gapRight ? "start" : "end").attr("y", gy).text(`gap ${signed(m.gap)} °C`);

    d3.select("#win-label").text(`${a}–${b} (${m.n} years)`);
    d3.select("#v-low").text(`${fmt(m.low)} °C`);
    d3.select("#v-high").text(`${fmt(m.high)} °C`);
    d3.select("#v-gap").text(`${signed(m.gap)} °C`);
    const base = state.region === "glob" ? meta.baseline_glob_c : meta.baseline_reg_c;
    d3.select("#s-low").text(`${signed(m.low - base)} °C vs 1995–2014`);
    d3.select("#s-high").text(`${signed(m.high - base)} °C vs 1995–2014`);
    const neg = m.rows.filter(r => r[col("gap_c")] < 0).length;
    d3.select("#s-gap").text(neg ? `${neg} of ${m.n} single years had SSP1-2.6 warmer` : `SSP5-8.5 warmer in every year of the window`);
    el.dataset.window = `${a}-${b}`; el.dataset.gap = m.gap.toFixed(3);
    el.dataset.low = m.low.toFixed(3); el.dataset.high = m.high.toFixed(3); el.dataset.region = state.region;
    d3.selectAll("button[data-a]").attr("aria-pressed", function () { return +this.dataset.a === a && +this.dataset.b === b; });
    if (moveBrush) brushG.call(brush.move, [x(a), x(b)]);
  }
  function setWindow(a, b) { update(Math.max(2015, a), Math.min(2100, b), true); }
  window.setWindow = setWindow; // used by tests

  d3.selectAll("button[data-a]").on("click", function () { setWindow(+this.dataset.a, +this.dataset.b); });
  d3.selectAll("button[data-region]").on("click", function () {
    state.region = this.dataset.region;
    d3.selectAll("button[data-region]").attr("aria-pressed", function () { return this.dataset.region === state.region; });
    d3.select("#region-note").text(state.region === "glob" ? "Global area-weighted mean (all grid cells)" : "California box land cells (32.5–42°N, 124.5–114°W)");
    rescaleY(); update(state.a, state.b);
  });

  rescaleY();
  setWindow(state.a, state.b);
})();
