import { useEffect, useState } from 'react';
import { School, UserRound, Plane, ClipboardList } from 'lucide-react';
import { CATEGORIES, DESTINATIONS, FEE_BRACKETS, STATES, STATUSES, TRAVEL_WINDOWS } from '../data/constants';
import { Field, Modal } from './ui';
import { addDays, classNames, isValidContact, today } from '../utils/helpers';

const blank = () => ({
  date: today(),
  schoolName: '',
  category: 'A',
  state: 'West Bengal',
  place: '',
  principalName: '',
  contactDetails: '',
  totalStrength: '',
  expectedStudents: '',
  fees: '',
  budgetPerStudent: '',
  preferredLocation: 'Yet to decide',
  preferredTravelTime: 'Yet to decide',
  followUpStatus: 'New Lead',
  lastActionTaken: '',
  nextFollowUpDate: addDays(today(), 2),
  remarks: '',
});

export function validateLead(f) {
  const e = {};
  if (!f.schoolName.trim()) e.schoolName = 'School name is required';
  else if (f.schoolName.trim().length < 3) e.schoolName = 'Enter the full school name';
  if (!f.date) e.date = 'Date is required';
  if (!f.state.trim()) e.state = 'State is required';
  if (!f.place.trim()) e.place = 'City / location is required';
  if (!f.principalName.trim()) e.principalName = 'Principal / Director name is required';
  if (!f.contactDetails.trim()) e.contactDetails = 'Phone or email is required';
  else if (!isValidContact(f.contactDetails)) e.contactDetails = 'Enter a valid 10-digit phone number or email address';
  const ts = Number(f.totalStrength);
  const es = Number(f.expectedStudents);
  if (f.totalStrength !== '' && (!Number.isFinite(ts) || ts < 0)) e.totalStrength = 'Must be a positive number';
  if (f.expectedStudents !== '' && (!Number.isFinite(es) || es < 0)) e.expectedStudents = 'Must be a positive number';
  if (!e.totalStrength && !e.expectedStudents && ts > 0 && es > ts) e.expectedStudents = 'Cannot exceed total strength';
  if (f.budgetPerStudent !== '' && (!Number.isFinite(Number(f.budgetPerStudent)) || Number(f.budgetPerStudent) < 0))
    e.budgetPerStudent = 'Must be a positive amount';
  if (!f.preferredLocation.trim()) e.preferredLocation = 'Choose a destination or "Yet to decide"';
  return e;
}

