/* ============================================================
   THE MODELING LAB — app controller
   Linear lesson player (one concept per screen) + Arena.
   ============================================================ */

const LS_KEY = 'modeling-lab.v1';
const state = load();
function load(){ try{ return JSON.parse(localStorage.getItem(LS_KEY))||{}; }catch(e){ return {}; } }
function persist(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
state.pos        = state.pos        ?? 0;     // current global step index
state.maxReached = state.maxReached ?? 0;     // furthest unlocked step
state.answered   = state.answered   || {};    // {globalIndex:true} quiz cleared
state.schemas    = state.schemas    || {};    // {builderKey: schema}
state.solved     = state.solved     || {};    // {challengeId:true}

/* ---------- DOM helpers ---------- */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }
function ic(name,attrs=''){ return `<i data-lucide="${name}" ${attrs}></i>`; }
function icons(){ if(window.lucide) try{ lucide.createIcons(); }catch(e){} }
function esc(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function toast(msg, kind=''){ const t=$('#toast'); t.innerHTML=(kind==='good'?ic('check'):kind==='bad'?ic('x'):'')+`<span>${msg}</span>`; t.className='toast show '+kind; icons(); clearTimeout(t._t); t._t=setTimeout(()=>t.className='toast',2600); }

/* ---------- flatten modules into a linear step list ---------- */
const FLAT=[]; const MOD_START=[];
MODULES.forEach((m,mi)=>{ MOD_START[mi]=FLAT.length; m.steps.forEach((step,si)=>FLAT.push({gi:FLAT.length, mi, si, module:m, step})); });
const TOTAL=FLAT.length;
function moduleOf(gi){ return FLAT[gi].mi; }
function moduleUnlocked(mi){ return MOD_START[mi] <= state.maxReached; }
function moduleDone(mi){
  if(MODULES[mi].arena) return CHALLENGES.every(c=>state.solved[c.id]);
  const next = MOD_START[mi+1];
  return next!==undefined && state.maxReached >= next;
}

/* ---------- navigation ---------- */
function goStep(gi){
  gi=Math.max(0,Math.min(TOTAL-1,gi));
  state.pos=gi; state.maxReached=Math.max(state.maxReached,gi); persist();
  render(); window.scrollTo({top:0,behavior:'smooth'});
}
function goModule(mi){ if(moduleUnlocked(mi)) goStep(MOD_START[mi]); }

/* ============================================================
   SIDEBAR + TOPBAR
   ============================================================ */
function renderNav(){
  const nav=$('#moduleNav'); nav.innerHTML='';
  MODULES.forEach((m,mi)=>{
    const unlocked=moduleUnlocked(mi), done=moduleDone(mi), active=moduleOf(state.pos)===mi;
    const item=el(`<button class="mod ${active?'active':''} ${done?'done':''} ${unlocked?'':'locked'}">
        <span class="mod-ic">${ic(done?'check':m.icon)}</span>
        <span class="mod-label">${m.title}</span>
        ${m.arena?`<span class="mod-meta">${CHALLENGES.filter(c=>state.solved[c.id]).length}/${CHALLENGES.length}</span>`:''}
        ${unlocked?'':ic('lock','width=14 height=14')}
      </button>`);
    if(unlocked) item.onclick=()=>goModule(mi);
    nav.appendChild(item);
  });
  icons();
}
function renderTop(){
  $('#progressFill').style.width = (state.pos/(TOTAL-1)*100)+'%';
  const m=FLAT[state.pos].module;
  $('#progressLabel').textContent = m.arena ? 'The Arena' : `${m.title} · ${state.pos+1}/${TOTAL}`;
}

/* ============================================================
   STEP RENDERERS
   ============================================================ */
function render(){
  const {step}=FLAT[state.pos];
  renderNav(); renderTop();
  const stage=$('#stage'); stage.innerHTML='';
  const footer=$('#stepFooter');

  if(step.t==='arena'){ footer.style.display='none'; renderArena(stage); icons(); return; }
  footer.style.display='flex';

  const node = ({intro:renderIntro,demo:renderDemo,concept:renderConcept,quiz:renderQuiz}[step.t]||renderConcept)(step);
  stage.appendChild(node);
  renderFooter();
  icons();
}

function renderIntro(step){
  return el(`<div class="step center">
    <div class="eyebrow-row" style="justify-content:center"><span class="pill pill--coral">${ic('sparkles')} Cohort 7 · domain modeling</span></div>
    <h1 style="font-size:var(--fs-display);line-height:1.05">${step.title.replace(/\n/g,'<br>')}</h1>
    <p class="subtitle" style="font-size:var(--fs-h4);max-width:560px;margin:0 auto var(--space-4)">${step.subtitle}</p>
    <p class="body" style="max-width:600px;margin:0 auto;text-align:left">${step.body}</p>
  </div>`);
}

function renderConcept(step){
  return el(`<div class="step">
    <div class="eyebrow-row">${ic('circle-dot')}<span class="eyebrow eyebrow--accent">${step.eyebrow||'Concept'}</span></div>
    <h1>${step.title}</h1>
    ${step.subtitle?`<p class="subtitle">${step.subtitle}</p>`:''}
    ${step.body?`<p class="body">${step.body}</p>`:''}
    ${step.art||''}
  </div>`);
}

function renderQuiz(step){
  const gi=state.pos; const answered=!!state.answered[gi];
  const node=el(`<div class="step">
    <div class="eyebrow-row">${ic('help-circle')}<span class="eyebrow eyebrow--accent">${step.eyebrow||'Quick check'}</span></div>
    <h2 class="q-prompt">${step.prompt}</h2>
    ${step.scn?`<p class="q-scn">${step.scn}</p>`:''}
    <div class="choices"></div>
    <div class="explain"></div>
  </div>`);
  const choices=$('.choices',node), explain=$('.explain',node);
  step.options.forEach(opt=>{
    const b=el(`<button class="choice ${answered?'locked':''} ${answered&&opt.correct?'correct':''}"><span class="mark">${ic('check')}</span><span>${opt.label}</span></button>`);
    if(answered && opt.correct){ /* keep shown */ }
    b.onclick=()=>{
      if(state.answered[gi]) return;
      if(opt.correct){
        $$('.choice',choices).forEach(c=>c.classList.add('locked'));
        b.classList.add('correct');
        explain.innerHTML=`<div class="card card--surface">${ic('lightbulb')}<p>${opt.fb}</p></div>`;
        state.answered[gi]=true; persist();
        toast('Correct','good');
        $('#continueBtn').disabled=false; $('#continueBtn').classList.remove('is-off');
        icons();
      } else {
        b.classList.remove('wrong'); void b.offsetWidth; b.classList.add('wrong');
        explain.innerHTML=`<div class="card card--surface" style="border-color:#FDE68A">${ic('info')}<p>${opt.fb}</p></div>`;
        icons();
      }
    };
    choices.appendChild(b);
  });
  if(answered){ const o=step.options.find(x=>x.correct); explain.innerHTML=`<div class="card card--surface">${ic('lightbulb')}<p>${o.fb}</p></div>`; }
  return node;
}

/* amnesia demo */
function renderDemo(){
  const node=el(`<div class="step">
    <div class="eyebrow-row">${ic('zap')}<span class="eyebrow eyebrow--accent">Feel it first</span></div>
    <h1>Your app has amnesia.</h1>
    <p class="subtitle">Say something, then restart the server. Watch it forget.</p>
    <div class="demo-chat">
      <div class="demo-top"><span class="demo-status" id="dstat"><span class="dot"></span> server running</span><span class="mono" id="dmem" style="font-size:12px;color:var(--fg-muted)">memory: 0 msgs</span></div>
      <div class="demo-body" id="dbody"><div class="demo-empty">No messages yet — say something.</div></div>
      <div class="demo-in"><input class="input" id="din" placeholder="Type a message…" autocomplete="off"><button class="btn btn--primary btn--sm" id="dsend">Send</button></div>
    </div>
    <div class="row-wrap"><button class="btn btn--secondary btn--sm" id="drestart">${ic('rotate-ccw')} Restart server</button><span class="body-sm" id="dnote"></span></div>
    <p class="body mt-4">Everything a running program holds lives in <b>memory</b> — and memory dies the instant the program stops. To remember, you need a place outside the program. But a place to put things is useless until you know <b>what shape</b> those things are. That shape is what we model next.</p>
  </div>`);
  let msgs=[];
  const body=$('#dbody',node), input=$('#din',node);
  const draw=()=>{ body.innerHTML = msgs.length? msgs.map(m=>`<div class="bub ${m.r}">${esc(m.t)}</div>`).join('') : '<div class="demo-empty">No messages yet — say something.</div>'; body.scrollTop=body.scrollHeight; $('#dmem',node).textContent='memory: '+msgs.length+' msgs'; };
  const send=()=>{ const v=input.value.trim(); if(!v)return; msgs.push({r:'u',t:v}); msgs.push({r:'b',t:['Got it.','Noted.','Tell me more.','Sure thing.'][v.length%4]}); input.value=''; draw(); };
  $('#dsend',node).onclick=send; input.onkeydown=e=>{ if(e.key==='Enter')send(); };
  $('#drestart',node).onclick=()=>{
    if(!msgs.length){ toast('Send a message first'); return; }
    const had=msgs.length; msgs=[]; draw();
    const st=$('#dstat',node); st.classList.add('off'); st.innerHTML='<span class="dot"></span> restarting…';
    setTimeout(()=>{ const s2=$('#dstat',node); if(s2){ s2.classList.remove('off'); s2.innerHTML='<span class="dot"></span> server running'; } },700);
    $('#dnote',node).innerHTML=`<b style="color:var(--error)">${had} messages gone.</b> They lived in memory.`;
  };
  return node;
}

/* ---------- footer ---------- */
function renderFooter(){
  const gi=state.pos, {step}=FLAT[gi];
  const back=$('#backBtn'), cont=$('#continueBtn'), dots=$('#stepDots');
  back.style.visibility = gi===0 ? 'hidden':'visible';
  back.onclick=()=>goStep(gi-1);

  const blocked = step.t==='quiz' && !state.answered[gi];
  cont.disabled = blocked;
  const lastBeforeArena = gi===TOTAL-2;
  cont.innerHTML = (lastBeforeArena?'Enter the Arena ':'Continue ')+ic('arrow-right');
  cont.onclick=()=>{ if(!cont.disabled) goStep(gi+1); };

  // dots within current module
  const mi=moduleOf(gi); const start=MOD_START[mi]; const len=MODULES[mi].steps.length;
  dots.innerHTML='';
  for(let k=0;k<len;k++){ const g=start+k; dots.appendChild(el(`<span class="sdot ${g<gi?'done':''} ${g===gi?'cur':''}"></span>`)); }
  icons();
}

/* ============================================================
   SCHEMA BUILDER (shared by Arena)
   ============================================================ */
function blankCol(name='',type='text',key='none'){ return {name,type,key,fkRef:''}; }
function blankTable(name=''){ return {name,columns:[blankCol('id','id','pk')]}; }

function makeBuilder(mountSel, key, opts={}){
  const mount=$(mountSel);
  let schema=state.schemas[key];
  if(!schema){ schema=(opts.starter||['']).map(n=>blankTable(n)); state.schemas[key]=schema; persist(); }
  const save=()=>{ state.schemas[key]=schema; persist(); };
  const names=()=>schema.map(t=>t.name).filter(Boolean);

  function draw(){
    mount.innerHTML='';
    const grid=el(`<div class="tables-grid"></div>`);
    schema.forEach((t,ti)=>grid.appendChild(drawTable(t,ti)));
    mount.appendChild(grid); icons();
  }
  function drawTable(tbl,ti){
    const card=el(`<div class="tbl">
      <div class="tbl-head">${ic('table-2')}<input value="${esc(tbl.name)}" placeholder="table_name"><button class="icon-btn" title="delete table">${ic('trash-2')}</button></div>
      <div class="cols"></div></div>`);
    const ni=$('input',card); ni.oninput=()=>{ tbl.name=ni.value; save(); };
    $('.icon-btn',card).onclick=()=>{ schema.splice(ti,1); if(!schema.length)schema.push(blankTable('')); save(); draw(); };
    const cols=$('.cols',card);
    tbl.columns.forEach((c,ci)=>cols.appendChild(drawCol(tbl,c,ci)));
    const add=el(`<button class="btn btn--ghost btn--sm add-col">${ic('plus')} add column</button>`);
    add.onclick=()=>{ tbl.columns.push(blankCol()); save(); draw(); };
    cols.appendChild(add);
    return card;
  }
  function drawCol(tbl,col,ci){
    const others=names().filter(n=>n!==tbl.name);
    const row=el(`<div class="col-row">
      <input class="input col-name" value="${esc(col.name)}" placeholder="column">
      <select class="select type-sel">${COL_TYPES.map(t=>`<option ${col.type===t?'selected':''}>${t}</option>`).join('')}</select>
      <select class="select key-sel ${col.key}">
        <option value="none" ${col.key==='none'?'selected':''}>—</option>
        <option value="pk" ${col.key==='pk'?'selected':''}>PK</option>
        <option value="fk" ${col.key==='fk'?'selected':''}>FK</option></select>
      ${col.key==='fk'?`<select class="select fk-target"><option value="">→ table…</option>${others.map(n=>`<option ${col.fkRef===n?'selected':''}>${esc(n)}</option>`).join('')}</select>`:''}
      <button class="icon-btn col-del" title="remove">${ic('x','width=15 height=15')}</button></div>`);
    $('.col-name',row).oninput=e=>{ col.name=e.target.value; save(); };
    $('.type-sel',row).onchange=e=>{ col.type=e.target.value; save(); };
    $('.key-sel',row).onchange=e=>{ col.key=e.target.value; if(col.key!=='fk')col.fkRef=''; save(); draw(); };
    const ft=$('.fk-target',row);
    if(ft){ ft.onfocus=()=>{ const ns=names().filter(n=>n!==tbl.name); ft.innerHTML=`<option value="">→ table…</option>`+ns.map(n=>`<option ${col.fkRef===n?'selected':''}>${esc(n)}</option>`).join(''); }; ft.onchange=e=>{ col.fkRef=e.target.value; save(); }; }
    $('.col-del',row).onclick=()=>{ tbl.columns.splice(ci,1); save(); draw(); };
    return row;
  }
  draw();
  return { getSchema:()=>schema, addTable:()=>{schema.push(blankTable(''));save();draw();}, reset:()=>{schema=(opts.starter||['']).map(n=>blankTable(n));save();draw();} };
}

/* ---------- CSV / sheets / ER ---------- */
function sampleVal(col,n){
  if(col.key==='pk'||col.type==='id') return n;
  if(col.key==='fk') return 1;
  if(col.type==='number') return n*10;
  if(col.type==='date') return '2026-06-0'+n;
  if(col.type==='boolean') return n%2?'true':'false';
  return `${col.name}_${n}`;
}
function liveTables(schema){ return schema.filter(t=>t.name && t.columns.some(c=>c.name)); }
function schemaToCSV(schema){
  return liveTables(schema).map(t=>{
    const cols=t.columns.filter(c=>c.name);
    return `# ${t.name}.csv\n`+cols.map(c=>c.name).join(',')+'\n'+[1,2].map(n=>cols.map(c=>sampleVal(c,n)).join(',')).join('\n');
  }).join('\n\n');
}
function downloadCSV(schema,fname){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([schemaToCSV(schema)],{type:'text/csv'})); a.download=fname; a.click(); }
function renderSheets(schema){
  const tables=liveTables(schema);
  if(!tables.length) return '<p class="body-sm muted">Add tables and columns to preview the sheets.</p>';
  return tables.map(t=>{ const cols=t.columns.filter(c=>c.name);
    return `<div class="sheet"><h4>${ic('file-spreadsheet')} ${esc(t.name)}.csv</h4><div class="sheet-scroll"><table class="sheet-tbl">
      <tr>${cols.map(c=>`<th>${esc(c.name)}${c.key==='pk'?' ·pk':''}${c.key==='fk'?' ·fk':''}</th>`).join('')}</tr>
      ${[1,2].map(n=>`<tr>${cols.map(c=>`<td>${sampleVal(c,n)}</td>`).join('')}</tr>`).join('')}</table></div></div>`; }).join('');
}
function renderER(schema){
  const tables=liveTables(schema);
  if(!tables.length) return '<p class="body-sm muted">Add tables to see the ER diagram.</p>';
  const boxes=tables.map(t=>{ const cols=t.columns.filter(c=>c.name);
    return `<div class="er-box"><div class="er-box-h">${esc(t.name)}</div><ul>${cols.map(c=>`<li>${c.key!=='none'?`<span class="kt ${c.key}">${c.key}</span>`:'<span class="kt" style="visibility:hidden">··</span>'}${esc(c.name)}</li>`).join('')}</ul></div>`; }).join('');
  const rels=[];
  tables.forEach(t=>t.columns.forEach(c=>{ if(c.key==='fk'&&c.fkRef) rels.push(`<div class="rel">${esc(c.fkRef)} <span class="crow">1 ──&lt;∞</span> ${esc(t.name)} <span class="muted">(via ${esc(c.name)})</span></div>`); }));
  return `<div class="er-wrap"><div class="er-entities">${boxes}</div>${rels.length?`<div class="er-rels"><h4>Relationships</h4>${rels.join('')}</div>`:''}</div>`;
}

