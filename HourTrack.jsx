// Version: v1.5
import { useState, useMemo, useCallback, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from "recharts";
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// SUPABASE CONNECTION
// ─────────────────────────────────────────────
const supabaseUrl = 'https://ynjtvjhmgamcgqbykkmb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InluanR2amhtZ2FtY2dxYnlra21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjQwMTIsImV4cCI6MjA4NzA0MDAxMn0.lyDIefF-u3TeIrb6k_fqiovmKKVztKbHUZVHcW3Z6go';
const supabase = createClient(supabaseUrl, supabaseKey);

// ─────────────────────────────────────────────
// UTILITIES & STYLES
// ─────────────────────────────────────────────
function fmtMonth(m) {
  const d = new Date(m + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function calcAccumulated(asset, currentRaw) {
  if (!asset) return 0;
  return (asset.reset_count * asset.meter_max_value) + Number(asset.stuck_reading) + (Number(currentRaw) || 0);
}

const S = {
  badge: (v) => {
    const map = { OK: "bg-emerald-900/60 text-emerald-300 border-emerald-700", WARNING: "bg-amber-900/60 text-amber-300 border-amber-700", CRITICAL: "bg-red-900/60 text-red-300 border-red-700", PENDING: "bg-zinc-800 text-zinc-500 border-zinc-700" };
    return `text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${map[v] || map.PENDING}`;
  },
  input: "bg-zinc-900 border border-zinc-700 text-zinc-100 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-500 w-full",
  btn: "px-4 py-2 rounded text-sm font-semibold tracking-wide transition-all disabled:opacity-50",
  btnPrimary: "bg-amber-500 hover:bg-amber-400 text-zinc-950",
  btnSecondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700",
  card: "bg-zinc-900 border border-zinc-800 rounded-lg p-5",
  th: "px-3 py-2 text-left text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest",
  td: "px-3 py-2 text-sm font-mono text-zinc-300 border-t border-zinc-800/60",
};

const Icon = {
  Dashboard: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Asset: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>,
  Entry: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1.01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  Replace: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
  Report: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  Audit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>,
  Lock: () => <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
};

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [assets, setAssets] = useState([]);
  const [readings, setReadings] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [closedMonths, setClosedMonths] = useState(new Set());
  
  const [view, setView] = useState("dashboard");
  const [role, setRole] = useState("admin"); 
  const [notification, setNotification] = useState(null);

  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const currentMonth = months[months.length - 1];

  const notify = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const addAudit = useCallback(async (user, action, entity, entity_id, detail) => {
    const newLog = { 
      user_name: user, 
      action, 
      entity, 
      record_id: entity_id, 
      details: detail 
    };
    await supabase.from('audit_logs').insert([newLog]);
    // Refresh audit log locally
    const { data } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(50);
    if (data) setAuditLog(data);
  }, []);

  const loadData = async () => {
    const { data: a } = await supabase.from('assets').select('*');
    const { data: r } = await supabase.from('monthly_readings').select('*');
    const { data: rep } = await supabase.from('replacement_logs').select('*');
    const { data: au } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
    
    if (a) setAssets(a);
    if (r) setReadings(r.map(rd => ({...rd, month: rd.month_date, validation: rd.validation_status})));
    if (rep) setReplacements(rep);
    if (au) setAuditLog(au);
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const active = assets.length;
    const warns = readings.filter(r => r.month === currentMonth && r.validation === "WARNING").length;
    const crits = readings.filter(r => r.month === currentMonth && r.validation === "CRITICAL").length;
    return { total: active, warnings: warns, criticals: crits };
  }, [assets, readings, currentMonth]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-mono">
      <header className="border-b border-zinc-800 bg-zinc-950/95 sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-zinc-950 font-bold">HT</div>
            <div>
              <div className="text-sm font-bold text-amber-400 uppercase tracking-tighter">HourTrack v1.5</div>
              <div className="text-[9px] text-zinc-600 uppercase">Production Runtime System</div>
            </div>
          </div>
          <select value={role} onChange={e => setRole(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-amber-400 text-xs rounded px-2 py-1">
            <option value="admin">Admin</option>
            <option value="engineer">Engineer</option>
          </select>
        </div>
        <nav className="flex px-6 gap-4">
          {[
            { id: "dashboard", icon: Icon.Dashboard, label: "Dashboard" },
            { id: "entry", icon: Icon.Entry, label: "Entry" },
            { id: "assets", icon: Icon.Asset, label: "Assets" },
            { id: "replacements", icon: Icon.Replace, label: "Resets" },
            { id: "reports", icon: Icon.Report, label: "Reports" },
            { id: "audit", icon: Icon.Audit, label: "Audit" },
          ].map(n => (
            <button key={n.id} onClick={() => setView(n.id)} className={`flex items-center gap-2 py-3 text-[10px] uppercase tracking-widest border-b-2 transition-all ${view === n.id ? "border-amber-500 text-amber-400" : "border-transparent text-zinc-500"}`}>
              <n.icon /> {n.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {notification && <div className="fixed top-20 right-6 bg-zinc-800 border border-amber-500 p-4 rounded z-50 shadow-2xl">{notification.msg}</div>}
        
        {view === "dashboard" && <Dashboard stats={stats} assets={assets} readings={readings} currentMonth={currentMonth} setView={setView} />}
        {view === "entry" && <MonthlyEntry assets={assets} readings={readings} months={months} currentMonth={currentMonth} role={role} notify={notify} addAudit={addAudit} refresh={loadData} />}
        {view === "assets" && <AssetList assets={assets} />}
        {view === "replacements" && <Replacements assets={assets} role={role} notify={notify} addAudit={addAudit} refresh={loadData} />}
        {view === "reports" && <Reports assets={assets} readings={readings} months={months} />}
        {view === "audit" && <AuditLog logs={auditLog} />}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function Dashboard({ stats, assets, readings, currentMonth, setView }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={S.card}>
          <div className="text-[10px] text-zinc-500 uppercase">Active Machines</div>
          <div className="text-3xl font-bold text-amber-400">{stats.total}</div>
        </div>
        <div className={S.card + (stats.warnings > 0 ? " border-amber-700" : "")}>
          <div className="text-[10px] text-zinc-500 uppercase">Warnings</div>
          <div className="text-3xl font-bold text-amber-300">{stats.warnings}</div>
        </div>
        <div className={S.card + (stats.criticals > 0 ? " border-red-700" : "")}>
          <div className="text-[10px] text-zinc-500 uppercase">Critical</div>
          <div className="text-3xl font-bold text-red-500">{stats.criticals}</div>
        </div>
      </div>
      
      <div className={S.card}>
        <h3 className="text-xs font-bold uppercase mb-4 text-zinc-400">Current Readings — {fmtMonth(currentMonth)}</h3>
        <table className="w-full">
          <thead><tr><th className={S.th}>Asset</th><th className={S.th}>Raw Reading</th><th className={S.th}>Accumulated Total</th><th className={S.th}>Status</th></tr></thead>
          <tbody>
            {assets.map(a => {
              const r = readings.find(rd => rd.asset_id === a.id && rd.month === currentMonth);
              return (
                <tr key={a.id}>
                  <td className={S.td}>{a.id}</td>
                  <td className={S.td}>{r?.raw_meter_reading || "---"}</td>
                  <td className={S.td + " font-bold text-amber-500"}>{calcAccumulated(a, r?.raw_meter_reading).toLocaleString()}h</td>
                  <td className={S.td}><span className={S.badge(r?.validation)}> {r?.validation || "MISSING"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthlyEntry({ assets, readings, months, currentMonth, role, notify, addAudit, refresh }) {
  const [targetMonth, setTargetMonth] = useState(currentMonth);

  const saveReading = async (assetId, val) => {
    const raw = parseFloat(val);
    if (isNaN(raw)) return;

    const asset = assets.find(a => a.id === assetId);
    let status = "OK";
    
    // Simple Validation
    const prev = readings.filter(r => r.asset_id === assetId && r.month < targetMonth).sort((a,b) => b.month.localeCompare(a.month))[0];
    if (prev && raw < prev.raw_meter_reading) status = "CRITICAL";
    else if (prev && (raw - prev.raw_meter_reading) > asset.threshold_hours) status = "WARNING";

    const { error } = await supabase.from('monthly_readings').upsert({
      asset_id: assetId,
      month_date: targetMonth,
      raw_meter_reading: raw,
      validation_status: status
    }, { onConflict: 'asset_id, month_date' });

    if (!error) {
      notify(`Saved ${assetId}`, "success");
      addAudit(role, "ENTRY", "Reading", assetId, `New reading: ${raw}`);
      refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold uppercase italic">Monthly Log</h2>
        <select value={targetMonth} onChange={e => setTargetMonth(e.target.value)} className={S.input + " w-48"}>
          {months.map(m => <option key={m} value={m}>{fmtMonth(m)}</option>)}
        </select>
      </div>
      <div className={S.card}>
        <table className="w-full">
          <thead><tr><th className={S.th}>Asset</th><th className={S.th}>Last Reading</th><th className={S.th}>New Value</th></tr></thead>
          <tbody>
            {assets.map(a => {
              const current = readings.find(r => r.asset_id === a.id && r.month === targetMonth);
              return (
                <tr key={a.id}>
                  <td className={S.td}>{a.id}<div className="text-[10px] text-zinc-500">{a.name}</div></td>
                  <td className={S.td + " text-zinc-500"}>
                    {readings.filter(r => r.asset_id === a.id && r.month < targetMonth).sort((a,b) => b.month.localeCompare(a.month))[0]?.raw_meter_reading || 0}
                  </td>
                  <td className={S.td}>
                    <input type="number" defaultValue={current?.raw_meter_reading || ""} onBlur={e => saveReading(a.id, e.target.value)} className={S.input + " h-8 py-0 w-32"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Replacements({ assets, role, notify, addAudit, refresh }) {
  const [selected, setSelected] = useState("");
  const [final, setFinal] = useState("");

  const handleReset = async () => {
    const asset = assets.find(a => a.id === selected);
    const newStuck = Number(asset.stuck_reading) + Number(final);
    const newReset = asset.reset_count + 1;

    const { error: aErr } = await supabase.from('assets').update({ stuck_reading: newStuck, reset_count: newReset }).eq('id', selected);
    await supabase.from('replacement_logs').insert([{ asset_id: selected, last_stuck_reading: asset.stuck_reading, new_reset_count: newReset, notes: `Manual reset at ${final}h` }]);
    
    if (!aErr) {
      addAudit(role, "RESET", "Asset", selected, `Hardware swap. New Offset: ${newStuck}`);
      notify("Meter reset successful", "success");
      setFinal("");
      refresh();
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className={S.card}>
        <h2 className="text-lg font-bold text-amber-500 mb-4 uppercase">Meter Hardware Swap</h2>
        <div className="space-y-4">
          <div><label className="text-[10px] text-zinc-500 uppercase">1. Select Asset</label>
          <select value={selected} onChange={e => setSelected(e.target.value)} className={S.input}>
            <option value="">Choose...</option>
            {assets.map(a => <option key={a.id} value={a.id}>{a.id} - {a.name}</option>)}
          </select></div>
          <div><label className="text-[10px] text-zinc-500 uppercase">2. Final Reading on Old Meter</label>
          <input type="number" value={final} onChange={e => setFinal(e.target.value)} className={S.input} /></div>
          <button onClick={handleReset} disabled={!selected || !final} className={S.btn + " " + S.btnPrimary + " w-full mt-4"}>Execute Reset</button>
        </div>
      </div>
    </div>
  );
}

function Reports({ assets, readings, months }) {
  const chartData = months.map(m => {
    const obj = { month: fmtMonth(m) };
    assets.forEach(a => {
      const r = readings.find(rd => rd.asset_id === a.id && rd.month === m);
      obj[a.id] = calcAccumulated(a, r?.raw_meter_reading);
    });
    return obj;
  });

  return (
    <div className="space-y-6">
      <div className={S.card}>
        <h2 className="text-xs font-bold uppercase mb-6 text-zinc-400">Total Accumulated Runtime Trend</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="month" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={10} />
              <Tooltip contentStyle={{backgroundColor: '#18181b', border: '1px solid #3f3f46'}} />
              <Legend />
              {assets.map((a, i) => (
                <Line key={a.id} type="monotone" dataKey={a.id} stroke={i === 0 ? "#f59e0b" : i === 1 ? "#10b981" : "#3b82f6"} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AssetList({ assets }) {
  return (
    <div className={S.card}>
      <h2 className="text-xs font-bold uppercase mb-4 text-zinc-400">Inventory</h2>
      <table className="w-full">
        <thead><tr><th className={S.th}>ID</th><th className={S.th}>Name</th><th className={S.th}>Location</th><th className={S.th}>Resets</th></tr></thead>
        <tbody>
          {assets.map(a => (
            <tr key={a.id}>
              <td className={S.td}>{a.id}</td>
              <td className={S.td}>{a.name}</td>
              <td className={S.td}>{a.location}</td>
              <td className={S.td}>{a.reset_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditLog({ logs }) {
  return (
    <div className={S.card}>
      <h2 className="text-xs font-bold uppercase mb-4 text-zinc-400">System Audit Trail</h2>
      <div className="overflow-y-auto max-h-[600px]">
        <table className="w-full">
          <thead><tr><th className={S.th}>Time</th><th className={S.th}>User</th><th className={S.th}>Action</th><th className={S.th}>Detail</th></tr></thead>
          <tbody>
            {logs.map(l => (
              <tr key={l.id}>
                <td className={S.td + " text-[10px] text-zinc-500"}>{new Date(l.timestamp).toLocaleString()}</td>
                <td className={S.td}>{l.user_name}</td>
                <td className={S.td + " text-amber-500 font-bold"}>{l.action}</td>
                <td className={S.td + " text-xs"}>{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}