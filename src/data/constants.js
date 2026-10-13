export const STATUSES = [
  'New Lead',
  'Follow up in process',
  'Meeting Scheduled',
  'Proposal / Itinerary Sent',
  'Closed - Won',
  'No decision yet stage',
  'Lost / Not Interested',
];

export const CLOSED_STATUSES = ['Closed - Won', 'Lost / Not Interested'];

export const STATUS_STYLES = {
  'New Lead': { badge: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500', column: 'border-t-sky-500' },
  'Follow up in process': { badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500', column: 'border-t-amber-500' },
  'Meeting Scheduled': { badge: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500', column: 'border-t-violet-500' },
  'Proposal / Itinerary Sent': { badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200', dot: 'bg-indigo-500', column: 'border-t-indigo-500' },
  'Closed - Won': { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500', column: 'border-t-emerald-500' },
  'No decision yet stage': { badge: 'bg-slate-100 text-slate-700 ring-slate-300', dot: 'bg-slate-400', column: 'border-t-slate-400' },
  'Lost / Not Interested': { badge: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500', column: 'border-t-rose-500' },
};

export const CATEGORIES = ['A+', 'A', 'B+', 'B', 'C+', 'C'];

export const CATEGORY_STYLES = {
  'A+': 'bg-emerald-600 text-white',
  A: 'bg-emerald-100 text-emerald-800',
  'B+': 'bg-blue-100 text-blue-800',
  B: 'bg-sky-100 text-sky-800',
  'C+': 'bg-amber-100 text-amber-800',
  C: 'bg-orange-100 text-orange-800',
};

export const STATES = [
  'West Bengal',
  'Odisha',
  'Bihar',
  'Jharkhand',
  'Assam',
  'Uttar Pradesh',
  'Delhi',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Telangana',
  'Gujarat',
  'Rajasthan',
  'Madhya Pradesh',
  'Chhattisgarh',
  'Sikkim',
  'Meghalaya',
  'Tripura',
  'Other',
];

export const DESTINATIONS = [
  'ISRO',
  'NASA',
  'Golden Triangle',
  'Science City',
  'Singapore',
  'Dubai',
  'Sikkim & Darjeeling',
  'Kerala',
  'Rajasthan Heritage',
  'Yet to decide',
];

export const TRAVEL_WINDOWS = [
  'After Pooja',
  'Winter Break',
  'Summer Vacation',
  'October 2026',
  'November 2026',
  'December 2026',
  'January 2027',
  'February 2027',
  'Yet to decide',
];

export const FEE_BRACKETS = ['Below 2,000', '2,000 - 5,000', '5,000 - 10,000', '10,000 - 20,000', 'Above 20,000'];

export const CHANNELS = ['Call', 'Meeting', 'Email'];

export const CSV_TEMPLATE_HEADERS = [
  'Date',
  'Place',
  'State',
  'School Name',
  "Category Of School's",
  'Fees',
  'Name of the Principal',
  'Contact Details',
  'Preferred Location for Travel',
  'Total Students Strength',
  'Budget',
  'Preferred time for Travel',
  'Follow Up Status',
  'Remarks',
];

export const STORAGE_KEY = 'edutours-crm:leads:v1';
