/* ============================================================
   THE GRADER — checks a built schema against a challenge rubric.
   Forgiving by design: fuzzy name match, singular/plural tolerant,
   synonym-aware. Returns a score + specific, teachy feedback.
   ============================================================ */

function norm(s){ return (s||'').toString().toLowerCase().replace(/[^a-z0-9]/g,''); }
function singular(s){ return s.endsWith('s') ? s.slice(0,-1) : s; }

function nameEq(a,b){
  a=norm(a); b=norm(b);
  if(!a||!b) return false;
  if(a===b) return true;
  if(singular(a)===singular(b)) return true;
  return false;
}
function matchesAny(input, names){ return (names||[]).some(n=>nameEq(input,n)); }

function entityTargets(e){ return [e.name, ...(e.aliases||[])]; }
function attrTargets(a){ return [a.name, ...(a.aliases||[])]; }

/* find the student's table that stands in for a rubric entity */
function findTable(schema, entity){
  return schema.find(t => matchesAny(t.name, entityTargets(entity)));
}
/* find a column in a table that satisfies an attribute spec */
function findCol(table, attr){
  return table.columns.find(c => matchesAny(c.name, attrTargets(attr)));
}
/* does a student fk column point at the rubric's referenced entity? */
function fkPointsAt(col, refEntity){
  if(!col || col.key!=='fk') return false;
  return matchesAny(col.fkRef, entityTargets(refEntity));
}

