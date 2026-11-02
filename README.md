# Two Futures, One Planet: How Our Emissions Choices Shape 2100

DSC 106 Project 3: interactive visualization of CMIP6 temperature projections, built with D3.js v7 only.

**Question:** How does the projected temperature gap between a low-emissions (SSP1-2.6) and a high-emissions (SSP5-8.5) future change over the century?

## Files

| Path | What it is |
|---|---|
| `index.html` + `js/prototype.js` | Interactive prototype: choose a time window (brush or presets), compare both scenario means and their gap, California box or global |
| `exploration.html` + `js/exploration.js` | The five exploratory graphs used for the checkpoint |
| `js/common.js`, `css/style.css` | Shared helpers and styles |
| `lib/d3.v7.min.js` | D3 v7.9.0 (vendored, so the site works offline and on GitHub Pages) |
| `data/tas_scenarios_annual.csv` | 2015–2100, one row per year: California-box and global annual means (°C) for both scenarios, the gap, and anomalies vs 1995–2014 |
| `data/tas_historical_annual.csv` | 1950–2014 historical run (same model) |
| `data/metadata.json` | Model, member, grid, region, method, baselines, source zarr stores |
| `notebooks/project3_cmip6_exploration.ipynb` | Colab notebook that finds matching runs, checks units, coverage and grid, extracts the data and exports the CSVs |
| `checkpoint/voiceover.md` | Timestamped checkpoint voiceover script |

## Data and method

* CMIP6 on Google Cloud (Pangeo catalog), following the course example notebook.
* Model **CESM2-WACCM**, member **r1i1p1f1**, grid **gn** (0.94° × 1.25°). The same member and grid are used for the historical, SSP1-2.6 and SSP5-8.5 runs.
* Variable `tas` (monthly, table `Amon`), converted K → °C. Calendar-year means are weighted by days in month.
* Region: **California bounding box 32.5–42°N, 124.5–114°W**, land cells only (land fraction ≥ 50 %, 64 of 88 cells), weighted by cos(latitude). The box also covers most of Nevada and slivers of OR/AZ/Baja.
* Global: cos(latitude)-weighted mean over all cells. Baseline: the same model's historical 1995–2014 mean.
* Limitation: one run of one model, so the results show this model's projection plus its internal variability, not a multi-model range.

## Preview locally

The pages load CSVs with `fetch`, so open them through a local web server, not by double-clicking the file:

```bash
cd <this repo>
python3 -m http.server 8000
# open http://localhost:8000/index.html        (prototype)
# open http://localhost:8000/exploration.html  (five graphs)
```

## Deploy

GitHub repo → Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)`. The site will be at `https://<user>.github.io/<repo>/`.
