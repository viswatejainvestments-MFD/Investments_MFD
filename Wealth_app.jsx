import { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Legend } from "recharts";

// ───────────────────────────── DESIGN TOKENS ─────────────────────────────
const C = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  card: "var(--card)",
  border: "var(--border)",
  text: "var(--text)",
  muted: "var(--muted)",
  accent: "var(--accent)",
  green: "#10b981",
  red: "#ef4444",
  amber: "#f59e0b",
  blue: "#3b82f6",
  purple: "#8b5cf6",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  :root {
    --bg: #0a0c10;
    --surface: #111318;
    --card: #161b22;
    --border: rgba(255,255,255,0.06);
    --text: #f0f0f0;
    --muted: #6b7280;
    --accent: #6ee7b7;
    --accent2: #34d399;
    font-family: 'Sora', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--text); }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
  input, select { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: var(--text); border-radius: 10px; padding: 10px 14px; font-size: 14px; font-family: 'Sora', sans-serif; width: 100%; outline: none; transition: border .2s; }
  input:focus, select:focus { border-color: rgba(110,231,183,0.4); box-shadow: 0 0 0 3px rgba(110,231,183,0.08); }
  input::placeholder { color: #4b5563; }
  select option { background: #1c2028; }
  button { cursor: pointer; font-family: 'Sora', sans-serif; border: none; outline: none; }
  .mono { font-family: 'DM Mono', monospace; }
`;

// ───────────────────────────── MOCK DATA ─────────────────────────────────
const MUTUAL_FUNDS = [
  { name: "Mirae Asset Large Cap", category: "Large Cap", amc: "Mirae", invested: 120000, current: 158400, units: 2840, nav: 55.77, xirr: 18.2, sipDate: 5, goal: "Retirement" },
  { name: "Parag Parikh Flexi Cap", category: "Flexi Cap", amc: "PPFAS", invested: 90000, current: 124200, units: 1540, nav: 80.65, xirr: 22.4, sipDate: 10, goal: "Wealth Creation" },
  { name: "Axis Midcap Fund", category: "Mid Cap", amc: "Axis", invested: 60000, current: 72600, units: 860, nav: 84.42, xirr: 11.8, sipDate: 15, goal: "Child Education" },
  { name: "HDFC Liquid Fund", category: "Liquid", amc: "HDFC", invested: 200000, current: 218400, units: 8200, nav: 26.63, xirr: 6.8, sipDate: null, goal: "Emergency Fund" },
  { name: "Nippon India Small Cap", category: "Small Cap", amc: "Nippon", invested: 45000, current: 67500, units: 1200, nav: 56.25, xirr: 28.6, sipDate: 20, goal: "Wealth Creation" },
];

const NET_WORTH_DATA = [
  { month: "Jun'23", value: 520000 }, { month: "Sep'23", value: 610000 },
  { month: "Dec'23", value: 695000 }, { month: "Mar'24", value: 740000 },
  { month: "Jun'24", value: 810000 }, { month: "Sep'24", value: 880000 },
  { month: "Dec'24", value: 950000 }, { month: "Mar'25", value: 1040000 },
  { month: "Now", value: 1121100 },
];

const SECTOR_DATA = [
  { name: "Financial Services", value: 28 }, { name: "IT", value: 22 },
  { name: "Consumer", value: 18 }, { name: "Healthcare", value: 12 },
  { name: "Energy", value: 10 }, { name: "Others", value: 10 },
];

const ASSET_DATA = [
  { name: "Mutual Funds", value: 641100, color: "#6ee7b7" },
  { name: "Bank & FD", value: 280000, color: "#60a5fa" },
  { name: "Stocks", value: 150000, color: "#a78bfa" },
  { name: "Insurance", value: 50000, color: "#f59e0b" },
];

const SIP_PROJECTION = [
  { year: "2025", corpus: 641100 }, { year: "2026", corpus: 820000 },
  { year: "2027", corpus: 1050000 }, { year: "2028", corpus: 1340000 },
  { year: "2029", corpus: 1710000 }, { year: "2030", corpus: 2180000 },
];

const GOALS = [
  { name: "Retirement", target: 10000000, current: 276600, timeline: "25 yrs", progress: 2.8, color: "#6ee7b7", icon: "🏡" },
  { name: "Child Education", target: 3000000, current: 72600, timeline: "12 yrs", progress: 2.4, color: "#60a5fa", icon: "🎓" },
  { name: "Emergency Fund", target: 600000, current: 218400, timeline: "1 yr", progress: 36.4, color: "#f59e0b", icon: "🛡️" },
  { name: "Wealth Creation", target: 5000000, current: 192000, timeline: "10 yrs", progress: 3.8, color: "#a78bfa", icon: "📈" },
];

// ───────────────────────────── HELPERS ───────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const fmtL = (n) => n >= 10000000 ? `₹${(n / 10000000).toFixed(2)}Cr` : n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${fmt(n)}`;
const pct = (a, b) => (((b - a) / a) * 100).toFixed(1);

// ───────────────────────────── UI PRIMITIVES ─────────────────────────────
const Card = ({ children, style = {}, className = "" }) => (
  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px", ...style }} className={className}>
    {children}
  </div>
);

const Badge = ({ children, color = "#6ee7b7" }) => (
  <span style={{ background: `${color}18`, color, border: `1px solid ${color}30`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 500, letterSpacing: "0.02em" }}>
    {children}
  </span>
);

const Pill = ({ children, active, onClick, color = "#6ee7b7" }) => (
  <button onClick={onClick} style={{
    background: active ? `${color}20` : "transparent",
    color: active ? color : "var(--muted)",
    border: `1px solid ${active ? `${color}40` : "var(--border)"}`,
    borderRadius: 20, padding: "6px 16px", fontSize: 13, fontWeight: 500,
    transition: "all .2s", cursor: "pointer"
  }}>{children}</button>
);

const StatCard = ({ label, value, sub, color = "#6ee7b7", icon }) => (
  <Card style={{ padding: "18px 20px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
      <span style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
      {icon && <span style={{ fontSize: 18 }}>{icon}</span>}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: "-0.02em" }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
  </Card>
);

const ProgressBar = ({ value, color = "#6ee7b7", height = 6 }) => (
  <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 100, height, overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${Math.min(value, 100)}%`, background: color, borderRadius: 100, transition: "width 1s ease" }} />
  </div>
);

// ───────────────────────────── ONBOARDING ────────────────────────────────
const STEPS = ["Profile", "Income", "Goals", "Risk", "Summary"];

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "", age: "", occupation: "", income: "", expenses: "", savings: "",
    goals: [], riskAppetite: "", goalAmounts: {}, goalTimelines: {}
  });

  const GOAL_LIST = [
    { id: "retirement", label: "Retirement", icon: "🏡" },
    { id: "education", label: "Child Education", icon: "🎓" },
    { id: "emergency", label: "Emergency Fund", icon: "🛡️" },
    { id: "house", label: "House Purchase", icon: "🏠" },
    { id: "wealth", label: "Wealth Creation", icon: "📈" },
    { id: "travel", label: "Travel", icon: "✈️" },
  ];

  const upd = (k, v) => setData(p => ({ ...p, [k]: v }));

  const toggleGoal = (id) => {
    setData(p => ({
      ...p,
      goals: p.goals.includes(id) ? p.goals.filter(g => g !== id) : [...p.goals, id]
    }));
  };

  const calcSIP = () => {
    const inc = parseFloat(data.income) || 0;
    const exp = parseFloat(data.expenses) || 0;
    const surplus = inc - exp;
    return Math.round(surplus * 0.4);
  };

  const calcScore = () => {
    const inc = parseFloat(data.income) || 1;
    const exp = parseFloat(data.expenses) || inc;
    const sav = parseFloat(data.savings) || 0;
    const ratio = (inc - exp) / inc;
    const savRatio = sav / (inc * 12);
    let score = 0;
    if (ratio > 0.4) score += 35;
    else if (ratio > 0.25) score += 22;
    else if (ratio > 0.1) score += 10;
    if (savRatio > 12) score += 35;
    else if (savRatio > 6) score += 22;
    else if (savRatio > 3) score += 10;
    if (data.goals.length >= 3) score += 15;
    else if (data.goals.length >= 1) score += 8;
    if (data.riskAppetite) score += 15;
    return Math.min(score, 100);
  };

  const scoreColor = (s) => s >= 70 ? "#10b981" : s >= 45 ? "#f59e0b" : "#ef4444";

  const InputField = ({ label, placeholder, value, onChange, type = "text" }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );

  const steps = [
    // Step 0: Profile
    <div key={0}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Let's start with you</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>Your financial journey begins with understanding who you are.</p>
      <InputField label="Full Name" placeholder="Rahul Sharma" value={data.name} onChange={v => upd("name", v)} />
      <InputField label="Age" placeholder="32" type="number" value={data.age} onChange={v => upd("age", v)} />
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>Occupation</label>
        <select value={data.occupation} onChange={e => upd("occupation", e.target.value)}>
          <option value="">Select occupation</option>
          <option>Salaried - Private</option>
          <option>Salaried - Government</option>
          <option>Self Employed / Business</option>
          <option>Freelancer</option>
          <option>Student</option>
          <option>Retired</option>
        </select>
      </div>
    </div>,

    // Step 1: Income
    <div key={1}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Your finances</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>Help us understand your cash flow to optimize your plan.</p>
      <InputField label="Monthly Income (₹)" placeholder="1,00,000" type="number" value={data.income} onChange={v => upd("income", v)} />
      <InputField label="Monthly Expenses (₹)" placeholder="60,000" type="number" value={data.expenses} onChange={v => upd("expenses", v)} />
      <InputField label="Current Savings (₹)" placeholder="5,00,000" type="number" value={data.savings} onChange={v => upd("savings", v)} />
      {data.income && data.expenses && (
        <div style={{ background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.15)", borderRadius: 12, padding: 16, marginTop: 8 }}>
          <div style={{ fontSize: 12, color: "#6ee7b7", marginBottom: 4 }}>Monthly Surplus</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#6ee7b7" }}>₹{fmt(parseFloat(data.income) - parseFloat(data.expenses))}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            {Math.round((1 - parseFloat(data.expenses) / parseFloat(data.income)) * 100)}% savings rate
          </div>
        </div>
      )}
    </div>,

    // Step 2: Goals
    <div key={2}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Your financial goals</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>Select all goals you want to plan for.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {GOAL_LIST.map(g => (
          <button key={g.id} onClick={() => toggleGoal(g.id)} style={{
            background: data.goals.includes(g.id) ? "rgba(110,231,183,0.1)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${data.goals.includes(g.id) ? "rgba(110,231,183,0.4)" : "var(--border)"}`,
            borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10,
            color: data.goals.includes(g.id) ? "#6ee7b7" : "var(--muted)", cursor: "pointer", textAlign: "left",
            transition: "all .2s", fontSize: 13, fontWeight: 500
          }}>
            <span style={{ fontSize: 20 }}>{g.icon}</span>
            {g.label}
            {data.goals.includes(g.id) && <span style={{ marginLeft: "auto", fontSize: 14 }}>✓</span>}
          </button>
        ))}
      </div>
      {data.goals.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, letterSpacing: "0.04em", textTransform: "uppercase" }}>Goal details</div>
          {data.goals.map(gid => {
            const g = GOAL_LIST.find(x => x.id === gid);
            return (
              <div key={gid} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                <input type="number" placeholder={`${g.label} amount (₹)`}
                  value={data.goalAmounts[gid] || ""} onChange={e => setData(p => ({ ...p, goalAmounts: { ...p.goalAmounts, [gid]: e.target.value } }))}
                  style={{ flex: 1 }} />
                <input type="text" placeholder="In X years"
                  value={data.goalTimelines[gid] || ""} onChange={e => setData(p => ({ ...p, goalTimelines: { ...p.goalTimelines, [gid]: e.target.value } }))}
                  style={{ width: 100 }} />
              </div>
            );
          })}
        </div>
      )}
    </div>,

    // Step 3: Risk
    <div key={3}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Risk profiling</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 28 }}>Understanding your risk comfort helps us recommend the right investments.</p>
      {[
        { id: "conservative", label: "Conservative", desc: "I prefer stable, low-risk investments", icon: "🛡️", color: "#60a5fa" },
        { id: "moderate", label: "Moderate", desc: "I'm okay with some risk for better returns", icon: "⚖️", color: "#f59e0b" },
        { id: "aggressive", label: "Aggressive", desc: "I want maximum growth, can handle volatility", icon: "🚀", color: "#10b981" },
      ].map(r => (
        <button key={r.id} onClick={() => upd("riskAppetite", r.id)} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
          background: data.riskAppetite === r.id ? `${r.color}12` : "rgba(255,255,255,0.02)",
          border: `1px solid ${data.riskAppetite === r.id ? `${r.color}50` : "var(--border)"}`,
          borderRadius: 12, cursor: "pointer", textAlign: "left", marginBottom: 12, transition: "all .2s"
        }}>
          <span style={{ fontSize: 28 }}>{r.icon}</span>
          <div>
            <div style={{ fontWeight: 600, color: data.riskAppetite === r.id ? r.color : "var(--text)", fontSize: 14 }}>{r.label}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{r.desc}</div>
          </div>
          {data.riskAppetite === r.id && <span style={{ marginLeft: "auto", color: r.color }}>✓</span>}
        </button>
      ))}
    </div>,

    // Step 4: Summary
    <div key={4}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Your Financial Plan</h2>
      <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 24 }}>AI-generated summary for {data.name || "you"}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Financial Health</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: scoreColor(calcScore()) }}>{calcScore()}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>/ 100</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>Suggested SIP</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#6ee7b7" }}>₹{fmt(calcSIP())}</div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>per month</div>
        </div>
      </div>
      {[
        { label: "Monthly Surplus", value: `₹${fmt(parseFloat(data.income || 0) - parseFloat(data.expenses || 0))}` },
        { label: "Current Savings", value: `₹${fmtL(parseFloat(data.savings || 0))}` },
        { label: "Goals Selected", value: `${data.goals.length} goals` },
        { label: "Risk Profile", value: data.riskAppetite ? data.riskAppetite.charAt(0).toUpperCase() + data.riskAppetite.slice(1) : "—" },
      ].map(r => (
        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 14 }}>
          <span style={{ color: "var(--muted)" }}>{r.label}</span>
          <span style={{ fontWeight: 600 }}>{r.value}</span>
        </div>
      ))}
      <div style={{ background: "rgba(110,231,183,0.05)", border: "1px solid rgba(110,231,183,0.15)", borderRadius: 12, padding: 14, marginTop: 16, fontSize: 13, color: "#6ee7b7", lineHeight: 1.6 }}>
        💡 Based on your profile, we suggest investing ₹{fmt(calcSIP())}/mo. With a {data.riskAppetite || "moderate"} risk profile, a mix of equity mutual funds and debt instruments is recommended.
      </div>
    </div>
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>NiveshAI</div>
          <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, #6ee7b7, #3b82f6)", borderRadius: 2, margin: "0 auto" }} />
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: "100%", height: 3, borderRadius: 2,
                background: i <= step ? "#6ee7b7" : "rgba(255,255,255,0.06)",
                transition: "background .3s"
              }} />
              <span style={{ fontSize: 10, color: i === step ? "#6ee7b7" : "var(--muted)", letterSpacing: "0.04em" }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Card */}
        <Card style={{ padding: 32 }}>
          {steps[step]}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {step > 0 && (
              <button onClick={() => setStep(p => p - 1)} style={{
                flex: 1, padding: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                borderRadius: 12, color: "var(--muted)", fontWeight: 500, fontSize: 14, transition: "all .2s"
              }}>Back</button>
            )}
            <button onClick={() => step < STEPS.length - 1 ? setStep(p => p + 1) : onComplete(data)} style={{
              flex: 2, padding: "13px", background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
              border: "none", borderRadius: 12, color: "#000", fontWeight: 700, fontSize: 14,
              cursor: "pointer", transition: "opacity .2s"
            }}>
              {step === STEPS.length - 1 ? "View My Dashboard →" : "Continue →"}
            </button>
          </div>
        </Card>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 20, lineHeight: 1.6 }}>
          🔒 Bank-grade encryption · SEBI regulated data · 100% private
        </p>
      </div>
    </div>
  );
}