/* result banner */
function resultHTML(res){
  const msg=res.status==='pass'?'Schema accepted':res.status==='partial'?'Almost there':'Keep modeling';
  return `<div class="score ${res.status}"><div class="score-ring" style="--p:${res.pct}%"><span>${res.pct}</span></div>
    <div class="score-msg"><h2>${msg}</h2><p>${res.score.toFixed(0)} / ${res.max} points · pass at 85%</p></div></div>
    <ul class="fb-list">${res.feedback.map(f=>`<li class="fb ${f.type}">${ic({good:'check',miss:'x',warn:'alert-triangle',tip:'sparkles'}[f.type]||'circle')}<span>${f.html}</span></li>`).join('')}</ul>`;
}

/* ============================================================
   THE ARENA
   ============================================================ */
function renderArena(stage){
  if(state.arenaEx && CHALLENGES.find(c=>c.id===state.arenaEx)) return renderExercise(stage, CHALLENGES.find(c=>c.id===state.arenaEx));

  const tiers=[['beginner','Beginner','seedling'],['intermediate','Intermediate','trending-up'],['advanced','Advanced','flame']];
  const solvedCount=CHALLENGES.filter(c=>state.solved[c.id]).length;
  const wrap=el(`<div class="step step--wide">
    <div class="arena-head">
      <div class="eyebrow-row">${ic('dumbbell')}<span class="eyebrow eyebrow--accent">The Arena · ${solvedCount}/${CHALLENGES.length} solved</span></div>
      <h1>Model it yourself.</h1>
      <p class="subtitle">Pick a brief. Design the entities, attributes and relationships. Submit — the lab grades your schema live, like a senior engineer in review.</p>
    </div>
    <div id="tiers"></div>
    <div id="arenaCert"></div>
  </div>`);
  const tcont=$('#tiers',wrap);
  tiers.forEach(([key,label,icon])=>{
    const list=CHALLENGES.filter(c=>c.difficulty===key);
    const sec=el(`<div class="tier"><h3 class="tier-title h4">${ic(icon)} ${label}</h3><div class="ex-grid"></div></div>`);
    const grid=$('.ex-grid',sec);
    list.forEach(c=>{
      const solved=state.solved[c.id];
      const card=el(`<button class="ex-card"><div class="ex-top"><span class="diffpill ${c.difficulty}">${c.skill}</span>${solved?`<span class="ex-solved">${ic('check-circle-2')}</span>`:''}</div>
        <h3>${c.title}</h3><p>${c.blurb}</p></button>`);
      card.onclick=()=>{ state.arenaEx=c.id; persist(); render(); window.scrollTo({top:0}); };
      grid.appendChild(card);
    });
    tcont.appendChild(sec);
  });
  if(solvedCount===CHALLENGES.length) $('#arenaCert',wrap).innerHTML=certHTML();
  stage.appendChild(wrap);
}

