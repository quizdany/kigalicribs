// Single source of truth for TuraKGL's help, terms and privacy content.
// The /help, /terms and /privacy pages render these sections, and the RAG
// pipeline (scripts/ingest-knowledge.ts) embeds the same text, so the assistant
// can never drift from what the site actually says.

export type KnowledgeSection = { title: string; body: string };

export type KnowledgeDocument = {
  id: string;
  title: string;
  url: string;
  sections: KnowledgeSection[];
};

export const helpQuestions: KnowledgeSection[] = [
  { title: 'How do I find a home?', body: 'Use property search to choose a location, monthly budget and bedrooms. Open a listing to see its details and contact options.' },
  { title: 'Is a viewing request a confirmed appointment?', body: 'No. It stays pending until the owner replies. The owner can suggest a time, confirm an agreed date and time, or decline. Check My requests before travelling.' },
  { title: 'How do I report a broker or inaccurate listing?', body: 'Open the property and use Report broker, unavailable home or incorrect information. Reports go to the TuraKGL review queue. A report does not automatically remove a listing.' },
  { title: 'Can I save a property?', body: 'Use Save on the property search page. Your shortlist is stored in this browser only, up to 20 homes. Properties no longer listed as available are excluded from shortlist search.' },
  { title: 'When can I see an owner’s phone or email?', body: 'Sign in first. Each renter account has three free property contact unlocks; repeat access to the same listing does not use another one. An active unlimited contact plan also allows access. Contact details are closed when a listing is unavailable or expired.' },
  { title: 'What does the owner checklist verify?', body: 'Nothing automatically. It helps owners prepare a complete listing. Checkmarks are not proof of ownership or a property inspection.' },
  { title: 'How do owners update availability?', body: 'Sign in, open My properties and choose Available, Rented or Maintenance. Only your own properties can be changed through those tools.' },
  { title: 'Will a marketing draft post to my social account?', body: 'No. The marketing workspace creates editable templates. You can copy them to your own accounts or save them for review. No social account is created, connected or charged.' },
  { title: 'How do I get help?', body: 'Submit a support request through the rental assistant. The team’s response appears in My requests. Owners can respond to viewing requests from their property inquiry inbox. Email and phone notifications are not connected.' },
  { title: 'How does the AI assistant answer questions?', body: 'When it is switched on, the assistant searches live listings for home recommendations and searches this help page, the terms of use and the privacy policy for questions about how TuraKGL works. It answers only from what it finds and shows the sources it used. Search, request tracking, owner tools and marketing templates work without it.' },
  { title: 'What information is stored?', body: 'Listings remain in the existing property database. Submitted requests, drafts, review status and team responses are saved for the service. Shortlists stay in your browser. Do not put identity documents or payment details in support messages.' },
  { title: 'Before making a payment', body: 'Confirm who you are dealing with, view the property where possible, and check the full rental terms and charges. A listing or viewing request is not a guarantee.' },
];

export const termsSections: KnowledgeSection[] = [
  { title: 'What TuraKGL does', body: 'TuraKGL lists homes for rent in Kigali and puts renters in touch with property owners. We are not a party to any lease, and we do not collect rent or deposits.' },
  { title: 'Owner listings', body: 'Owners must list only properties they own or are authorised to rent out, with accurate rent, photos and availability. Listings from brokers or agents posing as owners may be removed.' },
  { title: 'Renter conduct', body: 'Use owner contact details only to ask about the listed property. Do not resell or publish them.' },
  { title: 'Paid features', body: 'Listing upgrades and unlimited contact access are paid once through mobile money. The price is shown before you pay.' },
  { title: 'Before you pay rent', body: 'Confirm who you are dealing with, view the property where possible, and read the full rental terms. A listing or a viewing request is not a guarantee that a home is available.' },
  { title: 'Reporting problems', body: 'Use the report option on any listing for brokers, unavailable homes, incorrect details or suspected scams. Reports are reviewed by the TuraKGL team.' },
];

export const privacySections: KnowledgeSection[] = [
  { title: 'What we store', body: 'Your account email and name, the listings you publish, the viewing requests, reports and support messages you send, which owner contacts you have unlocked, and the status of payments you make for listing upgrades or contact access.' },
  { title: 'What stays on your device', body: 'Your shortlist of saved homes is kept in your browser only. Clearing your browser data removes it.' },
  { title: 'Who sees your details', body: 'Owner phone numbers and emails are shown only to signed in renters who have unlocked that listing. Viewing requests are visible to you and to the owner of the property. TuraKGL staff can read requests and reports to review them.' },
  { title: 'Payments', body: 'Mobile money payments are processed by MTN MoMo or Airtel Money. We keep the payment reference and status, not your mobile money PIN.' },
  { title: 'Your choices', body: 'You can update or mark your listings as rented at any time from My properties. To delete your account and the data linked to it, send a support request from the assistant page.' },
];

export const knowledgeDocuments: KnowledgeDocument[] = [
  { id: 'help', title: 'Help and how it works', url: '/help', sections: helpQuestions },
  { id: 'terms', title: 'Terms of use', url: '/terms', sections: termsSections },
  { id: 'privacy', title: 'Privacy policy', url: '/privacy', sections: privacySections },
];
