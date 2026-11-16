/* Business Translation Glossary: loads glossary.json and builds the page.
   Instructors normally edit only glossary.json (see GUIDE.md). */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm = s => String(s).toLowerCase().replace(/[\u064B-\u0652\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه");
const cls = s => String(s).replace(/[^A-Za-z0-9_-]/g,"");
let M = {}, SL = {}, SRC = {}, T = [], TOP = [], tp = "", st = "", fl = false;

fetch("glossary.json", {cache: "no-cache"})
  .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
  .then(txt => { let d; try { d = JSON.parse(txt); } catch (e) { throw new Error("glossary.json is not valid JSON (" + e.message + ")"); } init(d); })
  .catch(e => {
    $("list").innerHTML = '<p class="warn"><b>Could not load glossary.json.</b> ' + esc(e.message) + '</p><p class="m">If you opened index.html directly from your computer, the browser blocks loading the data file. Use GitHub Pages or a local server (see PUBLISHING.md).</p>';
  });

function validate(d) {
  const p = [], terms = Array.isArray(d.terms) ? d.terms : [];
  if (!Array.isArray(d.terms)) p.push("“terms” is missing or is not a list.");
  terms.forEach((x, i) => {
    if (!x || typeof x !== "object") { p.push("Entry " + (i + 1) + ": not an object."); return; }
    const w = "Entry " + (i + 1) + (x.en ? " (" + x.en + ")" : "") + ": ";
    ["en", "ar", "source", "topic"].forEach(k => { if (typeof x[k] !== "string" || !x[k].trim()) p.push(w + "“" + k + "” is missing or empty."); });
    if (!(x.status in SL)) p.push(w + "status “" + x.status + "” is not defined in meta.statusLabels.");
    if (x.flagged !== undefined && typeof x.flagged !== "boolean") p.push(w + "“flagged” must be true or false (no quotes).");
    if (x.flagged === true && !x.note) p.push(w + "flagged but has no note.");
    if (typeof x.topic === "string" && x.topic && TOP.indexOf(x.topic) < 0) { p.push(w + "topic “" + x.topic + "” is not listed in “topics”."); TOP.push(x.topic); }
    if (x.context != null && (typeof x.context !== "object" || ["definition", "example"].indexOf(x.context.type) < 0 || typeof x.context.text !== "string")) p.push(w + "“context” must be null or {\"type\": \"definition\" or \"example\", \"text\": \"...\"}.");
  });
  return p;
}

function init(d) {
  M = d.meta || {}; SL = M.statusLabels || {}; SRC = M.sources || {}; TOP = (d.topics || []).slice();
  const problems = validate(d);
  if (M.title) { $("ttl").textContent = M.title; document.title = M.title; }
  if (M.subtitle) $("sub").textContent = M.subtitle;
  T = (Array.isArray(d.terms) ? d.terms : []).filter(x => x && typeof x === "object").map(x => {
    const c = x.context && x.context.text ? x.context : null;
    return {en: String(x.en || ""), ar: String(x.ar || ""), s: String(x.status || ""), f: x.flagged === true, src: String(x.source || ""), note: x.note || "", ctx: c, topic: String(x.topic || ""),
      k: norm([x.en, x.ar, x.note, c ? c.text : "", x.source].join(" "))};
  });
  if (problems.length) $("chk").innerHTML = '<details class="warn"><summary>' + problems.length + ' problem(s) found in glossary.json</summary><ul>' + problems.map(x => "<li>" + esc(x) + "</li>").join("") + "</ul></details>";

  $("tp").innerHTML = '<option value="">All topics</option>' + TOP.map(x => "<option>" + esc(x) + "</option>").join("");
  $("tp").onchange = e => { tp = e.target.value; view(); };
  $("q").oninput = view;
  const keys = Object.keys(SL), short = M.statusShort || {};
  $("sc").innerHTML = '<button class="chip" data-s="" aria-pressed="true">All</button>' + keys.map(k => '<button class="chip" data-s="' + esc(k) + '" aria-pressed="false">' + esc(k) + "</button>").join("") + '<button class="chip" id="fl" aria-pressed="false">⚑ Flagged</button>';
  $("lg").innerHTML = keys.map(k => "<b>" + esc(k) + "</b> " + esc(short[k] || "")).join(" · ") + ' · ⚑ needs review · <span id="n"></span>';
  document.querySelectorAll("[data-s]").forEach(b => b.onclick = () => { st = b.dataset.s; document.querySelectorAll("[data-s]").forEach(x => x.setAttribute("aria-pressed", x === b)); view(); });
  $("fl").onclick = e => { fl = !fl; e.target.setAttribute("aria-pressed", fl); view(); };

  const fT = T.filter(t => t.f), A = M.about || {};
  $("r").innerHTML = "<h2>Review: discrepancies and source issues</h2><p class=\"m\">Nothing below was corrected. Each item is for the instructor to decide.</p>" +
    (d.review || []).map(g => "<h3>" + esc(g.title) + "</h3><ul>" + (g.items || []).map(x => "<li>" + esc(x) + "</li>").join("") + "</ul>").join("") +
    "<h3>Flagged terms (" + fT.length + ")</h3><ul>" + fT.map(t => "<li><b>" + esc(t.en) + '</b> · <span lang="ar" dir="rtl">' + esc(t.ar) + '</span> <span class="b ' + cls(t.s) + '">' + esc(t.s) + '</span><br><span class="m">' + esc(t.note) + "</span></li>").join("") + "</ul>";
  $("a").innerHTML = "<h2>About this glossary</h2><p>" + esc(A.intro || "") + "</p><h3>Status labels</h3><ul>" + keys.map(k => "<li>" + esc(SL[k]) + "</li>").join("") + "<li>" + esc(M.flagLabel || "") + "</li></ul><p><b>" + esc(A.approvedNote || "") + "</b></p><h3>Definitions and examples</h3><p>" + esc(A.definitionsNote || "") + "</p><h3>Source key</h3><ul>" +
    Object.keys(SRC).map(k => "<li><b>" + esc(k) + "</b> = " + esc(SRC[k]) + " (s = slide)</li>").join("") + (M.sourceNotes || []).map(x => "<li>" + esc(x) + "</li>").join("") + '</ul><p class="m">' + T.length + " terms in " + TOP.length + " topics.</p>";
  document.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { document.querySelectorAll("[data-t]").forEach(x => x.setAttribute("aria-selected", x === b)); ["g", "p", "r", "a"].forEach(i => $(i).hidden = i !== b.dataset.t); $("f").hidden = b.dataset.t !== "g"; window.scrollTo(0, 0); });
  window.GL = {T: T, SL: SL, norm: norm};
  if (window.initPractice) window.initPractice();
  view();
}

function srcx(s) {
  const k = Object.keys(SRC); if (!k.length) return esc(s);
  return esc(s.replace(new RegExp("\\b(" + k.join("|") + ")\\b", "g"), m => SRC[m]));
}
function card(t) {
  const lbl = SL[t.s] || "";
  return '<article class="c"><div class="r1"><span class="en">' + esc(t.en) + '</span><span class="b ' + cls(t.s) + '" title="' + esc(lbl) + '">' + esc(t.s) + "</span>" + (t.f ? '<span class="b F" title="Flagged for review">⚑</span>' : "") + '</div><div class="ar" lang="ar" dir="rtl">' + esc(t.ar) + '</div><div class="m">' + esc(t.topic) + " · " + esc(t.src) + "</div><details><summary>Details</summary>" +
    (t.note ? "<p><b>Review note.</b> " + esc(t.note) + "</p>" : "") +
    (t.ctx ? "<p><b>" + (t.ctx.type === "definition" ? "Definition in course text." : "Example from course text.") + "</b> “" + esc(t.ctx.text) + "”</p>" : '<p class="m">No definition or example sentence in the course materials.</p>') +
    "<p><b>Status.</b> " + esc(lbl) + "</p><p><b>Source.</b> " + srcx(t.src) + "</p></details></article>";
}
function view() {
  const q = norm($("q").value.trim());
  const r = T.filter(t => (!tp || t.topic === tp) && (!st || t.s === st) && (!fl || t.f) && (!q || t.k.includes(q)));
  $("n").textContent = r.length + " of " + T.length + " terms";
  $("list").innerHTML = r.map(card).join("") || '<p class="e">No terms match.</p>';
}
})();
