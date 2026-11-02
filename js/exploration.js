// Five exploratory graphs — all values read from data/*.csv (CESM2-WACCM r1i1p1f1, California box land cells).
(async function () {
  const { proj, hist } = await loadData();
  graph1(proj, hist);
  graph2(proj);
  graph3(proj, hist);
  graph4(proj);
  graph5(proj);
})();

// ---------- Graph 1: annual trajectories 1950–2100 ----------
function graph1(proj, hist) {
  const el = document.querySelector("#g1");
  const { g, w, h } = makeSvg(el, { height: 380 });
  const x = d3.scaleLinear().domain([1950, 2100]).range([0, w]);
  const all = hist.map(d => d.hist_c).concat(proj.map(d => d.ssp126_c), proj.map(d => d.ssp585_c));
  const y = d3.scaleLinear().domain([Math.floor(d3.min(all)) - 0.5, Math.ceil(d3.max(all)) + 0.5]).range([h, 0]);

  // 1995–2014 baseline band
  g.append("rect").attr("x", x(1995)).attr("width", x(2014) - x(1995)).attr("y", 0).attr("height", h).style("fill", "var(--band)");
  g.append("text").attr("class", "label muted").attr("x", x(2004.5)).attr("y", 12).attr("text-anchor", "middle").text("baseline 1995–2014");
  axes(g, x, y, w, h, { yTitle: "Annual mean near-surface air temperature (°C)" });
  g.append("line").attr("x1", x(2014.5)).attr("x2", x(2014.5)).attr("y1", 0).attr("y2", h)
    .style("stroke", "var(--text-muted)").style("stroke-dasharray", "3 3");
  g.append("text").attr("class", "label muted").attr("x", x(2014.5) + 4).attr("y", h - 6).text("projections →");

  const line = (key) => d3.line().x(d => x(d.year)).y(d => y(d[key]));
  g.append("path").datum(hist).attr("d", line("hist_c")).style("fill", "none").style("stroke", "var(--hist)").style("stroke-width", 1.5);
  g.append("path").datum(proj).attr("d", line("ssp126_c")).style("fill", "none").style("stroke", SC.low.color).style("stroke-width", 2);
  g.append("path").datum(proj).attr("d", line("ssp585_c")).style("fill", "none").style("stroke", SC.high.color).style("stroke-width", 2);

  const last = proj[proj.length - 1];
  g.append("text").attr("class", "label").attr("x", w + 6).attr("y", y(last.ssp585_c)).attr("dy", "0.35em").text("SSP5-8.5");
  g.append("text").attr("class", "label").attr("x", w + 6).attr("y", y(last.ssp126_c)).attr("dy", "0.35em").text("SSP1-2.6");
  g.append("text").attr("class", "label muted").attr("x", x(1952)).attr("y", y(d3.max(hist.slice(0, 15), d => d.hist_c)) - 8).text("Historical run");

  // crosshair + tooltip
  const tt = tooltip(el);
  const rows = new Map(hist.map(d => [d.year, { hist: d.hist_c }]));
  proj.forEach(d => rows.set(d.year, { low: d.ssp126_c, high: d.ssp585_c }));
  const vline = g.append("line").attr("y1", 0).attr("y2", h).style("stroke", "var(--text-muted)").style("opacity", 0);
  g.append("rect").attr("width", w).attr("height", h).style("fill", "transparent")
    .on("pointermove", function (ev) {
      const yr = Math.round(x.invert(d3.pointer(ev, this)[0]));
      const r = rows.get(yr); if (!r) return;
      vline.attr("x1", x(yr)).attr("x2", x(yr)).style("opacity", 1);
      const html = `<b>${yr}</b>` + (r.hist !== undefined
        ? `<div class="tt-row"><span><span class="sw" style="background:var(--hist)"></span>Historical</span><b>${fmt(r.hist)} °C</b></div>`
        : `<div class="tt-row"><span><span class="sw" style="background:var(--high)"></span>SSP5-8.5</span><b>${fmt(r.high)} °C</b></div>
           <div class="tt-row"><span><span class="sw" style="background:var(--low)"></span>SSP1-2.6</span><b>${fmt(r.low)} °C</b></div>`);
      placeTooltip(tt, el, ev, html);
    })
    .on("pointerleave", () => { vline.style("opacity", 0); hideTooltip(tt); });
}

