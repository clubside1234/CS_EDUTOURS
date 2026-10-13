# EduTours CRM

A single-page CRM for an Educational Tours company's institutional (school) sales team.
Built with **React 18 + Vite**, **Tailwind CSS**, **lucide-react** icons, and **localStorage** persistence.
Ships with 18 realistic mock leads so it runs immediately.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Features

| Area | What you get |
| --- | --- |
| **Dashboard** | KPI cards (Total Leads, Follow-ups Due, Conversion Rate, Projected Students), pipeline-by-stage bars, pipeline value, category mix, top destinations, leads by state, upcoming follow-ups, recent activity |
| **Leads Table** | Sortable, paginated table with inline status changer, tel/mail links, edit/delete/log actions |
| **Pipeline Board** | Kanban grouped by Follow-Up Status with HTML5 drag-and-drop **and** a per-card quick stage selector (works on touch devices) |
| **Follow-Up Queue** | Open leads bucketed into Overdue / Due Today / Next 7 Days / Later / Unscheduled, with call, email and log shortcuts |
| **Search & filters** | Live search (school, principal, city, state, contact) + filters for status, category, travel window and state; applies to every view, KPI cards and export |
| **Add / Edit lead** | Validated form (required fields, phone/email format, expected ≤ total strength, duplicate-school warning) |
| **Bulk upload** | CSV, `.xlsx` and `.xls`; downloadable template; header auto-mapping; row-level preview with errors, warnings and duplicate detection; choose rows before importing |
| **Lead drawer** | Overview · Log follow-up (date quick-picks, channel, notes, status update, next follow-up) · Email · History timeline |
| **Email automation** | 3 templates (Introductory Itinerary, Post-Meeting, Quotation Reminder) with `{{School Name}}`, `{{Principal Name}}`, `{{Destination}}` placeholders, live preview, copy, and a `mailto:` button that opens the default mail client **and** logs a "Follow-up Email Sent" entry |
| **Export** | "Export to CSV" downloads the currently filtered leads (Excel-friendly UTF-8 BOM) |
| **Persistence** | Every change auto-saves to `localStorage` (`edutours-crm:leads:v1`); "Reset demo data" in the sidebar |
| **UX** | Responsive (mobile sidebar drawer, stacked cards), color-coded category & status badges, toast notifications for add/edit/status/import/export/delete |

## CSV template headers

```
Date, Place, State, School Name, Category Of School's, Fees, Name of the Principal,
Contact Details, Preferred Location for Travel, Total Students Strength, Budget,
Preferred time for Travel, Follow Up Status, Remarks
```

Dates accept `DD/MM/YYYY`, `YYYY-MM-DD`, `13 Oct 2026` or Excel serials. Free-text statuses
("follow up", "won", "quotation sent"…) are mapped to the nearest pipeline stage.
An optional `Expected Students` column is also recognised.

## Data model

Each lead: `id, date, schoolName, category, state, place, principalName, contactDetails,
totalStrength, expectedStudents, fees, budgetPerStudent, preferredLocation, preferredTravelTime,
followUpStatus, lastActionTaken, nextFollowUpDate, followUpHistory[{ id, date, notes, channel, emailSent }], remarks`.

`nextFollowUpDate` is an addition to the master-sheet schema; it drives "Follow-ups Due" and the queue.

## Project structure

```
src/
  App.jsx                 layout, routing between views, all actions
  hooks.js                useLeads (state + localStorage), useEscape, …
  data/                   constants, mock data, email templates
  utils/                  csv parse/export, date helpers, KPI metrics
  components/             Sidebar, KPICards, FilterBar, Dashboard, LeadsTable,
                          PipelineBoard, FollowUpQueue, LeadFormModal,
                          BulkUploadModal, LeadDrawer, Toast, ui primitives
```
