/* Translation Practice: loads exercises.json and gives glossary-based hints.
   No server, no AI, no grading. Hints compare the student's text with glossary.json only. */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const bi = (e, a) => "<span>" + esc(e) + '</span><span class="ba" lang="ar" dir="rtl">' + esc(a) + "</span>";
const nz = s => window.GL.norm(s).replace(/(^|\s)ال/g, "$1");
const SUF = ["ing", "ed", "es", "s", "d", ""];
const BADGE = {C: ["Course pair", "زوج من مواد المقرر"], S: ["Course text", "نص من مواد المقرر"], AI: ["AI suggestion · not instructor-approved", "اقتراح ذكاء اصطناعي · غير معتمد"]};
let EX = null, busy = false;

window.initPractice = function () {
  if (EX || busy || !window.GL) return; busy = true;
  fetch("exercises.json", {cache: "no-cache"}).then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then(t => { try { EX = JSON.parse(t); } catch (e) { throw new Error("exercises.json is not valid JSON (" + e.message + ")"); } home(); })
    .catch(e => { busy = false; $("p").innerHTML = '<p class="warn"><b>Could not load exercises.json.</b> ' + esc(e.message) + "</p>"; });
};
if (window.GL) window.initPractice();

function variants(str, lang) {
  const v = [];
  String(str).split(/\s*\/\s*|\s+أو\s+/).forEach(p => {
    p = p.trim(); if (!p) return;
    const b = p.replace(/\(s\)/g, "").replace(/\s+/g, " ").trim(); v.push(b);
    const n = b.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim(); if (n !== b) v.push(n);
    if (lang === "en") { const m = b.match(/\(([A-Z]{3,})\)/); if (m) v.push(m[1]); }
  });
  return v.map(x => lang === "en" ? x.toLowerCase() : nz(x)).filter(x => x.length >= 3);
}
function findEn(text, v) {
  const r = []; let i = -1;
  while ((i = text.indexOf(v, i + 1)) >= 0) {
    if (i && /[a-z]/.test(text[i - 1])) continue;
    for (const s of SUF) { const e = i + v.length; if (text.startsWith(s, e) && !/[a-z]/.test(text[e + s.length] || " ")) { r.push([i, e + s.length]); break; } }
  }
  return r;
}
function findAr(text, v) { const r = []; let i = -1; while ((i = text.indexOf(v, i + 1)) >= 0) r.push([i, i + v.length]); return r; }
const find = (tx, v, lang) => lang === "en" ? findEn(tx, v) : findAr(tx, v);
const prep = (s, lang) => lang === "en" ? s.toLowerCase() : nz(s);