function renderExercise(stage, ch){
  const wrap=el(`<div class="step step--wide">
    <button class="btn btn--ghost btn--sm" id="backList">${ic('arrow-left')} All exercises</button>
    <div class="ex-brief">
      <div class="row-wrap"><span class="diffpill ${ch.difficulty}">${ch.difficulty}</span><span class="pill pill--coral">${ic('target')} ${ch.skill}</span></div>
      <h2>${ch.title}</h2>
      <p class="story">${ch.story}</p>
      <ul class="ex-reqs">${ch.reqs.map(r=>`<li>${ic('chevron-right')}<span>${r}</span></li>`).join('')}</ul>
    </div>
    <div class="card" style="box-shadow:none;border:none;padding:0">
      <div class="work-toolbar">
        <button class="btn btn--secondary btn--sm" id="addTbl">${ic('plus')} Add table</button>
        <button class="btn btn--ghost btn--sm" id="resetTbl">${ic('rotate-ccw')} Reset</button>
        <span class="body-sm muted">${ch.rubric.entities.length} core entities expected</span>
      </div>
      <div id="builder"></div>
      <div style="margin-top:var(--space-3);display:flex;flex-direction:column;gap:8px">
        ${ch.hints.map((hh,i)=>`<details class="hint"><summary>${ic('lightbulb')} Hint ${i+1}</summary><div class="hint-body">${hh}</div></details>`).join('')}
      </div>
    </div>
    <div class="row-wrap" style="margin-top:var(--space-5)">
      <button class="btn btn--primary" id="submit">${ic('zap')} Submit for grading</button>
      <button class="btn btn--secondary btn--sm" id="erBtn">${ic('git-fork')} ER diagram</button>
      <button class="btn btn--secondary btn--sm" id="sheetBtn">${ic('table')} CSV sheets</button>
      <button class="btn btn--ghost btn--sm" id="csvBtn">${ic('download')} Download CSVs</button>
    </div>
    <div id="exResult" style="margin-top:var(--space-4)"></div>
  </div>`);
  stage.appendChild(wrap);

  const builder=makeBuilder('#builder','arena.'+ch.id,{starter:ch.starter});
  $('#backList',wrap).onclick=()=>{ delete state.arenaEx; persist(); render(); window.scrollTo({top:0}); };
  $('#addTbl',wrap).onclick=()=>builder.addTable();
  $('#resetTbl',wrap).onclick=()=>{ if(confirm('Reset this schema to the starter tables?')){ builder.reset(); $('#exResult',wrap).innerHTML=''; } };
  $('#erBtn',wrap).onclick=()=>{ $('#exResult',wrap).innerHTML=`<h3 class="h4" style="margin:var(--space-4) 0 var(--space-2)">ER diagram</h3>${renderER(builder.getSchema())}`; icons(); };
  $('#sheetBtn',wrap).onclick=()=>{ $('#exResult',wrap).innerHTML=`<h3 class="h4" style="margin:var(--space-4) 0 var(--space-2)">Your data as CSV sheets</h3>${renderSheets(builder.getSchema())}`; icons(); };
  $('#csvBtn',wrap).onclick=()=>downloadCSV(builder.getSchema(), ch.id+'_schema.csv');
  $('#submit',wrap).onclick=()=>{
    const res=gradeSchema(builder.getSchema(), ch);
    $('#exResult',wrap).innerHTML=resultHTML(res)+`<div style="margin-top:var(--space-4)"><h3 class="h4" style="margin:0 0 var(--space-2)">ER diagram</h3>${renderER(builder.getSchema())}</div>`;
    icons();
    if(res.status==='pass' && !state.solved[ch.id]){ state.solved[ch.id]=true; persist(); toast('Exercise solved','good'); }
    $('#exResult',wrap).scrollIntoView({behavior:'smooth',block:'start'});
  };
  icons();
}

function certHTML(){
  return `<div class="cert">
    <div class="big">100x</div>
    <h1>You modeled all ${CHALLENGES.length}.</h1>
    <p class="body" style="max-width:560px;margin:0 auto">You can now map any product into entities, attributes and relationships — junction tables, associative attributes, historical records and all — and ship it to CSV, Supabase, or a company's private database. That's the core skill behind every large-scale system.</p>
    <div class="card card--surface" style="text-align:left;margin-top:var(--space-5)"><p class="body" style="margin:0">${ic('arrow-right')} <b>Next:</b> there's a second way to remember — not by exact id, but by <b>meaning</b>. "Find the messages about billing", even if nobody wrote "billing". That's a vector database, and it's how RAG works. Same idea, different lookup.</p></div>
  </div>`;
}

/* ============================================================
   BOOT
   ============================================================ */
$('#homeLink').onclick=()=>goStep(0);
$('#resetBtn').onclick=()=>{ if(confirm('Wipe all progress and saved schemas?')){ localStorage.removeItem(LS_KEY); location.reload(); } };
$('#menuBtn').onclick=()=>{ $('#sidebar').classList.toggle('open'); };
render();
icons();
