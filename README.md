# Pump Pulse

Mobile-first field decision support for **Field Shift: Adapting Farms with NASA Data**, built for the virtual Umm Al Quwain NASA Space Apps round. The workspace opens on a labelled Al Ain example field. Visitors can explore the map, recorded bench readings, rotation comparison and guides before creating a Pump Pulse account. The project and its three educational animations are available without an account at `/showcase.html`.

## Run

Install Node.js 24, then run `npm ci`, `npm test` and `npm start`. Open http://localhost:3000. Local development uses SQLite. Production uses persistent PostgreSQL through `DATABASE_URL` or `POSTGRES_URL`.

1. Choose your country and add a field pin, then create an account or sign in to save it. Draw a boundary to estimate field area.
2. Add the current rotation and calibrated limits for soil moisture, ECw, air temperature and irrigation event volume. Save laboratory ECe separately.
3. Pair the Arduino using the instructions in [firmware/README.md](firmware/README.md) or import a CSV of actual readings.
4. Open Satellite map, select an observation layer and date, and use the original source links when coverage is missing. Compare rotations using your irrigation estimates and water budget.

## Source status

| Source | Use |
| --- | --- |
| SMAP | Dated GIBS L2 map, CMR catalogue lookup, and NASA POWER’s public SMAP Level 4 daily Zarr archive. The workspace labels delayed archive values and suppresses current drying alerts when the latest numeric sample is older than seven days. |
| ECOSTRESS | CMR catalogue for thermal and ET scenes. The LST overlay samples dated, original 70 m COG pixels, filtering by QC, cloud and water. It requires `EARTHDATA_TOKEN` on the server and a usable overpass. ET is currently scene discovery only. |
| NASA POWER | API request for historical temperature, humidity, precipitation and radiation. |
| HLS/Landsat and Sentinel-2, MODIS and VIIRS | Dated GIBS layers with CMR scene discovery. The views present spatial context, with no crop damage classifier. |
| GPM IMERG, SRTM, GRACE/GRACE-FO, GLDAS and GEDI | CMR discovery by field location. These are catalogue results, not variables in the recommendation engine. |
| USDA datasets, OpenET, FAO GAEZ, ERA5 and other named challenge resources | Linked references with regional coverage noted where applicable. |
| Open-Meteo | Separate five-day forecast with reference evapotranspiration and a farmer-set temperature alert. A complete, fresh forecast gives an ET₀ total, which can be converted to a reference volume when a boundary is available. If the server feed is unavailable or stale, the browser can request the forecast directly from Open-Meteo with the field coordinates. |
| Esri imagery, OpenStreetMap, Google Earth | Geographic context, with separate attribution and a Google Earth link. |

SMAP describes regional conditions. The app's provisional drying watch compares the mean of the latest seven returned samples with the preceding fourteen and flags a decline of at least 0.03 m³/m³, with at least four valid values in each window. This is a screening rule for field checks. The weather panel labels model forecasts separately. Site alerts rely on fresh Arduino readings and farmer-entered limits. None of these rules actuates irrigation.

The planner uses UAE Ministry planting windows. Water estimates are entered by the farmer. Crop tolerance, actual planting timing and equipment suitability still require farm review. The app does not estimate yields. The source bundle has no user-trained model, sensor dataset, account data or credentials.

## GitHub and Vercel

1. Push this source to a GitHub repository owned by the team or one of its members. For Vercel Hobby, use a personal GitHub namespace. Use `main` as the production branch.
2. In [Vercel](https://vercel.com/new), import the GitHub repository. Keep the repository root as the project root. The committed `vercel.json` runs the test suite before building and serves the demo, hardware guide, map assets and videos separately from the API.
3. Attach a persistent PostgreSQL database through the Vercel Marketplace or connect your own. Set the pooled connection string as `DATABASE_URL` or `POSTGRES_URL` in Production. Set a separate database for Preview if testing account features there. The API returns 503 while the database is unconfigured and the public demo stays available.
4. Set a randomly generated `CRON_SECRET` in Production to authorize the daily SMAP refresh. Set `EARTHDATA_TOKEN` if you want to enable authenticated ECOSTRESS LST sampling. Use Vercel environment variables for these values.
5. Deploy and open the production `.vercel.app` domain in a signed-out browser. Confirm the demo loads, create a Pump Pulse account, save a field, then post one real sensor packet and confirm it appears. Point the USB bridge at the new domain and pair a device there. Vercel builds and deploys pushed `main` commits automatically and creates previews for other branches.

The first PostgreSQL deployment starts with an empty database. Accounts, fields, and sensor readings created on another host require a separate data migration. The source ZIP contains source files and recorded or synthetic test assets only.

The Vercel job checks saved field locations daily at 02:00 UTC, subject to the function time budget. A numeric SMAP result is reused for up to 48 hours, and upstream acquisition and delivery can lag. The catalogue and map show coverage separately from measurements.

For Heroku, the included `Procfile` starts the Node server. Set the same database variable and use `node refresh.mjs` with Heroku Scheduler if scheduled refresh is needed.

## Judging

The most direct fits are **Art & Technology**, **Best Use of Data**, **Local Impact** and **Best Use of Storytelling**, based on the published NASA global categories. The local event's own award and pitch rules take precedence. Build the recorded walkthrough around a real sensor packet, one dated satellite observation, and three crop rotations. Check the project page from a signed-out browser before submitting it. The project and educational animations were developed with ChatGPT assistance. The videos carry a visible disclosure and do not depict farm measurements.

- [Field Shift](https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/)
- [Umm Al Quwain local event](https://nasaspaceapps.ae/umm-al-quwain)
- [NASA award descriptions](https://www.spaceappschallenge.org/2025/awards/)
- [ECOSTRESS V003](https://doi.org/10.5067/ECOSTRESS/ECO_L2T_LSTE.003)
- [NASA POWER and SMAP](https://power.larc.nasa.gov/docs/methodology/data/sources_hydrology/)
- [NASA GIBS](https://nasa-gibs.github.io/gibs-api-docs/access-basics/)
- [UAE planting calendar](https://www.moccae.gov.ae/Content/Images/School/agriculture_calender_page_en.pdf)

## Team probe calibration

See [calibration/README.md](calibration/README.md) for the supplied ADC measurements, the relative wetness index, a USB serial bridge, and the soil-specific regression trainer. Training requires independently measured soil volumetric water content.