// ---------- Graph 2: annual gap (SSP5-8.5 − SSP1-2.6) ----------
function graph2(proj) {
  const el = document.querySelector("#g2");
  const { g, w, h } = makeSvg(el, { height: 320 });
  const x = d3.scaleBand().domain(proj.map(d => d.year)).range([0, w]).padding(0.15);
  const ext = d3.extent(proj, d => d.gap_c);
  const y = d3.scaleLinear().domain([Math.floor(ext[0]), Math.ceil(ext[1])]).range([h, 0]);
  g.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(6).tickSize(-w).tickFormat(""));
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`)
    .call(d3.axisBottom(x).tickValues(proj.map(d => d.year).filter(yr => yr % 10 === 0)).tickFormat(d3.format("d")));
  g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(6).tickFormat(d => (d > 0 ? "+" : "") + d));
  g.append("text").attr("class", "axis-title").attr("y", -6).text("Gap: SSP5-8.5 minus SSP1-2.6 (°C)");
  g.append("text").attr("class", "axis-title").attr("x", w).attr("y", h + 34).attr("text-anchor", "end").text("Year");

  const tt = tooltip(el);
  g.selectAll("rect.bar").data(proj).join("rect").attr("class", "bar")
    .attr("x", d => x(d.year)).attr("width", x.bandwidth())
    .attr("y", d => y(Math.max(0, d.gap_c))).attr("height", d => Math.abs(y(d.gap_c) - y(0)))
    .attr("rx", 1.5)
    .style("fill", d => d.gap_c >= 0 ? "var(--high)" : "var(--low)")
    .on("pointermove", (ev, d) => placeTooltip(tt, el, ev,
      `<b>${d.year}</b><div>Gap <b>${signed(d.gap_c)} °C</b></div><div class="status">${d.gap_c < 0 ? "SSP1-2.6 year was warmer" : "SSP5-8.5 year was warmer"}</div>`))
    .on("pointerleave", () => hideTooltip(tt));
  g.append("line").attr("x1", 0).attr("x2", w).attr("y1", y(0)).attr("y2", y(0)).style("stroke", "var(--text-secondary)");

  const neg = proj.filter(d => d.gap_c < 0);
  const lastNeg = d3.max(neg, d => d.year);
  g.append("line").attr("x1", x(lastNeg) + x.bandwidth() / 2).attr("x2", x(lastNeg) + x.bandwidth() / 2)
    .attr("y1", y(0) + 4).attr("y2", y(ext[0]) + 16).style("stroke", "var(--text-muted)");
  g.append("text").attr("class", "label").attr("x", x(lastNeg) + 6).attr("y", y(ext[0]) + 14)
    .text(`${lastNeg}: last year SSP1-2.6 is warmer`);
  g.append("text").attr("class", "label muted").attr("x", w + 6).attr("y", y(ext[1])).attr("dy", "0.35em")
    .text(`${neg.length} of ${proj.length} years`);
  g.append("text").attr("class", "label muted").attr("x", w + 6).attr("y", y(ext[1]) + 15).attr("dy", "0.35em")
    .text("have a negative gap");
}

// ---------- Graph 3: distribution of annual temps, common windows ----------
function graph3(proj, hist) {
  const el = document.querySelector("#g3");
  const { g, w, h } = makeSvg(el, { height: 260, margin: { top: 16, right: 40, bottom: 40, left: 210 } });
  const late = proj.filter(d => d.year >= 2081 && d.year <= 2100);
  const base = hist.filter(d => d.year >= 1995 && d.year <= 2014);
  const groups = [
    { name: "Historical 1995–2014", color: "var(--hist)", vals: base.map(d => ({ year: d.year, v: d.hist_c })) },
    { name: "SSP1-2.6, 2081–2100", color: SC.low.color, vals: late.map(d => ({ year: d.year, v: d.ssp126_c })) },
    { name: "SSP5-8.5, 2081–2100", color: SC.high.color, vals: late.map(d => ({ year: d.year, v: d.ssp585_c })) },
  ];
  const allv = groups.flatMap(gr => gr.vals.map(d => d.v));
  const x = d3.scaleLinear().domain([Math.floor(d3.min(allv)) - 0.5, Math.ceil(d3.max(allv)) + 0.5]).range([0, w]);
  const y = d3.scaleBand().domain(groups.map(d => d.name)).range([0, h]).padding(0.3);
  g.append("g").attr("class", "grid").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(10).tickSize(-h).tickFormat(""));
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(10));
  g.append("g").attr("class", "axis").call(d3.axisLeft(y).tickSize(0)).selectAll("text").style("font-size", "12px").style("fill", "var(--text-primary)");
  g.append("text").attr("class", "axis-title").attr("x", w).attr("y", h + 34).attr("text-anchor", "end").text("Annual mean temperature (°C), one dot per year");

  const tt = tooltip(el);
  groups.forEach(gr => {
    // simple vertical jitter by binning to avoid overplot (deterministic)
    const bins = new Map();
    const pts = gr.vals.map(d => {
      const b = Math.round(d.v / 0.25); const k = bins.get(b) || 0; bins.set(b, k + 1);
      return { ...d, off: (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 9 };
    });
    const cy = y(gr.name) + y.bandwidth() / 2;
    const m = d3.mean(gr.vals, d => d.v);
    const [lo, hi] = d3.extent(gr.vals, d => d.v);
    g.append("line").attr("x1", x(lo)).attr("x2", x(hi)).attr("y1", cy).attr("y2", cy).style("stroke", gr.color).style("stroke-opacity", 0.35).style("stroke-width", 2);
    g.selectAll(null).data(pts).join("circle")
      .attr("cx", d => x(d.v)).attr("cy", d => cy + d.off).attr("r", 4.5)
      .style("fill", gr.color).style("stroke", "var(--surface-1)").style("stroke-width", 1.5)
      .on("pointermove", (ev, d) => placeTooltip(tt, el, ev, `<b>${d.year}</b> · ${gr.name.split(",")[0]}<div><b>${fmt(d.v)} °C</b></div>`))
      .on("pointerleave", () => hideTooltip(tt));
    g.append("line").attr("x1", x(m)).attr("x2", x(m)).attr("y1", cy - y.bandwidth() / 2).attr("y2", cy + y.bandwidth() / 2)
      .style("stroke", "var(--text-primary)").style("stroke-width", 2);
    g.append("text").attr("class", "label").attr("x", x(m)).attr("y", cy - y.bandwidth() / 2 - 3).attr("text-anchor", "middle").text(`mean ${fmt1(m)} °C`);
  });
}

// ---------- Graph 4: year-to-year noise vs 11-year smoothed trend ----------
function graph4(proj) {
  const el = document.querySelector("#g4");
  const { g, w, h } = makeSvg(el, { height: 360 });
  const x = d3.scaleLinear().domain([2015, 2100]).range([0, w]);
  const ext = d3.extent(proj.flatMap(d => [d.ssp126_c, d.ssp585_c]));
  const y = d3.scaleLinear().domain([Math.floor(ext[0]) - 0.5, Math.ceil(ext[1]) + 0.5]).range([h, 0]);
  axes(g, x, y, w, h, { yTitle: "Annual mean temperature (°C)" });
  const tt = tooltip(el);
  const sm = {
    low: rolling(proj.map(d => d.ssp126_c)),
    high: rolling(proj.map(d => d.ssp585_c)),
  };
  [["low", "ssp126_c"], ["high", "ssp585_c"]].forEach(([k, col]) => {
    g.selectAll(null).data(proj).join("circle")
      .attr("cx", d => x(d.year)).attr("cy", d => y(d[col])).attr("r", 3.2)
      .style("fill", SC[k].color).style("fill-opacity", 0.35);
    const pts = proj.map((d, i) => ({ year: d.year, v: sm[k][i] })).filter(d => d.v !== null);
    g.append("path").datum(pts).attr("d", d3.line().x(d => x(d.year)).y(d => y(d.v)))
      .style("fill", "none").style("stroke", SC[k].color).style("stroke-width", 2.5);
    const lp = pts[pts.length - 1];
    g.append("text").attr("class", "label").attr("x", x(lp.year) + 6).attr("y", y(lp.v)).attr("dy", "0.35em").text(`${SC[k].short} (11-yr mean)`);
  });
  const resid = (k, col) => d3.deviation(proj.map((d, i) => sm[k][i] === null ? null : d[col] - sm[k][i]).filter(v => v !== null));
  const r1 = resid("low", "ssp126_c"), r5 = resid("high", "ssp585_c");
  g.append("text").attr("class", "label muted").attr("x", 6).attr("y", 14)
    .text(`Year-to-year scatter around the 11-yr mean: SD ${fmt(r1)} °C (SSP1-2.6), ${fmt(r5)} °C (SSP5-8.5)`);

  const vline = g.append("line").attr("y1", 0).attr("y2", h).style("stroke", "var(--text-muted)").style("opacity", 0);
  g.append("rect").attr("width", w).attr("height", h).style("fill", "transparent")
    .on("pointermove", function (ev) {
      const yr = Math.round(x.invert(d3.pointer(ev, this)[0]));
      const i = yr - 2015; if (i < 0 || i >= proj.length) return;
      const d = proj[i];
      vline.attr("x1", x(yr)).attr("x2", x(yr)).style("opacity", 1);
      const s = k => sm[k][i] === null ? "—" : fmt(sm[k][i]) + " °C";
      placeTooltip(tt, el, ev, `<b>${yr}</b>
        <div class="tt-row"><span><span class="sw" style="background:var(--high)"></span>SSP5-8.5 year / 11-yr</span><b>${fmt(d.ssp585_c)} / ${s("high")}</b></div>
        <div class="tt-row"><span><span class="sw" style="background:var(--low)"></span>SSP1-2.6 year / 11-yr</span><b>${fmt(d.ssp126_c)} / ${s("low")}</b></div>`);
    })
    .on("pointerleave", () => { vline.style("opacity", 0); hideTooltip(tt); });
}

// ---------- Graph 5: window-average gap, California box vs global ----------
function graph5(proj) {
  const el = document.querySelector("#g5");
  const { g, w, h } = makeSvg(el, { height: 320, margin: { top: 24, right: 40, bottom: 44, left: 52 } });
  const wins = [["Near term", 2021, 2040], ["Mid-century", 2041, 2060], ["Late 21st c.", 2061, 2080], ["End of century", 2081, 2100]];
  const data = wins.map(([name, a, b]) => ({
    name: `${name}\n${a}–${b}`, label: name, a, b,
    ca: windowMeans(proj, a, b).gap, glob: windowMeans(proj, a, b, "global_").gap,
  }));
  const x0 = d3.scaleBand().domain(data.map(d => d.label)).range([0, w]).padding(0.25);
  const x1 = d3.scaleBand().domain(["ca", "glob"]).range([0, x0.bandwidth()]).padding(0.08);
  const y = d3.scaleLinear().domain([0, Math.ceil(d3.max(data, d => Math.max(d.ca, d.glob)))]).nice().range([h, 0]);
  g.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(5).tickSize(-w).tickFormat(""));
  g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat(d => "+" + d));
  const xa = g.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x0).tickSize(0));
  xa.selectAll("text").each(function (lab) {
    const d = data.find(r => r.label === lab);
    const t = d3.select(this).text(null).style("fill", "var(--text-primary)").style("font-size", "12px");
    t.append("tspan").attr("x", 0).attr("dy", "1.1em").text(lab);
    t.append("tspan").attr("x", 0).attr("dy", "1.2em").style("fill", "var(--text-muted)").text(`${d.a}–${d.b}`);
  });
  g.append("text").attr("class", "axis-title").attr("y", -10).text("Mean gap over the 20-year window, SSP5-8.5 minus SSP1-2.6 (°C)");
  const tt = tooltip(el);
  const color = { ca: "var(--reg-ca)", glob: "var(--reg-glob)" };
  const name = { ca: "California box (land)", glob: "Global mean" };
  const grp = g.selectAll("g.win").data(data).join("g").attr("transform", d => `translate(${x0(d.label)},0)`);
  grp.selectAll("rect").data(d => ["ca", "glob"].map(k => ({ k, v: d[k], d }))).join("rect")
    .attr("x", r => x1(r.k)).attr("width", x1.bandwidth())
    .attr("y", r => y(Math.max(0, r.v))).attr("height", r => Math.abs(y(r.v) - y(0))).attr("rx", 3)
    .style("fill", r => color[r.k])
    .on("pointermove", (ev, r) => placeTooltip(tt, el, ev, `<b>${name[r.k]}</b><div>${r.d.a}–${r.d.b}: gap <b>${signed(r.v)} °C</b></div>`))
    .on("pointerleave", () => hideTooltip(tt));
  grp.selectAll("text.v").data(d => ["ca", "glob"].map(k => ({ k, v: d[k] }))).join("text").attr("class", "label")
    .attr("x", r => x1(r.k) + x1.bandwidth() / 2).attr("y", r => y(Math.max(0, r.v)) - 4).attr("text-anchor", "middle")
    .text(r => signed(r.v));
}