function matches(text, lang) {
  const tx = prep(text, lang), c = [];
  window.GL.T.forEach(t => {
    let best = null;
    variants(lang === "en" ? t.en : t.ar, lang).forEach(v => find(tx, v, lang).forEach(r => { if (!best || r[1] - r[0] > best[1] - best[0]) best = r; }));
    if (best) c.push({t, s: best[0], e: best[1]});
  });
  c.sort((a, b) => (b.e - b.s) - (a.e - a.s));
  const kept = [];
  c.forEach(m => { if (!kept.some(k => k.s <= m.s && m.e <= k.e && k.e - k.s > m.e - m.s)) kept.push(m); });
  return kept.sort((a, b) => a.s - b.s).map(m => m.t);
}
function hintsFor(item, set, ans) {
  const L = (item.direction || set.direction).split("-")[0], TL = (item.direction || set.direction).split("-")[1];
  let ts = matches(item.text, L);
  if (L === "en" && item.hintTerms) item.hintTerms.forEach(h => window.GL.T.forEach(t => { if (variants(t.en, "en").indexOf(h.toLowerCase()) >= 0 && ts.indexOf(t) < 0) ts.push(t); }));
  const ta = prep(ans, TL);
  let h = '<p class="m">' + esc("Hints compare your text with the glossary only. This tool does not grade your work and is not AI-powered.") + '<br><span lang="ar" dir="rtl">' + esc("التلميحات تقارن نصك بالمسرد فقط. هذه الأداة لا تقيّم عملك وليست مدعومة بالذكاء الاصطناعي.") + "</span></p>";
  if (TL === "ar" && !/[\u0600-\u06FF]/.test(ans)) h += "<p>⚠ Your text has no Arabic letters, but the target language is Arabic.</p>";
  if (TL === "en" && !/[A-Za-z]/.test(ans)) h += "<p>⚠ Your text has no English letters, but the target language is English.</p>";
  if (!ts.length) return h + "<p>No glossary terms were found in this source text. This does not mean your translation is right or wrong.</p>";
  h += "<ul>" + ts.map(t => {
    const src = L === "en" ? t.en : t.ar, tgt = TL === "en" ? t.en : t.ar;
    const found = variants(tgt, TL).some(v => find(ta, v, TL).length);
    const b = BADGE[t.s] || [t.s, ""];
    return "<li><b" + (L === "ar" ? ' lang="ar" dir="rtl"' : "") + ">" + esc(src) + "</b> → <span" + (TL === "ar" ? ' lang="ar" dir="rtl"' : "") + ">" + esc(tgt) + '</span> <span class="b ' + esc(String(t.s).replace(/[^A-Za-z0-9_-]/g, "")) + '" title="' + esc(b[1]) + '">' + esc(b[0]) + "</span>" + (t.f ? ' <span class="b F">⚑ review</span>' : "") +
      '<br><span class="' + (found ? "ok" : "m") + '">' + (found ? "✓ A glossary term appears in your text." : "○ Not found in your text. Other wording may also be acceptable.") + "</span>" + (t.note ? '<br><span class="m">' + esc(t.note) + "</span>" : "") + "</li>";
  }).join("") + "</ul>";
  return h;
}

