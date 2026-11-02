// Shared helpers for the exploratory graphs and the prototype (D3 v7 only).
const SC = {
  low:  { key: "ssp126", label: "SSP1-2.6 (low emissions)",  short: "SSP1-2.6", color: "var(--low)" },
  high: { key: "ssp585", label: "SSP5-8.5 (high emissions)", short: "SSP5-8.5", color: "var(--high)" },
};
const WINDOWS = {
  near: [2021, 2040],
  mid:  [2041, 2060],
  late: [2081, 2100],
};
const fmt = d3.format(".2f");
const fmt1 = d3.format(".1f");
const signed = d3.format("+.2f");

async function loadData() {
  const [proj, hist, meta] = await Promise.all([
    d3.csv("data/tas_scenarios_annual.csv", d3.autoType),
    d3.csv("data/tas_historical_annual.csv", d3.autoType),
    d3.json("data/metadata.json"),
  ]);
  return { proj, hist, meta };
}

// Responsive SVG with a fixed internal coordinate system.
function makeSvg(sel, { width = 960, height = 380, margin = { top: 16, right: 120, bottom: 40, left: 52 } } = {}) {
  const svg = d3.select(sel).append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img");
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  return { svg, g, w: width - margin.left - margin.right, h: height - margin.top - margin.bottom, margin };
}

function axes(g, x, y, w, h, { xTitle = "Year", yTitle = "", xFormat = d3.format("d"), xTicks = 10, yTicks = 6 } = {}) {
  g.append("g").attr("class", "grid").call(d3.axisLeft(y).ticks(yTicks).tickSize(-w).tickFormat(""));
  g.append("g").attr("class", "axis").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(xTicks).tickFormat(xFormat));
  g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(yTicks));
  if (xTitle) g.append("text").attr("class", "axis-title").attr("x", w).attr("y", h + 34).attr("text-anchor", "end").text(xTitle);
  if (yTitle) g.append("text").attr("class", "axis-title").attr("x", 0).attr("y", -6).attr("text-anchor", "start").text(yTitle);
}

function tooltip(container) {
  return d3.select(container).append("div").attr("class", "tooltip");
}
function placeTooltip(tt, container, event, html) {
  const [mx, my] = d3.pointer(event, container);
  const box = container.getBoundingClientRect();
  tt.html(html).style("opacity", 1);
  const tw = tt.node().offsetWidth;
  const left = mx + 14 + tw > box.width ? mx - tw - 14 : mx + 14;
  tt.style("left", `${left}px`).style("top", `${Math.max(0, my - 10)}px`);
}
function hideTooltip(tt) { tt.style("opacity", 0).style("left", "0px").style("top", "0px"); }

function rolling(values, k = 11) {
  const half = Math.floor(k / 2);
  return values.map((_, i) => (i < half || i >= values.length - half) ? null
    : d3.mean(values.slice(i - half, i + half + 1)));
}

function windowMeans(proj, a, b, prefix = "") {
  const rows = proj.filter(d => d.year >= a && d.year <= b);
  return {
    n: rows.length,
    low: d3.mean(rows, d => d[`${prefix}ssp126_c`]),
    high: d3.mean(rows, d => d[`${prefix}ssp585_c`]),
    gap: d3.mean(rows, d => d[`${prefix}gap_c`]),
    rows,
  };
}

function tableView(container, columns, rows) {
  const det = d3.select(container).append("details").attr("class", "table-view");
  det.append("summary").text("Show data table");
  const t = det.append("table");
  t.append("tr").selectAll("th").data(columns).join("th").text(c => c.label);
  t.selectAll("tr.r").data(rows).join("tr").attr("class", "r")
    .selectAll("td").data(r => columns.map(c => c.fmt ? c.fmt(r[c.key]) : r[c.key])).join("td").text(v => v);
}
