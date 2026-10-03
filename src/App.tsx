import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { calculateRice, formatRiceScore, rankByRice } from "./rice";

type Status = "Backlog" | "In progress" | "Done";
type Tone = "coral" | "lilac" | "sage";
type Feature = {
  id: string;
  name: string;
  description: string;
  reach: number;
  impact: number;
  confidence: number;
  effort: number;
  status: Status;
  tone: Tone;
};

type FeatureDraft = Omit<Feature, "id">;

const statuses: Status[] = ["Backlog", "In progress", "Done"];
const sampleFeatures: Feature[] = [
  { id: "sample-workout-planner", name: "Beginner Workout Planner", description: "Build a first routine that feels easy to stick with.", reach: 600, impact: 2, confidence: 80, effort: 4, status: "Backlog", tone: "coral" },
  { id: "sample-demo-videos", name: "Exercise Demonstration Videos", description: "Make every movement clear, confident, and safe.", reach: 900, impact: 1.5, confidence: 75, effort: 5, status: "Backlog", tone: "lilac" },
  { id: "sample-reminders", name: "Workout Reminder Notifications", description: "A gentle nudge to help good habits take root.", reach: 1200, impact: 0.5, confidence: 90, effort: 2, status: "In progress", tone: "sage" },
];

const emptyDraft: FeatureDraft = {
  name: "",
  description: "",
  reach: 500,
  impact: 1,
  confidence: 80,
  effort: 2,
  status: "Backlog",
  tone: "coral",
};

function formatScore(score: number) {
  return formatRiceScore(score);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}

