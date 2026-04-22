import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar
} from "recharts";

// ── Palette & fonts injected via style tag ──────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        #08090d;
      --surface:   #0f1117;
      --card:      #13161f;
      --border:    #1e2233;
      --accent:    #00e5a0;
      --accent2:   #6c63ff;
      --accent3:   #ff6b6b;
      --warn:      #ffd166;
      --text:      #e8ecf0;
      --muted:     #5a6480;
      --font-head: 'Space Mono', monospace;
      --font-body: 'DM Sans', sans-serif;
    }

    body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--surface); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: .4; transform: scale(1.5); }
    }
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(18px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scan {
      0%   { background-position: 0% 0%; }
      100% { background-position: 0% 100%; }
    }
    @keyframes countUp {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    .slide-up { animation: slide-up .45s ease both; }
    .slide-up-2 { animation: slide-up .45s .1s ease both; }
    .slide-up-3 { animation: slide-up .45s .2s ease both; }
  `}</style>
);

// ── Fake data generators ────────────────────────────────────────────────────
const genAccuracy = () =>
  Array.from({ length: 30 }, (_, i) => ({
    epoch: i + 1,
    train: +(72 + Math.random() * 2 + i * 0.5).toFixed(2),
    val:   +(68 + Math.random() * 3 + i * 0.55).toFixed(2),
  }));

const genLoss = () =>
  Array.from({ length: 30 }, (_, i) => ({
    epoch: i + 1,
    train: +(1.8 - i * 0.055 + Math.random() * 0.08).toFixed(3),
    val:   +(2.1 - i * 0.058 + Math.random() * 0.12).toFixed(3),
  }));

const genPredictions = () =>
  Array.from({ length: 60 }, (_, i) => ({
    idx: i,
    actual:    +(Math.sin(i / 6) * 40 + 60 + Math.random() * 8).toFixed(2),
    predicted: +(Math.sin(i / 6) * 40 + 60 + (Math.random() - 0.5) * 6).toFixed(2),
  }));

const genFeatureImportance = () =>
  ["Revenue", "Sessions", "Churn Rate", "Avg Order", "DAU", "LTV", "NPS", "Retention"]
    .map(f => ({ feature: f, importance: +(Math.random() * 0.35 + 0.05).toFixed(3) }))
    .sort((a, b) => b.importance - a.importance);

const genConfusion = () => ({
  tp: Math.floor(Math.random() * 200 + 700),
  tn: Math.floor(Math.random() * 150 + 680),
  fp: Math.floor(Math.random() * 60 + 40),
  fn: Math.floor(Math.random() * 50 + 30),
});

const genDataPipeline = () =>
  Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
    processed: Math.floor(Math.random() * 8000 + 42000),
    anomalies:  Math.floor(Math.random() * 300 + 50),
  }));

const genLiveStream = (prev = []) => {
  const last = prev.length ? prev[prev.length - 1].value : 50;
  const next = Math.max(10, Math.min(95, last + (Math.random() - 0.49) * 6));
  const arr = [...prev, { t: Date.now(), value: +next.toFixed(1) }];
  return arr.slice(-40);
};

// ── Subcomponents ────────────────────────────────────────────────────────────
const Dot = ({ color = "var(--accent)" }) => (
  <span style={{
    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
    background: color, animation: "pulse-dot 1.6s ease-in-out infinite",
    marginRight: 6
  }} />
);

const KpiCard = ({ label, value, sub, color = "var(--accent)", icon, delay = 0 }) => (
  <div className="slide-up" style={{
    animationDelay: `${delay}s`,
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: 12, padding: "20px 22px", flex: 1, minWidth: 160,
    borderTop: `2px solid ${color}`, position: "relative", overflow: "hidden"
  }}>
    <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
    <div style={{
      fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700,
      color, letterSpacing: "-1px"
    }}>{value}</div>
    <div style={{ fontSize: 12, color: "var(--text)", marginTop: 2, fontWeight: 500 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
    <div style={{
      position: "absolute", right: -14, top: -14,
      width: 70, height: 70, borderRadius: "50%",
      background: color, opacity: .05
    }} />
  </div>
);

const SectionHeader = ({ children, live }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    fontFamily: "var(--font-head)", fontSize: 12, color: "var(--muted)",
    letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14
  }}>
    {live && <Dot />}
    {children}
    <div style={{ flex: 1, height: 1, background: "var(--border)", marginLeft: 8 }} />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#0f1117", border: "1px solid var(--border)",
      borderRadius: 8, padding: "10px 14px", fontSize: 12, fontFamily: "var(--font-head)"
    }}>
      <div style={{ color: "var(--muted)", marginBottom: 4 }}>Epoch {label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [accuracy]    = useState(genAccuracy);
  const [loss]        = useState(genLoss);
  const [predictions] = useState(genPredictions);
  const [features]    = useState(genFeatureImportance);
  const [confusion]   = useState(genConfusion);
  const [pipeline]    = useState(genDataPipeline);
  const [live, setLive] = useState(() => genLiveStream([]));
  const [tab, setTab]   = useState("overview");
  const [running, setRunning] = useState(true);
  const [records, setRecords] = useState(50234);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLive(prev => genLiveStream(prev));
      setRecords(r => r + Math.floor(Math.random() * 12));
    }, 900);
    return () => clearInterval(id);
  }, [running]);

  const { tp, tn, fp, fn } = confusion;
  const precision = (tp / (tp + fp) * 100).toFixed(1);
  const recall    = (tp / (tp + fn) * 100).toFixed(1);
  const f1        = (2 * precision * recall / (+precision + +recall)).toFixed(1);
  const accu      = ((tp + tn) / (tp + tn + fp + fn) * 100).toFixed(1);

  const tabs = ["overview", "training", "predictions", "pipeline"];

  return (
    <>
      <GlobalStyle />
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "24px 28px", maxWidth: 1300, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{
              fontFamily: "var(--font-head)", fontSize: 11,
              color: "var(--accent)", letterSpacing: "0.18em",
              textTransform: "uppercase", marginBottom: 6
            }}>
              <Dot /> System Online — TensorFlow 2.x · Scikit-learn · Flask API
            </div>
            <h1 style={{
              fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 700,
              color: "var(--text)", letterSpacing: "-1.5px", lineHeight: 1.1
            }}>
              Predictive Analytics<br />
              <span style={{ color: "var(--accent)" }}>Intelligence System</span>
            </h1>
            <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 8, maxWidth: 420 }}>
              End-to-end ML pipeline · 87% accuracy · 50K+ records · Docker deployed
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => setRunning(r => !r)}
              style={{
                background: running ? "rgba(0,229,160,.12)" : "rgba(255,107,107,.12)",
                border: `1px solid ${running ? "var(--accent)" : "var(--accent3)"}`,
                color: running ? "var(--accent)" : "var(--accent3)",
                borderRadius: 8, padding: "8px 16px", cursor: "pointer",
                fontFamily: "var(--font-head)", fontSize: 11, letterSpacing: "0.1em"
              }}
            >
              {running ? "⏸ PAUSE" : "▶ RESUME"}
            </button>
            <div style={{
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 8, padding: "8px 16px", fontFamily: "var(--font-head)",
              fontSize: 11, color: "var(--muted)"
            }}>
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* ── KPI Row ── */}
        <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          <KpiCard label="Model Accuracy" value="87.3%" sub="On held-out test set" color="var(--accent)" icon="🎯" delay={0} />
          <KpiCard label="F1 Score" value={`${f1}%`} sub="Precision · Recall" color="var(--accent2)" icon="⚡" delay={0.05} />
          <KpiCard label="Records Processed" value={records.toLocaleString()} sub="Live pipeline" color="var(--warn)" icon="📦" delay={0.1} />
          <KpiCard label="API Latency" value="28ms" sub="Flask REST endpoint" color="var(--accent3)" icon="🚀" delay={0.15} />
          <KpiCard label="Docker Uptime" value="99.8%" sub="Cloud deployed" color="#a78bfa" icon="🐳" delay={0.2} />
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border)", paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font-head)", fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: tab === t ? "var(--accent)" : "var(--muted)",
              padding: "10px 18px",
              borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -1, transition: "color .2s"
            }}>
              {t}
            </button>
          ))}
        </div>

        {/* ══ OVERVIEW TAB ══ */}
        {tab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="slide-up">

            {/* Live Inference Stream */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, gridColumn: "1 / -1" }}>
              <SectionHeader live>Live Inference Stream — Real-time Model Output</SectionHeader>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={live}>
                  <defs>
                    <linearGradient id="liveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00e5a0" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#00e5a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e2233" strokeDasharray="3 3" />
                  <XAxis dataKey="t" hide />
                  <YAxis domain={[0, 100]} tick={{ fill: "#5a6480", fontSize: 10 }} width={32} />
                  <Area type="monotone" dataKey="value" stroke="#00e5a0" strokeWidth={2} fill="url(#liveGrad)" dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Confusion Matrix */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <SectionHeader>Confusion Matrix</SectionHeader>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { label: "True Positive", v: tp, c: "var(--accent)" },
                  { label: "False Positive", v: fp, c: "var(--accent3)" },
                  { label: "False Negative", v: fn, c: "var(--warn)" },
                  { label: "True Negative", v: tn, c: "var(--accent2)" },
                ].map(({ label, v, c }) => (
                  <div key={label} style={{
                    background: "var(--surface)", borderRadius: 8, padding: "14px 16px",
                    border: `1px solid ${c}33`
                  }}>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: 22, color: c, fontWeight: 700 }}>{v}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                {[["Precision", precision + "%"], ["Recall", recall + "%"], ["Accuracy", accu + "%"]].map(([k, v]) => (
                  <div key={k} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: 16, color: "var(--text)" }}>{v}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Importance */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <SectionHeader>Feature Importance</SectionHeader>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={features} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="#1e2233" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 0.45]} tick={{ fill: "#5a6480", fontSize: 10 }} />
                  <YAxis type="category" dataKey="feature" tick={{ fill: "#8892a4", fontSize: 11 }} width={72} />
                  <Tooltip
                    contentStyle={{ background: "#0f1117", border: "1px solid #1e2233", borderRadius: 6, fontSize: 11 }}
                    formatter={v => [v, "Importance"]}
                  />
                  <Bar dataKey="importance" fill="var(--accent2)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ══ TRAINING TAB ══ */}
        {tab === "training" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="slide-up">

            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <SectionHeader>Training vs Validation Accuracy</SectionHeader>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={accuracy}>
                  <CartesianGrid stroke="#1e2233" strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" tick={{ fill: "#5a6480", fontSize: 10 }} label={{ value: "Epoch", fill: "#5a6480", fontSize: 10, position: "insideBottom", dy: 10 }} />
                  <YAxis domain={[65, 100]} tick={{ fill: "#5a6480", fontSize: 10 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#8892a4" }} />
                  <Line type="monotone" dataKey="train" stroke="var(--accent)" strokeWidth={2} dot={false} name="Train" />
                  <Line type="monotone" dataKey="val" stroke="var(--accent2)" strokeWidth={2} dot={false} name="Validation" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <SectionHeader>Training vs Validation Loss</SectionHeader>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={loss}>
                  <CartesianGrid stroke="#1e2233" strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" tick={{ fill: "#5a6480", fontSize: 10 }} />
                  <YAxis domain={[0, 2.5]} tick={{ fill: "#5a6480", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#8892a4" }} />
                  <Line type="monotone" dataKey="train" stroke="var(--warn)" strokeWidth={2} dot={false} name="Train Loss" />
                  <Line type="monotone" dataKey="val" stroke="var(--accent3)" strokeWidth={2} dot={false} name="Val Loss" strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Model architecture info */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, gridColumn: "1 / -1" }}>
              <SectionHeader>Model Architecture — TensorFlow Sequential</SectionHeader>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { layer: "Input Layer", shape: "128 neurons", act: "—", params: "0" },
                  { layer: "Dense 1", shape: "256 neurons", act: "ReLU", params: "33,024" },
                  { layer: "Dropout", shape: "rate: 0.3", act: "—", params: "0" },
                  { layer: "Dense 2", shape: "128 neurons", act: "ReLU", params: "32,896" },
                  { layer: "Dense 3", shape: "64 neurons", act: "ReLU", params: "8,256" },
                  { layer: "Output", shape: "1 neuron", act: "Sigmoid", params: "65" },
                ].map(({ layer, shape, act, params }, i) => (
                  <div key={layer} style={{
                    background: "var(--surface)", border: "1px solid var(--border)",
                    borderRadius: 8, padding: "12px 16px", minWidth: 140,
                    borderLeft: `3px solid ${["var(--accent)","var(--accent2)","var(--warn)","var(--accent3)","#a78bfa","var(--accent)"][i]}`
                  }}>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: 11, color: "var(--text)", marginBottom: 4 }}>{layer}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{shape}</div>
                    <div style={{ fontSize: 11, color: "var(--accent2)", marginTop: 4 }}>act: {act}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{params} params</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ PREDICTIONS TAB ══ */}
        {tab === "predictions" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="slide-up">

            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <SectionHeader>Actual vs Predicted Values</SectionHeader>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={predictions}>
                  <CartesianGrid stroke="#1e2233" strokeDasharray="3 3" />
                  <XAxis dataKey="idx" tick={{ fill: "#5a6480", fontSize: 10 }} label={{ value: "Sample Index", fill: "#5a6480", fontSize: 10, position: "insideBottom", dy: 10 }} />
                  <YAxis tick={{ fill: "#5a6480", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #1e2233", borderRadius: 6, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="actual" stroke="var(--accent)" strokeWidth={1.5} dot={false} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="var(--accent2)" strokeWidth={1.5} dot={false} name="Predicted" strokeDasharray="5 2" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <SectionHeader>Residuals (Actual − Predicted)</SectionHeader>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={predictions.slice(0, 40).map(d => ({ ...d, residual: +(d.actual - d.predicted).toFixed(2) }))}>
                  <CartesianGrid stroke="#1e2233" strokeDasharray="3 3" />
                  <XAxis dataKey="idx" tick={{ fill: "#5a6480", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#5a6480", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #1e2233", borderRadius: 6, fontSize: 11 }} />
                  <Bar dataKey="residual" fill="var(--warn)" opacity={0.7} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics table */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <SectionHeader>Regression Metrics</SectionHeader>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  ["MAE", "3.24", "Mean Absolute Error"],
                  ["RMSE", "4.87", "Root Mean Square"],
                  ["R² Score", "0.871", "Coefficient of Det."],
                  ["MAPE", "5.1%", "Mean Abs % Error"],
                ].map(([k, v, sub]) => (
                  <div key={k} style={{ background: "var(--surface)", borderRadius: 8, padding: "14px 16px", border: "1px solid var(--border)" }}>
                    <div style={{ fontFamily: "var(--font-head)", fontSize: 22, color: "var(--accent)", fontWeight: 700 }}>{v}</div>
                    <div style={{ fontSize: 12, color: "var(--text)", marginTop: 2 }}>{k}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ PIPELINE TAB ══ */}
        {tab === "pipeline" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="slide-up">

            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, gridColumn: "1 / -1" }}>
              <SectionHeader live>Monthly Data Pipeline Volume</SectionHeader>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={pipeline}>
                  <CartesianGrid stroke="#1e2233" strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fill: "#5a6480", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#5a6480", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#0f1117", border: "1px solid #1e2233", borderRadius: 6, fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="processed" fill="var(--accent)" radius={[3,3,0,0]} name="Records Processed" />
                  <Bar dataKey="anomalies" fill="var(--accent3)" radius={[3,3,0,0]} name="Anomalies Detected" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pipeline stages */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <SectionHeader>Pipeline Stages</SectionHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { stage: "Data Ingestion", status: "✓", time: "0.8s", color: "var(--accent)" },
                  { stage: "Null Imputation", status: "✓", time: "1.2s", color: "var(--accent)" },
                  { stage: "Feature Scaling", status: "✓", time: "0.4s", color: "var(--accent)" },
                  { stage: "Outlier Removal", status: "✓", time: "0.9s", color: "var(--accent)" },
                  { stage: "Feature Engineering", status: "✓", time: "2.1s", color: "var(--warn)" },
                  { stage: "Model Inference", status: "✓", time: "28ms", color: "var(--accent2)" },
                  { stage: "Response Serialization", status: "✓", time: "3ms", color: "var(--accent2)" },
                ].map(({ stage, status, time, color }) => (
                  <div key={stage} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 14px", background: "var(--surface)", borderRadius: 8,
                    border: "1px solid var(--border)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color, fontFamily: "var(--font-head)", fontSize: 12 }}>{status}</span>
                      <span style={{ fontSize: 13 }}>{stage}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-head)", fontSize: 11, color: "var(--muted)" }}>{time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
              <SectionHeader>Tech Stack & Infrastructure</SectionHeader>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  ["🧠 ML Framework", "TensorFlow 2.x + Scikit-learn", "var(--accent)"],
                  ["🐍 Backend", "Python 3.11 + Flask REST API", "var(--warn)"],
                  ["⚛️ Frontend", "React + Recharts", "var(--accent2)"],
                  ["🐳 Deployment", "Docker + Docker Compose", "var(--accent3)"],
                  ["☁️ Cloud", "AWS EC2 / GCP Cloud Run", "#a78bfa"],
                  ["📦 Data Store", "PostgreSQL + Redis Cache", "var(--accent)"],
                  ["📊 Monitoring", "Prometheus + Grafana", "var(--warn)"],
                ].map(([k, v, c]) => (
                  <div key={k} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "9px 14px", background: "var(--surface)", borderRadius: 8,
                    border: "1px solid var(--border)"
                  }}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{k}</span>
                    <span style={{ fontFamily: "var(--font-head)", fontSize: 11, color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--border)",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 10, color: "var(--muted)", letterSpacing: "0.1em" }}>
            AI PREDICTIVE ANALYTICS SYSTEM v2.4.1
          </div>
          <div style={{ fontFamily: "var(--font-head)", fontSize: 10, color: "var(--muted)", display: "flex", gap: 20 }}>
            <span>MODEL: <span style={{ color: "var(--accent)" }}>ACTIVE</span></span>
            <span>API: <span style={{ color: "var(--accent)" }}>HEALTHY</span></span>
            <span>DB: <span style={{ color: "var(--accent)" }}>CONNECTED</span></span>
          </div>
        </div>
      </div>
    </>
  );
}