function Section({ icon, title, children }) {
  return (
    <fieldset className="rounded-xl border border-slate-200 p-4">
      <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-700">
        {icon} {title}
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function LeadFormModal({ open, lead, onClose, onSave, existingLeads }) {
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const isEdit = Boolean(lead);

  useEffect(() => {
    if (!open) return;
    setForm(
      lead
        ? {
            ...blank(),
            ...lead,
            totalStrength: lead.totalStrength ?? '',
            expectedStudents: lead.expectedStudents ?? '',
            budgetPerStudent: lead.budgetPerStudent ?? '',
            nextFollowUpDate: lead.nextFollowUpDate || '',
          }
        : blank(),
    );
    setErrors({});
    setTouched(false);
  }, [open, lead]);

  const set = (k) => (e) => {
    const next = { ...form, [k]: e.target.value };
    setForm(next);
    if (touched) setErrors(validateLead(next));
  };

  const duplicate =
    !isEdit &&
    form.schoolName.trim().length > 3 &&
    existingLeads.find(
      (l) => l.schoolName.trim().toLowerCase() === form.schoolName.trim().toLowerCase() && (!form.place || l.place.toLowerCase() === form.place.trim().toLowerCase()),
    );

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    const errs = validateLead(form);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = document.querySelector(`[name="${Object.keys(errs)[0]}"]`);
      first?.focus();
      return;
    }
    onSave({
      ...form,
      schoolName: form.schoolName.trim(),
      place: form.place.trim(),
      principalName: form.principalName.trim(),
      contactDetails: form.contactDetails.trim(),
      totalStrength: Number(form.totalStrength) || 0,
      expectedStudents: Number(form.expectedStudents) || 0,
      budgetPerStudent: Number(form.budgetPerStudent) || 0,
      lastActionTaken: form.lastActionTaken.trim() || (isEdit ? lead.lastActionTaken : 'Lead created'),
    });
  };

  const inp = (k, props = {}) => (
    <input name={k} value={form[k]} onChange={set(k)} className={classNames('input', errors[k] && 'input-error')} {...props} />
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      icon={<School className="h-5 w-5" />}
      title={isEdit ? 'Edit School Lead' : 'Add New School Lead'}
      subtitle={isEdit ? lead.schoolName : 'Capture school, contact and tour preferences'}
      footer={
        <>
          {touched && Object.keys(errors).length > 0 && (
            <p className="mr-auto self-center text-xs text-rose-600">Please fix {Object.keys(errors).length} field(s) highlighted above.</p>
          )}
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="lead-form" className="btn-primary">
            {isEdit ? 'Save Changes' : 'Add Lead'}
          </button>
        </>
      }
    >
      <form id="lead-form" onSubmit={submit} noValidate className="space-y-4">
        <Section icon={<School className="h-4 w-4 text-brand-600" />} title="School Details">
          <Field label="School / Institution Name" required error={errors.schoolName} className="sm:col-span-2">
            {inp('schoolName', { placeholder: 'e.g. Delhi Public School, Ruby Park', autoFocus: true })}
            {duplicate && (
              <p className="mt-1 text-xs text-amber-600">
                Heads up: “{duplicate.schoolName}” ({duplicate.place}) already exists with status “{duplicate.followUpStatus}”.
              </p>
            )}
          </Field>
          <Field label="Date of Visit / Entry" required error={errors.date}>
            {inp('date', { type: 'date' })}
          </Field>
          <Field label="Category of School">
            <select name="category" value={form.category} onChange={set('category')} className="input">
              <option value="">Not set</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="State" required error={errors.state}>
            {inp('state', { list: 'states-list', placeholder: 'State' })}
            <datalist id="states-list">
              {STATES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="City / Place" required error={errors.place}>
            {inp('place', { placeholder: 'e.g. Kolkata' })}
          </Field>
          <Field label="Total Student Strength" error={errors.totalStrength}>
            {inp('totalStrength', { type: 'number', min: 0, inputMode: 'numeric', placeholder: 'e.g. 1500' })}
          </Field>
          <Field label="School Fee Bracket (₹/month)">
            {inp('fees', { list: 'fees-list', placeholder: 'e.g. 5,000 - 10,000' })}
            <datalist id="fees-list">
              {FEE_BRACKETS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
        </Section>

        <Section icon={<UserRound className="h-4 w-4 text-brand-600" />} title="Contact Information">
          <Field label="Principal / Director" required error={errors.principalName}>
            {inp('principalName', { placeholder: 'e.g. Mrs. Anjali Sen' })}
          </Field>
          <Field label="Phone / Email" required error={errors.contactDetails} hint="Separate multiple with “/”">
            {inp('contactDetails', { placeholder: '9830012345 / principal@school.edu.in' })}
          </Field>
        </Section>

        <Section icon={<Plane className="h-4 w-4 text-brand-600" />} title="Tour Preferences">
          <Field label="Preferred Destination" required error={errors.preferredLocation}>
            {inp('preferredLocation', { list: 'dest-list' })}
            <datalist id="dest-list">
              {DESTINATIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="Preferred Travel Window">
            {inp('preferredTravelTime', { list: 'travel-list' })}
            <datalist id="travel-list">
              {TRAVEL_WINDOWS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
          <Field label="Expected Students for Tour" error={errors.expectedStudents}>
            {inp('expectedStudents', { type: 'number', min: 0, inputMode: 'numeric', placeholder: 'e.g. 120' })}
          </Field>
          <Field label="Budget per Student (₹)" error={errors.budgetPerStudent}>
            {inp('budgetPerStudent', { type: 'number', min: 0, step: 500, inputMode: 'numeric', placeholder: 'e.g. 25000' })}
          </Field>
        </Section>

        <Section icon={<ClipboardList className="h-4 w-4 text-brand-600" />} title="Pipeline & Notes">
          <Field label="Follow-Up Status">
            <select name="followUpStatus" value={form.followUpStatus} onChange={set('followUpStatus')} className="input">
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Next Follow-up Date">{inp('nextFollowUpDate', { type: 'date' })}</Field>
          <Field label="Last Action Taken" className="sm:col-span-2">
            {inp('lastActionTaken', { placeholder: 'e.g. Visited school, met principal' })}
          </Field>
          <Field label="Remarks" className="sm:col-span-2">
            <textarea name="remarks" rows={3} value={form.remarks} onChange={set('remarks')} className="input" placeholder="Internal notes and discussion remarks" />
          </Field>
        </Section>
      </form>
    </Modal>
  );
}