// ───────────────────────────── DASHBOARD NAV ─────────────────────────────
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "portfolio", label: "Portfolio", icon: "📊" },
  { id: "sip", label: "SIP Tracker", icon: "🔄" },
  { id: "goals", label: "Goals", icon: "🎯" },
  { id: "ai", label: "AI Insights", icon: "✨" },
];

// ───────────────────────────── AI ASSISTANT ──────────────────────────────
function AIInsights({ profile }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${profile.name || "there"}! 👋 I'm your AI financial advisor. I've analyzed your portfolio and I'm ready to provide personalized insights. Ask me anything about your investments, goals, or financial health.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(null);
  const chatRef = useRef(null);

  const QUICK = [
    "How is my portfolio performing?",
    "Should I increase my SIP amount?",
    "Am I on track for retirement?",
    "Suggest diversification ideas",
    "Review my fund selection",
  ];

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const portfolioContext = `User Financial Profile:
- Name: ${profile.name}, Age: ${profile.age}, Occupation: ${profile.occupation}
- Monthly Income: ₹${profile.income}, Expenses: ₹${profile.expenses}, Savings: ₹${profile.savings}
- Risk Appetite: ${profile.riskAppetite}, Goals: ${profile.goals?.join(", ")}

Current Portfolio (Mutual Funds):
${MUTUAL_FUNDS.map(f => `- ${f.name} (${f.category}): Invested ₹${f.invested}, Current ₹${f.current}, XIRR ${f.xirr}%`).join("\n")}

Total Invested: ₹${fmt(MUTUAL_FUNDS.reduce((s, f) => s + f.invested, 0))}
Total Current: ₹${fmt(MUTUAL_FUNDS.reduce((s, f) => s + f.current, 0))}
Net Worth: ₹11.2L (including bank, stocks, insurance)

You are NiveshAI, a friendly Indian financial advisor. Give concise, actionable advice in simple language. Use Indian financial context (SIP, ELSS, PPF, etc.). Format responses with emojis and bullet points for clarity. Keep responses under 200 words.`;

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: portfolioContext,
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again.";
      setMessages(p => [...p, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(p => [...p, { role: "assistant", content: "⚠️ Unable to connect to AI. Please check your connection and try again." }]);
    }
    setLoading(false);
    setQuickLoading(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)", maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "0 0 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #6ee7b7, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✨</div>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 18 }}>AI Financial Advisor</h2>
            <p style={{ color: "var(--muted)", fontSize: 12 }}>Powered by Claude · Personalized for your portfolio</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <Badge color="#10b981">Online</Badge>
          </div>
        </div>
      </div>

      {/* Quick prompts */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {QUICK.map((q, i) => (
          <button key={q} onClick={() => { setQuickLoading(i); sendMessage(q); }} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
            borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "var(--muted)",
            cursor: "pointer", transition: "all .2s",
            opacity: quickLoading === i ? 0.5 : 1
          }}>{q}</button>
        ))}
      </div>

      {/* Chat */}
      <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "8px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
            {m.role === "assistant" && (
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6ee7b7, #3b82f6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✨</div>
            )}
            <div style={{
              maxWidth: "72%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              background: m.role === "user" ? "rgba(110,231,183,0.12)" : "var(--card)",
              border: `1px solid ${m.role === "user" ? "rgba(110,231,183,0.2)" : "var(--border)"}`,
              fontSize: 13, lineHeight: 1.65, color: "var(--text)", whiteSpace: "pre-wrap"
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6ee7b7, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center" }}>✨</div>
            <div style={{ padding: "14px 18px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "4px 16px 16px 16px", display: "flex", gap: 4 }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6ee7b7", animation: `pulse 1.2s ${j * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ paddingTop: 16, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about your portfolio, goals, or investments..."
            style={{ flex: 1, padding: "13px 16px" }}
          />
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{
            padding: "0 20px", background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
            border: "none", borderRadius: 12, color: "#000", fontWeight: 700, fontSize: 16,
            cursor: "pointer", opacity: (!input.trim() || loading) ? 0.5 : 1, flexShrink: 0
          }}>→</button>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:1;transform:scale(1.3)} }`}</style>
    </div>
  );
}

// ───────────────────────────── OVERVIEW TAB ──────────────────────────────
function Overview({ profile }) {
  const totalInvested = MUTUAL_FUNDS.reduce((s, f) => s + f.invested, 0);
  const totalCurrent = MUTUAL_FUNDS.reduce((s, f) => s + f.current, 0);
  const totalAssets = ASSET_DATA.reduce((s, a) => s + a.value, 0);
  const gain = totalCurrent - totalInvested;
  const gainPct = ((gain / totalInvested) * 100).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Welcome */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            Welcome back, {profile.name || "Investor"} 👋
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>Here's your financial snapshot · Updated just now</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>Net Worth</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#6ee7b7", letterSpacing: "-0.02em" }}>{fmtL(totalAssets)}</div>
          <div style={{ fontSize: 11, color: "#10b981" }}>+{gainPct}% overall</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total Invested" value={fmtL(totalInvested)} sub="Mutual Funds" icon="💰" color="#6ee7b7" />
        <StatCard label="Current Value" value={fmtL(totalCurrent)} sub={`+₹${fmtL(gain)}`} icon="📈" color="#60a5fa" />
        <StatCard label="Monthly SIP" value="₹15,000" sub="5 active SIPs" icon="🔄" color="#a78bfa" />
        <StatCard label="Goals Active" value={GOALS.length.toString()} sub="2 on track" icon="🎯" color="#f59e0b" />
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Net Worth Chart */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Net Worth Growth</h3>
              <p style={{ fontSize: 12, color: "var(--muted)" }}>Past 2 years</p>
            </div>
            <Badge color="#6ee7b7">+115.6%</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={NET_WORTH_DATA}>
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip formatter={(v) => [`₹${fmtL(v)}`, "Net Worth"]} contentStyle={{ background: "#1c2028", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#6ee7b7" strokeWidth={2} fill="url(#nwGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Asset Allocation</h3>
          <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>By asset class</p>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie data={ASSET_DATA} innerRadius={36} outerRadius={56} dataKey="value" strokeWidth={0}>
                {ASSET_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {ASSET_DATA.map(a => (
              <div key={a.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: a.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{a.name}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: a.color }}>{((a.value / totalAssets) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Goals Overview */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>Goal Progress</h3>
          <Badge color="#f59e0b">4 Goals</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {GOALS.map(g => (
            <div key={g.name} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 14, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{g.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</span>
                </div>
                <span style={{ fontSize: 11, color: g.color, fontWeight: 600 }}>{g.progress}%</span>
              </div>
              <ProgressBar value={g.progress} color={g.color} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "var(--muted)" }}>
                <span>{fmtL(g.current)}</span>
                <span>Target: {fmtL(g.target)}</span>
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>⏱ {g.timeline} remaining</div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insight Banner */}
      <div style={{ background: "linear-gradient(135deg, rgba(110,231,183,0.08), rgba(59,130,246,0.08))", border: "1px solid rgba(110,231,183,0.2)", borderRadius: 14, padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div style={{ fontSize: 22 }}>✨</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#6ee7b7", marginBottom: 4 }}>AI Insight of the Day</div>
          <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>
            Your portfolio is <strong>heavily concentrated in large-cap funds (68%)</strong>. Adding 15–20% mid-cap exposure via a quality mid-cap fund could improve long-term returns. Your current XIRR of <strong>18.2%</strong> outperforms the benchmark by 4.2%.
          </div>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── PORTFOLIO TAB ─────────────────────────────
function Portfolio() {
  const [filter, setFilter] = useState("All");
  const cats = ["All", "Large Cap", "Flexi Cap", "Mid Cap", "Liquid", "Small Cap"];
  const filtered = filter === "All" ? MUTUAL_FUNDS : MUTUAL_FUNDS.filter(f => f.category === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Total Invested" value={`₹${fmtL(MUTUAL_FUNDS.reduce((s, f) => s + f.invested, 0))}`} icon="💸" color="#6ee7b7" />
        <StatCard label="Current Value" value={`₹${fmtL(MUTUAL_FUNDS.reduce((s, f) => s + f.current, 0))}`} icon="📊" color="#60a5fa" />
        <StatCard label="Total Returns" value={`+${pct(MUTUAL_FUNDS.reduce((s, f) => s + f.invested, 0), MUTUAL_FUNDS.reduce((s, f) => s + f.current, 0))}%`} sub="Overall" icon="📈" color="#10b981" />
      </div>

      {/* Sector allocation */}
      <Card>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Sector Allocation</h3>
            <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>Portfolio distribution by sector</p>
            {SECTOR_DATA.map((s, i) => {
              const colors = ["#6ee7b7", "#60a5fa", "#a78bfa", "#f59e0b", "#f87171", "#94a3b8"];
              return (
                <div key={s.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: "var(--muted)" }}>{s.name}</span>
                    <span style={{ color: colors[i], fontWeight: 600 }}>{s.value}%</span>
                  </div>
                  <ProgressBar value={s.value} color={colors[i]} height={5} />
                </div>
              );
            })}
          </div>
          <div style={{ width: 160 }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={SECTOR_DATA} innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {SECTOR_DATA.map((_, i) => {
                    const colors = ["#6ee7b7", "#60a5fa", "#a78bfa", "#f59e0b", "#f87171", "#94a3b8"];
                    return <Cell key={i} fill={colors[i]} />;
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Fund Filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {cats.map(c => <Pill key={c} active={filter === c} onClick={() => setFilter(c)}>{c}</Pill>)}
      </div>

      {/* Fund List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(f => {
          const gain = f.current - f.invested;
          const gainPct = pct(f.invested, f.current);
          const isPos = gain > 0;
          return (
            <Card key={f.name} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{f.name}</span>
                    <Badge color="#6b7280">{f.category}</Badge>
                    <Badge color="#60a5fa">{f.amc}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    Goal: {f.goal} · {f.units.toLocaleString()} units · NAV: ₹{f.nav}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: isPos ? "#10b981" : "#ef4444" }}>
                    ₹{fmt(f.current)}
                  </div>
                  <div style={{ fontSize: 12, color: isPos ? "#10b981" : "#ef4444" }}>
                    {isPos ? "+" : ""}₹{fmt(gain)} ({gainPct}%)
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>Invested</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>₹{fmt(f.invested)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>XIRR</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: f.xirr > 12 ? "#10b981" : "#f59e0b" }}>{f.xirr}%</div>
                </div>
                {f.sipDate && (
                  <div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>Next SIP</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa" }}>{f.sipDate}th</div>
                  </div>
                )}
                <div style={{ marginLeft: "auto" }}>
                  <ProgressBar value={Math.min((f.current / (f.invested * 2)) * 100, 100)} color={isPos ? "#10b981" : "#ef4444"} height={4} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ───────────────────────────── SIP TRACKER ───────────────────────────────
function SIPTracker() {
  const activeSIPs = MUTUAL_FUNDS.filter(f => f.sipDate);
  const today = new Date().getDate();
  const totalSIP = 15000;

  const upcoming = activeSIPs
    .map(f => ({ ...f, daysLeft: f.sipDate >= today ? f.sipDate - today : 30 - today + f.sipDate }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Monthly SIP" value={`₹${fmt(totalSIP)}`} sub="Committed per month" icon="🔄" color="#a78bfa" />
        <StatCard label="Active SIPs" value={activeSIPs.length.toString()} sub="Across funds" icon="✅" color="#6ee7b7" />
        <StatCard label="YTD SIP" value="₹1.35L" sub="This year invested" icon="📅" color="#60a5fa" />
      </div>

      {/* SIP Projection */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>SIP Growth Projection</h3>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>Assuming 14% CAGR · Monthly SIP ₹15,000</p>
          </div>
          <Badge color="#a78bfa">5yr outlook</Badge>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={SIP_PROJECTION} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
            <Tooltip formatter={v => [`₹${fmtL(v)}`, "Projected Corpus"]} contentStyle={{ background: "#1c2028", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="corpus" fill="#a78bfa" radius={[6, 6, 0, 0]} opacity={0.9} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Upcoming SIPs */}
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Upcoming SIP Dates</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {upcoming.map(f => (
            <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: f.daysLeft <= 3 ? "rgba(239,68,68,0.15)" : "rgba(167,139,250,0.15)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: f.daysLeft <= 3 ? "#ef4444" : "#a78bfa" }}>{f.sipDate}</span>
                <span style={{ fontSize: 9, color: "var(--muted)" }}>every mo</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{f.name}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Goal: {f.goal} · {f.category}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa" }}>₹3,000</div>
                <div style={{ fontSize: 11, color: f.daysLeft === 0 ? "#ef4444" : "var(--muted)" }}>
                  {f.daysLeft === 0 ? "Today!" : `in ${f.daysLeft}d`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SIP vs Lumpsum */}
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Invested vs Market Value Over Time</h3>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>SIP investment compounding effect</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={[
            { m: "Jan", invested: 120000, value: 133000 },
            { m: "Mar", invested: 150000, value: 171000 },
            { m: "May", invested: 180000, value: 212000 },
            { m: "Jul", invested: 210000, value: 256000 },
            { m: "Sep", invested: 240000, value: 302000 },
            { m: "Nov", invested: 270000, value: 358000 },
            { m: "Now", invested: 300000, value: 641100 },
          ]}>
            <defs>
              <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
            <Tooltip contentStyle={{ background: "#1c2028", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="invested" stroke="#60a5fa" fill="url(#invGrad)" strokeWidth={1.5} name="Invested" />
            <Area type="monotone" dataKey="value" stroke="#6ee7b7" fill="url(#valGrad)" strokeWidth={2} name="Current Value" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ───────────────────────────── GOALS TAB ─────────────────────────────────
function Goals() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Goal-Based Planning</h2>
        <button style={{ background: "rgba(110,231,183,0.1)", border: "1px solid rgba(110,231,183,0.2)", borderRadius: 10, padding: "8px 16px", color: "#6ee7b7", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add Goal</button>
      </div>

      {GOALS.map(g => {
        const yearsLeft = parseInt(g.timeline);
        const monthlyNeeded = Math.round((g.target - g.current) / (yearsLeft * 12));
        const onTrack = g.progress > 2;

        return (
          <Card key={g.name} style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: `${g.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                  {g.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{g.name}</h3>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Target: {fmtL(g.target)} · {g.timeline} remaining</div>
                </div>
              </div>
              <Badge color={onTrack ? "#10b981" : "#f59e0b"}>{onTrack ? "On Track" : "Needs Attention"}</Badge>
            </div>

            {/* Progress */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
                <span style={{ color: "var(--muted)" }}>Progress to goal</span>
                <span style={{ color: g.color, fontWeight: 600 }}>{g.progress}%</span>
              </div>
              <ProgressBar value={g.progress} color={g.color} height={8} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "var(--muted)" }}>
                <span>{fmtL(g.current)} saved</span>
                <span>₹{fmtL(g.target - g.current)} remaining</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "Current Corpus", value: fmtL(g.current), color: g.color },
                { label: "Monthly SIP Needed", value: `₹${fmt(monthlyNeeded)}`, color: "#60a5fa" },
                { label: "Projected at Goal", value: fmtL(g.target * 0.95), color: "#10b981" },
              ].map(s => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 12px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {/* SIP Projection Chart */}
      <Card>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Goal Corpus Projection</h3>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Expected corpus at each goal's timeline (12% CAGR)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={GOALS.map(g => ({ name: g.name, current: g.current, required: g.target }))} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
            <Tooltip formatter={v => [`₹${fmtL(v)}`]} contentStyle={{ background: "#1c2028", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#6b7280" }} />
            <Bar dataKey="current" name="Saved" fill="#6ee7b7" radius={[4, 4, 0, 0]} opacity={0.9} />
            <Bar dataKey="required" name="Target" fill="#60a5fa" radius={[4, 4, 0, 0]} opacity={0.3} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ───────────────────────────── MAIN DASHBOARD ────────────────────────────
function Dashboard({ profile }) {
  const [activeTab, setActiveTab] = useState("overview");

  const content = {
    overview: <Overview profile={profile} />,
    portfolio: <Portfolio />,
    sip: <SIPTracker />,
    goals: <Goals />,
    ai: <AIInsights profile={profile} />,
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 64, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 4, flexShrink: 0 }}>
        {/* Logo mark */}
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6ee7b7, #3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, fontSize: 16 }}>N</div>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} title={item.label} style={{
            width: 44, height: 44, borderRadius: 12, border: "none", cursor: "pointer",
            background: activeTab === item.id ? "rgba(110,231,183,0.15)" : "transparent",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
            transition: "all .2s", fontSize: 18
          }}>
            <span>{item.icon}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
          {(profile.name || "U")[0].toUpperCase()}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Top bar */}
        <div style={{ height: 60, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 28px", justifyContent: "space-between", background: "var(--surface)", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 600 }}>
              {NAV_ITEMS.find(n => n.id === activeTab)?.icon}&nbsp;
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", background: "rgba(110,231,183,0.06)", border: "1px solid rgba(110,231,183,0.15)", borderRadius: 8, padding: "5px 12px" }}>
              🟢 Finvu Connected
            </div>
            <button style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 12px", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>
              🔔 Alerts
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: 28, maxWidth: 1100, margin: "0 auto" }}>
          {content[activeTab]}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────── ROOT ──────────────────────────────────────
export default function App() {
  const [profile, setProfile] = useState(null);
  const [showDemo, setShowDemo] = useState(false);

  if (!profile && !showDemo) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 520, textAlign: "center" }}>
            <div style={{ fontSize: 13, letterSpacing: "0.2em", color: "#6ee7b7", textTransform: "uppercase", marginBottom: 24 }}>NiveshAI</div>
            <h1 style={{ fontSize: 44, fontWeight: 800, lineHeight: 1.1, marginBottom: 16, background: "linear-gradient(135deg, #f0f0f0, #6ee7b7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Your AI<br/>Financial Planner
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.7, marginBottom: 36, maxWidth: 400, margin: "0 auto 36px" }}>
              Plan goals, track SIPs, analyse your portfolio and get AI-powered insights — all in one place.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => setShowDemo(true)} style={{
                padding: "14px 32px", background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
                border: "none", borderRadius: 14, color: "#000", fontWeight: 700, fontSize: 15, cursor: "pointer"
              }}>Try Demo Dashboard →</button>
              <button onClick={() => setProfile({})} style={{
                padding: "14px 32px", background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)", borderRadius: 14, color: "var(--text)", fontWeight: 600, fontSize: 15, cursor: "pointer"
              }}>Start Onboarding</button>
            </div>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
              {["🔒 Bank-grade security", "🇮🇳 Built for India", "✨ AI-powered insights", "📊 Finvu AA connected"].map(f => (
                <span key={f} style={{ fontSize: 12, color: "var(--muted)" }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showDemo) {
    return (
      <>
        <style>{css}</style>
        <Dashboard profile={{ name: "Rahul Sharma", age: "32", occupation: "Salaried - Private", income: "150000", expenses: "80000", savings: "500000", riskAppetite: "moderate", goals: ["retirement", "education", "wealth", "emergency"] }} />
      </>
    );
  }

  if (profile && !profile.name) {
    return (
      <>
        <style>{css}</style>
        <Onboarding onComplete={(data) => setProfile(data)} />
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <Dashboard profile={profile} />
    </>
  );
}