function home() {
  const sets = EX.sets || [], row = st => sets.map((s, i) => s.instructionStatus === st ? card(s, i) : "").join("");
  const card = (s, i) => '<button class="c setc" data-open="' + i + '"><b>' + esc(s.title) + '</b><div class="m">' + esc(s.topic) + " · " + esc(s.source) + " · " + (s.items || []).length + " item(s) · " + ((s.items || []).some(x => x.reference) ? "reference in course file" : "no reference in course file") + "</div></button>";
  $("p").innerHTML = "<h2>" + bi("Translation Practice", "التدريب على الترجمة") + '</h2><p class="draft">Draft pending instructor approval · مسودة بانتظار موافقة المدرّس</p>' +
    "<p>Read the text, write your own translation, then select <b>Check My Translation</b>. You get terminology hints from the glossary and can revise. A reference translation is shown only if the course materials contain one. This is not AI grading.</p>" +
    '<p lang="ar" dir="rtl">اقرأ النص، واكتب ترجمتك، ثم اضغط «تحقق من ترجمتي». تحصل على تلميحات مصطلحية من المسرد ويمكنك المراجعة. لا تظهر ترجمة مرجعية إلا إذا وُجدت في مواد المقرر. هذا ليس تقييماً بالذكاء الاصطناعي.</p>' +
    "<h3>Task written in the course file</h3>" + (row("stated") || '<p class="m">None.</p>') +
    "<h3>No task written in the file (instructor to confirm)</h3>" + row("unstated") +
    "<details><summary>Not included</summary><ul>" + ((EX.meta || {}).excluded || []).map(x => "<li>" + esc(x) + "</li>").join("") + "</ul></details>";
}
function openSet(i) {
  const s = EX.sets[i], L = s.direction.split("-")[0], TL = s.direction.split("-")[1], d = l => l === "ar" ? ' lang="ar" dir="rtl"' : ' lang="en" dir="ltr"';
  $("p").innerHTML = '<button class="btn o" data-home="1">' + bi("← All exercises", "كل التمارين") + "</button><h2>" + esc(s.title) + '</h2><p class="draft">Draft pending instructor approval · مسودة بانتظار موافقة المدرّس</p>' +
    '<p class="m">' + esc(s.source) + " · " + (L === "en" ? "English → Arabic" : "Arabic → English") + "</p>" +
    (s.instruction ? "<p><b>Task in the course file:</b> “" + esc(s.instruction) + "”</p>" : "<p><b>No task is written in the course file.</b></p>") + (s.note ? '<p class="m">' + esc(s.note) + "</p>" : "") +
    s.items.map((it, j) => {
      const l = (it.direction || s.direction).split("-")[0], tl = (it.direction || s.direction).split("-")[1];
      return '<article class="c" data-i="' + j + '">' + (it.label ? '<div class="m">' + esc(it.label) + "</div>" : "") +
        (it.given ? '<div class="m">Arabic translation given in the course file (contains errors to correct)</div><div class="src gv" lang="ar" dir="rtl">' + esc(it.given) + "</div>" : "") +
        '<div class="src"' + d(l) + ">" + esc(it.text) + "</div>" +
        (it.slideGlossary ? '<p class="m">Terms listed on the slide: ' + esc(it.slideGlossary.join(" · ")) + "</p>" : "") + (it.note ? '<p class="m">' + esc(it.note) + "</p>" : "") +
        '<textarea class="ta" rows="' + (s.kind === "terms" ? 2 : 6) + '"' + d(tl) + ' placeholder="Write your translation here / اكتب ترجمتك هنا" aria-label="Your translation"></textarea>' +
        '<div class="row"><button class="btn" data-a="check">' + bi("Check My Translation", "تحقق من ترجمتي") + '</button><button class="btn o" data-a="ref" hidden>' + bi("Show reference translation", "عرض الترجمة المرجعية") + '</button><button class="btn o" data-a="clear">' + bi("Clear", "مسح") + "</button></div>" +
        '<div class="res" aria-live="polite"></div><div class="refbox"><p class="m">' + (it.reference ? "A reference from the course file can be shown after you check your translation." : "No reference translation exists in the course materials for this item.") + "</p></div></article>";
    }).join("");
  $("p").dataset.set = i; window.scrollTo(0, 0);
}
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b || !$("p").contains(b)) return;
  if (b.dataset.open) return openSet(+b.dataset.open);
  if (b.dataset.home) { window.scrollTo(0, 0); return home(); }
  const art = b.closest("article"); if (!art || !b.dataset.a) return;
  const s = EX.sets[+$("p").dataset.set], it = s.items[+art.dataset.i], ta = art.querySelector("textarea"), res = art.querySelector(".res"), rb = art.querySelector(".refbox");
  if (b.dataset.a === "clear") { ta.value = ""; res.innerHTML = ""; return; }
  if (b.dataset.a === "check") {
    if (!ta.value.trim()) { res.innerHTML = "<p>Write your translation first. · اكتب ترجمتك أولاً.</p>"; return; }
    art.dataset.n = (+art.dataset.n || 0) + 1;
    res.innerHTML = '<p class="m">Check no. ' + art.dataset.n + " · Revise your text and check again.</p>" + hintsFor(it, s, ta.value);
    if (it.reference) art.querySelector('[data-a="ref"]').hidden = false;
    return;
  }
  if (b.dataset.a === "ref" && it.reference) {
    const tl = (it.direction || s.direction).split("-")[1];
    rb.innerHTML = '<div class="m">Reference translation</div><div class="src ref"' + (tl === "ar" ? ' lang="ar" dir="rtl"' : ' lang="en" dir="ltr"') + ">" + esc(it.reference.text) + '</div><p class="m">From ' + esc(it.reference.from) + ". " + esc(s.referenceNote || "The file does not say it is an approved answer.") + " Draft pending instructor approval.</p>";
  }
});
})();
