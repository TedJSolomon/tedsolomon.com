export const BOARDROOM = 'boardroom';
export const ROAST = 'roast';

const COMPARISONS = [
  [50,       'a round of coffees'],
  [100,      'a nice team lunch'],
  [200,      'a full Costco run'],
  [500,      'a round-trip flight'],
  [1000,     'a month of Netflix for everyone'],
  [2000,     'a MacBook Air'],
  [5000,     'a used car payment'],
  [10000,    'a luxury vacation'],
  [Infinity, 'a small yacht deposit'],
];

export function getCostComparison(cost) {
  return COMPARISONS.find(([t]) => cost < t)?.[1] ?? 'a small yacht deposit';
}

export function getCoffees(savings) {
  return Math.max(1, Math.floor(savings / 6));
}

const MESSAGES = {
  recap_title: {
    boardroom: () => "Here's what it cost.",
    roast:     () => "Congratulations. Here's the damage.",
  },
  recap_delta_saved: {
    boardroom: ({ delta }) => `You saved ${delta} by ending early.`,
    roast:     ({ delta }) => `You ended early and saved ${delta}. Don't get used to it.`,
  },
  recap_delta_over: {
    boardroom: ({ delta }) => `This meeting ran ${delta} over the scheduled budget.`,
    roast:     ({ delta }) => `You went ${delta} over. That's pure overtime pain. No refunds. 🔥`,
  },
  ticker_remaining: {
    boardroom: ({ remaining }) => `${remaining} remaining in scheduled budget`,
    roast:     ({ remaining }) => `${remaining} before you hit the red`,
  },
  ticker_over: {
    boardroom: ({ over }) => `${over} over the scheduled budget`,
    roast:     ({ over }) => `${over} over budget. No refunds. 🔥`,
  },
  receipt_comparison: {
    boardroom: ()         => null,
    roast:     ({ cost }) => `This meeting cost more than ${getCostComparison(cost)}.`,
  },
  receipt_footer: {
    boardroom: () => null,
    roast:     () => 'No refunds.',
  },
  opt_cut_time: {
    boardroom: ({ min, savings })          => `Cut ${min} min → save ${savings}/year`,
    roast:     ({ min, savings, coffees }) => `Shave ${min} min → buy the team ${coffees} coffees/year instead of burning ${savings} 🔥`,
  },
  opt_frequency: {
    boardroom: ({ from, to, savings }) => `Switch from ${from} to ${to} → save ${savings}/year`,
    roast:     ({ from, to, savings }) => `Go ${to} instead of ${from}. That's ${savings}/year back. ☕`,
  },
  opt_remove: {
    boardroom: ({ name, savings }) => `Remove ${name} → save ${savings}/year`,
    roast:     ({ name, savings }) => `Does ${name} really need to be here? Drop them → save ${savings}/year 👀`,
  },
};

export function copy(key, tone, vars = {}) {
  const msg = MESSAGES[key];
  if (!msg) return '';
  const fn = msg[tone] ?? msg.boardroom;
  return fn(vars);
}
