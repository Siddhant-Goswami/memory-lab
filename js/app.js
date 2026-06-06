/* ============================================================
   THE MEMORY LAB — app controller
   ============================================================ */

const LS_KEY = 'memorylab.v1';
const state = load();

function load(){
  try{ return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch(e){ return {}; }
}
function save(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }

state.done    = state.done    || {};   // {stageId:true}
state.current = state.current || 'intro';
state.schemas = state.schemas || {};   // {builderKey: schemaArray}
state.stars   = state.stars   || {};   // {challengeId:true}

/* ---------- tiny DOM helpers ---------- */
const $  = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
function h(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }
function toast(msg, kind=''){ const t=$('#toast'); t.textContent=msg; t.className='toast show '+kind; clearTimeout(t._t); t._t=setTimeout(()=>t.className='toast',2200); }

/* ---------- progression ---------- */
function stageIndex(id){ return STAGES.findIndex(s=>s.id===id); }
function isUnlocked(i){
  if(i===0) return true;
  if(state.done[STAGES[i].id]) return true;
  return !!state.done[STAGES[i-1].id];
}
function markDone(id){
  if(!state.done[id]){ state.done[id]=true; save(); toast('Stage complete ✓','good'); }
  renderNav(); renderProgress();
}
function go(id){ state.current=id; save(); renderNav(); render(); window.scrollTo({top:0,behavior:'smooth'}); }

/* ---------- sidebar ---------- */
function renderNav(){
  const nav=$('#stageNav'); nav.innerHTML='';
  STAGES.forEach((s,i)=>{
    const unlocked=isUnlocked(i), done=state.done[s.id], active=state.current===s.id;
    const item=h(`<div class="nav-item ${active?'active':''} ${done?'done':''} ${unlocked?'':'locked'}">
        <div class="nav-num"><span>${s.num}</span></div>
        <div class="nav-label">${s.label}<div class="nav-tag">${s.tag}</div></div>
        ${unlocked?'':'<span style="font-size:13px">🔒</span>'}
      </div>`);
    if(unlocked) item.onclick=()=>go(s.id);
    nav.appendChild(item);
  });
}
function renderProgress(){
  const total=STAGES.length, done=Object.keys(state.done).filter(k=>STAGES.some(s=>s.id===k)).length;
  const pct=Math.round(done/total*100);
  $('#progressFill').style.width=pct+'%';
  $('#progressText').textContent=`${pct}% complete · ${done}/${total} stages`;
}

/* ---------- shared building blocks ---------- */
function head(eyebrow,title,lede){
  return `<div class="stage-head">
    <div class="eyebrow">${eyebrow}</div>
    <h1>${title}</h1>
    <p class="lede">${lede}</p></div>`;
}
function nextBtn(id, label='Next stage →'){
  const i=stageIndex(id);
  const next=STAGES[i+1];
  if(!next) return `<button class="btn" id="finishBtn">Finish the lab 🏁</button>`;
  return `<button class="btn" id="nextBtn">${label}</button>`;
}
function wireNext(id){
  const i=stageIndex(id), next=STAGES[i+1];
  const b=$('#nextBtn'); if(b) b.onclick=()=>go(next.id);
  const f=$('#finishBtn'); if(f) f.onclick=()=>go('intro'); // loop back; completion shown in arena
}

/* ============================================================
   STAGE 1 — THE AMNESIA PROBLEM
   ============================================================ */
function renderIntro(c){
  c.innerHTML = head('Feel it first','The Amnesia Problem',
    `Close ChatGPT, open it tomorrow — your chats are still there. Where do they live? They are <b>not</b> inside the model. Let\'s find out where, by breaking things.`)
  + `<div class="card">
      <h2>Step A — talk to a system with no memory</h2>
      <p>Type a few messages. Then hit <b>Restart server</b> — the way you\'d restart a FastAPI app or refresh a Lovable page.</p>
      <div class="chat-demo">
        <div class="chat-top"><div><span class="chat-dot" id="srvDot"></span><span id="srvLbl">server running</span></div><div class="mem-meter" id="memMeter">memory: 0 msgs</div></div>
        <div class="chat-body" id="chatBody"><div class="chat-empty">No messages yet — say something.</div></div>
        <div class="chat-input"><input id="chatInput" placeholder="Type a message and press Enter…" autocomplete="off"><button class="btn sm" id="sendBtn">Send</button></div>
      </div>
      <div class="btn-row"><button class="btn secondary" id="restartBtn">⟳ Restart server</button><span class="muted" id="amnesiaNote"></span></div>
    </div>
    <div class="card" id="stepB" style="opacity:.45;pointer-events:none">
      <h2>Step B — “just save it to a file”</h2>
      <p>Fine — write every message to a file. It survives a restart now. Problem solved? Press the button and watch what happens when your app gets popular.</p>
      <div class="btn-row"><button class="btn secondary" id="scaleBtn">📈 Ship it &amp; go viral (10,000 users)</button></div>
      <div id="scaleOut"></div>
    </div>
    <div id="introCallouts"></div>
    <div class="btn-row" id="introNext" style="display:none">${nextBtn('intro')}</div>`;

  // chat demo
  let msgs=[];
  const body=$('#chatBody'), input=$('#chatInput');
  const render=()=>{
    if(!msgs.length){ body.innerHTML='<div class="chat-empty">No messages yet — say something.</div>'; }
    else body.innerHTML=msgs.map(m=>`<div class="bubble ${m.role}">${m.text}</div>`).join('');
    body.scrollTop=body.scrollHeight;
    $('#memMeter').textContent='memory: '+msgs.length+' msgs';
  };
  const send=()=>{
    const v=input.value.trim(); if(!v) return;
    msgs.push({role:'user',text:v});
    msgs.push({role:'bot',text:botReply(v)});
    input.value=''; render();
  };
  $('#sendBtn').onclick=send;
  input.onkeydown=e=>{ if(e.key==='Enter') send(); };
  $('#restartBtn').onclick=()=>{
    if(!msgs.length){ toast('Send a message first, then restart'); return; }
    const had=msgs.length;
    msgs=[]; render();
    $('#srvDot').classList.add('off'); $('#srvLbl').textContent='restarting…';
    setTimeout(()=>{ // guard: user may have navigated away before this fires
      const dot=$('#srvDot'), lbl=$('#srvLbl');
      if(dot) dot.classList.remove('off'); if(lbl) lbl.textContent='server running';
    },700);
    $('#amnesiaNote').innerHTML=`💀 <b>${had} messages gone.</b> They lived in <b>memory</b>, which dies the moment the program stops.`;
    // unlock step B
    const sb=$('#stepB'); sb.style.opacity='1'; sb.style.pointerEvents='auto';
  };

  // scale break
  $('#scaleBtn').onclick=()=>{
    const out=$('#scaleOut');
    out.innerHTML=`<div class="callout warn"><span class="tag">The file cracks</span>
      <p>A file survived the restart — but with 10,000 people writing at once it falls apart:</p></div>
      <ul class="brief reqs" style="margin-top:0">
        <li><b>Collisions:</b> two writes hit the same file → one overwrites the other.</li>
        <li><b>Search:</b> “find every draft by Aarav” means scanning the whole file by hand.</li>
        <li><b>Corruption:</b> one bad write and you lose <i>everything</i>.</li>
        <li><b>Access control:</b> a file can\'t decide who is allowed to see what.</li>
      </ul>`;
    $('#introCallouts').innerHTML=`<div class="callout key"><span class="tag">The two questions</span>
      <p><b>Persistence</b> asks: does it survive a restart? A file says yes. <b>Scale</b> asks: does it survive ten thousand users searching, updating and writing at once? Only a <b>database</b> says yes.</p></div>`;
    $('#introNext').style.display='flex';
    markDone('intro'); wireNext('intro');
  };

  // on revisit, unlock Step B straight away (Step A already done before)
  if(state.done.intro){
    const sb=$('#stepB'); sb.style.opacity='1'; sb.style.pointerEvents='auto';
  }
}
function botReply(v){
  const r=['Got it — noted.','Interesting, tell me more.','Here\'s a thought on that…','Sure, let\'s explore it.','Makes sense.'];
  return r[v.length % r.length];
}

/* ============================================================
   STAGE 2 — THE STORAGE LADDER
   ============================================================ */
function renderLadder(c){
  const rungs=[
    {n:'In-memory', d:'Variables while the app runs', survive:'No', good:'Prototypes, short-lived state', breaks:'Dies the instant the program stops'},
    {n:'File-based', d:'.json, .csv, a spreadsheet', survive:'Yes', good:'Small projects, early MVPs, logs', breaks:'Search, concurrency, corruption, safe updates, access control, size'},
    {n:'Database', d:'Structured store built for scale', survive:'Yes', good:'Real users, search, reliable updates, security, analytics', breaks:'Almost nothing at this stage'},
  ];
  const quiz=[
    {scn:'A throwaway script that totals numbers and exits.', a:'In-memory'},
    {scn:'A weekend bot saving 50 quotes to quotes.json.', a:'File-based'},
    {scn:'A LinkedIn post generator with 10,000 users all saving drafts at once.', a:'Database'},
    {scn:'Logging a few debug lines while you build.', a:'File-based'},
  ];
  c.innerHTML = head('Climb, don\'t assume','The Storage Ladder',
    `There are three rungs. Climb them in order so the database is <b>derived</b>, not assumed. Each rung is great — until the moment it breaks.`)
  + `<div class="card"><div class="sample-wrap"><table class="sample">
      <tr><th>Rung</th><th>What it is</th><th>Survives restart?</th><th>Good for</th><th>Where it breaks</th></tr>
      ${rungs.map(r=>`<tr><td style="color:var(--accent);font-weight:600">${r.n}</td><td>${r.d}</td><td>${r.survive==='Yes'?'<span style="color:var(--good)">Yes</span>':'<span style="color:var(--bad)">No</span>'}</td><td>${r.good}</td><td style="color:var(--txt-dim)">${r.breaks}</td></tr>`).join('')}
    </table></div>
    <div class="callout key"><span class="tag">Key insight</span><p>A file just holds bytes. A database holds <b>answers</b> — “every draft by this user”, “every post made with this model”, “everything from the last 7 days”.</p></div></div>
    <div class="card"><h2>Now you place each one</h2>
      <p>Pick the lowest rung that survives. Don\'t reach for a database when a variable will do — but know exactly when it breaks.</p>
      <div id="ladderQuiz"></div>
      <div class="btn-row" id="ladderNext" style="display:none">${nextBtn('ladder')}</div>
    </div>`;

  const qWrap=$('#ladderQuiz');
  quiz.forEach((q,i)=>{
    const row=h(`<div class="match-row"><div class="match-mark"></div><div class="match-scn">${q.scn}</div>
      <select class="match-select"><option value="">choose a rung…</option>${rungs.map(r=>`<option>${r.n}</option>`).join('')}</select></div>`);
    const sel=$('select',row), mark=$('.match-mark',row);
    sel.onchange=()=>{
      const ok=sel.value===q.a;
      row.classList.toggle('ok',ok); row.classList.toggle('no',!ok&&!!sel.value);
      mark.textContent= sel.value? (ok?'✓':'✕') : '';
      mark.style.color= ok?'var(--good)':'var(--bad)';
      checkLadder();
    };
    qWrap.appendChild(row);
  });
  function checkLadder(){
    const allOk=quiz.every((q,i)=>$$('.match-select',qWrap)[i].value===q.a);
    if(allOk){ $('#ladderNext').style.display='flex'; markDone('ladder'); wireNext('ladder'); }
  }
}

/* ============================================================
   STAGE 3 — THE STAKES
   ============================================================ */
function renderStakes(c){
  c.innerHTML = head('Why it pays','A $10 Tool or a $100,000 Deployment',
    `Architecture isn\'t optional — even for the no-code room. Knowing <b>where your data lives</b> is the difference between a toy and an enterprise sale.`)
  + `<div class="card">
      <p>A Fortune-500 company loves your app and says: <i>“We can\'t send our data to your Lovable project or any public cloud. Deploy it inside our own walls.”</i> What do you say back?</p>
      <div class="two-col">
        <div class="callout"><span class="tag">Cloud = renting</span><p>You don\'t know tomorrow\'s demand, so you rent infrastructure and scale on demand. AWS, GCP, Azure, Supabase, Railway, Render.</p></div>
        <div class="callout"><span class="tag">On-premise = owning</span><p>Strict data rules, regulation, sensitive data → keep everything inside your own network. Private cloud, VPC, VPN, on-prem.</p></div>
      </div>
      <div class="callout key"><span class="tag">The fork</span><p>If you only know the no-code tool, you can build a good MVP. If you understand the architecture underneath, you can deploy and sell a serious enterprise solution. The database is the first piece of that understanding.</p></div>
    </div>
    <div class="card"><h2>Your move</h2>
      <p>The company can\'t use public cloud. What\'s the honest, architecture-aware answer?</p>
      <div id="stakeOpts"></div>
      <div class="btn-row" id="stakeNext" style="display:none">${nextBtn('stakes')}</div>
    </div>`;
  const opts=[
    {t:'“Sorry, my tool only runs on the public cloud.”', ok:false, fb:'That\'s the $10 answer — you just lost the deal.'},
    {t:'“The schema is the same everywhere. I\'ll deploy the database and app inside your VPC / on-prem.”', ok:true, fb:'That\'s the $100k answer. The data model is portable — laptop, cloud, or private network.'},
    {t:'“Let\'s just email them a spreadsheet.”', ok:false, fb:'A file can\'t give an enterprise search, concurrency, or access control.'},
  ];
  const wrap=$('#stakeOpts');
  opts.forEach(o=>{
    const b=h(`<div class="match-row" style="cursor:pointer"><div class="match-mark"></div><div class="match-scn">${o.t}</div></div>`);
    b.onclick=()=>{
      $$('.match-row',wrap).forEach(r=>{r.classList.remove('ok','no');$('.match-mark',r).textContent='';});
      b.classList.toggle('ok',o.ok); b.classList.toggle('no',!o.ok);
      $('.match-mark',b).textContent=o.ok?'✓':'✕'; $('.match-mark',b).style.color=o.ok?'var(--good)':'var(--bad)';
      toast(o.fb, o.ok?'good':'bad');
      if(o.ok){ $('#stakeNext').style.display='flex'; markDone('stakes'); wireNext('stakes'); }
    };
    wrap.appendChild(b);
  });
}

/* ============================================================
   STAGE 4 — SPOT THE ENTITY (CRUD test sorter)
   ============================================================ */
function renderSorter(c){
  c.innerHTML = head('The CRUD test','Spot the Entity',
    `Before you store anything, you name three things: <b>entities</b> (the nouns), <b>attributes</b> (what they have), and relationships. Here\'s the filter: can you <b>C</b>reate, <b>R</b>ead, <b>U</b>pdate, <b>D</b>elete it on its own? If yes → entity. If it only <i>describes</i> something else → attribute.`)
  + `<div class="card">
      <p class="muted">Click a card, then click a bin — or drag it. Get one wrong and it\'ll tell you why.</p>
      <div class="chip-pool" id="pool"></div>
      <div class="bins">
        <div class="bin bin-entity" data-bin="entity">
          <div class="bin-title">📦 Entity <span class="pill">own table</span></div>
          <div class="bin-hint">Passes the CRUD test as its own thing.</div>
          <div class="bin-drop" id="dropEntity"></div>
        </div>
        <div class="bin bin-attr" data-bin="attribute">
          <div class="bin-title">🏷️ Attribute <span class="pill">a column</span></div>
          <div class="bin-hint">Only describes another thing — can\'t exist alone.</div>
          <div class="bin-drop" id="dropAttr"></div>
        </div>
      </div>
      <div class="legend"><span><span class="dot e"></span> entity = a table</span><span><span class="dot a"></span> attribute = a column</span></div>
      <div class="callout key" style="margin-top:18px"><span class="tag">The classic argument</span><p>“Style of writing” feels important, but it can\'t be created or deleted by itself — it only describes a post. So it\'s an <b>attribute of Post</b>, not an entity. Arguing this boundary <i>is</i> the skill.</p></div>
      <div class="btn-row" id="sorterNext" style="display:none">${nextBtn('entities')}</div>
    </div>`;

  const pool=$('#pool');
  // shuffle for replayability
  const items=[...SORTER_ITEMS].sort(()=>Math.random()-0.5);
  let selected=null;
  items.forEach((it,idx)=>{
    const chip=h(`<div class="chip" draggable="true" data-i="${idx}">${it.t}</div>`);
    chip._item=it;
    chip.onclick=()=>{
      $$('.chip',pool).forEach(x=>x.classList.remove('dragging'));
      if(selected===chip){ selected=null; chip.classList.remove('dragging'); }
      else { selected=chip; chip.classList.add('dragging'); }
    };
    chip.ondragstart=e=>{ selected=chip; chip.classList.add('dragging'); };
    chip.ondragend=()=>chip.classList.remove('dragging');
    pool.appendChild(chip);
  });

  $$('.bin').forEach(bin=>{
    bin.ondragover=e=>{e.preventDefault();bin.classList.add('over');};
    bin.ondragleave=()=>bin.classList.remove('over');
    bin.ondrop=e=>{e.preventDefault();bin.classList.remove('over');place(bin);};
    bin.onclick=()=>{ if(selected) place(bin); };
  });

  function place(bin){
    if(!selected) return;
    const chip=selected, it=chip._item, want=bin.dataset.bin;
    selected=null;
    if(it.answer===want){
      chip.classList.remove('dragging'); chip.classList.add('correct');
      chip.draggable=false; chip.onclick=null;
      chip.innerHTML=`${it.t} <span class="why">✓ ${it.why}</span>`;
      $('.bin-drop',bin).appendChild(chip);
      checkDone();
    } else {
      chip.classList.add('wrong');
      toast(`Not quite — ${it.t} is an ${it.answer}. ${it.why}.`,'bad');
      setTimeout(()=>chip.classList.remove('wrong','dragging'),400);
    }
  }
  function checkDone(){
    if(!$('.chip',pool)){ pool.classList.add('empty'); $('#sorterNext').style.display='flex'; markDone('entities'); wireNext('entities'); }
  }
}

/* ============================================================
   STAGE 5 — CONNECT THE DOTS (relationships)
   ============================================================ */
function renderMatch(c){
  c.innerHTML = head('How things connect','Connect the Dots',
    `A spreadsheet stores attributes. A database stores attributes <b>and relationships</b> — that\'s the whole reason it exists. Three shapes cover almost everything.`)
  + `<div class="card"><div class="two-col">
      <div class="callout"><span class="tag">one-to-one</span><p>each A has exactly one B — a user has one profile</p></div>
      <div class="callout"><span class="tag">one-to-many</span><p>one A has many B — one user has many posts</p></div>
      <div class="callout" style="grid-column:1/-1"><span class="tag">many-to-many</span><p>many A connect to many B — screenshots used across many posts</p></div>
    </div></div>
    <div class="card"><h2>Name the shape</h2><p>Pick the relationship for each scenario. Watch for the sneaky many-to-many.</p>
      <div id="matchRows"></div>
      <div class="btn-row" id="matchNext" style="display:none">${nextBtn('relationships')}</div>
    </div>`;
  const wrap=$('#matchRows');
  const rows=[...MATCH_ROWS].sort(()=>Math.random()-0.5);
  rows.forEach(r=>{
    const row=h(`<div class="match-row"><div class="match-mark"></div><div class="match-scn">${r.scn}</div>
      <select class="match-select"><option value="">choose…</option>${MATCH_OPTIONS.map(o=>`<option value="${o.v}">${o.label}</option>`).join('')}</select></div>`);
    const sel=$('select',row), mark=$('.match-mark',row);
    sel.onchange=()=>{
      const ok=sel.value===r.answer;
      row.classList.toggle('ok',ok); row.classList.toggle('no',!ok&&!!sel.value);
      mark.textContent=sel.value?(ok?'✓':'✕'):''; mark.style.color=ok?'var(--good)':'var(--bad)';
      if(!ok&&sel.value){
        const lbl=MATCH_OPTIONS.find(o=>o.v===r.answer).label;
        toast('Look again — that one is '+lbl.toLowerCase(),'bad');
      }
      if(rows.every((rr,i)=>$$('.match-select',wrap)[i].value===rr.answer)){
        $('#matchNext').style.display='flex'; markDone('relationships'); wireNext('relationships');
      }
    };
    wrap.appendChild(row);
  });
}

/* ============================================================
   STAGE 6 — FOLLOW THE KEY (PK / FK)
   ============================================================ */
function renderKeys(c){
  c.innerHTML = head('The universal grammar','Follow the Key',
    `A <b>table</b> holds one entity. A <b>row</b> is one instance. A <b>column</b> is one attribute. A <b>primary key</b> is a row\'s unique address. A <b>foreign key</b> is a column holding another table\'s key — how a row <b>points at</b> another row.`)
  + `<div class="card"><pre><span class="cmt">USERS              CONVERSATIONS                      MESSAGES</span>
 id | name          id | user_id | title              id | conversation_id | role | content
 1  | Aarav         7  | <span class="fk">1</span>       | "Jira to Slack"    31 | <span class="fk">7</span>               | user | "I open Jira..."
                         <span class="fk">^ FK → USERS.id</span>                    <span class="fk">^ FK → CONVERSATIONS.id</span></pre>
    <div class="callout key"><span class="tag">Key insight</span><p>One-to-many is not a feeling, it\'s a foreign key. “One conversation has many messages” becomes “every message carries the id of its conversation.” Trace it: <b>message 31 → conversation 7 → user 1</b>.</p></div></div>
    <div class="card"><h2>Prove you can read the keys</h2>
      <div id="keyQ"></div>
      <div class="btn-row" id="keysNext" style="display:none">${nextBtn('keys')}</div>
    </div>`;

  const wrap=$('#keyQ');
  KEYS_QUESTIONS.forEach((q,qi)=>{
    const block=h(`<div style="margin-bottom:22px"><p style="color:var(--txt);font-weight:600">${qi+1}. ${q.q}</p><div class="opts"></div><div class="exp"></div></div>`);
    const opts=$('.opts',block), exp=$('.exp',block);
    q.options.forEach((opt,oi)=>{
      const b=h(`<div class="match-row" style="cursor:pointer;padding:10px 14px"><div class="match-mark"></div><div class="match-scn">${opt}</div></div>`);
      b.onclick=()=>{
        if(block._answered) return;
        const ok=oi===q.answer;
        b.classList.toggle('ok',ok); b.classList.toggle('no',!ok);
        $('.match-mark',b).textContent=ok?'✓':'✕'; $('.match-mark',b).style.color=ok?'var(--good)':'var(--bad)';
        if(ok){
          block._answered=true;
          exp.innerHTML=`<div class="callout" style="margin-top:10px"><p>${q.explain}</p></div>`;
          checkKeys();
        } else {
          toast('Try another option','bad');
          setTimeout(()=>{b.classList.remove('no');$('.match-mark',b).textContent='';},500);
        }
      };
      opts.appendChild(b);
    });
    wrap.appendChild(block);
  });
  function checkKeys(){
    if($$('#keyQ .opts').every((_,i)=>$$('#keyQ > div')[i]._answered)){
      $('#keysNext').style.display='flex'; markDone('keys'); wireNext('keys');
    }
  }
}

/* ============================================================
   SCHEMA BUILDER (shared by Studio + Arena)
   ============================================================ */
function blankCol(name='', type='text', key='none'){ return {name, type, key, fkRef:''}; }
function blankTable(name=''){ return {name, columns:[blankCol('id','id','pk')]}; }

function makeBuilder(mountSel, key, opts={}){
  const mount=$(mountSel);
  let schema = state.schemas[key];
  if(!schema){
    schema = (opts.starter||[]).map(n=>blankTable(n));
    if(!schema.length) schema=[blankTable('')];
    state.schemas[key]=schema; save();
  }

  function persist(){ state.schemas[key]=schema; save(); }
  function tableNames(){ return schema.map(t=>t.name).filter(Boolean); }

  function draw(){
    mount.innerHTML='';
    const grid=h(`<div class="tables-grid"></div>`);
    schema.forEach((tbl,ti)=>grid.appendChild(drawTable(tbl,ti)));
    mount.appendChild(grid);
  }

  function drawTable(tbl,ti){
    const card=h(`<div class="tbl">
      <div class="tbl-head"><span class="tbl-icon">📦</span>
        <input class="tname" value="${esc(tbl.name)}" placeholder="table_name"/>
        <button class="tbl-del" title="delete table">🗑</button></div>
      <div class="cols"></div>
    </div>`);
    const nameInp=$('.tname',card);
    nameInp.oninput=()=>{ tbl.name=nameInp.value; persist(); };
    $('.tbl-del',card).onclick=()=>{ schema.splice(ti,1); if(!schema.length)schema.push(blankTable('')); persist(); draw(); };

    const cols=$('.cols',card);
    tbl.columns.forEach((col,ci)=>cols.appendChild(drawCol(tbl,col,ci)));
    const add=h(`<button class="add-col">+ add column</button>`);
    add.onclick=()=>{ tbl.columns.push(blankCol()); persist(); draw(); };
    cols.appendChild(add);
    return card;
  }

  function drawCol(tbl,col,ci){
    const others=tableNames();
    const row=h(`<div class="col-row">
      <input class="col-name" value="${esc(col.name)}" placeholder="column"/>
      <select class="type-sel">${COL_TYPES.map(t=>`<option ${col.type===t?'selected':''}>${t}</option>`).join('')}</select>
      <select class="key-sel ${col.key==='pk'?'fk-pk':''} ${col.key==='fk'?'fk-fk':''}">
        <option value="none" ${col.key==='none'?'selected':''}>—</option>
        <option value="pk" ${col.key==='pk'?'selected':''}>PK</option>
        <option value="fk" ${col.key==='fk'?'selected':''}>FK</option>
      </select>
      ${col.key==='fk'?`<select class="fk-target"><option value="">→ table…</option>${others.map(n=>`<option value="${esc(n)}" ${col.fkRef===n?'selected':''}>→ ${esc(n)}</option>`).join('')}</select>`:''}
      <button class="col-del" title="remove">✕</button>
    </div>`);
    $('.col-name',row).oninput=e=>{ col.name=e.target.value; persist(); };
    $('.type-sel',row).onchange=e=>{ col.type=e.target.value; persist(); };
    $('.key-sel',row).onchange=e=>{ col.key=e.target.value; if(col.key!=='fk')col.fkRef=''; persist(); draw(); };
    const ft=$('.fk-target',row);
    if(ft){
      // rebuild options live on focus so they reflect the latest table names
      ft.onfocus=()=>{
        const names=tableNames().filter(n=>n!==tbl.name);
        ft.innerHTML=`<option value="">→ table…</option>`+names.map(n=>`<option value="${esc(n)}" ${col.fkRef===n?'selected':''}>→ ${esc(n)}</option>`).join('');
      };
      ft.onchange=e=>{ col.fkRef=e.target.value; persist(); };
    }
    $('.col-del',row).onclick=()=>{ tbl.columns.splice(ci,1); persist(); draw(); };
    return row;
  }

  draw();
  return {
    getSchema:()=>schema,
    addTable:()=>{ schema.push(blankTable('')); persist(); draw(); },
    reset:()=>{ schema=(opts.starter||['']).map(n=>blankTable(n)); persist(); draw(); },
  };
}
function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ---------- CSV export + sheet preview ---------- */
function schemaToCSV(schema){
  // each table -> a CSV block with header row, plus 2 illustrative rows
  return schema.filter(t=>t.name && t.columns.some(c=>c.name)).map(t=>{
    const cols=t.columns.filter(c=>c.name);
    const header=cols.map(c=>c.name).join(',');
    const rows=[1,2].map(n=>cols.map(c=>sampleVal(c,n)).join(',')).join('\n');
    return `# ${t.name}.csv\n${header}\n${rows}`;
  }).join('\n\n');
}
function sampleVal(col,n){
  if(col.key==='pk'||col.type==='id') return n;
  if(col.key==='fk') return 1;            // points at row 1 of the referenced table
  if(col.type==='number') return (n*10);
  if(col.type==='date') return '2026-06-0'+n;
  if(col.type==='boolean') return n%2?'true':'false';
  return `${col.name}_${n}`;
}
function downloadCSV(schema, fname){
  const blob=new Blob([schemaToCSV(schema)],{type:'text/csv'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname; a.click();
}
function renderSheets(schema){
  const tables=schema.filter(t=>t.name && t.columns.some(c=>c.name));
  if(!tables.length) return '<p class="muted">Add some tables and columns to preview the sheets.</p>';
  return tables.map(t=>{
    const cols=t.columns.filter(c=>c.name);
    return `<h3 style="font-family:var(--mono)">📄 ${esc(t.name)}.csv</h3>
    <div class="sample-wrap"><table class="sample">
      <tr>${cols.map(c=>`<th>${esc(c.name)}${c.key==='pk'?' 🔑':''}${c.key==='fk'?' 🔗':''}</th>`).join('')}</tr>
      ${[1,2].map(n=>`<tr>${cols.map(c=>`<td>${sampleVal(c,n)}</td>`).join('')}</tr>`).join('')}
    </table></div>`;
  }).join('');
}

/* ============================================================
   STAGE 7 — THE SCHEMA STUDIO (guided build of the chat app)
   ============================================================ */
const CHAT_RUBRIC = {
  entities:[
    {name:'users', aliases:['user','accounts','account'], attrs:[{name:'id',role:'pk'},{name:'name',aliases:['username']},{name:'email',required:false}]},
    {name:'conversations', aliases:['conversation','chats','chat','threads','thread'], attrs:[{name:'id',role:'pk'},{name:'user_id',role:'fk',ref:'users'},{name:'title',required:false},{name:'created_at',required:false,aliases:['date']}]},
    {name:'messages', aliases:['message','msgs','msg'], attrs:[{name:'id',role:'pk'},{name:'conversation_id',role:'fk',ref:'conversations'},{name:'role',required:false},{name:'content',aliases:['text','body']},{name:'created_at',required:false,aliases:['date']}]},
  ],
  relationships:[
    {label:'one user → many conversations', fk:{table:'conversations',ref:'users'}},
    {label:'one conversation → many messages', fk:{table:'messages',ref:'conversations'}},
  ],
};
function renderStudio(c){
  c.innerHTML = head('Build it','The Schema Studio',
    `Time to model the app this cohort already built: <b>the chat app</b>. You answered the Lecture-03 question — “where did my chats go?” — they live in these tables. Build them, then check your work. The grammar is identical in SQLite, Supabase, Airtable or Sheets.`)
  + `<div class="card">
      <h2>Your target</h2>
      <p>Model a chat system: <b>users</b> have many <b>conversations</b>, and each conversation has many <b>messages</b>. Put the foreign keys on the right side. Mark one <code>PK</code> per table and the <code>FK</code> columns that link them.</p>
      <details class="hint-box"><summary>Need the recipe?</summary>
        <p>1. The nouns are your tables: users, conversations, messages.<br>2. Give each a primary key (<code>id</code>).<br>3. A conversation belongs to one user → <code>conversations.user_id (FK → users)</code>.<br>4. A message belongs to one conversation → <code>messages.conversation_id (FK → conversations)</code>.</p>
      </details>
      <div class="builder-toolbar" style="margin-top:16px">
        <button class="btn sm" id="addTbl">＋ Add table</button>
        <button class="btn sm secondary" id="resetTbl">↺ Reset to starter</button>
        <span class="muted">Tip: use the FK dropdown to point a column at another table.</span>
      </div>
      <div id="builder"></div>
    </div>
    <div class="card">
      <div class="btn-row" style="margin-top:0">
        <button class="btn" id="checkBtn">✓ Check my schema</button>
        <button class="btn secondary" id="previewBtn">📄 Preview as CSV sheets</button>
        <button class="btn secondary" id="csvBtn">⬇ Download CSVs</button>
      </div>
      <div id="studioResult"></div>
    </div>
    <div class="btn-row" id="studioNext" style="display:none">${nextBtn('studio')}</div>`;

  const builder=makeBuilder('#builder','studio.chat',{starter:['users','conversations','messages']});
  $('#addTbl').onclick=()=>builder.addTable();
  $('#resetTbl').onclick=()=>{ builder.reset(); $('#studioResult').innerHTML=''; };
  $('#previewBtn').onclick=()=>{ $('#studioResult').innerHTML=`<h2 style="margin-top:18px">Your data as sheets</h2>${renderSheets(builder.getSchema())}`; };
  $('#csvBtn').onclick=()=>downloadCSV(builder.getSchema(),'chat_app_schema.csv');
  $('#checkBtn').onclick=()=>{
    const res=gradeSchema(builder.getSchema(), {rubric:CHAT_RUBRIC});
    $('#studioResult').innerHTML=resultHTML(res);
    if(res.status==='pass'){ $('#studioNext').style.display='flex'; markDone('studio'); wireNext('studio'); }
  };
}

/* shared result renderer */
function resultHTML(res){
  const cls=res.status;
  const msg = res.status==='pass'?'Schema accepted':res.status==='partial'?'Almost there':'Not yet';
  return `<div class="score-banner ${cls}" style="margin-top:18px">
    <div class="score-ring" style="--p:${res.pct}%"><span>${res.pct}</span></div>
    <div class="score-msg"><h2>${msg}</h2><p class="muted">${res.score.toFixed(1)} / ${res.max} points · pass at 85%</p></div>
  </div>
  <ul class="feedback-list">${res.feedback.map(f=>`<li class="fb ${f.type}"><span class="fb-icon">${f.icon}</span><span>${f.html}</span></li>`).join('')}</ul>`;
}

/* ============================================================
   STAGE 8 — THE ARENA
   ============================================================ */
function renderArena(c){
  const allStarred = CHALLENGES.every(ch=>state.stars[ch.id]);
  c.innerHTML = head('Challenge mode','The Arena',
    `LeetCode, but for domain modeling. Read the brief, design the entities, attributes, keys and relationships, and hit <b>Submit</b>. The grader checks your schema the way a senior engineer would in review. Solve all three to complete the lab.`)
  + `<div class="arena-tabs" id="arenaTabs">${CHALLENGES.map(ch=>`<div class="arena-tab" data-id="${ch.id}">${ch.title}${state.stars[ch.id]?' <span class="star">★</span>':''}</div>`).join('')}</div>
     <div id="arenaBody"></div>
     <div id="arenaComplete"></div>`;

  let cur = state.arenaCur && CHALLENGES.find(x=>x.id===state.arenaCur) ? state.arenaCur : CHALLENGES[0].id;
  const tabs=$('#arenaTabs');
  function selectTab(id){
    cur=id; state.arenaCur=id; save();
    $$('.arena-tab',tabs).forEach(t=>t.classList.toggle('active',t.dataset.id===id));
    drawChallenge(CHALLENGES.find(x=>x.id===id));
  }
  $$('.arena-tab',tabs).forEach(t=>t.onclick=()=>selectTab(t.dataset.id));
  selectTab(cur);

  function drawChallenge(ch){
    const body=$('#arenaBody');
    body.innerHTML=`<div class="brief">
        <span class="diff ${ch.difficulty}">${ch.difficulty}</span>
        <h2>${ch.title}</h2>
        <p class="story">${ch.story}</p>
        <ul class="reqs">${ch.reqs.map(r=>`<li>${r}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <div class="builder-toolbar">
          <button class="btn sm" id="aAdd">＋ Add table</button>
          <button class="btn sm secondary" id="aReset">↺ Reset</button>
          <span class="muted">Build the schema below · ${ch.rubric.entities.length} core entities expected</span>
        </div>
        <div id="aBuilder"></div>
        ${ch.hints.map((hh,i)=>`<details class="hint-box"><summary>Hint ${i+1}</summary><p>${hh}</p></details>`).join('')}
      </div>
      <div class="card">
        <div class="btn-row" style="margin-top:0">
          <button class="btn" id="aSubmit">⚡ Submit for grading</button>
          <button class="btn secondary" id="aPreview">📄 Preview sheets</button>
          <button class="btn secondary" id="aCsv">⬇ Download CSVs</button>
        </div>
        <div id="aResult"></div>
      </div>`;

    const builder=makeBuilder('#aBuilder','arena.'+ch.id,{starter:ch.starter});
    $('#aAdd').onclick=()=>builder.addTable();
    $('#aReset').onclick=()=>{ if(confirm('Reset this challenge\'s schema to the starter tables?')){ builder.reset(); $('#aResult').innerHTML=''; } };
    $('#aPreview').onclick=()=>{ $('#aResult').innerHTML=`<h2 style="margin-top:18px">Your data as sheets</h2>${renderSheets(builder.getSchema())}`; };
    $('#aCsv').onclick=()=>downloadCSV(builder.getSchema(), ch.id+'_schema.csv');
    $('#aSubmit').onclick=()=>{
      const res=gradeSchema(builder.getSchema(), ch);
      $('#aResult').innerHTML=resultHTML(res);
      if(res.status==='pass' && !state.stars[ch.id]){
        state.stars[ch.id]=true; save();
        $$('.arena-tab',tabs).forEach(t=>{ if(t.dataset.id===ch.id && !t.querySelector('.star')) t.innerHTML+=' <span class="star">★</span>'; });
        toast('★ Challenge solved!','good');
      }
      maybeComplete();
    };
    $('#aResult').scrollIntoView;
  }

  function maybeComplete(){
    const done=CHALLENGES.every(ch=>state.stars[ch.id]);
    if(done){
      markDone('arena');
      $('#arenaComplete').innerHTML=`<div class="cert">
        <div class="complete-hero"><div class="big">🏆</div>
        <h1 style="margin:0 0 8px">You modeled all three.</h1>
        <p class="lede" style="margin:0 auto">You opened the last box of the ChatGPT teardown — storage. UI, API, backend, model, storage. The deterministic system is complete. You can now model any product as entities, attributes and relationships, and ship it to CSV, SQLite, Supabase, or a company\'s private network.</p></div>
        <div class="callout key" style="text-align:left"><span class="tag">What\'s next</span><p>There\'s a second way to remember: not by exact id, but by <b>meaning</b> — “find the messages about billing”, even if nobody wrote the word billing. That\'s a vector database, and it\'s how RAG works. Same idea, different lookup. See you in the RAG lectures.</p></div>
      </div>`;
      $('#arenaComplete').scrollIntoView({behavior:'smooth'});
    }
  }
  maybeComplete();
}

/* ============================================================
   ROUTER
   ============================================================ */
function render(){
  const c=$('#stageContainer');
  const stage=STAGES.find(s=>s.id===state.current)||STAGES[0];
  const map={intro:renderIntro,ladder:renderLadder,stakes:renderStakes,sorter:renderSorter,match:renderMatch,keys:renderKeys,studio:renderStudio,arena:renderArena};
  (map[stage.kind]||renderIntro)(c);
  // if already completed, reveal the Next button so revisiting isn't a dead end
  if(state.done[stage.id]){
    $$('[id$="Next"]', c).forEach(row=>row.style.display='flex');
    wireNext(stage.id);
  }
}

/* ---------- boot ---------- */
$('#resetBtn').onclick=()=>{
  if(confirm('Wipe all progress and your saved schemas? This cannot be undone.')){
    localStorage.removeItem(LS_KEY); location.reload();
  }
};
renderNav(); renderProgress(); render();
