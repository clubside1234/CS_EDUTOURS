import { CSV_TEMPLATE_HEADERS, STATUSES, CATEGORIES } from '../data/constants';
import { parseFlexibleDate, parseNumber, uid, today } from './helpers';

/** RFC 4180-ish CSV parser supporting quoted fields, escaped quotes and CRLF. */
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^﻿/, '');

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''));
}

function escapeCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(rows) {
  return rows.map((r) => r.map(escapeCell).join(',')).join('\r\n');
}

export function downloadFile(filename, content, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['﻿', content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadTemplate() {
  const sample = [
    CSV_TEMPLATE_HEADERS,
    [
      '13/10/2026',
      'Kolkata',
      'West Bengal',
      'Sample Public School',
      'A',
      '5,000 - 10,000',
      'Dr. Sample Name',
      '9830000000 / principal@sampleschool.edu.in',
      'ISRO',
      '1200',
      '25000',
      'After Pooja',
      'New Lead',
      'Met the principal, interested in a science tour',
    ],
  ];
  downloadFile('edutours_lead_template.csv', toCSV(sample));
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** Maps normalized header → lead field. Accepts the template headers and common variations. */
const HEADER_MAP = {
  date: 'date',
  dateofvisit: 'date',
  place: 'place',
  city: 'place',
  location: 'place',
  state: 'state',
  schoolname: 'schoolName',
  school: 'schoolName',
  nameoftheschool: 'schoolName',
  categoryofschools: 'category',
  categoryofschool: 'category',
  category: 'category',
  fees: 'fees',
  fee: 'fees',
  feebracket: 'fees',
  nameoftheprincipal: 'principalName',
  principalname: 'principalName',
  principal: 'principalName',
  contactdetails: 'contactDetails',
  contact: 'contactDetails',
  phone: 'contactDetails',
  preferredlocationfortravel: 'preferredLocation',
  preferredlocation: 'preferredLocation',
  destination: 'preferredLocation',
  totalstudentsstrength: 'totalStrength',
  totalstudentstrength: 'totalStrength',
  totalstrength: 'totalStrength',
  expectedstudents: 'expectedStudents',
  totalstudentsexpected: 'expectedStudents',
  budget: 'budgetPerStudent',
  budgetperstudent: 'budgetPerStudent',
  preferredtimefortravel: 'preferredTravelTime',
  preferredtraveltime: 'preferredTravelTime',
  traveltime: 'preferredTravelTime',
  followupstatus: 'followUpStatus',
  status: 'followUpStatus',
  remarks: 'remarks',
  remark: 'remarks',
  notes: 'remarks',
  lastactiontaken: 'lastActionTaken',
};

function matchStatus(value) {
  const v = norm(value);
  if (!v) return 'New Lead';
  const exact = STATUSES.find((s) => norm(s) === v);
  if (exact) return exact;
  if (v.includes('won') || v.includes('confirm')) return 'Closed - Won';
  if (v.includes('lost') || v.includes('notinterest')) return 'Lost / Not Interested';
  if (v.includes('proposal') || v.includes('itinerary') || v.includes('quotation')) return 'Proposal / Itinerary Sent';
  if (v.includes('meeting')) return 'Meeting Scheduled';
  if (v.includes('nodecision')) return 'No decision yet stage';
  if (v.includes('follow')) return 'Follow up in process';
  return 'New Lead';
}

function matchCategory(value) {
  const v = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  return CATEGORIES.includes(v) ? v : v || '';
}

/**
 * Converts a 2-D array (header row + data rows) into lead preview objects.
 * Each preview row carries `_errors` and `_warnings` for display before import.
 */
export function rowsToLeads(rows) {
  if (!rows.length) return { leads: [], unmappedHeaders: [] };
  const [header, ...data] = rows;
  const mapping = header.map((h) => HEADER_MAP[norm(h)] || null);
  const unmappedHeaders = header.filter((h, i) => String(h).trim() && !mapping[i]);

  const leads = data.map((cells) => {
    const raw = {};
    mapping.forEach((field, i) => {
      if (field) raw[field] = cells[i] !== undefined ? String(cells[i]).trim() : '';
    });
    const totalStrength = parseNumber(raw.totalStrength);
    const lead = {
      id: uid(),
      date: parseFlexibleDate(raw.date) || today(),
      schoolName: raw.schoolName || '',
      category: matchCategory(raw.category),
      state: raw.state || '',
      place: raw.place || '',
      principalName: raw.principalName || '',
      contactDetails: raw.contactDetails || '',
      totalStrength,
      expectedStudents: parseNumber(raw.expectedStudents),
      fees: raw.fees || '',
      budgetPerStudent: parseNumber(raw.budgetPerStudent),
      preferredLocation: raw.preferredLocation || 'Yet to decide',
      preferredTravelTime: raw.preferredTravelTime || 'Yet to decide',
      followUpStatus: matchStatus(raw.followUpStatus),
      lastActionTaken: raw.lastActionTaken || 'Imported via bulk upload',
      nextFollowUpDate: '',
      followUpHistory: [],
      remarks: raw.remarks || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const _errors = [];
    const _warnings = [];
    if (!lead.schoolName) _errors.push('School Name is required');
    if (!raw.date) _warnings.push('Date missing – defaulted to today');
    if (!lead.contactDetails) _warnings.push('No contact details');
    if (!lead.expectedStudents) _warnings.push('Expected students not provided');
    if (raw.date && !parseFlexibleDate(raw.date)) _warnings.push(`Unrecognised date "${raw.date}"`);
    return { ...lead, _errors, _warnings };
  });

  return { leads, unmappedHeaders };
}

export const EXPORT_COLUMNS = [
  ['Date', 'date'],
  ['Place', 'place'],
  ['State', 'state'],
  ['School Name', 'schoolName'],
  ["Category Of School's", 'category'],
  ['Fees', 'fees'],
  ['Name of the Principal', 'principalName'],
  ['Contact Details', 'contactDetails'],
  ['Preferred Location for Travel', 'preferredLocation'],
  ['Total Students Strength', 'totalStrength'],
  ['Expected Students', 'expectedStudents'],
  ['Budget', 'budgetPerStudent'],
  ['Preferred time for Travel', 'preferredTravelTime'],
  ['Follow Up Status', 'followUpStatus'],
  ['Last Action Taken', 'lastActionTaken'],
  ['Next Follow-up Date', 'nextFollowUpDate'],
  ['Interactions Logged', (l) => (l.followUpHistory || []).length],
  ['Remarks', 'remarks'],
];

export function leadsToCSV(leads) {
  const header = EXPORT_COLUMNS.map(([h]) => h);
  const body = leads.map((l) => EXPORT_COLUMNS.map(([, key]) => (typeof key === 'function' ? key(l) : l[key] ?? '')));
  return toCSV([header, ...body]);
}

/** Reads a File (CSV or Excel) into a 2-D array of strings. */
export async function readSpreadsheetFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd', defval: '' });
    return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
  }
  const text = await file.text();
  return parseCSV(text);
}
