export const ALPHA_BETS = [
  { rank: 1, ticker: 'NVDA', company: 'NVIDIA', fcf2033: 175, tier: 'ACE', sector: 'Semis' },
  { rank: 2, ticker: 'AAPL', company: 'Apple', fcf2033: 140, tier: 'ACE', sector: 'Tech' },
  { rank: 3, ticker: 'MSFT', company: 'Microsoft', fcf2033: 130, tier: 'ACE', sector: 'Software' },
  { rank: 4, ticker: 'GOOGL', company: 'Alphabet', fcf2033: 125, tier: 'ACE', sector: 'Internet' },
  { rank: 5, ticker: 'BRK.B', company: 'Berkshire*', fcf2033: 120, tier: 'ACE', sector: 'Conglom.' },
  { rank: 6, ticker: 'AMZN', company: 'Amazon', fcf2033: 110, tier: 'ACE', sector: 'Consumer' },
  { rank: 7, ticker: 'META', company: 'Meta', fcf2033: 95, tier: 'KING', sector: 'Social/AI' },
  { rank: 8, ticker: 'JPM', company: 'JPMorgan*', fcf2033: 75, tier: 'KING', sector: 'Banking' },
  { rank: 9, ticker: 'TSM', company: 'TSMC', fcf2033: 70, tier: 'KING', sector: 'Semis' },
  { rank: 10, ticker: '2222', company: 'Aramco', fcf2033: 60, tier: 'KING', sector: 'Energy' },
  { rank: 11, ticker: 'AVGO', company: 'Broadcom', fcf2033: 55, tier: 'KING', sector: 'Semis' },
  { rank: 12, ticker: 'LLY', company: 'Eli Lilly', fcf2033: 45, tier: 'KING', sector: 'Pharma' },
  { rank: 13, ticker: 'BAC', company: 'BofA*', fcf2033: 40, tier: 'KING', sector: 'Banking' },
  { rank: 14, ticker: 'NVO', company: 'Novo Nordisk', fcf2033: 35, tier: 'KING', sector: 'Pharma' },
  { rank: 15, ticker: 'ORCL', company: 'Oracle', fcf2033: 35, tier: 'QUEEN', sector: 'Cloud' },
  { rank: 16, ticker: 'TSLA', company: 'Tesla', fcf2033: 35, tier: 'QUEEN', sector: 'Auto/AI' },
  { rank: 17, ticker: 'ABBV', company: 'AbbVie', fcf2033: 32, tier: 'QUEEN', sector: 'Pharma' },
  { rank: 18, ticker: 'UNH', company: 'UnitedHealth', fcf2033: 30, tier: 'QUEEN', sector: 'Health' },
  { rank: 19, ticker: 'V', company: 'Visa', fcf2033: 30, tier: 'QUEEN', sector: 'Payments' },
  { rank: 20, ticker: 'CRM', company: 'Salesforce', fcf2033: 28, tier: 'QUEEN', sector: 'SaaS/AI' },
  { rank: 21, ticker: 'NFLX', company: 'Netflix', fcf2033: 28, tier: 'QUEEN', sector: 'Media' },
  { rank: 22, ticker: 'SMSN', company: 'Samsung', fcf2033: 28, tier: 'JACK', sector: 'Semis' },
  { rank: 23, ticker: 'TCEHY', company: 'Tencent', fcf2033: 28, tier: 'JACK', sector: 'Internet' },
  { rank: 24, ticker: 'BABA', company: 'Alibaba', fcf2033: 26, tier: 'JACK', sector: 'E-comm' },
  { rank: 25, ticker: 'ADBE', company: 'Adobe', fcf2033: 25, tier: 'JACK', sector: 'Software' },
  { rank: 26, ticker: 'SHEL', company: 'Shell', fcf2033: 24, tier: 'JACK', sector: 'Energy' },
  { rank: 27, ticker: 'MA', company: 'Mastercard', fcf2033: 22, tier: 'JACK', sector: 'Payments' },
];

export const COMPOUNDING_DATA = [
  { year: 0, equity: 100, aloha: 100, all: 100 },
  { year: 5, equity: 201, aloha: 224, all: 271 },
  { year: 10, equity: 405, aloha: 502, all: 734 },
  { year: 15, equity: 814, aloha: 1123, all: 1989 },
  { year: 20, equity: 1638, aloha: 2512, all: 5392 },
  { year: 25, equity: 3292, aloha: 5617, all: 14602 },
];

export const FUND_INFO = {
  name: "Hushh Evergreen Alpha Aloha Fund A",
  mission: "Compound wealth over decades by owning the world's 27 highest free cash flow generators.",
  engines: [
    { name: "Alpha", description: "Concentrated long-only ownership. Math decides." },
    { name: "Aloha", description: "Systematic covered calls & cash-secured puts. Reinvested premium." },
    { name: "Capital Efficiency", description: "Intelligent leverage on AAAA-rated collateral." }
  ],
  rules: [
    "Earnings Blackout: No options 10 days before / 2 days after earnings.",
    "VIX Stand-Down: VIX > 40 for 3 consecutive days → cease until VIX < 30.",
    "Reserve Limit: Max deployment ≤ 80% of T-Bill Reserve.",
    "No Naked Options: All covered (calls) or cash-secured (puts).",
    "Premium Reinvestment: All premium → shares within 5 business days."
  ]
};
