# Implementation Plan — Selectable Historical Data Reports

This plan outlines the implementation of date-suffixed reports (e.g. `data_2026-05-24.json`) and a dropdown date selector in the React dashboard, enabling users to view and query historical stock screening reports.

---

## User Review Required

> [!NOTE]
> - **Manifest File**: To enable client-side selection of dates without directory-listing server support, we will maintain an auto-generated `manifest.json` inside the output directory. This manifest tracks all available report dates and is updated automatically by the Python fetch script.

---

## Proposed Changes

### Backend Ingestion

#### [MODIFY] [scripts/fetch_data.py](file:///c:/Users/ziyen/new_ipo/scripts/fetch_data.py)
Update output generation to write files with date suffixes and manage `manifest.json`:
- Determine the current Date in `YYYY-MM-DD` (UTC).
- Output stock screening records to `frontend/public/output/data_YYYY-MM-DD.json`.
- Output upcoming IPO calendars to `frontend/public/output/upcoming_ipos_YYYY-MM-DD.json`.
- Maintain `frontend/public/output/manifest.json`:
  - Load existing manifest if it exists.
  - Append the new date (if not already present).
  - Sort dates descending (newest first).
  - Update `latestDate` and write back to disk.

---

### React Frontend

#### [MODIFY] [frontend/src/hooks/useScreenerData.js](file:///c:/Users/ziyen/new_ipo/frontend/src/hooks/useScreenerData.js)
Refactor custom hook to support selectable dates:
- Fetch `manifest.json` on mount to populate `availableDates` state.
- Keep track of `selectedDate` (defaulting to the latest date from the manifest).
- Fetch `data_YYYY-MM-DD.json` and `upcoming_ipos_YYYY-MM-DD.json` whenever the user changes the `selectedDate`.

#### [MODIFY] [frontend/src/App.jsx](file:///c:/Users/ziyen/new_ipo/frontend/src/App.jsx)
Integrate the date selector dropdown in the header:
- Expose `availableDates`, `selectedDate`, and `setSelectedDate` from the `useScreenerData` hook.
- Add a stylized `<select>` dropdown next to the `RefreshBadge` inside the header.
- Apply a premium dark-themed select style (`h-9 px-3 bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-lg text-xs cursor-pointer font-mono`).

---

### CI/CD Pipeline

#### [MODIFY] [github/workflows/fetch.yml](file:///c:/Users/ziyen/new_ipo/.github/workflows/fetch.yml)
Update Git staging path in the automated workflow:
- Stage `frontend/public/output/` directory instead of specific filenames to ensure that all daily report files and the manifest update are correctly pushed to the repository branch.

---

## Verification Plan

### Automated Tests
1. **Fetcher Execution & Outputs**: Run `python scripts/fetch_data.py` locally and verify:
   - Output folder `frontend/public/output/` is created.
   - Files `data_YYYY-MM-DD.json` and `upcoming_ipos_YYYY-MM-DD.json` are present.
   - `manifest.json` contains today's date in `availableDates` and as `latestDate`.
2. **Build Verification**: Run `npm run build` inside `frontend/` and confirm build compiles successfully and copies the `output/` folder from `public/` into the `dist/` directory.

### Manual Verification
1. **Dropdown Date Selection**: Open the app locally, mock a second date file in the manifest, and verify that selecting different dates in the dropdown immediately updates the dashboard data, metrics cards, table rows, and upcoming IPO calendar.
