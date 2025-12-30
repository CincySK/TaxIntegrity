// Civic Tax AI — interactions + in-page edit mode
(function(){
  const DEFAULT_CFG = window.CIVIC_TAX_AI_CONFIG;

  // Load overrides from localStorage (if present)
  const LS_KEY = "civic_tax_ai_config_v1";
  let cfg = DEFAULT_CFG;
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      cfg = deepMerge(structuredClone(DEFAULT_CFG), parsed);
    }
  }catch(e){}

  // Apply config text to elements with data-edit keys
  function applyText(){
    document.querySelectorAll("[data-edit]").forEach(el=>{
      const key = el.getAttribute("data-edit");
      const val = getByPath(cfg, key);
      if(typeof val === "string") {
        el.textContent = val;
        if(val.trim() === "") el.classList.add("is-hidden"); else el.classList.remove("is-hidden");
      }
    });
  }
  applyText();

  // Default signals
  setSignals(cfg.signals.ev_income);

  // Chip/buttons (existing behavior)
  document.querySelectorAll("button[data-action]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const action = btn.getAttribute("data-action");
      if(btn.classList.contains("chip")) setActiveChip(btn);
      handleAction(action);
    });
  });

  // Slider
  const adoption = document.getElementById("adoption");
  const adoptionVal = document.getElementById("adoption_val");
  if(adoption){
  adoption.addEventListener("input", ()=>{
    if(adoptionVal) adoptionVal.textContent = String(adoption.value);
    if(adoption) updateProgressFromAdoption(Number(adoption.value));
    if(adoption) updateAuditKpis(Number(adoption.value));
    refreshEditorJson();
  // Simulator: toggle technical JSON + copy (get-started page only)
  if(simJsonToggle && simJsonPre){
    simJsonToggle.addEventListener("click", ()=>{
      const hidden = simJsonPre.classList.contains("is-hidden");
      simJsonPre.classList.toggle("is-hidden", !hidden);
      const newHidden = !hidden;
      simJsonPre.setAttribute("aria-hidden", String(newHidden));
      simJsonToggle.setAttribute("aria-expanded", String(!newHidden));
      simJsonToggle.textContent = newHidden ? "Show technical JSON" : "Hide technical JSON";
    });
  }
  if(simCopyJson && simJsonPre){
    simCopyJson.addEventListener("click", async ()=>{
      try{
        await navigator.clipboard.writeText(simJsonPre.textContent || "");
        alert("Copied JSON.");
      }catch(e){
        alert("Copy failed. Use Export Demo Report instead.");
      }
    });
  }

  });
}

  // init visuals
  if(adoption) updateProgressFromAdoption(Number(adoption.value));
  if(adoption) updateAuditKpis(Number(adoption.value));
  setBar("b_explain", 78);
  setBar("b_fp", 64);

  const firstChip = document.querySelector(".chiprow .chip");
  if(firstChip) setActiveChip(firstChip);

  /* ===================== Edit Mode ===================== */
  const toggleBtn = document.getElementById("edit_toggle");
  const drawer = document.getElementById("edit_drawer");
  const closeBtn = document.getElementById("edit_close");
  const exportBtn = document.getElementById("edit_export");
  const importInput = document.getElementById("edit_import");
  const resetBtn = document.getElementById("edit_reset");
  const copyBtn = document.getElementById("edit_copy");
  const jsonBox = document.getElementById("edit_json");
  // Simulator UI (only exists on get-started page)
  const simCards = document.getElementById("sim_cards");
  const simJsonToggle = document.getElementById("toggle_json");
  const simCopyJson = document.getElementById("copy_json");
  const simJsonPre = document.getElementById("result_box");


  let editMode = false;

  function openDrawer(){
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden","false");
  }
  function closeDrawer(){
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden","true");
  }

  function setEditMode(on){
    editMode = !!on;
    document.body.classList.toggle("edit-mode", editMode);
    toggleBtn.classList.toggle("is-on", editMode);
    toggleBtn.textContent = editMode ? "✅ Editing" : "✏️ Edit";
    if(editMode) openDrawer();
    refreshEditorJson();
  }

  toggleBtn?.addEventListener("click", ()=> setEditMode(!editMode));
  closeBtn?.addEventListener("click", ()=> closeDrawer());

  // Click-to-edit on any [data-edit] element when in edit mode
  document.addEventListener("click", (e)=>{
    if(!editMode) return;
    const el = e.target.closest("[data-edit]");
    if(!el) return;
    e.preventDefault();
    e.stopPropagation();
    const key = el.getAttribute("data-edit");
    const current = getByPath(cfg, key) ?? el.textContent ?? "";
    const next = prompt(`Edit text for:\n${key}`, String(current));
    if(next === null) return; // cancelled
    setByPath(cfg, key, next);
    applyText();
    persistCfg();
    refreshEditorJson();
  }, true);

  exportBtn?.addEventListener("click", ()=>{
    const payload = minimalDiff(DEFAULT_CFG, cfg);
    downloadJSON(payload, "civic_tax_ai_settings.json");
    refreshEditorJson();
  });

  importInput?.addEventListener("change", (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const imported = JSON.parse(String(reader.result || "{}"));
        cfg = deepMerge(structuredClone(DEFAULT_CFG), imported);
        persistCfg();
        applyText();
        // refresh panels that depend on cfg
        setSignals(cfg.signals.ev_income);
        refreshEditorJson();
        alert("Imported settings successfully.");
      }catch(err){
        alert("Import failed: invalid JSON.");
      }
      importInput.value = "";
    };
    reader.readAsText(file);
  });

  resetBtn?.addEventListener("click", ()=>{
    if(!confirm("Reset all edits back to default?")) return;
    localStorage.removeItem(LS_KEY);
    cfg = structuredClone(DEFAULT_CFG);
    applyText();
    setSignals(cfg.signals.ev_income);
    refreshEditorJson();
  });

  copyBtn?.addEventListener("click", async ()=>{
    try{
      const payload = minimalDiff(DEFAULT_CFG, cfg);
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      alert("Copied settings JSON to clipboard.");
    }catch(e){
      alert("Couldn't copy (browser blocked clipboard). Use Export instead.");
    }
  });

  function refreshEditorJson(){
    if(!jsonBox) return;
    const payload = minimalDiff(DEFAULT_CFG, cfg);
    jsonBox.textContent = JSON.stringify(payload, null, 2);
  }
  refreshEditorJson();

  function persistCfg(){
    try{
      const payload = minimalDiff(DEFAULT_CFG, cfg);
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
    }catch(e){}
  }

  /* ===================== Existing actions ===================== */
  function handleAction(action){
    const box = document.getElementById("result_box");
    if(action === "simulate"){
      const a = adoption ? Number(adoption.value) : 35;
      const result = simulateImpact(a);
      if(box) box.textContent = JSON.stringify(result, null, 2);
      renderSimulation(result);
      refreshEditorJson();
      return;
    }
    if(action === "export"){
      const report = {
        site: cfg.site.title,
        timestamp: new Date().toISOString(),
        adoptionLevel: adoption ? Number(adoption.value) : 35,
        progress: currentProgress(Number(adoption.value)),
        note: "Educational demo report (synthetic)."
      };
      downloadJSON(report, "civic_tax_ai_report.json");
      box.textContent = "Exported civic_tax_ai_report.json (check downloads).";
      refreshEditorJson();
      return;
    }
    const items = cfg.signals[action];
    if(items){
      setSignals(items);
      box.textContent =
`Selected: ${action}
What the AI is doing (illustrative):
- ${items.map(x=>x.t).join("\n- ")}

Tip: move the AI adoption slider to see progress change.`;
      refreshEditorJson();
    }
  }

  function setSignals(items){
    const el = document.getElementById("signals");
    if(!el) return;
    el.innerHTML = items.map(x=>`
      <div class="signal">
        <div class="signal__t">${escapeHtml(x.t)}</div>
        <div class="signal__d">${escapeHtml(x.d)}</div>
      </div>
    `).join("");
  }

  function setActiveChip(btn){
    document.querySelectorAll(".chip").forEach(b=>b.classList.remove("is-active"));
    btn.classList.add("is-active");
  }

  function updateAuditKpis(adopt){
    const triaged = Math.round(1200 + adopt * 38);
    const highrisk = Math.round(42 + adopt * 1.1);
    const timeSaved = Math.round(8 + adopt * 0.26);

    setText("k_triaged", triaged.toLocaleString());
    setText("k_highrisk", highrisk.toLocaleString());
    setText("k_timesaved", `${timeSaved}h/day`);
    setBar("b_explain", clamp(70 + adopt*0.2, 0, 100));
    setBar("b_fp", clamp(55 + adopt*0.25, 0, 100));
  }

  function updateProgressFromAdoption(adopt){
    const p = currentProgress(adopt);

    setMeter("p_income", p.hiddenIncomeDetectedPct);
    setText("p_income_txt", `${p.hiddenIncomeDetectedPct}%`);
    setText("p_income_sub", `~$${p.hiddenIncomeFoundB}B hidden income found (scaled demo)`);

    setMeter("p_offshore", p.offshoreAccountsFoundPct);
    setText("p_offshore_txt", `${p.offshoreAccountsFoundPct}%`);
    setText("p_offshore_sub", `~${p.offshoreAccounts} offshore accounts flagged (demo)`);

    setMeter("p_fraud", p.fraudSchemesUncoveredPct);
    setText("p_fraud_txt", `${p.fraudSchemesUncoveredPct}%`);
    setText("p_fraud_sub", `~${p.fraudSchemes} schemes uncovered (demo)`);
  }

  function currentProgress(adopt){
    const hiddenIncomeDetectedPct = clamp(Math.round(35 + adopt*0.47), 0, 95);
    const offshoreAccountsFoundPct = clamp(Math.round(22 + adopt*0.45), 0, 92);
    const fraudSchemesUncoveredPct = clamp(Math.round(28 + adopt*0.50), 0, 93);

    const hiddenIncomeFoundB = clamp(Math.round(0.8 + adopt*0.03), 0, 10);
    const offshoreAccounts = clamp(Math.round(80 + adopt*3.2), 0, 600);
    const fraudSchemes = clamp(Math.round(220 + adopt*10.5), 0, 2500);

    return { hiddenIncomeDetectedPct, offshoreAccountsFoundPct, fraudSchemesUncoveredPct, hiddenIncomeFoundB, offshoreAccounts, fraudSchemes };
  }

  
  function simulateImpact(adoption){
    // Real public baselines (IRS projections for TY 2022):
    // - Gross tax gap: $696B
    // - Net tax gap:   $606B
    // This demo applies a synthetic adoption curve to show "what could improve" with better triage and detection.
    const grossGapB = 696;
    const netGapB = 606;

    const a = clamp(adoption, 0, 100) / 100;

    // Synthetic assumptions (demo only):
    // - As adoption rises, we assume a portion of net gap can be recovered via better selection + faster workflows.
    // - Recovery is capped to avoid unrealistic results.
    const recoverableShare = 0.18;                 // up to 18% of net gap could be improved (demo)
    const recovery = Math.round(netGapB * recoverableShare * easeInOut(a));

    // Efficiency improvements
    const hitRateUplift = Math.round(8 + 32 * easeInOut(a));       // 8% to 40%
    const timeFaster = Math.round(10 + 55 * easeInOut(a));         // 10% to 65%

    // Evasion signal improvements (demo)
    const hiddenIncome = Math.round(12 + 58 * easeInOut(a));       // 12% to 70%
    const offshore = Math.round(6 + 44 * easeInOut(a));            // 6% to 50%
    const schemes = Math.round(5 + 35 * easeInOut(a));             // 5% to 40%

    return {
      adoptionLevel: Math.round(a*100),
      baselines: { grossTaxGapB: grossGapB, netTaxGapB: netGapB },
      audit: {
        recoveredRevenueB: recovery,
        hitRateUpliftPct: hitRateUplift,
        timeToCaseFasterPct: timeFaster
      },
      evasion: {
        hiddenIncomeDetectedPct: hiddenIncome,
        offshoreAccountsFoundPct: offshore,
        fraudSchemesUncoveredPct: schemes
      },
      notes: [
        "Demo-only: uses real baselines + synthetic adoption assumptions.",
        "Human-in-the-loop: AI recommends; trained staff decide.",
        "Fairness: explainable drivers and monitoring are required."
      ]
    };
  }

  function easeInOut(t){
    // Smooth curve 0..1
    return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2)/2;
  }


  function renderSimulation(result){
    if(!simCards) return;
    const audit = result.audit || {};
    const evasion = result.evasion || {};

    const recovered = typeof audit.recoveredRevenueB === "number" ? audit.recoveredRevenueB : 0;
    const hit = typeof audit.hitRateUpliftPct === "number" ? audit.hitRateUpliftPct : 0;
    const faster = typeof audit.timeToCaseFasterPct === "number" ? audit.timeToCaseFasterPct : 0;

    simCards.innerHTML = `
      <div class="simcard">
        <div class="simcard__k">Recovered revenue (demo)</div>
        <div class="simcard__v">$${recovered}B</div>
        <div class="simcard__sub">Illustrative recovery at current adoption level</div>
      </div>
      <div class="simcard">
        <div class="simcard__k">Audit hit-rate uplift</div>
        <div class="simcard__v">${hit}%</div>
        <div class="simcard__sub">More high-yield cases prioritized for review</div>
      </div>
      <div class="simcard">
        <div class="simcard__k">Time-to-case faster</div>
        <div class="simcard__v">${faster}%</div>
        <div class="simcard__sub">Faster triage and document verification</div>
      </div>
      <div class="simsum" style="grid-column: 1 / -1;">
        <div class="simsum__title">Executive summary (demo)</div>
        <div class="simsum__text">
          At adoption level <b>${result.adoptionLevel}</b>, TaxIntegrity improves audit prioritization while keeping humans in control.
          Evasion signals show <b>${evasion.hiddenIncomeDetectedPct || 0}%</b> hidden-income detection,
          <b>${evasion.offshoreAccountsFoundPct || 0}%</b> offshore pattern detection, and
          <b>${evasion.fraudSchemesUncoveredPct || 0}%</b> fraud-scheme uncovering (all synthetic).
        </div>
      </div>
    `;
  }

  /* ===================== Utilities ===================== */
  function setMeter(id, pct){
    const el = document.getElementById(id);
    if(el) el.style.width = `${clamp(pct,0,100)}%`;
  }
  function setBar(id, pct){ setMeter(id, pct); }
  function setText(id, txt){
    const el = document.getElementById(id);
    if(el) el.textContent = txt;
  }

  function downloadJSON(obj, filename){
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function getByPath(obj, path){
    return path.split(".").reduce((acc, k)=> (acc && acc[k] !== undefined) ? acc[k] : undefined, obj);
  }
  function setByPath(obj, path, value){
    const parts = path.split(".");
    let cur = obj;
    for(let i=0;i<parts.length-1;i++){
      const k = parts[i];
      if(typeof cur[k] !== "object" || cur[k] === null) cur[k] = {};
      cur = cur[k];
    }
    cur[parts[parts.length-1]] = value;
  }
  function clamp(x,a,b){ return Math.max(a, Math.min(b, x)); }
  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
      .replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  function deepMerge(target, source){
    for(const k of Object.keys(source || {})){
      const sv = source[k];
      if(Array.isArray(sv)){
        target[k] = sv; // replace arrays
      }else if(sv && typeof sv === "object"){
        if(!target[k] || typeof target[k] !== "object") target[k] = {};
        deepMerge(target[k], sv);
      }else{
        target[k] = sv;
      }
    }
    return target;
  }

  // Create a minimal diff object (only what changed), to keep saved JSON small.
  function minimalDiff(base, cur){
    if(Array.isArray(base) && Array.isArray(cur)){
      return JSON.stringify(base) === JSON.stringify(cur) ? undefined : cur;
    }
    if(base && typeof base === "object" && cur && typeof cur === "object"){
      const out = {};
      let changed = false;
      const keys = new Set([...Object.keys(base), ...Object.keys(cur)]);
      for(const k of keys){
        const d = minimalDiff(base[k], cur[k]);
        if(d !== undefined){
          out[k] = d;
          changed = true;
        }
      }
      return changed ? out : undefined;
    }
    return base === cur ? undefined : cur;
  }


  /* ===================== Hide navbar on scroll down ===================== */
  (function(){
    const nav = document.querySelector(".nav");
    if(!nav) return;

    let lastY = window.scrollY || 0;
    let ticking = false;

    function onScroll(){
      const y = window.scrollY || 0;
      const delta = y - lastY;

      // Don't hide at the very top
      if(y < 20){
        nav.classList.remove("nav--hidden");
        lastY = y;
        return;
      }

      if(delta > 8){
        // scrolling down
        nav.classList.add("nav--hidden");
      }else if(delta < -8){
        // scrolling up
        nav.classList.remove("nav--hidden");
      }
      lastY = y;
    }

    window.addEventListener("scroll", ()=>{
      if(!ticking){
        window.requestAnimationFrame(()=>{
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    }, {passive:true});
  
    /* ===================== Active nav highlighting ===================== */
  (function(){
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav__link").forEach(link=>{
      const href = link.getAttribute("href");
      link.classList.remove("is-active");
      if(href === path){
        link.classList.add("is-active");
      }
    });
  })();

})();


  /* ===================== Active nav highlighting ===================== */
  (function(){
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav__link").forEach(link=>{
      const href = link.getAttribute("href");
      if(!href) return;
      if(href === path){
        link.classList.add("is-active");
      }
      // Home page support
      if(path === "index.html" && (href === "index.html" || href === "./")){
        link.classList.add("is-active");
      }
    });
  })();

})();
