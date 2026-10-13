export const EMAIL_TEMPLATES = [
  {
    id: 'intro',
    name: 'Introductory EduTour Itinerary',
    subject: 'Educational Tour Proposal for {{School Name}} – {{Destination}}',
    body: `Dear {{Principal Name}},

Greetings from EduTours!

Thank you for your time. As discussed, we are delighted to share an introduction to our curated educational tour to {{Destination}} for the students of {{School Name}}.

Our programme includes:
• Expert-led, curriculum-aligned learning sessions
• Safe, supervised travel with dedicated tour managers
• Comfortable stays, hygienic meals and comprehensive insurance
• Pre-tour orientation for students and parents

We would be glad to customise the itinerary to your preferred travel window and budget. Please let us know a convenient time to walk you through the details.

Warm regards,
EduTours Institutional Sales Team`,
  },
  {
    id: 'post-meeting',
    name: 'Post-Meeting Follow-up',
    subject: 'Thank you for meeting us – {{School Name}} EduTour to {{Destination}}',
    body: `Dear {{Principal Name}},

Thank you for meeting with our team. It was a pleasure discussing the learning goals for the students of {{School Name}}.

As a next step, we will prepare a detailed day-wise itinerary and costing for the {{Destination}} tour based on our discussion. Kindly share any additional preferences (dates, number of students, special requirements) so we can tailor the plan accordingly.

Looking forward to working together.

Warm regards,
EduTours Institutional Sales Team`,
  },
  {
    id: 'quotation-reminder',
    name: 'Quotation Reminder',
    subject: 'Gentle reminder: Quotation for {{School Name}} – {{Destination}} Tour',
    body: `Dear {{Principal Name}},

We hope you had a chance to review the quotation and itinerary we shared for the {{Destination}} educational tour for {{School Name}}.

Seats and hotel inventory for the upcoming season are filling fast, so we would recommend confirming at the earliest to secure the best rates. We are happy to answer any questions or revise the plan as needed.

Warm regards,
EduTours Institutional Sales Team`,
  },
];

export const PLACEHOLDERS = ['{{School Name}}', '{{Principal Name}}', '{{Destination}}'];

export function fillTemplate(text, lead) {
  if (!lead) return text;
  const destination =
    lead.preferredLocation && lead.preferredLocation !== 'Yet to decide' ? lead.preferredLocation : 'your preferred destination';
  return text
    .replaceAll('{{School Name}}', lead.schoolName || 'your school')
    .replaceAll('{{Principal Name}}', lead.principalName || 'Sir/Madam')
    .replaceAll('{{Destination}}', destination);
}