function gradeSchema(schema, challenge){
  const rubric = challenge.rubric;
  const fb = [];            // feedback items
  let score = 0, max = 0;
  let criticalFail = false; // a structural mistake that should block a "pass"

  // resolve a rubric entity object by its canonical name (for ref lookups)
  const entityByName = {};
  rubric.entities.forEach(e => entityByName[e.name] = e);

  // ---------- ENTITIES + ATTRIBUTES ----------
  rubric.entities.forEach(entity => {
    const W_ENTITY = 10;
    max += W_ENTITY;
    const table = findTable(schema, entity);

    if(!table){
      fb.push({type:'miss', icon:'✕',
        html:`Missing table for <b>${entity.name}</b>. ${entity.required===false?'(optional, but expected)':'This is a required entity.'}`});
      return;
    }
    score += W_ENTITY;
    fb.push({type:'good', icon:'✓', html:`Table <code>${table.name}</code> — entity found.`});

    // primary key
    const hasPk = table.columns.some(c => c.key==='pk');
    max += 2;
    if(hasPk){ score += 2; }
    else fb.push({type:'warn', icon:'!', html:`<code>${table.name}</code> has no primary key. Every table needs a unique address — usually <code>id</code>.`});

    // attributes
    entity.attrs.forEach(attr => {
      if(attr.role==='pk') return; // handled above
      const required = attr.required !== false;
      const isFk = attr.role==='fk';
      const W = isFk ? 8 : 3;
      max += W;
      const col = findCol(table, attr);

      if(isFk){
        const refEntity = entityByName[attr.ref];
        if(col && fkPointsAt(col, refEntity)){
          score += W;
        } else if(col && col.key==='fk'){
          score += W*0.5;
          fb.push({type:'warn', icon:'!', html:`<code>${table.name}.${col.name}</code> is marked as a foreign key but doesn't point at <code>${attr.ref}</code>. Set its reference.`});
        } else if(col){
          score += W*0.35;
          fb.push({type:'warn', icon:'!', html:`<code>${table.name}.${col.name}</code> looks like it should be a <b>foreign key</b> → <code>${attr.ref}</code>, but it isn't marked as one. Mark the key as FK and pick the table it references.`});
        } else {
          fb.push({type:'miss', icon:'✕', html:`<code>${table.name}</code> is missing the foreign key to <code>${attr.ref}</code> (e.g. <code>${attr.name}</code>). Without it, the “${entity.name} → ${attr.ref}” link doesn't exist.`});
        }
      } else {
        if(col){ score += W; }
        else if(required){
          fb.push({type:'miss', icon:'✕', html:`<code>${table.name}</code> is missing the <b>${attr.name}</b> attribute.`});
        }
      }
    });
  });

  // ---------- RELATIONSHIP / FK PLACEMENT (the heart of it) ----------
  rubric.relationships.forEach(rel => {
    const W = rel.weight || 8; max += W;
    const tbl = schema.find(t => matchesAny(t.name, entityTargets(entityByName[rel.fk.table] || {name:rel.fk.table})));
    const refEntity = entityByName[rel.fk.ref] || {name:rel.fk.ref};

    if(!tbl){ return; } // already reported as missing entity

    const fkCols = tbl.columns.filter(c => fkPointsAt(c, refEntity));

    if(rel.fk.selfJoin){
      // needs TWO distinct fks to the same table
      if(fkCols.length >= 2){
        score += W;
        fb.push({type:'good', icon:'★', html:`Self-join nailed: <code>${tbl.name}</code> has two foreign keys into <code>${refEntity.name}</code> — that's how a directional follow works.`});
      } else if(fkCols.length === 1){
        score += W*0.25; criticalFail = true;
        fb.push({type:'miss', icon:'✕', html:`<code>${tbl.name}</code> only has one FK to <code>${refEntity.name}</code>. A directional follow needs TWO (follower + followed), both pointing at users — otherwise you can't tell who follows whom. Fix this to pass.`});
      } else {
        criticalFail = true;
        fb.push({type:'miss', icon:'✕', html:`Relationship missing: <b>${rel.label}</b>.`});
      }
    } else {
      if(fkCols.length >= 1){ score += W; }
      else { criticalFail = true; fb.push({type:'miss', icon:'✕', html:`Relationship missing: <b>${rel.label}</b>. The FK belongs on <code>${rel.fk.table}</code> (the “many” side).`}); }
    }
  });

  // ---------- mis-placed FK detection (teach the common mistake) ----------
  // If a "one" side table wrongly carries an fk to its "many" side.
  rubric.relationships.forEach(rel => {
    const oneSide = schema.find(t => matchesAny(t.name, entityTargets(entityByName[rel.fk.ref]||{name:rel.fk.ref})));
    const manyEntity = entityByName[rel.fk.table];
    if(oneSide && manyEntity){
      const wrong = oneSide.columns.find(c => fkPointsAt(c, manyEntity));
      if(wrong){
        fb.push({type:'warn', icon:'⤺', html:`Heads up: <code>${oneSide.name}.${wrong.name}</code> points DOWN at <code>${manyEntity.name}</code>. The “one” side can't hold the “many” side's id — flip it so <code>${rel.fk.table}</code> points up instead.`});
      }
    }
  });

  const pct = max>0 ? Math.round((score/max)*100) : 0;
  let status = 'fail';
  if(pct >= 85) status = 'pass';
  else if(pct >= 55) status = 'partial';
  // a structural mistake (missing core relationship / broken self-join) can't pass,
  // no matter how many other points were earned — the relationship IS the database.
  if(criticalFail && status === 'pass') status = 'partial';

  // closing tip
  if(status==='pass'){
    fb.unshift({type:'tip', icon:'🎉', html:`<b>Schema accepted.</b> Your entities, attributes and keys map cleanly to real tables. Export the CSVs and you've got a database.`});
  } else if(status==='partial'){
    fb.unshift({type:'tip', icon:'🔧', html:`<b>Close.</b> The skeleton is right but some links or fields are off. Read the ✕ and ! items below and adjust.`});
  } else {
    fb.unshift({type:'tip', icon:'🧭', html:`<b>Keep modeling.</b> Walk the recipe: nouns → entities, descriptions → attributes, then place a foreign key on every “many” side.`});
  }

  // sort: tip first, then misses, warns, goods
  const order = {tip:0, miss:1, warn:2, good:3};
  fb.sort((a,b)=> (order[a.type]??9) - (order[b.type]??9));

  return { score, max, pct, status, feedback:fb };
}
