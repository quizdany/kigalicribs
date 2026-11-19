// Test questions and the chunk ids that answer them.

export type EvalCase = { question: string; relevant: string[] } | { question: string; unanswerable: true };

export const evalSet: EvalCase[] = [
  { question: 'How many owner phone numbers can I unlock for free?', relevant: ['help#4-0'] },
  { question: 'If I request a viewing, is the appointment booked?', relevant: ['help#1-0'] },
  { question: 'Someone listed a house but they are a broker. What do I do?', relevant: ['help#2-0', 'terms#5-0', 'terms#1-0'] },
  { question: 'Where is my shortlist of saved homes kept?', relevant: ['help#3-0', 'privacy#1-0'] },
  { question: 'Does TuraKGL take my deposit or rent money?', relevant: ['terms#0-0'] },
  { question: 'Do you store my mobile money PIN?', relevant: ['privacy#3-0'] },
  { question: 'How do I pay for unlimited contact access?', relevant: ['terms#3-0'] },
  { question: 'Can I share an owner contact on Facebook?', relevant: ['terms#2-0'] },
  { question: 'How do I delete my account and data?', relevant: ['privacy#4-0'] },
  { question: 'Who can see the viewing requests I send?', relevant: ['privacy#2-0'] },
  { question: 'How do I mark my apartment as rented?', relevant: ['help#6-0', 'privacy#4-0'] },
  { question: 'Does the listing checklist prove the owner really owns the house?', relevant: ['help#5-0'] },
  { question: 'Will my marketing draft be posted on Instagram automatically?', relevant: ['help#7-0'] },
  { question: 'What should I check before sending rent to a landlord?', relevant: ['help#11-0', 'terms#4-0'] },
  { question: 'Will I get an SMS when the owner replies?', relevant: ['help#8-0'] },
  { question: 'Can agents list properties on TuraKGL?', relevant: ['terms#1-0'] },
  { question: 'What is the exchange rate between RWF and USD today?', unanswerable: true },
  { question: 'Which secondary school in Kigali has the best exam results?', unanswerable: true },
];