function App() {
  const [features, setFeatures] = useState<Feature[]>(sampleFeatures);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<FeatureDraft>(emptyDraft);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All statuses" | Status>("All statuses");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dialogMode) return;
    nameRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDialog();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogMode]);

  const rankedFeatures = useMemo(() => rankByRice(features), [features]);
  const visibleFeatures = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rankedFeatures
      .filter(({ item }) => statusFilter === "All statuses" || item.status === statusFilter)
      .filter(({ item }) => !normalizedQuery || `${item.name} ${item.description}`.toLowerCase().includes(normalizedQuery));
  }, [rankedFeatures, query, statusFilter]);

  function openAddDialog() {
    setEditingId(null);
    setDraft(emptyDraft);
    setDialogMode("add");
  }

  function openEditDialog(feature: Feature) {
    setEditingId(feature.id);
    setDraft({ name: feature.name, description: feature.description, reach: feature.reach, impact: feature.impact, confidence: feature.confidence, effort: feature.effort, status: feature.status, tone: feature.tone });
    setDialogMode("edit");
  }

  function closeDialog() {
    setDialogMode(null);
    setEditingId(null);
  }

  function saveFeature(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name || !calculateRice(draft).valid) return;
    const cleanedDraft = { ...draft, name, description: draft.description.trim() || "No description added." };
    if (dialogMode === "edit" && editingId) {
      setFeatures((current) => current.map((feature) => feature.id === editingId ? { ...cleanedDraft, id: editingId } : feature));
    } else {
      setFeatures((current) => [...current, { ...cleanedDraft, id: crypto.randomUUID() }]);
    }
    closeDialog();
  }

  function deleteFeature(feature: Feature) {
    if (!window.confirm(`Delete "${feature.name}" from the backlog?`)) return;
    setFeatures((current) => current.filter((item) => item.id !== feature.id));
  }

  function updateStatus(id: string, status: Status) {
    setFeatures((current) => current.map((feature) => feature.id === id ? { ...feature, status } : feature));
  }

  function updateDraft<K extends keyof FeatureDraft>(key: K, value: FeatureDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  const scorePreview = calculateRice(draft);

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Workspace">
        <a className="wordmark" href="#top" aria-label="Decidra home"><span className="wordmark-icon" aria-hidden="true"><i /><i /><i /></span>decidra<span className="wordmark-period">.</span></a>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <div className="workspace-switcher"><span className="workspace-avatar">G</span><span>GymBuddy</span><span className="switcher-chevron">⌄</span></div>
        <nav className="side-nav" aria-label="Main navigation"><a className="side-link selected" href="#backlog"><span aria-hidden="true">▦</span> Backlog</a><a className="side-link" href="#rice-guide"><span aria-hidden="true">✳</span> RICE guide</a></nav>
        <div className="sidebar-bottom"><div className="sidebar-note"><span aria-hidden="true">✳</span><p><strong>Good ideas deserve a fair look.</strong><br />RICE helps your team compare them with clarity.</p><a href="#rice-guide">Explore the framework <span>↗</span></a></div><div className="profile"><span className="profile-avatar">AM</span><span><strong>Alex Morgan</strong><small>Product Manager</small></span><span className="profile-menu" aria-hidden="true">···</span></div></div>
      </aside>

      <main id="top" className="main-content">
        <header className="topbar"><div className="breadcrumb"><span>GymBuddy</span><span className="breadcrumb-divider">/</span><strong>Backlog</strong></div><div className="topbar-right"><span className="topbar-date">Product workspace</span><span className="topbar-avatar" aria-label="Alex Morgan">AM</span></div></header>
        <div className="page-content">
          <section className="intro"><div className="intro-copy"><div className="eyebrow"><span /> A CLEARER WAY FORWARD</div><h1>From possibilities<br className="title-break" /> to priorities<span className="title-period">.</span></h1><p className="intro-text">Give every good idea a place to start. Decidra helps you bring focus to the features that move your product forward.</p></div><div className="intro-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit-core"><span>G</span></div><span className="orbit-spark spark-one">✳</span><span className="orbit-spark spark-two">✦</span><span className="orbit-dot" /></div></section>

          <section className="rice-strip" id="rice-guide" aria-labelledby="rice-title"><div className="rice-icon" aria-hidden="true">✳</div><div className="rice-copy"><div className="section-overline">A SIMPLE FRAMEWORK FOR BETTER DECISIONS</div><h2 id="rice-title">A little RICE brings a lot of clarity.</h2><p>RICE compares ideas by who they reach, how much they help, how sure you are, and the effort they take. Score each idea with Reach × Impact × Confidence ÷ Effort. Decidra ranks the highest-scoring ideas first.</p></div><div className="rice-letters" aria-label="Reach, Impact, Confidence, Effort"><span><b>R</b><small>Reach</small></span><i>×</i><span><b>I</b><small>Impact</small></span><i>×</i><span><b>C</b><small>Confidence</small></span><i>÷</i><span><b>E</b><small>Effort</small></span></div></section>

          <section className="backlog-section" id="backlog" aria-labelledby="backlog-title">
            <div className="backlog-heading"><div><div className="section-overline">YOUR IDEAS, ALL IN ONE PLACE</div><h2 id="backlog-title">Feature backlog <span className="count-badge">{features.length}</span></h2><p>Compare your ideas, then focus on the ones with the greatest potential.</p></div><button className="primary-button" type="button" onClick={openAddDialog}><span aria-hidden="true">+</span> Add feature</button></div>
            <div className="backlog-tools"><label className="search-box"><span aria-hidden="true">⌕</span><input type="search" aria-label="Search features" placeholder="Search features" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="filter-label">Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}><option>All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><span className="sort-note">Suggested rank: highest RICE score first</span></div>
            <div className="table-card"><div className="table-scroll"><table className="backlog-table"><thead><tr><th scope="col">RANK</th><th scope="col">FEATURE</th><th scope="col">RICE SCORE</th><th scope="col">CALCULATION</th><th scope="col">STATUS</th><th scope="col" className="row-menu-heading"><span className="visually-hidden">Actions</span></th></tr></thead><tbody>
              {visibleFeatures.map(({ item: feature, result, rank }) => <tr key={feature.id}><td><strong className="rank-value">{rank === null ? "—" : `#${rank}`}</strong></td><td><div className="feature-cell"><span className={`feature-icon ${feature.tone}`} aria-hidden="true">{feature.tone === "lilac" ? "▶" : feature.tone === "sage" ? "◷" : "✳"}</span><span><strong>{feature.name}</strong><small>{feature.description}</small></span></div></td><td><strong className={`score-value ${result.valid ? "" : "invalid-score"}`}>{result.valid ? formatScore(result.breakdown.score) : "Invalid"}</strong></td><td className="calculation-cell">{result.valid ? <span title={`Reach ${result.breakdown.reach} × Impact ${result.breakdown.impact} × Confidence ${result.breakdown.confidenceDecimal} ÷ Effort ${result.breakdown.effort}`}>{formatNumber(result.breakdown.reach)} × {result.breakdown.impact} × {result.breakdown.confidenceDecimal} ÷ {result.breakdown.effort} = {formatScore(result.breakdown.score)}</span> : <span title={result.reason}>{result.reason}</span>}</td><td><label className={`status-select status-${feature.status.toLowerCase().replace(" ", "-")}`}><span className="visually-hidden">Status for {feature.name}</span><select value={feature.status} onChange={(event) => updateStatus(feature.id, event.target.value as Status)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></td><td className="row-actions"><button type="button" onClick={() => openEditDialog(feature)} aria-label={`Edit ${feature.name}`} title="Edit feature">Edit</button><button type="button" onClick={() => deleteFeature(feature)} aria-label={`Delete ${feature.name}`} title="Delete feature">Delete</button></td></tr>)}
            </tbody></table>{visibleFeatures.length === 0 && <div className="empty-state"><span>✳</span><strong>{features.length ? "No matching features." : "Your next good idea starts here."}</strong><p>{features.length ? "Try another search or status filter." : "Add a feature to begin your backlog."}</p>{!features.length && <button className="primary-button" type="button" onClick={openAddDialog}>Add your first feature</button>}</div>}</div><div className="table-footer"><span>Showing <strong>{visibleFeatures.length}</strong> of <strong>{features.length}</strong> {features.length === 1 ? "feature" : "features"}</span><span><i /> Current session only</span></div></div>
          </section>

          <footer className="page-footer"><span>Make room for the ideas that matter.</span><span>Thoughtfully built with <b>♥</b> for product teams</span></footer>
        </div>
      </main>

      {dialogMode && <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}><section className="add-dialog feature-dialog" role="dialog" aria-modal="true" aria-labelledby="feature-dialog-title"><button className="dialog-close" type="button" onClick={closeDialog} aria-label="Close">×</button><div className="dialog-mark" aria-hidden="true">{dialogMode === "add" ? "+" : "✎"}</div><div className="section-overline">{dialogMode === "add" ? "A NEW POSSIBILITY" : "REFINE YOUR IDEA"}</div><h2 id="feature-dialog-title">{dialogMode === "add" ? "Add a feature" : "Edit feature"}</h2><p>Add a clear description and estimate each RICE factor. Your score updates as you work.</p><form onSubmit={saveFeature}>
        <label htmlFor="feature-name">Feature name</label><input ref={nameRef} id="feature-name" name="featureName" value={draft.name} onChange={(event) => updateDraft("name", event.target.value)} placeholder="e.g. Guided cooldown routine" maxLength={80} required />
        <label htmlFor="feature-description">Description</label><textarea id="feature-description" name="description" value={draft.description} onChange={(event) => updateDraft("description", event.target.value)} placeholder="What user need does this address?" maxLength={180} rows={2} />
        <div className="rice-input-grid"><label htmlFor="feature-reach">Reach <small>people per period</small><input id="feature-reach" type="number" min="0" step="1" value={draft.reach} onChange={(event) => updateDraft("reach", Math.max(0, Number(event.target.value)))} required /></label><label htmlFor="feature-impact">Impact <small>0.25 to 3</small><select id="feature-impact" value={draft.impact} onChange={(event) => updateDraft("impact", Number(event.target.value))}><option value="0.25">0.25 · Minimal</option><option value="0.5">0.5 · Low</option><option value="1">1 · Medium</option><option value="2">2 · High</option><option value="3">3 · Massive</option></select></label><label htmlFor="feature-confidence">Confidence <small>percent</small><input id="feature-confidence" type="number" min="0" max="100" step="1" value={draft.confidence} onChange={(event) => updateDraft("confidence", Math.min(100, Math.max(0, Number(event.target.value))))} required /></label><label htmlFor="feature-effort">Effort <small>person-weeks</small><input id="feature-effort" type="number" min="0.1" step="0.1" value={draft.effort} onChange={(event) => updateDraft("effort", Math.max(0.1, Number(event.target.value)))} required /></label></div>
        <label htmlFor="feature-status">Status</label><select id="feature-status" className="dialog-status" value={draft.status} onChange={(event) => updateDraft("status", event.target.value as Status)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select>
        <div className="score-preview"><span>Estimated RICE score</span><strong>{scorePreview.valid ? formatScore(scorePreview.breakdown.score) : "Invalid"}</strong><small>{scorePreview.valid ? `${formatNumber(scorePreview.breakdown.reach)} × ${scorePreview.breakdown.impact} × ${scorePreview.breakdown.confidenceDecimal} ÷ ${scorePreview.breakdown.effort} = ${formatScore(scorePreview.breakdown.score)}` : scorePreview.reason}</small></div>
        <div className="form-actions"><button className="cancel-button" type="button" onClick={closeDialog}>Cancel</button><button className="primary-button" type="submit" disabled={!scorePreview.valid}>{dialogMode === "add" ? "Add to backlog" : "Save changes"}</button></div>
      </form></section></div>}
    </div>
  );
}

export default App;
