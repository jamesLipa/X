/* M05 gamified experience: UI preview only; no persistence or XP grants. */
(() => {
  'use strict';
  const stages = [
    {key:'prepare',label:'PREPARE',title:'Prepara tu experimento',time:'5–10 MIN',icon:'◎',question:'¿Qué quieres validar primero?',choices:['Existe interés real en mi idea','Mi propuesta resuelve un problema','Las personas usarían mi solución'],prompt:'¿A quién preguntarás o mostrarás tu propuesta?',placeholder:'Ej. Dos personas que podrían utilizar mi producto...'},
    {key:'action',label:'TAKE ACTION',title:'Pon tu idea a prueba',time:'10–15 MIN',icon:'↗',question:'¿Cómo comprobarás tu hipótesis?',choices:['Conversaré con personas reales','Compararé dos alternativas','Mostraré un prototipo o ejemplo'],prompt:'¿Qué hiciste realmente y qué te respondieron?',placeholder:'Describe la prueba, participantes y observaciones reales...'},
    {key:'discover',label:'DISCOVER',title:'Descubre lo aprendido',time:'5–10 MIN',icon:'✧',question:'¿Qué harás después de la prueba?',choices:['Ajustaré mi propuesta','Haré otra prueba','Continuaré con el siguiente paso'],prompt:'¿Qué aprendiste y cuál será tu siguiente ajuste?',placeholder:'Resume un hallazgo y una decisión concreta...'}
  ];
  

let step = 0,
    answers = {},
    category = null,
    experiment = '',
    savedAt = null,
    revision = 0,
    projectId = null,
    db = null,
    loading = false,
    saving = false,
    sessionToken = 0;

const draftKey = () =>
  `jl-m05-preview-v2:${String(projectId)}:${String(category?.id || 'unknown')}`;

//Guardado

function cleanAnswers(input) {
  const clean = {};

  if (!input || typeof input !== 'object' ||
      Array.isArray(input)) return clean;

  for (const stage of stages) {
    const item = input[stage.key];
    if (!item || typeof item !== 'object') continue;

    const choice = Number(item.choice);

    clean[stage.key] = {
      note: typeof item.note === 'string'
        ? item.note.slice(0, 1200)
        : ''
    };

    if (
      item.choice !== undefined &&
      item.choice !== null &&
      item.choice !== '' &&
      Number.isInteger(choice) &&
      choice >= 0 &&
      choice < stage.choices.length
    ) {
      clean[stage.key].choice = choice;
    }
  }

  return clean;
}

function saveLocal() {
  try {
    localStorage.setItem(draftKey(), JSON.stringify({
      version: 2,
      answers,
      step,
      revision,
      savedAt,
      categoryName: category?.name,
      experiment
    }));
  } catch (error) {
    console.warn('M05: respaldo local no disponible', error);
  }
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(draftKey());
    if (!raw) return false;

    const data = JSON.parse(raw);
    if (data?.version !== 2) return false;

    answers = cleanAnswers(data.answers);
    step = Number.isInteger(data.step)
      ? Math.max(0, Math.min(2, data.step))
      : 0;

    savedAt = typeof data.savedAt === 'string'
      ? data.savedAt
      : null;

    return true;
  } catch (error) {
    console.warn('M05: error leyendo respaldo', error);
    return false;
  }
}

async function loadRemote(token) {
  if (!db || !projectId || !category?.id) return;

  loading = true;

  try {
    const { data, error } = await db
      .from('mission_drafts')
      .select('answers,current_step,revision,updated_at')
      .eq('project_id', projectId)
      .eq('mission_key', 'M05')
      .eq('category_id', category.id)
      .maybeSingle();

    if (token !== sessionToken) return;
    if (error) throw error;

    if (data) {
      answers = cleanAnswers(data.answers);
      step = Number.isInteger(data.current_step)
        ? Math.max(0, Math.min(2, data.current_step))
        : 0;

      revision = Number(data.revision);
      savedAt = data.updated_at;
      saveLocal();
    } else {
      revision = 0;
    }
  } catch (error) {
    if (token === sessionToken) {
      console.error('M05: error al recuperar', error);
    }
  } finally {
    if (token === sessionToken) {
      loading = false;
      render();
    }
  }
}

async function saveDraft(feedback, button) {
  if (saving || loading) return;

  if (!db || !projectId || !category?.id) {
    feedback.textContent =
      'Falta conectar Supabase, proyecto o categoría.';
    saveLocal();
    return;
  }

  saving = true;
  button.disabled = true;
  feedback.textContent = 'Guardando en Supabase…';

  const token = sessionToken;
  const submitted = JSON.stringify(answers);
  const submittedStep = step;

  try {
    const { data, error } = await db.rpc(
      'm05_save_draft',
      {
        p_project_id: projectId,
        p_category_id: category.id,
        p_answers: JSON.parse(submitted),
        p_current_step: submittedStep,
        p_expected_revision: revision
      }
    );

    if (token !== sessionToken) return;
    if (error) throw error;

    const result = Array.isArray(data) ? data[0] : data;

    if (
      !result ||
      !Number.isSafeInteger(Number(result.revision))
    ) {
      throw new Error('Respuesta RPC inválida');
    }

    revision = Number(result.revision);
    savedAt = result.saved_at || new Date().toISOString();

    saveLocal();

    feedback.textContent =
      JSON.stringify(answers) === submitted &&
      step === submittedStep
        ? 'Borrador guardado en Supabase. Sin XP otorgados.'
        : 'Guardado. Tienes cambios nuevos pendientes.';

  } catch (error) {
    if (token !== sessionToken) return;

    console.error('M05: error al guardar', error);
    saveLocal();

    feedback.textContent =
      /revision conflict/i.test(error.message || '')
        ? 'Conflicto entre pestañas. Vuelve a abrir M05.'
        : 'Error de guardado. Tus respuestas siguen en pantalla.';

  } finally {
    if (token === sessionToken) {
      saving = false;
      button.disabled = false;
    }
  }
}

function saveButton(label, feedback) {
  const button = el('button', 'jl-m05w-v2-save', label);
  button.type = 'button';
  button.disabled = loading || saving;

  button.addEventListener('click', () => {
    saveDraft(feedback, button);
  });

  return button;
}


  const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
  function render(){
    const root=document.getElementById('mission05Activity');if(!root)return;
    root.replaceChildren();root.hidden=false;root.classList.remove('jl-m05w-v2');
    const stage=stages[step];
    const eyebrow=el('span','jl-m05w-eyebrow',`MISSION 05 · ${category.name} · +60 XP PENDIENTES`);
    const progress=el('div','jl-m05w-progress');progress.setAttribute('role','progressbar');progress.setAttribute('aria-label','Progreso de las etapas');progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax','3');progress.setAttribute('aria-valuenow',String(step+1));
    stages.forEach((s,i)=>progress.append(el('span',i<=step?'active':'')));
    const meta=el('div','jl-m05w-meta');meta.append(el('span','',`ETAPA ${step+1} / 3 · ${stage.label}`),el('span','',stage.time));
    const head=el('div','jl-m05w-heading');head.append(el('span','jl-m05w-icon',stage.icon),el('h3','',stage.title));
    const intro=el('p','jl-m05w-intro',step===1?`TU EXPERIMENTO: ${experiment}`:step===2?'Convierte la evidencia real en un aprendizaje concreto.':'Antes de actuar, define qué vas a comprobar.');
    const question=el('h4','jl-m05w-question',stage.question);
    const options=el('div','jl-m05w-options');
    stage.choices.forEach((choice,i)=>{
      const button=el('button','jl-m05w-option'+(answers[stage.key]?.choice===i?' selected':''),choice);button.type='button';button.setAttribute('aria-pressed',String(answers[stage.key]?.choice===i));
      button.addEventListener('click',()=>{answers[stage.key]={...answers[stage.key],choice:i};render();});options.append(button);
    });
    const label=el('label','jl-m05w-label',stage.prompt);const textarea=el('textarea','jl-m05w-input');textarea.rows=3;textarea.maxLength=1200;textarea.placeholder=stage.placeholder;textarea.value=answers[stage.key]?.note||'';label.append(textarea);
    textarea.addEventListener('input',()=>{answers[stage.key]={...answers[stage.key],note:textarea.value};syncButton();});
   
const feedback = el(
  'p',
  'jl-m05w-feedback',
  savedAt
    ? 'Borrador recuperado. Guarda para sincronizar nuevos cambios.'
    : 'Guardado manual en Supabase. Evita datos personales o sensibles.'
);

    const controls=el('div','jl-m05w-controls');
    const back=el('button','jl-m05w-back','← ANTERIOR');back.type='button';back.disabled=step===0;back.addEventListener('click',()=>{step--;render();});
    const next=el('button','jl-m05w-next',step===2?'VER MI REPORTE →':'CONTINUAR →');next.type='button';
    function syncButton(){next.disabled=answers[stage.key]?.choice===undefined || !(answers[stage.key]?.note||'').trim();}
    next.addEventListener('click',()=>{if(next.disabled)return;if(step<2){step++;render();}else report();});
    controls.append(
  back,
  next,
 saveButton('GUARDAR EN SUPABASE', feedback)
);

root.append(
  eyebrow,
  progress,
  meta,
  head,
  intro,
  question,
  options,
  label,
  feedback,
  controls
);

syncButton();
  }
  function report(){
    const root=document.getElementById('mission05Activity');
    if(!root || !category)return;
    root.replaceChildren();root.hidden=false;root.classList.add('jl-m05w-v2');

    const top=el('div','jl-m05w-v2-top');
    top.append(el('span','jl-m05w-v2-kicker','MISSION 05 / FIELD LAB'),el('span','jl-m05w-v2-badge','VISTA PREVIA'));
    const heading=el('div','jl-m05w-v2-heading');
    const symbol=el('span','jl-m05w-v2-symbol','✧');symbol.setAttribute('aria-hidden','true');
    const titleBox=el('div','jl-m05w-v2-titles');
    titleBox.append(el('h3','', 'Validation Report'),el('p','',category.name));
    heading.append(symbol,titleBox);

    const progress=el('div','jl-m05w-v2-progress');
    progress.setAttribute('aria-label','Tres etapas revisadas');
    stages.forEach(stage=>{
      const segment=el('div','jl-m05w-v2-segment');
      const bar=el('span','jl-m05w-v2-bar');bar.setAttribute('aria-hidden','true');
      segment.append(bar,el('span','jl-m05w-v2-stage',stage.label));
      progress.append(segment);
    });
    const note=el('p','jl-m05w-v2-disclaimer','3/3 etapas revisadas · El reporte no otorga XP automáticamente.');
    root.append(top,heading,progress,note);

    const highlight=el('section','jl-m05w-v2-insight');
    highlight.append(el('span','jl-m05w-v2-insight-label','✦ APRENDIZAJE IDENTIFICADO'));
    // Use the participant's own words; do not infer market validation.
    highlight.append(el('p','',answers.discover?.note?.trim() || 'Todavía no se registró un aprendizaje.'));
    highlight.append(el('small','','Reflexión del participante; no equivale a validación de mercado.'));
    root.append(highlight);

    const list=el('div','jl-m05w-v2-list');
    stages.forEach((stage,index)=>{
      const answer=answers[stage.key] || {};
      const block=el('section','jl-m05w-v2-card');
      const label=el('div','jl-m05w-v2-card-heading');
      label.append(el('span','jl-m05w-v2-index',String(index+1).padStart(2,'0')),el('h4','',stage.label));
      block.append(label);
      const choice=stage.choices[answer.choice] || 'Sin selección';
      block.append(el('p','jl-m05w-v2-choice',choice));
      block.append(el('p','jl-m05w-v2-answer',answer.note || 'Sin observaciones'));
      list.append(block);
    });
    root.append(list);

    const actions=el('div','jl-m05w-v2-actions');
    const review=el('button','jl-m05w-next','← REVISAR MIS RESPUESTAS');
    review.type='button';review.addEventListener('click',()=>{root.classList.remove('jl-m05w-v2');step=0;render();});
    const status = el(
  'p',
  'jl-m05w-feedback',
  'Guarda tu borrador en Supabase. Evita información personal o sensible.'
);

const save = saveButton(
  'GUARDAR EN SUPABASE',
  status
);

actions.append(review, save);

root.append(actions, status);
  }

window.JLM05Wizard = {
  start(selected, fieldExperiment, options = {}) {
    sessionToken += 1;

    category = selected;
    experiment = fieldExperiment;

    projectId = options.projectId ?? null;
    db = options.supabase ?? null;

    step = 0;
    answers = {};
    savedAt = null;
    revision = 0;
    loading = false;
    saving = false;

    if (!projectId || !db) {
      console.warn(
        'M05: falta projectId o cliente Supabase.'
      );
    }

    loadLocal();
    render();
    void loadRemote(sessionToken);
  }
};
})();
