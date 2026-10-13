import { addDays, today } from '../utils/helpers';

/**
 * Seed data modelled on the Institutional Sales Master Sheet.
 * Dates are relative to "today" so the follow-up queue always has realistic due/overdue items.
 */
const SEED = [
  {
    d: -42, school: 'Delhi Public School, Megacity', cat: 'A+', state: 'West Bengal', place: 'Kolkata',
    principal: 'Mrs. Anjali Sen', contact: '9830012345 / principal@dpsmegacity.edu.in', strength: 2400, expected: 180,
    fees: '10,000 - 20,000', budget: 45000, loc: 'NASA', time: 'Winter Break', status: 'Proposal / Itinerary Sent',
    last: 'Shared NASA Space Camp itinerary and costing', next: 1,
    remarks: 'Board approval pending. Prefers 10-day programme with Kennedy Space Center visit.',
    history: [
      { d: -42, channel: 'Meeting', notes: 'Initial meeting with Principal and Science HoD.' },
      { d: -30, channel: 'Call', notes: 'Discussed budget range and passport readiness.' },
      { d: -12, channel: 'Email', notes: 'Follow-up Email Sent: Introductory EduTour Itinerary', email: true },
    ],
  },
  {
    d: -35, school: 'South Point High School', cat: 'A+', state: 'West Bengal', place: 'Kolkata',
    principal: 'Mr. Rajiv Banerjee', contact: '9831198765 / office@southpoint.edu.in', strength: 3200, expected: 220,
    fees: '5,000 - 10,000', budget: 18000, loc: 'ISRO', time: 'After Pooja', status: 'Closed - Won',
    last: 'Advance payment received for ISRO Bengaluru tour', next: null,
    remarks: 'Confirmed for Class 9-10. 4 coaches, 12 escort teachers.',
    history: [
      { d: -35, channel: 'Meeting', notes: 'Presented ISRO + Visvesvaraya Museum package.' },
      { d: -20, channel: 'Email', notes: 'Follow-up Email Sent: Quotation Reminder', email: true },
      { d: -8, channel: 'Call', notes: 'Confirmed booking. Advance cheque collected.' },
    ],
  },
  {
    d: -28, school: "St. Xavier's Collegiate School", cat: 'A', state: 'West Bengal', place: 'Kolkata',
    principal: 'Fr. Dominic Savio', contact: '9433022211', strength: 1800, expected: 120,
    fees: '5,000 - 10,000', budget: 22000, loc: 'Golden Triangle', time: 'December 2026', status: 'Meeting Scheduled',
    last: 'Meeting fixed with Vice Principal', next: 0,
    remarks: 'Interested in heritage + history module for Class 8.',
    history: [{ d: -28, channel: 'Call', notes: 'Cold call, asked for in-person meeting.' }],
  },
  {
    d: -25, school: 'DAV Public School, Unit-8', cat: 'A', state: 'Odisha', place: 'Bhubaneswar',
    principal: 'Dr. Sangeeta Mohanty', contact: '9437011122 / davunit8@gmail.com', strength: 2100, expected: 150,
    fees: '2,000 - 5,000', budget: 15000, loc: 'ISRO', time: 'After Pooja', status: 'Follow up in process',
    last: 'Sent brochure on WhatsApp', next: -2,
    remarks: 'Wants comparison between ISRO Sriharikota and Bengaluru.',
    history: [{ d: -25, channel: 'Meeting', notes: 'Met principal at regional principals meet.' }],
  },
  {
    d: -22, school: 'Sai International School', cat: 'A+', state: 'Odisha', place: 'Bhubaneswar',
    principal: 'Mrs. Pallavi Das', contact: '9861234560 / principal@saiinternational.edu.in', strength: 2800, expected: 200,
    fees: 'Above 20,000', budget: 120000, loc: 'NASA', time: 'Summer Vacation', status: 'Proposal / Itinerary Sent',
    last: 'Itinerary v2 sent with Orlando add-on', next: 3,
    remarks: 'Price-sensitive on flights. Exploring group fare options.',
    history: [
      { d: -22, channel: 'Meeting', notes: 'Discovery meeting with Principal.' },
      { d: -5, channel: 'Email', notes: 'Follow-up Email Sent: Post-Meeting Follow-up', email: true },
    ],
  },
  {
    d: -20, school: "St. Michael's High School", cat: 'A', state: 'Bihar', place: 'Patna',
    principal: 'Br. Thomas Joseph', contact: '9934056789', strength: 1600, expected: 90,
    fees: '2,000 - 5,000', budget: 12000, loc: 'Science City', time: 'November 2026', status: 'No decision yet stage',
    last: 'Management yet to decide on tour this year', next: 10,
    remarks: 'Revisit after half-yearly exams.',
    history: [{ d: -20, channel: 'Call', notes: 'Principal asked to call back after exams.' }],
  },
  {
    d: -18, school: 'Notre Dame Academy', cat: 'A', state: 'Bihar', place: 'Patna',
    principal: 'Sr. Mary Grace', contact: '9431122334 / nda.patna@gmail.com', strength: 1400, expected: 80,
    fees: '5,000 - 10,000', budget: 20000, loc: 'Sikkim & Darjeeling', time: 'October 2026', status: 'Lost / Not Interested',
    last: 'Went with another vendor', next: null,
    remarks: 'Lost on price. Re-approach next academic year.',
    history: [{ d: -18, channel: 'Meeting', notes: 'Presented Darjeeling nature camp.' }],
  },
  {
    d: -15, school: 'Kendriya Vidyalaya No. 1', cat: 'B', state: 'Odisha', place: 'Cuttack',
    principal: 'Mr. Prakash Rout', contact: '9437788990', strength: 1300, expected: 100,
    fees: 'Below 2,000', budget: 6000, loc: 'Science City', time: 'Winter Break', status: 'Follow up in process',
    last: 'Awaiting circular approval from regional office', next: -1,
    remarks: 'Budget constrained; propose 2-day Kolkata Science City trip.',
    history: [{ d: -15, channel: 'Call', notes: 'Discussed low-budget options.' }],
  },
  {
    d: -12, school: 'Don Bosco School, Park Circus', cat: 'A+', state: 'West Bengal', place: 'Kolkata',
    principal: 'Fr. George Mathew', contact: '9830567890 / dbpc@donboscokolkata.org', strength: 2600, expected: 160,
    fees: '10,000 - 20,000', budget: 55000, loc: 'Singapore', time: 'Summer Vacation', status: 'Meeting Scheduled',
    last: 'Presentation scheduled with management committee', next: 2,
    remarks: 'Interested in Singapore Science Centre + Universal Studios combo.',
    history: [{ d: -12, channel: 'Call', notes: 'Intro call, positive response.' }],
  },
  {
    d: -10, school: 'Loyola School', cat: 'A', state: 'Jharkhand', place: 'Jamshedpur',
    principal: 'Fr. Peter Ekka', contact: '9431900112', strength: 1900, expected: 140,
    fees: '5,000 - 10,000', budget: 25000, loc: 'Golden Triangle', time: 'January 2027', status: 'New Lead',
    last: 'Lead captured from education fair', next: 0,
    remarks: '',
    history: [],
  },
  {
    d: -9, school: 'Delhi Public School, Ranchi', cat: 'A+', state: 'Jharkhand', place: 'Ranchi',
    principal: 'Dr. Ram Singh', contact: '9835012233 / dpsranchi@dpsranchi.com', strength: 3500, expected: 250,
    fees: '5,000 - 10,000', budget: 30000, loc: 'ISRO', time: 'December 2026', status: 'Follow up in process',
    last: 'Called Activity Coordinator for student count', next: -3,
    remarks: 'Multiple batches possible. High-value account.',
    history: [{ d: -9, channel: 'Meeting', notes: 'Met Activity Coordinator.' }],
  },
  {
    d: -7, school: 'Assam Valley School', cat: 'A+', state: 'Assam', place: 'Tezpur',
    principal: 'Mr. Vishal Shah', contact: 'head@assamvalleyschool.com', strength: 700, expected: 60,
    fees: 'Above 20,000', budget: 150000, loc: 'NASA', time: 'Summer Vacation', status: 'New Lead',
    last: 'Enquiry received via website', next: 1,
    remarks: 'Boarding school; flexible dates.',
    history: [],
  },
  {
    d: -6, school: 'Mother International School', cat: 'B+', state: 'West Bengal', place: 'Siliguri',
    principal: 'Mrs. Rita Gurung', contact: '9733012345', strength: 1100, expected: 70,
    fees: '2,000 - 5,000', budget: 9000, loc: 'Sikkim & Darjeeling', time: 'After Pooja', status: 'Proposal / Itinerary Sent',
    last: 'Sent Gangtok 3N/4D itinerary', next: -1,
    remarks: '',
    history: [{ d: -6, channel: 'Email', notes: 'Follow-up Email Sent: Introductory EduTour Itinerary', email: true }],
  },
  {
    d: -5, school: 'Saraswati Shishu Mandir', cat: 'C+', state: 'Bihar', place: 'Gaya',
    principal: 'Shri Arvind Kumar', contact: '9472233445', strength: 900, expected: 50,
    fees: 'Below 2,000', budget: 4000, loc: 'Yet to decide', time: 'Yet to decide', status: 'New Lead',
    last: 'Visited school; brochure handed over', next: 4,
    remarks: 'Needs a very low-cost option.',
    history: [],
  },
  {
    d: -4, school: 'Modern English School', cat: 'B', state: 'Odisha', place: 'Rourkela',
    principal: 'Mrs. Sunita Patnaik', contact: '9438123456 / mes.rkl@gmail.com', strength: 1000, expected: 75,
    fees: '2,000 - 5,000', budget: 14000, loc: 'ISRO', time: 'February 2027', status: 'Follow up in process',
    last: 'Shared reference list of past schools', next: 5,
    remarks: '',
    history: [{ d: -4, channel: 'Call', notes: 'Asked for references from other schools.' }],
  },
  {
    d: -3, school: 'Holy Cross School', cat: 'B+', state: 'Assam', place: 'Guwahati',
    principal: 'Sr. Lucy Thomas', contact: '9864011223', strength: 1500, expected: 110,
    fees: '5,000 - 10,000', budget: 28000, loc: 'Kerala', time: 'Winter Break', status: 'Meeting Scheduled',
    last: 'Meeting fixed for next week', next: 6,
    remarks: '',
    history: [{ d: -3, channel: 'Call', notes: 'Fixed meeting with Principal.' }],
  },
  {
    d: -2, school: 'Little Flower School', cat: 'C+', state: 'West Bengal', place: 'Howrah',
    principal: 'Mrs. Mitali Ghosh', contact: '9007123456', strength: 800, expected: 40,
    fees: 'Below 2,000', budget: 3500, loc: 'Science City', time: 'November 2026', status: 'No decision yet stage',
    last: 'Parents meeting pending', next: 8,
    remarks: '',
    history: [],
  },
  {
    d: -1, school: 'Bishop Westcott Girls School', cat: 'A', state: 'Jharkhand', place: 'Ranchi',
    principal: 'Mrs. Sheela Minz', contact: '9431709876 / bwgs.ranchi@gmail.com', strength: 1700, expected: 95,
    fees: '5,000 - 10,000', budget: 35000, loc: 'Dubai', time: 'Summer Vacation', status: 'New Lead',
    last: 'Referral from DPS Ranchi', next: 2,
    remarks: 'Girls-only batch; needs female escorts.',
    history: [],
  },
];

export function buildMockLeads() {
  const t = today();
  return SEED.map((s, i) => {
    const date = addDays(t, s.d);
    return {
      id: `seed-${i + 1}`,
      date,
      schoolName: s.school,
      category: s.cat,
      state: s.state,
      place: s.place,
      principalName: s.principal,
      contactDetails: s.contact,
      totalStrength: s.strength,
      expectedStudents: s.expected,
      fees: s.fees,
      budgetPerStudent: s.budget,
      preferredLocation: s.loc,
      preferredTravelTime: s.time,
      followUpStatus: s.status,
      lastActionTaken: s.last,
      nextFollowUpDate: s.next === null ? '' : addDays(t, s.next),
      followUpHistory: s.history.map((h, j) => ({
        id: `seed-${i + 1}-h${j + 1}`,
        date: addDays(t, h.d),
        notes: h.notes,
        channel: h.channel,
        emailSent: Boolean(h.email),
      })),
      remarks: s.remarks,
      createdAt: new Date(`${date}T10:00:00`).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });
}
