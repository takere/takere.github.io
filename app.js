'use strict';

/* ---------- helpers ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function ic(n, size = 16, color = 'currentColor', w = 'r') {
  const d = PH[n];
  if (!d) return '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 256 256" fill="${color}" aria-hidden="true" style="flex:0 0 auto">${d[w] || d.r}</svg>`;
}
function sv(n, w, h, color) {
  const s = SV[n];
  const ds = n === 'home' ? s.d.slice(1) : s.d;
  return `<svg width="${w}" height="${h}" viewBox="${s.vb}" fill="${color}" aria-hidden="true" style="flex:0 0 auto">${ds.map((d) => `<path d="${d}"/>`).join('')}</svg>`;
}
const glassSvg = (c, s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="1.91" aria-hidden="true"><polygon points="17.73 22.5 6.27 22.5 3.41 1.5 20.59 1.5 17.73 22.5"/><path d="M19.68,8.18C12,10.09,12,5.32,4.32,8.18"/></svg>`;
const tailLeft = '<svg class="tail" width="8" height="13" viewBox="0 0 8 13" aria-hidden="true"><path fill="#f0f0f0" d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"/></svg>';
const tailRight = '<svg class="tail" width="8" height="13" viewBox="0 0 8 13" aria-hidden="true"><path fill="#0c8861" d="M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z"/></svg>';
const backBtn = (color = '#333') => `<button class="back" data-a="back" aria-label="Voltar">${sv('arrow-left', 13, 22, color)}</button>`;
const alpha = (hex, a) => hex + a;

const pad = (n) => String(n).padStart(2, '0');
const NOW = new Date();
const addD = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const TODAY = addD(NOW, 0);
const dKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fDM = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
const fDMY = (d) => `${fDM(d)}/${d.getFullYear()}`;
const fDT = (d) => `${fDMY(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
const at = (dayOffset, hh, mm = 0) => { const d = addD(TODAY, dayOffset); d.setHours(hh, mm); return d; };
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const WD_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const WD_CHIPS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const numPt = (v, dec) => (dec ? Number(v).toFixed(dec) : String(v)).replace('.', ',');
const ml = (v) => (v >= 1000 ? `${String(v / 1000).replace('.', ',')}L` : `${v}ml`);
function hash(a, b) { let h = (a * 374761393 + b * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }

const PERIODS = {
  DAWN: { c: '#64748B', i: 'moon-stars', l: 'Madrugada' },
  MORNING: { c: '#0EA5E9', i: 'sun-horizon', l: 'Manhã' },
  AFTERNOON: { c: '#F97316', i: 'sun', l: 'Tarde' },
  NIGHT: { c: '#4F46E5', i: 'moon', l: 'Noite' },
  NONE: { c: '#94A3B8', i: 'clock', l: 'Sem horário' },
};
function period(t) {
  if (!t) return PERIODS.NONE;
  const h = +t.slice(0, 2);
  return h < 6 ? PERIODS.DAWN : h < 12 ? PERIODS.MORNING : h < 18 ? PERIODS.AFTERNOON : PERIODS.NIGHT;
}
const STATUS = {
  PLANNED: { i: 'circle', w: 'r', c: '#c5c9d1', bg: 'rgba(197,201,209,.22)', l: 'Planejado' },
  CONFIRMED: { i: 'check-circle', w: 'f', c: '#2ecc71', bg: 'rgba(46,204,113,.14)', l: 'Confirmado' },
  SKIPPED: { i: 'x-circle', w: 'f', c: '#9aa0a6', bg: 'rgba(154,160,166,.18)', l: 'Pulado' },
  EXPIRED: { i: 'x-circle', w: 'f', c: '#9aa0a6', bg: 'rgba(154,160,166,.18)', l: 'Expirado' },
  JUSTIFIED: { i: 'warning-circle', w: 'f', c: '#FD7E14', bg: 'rgba(253,126,20,.14)', l: 'Justificado' },
  NOT_SCHEDULED: { i: 'circle', w: 'f', c: '#b0b5bd', bg: 'rgba(176,181,189,.16)', l: 'Não agendado' },
};
function statusIcon(st, pulse) {
  const s = STATUS[st];
  const sz = st === 'NOT_SCHEDULED' ? 10 : 18;
  return `<span class="sicon ${pulse ? 'pulse' : ''}" style="background:${s.bg}">${ic(s.i, sz, s.c, s.w)}</span>`;
}
function legendChips() {
  return ['PLANNED', 'CONFIRMED', 'SKIPPED', 'JUSTIFIED', 'NOT_SCHEDULED'].map((k) => {
    const s = STATUS[k];
    return `<span class="lchip"><i style="background:${s.bg}">${ic(s.i, k === 'NOT_SCHEDULED' ? 6 : 11, s.c, s.w)}</i>${s.l}</span>`;
  }).join('');
}

const FOOD = {
  BEFORE_EATING: 'Deve ser tomado antes das refeições',
  BEFORE_BREAKFAST: 'Deve ser tomado antes do café',
  BEFORE_LUNCH: 'Deve ser tomado antes do almoço',
  BEFORE_DINNER: 'Deve ser tomado antes da janta',
  WHILE_EATING: 'Deve ser tomado durante a refeição',
  AFTER_EATING: 'Deve ser tomado depois das refeições',
};
const FOOD_LABEL = { BEFORE_BREAKFAST: 'Antes do café', WHILE_EATING: 'Durante a refeição', AFTER_EATING: 'Depois das refeições', BEFORE_DINNER: 'Antes da janta', DOESNT_MATTER: 'Indiferente' };

const TASK_TYPE = { PHOTO: 'Foto', FORM: 'Questionário', TEXT: 'Atividade', ASK_ANSWER: 'Pergunta' };

const JUSTIFY_OPTIONS = ['Esquecimento', 'Estava me sentindo mal', 'Sem estoque', 'Estava fora de casa', 'Já realizei, mas não marquei no app', 'Efeitos colaterais', 'Outro'];

const CHAT_OPTIONS = [
  ['Quero entender melhor o meu tratamento', 'Vou te ajudar com isso. Reuni alguns guias para você saber mais sobre o seu tratamento', 'Ver guias', 'LIST_GUIDES'],
  ['Eu quero ver as minhas pendências', 'Claro! Vou reunir todas elas para você poder ver de forma simples, tudo bem?', 'Ver pendências', 'LIST_PENDINGS'],
  ['Como eu estou indo no tratamento?', 'Vou te dar uma visão geral do seu progresso, ok? Basta clicar no botão abaixo.', 'Ver meu progresso', 'LIST_PROGRESS'],
  ['Me mostra uma visão mês a mês do progresso do meu tratamento', 'Claro! Irei providenciar isso... Basta apertar o botão abaixo para você ver.', 'Ver meu progresso mensal', 'LIST_CALENDAR'],
  ['Quero registrar uma nova informação', 'Claro! Eu montei uma lista de opções para que você me diga o que você gostaria de adicionar. Clique no botão abaixo para prosseguirmos.', 'Nova solicitação', 'CREATE_PATIENT_ITEM'],
  ['Por que eu não posso escrever uma mensagem própria?', 'Como esta é uma versão inicial do aplicativo, não conseguimos dar suporte a isso ainda... Mas no futuro, será possivel! 😁'],
  ['Como falar com a equipe de saúde?', 'Para falar com a equipe de saúde deve utilizar o contato disponibilizado durante a consulta.'],
  ['Eu completei uma atividade sem querer.. e agora?', 'Atualmente não existe a opção de desfazer uma tarefa. Entre em contato com seu enfermeiro caso seja importante.'],
  ['Não quero mais usar o aplicativo', 'Puxa, sentimos muito por isso 😞. Você pode desativar sua conta indo em Configurações, depois clicar em Perfil e em seguida clicar em Exluir minha conta. É muito importante que você informe o motivo, para que possamos tornar o aplicativo melhor no futuro. Muito obrigado por ter utilizado até aqui 😊'],
  ['Não me sinto bem', 'Opa, peço que você informe com urgência ao seu enfermeiro sobre a situação. Ligue para o 192 para chamar uma ambulância'],
];

const NBCS = [
  { id: 'med', name: 'Medicamento', color: '#db594f', icon: 'pill', modes: ['ADD'] },
  { id: 'photo', name: 'Foto', color: '#f974bc', icon: 'image', modes: ['ANY'], answer: 'PHOTO' },
  { id: 'temp', name: 'Temperatura', color: '#f974bc', icon: 'thermometer', modes: ['ANY'], answer: 'MEAS', inputs: [{ k: 'temp', l: 'Temperatura', min: 34, max: 42, step: 0.1, start: 36.5, unit: '°C' }], units: true },
  { id: 'weight', name: 'Controle de peso', color: '#f974bc', icon: 'scales', modes: ['ANY'], answer: 'MEAS', inputs: [{ k: 'w', l: 'Peso', min: 30, max: 200, step: 0.1, start: 70, unit: 'kg' }] },
  { id: 'bp', name: 'Pressão Arterial', color: '#f974bc', icon: 'heart', modes: ['ANY'], answer: 'MEAS', inputs: [{ k: 'sys', l: 'Sistólica', min: 60, max: 240, step: 1, start: 120, unit: 'mmHg' }, { k: 'dia', l: 'Diastólica', min: 30, max: 160, step: 1, start: 80, unit: 'mmHg' }] },
  { id: 'gly', name: 'Controle de Nível Glicêmico', color: '#f974bc', icon: 'drop-half', modes: ['ANY'], answer: 'MEAS', inputs: [{ k: 'g', l: 'Glicemia', min: 40, max: 400, step: 1, start: 100, unit: 'mg/dL' }] },
  { id: 'hr', name: 'Frequência Cardíaca', color: '#f974bc', icon: 'heart', modes: ['ANY'], answer: 'MEAS', inputs: [{ k: 'hr', l: 'Frequência cardíaca', min: 30, max: 220, step: 1, start: 75, unit: 'bpm' }] },
];

const GUIDE_PAGES = {
  1: [
    '<h3>Antes de começar</h3><p>Lave bem as mãos com água e sabão por pelo menos 40 segundos. Separe o material: gaze, soro fisiológico, fita e o curativo indicado pela equipe.</p><p>Escolha um lugar limpo e bem iluminado.</p>',
    '<h3>Trocando o curativo</h3><ul><li>Retire o curativo antigo com cuidado, sem puxar a pele.</li><li>Limpe a ferida com soro fisiológico, de dentro para fora.</li><li>Seque a pele ao redor com gaze, sem esfregar.</li><li>Coloque o novo curativo e fixe com a fita.</li></ul>',
    '<h3>Quando avisar a equipe</h3><p>Avise sua equipe de saúde se notar vermelhidão que aumenta, pus, mau cheiro, febre acima de 38 °C ou dor que não melhora com o medicamento.</p><p>Use a tarefa <b>Foto da ferida</b> para nos mostrar como está a cicatrização.</p>',
  ],
  2: [
    '<h3>O que é a pressão arterial</h3><p>É a força que o sangue faz nas paredes das artérias. Ela é medida em dois números: a sistólica (maior) e a diastólica (menor).</p>',
    '<h3>Valores de referência</h3><ul><li>Até 12 por 8 (120/80 mmHg): normal.</li><li>Entre 13 por 8,5 e 13,9 por 8,9: atenção.</li><li>14 por 9 ou mais: pressão alta.</li></ul><p>Procure atendimento se tiver dor no peito, falta de ar ou visão embaçada.</p>',
  ],
  3: [
    '<h3>Monte um prato equilibrado</h3><p>Metade do prato com verduras e legumes, um quarto com arroz, massa ou batata e um quarto com carne, ovo ou feijão.</p>',
    '<h3>Pequenas trocas</h3><ul><li>Prefira frutas inteiras em vez de sucos.</li><li>Evite refrigerantes e doces no dia a dia.</li><li>Faça as refeições em horários parecidos todos os dias.</li></ul>',
  ],
  4: [
    '<h3>Por que os horários importam</h3><p>Tomar o medicamento sempre no mesmo horário mantém a quantidade certa do remédio no corpo ao longo do dia.</p><p>Se esquecer uma dose, não tome duas de uma vez. Registre no app o motivo e siga o próximo horário.</p>',
  ],
};

/* ---------- state ---------- */
function fresh() {
  const allDays = [1, 1, 1, 1, 1, 1, 1];
  return {
    loggedIn: false,
    seenChanges: false,
    notifOk: false,
    user: { firstName: 'Maria', lastName: 'Silva', email: 'maria.silva@email.com', phone: '51999998888' },
    meds: [
      { id: 1, name: 'Omeprazol', drugs: [['Omeprazol', '20', 'mg']], quantity: 1, form: 'cápsula', admin: 'Oral', food: 'BEFORE_BREAKFAST', offset: '30min', times: ['07:00'], time: '07:00', status: 'JUSTIFIED', days: allDays, why: 'Proteger o estômago enquanto toma os outros medicamentos.', startsOn: -40 },
      { id: 2, name: 'Losartana', drugs: [['Losartana potássica', '50', 'mg']], quantity: 1, form: 'comprimido', admin: 'Oral', food: 'DOESNT_MATTER', times: ['08:00'], time: '08:00', status: 'CONFIRMED', days: allDays, why: 'Controlar a pressão arterial.', startsOn: -40 },
      { id: 3, name: 'Metformina', drugs: [['Cloridrato de metformina', '850', 'mg']], quantity: 1, form: 'comprimido', admin: 'Oral', food: 'WHILE_EATING', times: ['12:00', '20:00'], time: '12:00', status: 'EXPIRED', days: allDays, why: 'Controlar a glicemia.', startsOn: -40 },
      { id: 4, name: 'Metformina', drugs: [['Cloridrato de metformina', '850', 'mg']], quantity: 1, form: 'comprimido', admin: 'Oral', food: 'WHILE_EATING', times: ['12:00', '20:00'], time: '20:00', status: 'PLANNED', days: allDays, why: 'Controlar a glicemia.', startsOn: -40 },
      { id: 5, name: 'Sinvastatina', drugs: [['Sinvastatina', '20', 'mg']], quantity: 1, form: 'comprimido', admin: 'Oral', food: 'DOESNT_MATTER', times: ['22:00'], time: '22:00', status: 'PLANNED', days: allDays, why: 'Reduzir o colesterol.', startsOn: 0 },
      { id: 6, name: 'Dipirona', drugs: [['Dipirona sódica', '500', 'mg']], quantity: 1, form: 'comprimido', admin: 'Oral', food: 'DOESNT_MATTER', times: [], time: null, status: 'PLANNED', waiting: true, condition: '"Dor" > 5', freqLabel: 'Até 4 x ao dia', notes: 'Intervalo mínimo de 6 horas entre as doses.', startsOn: -1, review: true },
    ],
    tasks: [
      { id: 11, name: 'Medir temperatura', type: 'ASK_ANSWER', color: '#f974bc', icon: 'thermometer', time: '09:00', deadline: '11:00', status: 'CONFIRMED', days: allDays, freqLabel: 'Todos os dias' },
      { id: 12, name: 'Foto da ferida', type: 'PHOTO', color: '#f974bc', icon: 'image', time: '10:00', deadline: '12:00', status: 'PLANNED', late: true, days: [1, 0, 1, 0, 1, 0, 0], freqLabel: 'Dias da semana' },
      { id: 13, name: 'Questionário de sintomas', type: 'FORM', color: '#f974bc', icon: 'question', time: '14:00', deadline: '16:00', status: 'PLANNED', days: allDays, freqLabel: 'Todos os dias' },
      { id: 14, name: 'Leia: cuidados com o curativo', type: 'TEXT', color: '#f974bc', icon: 'check-circle', time: '18:00', deadline: '20:00', status: 'PLANNED', early: true, days: allDays, freqLabel: 'Todos os dias', endsOn: 10 },
    ],
    water: { goal: 2000, intake: 1250, hist: [1800, 2000, 1400, 2100, 1600, 1900] },
    week: [true, true, false, true],
    highlight: { medication: true, tasks: true },
    unread: true,
    chat: [
      { s: 'PATIENT', b: 'Como eu estou indo no tratamento?', t: at(-1, 19, 2) },
      { s: 'SYSTEM', b: 'Vou te dar uma visão geral do seu progresso, ok? Basta clicar no botão abaixo.', t: at(-1, 19, 2), btn: ['Ver meu progresso', 'LIST_PROGRESS'] },
      { s: 'HCP', b: 'Olá, Maria! Vi que sua pressão melhorou nesta semana. Continue tomando a Losartana pela manhã e não esqueça de enviar a foto da ferida.', t: at(0, 8, 15) },
    ],
    guides: [
      { id: 1, name: 'Cuidados com o curativo', description: 'Como trocar o curativo em casa com segurança', icon: 'graduation-cap', color: '#46bdc6', read: false, created: -12 },
      { id: 2, name: 'Pressão arterial', description: 'Entenda os valores e quando procurar ajuda', icon: 'graduation-cap', color: '#46bdc6', read: true, created: -30 },
      { id: 3, name: 'Alimentação e diabetes', description: 'Dicas para montar o prato e controlar a glicemia', icon: 'graduation-cap', color: '#46bdc6', read: false, created: -20 },
      { id: 4, name: 'Seus medicamentos', description: 'Por que seguir os horários faz diferença', icon: 'graduation-cap', color: '#46bdc6', read: true, created: -38 },
    ],
    items: [
      { id: 33, mode: 'ANY', status: 'REJECTED', nbc: 'photo', title: 'Foto do curativo', created: at(-6, 18, 5), reviewed: at(-5, 10, 30), note: 'A foto ficou desfocada. Pode enviar outra, com boa iluminação?', justification: 'O curativo molhou no banho.', answer: { photo: true }, answered: at(-6, 18, 5) },
      { id: 31, mode: 'ANY', status: 'APPROVED', nbc: 'temp', title: 'Febre à noite', created: at(-3, 22, 10), reviewed: at(-2, 9, 0), note: 'Obrigado pelo registro, Maria. Se a febre voltar acima de 38 °C, procure a unidade de saúde.', justification: 'Senti calafrios depois do jantar.', answer: { rows: [['Temperatura', '38,2 °C']] }, answered: at(-3, 22, 10) },
      { id: 32, mode: 'ADD', status: 'PENDING', nbc: 'med', title: 'Dipirona', created: at(-1, 15, 40), justification: 'O médico do posto receitou para a dor no curativo.', fields: [['Fármacos', 'Dipirona sódica 500 mg'], ['Quantidade e forma', '1 comprimido'], ['Quando tomar', 'Se "Dor" > 5'], ['Frequência', 'Até 4 x ao dia']], answer: null },
    ],
    histOverride: {},
    histReason: {},
    prefs: { sound: 'Padrão', followUp: 10, max: 6, lang: 'Português', tz: 'São Paulo (UTC−03:00)' },
  };
}

let S, ui, stack, modals, rendered, timers = {};

function medPend(m) { return m.status === 'PLANNED' && !m.waiting; }
function taskPend(t) { return t.status === 'PLANNED' && !t.waiting; }
function flags() {
  const medPending = S.meds.filter(medPend).length;
  const taskPending = S.tasks.filter(taskPend).length;
  const water = S.water.intake >= S.water.goal;
  return { medication: medPending === 0, task: taskPending === 0, water, medPending, taskPending, upToDate: medPending === 0 && taskPending === 0 && water };
}

/* ---------- navigation ---------- */
const cur = () => stack[stack.length - 1];
function go(n, p = {}) { stack.push({ n, ...p }); render('push'); }
function back() {
  if (stack.length > 1) { stack.pop(); render('pop'); } else { stack = [{ n: 'home' }]; render('pop'); }
}
function root(n, p = {}) { stack = [{ n, ...p }]; render('pop'); }
function popTo(n, p = {}) {
  const i = stack.map((r) => r.n).lastIndexOf(n);
  if (i >= 0) { stack = stack.slice(0, i + 1); Object.assign(stack[i], p); render('pop'); } else root(n, p);
}

/* ---------- toasts & modals ---------- */
function toast(msg, err) {
  const el = document.createElement('div');
  el.className = 'toast' + (err ? ' err' : '');
  el.innerHTML = `${ic(err ? 'warning-circle' : 'check-circle', 20, err ? '#db594f' : '#0fab7a', 'f')}<span>${esc(msg)}</span>`;
  document.getElementById('toast-root').appendChild(el);
  setTimeout(() => el.remove(), 2800);
}
function openModal(m) { modals.push(m); renderModals(); }
function closeModal(silent) {
  const m = modals.pop();
  renderModals();
  if (m && m.onClose && !silent) m.onClose();
}
function closeAllModals() { modals = []; renderModals(); }
function renderModals() {
  const rootEl = document.getElementById('modal-root');
  rootEl.innerHTML = modals.map((m, i) => `
    <div class="backdrop" data-bd="${i}">
      <div class="mcard" role="dialog" aria-modal="true" aria-label="${esc(m.title || 'Janela')}">
        <div class="mhead"><h2>${esc(m.title || '')}</h2><button class="mclose" data-a="closeModal" aria-label="Fechar">${ic('x', 14, '#555', 'b')}</button></div>
        <div class="mbody">${m.body()}</div>
      </div>
    </div>`).join('');
  modals.forEach((m) => m.mount && m.mount(rootEl.lastElementChild));
}
function refreshModal() {
  const rootEl = document.getElementById('modal-root');
  const last = rootEl.lastElementChild;
  const m = modals[modals.length - 1];
  if (!last || !m) return;
  const body = last.querySelector('.mbody');
  const st = body.scrollTop;
  body.innerHTML = m.body();
  body.scrollTop = st;
  m.mount && m.mount(last);
}

/* ---------- shared UI pieces ---------- */
function header(title, { backable = true, light = false } = {}) {
  return `<div class="hdr ${light ? 'light' : ''}">${backable ? backBtn(light ? '#fff' : '#333') : ''}<h1>${esc(title)}</h1></div>`;
}
function navyHeader({ title, sub, border, tabs }) {
  return `<div class="navyhdr ${tabs ? 'tabs' : ''}" style="border-bottom-color:${border}">
    <div class="row">${`<button class="back" data-a="back" aria-label="Voltar">${sv('arrow-left', 13, 22, '#fff')}</button>`}<h1>${esc(title)}</h1></div>
    ${sub ? `<div class="sub">${sub}</div>` : ''}
    ${tabs || ''}
  </div>`;
}
function upToDate(msg) {
  return `<div class="upto"><div class="card">
    <div class="ring"><i>${ic('check', 34, '#fff', 'b')}</i></div>
    <h3>Tudo em dia!</h3><p>${esc(msg)}</p>
    <div class="hint info">${ic('bell-ringing', 16, '#178BCA')}<span>Não se preocupe: quando surgir algo que você precise fazer, eu te aviso.</span></div>
  </div></div>`;
}
function radioList(opts, sel, action) {
  return `<div class="radios">${opts.map((o, i) => `<button class="ropt ${sel === i ? 'on' : ''}" data-a="${action}" data-p="${i}" role="radio" aria-checked="${sel === i}"><span>${esc(o)}</span><span class="r"></span></button>`).join('')}</div>`;
}
function drow(k, v) { return v == null || v === '' ? '' : `<div class="drow"><div class="k">${esc(k)}</div><div class="v">${v}</div></div>`; }
function weekdayChips(days) { return `<div class="wdays">${WD_CHIPS.map((d, i) => `<span class="${days[i] ? 'on' : ''}">${d}</span>`).join('')}</div>`; }
function badge(text, variant = '') { return `<span class="pbadge ${variant}">${esc(text)}</span>`; }

function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
function lineChart(series, { color, h = 220, w = 320, yMin = 0, yMax, fmt = (v) => v, thick = 3, axisColor }) {
  const padL = 40, padR = 14, padT = 14, padB = 26;
  const n = series.length;
  const x = (i) => padL + (n === 1 ? (w - padL - padR) / 2 : (i * (w - padL - padR)) / (n - 1));
  const y = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * (h - padT - padB);
  const pts = series.map((p, i) => [x(i), y(p.v)]);
  const line = smoothPath(pts);
  const area = line ? `${line} L${pts[n - 1][0]},${h - padB} L${pts[0][0]},${h - padB} Z` : '';
  const gid = 'g' + Math.random().toString(36).slice(2, 7);
  const ac = axisColor || color;
  let grid = '';
  for (let k = 0; k <= 4; k++) {
    const v = yMin + ((yMax - yMin) * k) / 4;
    grid += `<line x1="${padL}" x2="${w - padR}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(0,29,75,.08)" stroke-dasharray="4 4"/><text x="${padL - 6}" y="${y(v) + 3}" text-anchor="end" font-size="10" fill="${ac}">${fmt(v)}</text>`;
  }
  const every = Math.ceil(n / 6);
  const xl = series.map((p, i) => (i % every === 0 || i === n - 1 ? `<text x="${x(i)}" y="${h - 8}" text-anchor="middle" font-size="10" fill="${ac}">${p.l}</text>` : '')).join('');
  const dots = pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="${n === 1 ? 6 : 3.5}" fill="${color}"/>`).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" width="100%" role="img" aria-label="Gráfico">
    <defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".35"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${grid}${area ? `<path d="${area}" fill="url(#${gid})"/>` : ''}${line ? `<path d="${line}" fill="none" stroke="${color}" stroke-width="${thick}" stroke-linecap="round"/>` : ''}${dots}${xl}</svg>`;
}
function countChart(hist, todayVal, color, fmtV, step) {
  const pts = hist.map((v, i) => ({ l: fDM(addD(TODAY, i - hist.length)), v })).concat([{ l: fDM(TODAY), v: todayVal }]);
  const max = Math.max(...pts.map((p) => p.v)) + step;
  return lineChart(pts, { color, yMax: Math.ceil(max / step) * step, fmt: fmtV, thick: 4, h: 240 });
}

/* ---------- number dial ---------- */
function openDial({ title, min, max, step, value, start, unit, allowClear, onDone }) {
  const dec = step < 1 ? 1 : 0;
  const spacing = step < 1 ? 10 : 22;
  const count = Math.round((max - min) / step);
  const state = { v: value ?? null };
  const majorEvery = step < 1 ? 10 : count > 80 ? 10 : 5;
  openModal({
    title,
    body: () => {
      let ticks = '';
      for (let i = 0; i <= count; i++) {
        const val = +(min + i * step).toFixed(dec);
        const major = i % majorEvery === 0;
        const medium = !major && i % (majorEvery / 2) === 0;
        const [tw, th, tc] = major ? [2, 36, '#333'] : medium ? [1.5, 24, '#999'] : [1, 16, 'rgba(153,153,153,.6)'];
        ticks += `<div class="tick" style="left:calc(var(--half, 150px) + ${i * spacing}px)"><i style="width:${tw}px;height:${th}px;background:${tc}"></i>${major ? `<span>${numPt(val, val % 1 ? dec : 0)}</span>` : ''}</div>`;
      }
      const shown = state.v ?? start;
      return `<input class="dial-val ${state.v == null ? 'empty' : ''}" id="dialv" inputmode="decimal" value="${numPt(shown, dec)}" aria-label="Valor" style="width:100%;border:0;background:transparent;font-family:inherit">
        <div class="dial-unit">${esc(unit || '')}</div>
        <div class="ruler-wrap"><div class="ruler" id="ruler"><div class="ruler-inner" style="width:calc(var(--half, 150px) * 2 + ${count * spacing}px)">${ticks}</div></div><div class="needle"></div><div class="fadeL"></div><div class="fadeR"></div></div>
        <div class="dial-hint">Deslize a régua ou toque no número para digitar</div>
        <div class="dial-btns">${allowClear ? '<button data-a="dialClear" style="background:rgba(0,29,75,.05);color:#001D4B;font-weight:600">Limpar</button>' : ''}<button data-a="dialDone" style="background:#0fab7a;color:#fff">Pronto</button></div>`;
    },
    mount: (el) => {
      const r = el.querySelector('#ruler');
      const inp = el.querySelector('#dialv');
      if (!r) return;
      r.firstElementChild.style.setProperty('--half', `${r.clientWidth / 2}px`);
      const toIdx = (v) => Math.round((v - min) / step);
      r.scrollLeft = toIdx(state.v ?? start) * spacing;
      let fromInput = false;
      r.addEventListener('scroll', () => {
        if (fromInput) return;
        const i = Math.max(0, Math.min(count, Math.round(r.scrollLeft / spacing)));
        state.v = +(min + i * step).toFixed(dec);
        inp.value = numPt(state.v, dec);
        inp.classList.remove('empty');
      });
      let drag = null;
      r.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') { drag = { x: e.clientX, s: r.scrollLeft }; r.setPointerCapture(e.pointerId); r.style.cursor = 'grabbing'; } });
      r.addEventListener('pointermove', (e) => { if (drag) r.scrollLeft = drag.s - (e.clientX - drag.x); });
      const end = () => { if (drag) { drag = null; r.style.cursor = ''; r.scrollTo({ left: Math.round(r.scrollLeft / spacing) * spacing, behavior: 'smooth' }); } };
      r.addEventListener('pointerup', end); r.addEventListener('pointercancel', end);
      r.addEventListener('wheel', (e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { e.preventDefault(); r.scrollLeft += e.deltaY; } }, { passive: false });
      inp.addEventListener('focus', () => inp.select());
      inp.addEventListener('input', () => {
        const v = parseFloat(inp.value.replace(',', '.'));
        if (isNaN(v)) return;
        state.v = Math.max(min, Math.min(max, v));
        fromInput = true;
        r.scrollLeft = toIdx(state.v) * spacing;
        setTimeout(() => { fromInput = false; }, 50);
      });
    },
  });
  ui.dial = { done: () => { closeModal(true); onDone(state.v ?? start); }, clear: () => { closeModal(true); onDone(null); } };
}

/* ---------- justify modal ---------- */
function openJustify(onDone) {
  ui.just = { sel: null, text: '' };
  openModal({
    title: 'Por que você irá pular?',
    body: () => `<p class="mhint">Selecione o motivo pelo qual você não pôde concluir este item do plano de cuidado.</p>
      ${radioList(JUSTIFY_OPTIONS, ui.just.sel, 'justSel')}
      ${ui.just.sel === 6 ? `<textarea class="ta" id="justText" data-in="justText" placeholder="Digite o motivo" style="margin-top:10px">${esc(ui.just.text)}</textarea>` : ''}
      <button class="b-pill" id="justSubmit" data-a="justSubmit" ${ui.just.sel == null || (ui.just.sel === 6 && !ui.just.text.trim()) ? 'disabled' : ''}>Enviar justificativa</button>`,
  });
  ui.justDone = onDone;
}

/* ---------- screens ---------- */
const SCREENS = {};

SCREENS.login = () => ({
  light: true,
  html: `<div class="scr login" style="background-image:url(img/signin.jpg)">
    <div class="wordmark" style="background-image:url(img/header.png)" role="img" aria-label="Takere"></div>
    <form class="lcard" data-form="login">
      <label class="flabel" for="lemail">Email</label>
      <input class="field" id="lemail" type="email" value="maria.silva@email.com" placeholder="Digite seu email" autocomplete="off" style="margin-bottom:12px">
      <label class="flabel" for="lpass">Senha</label>
      <div class="pwd"><input class="field" id="lpass" type="${ui.showPass ? 'text' : 'password'}" value="demo1234" placeholder="Digite sua senha"><button type="button" class="eye" data-a="togglePass" aria-label="Mostrar senha">${ic(ui.showPass ? 'eye-slash' : 'eye', 20, '#999')}</button></div>
      <p style="margin:14px 0 4px;font-size:14px;color:#333;line-height:1.4">Ao se autenticar, você concorda com os nossos <a href="https://www.takere.com.br/policy" target="_blank" rel="noopener" style="color:#2563EB">Termos de Uso</a></p>
      <button class="b-pill" type="submit">Entrar</button>
    </form>
  </div>`,
});

SCREENS.splash = () => ({
  html: `<div class="scr loading"><img src="img/logo.png" width="100" height="100" alt="Takere"><div class="spinner" role="status" aria-label="Carregando"></div></div>`,
  mount: () => {
    clearTimeout(timers.splash);
    timers.splash = setTimeout(() => {
      if (cur().n !== 'splash') return;
      if (!S.seenChanges) root('changes'); else root('home');
    }, 1100);
  },
});

SCREENS.offline = () => ({
  html: `<div class="scr offline"><img src="img/no-signal.png" width="150" height="150" alt=""><h2>Você está offline</h2><p>É necessário ter conexão com a internet</p><button class="b-neutral" data-a="goHome" style="margin-top:20px">Voltar ao início</button></div>`,
});
SCREENS['server-off'] = () => ({
  html: `<div class="scr offline"><img src="img/unplugged.png" width="200" height="200" alt=""><h2>Ops</h2><h2>O servidor da Takere está offline</h2><p>Já estamos consertando! Tente voltar mais tarde</p><button class="b-neutral" data-a="goHome" style="margin-top:20px">Voltar ao início</button></div>`,
});

/* care plan changes */
const CHANGES = [
  { name: 'Sinvastatina 20 mg', nbc: 'Medicamento', color: '#db594f', icon: 'pill', kind: 'Inclusão', fields: [['Horários', null, '22:00'], ['Frequência', null, '1x ao dia'], ['Por que preciso tomar?', null, 'Reduzir o colesterol.']] },
  { name: 'Losartana 50 mg', nbc: 'Medicamento', color: '#db594f', icon: 'pill', fields: [['Horários', '07:00', '08:00']] },
  { name: 'Leia: cuidados com o curativo', nbc: 'Atividade', color: '#f974bc', icon: 'check-circle', fields: [['Data de término', 'Sem data de término', fDMY(addD(TODAY, 10))]] },
];
SCREENS.changes = () => ({
  html: `<div class="scr">
    ${header('Plano de cuidado atualizado!', { backable: false })}
    <div class="scroll pad" data-k="s">
      <p style="font-size:15px;color:#999;line-height:22px;margin:0 0 16px">Seu plano de cuidado foi alterado pela equipe de saúde. Por favor, revise as alterações abaixo.</p>
      <div style="display:flex;flex-direction:column;gap:20px;padding-bottom:16px">
      ${CHANGES.map((g) => `<div class="cgroup">
        <div class="ch" style="background:${alpha(g.color, '1a')}">
          <div class="tile" style="background:${g.color}">${ic(g.icon, 22, '#fff')}</div>
          <div style="min-width:0"><div class="nm">${esc(g.name)}</div><div class="pills"><span style="background:${alpha(g.color, '1f')};border-color:${alpha(g.color, '33')};color:${g.color}">${g.nbc}</span>${g.kind ? `<span style="background:${alpha(g.color, '29')};color:${g.color};font-weight:700">${g.kind}</span>` : ''}</div></div>
          <div class="num" style="background:${alpha(g.color, '1f')};border-color:${alpha(g.color, '38')};color:${g.color}">${g.fields.length}</div>
        </div>
        ${g.fields.map(([k, a, b]) => `<div class="cfield"><div class="k">${esc(k)}</div>
          <div class="cbox" style="background:#F4F6F8"><small style="color:#999">Antes</small><span style="color:#999">${esc(a ?? '—')}</span></div>
          <div class="carr">↓</div>
          <div class="cbox" style="background:#e7f6f1"><small style="color:#0c8861">Depois</small><span style="color:#333">${esc(b)}</span></div></div>`).join('')}
      </div>`).join('')}
      </div>
    </div>
    <div class="act-foot"><button class="b-pill" data-a="ackChanges">Estou ciente</button></div>
  </div>`,
});

/* home */
const MODULES = [
  { k: 'medication', l: 'Medicamentos', i: 'pill', c: '#db594f', go: ['board', { page: 'medication' }] },
  { k: 'task', l: 'Tarefas', i: 'list-checks', c: '#D63384', go: ['board', { page: 'tasks' }] },
  { k: 'water', l: 'Hidratação', i: 'drop', c: '#178BCA', go: ['water'] },
];
SCREENS.home = () => {
  const f = flags();
  const h = NOW.getHours();
  const greet = h >= 5 && h < 12 ? 'Bom dia' : h >= 12 && h < 18 ? 'Boa tarde' : 'Boa noite';
  const done = MODULES.filter((m) => f[m.k]).length;
  const stc = f.upToDate ? '#0fab7a' : '#db594f';
  const nodes = S.week.map((ok, i) => ({ ok, today: false, d: addD(TODAY, i - 4) })).concat([{ ok: f.upToDate, today: true }]);
  const nodeColor = (n) => (n.ok ? '#0fab7a' : n.today ? '#FD7E14' : '#db594f');
  const tiles = [
    { ok: S.notifOk, i: 'bell', t: 'Notificações', okT: 'Configurado', no: 'Pendente', a: 'allowNotif' },
    { ok: true, i: 'speaker-high', t: 'Toque', okT: 'As notificações tocam em voz alta', no: 'O som não deve estar em vibração nem silenciado' },
    { ok: true, i: 'wifi-high', t: 'Internet', okT: 'Com conexão', no: 'Sem conexão' },
  ];
  return {
    light: true, tab: 'home',
    html: `<div class="scr">
      <button class="gear" data-a="go" data-p="settings" aria-label="Configurações">${sv('settings', 22, 22, '#F4F6F8')}</button>
      <div class="hero" style="border-bottom-color:${stc}">
        <p>${greet}, ${esc(S.user.firstName)}!!!</p>
        <p>No momento, seu tratamento está</p>
        <div class="badge" style="background:${stc}">${f.upToDate ? 'EM DIA' : 'COM PENDÊNCIAS'}</div>
      </div>
      <div class="scroll no-bar" data-k="s"><div class="home-body">
        <section><div class="cardttl">Checklist de hoje do seu tratamento</div>
          <div class="hcard">
            <div class="prog"><div class="track"><i style="width:${(done / MODULES.length) * 100}%"></i></div><span>${done} de ${MODULES.length} concluídos</span></div>
            <div class="checklist">${MODULES.map((m) => {
              const ok = f[m.k]; const sc = ok ? '#0fab7a' : '#FD7E14';
              return `<button class="citem" style="background:${alpha(sc, '12')}" data-a="module" data-p="${m.k}">
                <span class="l"><span class="ibox" style="background:${alpha(m.c, '1f')}">${ic(m.i, 15, m.c, 'b')}</span><span class="lbl">${m.l}</span></span>
                <span class="spill" style="background:${alpha(sc, '24')};color:${sc}">${ic(ok ? 'check' : 'clock', 11, sc, 'b')}${ok ? 'Concluído' : 'Pendente'}</span>
              </button>`;
            }).join('')}</div>
          </div>
        </section>
        <section><div class="cardttl">Meu Progresso</div>
          <button class="hcard tap" data-a="go" data-p="progress" aria-label="Abrir meu progresso">
            <div class="timeline">${nodes.map((n, i) => {
              const c = nodeColor(n); const size = n.today ? 32 : 26;
              return `<div class="tnode"><div class="row">
                ${i < nodes.length - 1 ? `<span class="conn" style="background:${alpha(c, '59')}"></span>` : ''}
                <span class="c ${n.today && !n.ok ? 'pulse' : ''}" style="width:${size}px;height:${size}px;background:${c};box-shadow:0 0 0 3px ${alpha(c, '26')}">${ic(n.ok ? 'check' : n.today ? 'clock' : 'x', n.today ? 16 : 12, '#fff', 'b')}</span>
              </div><span class="lab ${n.today ? 'today' : ''}">${n.today ? 'Hoje' : fDM(n.d)}</span></div>`;
            }).join('')}</div>
          </button>
        </section>
        <section><div class="cardttl">Configurações do celular</div>
          <div class="hcard"><div class="phone-tiles">${tiles.map((t) => {
            const c = t.ok ? '#0fab7a' : '#FD7E14';
            return `<${t.a ? `button data-a="${t.a}"` : 'div'} class="ptile">
              <span class="ib" style="background:${alpha(c, '1f')}">${ic(t.i, 20, c, 'b')}<span class="cb" style="background:${c}">${ic(t.ok ? 'check' : 'clock', 8, '#fff', 'b')}</span></span>
              <b>${t.t}</b><small style="color:${c}">${t.ok ? t.okT : t.no}</small>
            </${t.a ? 'button' : 'div'}>`;
          }).join('')}</div></div>
        </section>
      </div></div>
      ${tabbar('home')}
    </div>`,
  };
};

function tabbar(active) {
  const f = flags();
  const c = f.upToDate ? '#0fab7a' : '#db594f';
  const oc = f.upToDate ? '#db594f' : '#0fab7a';
  const lab = (k, label, icon) => `<button class="tabbtn ${active === k ? 'on' : ''}" data-a="tab" data-p="${k}">${icon(active === k ? '#0fab7a' : 'rgba(51,51,51,.6)')}<span>${label}</span></button>`;
  return `<nav class="tabbar">
    ${lab('home', 'Início', (col) => sv('home', 24, 24, col))}
    <button class="chatbtn ${active === 'chat' ? 'on' : ''}" data-a="tab" data-p="chat" style="background:${c};border:3px solid ${c};box-shadow:0 4px 10px ${alpha(c, '66')}" aria-label="Chat">
      <span class="inner">${sv('chat', 24, 24, '#F4F6F8')}<span>CHAT</span></span>
      ${S.unread && active !== 'chat' ? `<span class="dot" style="background:${oc}"></span>` : ''}
    </button>
    ${lab('records', 'Prontuário', (col) => sv('medical-records', 22, 22, col))}
  </nav>`;
}

/* board */
function timeline(items, keyFn, renderItem, highlightOn) {
  const groups = new Map();
  items.forEach((it) => { const k = keyFn(it) || ''; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(it); });
  const keys = [...groups.keys()].sort((a, b) => (!a ? 1 : !b ? -1 : a.localeCompare(b)));
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  let closest = null, best = Infinity;
  keys.forEach((k) => { if (!k) return; const m = +k.slice(0, 2) * 60 + +k.slice(3); const d = Math.abs(m - nowMin); if (d < best) { best = d; closest = k; } });
  return keys.map((k, idx) => {
    const p = period(k);
    const last = idx === keys.length - 1;
    const dim = highlightOn && closest && k !== closest;
    return `<div class="tgroup ${dim ? 'dim' : ''}">
      <div class="trail"><span class="pc" style="background:${p.c}">${ic(p.i, 17, '#fff')}</span>${last ? '' : `<span class="ln" style="background:${alpha(p.c, '47')}"></span>`}</div>
      <div class="tcol">
        <div class="thead">${k ? `<span class="tm">${k}</span><span class="chip" style="background:${alpha(p.c, '1F')};border-color:${alpha(p.c, '47')};color:${p.c}">${p.l}</span>` : '<span class="tm" style="font-size:16px">Sem horário</span>'}<span class="cntb">${groups.get(k).length}</span></div>
        ${groups.get(k).map(renderItem).join('')}
        ${last ? '' : `<div class="dots">${'<i></i>'.repeat(6).replace(/<i>/g, `<i style="background:${p.c}">`)}<b style="border-color:${p.c}"></b></div>`}
      </div>
    </div>`;
  }).join('');
}
function medCard(m) {
  const foodText = FOOD[m.food] ? FOOD[m.food] + (m.offset ? ` (${m.offset})` : '') : '';
  const canComplete = medPend(m);
  const canJustify = m.status === 'EXPIRED';
  let action = '';
  if (m.waiting) action = `<div class="hint info">${ic('info', 16, '#178BCA')}<span>${m.condition ? `Somente se ${esc(m.condition)}` : 'Este medicamento só deve ser tomado se a condição relacionada ocorrer.'}</span></div>`;
  else if (canComplete) action = `<div class="brow"><button class="b-ok" style="flex:1.6" data-a="medTake" data-p="${m.id}">${ic('check', 16, '#fff', 'b')}Confirmar</button><button class="b-soft" style="flex:1" data-a="medSkip" data-p="${m.id}">${ic('skip-forward', 14, '#001D4B', 'b')}Pular</button></div>`;
  else if (canJustify) action = `<button class="b-soft" data-a="medSkip" data-p="${m.id}">Justificar</button>`;
  const body = (foodText || action) ? `<div class="acc-b">${foodText ? `<div class="hint warn">${ic('warning', 16, '#FD7E14')}<span>${foodText}</span></div>` : ''}${action}</div>` : '';
  return `<div class="acc">
    <button class="acc-h" data-a="medDetail" data-p="${m.id}">${statusIcon(m.status, canComplete)}<span class="t">${esc(m.name)}${m.review ? badge('Aguardando revisão') : ''}</span>${ic('caret-right', 16, '#001D4B')}</button>
    ${body}
  </div>`;
}
function taskItem(t) {
  const actionable = t.status === 'PLANNED';
  const late = t.late && actionable;
  let right;
  if (t.status === 'CONFIRMED' || t.status === 'JUSTIFIED') right = statusIcon(t.status);
  else if (t.early && actionable) right = '<span class="donow">Fazer agora</span>';
  else right = `<span class="gocirc">${ic('caret-right', 16, '#001D4B')}</span>`;
  return `<button class="aitem ${late ? 'late' : ''}" data-a="openTask" data-p="${t.id}" ${actionable ? '' : 'disabled'}>
    <span class="aicon" style="background:${alpha(t.color, '24')}"><i style="background:${t.color}">${ic(t.icon, 15, '#fff')}</i></span>
    <span class="mid"><span class="nm">${esc(t.name)}</span>${t.review ? badge('Aguardando revisão') : ''}
      ${actionable && t.deadline ? `<span class="dl">${ic('clock', 12, late ? '#db594f' : '#999')}Deve ser completado até ${t.deadline}</span>` : ''}</span>
    ${right}
  </button>`;
}
function medDetailsRows(m) {
  const qty = `${m.quantity} ${m.form}${m.quantity > 1 ? 's' : ''}`;
  const drugs = m.drugs.map((d) => `${d[0]} ${d[1]} ${d[2]}`).join(' + ');
  const food = FOOD_LABEL[m.food] ? FOOD_LABEL[m.food] + (m.offset ? ` · ${m.offset}` : '') : '';
  return `<div class="drows">
    ${drow('Quantidade e forma', esc(qty))}${drow('Fármacos', esc(drugs))}${drow('Via de administração', esc(m.admin))}
    ${drow('Relação com a refeição', esc(food))}
    ${m.condition ? drow('Quando tomar', esc(m.condition)) : drow('Dias da semana', weekdayChips(m.days))}
    ${drow('Frequência', m.freqLabel ? esc(m.freqLabel) : `${m.times.length}x ao dia`)}
    ${m.times.length ? drow('Horários', m.times.join(', ')) : ''}
    ${drow('Data de início', fDMY(addD(TODAY, m.startsOn)))}${drow('Data de término', 'Uso contínuo')}
    ${drow('Por que preciso tomar?', esc(m.why))}${drow('Notas', esc(m.notes))}
  </div>`;
}
SCREENS.board = (r) => {
  const f = flags();
  const page = r.page || 'medication';
  const isMed = page === 'medication';
  const tabs = `<div class="btabs" role="tablist">
    <button class="${isMed ? 'on' : ''}" data-a="boardPage" data-p="medication" role="tab" aria-selected="${isMed}">${ic('pill', 18, 'currentColor')}Medicamentos${f.medPending ? `<span class="cnt" style="background:#db594f">${f.medPending}</span>` : ''}</button>
    <button class="${!isMed ? 'on' : ''}" data-a="boardPage" data-p="tasks" role="tab" aria-selected="${!isMed}">${ic('clipboard-text', 18, 'currentColor')}Tarefas${f.taskPending ? `<span class="cnt" style="background:#D63384">${f.taskPending}</span>` : ''}</button>
  </div>`;
  const hl = isMed ? S.highlight.medication : S.highlight.tasks;
  const toggle = `<div class="hltoggle"><span class="l">${ic('clock', 18, '#001D4B')}${isMed ? 'Destacar medicamentos de agora' : 'Destacar tarefas de agora'}</span><button class="switch ${hl ? 'on' : ''}" role="switch" aria-checked="${hl}" data-a="toggleHl" data-p="${page}" aria-label="Destacar itens de agora"><i></i></button></div>`;
  const body = isMed
    ? `${toggle}<div style="padding-top:8px">${timeline(S.meds, (m) => m.time, medCard, hl)}</div><div class="legend" style="margin-bottom:50px"><h4>Legenda de status</h4><div class="wrap">${legendChips()}</div></div>`
    : `${toggle}<div style="padding-top:8px;padding-bottom:50px">${timeline(S.tasks, (t) => t.time, taskItem, hl)}</div>`;
  return {
    light: true,
    html: `<div class="scr">${navyHeader({ title: isMed ? 'Medicamentos' : 'Tarefas do dia', border: isMed ? '#db594f' : '#D63384', tabs })}
      <div class="scroll" data-k="${page}"><div class="bbody">${body}</div></div></div>`,
  };
};

/* activities */
const FORM_QS = [
  { l: 'Como você se sente hoje?', type: 'radio', o: ['Bem', 'Regular', 'Mal'] },
  { l: 'Quais sintomas você sentiu nas últimas 24 horas?', type: 'checkbox', o: ['Febre', 'Dor no local do curativo', 'Náusea', 'Tontura', 'Nenhum'] },
  { l: 'Nível de dor (0 a 10)', type: 'integer', min: 0, max: 10 },
  { l: 'Observações', type: 'text' },
];
function actFrame(t, body, foot) {
  return `<div class="scr">${header(t.name)}<div class="scroll pad" data-k="s">${body}</div><div class="act-foot">${foot}</div></div>`;
}
SCREENS.act = (r) => {
  const t = S.tasks.find((x) => x.id === r.id);
  ui.act = ui.act || {};
  const a = (ui.act[t.id] = ui.act[t.id] || { q: 0, ans: [], unit: 0, photo: false });
  const skip = `<button class="b-neutral" data-a="taskSkip" data-p="${t.id}" style="width:100%">Pular</button>`;
  if (t.type === 'TEXT') {
    return { html: actFrame(t, `<div class="ttext"><p>A troca correta do curativo ajuda a ferida a cicatrizar mais rápido e evita infecções.</p><p><b>Passo a passo</b></p><p>1. Lave as mãos com água e sabão.<br>2. Retire o curativo antigo com cuidado.<br>3. Limpe a ferida com soro fisiológico, de dentro para fora.<br>4. Seque a pele ao redor com gaze, sem esfregar.<br>5. Coloque o curativo novo e fixe com a fita.</p><p>Se notar vermelhidão, pus ou mau cheiro, avise sua equipe de saúde.</p></div>`,
      `<button class="b-ok" data-a="taskFinish" data-p="${t.id}" style="width:100%">${ic('check', 16, '#fff', 'b')}Concluir</button>${skip}`) };
  }
  if (t.type === 'FORM') {
    const q = FORM_QS[a.q];
    const v = a.ans[a.q];
    let input = '';
    if (q.type === 'radio') input = radioList(q.o, v ?? null, 'formRadio');
    else if (q.type === 'checkbox') input = `<div class="checks">${q.o.map((o, i) => { const on = (v || []).includes(i); return `<button class="copt ${on ? 'on' : ''}" data-a="formCheck" data-p="${i}" role="checkbox" aria-checked="${on}"><span class="bx">${on ? ic('check', 14, '#fff', 'b') : ''}</span>${esc(o)}</button>`; }).join('')}</div>`;
    else if (q.type === 'integer') input = `<button class="field ${v == null ? 'ph' : ''}" data-a="formDial">${v == null ? 'Toque para escolher' : v}</button>`;
    else input = `<textarea class="ta" data-in="formText" placeholder="Escreva aqui">${esc(v || '')}</textarea>`;
    const filled = q.type === 'text' ? true : q.type === 'checkbox' ? (v || []).length > 0 : v != null;
    const lastQ = a.q === FORM_QS.length - 1;
    return { html: actFrame(t, `<div class="qprog"><div class="track"><i style="width:${((a.q + 1) / FORM_QS.length) * 100}%"></i></div><span>${a.q + 1} / ${FORM_QS.length}</span></div>
      <h2 class="qtitle">${a.q + 1}. ${esc(q.l)}</h2>${input}`,
      `<div class="navrow">${a.q > 0 ? '<button class="b-neutral" data-a="formPrev">Voltar</button>' : '<span></span>'}
        <button class="b-next" id="formNext" data-a="${lastQ ? 'formFinish' : 'formNext'}" ${filled ? '' : 'disabled'}>${lastQ ? `${ic('check', 18, '#fff', 'b')}Concluir` : `Próximo${ic('caret-right', 18, '#fff', 'b')}`}</button></div>${skip}`) };
  }
  if (t.type === 'ASK_ANSWER') {
    const v = a.ans[0];
    return { html: actFrame(t, `<h2 class="qtitle">1. Qual é a sua temperatura agora?</h2>
      <button class="field ${v == null ? 'ph' : ''}" data-a="askDial">${v == null ? 'Toque para informar' : numPt(v, 1)}</button>
      <div class="units">${['°C', '°F'].map((u, i) => `<button class="${a.unit === i ? 'on' : ''}" data-a="askUnit" data-p="${i}">${u}</button>`).join('')}</div>`,
      `<div class="navrow"><span></span><button class="b-next" data-a="askFinish" ${v == null ? 'disabled' : ''}>${ic('check', 18, '#fff', 'b')}Concluir</button></div>${skip}`) };
  }
  // PHOTO
  const photo = a.photo
    ? `<div class="photo-full"><div class="mock">${ic('camera', 40, 'rgba(255,255,255,.7)')}</div><span class="sel">${ic('check-circle', 14, '#fff', 'f')}Foto selecionada</span><button class="rm" data-a="photoRemove" aria-label="Remover foto">${ic('x', 16, '#fff', 'b')}</button></div>`
    : `<button class="photo-empty" data-a="photoTake"><span class="c">${ic('camera-plus', 30, '#0fab7a')}</span><b>Adicione uma foto</b><small>Tire uma foto agora ou escolha uma da galeria.</small></button>`;
  return { html: actFrame(t, `<div style="display:flex;flex-direction:column;gap:16px;margin-top:8px">${photo}
    <div class="srcs"><button class="srcbtn" data-a="photoTake"><span class="c">${ic('camera', 22, '#0fab7a')}</span><b>Câmera</b><small>${a.photo ? 'Tirar outra foto' : 'Tirar foto'}</small></button>
    <button class="srcbtn" data-a="photoTake"><span class="c">${ic('images', 22, '#0fab7a')}</span><b>Galeria</b><small>${a.photo ? 'Escolher outra da galeria' : 'Escolher da galeria'}</small></button></div></div>`,
    `${a.photo ? `<button class="b-ok" data-a="taskFinish" data-p="${t.id}" style="width:100%">${ic('check', 16, '#fff', 'b')}Concluir</button>` : ''}${skip}`) };
};

/* water */
SCREENS.water = () => {
  const w = S.water;
  const pct = Math.min(100, Math.round((w.intake / w.goal) * 100));
  const reached = w.intake >= w.goal;
  const btn = (delta, color, icon) => `<button class="dbtn" style="border-color:${color};color:${color}" data-a="water" data-p="${delta}">${icon}<span>${delta > 0 ? '+' : '-'}${Math.abs(delta)}ml</span></button>`;
  return {
    light: true,
    html: `<div class="scr">${navyHeader({ title: 'Hidratação', sub: `${ml(w.intake)} de ${ml(w.goal)} hoje`, border: '#178BCA' })}
      <div class="scroll" data-k="s"><div class="bbody">
        <div class="wcard" style="padding-top:20px;padding-bottom:16px">
          <div class="gauge"><div class="water" style="height:${pct}%"></div><div class="pct ${pct > 55 ? 'inv' : ''}">${pct}%</div></div>
          <p class="wmsg">${reached ? `Parabéns!!! Você cumpriu sua meta diária de beber <b>${ml(w.goal)}</b> de água!` : `Você bebeu <b>${ml(w.intake)}</b> de agua hoje. Faltam <b>${ml(w.goal - w.intake)}</b> para atingir sua meta diária de <b>${ml(w.goal)}</b>.`}</p>
          <div class="dgrid">${btn(250, '#178BCA', glassSvg('#178BCA', 28))}${btn(500, '#178BCA', sv('water-bottle', 30, 30, '#178BCA'))}${btn(-250, '#db594f', glassSvg('#db594f', 28))}${btn(-500, '#db594f', sv('water-bottle', 30, 30, '#db594f'))}</div>
        </div>
        <div class="wcard chartcard"><div class="t">Últimos dias</div>${countChart(w.hist, w.intake, '#178BCA', (v) => ml(v), 500)}</div>
      </div></div></div>`,
  };
};

/* progress */
function progressGroups() {
  const end = addD(TODAY, ui.prog.shift);
  const days = [];
  for (let i = ui.prog.len - 1; i >= 0; i--) days.push(addD(end, -i));
  const medsByName = [];
  S.meds.filter((m) => !m.waiting).forEach((m) => {
    let e = medsByName.find((x) => x.name === m.name);
    if (!e) { e = { name: m.name, slots: [], startsOn: m.startsOn, origin: m.review }; medsByName.push(e); }
    e.slots.push({ time: m.time, live: m });
  });
  const taskRows = (types) => S.tasks.filter((t) => types.includes(t.type)).map((t) => ({ name: t.name, slots: [{ time: t.time, live: t }], startsOn: -60, days: t.days }));
  return {
    days,
    groups: [
      { name: 'Medicamento', color: '#db594f', icon: 'pill', items: medsByName },
      { name: 'Foto', color: '#f974bc', icon: 'image', items: taskRows(['PHOTO']) },
      { name: 'Temperatura', color: '#f974bc', icon: 'thermometer', items: taskRows(['ASK_ANSWER']) },
      { name: 'Questionário', color: '#f974bc', icon: 'question', items: taskRows(['FORM']) },
      { name: 'Atividade', color: '#f974bc', icon: 'check-circle', items: taskRows(['TEXT']) },
    ],
  };
}
function histStatus(item, slot, d, gi, ii, si) {
  const off = Math.round((d - TODAY) / 86400000);
  if (off > 0) return off === 0 ? null : 'PLANNED_FUTURE';
  if (off < (item.startsOn ?? -60)) return null;
  if (off === 0) return slot.live.status;
  const wd = (d.getDay() + 6) % 7;
  if (item.days && !item.days[wd]) return 'NOT_SCHEDULED';
  const key = `${gi}-${ii}-${si}-${dKey(d)}`;
  if (S.histOverride[key]) return S.histOverride[key];
  const r = hash(gi * 100 + ii * 10 + si, off + 500);
  return r < 0.8 ? 'CONFIRMED' : r < 0.88 ? 'SKIPPED' : r < 0.94 ? 'JUSTIFIED' : 'EXPIRED';
}
SCREENS.progress = () => {
  ui.prog = ui.prog || { shift: 0, len: 15, inactive: false };
  const { days, groups } = progressGroups();
  const start = days[0], end = days[days.length - 1];
  const presets = { 15: 'Últimos 15 dias', 30: 'Últimos 30 dias' };
  const col = (d) => {
    const isToday = dKey(d) === dKey(TODAY);
    const we = d.getDay() === 0 || d.getDay() === 6;
    return { isToday, we };
  };
  const groupHtml = groups.map((g, gi) => {
    const rows = [];
    g.items.forEach((it, ii) => it.slots.forEach((s, si) => rows.push({ it, s, ii, si, first: si === 0 })));
    const labels = rows.map((r) => `<button class="lr ${r.first ? 'first' : ''}" data-a="progItem" data-p="${gi}:${r.ii}">${r.first ? `<span class="ti">${esc(r.it.name)}</span>` : ''}<span class="sl">${r.s.time || ''}</span></button>`).join('');
    const cols = days.map((d) => {
      const c = col(d);
      const cells = rows.map((r) => {
        const st = histStatus(r.it, r.s, d, gi, r.ii, r.si);
        let inner = '';
        if (st === 'PLANNED_FUTURE' || st == null) inner = '';
        else if (st === 'NOT_SCHEDULED') inner = '<span style="width:6px;height:6px;border-radius:50%;background:#b0b5bd"></span>';
        else {
          const s = STATUS[st];
          const canJ = (st === 'SKIPPED' || st === 'EXPIRED') && dKey(d) !== dKey(TODAY);
          const canO = st === 'CONFIRMED';
          const p = `${gi}:${r.ii}:${r.si}:${dKey(d)}`;
          inner = `<${canJ || canO ? `button data-a="${canJ ? 'progJustify' : 'progOpen'}" data-p="${p}" aria-label="${s.l}"` : 'span'} class="smark ${canJ ? 'j' : ''}">${ic(s.i, 18, s.c, s.w)}</${canJ || canO ? 'button' : 'span'}>`;
        }
        return `<div class="cell ${r.first ? 'first' : ''}">${inner}</div>`;
      }).join('');
      return `<div class="dcol ${c.we ? 'we' : ''} ${c.isToday ? 'today' : ''}"><div class="dh"><small>${WD_SHORT[d.getDay()]}</small><b>${d.getMonth() !== start.getMonth() || d.getMonth() !== end.getMonth() ? fDM(d) : d.getDate()}</b></div>${cells}</div>`;
    }).join('');
    const nItems = g.items.length;
    return `<div class="hgroup" style="border-color:${alpha(g.color, '24')}">
      <div class="gh" style="background:${alpha(g.color, '14')};border-bottom-color:${alpha(g.color, '24')}"><span class="sq" style="background:${g.color}">${ic(g.icon, 18, '#fff')}</span><b>${g.name}</b><span class="cnt" style="background:${alpha(g.color, '1f')};border-color:${alpha(g.color, '38')};color:${g.color}">${nItems}</span></div>
      <div class="hgrid"><div class="hlabels"><div class="sp"></div>${labels}</div><div class="hdays" data-scroll-end><div class="hdays-inner">${cols}</div></div></div>
    </div>`;
  }).join('');
  const temps = days.filter((d) => d <= TODAY).map((d, i) => ({ l: fDM(d), v: +(36.3 + hash(7, Math.round((d - TODAY) / 86400000) + 900) * 1.1).toFixed(1) }));
  const tempPts = temps.map((p) => p);
  return {
    html: `<div class="scr">${header('Meu Progresso')}
      <div class="scroll pad" data-k="s"><div style="margin-top:8px;margin-bottom:100px">
        <div class="pnav">
          <button class="sqbtn" data-a="progShift" data-p="-1" aria-label="Período anterior">${ic('caret-left', 24, '#0c8861')}</button>
          <div class="dtiles"><div class="dtile"><small>Início</small><b>${fDMY(start)}</b></div><div class="dtile"><small>Fim</small><b>${fDMY(end)}</b></div></div>
          <button class="sqbtn" data-a="progShift" data-p="1" ${ui.prog.shift >= 0 ? 'disabled' : ''} aria-label="Próximo período">${ic('caret-right', 24, '#0c8861')}</button>
          <div class="pshort">
            <button class="minichip" data-a="progLen">${ic('calendar-dots', 14, '#0c8861', 'b')}${presets[ui.prog.len]}${ic('caret-down', 12, '#001D4B')}</button>
            <button class="minichip ${ui.prog.inactive ? 'on' : ''}" data-a="progInactive">${ui.prog.inactive ? ic('check-square', 14, '#0c8861', 'f') : ic('square', 14, '#001D4B', 'b')}Mostrar inativos</button>
          </div>
        </div>
        <div class="hint info" style="margin-bottom:16px;border-radius:12px;padding:10px 12px">${ic('info', 16, '#178BCA')}<span>Você pode conferir sua resposta tocando no ícone de concluído ${ic('check-circle', 14, '#2ecc71', 'f')}.</span></div>
        ${groupHtml}
        <div class="legend" style="margin:0 0 16px"><h4>Legenda de status</h4><div class="wrap">${legendChips()}</div>
          <div class="hint warn" style="margin-top:12px;border-radius:12px;padding:10px 12px">${ic('hand-tap', 16, '#FD7E14')}<span>Toque em um dia pulado ou expirado com anel laranja para adicionar uma justificativa.</span></div></div>
        <div class="wcard" style="border-color:rgba(0,29,75,.05)"><div style="font-size:15px;font-weight:700;color:#001D4B;margin-bottom:10px">Gráficos</div>
          <div class="wcard" style="border-color:rgba(0,29,75,.05);border-radius:12px;padding:10px 12px 8px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="width:4px;height:16px;border-radius:2px;background:#6F42C1"></span><b style="font-size:13px;font-weight:600;color:#001D4B">Temperatura (°C)</b></div>
          ${lineChart(tempPts, { color: '#6F42C1', yMin: 35, yMax: 39, fmt: (v) => numPt(v, 0), thick: 2.5, axisColor: '#8A97AB' })}</div>
        </div>
      </div></div></div>`,
    mount: (el) => el.querySelectorAll('[data-scroll-end]').forEach((s) => { s.scrollLeft = s.scrollWidth; }),
  };
};

/* chat */
SCREENS.chat = () => ({
  tab: 'chat',
  html: `<div class="scr">${header('Chat', { backable: false })}
    <div class="scroll" data-k="chat" id="chatScroll"><div class="msgs">
      ${S.chat.map((m, i) => {
        const me = m.s === 'PATIENT';
        return `<div class="mrow ${me ? 'me' : 'them'} ${m.fresh ? 'fadein' : ''}"><div class="bub">${me ? tailRight : tailLeft}${esc(m.b)}${m.btn ? `<button class="mbtn" data-a="chatAction" data-p="${m.btn[1]}">${esc(m.btn[0])}</button>` : ''}<div class="ts">${fDT(m.t)}</div></div></div>`;
      }).join('')}
      ${ui.typing ? '<div class="mrow them"><div class="bub" style="color:#999">digitando…</div></div>' : ''}
    </div></div>
    <div class="composer"><button class="in ${ui.chatSel == null ? 'ph' : ''}" data-a="chatPick">${ui.chatSel == null ? 'Toque para escolher uma mensagem' : esc(CHAT_OPTIONS[ui.chatSel][0])}</button>
    <button class="sendb" data-a="chatSend" ${ui.chatSel == null ? 'disabled' : ''} aria-label="Enviar">${sv('send', 25, 25, '#fff')}</button></div>
    ${tabbar('chat')}
  </div>`,
  mount: (el) => { const s = el.querySelector('#chatScroll'); if (s) s.scrollTop = s.scrollHeight; S.chat.forEach((m) => { m.fresh = false; }); },
});
function guideListHtml() {
  return `<div class="glist">${S.guides.map((g) => `<button class="gitem" data-a="openGuide" data-p="${g.id}"><span class="gi" style="background:${g.color}">${ic(g.icon, 30, '#fff')}</span><span class="gt"><b>${esc(g.name)}</b><span>${esc(g.description)}</span></span>${g.read ? '' : '<span class="unread"></span>'}</button>`).join('')}</div>`;
}
function calendarHtml() {
  const base = new Date(TODAY.getFullYear(), TODAY.getMonth() + (ui.calShift || 0), 1);
  const first = base.getDay();
  const dim = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  let cells = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d) => `<span class="wd">${d}</span>`).join('');
  for (let i = 0; i < first; i++) cells += '<span></span>';
  const f = flags();
  for (let d = 1; d <= dim; d++) {
    const date = new Date(base.getFullYear(), base.getMonth(), d);
    const off = Math.round((date - TODAY) / 86400000);
    let bg = '', fg = '#333';
    if (off === 0) { bg = f.upToDate ? '#0fab7a' : '#FD7E14'; fg = '#fff'; }
    else if (off < 0 && off > -60) { const r = hash(3, off + 900); bg = r < 0.78 ? '#0fab7a' : r < 0.9 ? '#FD7E14' : '#db594f'; fg = '#fff'; }
    cells += `<span class="d" style="${bg ? `background:${bg};color:${fg};font-weight:600` : `color:${off > 0 ? '#bbb' : '#333'}`}">${d}</span>`;
  }
  return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><button data-a="calShift" data-p="-1" aria-label="Mês anterior" style="padding:6px">${ic('caret-left', 20, '#333', 'b')}</button><b style="font-size:16px">${months[base.getMonth()]} ${base.getFullYear()}</b><button data-a="calShift" data-p="1" aria-label="Próximo mês" style="padding:6px">${ic('caret-right', 20, '#333', 'b')}</button></div>
    <div class="calendar">${cells}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:12px">${[['#0fab7a', 'Concluído'], ['#FD7E14', 'Em andamento'], ['#db594f', 'Não iniciado']].map(([c, l]) => `<span style="display:flex;align-items:center;gap:6px;font-size:14px;color:#555"><i style="width:14px;height:14px;border-radius:50%;background:${c}"></i>${l}</span>`).join('')}</div>`;
}

/* guide reader */
SCREENS.guides = () => ({
  html: `<div class="scr">${header('Guias')}<div class="scroll pad pb-stack" data-k="s"><p style="margin:0 0 20px;font-size:15px;color:#999">Explicações para guiá-lo durante seu tratamento</p>${guideListHtml()}</div></div>`,
});
SCREENS.guide = (r) => {
  const g = S.guides.find((x) => x.id === +r.id);
  const pages = GUIDE_PAGES[g.id];
  const p = r.page || 0;
  const last = p === pages.length - 1;
  return {
    html: `<div class="scr">${header(g.name)}
      <div class="pad"><div class="track" style="height:8px;background:#e8ebef;margin:0 0 14px"><i style="width:${pages.length > 1 ? (p / (pages.length - 1)) * 100 : 100}%"></i></div></div>
      <div class="scroll pad reader" data-k="p${p}">${pages[p]}</div>
      <div class="act-foot"><div class="navrow">${p > 0 ? '<button class="b-neutral" data-a="guidePage" data-p="-1">Voltar</button>' : '<span></span>'}
        ${last ? `<button class="b-next" data-a="guideFinish" data-p="${g.id}">${ic('check', 18, '#fff', 'b')}Concluir</button>` : `<button class="b-next" data-a="guidePage" data-p="1">Próximo${ic('caret-right', 18, '#fff', 'b')}</button>`}</div></div>
    </div>`,
  };
};

/* health records */
function recMeds() {
  const out = [];
  S.meds.forEach((m) => { if (!out.find((x) => x.name === m.name)) out.push(m); });
  return out;
}
SCREENS.records = () => {
  const meds = recMeds();
  const counts = { all: meds.length + S.tasks.length + S.guides.length, meds: meds.length, tasks: S.tasks.length, guides: S.guides.length };
  const row = (icon, color, label, count, a, p) => `<button class="grow" data-a="${a}" data-p="${p || ''}"><span class="disc" style="background:${color}">${ic(icon, 18, '#F4F6F8')}</span><span class="lb">${label}</span>${count != null ? `<span class="ct">${count}</span>` : ''}${ui.exporting === p ? '<span class="spinner" style="width:18px;height:18px;border-width:2px"></span>' : sv('arrow-right', 11, 18, '#C7C7CC')}</button>`;
  return {
    tab: 'records',
    html: `<div class="scr">${header('Prontuário', { backable: false })}
      <div class="scroll pad pb-tab" data-k="s"><div class="group">
        ${row('folder', '#178BCA', 'Todos os Registros', counts.all, 'go', 'rec-all')}
        ${row('pill', '#db594f', 'Medicamentos', counts.meds, 'go', 'rec-meds')}
        ${row('clipboard-text', '#D63384', 'Tarefas', counts.tasks, 'go', 'rec-tasks')}
        ${row('book-open', '#46BDC6', 'Guias', counts.guides, 'go', 'rec-guides')}
        ${row('paper-plane-tilt', '#6F42C1', 'Solicitações de ajuste', null, 'go', 'items')}
        ${row('download-simple', '#999', 'Exportar prontuário em PDF', null, 'exportPdf', 'pdf')}
        ${row('file-pdf', '#999', 'Exportar histórico do plano em PDF', null, 'exportHist', 'hist')}
      </div></div>
      ${tabbar('records')}</div>`,
  };
};
function searchBox() {
  return `<label class="search">${ic('magnifying-glass', 18, '#999')}<input id="recSearch" data-in="recSearch" placeholder="Buscar" value="${esc(ui.q || '')}" aria-label="Buscar"></label>`;
}
const match = (s) => !ui.q || s.toLowerCase().includes(ui.q.toLowerCase());
function recFrame(title, inner) {
  return `<div class="scr">${header(`Prontuário | ${title}`)}<div class="pad">${searchBox()}</div><div class="scroll pad" data-k="s" id="recList"><div style="margin-bottom:110px">${inner()}</div></div></div>`;
}
const listOrEmpty = (rows) => (rows.length ? `<div class="group">${rows.join('')}</div>` : '<p style="text-align:center;font-size:16px;color:#999;margin:16px 24px">Nenhum registro disponível ainda.</p>');
const medRow = (m, tap = true) => `<${tap ? `button data-a="recMed" data-p="${m.id}"` : 'div'} class="hitem"><div class="l1"><b>${esc(m.name)}</b>${m.review ? badge('Aguardando revisão') : ''}</div>${tap ? `<div class="sub">${esc(m.drugs.map((d) => `${d[0]} ${d[1]} ${d[2]}`).join(' + '))}</div><div class="meta">${esc(m.admin)} · ${m.freqLabel || `${m.times.length}x ao dia`}</div>` : ''}</${tap ? 'button' : 'div'}>`;
const taskRow = (t, tap = true) => `<${tap ? `button data-a="recTask" data-p="${t.id}"` : 'div'} class="hitem"><div class="l1"><b>${esc(t.name)}</b></div>${tap ? `<div class="sub">${t.freqLabel} · ${t.time}</div>` : ''}</${tap ? 'button' : 'div'}>`;
const guideRow = (g, tap = true) => `<${tap ? `button data-a="openGuide" data-p="${g.id}"` : 'div'} class="hitem"><div class="l1"><b>${esc(g.name)}</b>${tap ? `<span class="hchip" style="background:${g.read ? 'rgba(15,171,122,.15)' : 'rgba(253,126,20,.15)'};color:${g.read ? '#0fab7a' : '#FD7E14'}">${g.read ? 'lido' : 'não lido'}</span>` : ''}</div>${tap ? `<div class="sub">${esc(g.description)}</div><div class="meta">Criado em ${fDMY(addD(TODAY, g.created))}</div>` : ''}</${tap ? 'button' : 'div'}>`;
SCREENS['rec-all'] = () => ({
  html: recFrame('Todos os Registros', () => {
    const sec = (t, rows) => (rows.length ? `<div class="sect"><div class="sect-t">${t}</div><div class="group">${rows.join('')}</div></div>` : '');
    const out = sec('Medicamentos', recMeds().filter((m) => match(m.name)).map((m) => medRow(m, false))) + sec('Tarefas', S.tasks.filter((t) => match(t.name)).map((t) => taskRow(t, false))) + sec('Guias', S.guides.filter((g) => match(g.name)).map((g) => guideRow(g, false)));
    return out || listOrEmpty([]);
  }),
});
SCREENS['rec-meds'] = () => ({ html: recFrame('Medicamentos', () => listOrEmpty(recMeds().filter((m) => match(m.name)).map((m) => medRow(m)))) });
SCREENS['rec-tasks'] = () => ({
  html: recFrame('Tarefas', () => {
    const order = [['PHOTO', 'Foto'], ['FORM', 'Questionário'], ['TEXT', 'Atividade'], ['ASK_ANSWER', 'Pergunta']];
    const out = order.map(([k, l]) => { const rows = S.tasks.filter((t) => t.type === k && match(t.name)).map((t) => taskRow(t)); return rows.length ? `<div class="sect"><div class="sect-t">${l}</div><div class="group">${rows.join('')}</div></div>` : ''; }).join('');
    return out || listOrEmpty([]);
  }),
});
SCREENS['rec-guides'] = () => ({ html: recFrame('Guias', () => listOrEmpty(S.guides.filter((g) => match(g.name)).map((g) => guideRow(g)))) });

/* adjustment requests */
const nbcOf = (id) => NBCS.find((n) => n.id === id);
const ITEM_STATUS = { PENDING: ['Pendente', ''], APPROVED: ['Aprovada', 'success'], REJECTED: ['Rejeitada', 'danger'], CANCELED: ['Cancelada', 'default'] };
SCREENS.items = () => {
  ui.itemF = ui.itemF || { status: 'ALL', type: 'ALL' };
  const F = ui.itemF;
  const list = S.items.filter((i) => (F.status === 'ALL' || i.status === F.status) && (F.type === 'ALL' || i.mode === F.type)).sort((a, b) => b.created - a.created);
  const stLabel = { ALL: 'Todas', PENDING: 'Pendente', APPROVED: 'Aprovada', REJECTED: 'Rejeitada', CANCELED: 'Cancelada' };
  const tyLabel = { ALL: 'Todos os tipos', ANY: 'Registro', ADD: 'Adição ao plano' };
  return {
    html: `<div class="scr">${header('Prontuário | Solicitações de ajuste')}
      <div class="pad"><div class="filters">
        <button class="fsel ${F.status !== 'ALL' ? 'on' : ''}" data-a="itemFilter" data-p="status" aria-label="Filtrar por status">${ic('list-checks', 14, '#0c8861', 'b')}${stLabel[F.status]}${ic('caret-down', 12, 'currentColor')}</button>
        <button class="fsel ${F.type !== 'ALL' ? 'on' : ''}" data-a="itemFilter" data-p="type" aria-label="Filtrar por tipo">${ic('tag', 14, '#0c8861', 'b')}${tyLabel[F.type]}${ic('caret-down', 12, 'currentColor')}</button>
      </div></div>
      <div class="scroll pad" data-k="s"><div style="margin-bottom:110px">
        <button class="newbtn" data-a="go" data-p="wizard">${ic('plus', 16, '#0fab7a', 'b')}Nova solicitação de ajuste</button>
        ${list.length ? `<div class="group">${list.map((i) => { const n = nbcOf(i.nbc); const [sl, sv2] = ITEM_STATUS[i.status]; return `<button class="pirow" data-a="go" data-p="item:${i.id}"><span class="disc" style="background:${n.color}">${ic(n.icon, 18, '#fff')}</span><span class="col"><b>${esc(i.title)}</b><small>${i.mode === 'ADD' ? 'Adição ao plano' : 'Registro'} · ${fDT(i.created)}</small>${badge(sl, sv2)}</span></button>`; }).join('')}</div>` : '<p style="text-align:center;font-size:16px;color:#999;margin:16px 24px">Você ainda não enviou nenhuma solicitação de ajuste.</p>'}
      </div></div></div>`,
  };
};
SCREENS.item = (r) => {
  const i = S.items.find((x) => x.id === +r.id);
  const n = nbcOf(i.nbc);
  const [sl, sv2] = ITEM_STATUS[i.status];
  const sect = (t, rows) => `<div class="sect"><div class="sect-t">${t}</div><div class="drows">${rows}</div></div>`;
  let answer = '';
  if (i.answer && i.answer.photo) answer = `<div class="drow"><div class="k">Foto</div><div class="photo-full" style="height:192px;aspect-ratio:auto;border-radius:10px;margin-top:6px;box-shadow:none"><div class="mock">${ic('camera', 32, 'rgba(255,255,255,.7)')}</div></div></div>`;
  if (i.answer && i.answer.rows) answer = i.answer.rows.map(([k, v]) => drow(k, esc(v))).join('');
  if (i.answer) answer += drow('Respondido em', fDT(i.answered));
  else answer = drow('Resposta', i.mode === 'ADD' ? 'Nenhuma dose registrada no envio' : 'Sem resposta');
  return {
    html: `<div class="scr">${header('Prontuário | Solicitações de ajuste')}
      <div class="scroll pad" data-k="s"><div style="margin-bottom:110px">
        <div class="pirow" style="border-radius:10px;margin-bottom:16px;border:0"><span class="disc" style="width:40px;height:40px;background:${n.color}">${ic(n.icon, 20, '#fff')}</span><span class="col"><b style="font-size:17px">${esc(i.title)}</b><small>${n.name} · ${i.mode === 'ADD' ? 'Adição ao plano' : 'Registro'}</small>${badge(sl, sv2)}</span></div>
        ${i.note ? `<div class="note-box"><div class="k">Resposta da equipe de saúde</div><p>${esc(i.note)}</p></div>` : ''}
        ${sect('Solicitação', drow('Enviada em', fDT(i.created)) + (i.reviewed ? drow('Avaliada em', fDT(i.reviewed)) : '') + (i.canceled ? drow('Cancelada em', fDT(i.canceled)) : '') + drow('Justificativa', esc(i.justification || '—')))}
        ${i.fields ? sect('Informações', i.fields.map(([k, v]) => drow(k, esc(v))).join('')) : ''}
        ${sect('Resposta', answer)}
        <div style="display:flex;flex-direction:column;gap:4px">
          ${i.status === 'PENDING' || i.status === 'APPROVED' ? '<button class="b-pill" data-a="itemEdit">Editar</button>' : ''}
          ${i.status === 'PENDING' ? `<button class="b-flat" style="color:#db594f" data-a="itemCancel" data-p="${i.id}">Cancelar solicitação</button>` : ''}
        </div>
      </div></div></div>`,
  };
};

/* wizard */
function wzFresh() { return { step: 1, type: null, title: '', just: '', vals: {}, unit: 0, photo: false, dose: null, err: false, open: {}, med: { drug: '', dose: null, unit: 'mg', useDrug: true, name: '', qty: 1, form: 'Comprimido(s)', freq: 1, times: ['08:00'], food: 'Indiferente', start: dKey(TODAY) } }; }
function wzErrors() {
  const w = ui.wz, n = nbcOf(w.type);
  const e = {};
  if (w.step === 1) {
    if (n.id === 'med') {
      if (!w.med.drug.trim()) e.drug = 1;
      if (w.med.dose == null) e.dose = 1;
      if (!w.med.useDrug && !w.med.name.trim()) e.name = 1;
      if (w.med.times.some((t) => !t)) e.times = 1;
    } else if (!w.title.trim()) e.title = 1;
  }
  if (w.step === 2) {
    if (n.answer === 'PHOTO' && !w.photo) e.photo = 1;
    if (n.answer === 'MEAS') n.inputs.forEach((inp) => { if (w.vals[inp.k] == null) e[inp.k] = 1; });
    if (n.id === 'med' && w.dose == null) e.dose = 1;
  }
  return e;
}
function wfield(label, inner, { req, hint, err } = {}) {
  return `<div class="wfield"><div class="wl">${esc(label)}${req ? '<span class="req"> *</span>' : ''}</div>${hint ? `<div class="wh">${esc(hint)}</div>` : ''}${inner}${err ? `<div class="err">${err}</div>` : ''}</div>`;
}
function wzMedName() { const m = ui.wz.med; return m.useDrug ? (m.drug ? `${m.drug}${m.dose != null ? ` ${numPt(m.dose)} ${m.unit}` : ''}` : '') : m.name; }
SCREENS.wizard = () => {
  ui.wz = ui.wz || wzFresh();
  const w = ui.wz;
  const n = w.type ? nbcOf(w.type) : null;
  const E = w.err ? wzErrors() : {};
  const steps = ['Criação', 'Resposta', 'Conferência'];
  const stepper = `<div class="stepper">${steps.map((s, i) => {
    const k = i + 1; const done = k < w.step; const curS = k === w.step;
    const node = done ? `<span class="n" style="background:#0fab7a">${ic('check', 13, '#fff', 'b')}</span>` : curS ? `<span class="n" style="background:#0fab7a;color:#fff">${k}</span>` : `<span class="n" style="background:#fff;border:1px solid #e5e5ea;color:#999">${k}</span>`;
    return `${node}<span class="lbl ${curS ? 'cur' : ''}">${s}</span>${i < 2 ? `<span class="ln" style="background:${k < w.step ? '#0fab7a' : '#e5e5ea'}"></span>` : ''}`;
  }).join('')}</div>`;
  let body = '';
  if (!n) {
    body = `<p style="font-size:14px;color:#999;margin:0 0 4px">O que você quer registrar?</p><div class="wstack" style="gap:8px">${NBCS.map((x) => `<button class="typecard" data-a="wzType" data-p="${x.id}"><span class="disc" style="background:${x.color}">${ic(x.icon, 20, '#fff')}</span><b>${x.name}</b>${ic('caret-right', 18, '#999')}</button>`).join('')}</div>`;
  } else if (w.step === 1) {
    const typeHead = `<div class="typecard" style="cursor:default"><span class="disc" style="background:${n.color}">${ic(n.icon, 20, '#fff')}</span><b>${n.name}<small>${n.modes[0] === 'ADD' ? 'Adicionar ao plano' : 'Registrar agora'}</small></b><button data-a="wzSwap" style="font-size:14px;font-weight:600;color:#0fab7a">Trocar</button></div>`;
    let fields = '';
    if (n.id === 'med') {
      const m = w.med;
      const acc = (key, title, summary, inner, err) => `<div class="acc"><button class="acc-h" data-a="wzAcc" data-p="${key}" aria-expanded="${!!w.open[key]}"><span class="t" style="flex-direction:column;align-items:flex-start;gap:0">${title}<span style="font-size:12px;color:#999;font-weight:400">${esc(summary)}</span></span>${err ? ic('warning-circle', 18, '#db594f', 'f') : ''}${ic(w.open[key] ? 'caret-down' : 'caret-right', 16, '#001D4B')}</button>${w.open[key] ? `<div class="acc-b" style="border-top:1px solid #e5e5ea;padding-top:10px;gap:16px">${inner}</div>` : ''}</div>`;
      fields = `
        ${wfield('Fármacos', `<div style="border:1px solid #e5e5ea;background:#F4F6F8;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px">
          <input class="field" data-in="wzDrug" placeholder="Nome do fármaco" value="${esc(m.drug)}" style="height:44px">
          <div style="display:flex;gap:8px"><button class="field ${m.dose == null ? 'ph' : ''}" data-a="wzDose" style="height:44px;flex:1">${m.dose == null ? 'Dose' : numPt(m.dose)}</button>
          <select class="field" data-in="wzUnit" style="height:44px;flex:1" aria-label="Unidade">${['mg', 'mcg', 'mL', 'g', 'UI'].map((u) => `<option ${m.unit === u ? 'selected' : ''}>${u}</option>`).join('')}</select></div></div>`, { req: true, err: E.drug || E.dose ? 'Preencha este campo corretamente.' : '' })}
        ${wfield('Nome', `<input class="field" data-in="wzName" value="${esc(m.useDrug ? wzMedName() : m.name)}" ${m.useDrug ? 'disabled' : ''} placeholder="Nome do medicamento" style="height:44px">
          <button class="copt ${m.useDrug ? 'on' : ''}" data-a="wzUseDrug" role="checkbox" aria-checked="${m.useDrug}" style="margin-top:4px"><span class="bx">${m.useDrug ? ic('check', 14, '#fff', 'b') : ''}</span>Usar fármacos como nome</button>`, { req: true, hint: 'Nome do medicamento, que será mostrado ao paciente como título.', err: E.name ? 'Preencha este campo corretamente.' : '' })}
        <div>
        ${acc('qty', 'Quantidade e forma', `${m.qty} · ${m.form}`, `<div class="wl" style="font-size:14px;font-weight:600;color:#001D4B">Quantidade</div><button class="field" data-a="wzQty" style="height:44px">${numPt(m.qty)}</button>
          <div class="wl" style="font-size:14px;font-weight:600;color:#001D4B">Forma <span style="color:#db594f">*</span></div><select class="field" data-in="wzForm" style="height:44px" aria-label="Forma">${['Comprimido(s)', 'Cápsula(s)', 'Gota(s)', 'Solução (líquido)', 'Injetável', 'Creme'].map((f) => `<option ${m.form === f ? 'selected' : ''}>${f}</option>`).join('')}</select>
          <div class="wl" style="font-size:14px;font-weight:600;color:#001D4B">Relação com a refeição <span style="color:#db594f">*</span></div><select class="field" data-in="wzFood" style="height:44px" aria-label="Relação com a refeição">${['Indiferente', 'Antes das refeições', 'Antes do café', 'Durante a refeição', 'Depois das refeições'].map((f) => `<option ${m.food === f ? 'selected' : ''}>${f}</option>`).join('')}</select>`)}
        ${acc('freq', 'Frequência', `${m.freq} x ao dia`, `<div class="wl" style="font-size:14px;font-weight:600;color:#001D4B">Frequência <span style="color:#db594f">*</span></div><button class="field" data-a="wzFreq" style="height:44px">${m.freq} x ao dia</button>`)}
        ${acc('times', 'Horários', m.times.filter(Boolean).join(', ') || 'Nenhum horário', m.times.map((t, i) => `<div><div style="font-size:12px;font-weight:600;color:#999;margin-bottom:4px">Horário ${i + 1}</div><input class="field" type="time" data-in="wzTime" data-i="${i}" value="${t}" style="height:44px"></div>`).join(''), E.times)}
        ${acc('dates', 'Periodo de datas', fDMY(new Date(m.start + 'T12:00')), `<input class="field" type="date" data-in="wzStart" value="${m.start}" style="height:44px" aria-label="Data de início">`)}
        </div>`;
    } else {
      fields = wfield('Título', `<input class="field" data-in="wzTitle" value="${esc(w.title)}" style="height:44px">`, { req: true, hint: 'Ex.: Minha ferida piorou', err: E.title ? 'Preencha este campo.' : '' });
    }
    body = `<div class="wstack">${typeHead}${fields}${wfield('Justificativa', `<textarea class="ta" data-in="wzJust" maxlength="1000" style="min-height:80px">${esc(w.just)}</textarea><div style="text-align:right;font-size:11px;color:#999" id="wzCount">${w.just.length}/1000</div>`, { hint: 'Opcional. Conte à sua equipe de saúde o motivo.' })}</div>`;
  } else if (w.step === 2) {
    if (n.answer === 'PHOTO') {
      body = `<div style="display:flex;flex-direction:column;gap:16px">${w.photo ? `<div class="photo-full"><div class="mock">${ic('camera', 40, 'rgba(255,255,255,.7)')}</div><span class="sel">${ic('check-circle', 14, '#fff', 'f')}Foto selecionada</span><button class="rm" data-a="wzPhoto" data-p="0" aria-label="Remover foto">${ic('x', 16, '#fff', 'b')}</button></div>` : `<button class="photo-empty" data-a="wzPhoto" data-p="1"><span class="c">${ic('camera-plus', 30, '#0fab7a')}</span><b>Adicione uma foto</b><small>Tire uma foto agora ou escolha uma da galeria.</small></button>`}
        <div class="srcs"><button class="srcbtn" data-a="wzPhoto" data-p="1"><span class="c">${ic('camera', 22, '#0fab7a')}</span><b>Câmera</b><small>${w.photo ? 'Tirar outra foto' : 'Tirar foto'}</small></button><button class="srcbtn" data-a="wzPhoto" data-p="1"><span class="c">${ic('images', 22, '#0fab7a')}</span><b>Galeria</b><small>${w.photo ? 'Escolher outra da galeria' : 'Escolher da galeria'}</small></button></div>
        ${E.photo ? '<p style="text-align:center;color:#db594f;font-size:12px;margin:0">Tire ou escolha uma foto para avançar.</p>' : ''}</div>`;
    } else if (n.answer === 'MEAS') {
      body = `<div class="wstack">${n.inputs.map((inp) => wfield(inp.l, `<button class="field ${w.vals[inp.k] == null ? 'ph' : ''}" data-a="wzMeas" data-p="${inp.k}">${w.vals[inp.k] == null ? 'Toque para informar' : `${numPt(w.vals[inp.k], inp.step < 1 ? 1 : 0)} ${inp.unit}`}</button>`, { req: true, err: E[inp.k] ? 'Preencha este campo.' : '' })).join('')}
        ${n.units ? `<div class="units" style="margin-top:0">${['°C', '°F'].map((u, i) => `<button class="${w.unit === i ? 'on' : ''}" data-a="wzUnitSel" data-p="${i}">${u}</button>`).join('')}</div>` : ''}</div>`;
    } else {
      body = wfield('Tomei uma dose agora?', radioList(['Sim', 'Não'], w.dose, 'wzDoseAns'), { req: true, hint: 'Se sim, registramos a dose com o horário do envio. Nos dois casos, o medicamento entra no seu plano.', err: E.dose ? 'Preencha este campo.' : '' });
    }
  } else {
    const rr = (k, v) => `<div class="rrow"><div class="k">${esc(k)}</div><div class="v">${v || '—'}</div></div>`;
    const m = w.med;
    const creation = n.id === 'med'
      ? rr('Fármacos', esc(`${m.drug} ${numPt(m.dose)} ${m.unit}`)) + rr('Nome', esc(wzMedName())) + rr('Quantidade e forma', `${numPt(m.qty)} · ${esc(m.form)}`) + rr('Frequência', `${m.freq} x ao dia`) + rr('Horários', m.times.join(', ')) + rr('Relação com a refeição', esc(m.food))
      : rr('Título', esc(w.title));
    let answer = '';
    if (n.answer === 'PHOTO') answer = `<div class="photo-full" style="height:160px;aspect-ratio:auto;border-radius:10px;box-shadow:none;margin:6px 0"><div class="mock">${ic('camera', 32, 'rgba(255,255,255,.7)')}</div></div>`;
    else if (n.answer === 'MEAS') answer = n.inputs.map((inp) => rr(inp.l, `${numPt(w.vals[inp.k], inp.step < 1 ? 1 : 0)} ${n.units ? ['°C', '°F'][w.unit] : inp.unit}`)).join('');
    else answer = rr('Tomei uma dose agora?', w.dose === 0 ? 'Sim' : 'Não');
    body = `<div class="wstack">
      <div class="rblock"><div class="rh"><b>Tipo</b></div><div style="display:flex;align-items:center;gap:10px;padding:6px 0"><span class="disc" style="width:36px;height:36px;border-radius:50%;background:${n.color};display:flex;align-items:center;justify-content:center">${ic(n.icon, 18, '#fff')}</span><div><b style="font-size:15px;font-weight:600">${n.name}</b><div style="font-size:12px;color:#999">${n.id === 'med' ? 'Entra no seu plano agora e será avaliada pela equipe.' : 'Será registrada após a avaliação da sua equipe de saúde.'}</div></div></div></div>
      <div class="rblock"><div class="rh"><b>Criação</b><button data-a="wzGoto" data-p="1">${ic('pencil-simple', 14, '#0fab7a')}Editar</button></div>${creation}${rr('Justificativa', esc(w.just))}</div>
      <div class="rblock"><div class="rh"><b>Resposta</b><button data-a="wzGoto" data-p="2">${ic('pencil-simple', 14, '#0fab7a')}Editar</button></div>${answer}${rr('Data e hora', fDT(new Date()))}</div>
      ${n.id === 'med' ? `<div class="hint info">${ic('info', 16, '#178BCA')}<span>O que você pediu entra no seu plano agora, os lembretes começam a chegar e a sua equipe de saúde vai avaliar a solicitação.</span></div>` : ''}
    </div>`;
  }
  const hasErr = w.err && Object.keys(wzErrors()).length > 0;
  const foot = n ? `<div class="act-foot" style="padding-top:0">${hasErr ? '<p style="text-align:center;color:#db594f;font-size:12px;font-weight:500;margin:0">Preencha os campos destacados para avançar.</p>' : ''}<div class="navrow"><button class="b-neutral" data-a="wzBack">Voltar</button>
    ${w.step < 3 ? `<button class="b-next" data-a="wzNext" style="${hasErr ? 'opacity:.55' : ''}">Próximo${ic('caret-right', 18, '#fff', 'b')}</button>` : `<button class="b-next" data-a="wzSubmit" style="min-width:150px">${ic('paper-plane-tilt', 18, '#fff', 'b')}Confirmar e enviar</button>`}</div></div>` : '';
  return { html: `<div class="scr">${header('Nova solicitação de ajuste')}${stepper}<div class="scroll pad" data-k="s${w.step}"><div style="padding-bottom:16px">${body}</div></div>${foot}</div>` };
};

/* settings */
const settingsRow = (icon, label, a, p, val) => `<button class="srow" data-a="${a}" data-p="${p || ''}">${icon ? ic(icon, 22, '#8E8E93') : ''}<span class="lb">${label}</span>${val != null ? `<span class="val">${esc(val)}</span>` : ''}${ic('caret-right', 18, '#C7C7CC')}</button>`;
SCREENS.settings = () => ({
  html: `<div class="scr">${header('Configurações')}<div class="scroll pad pb-stack" data-k="s">
    <div class="profile-card"><div style="min-width:0"><b>${esc(S.user.firstName)} ${esc(S.user.lastName)}</b><span>${esc(S.user.email)}</span></div><div class="avatar-sq"><img src="img/no-avatar.png" alt=""></div></div>
    <div class="sgroup"><div class="slabel">Geral</div><div class="group">${settingsRow('user', 'Perfil', 'go', 's-profile')}${settingsRow('globe', 'Idioma', 'go', 's-lang')}${settingsRow('clock', 'Fuso horário', 'go', 's-tz')}${settingsRow('bell', 'Notificações', 'go', 's-notif')}</div></div>
    <div class="sgroup"><div class="slabel">Sobre e termos</div><div class="group">${settingsRow('question', 'Ajuda', 'go', 's-help')}${settingsRow('file-text', 'Termos', 'go', 's-terms')}</div></div>
    <div class="sgroup"><div class="slabel">Conta</div><div class="group">${settingsRow('sign-out', 'Sair', 'logout')}</div></div>
    <div class="ver">Versão 8.1.0</div>
  </div></div>`,
});
SCREENS['s-profile'] = () => {
  const ph = S.user.phone;
  const fmt = ph.length >= 10 ? `(${ph.slice(0, 2)}) ${ph.slice(2, 3)} ${ph.slice(3, 7)}-${ph.slice(7)}` : ph;
  return {
    html: `<div class="scr">${header('Perfil')}<div class="scroll pad pb-stack" data-k="s">
      <div class="avatar-big" style="margin-bottom:37px"><img src="img/no-avatar.png" alt=""><button class="cam" data-a="toast" data-p="A câmera abriria aqui para trocar sua foto." aria-label="Trocar foto">${ic('camera', 17, '#fff', 'b')}</button></div>
      <label class="flabel" for="pn">Nome*</label><input class="field" id="pn" value="${esc(S.user.firstName + ' ' + S.user.lastName)}" disabled style="margin-bottom:10px">
      <label class="flabel" for="pe">Email*</label><input class="field" id="pe" value="${esc(S.user.email)}" disabled style="margin-bottom:10px">
      <label class="flabel" for="pw">WhatsApp*</label><input class="field" id="pw" inputmode="numeric" value="${esc(fmt)}" placeholder="(xx) x xxxx-xxxx" style="margin-bottom:20px">
      <div style="height:1px;background:#e5e5ea;margin-bottom:16px"></div>
      <button class="b-pill" data-a="saveProfile">Salvar</button>
      <button class="b-flat" style="color:#db594f;margin-top:40px" data-a="removeAccount">Excluir minha conta</button>
    </div></div>`,
  };
};
SCREENS['s-notif'] = () => ({
  html: `<div class="scr">${header('Notificações')}<div class="scroll pad pb-stack" data-k="s">
    <div class="sgroup"><div class="slabel">Geral</div><div class="group">${settingsRow(null, 'Som da notificação', 'notifSound', '', S.prefs.sound)}</div></div>
    <div class="sgroup"><div class="slabel">Ao perder uma notificação</div><div class="group">${settingsRow(null, 'Lembrar novamente após', 'notifNum', 'followUp', `${S.prefs.followUp} min`)}${settingsRow(null, 'Por no máximo', 'notifNum', 'max', S.prefs.max === 1 ? '1 vez' : `${S.prefs.max} vezes`)}</div></div>
  </div></div>`,
});
const pickList = (opts, sel, a) => `<div class="group">${opts.map((o) => `<button class="srow" data-a="${a}" data-p="${esc(o)}"><span class="lb">${esc(o)}</span>${o === sel ? ic('check', 22, '#0fab7a') : ''}</button>`).join('')}</div>`;
SCREENS['s-lang'] = () => ({ html: `<div class="scr">${header('Idioma')}<div class="scroll pad pb-stack" data-k="s"><div style="margin-top:8px">${pickList(['Português', 'English', 'Español'], S.prefs.lang, 'setLang')}</div></div></div>` });
const TZS = ['São Paulo (UTC−03:00)', 'Manaus (UTC−04:00)', 'Rio Branco (UTC−05:00)', 'Fernando de Noronha (UTC−02:00)', 'Buenos Aires (UTC−03:00)', 'Montevidéu (UTC−03:00)', 'Santiago (UTC−03:00)', 'Lisboa (UTC+01:00)', 'Madri (UTC+02:00)', 'Nova York (UTC−04:00)', 'Londres (UTC+01:00)', 'Tóquio (UTC+09:00)'];
SCREENS['s-tz'] = () => ({
  html: `<div class="scr">${header('Fuso horário')}<div class="pad"><label class="search" style="margin:0 0 16px">${ic('magnifying-glass', 18, '#999')}<input data-in="tzSearch" placeholder="Buscar cidade ou fuso" value="${esc(ui.tzq || '')}" aria-label="Buscar cidade ou fuso"></label></div>
    <div class="scroll pad pb-stack" data-k="s" id="tzList">${tzList()}</div></div>`,
});
function tzList() {
  const q = (ui.tzq || '').toLowerCase();
  return `${!q ? `<div class="group" style="margin-bottom:12px"><button class="srow" data-a="setTz" data-p="São Paulo (UTC−03:00)"><span class="lb">Usar o fuso horário do celular · São Paulo (UTC−03:00)</span></button></div>` : ''}${pickList(TZS.filter((t) => t.toLowerCase().includes(q)), S.prefs.tz, 'setTz')}`;
}
const FAQ = [
  ['Como utilizar a plataforma?', 'O aplicativo é voltado para tarefas. Você vai receber tarefas na lista principal e ir fazendo conforme o seu ritmo. Você estará em dia com o seu tratamento se esta lista estiver vazia.'],
  ['Quais os tipos de tarefas existem?', 'Existem medicamentos, fotos, questionários, perguntas, leituras e hidratação. Cada tipo aparece no checklist da tela inicial.'],
  ['Como falar com a equipe de saúde?', 'Para falar com a equipe de saúde deve utilizar o contato disponibilizado durante a consulta.'],
  ['Quem tem acesso as minhas atividades?', 'Somente a equipe de saúde responsável pelo seu acompanhamento.'],
  ['Como refazer uma atividade?', 'Atualmente não existe a opção de desfazer uma tarefa. Entre em contato com seu enfermeiro caso seja importante.'],
  ['Como fico em dia com meu tratamento?', 'Conclua ou justifique todos os itens do checklist de hoje. Quando tudo estiver concluído, o status da tela inicial muda para EM DIA.'],
  ['Como desativar/excluir a conta?', 'Vá em Configurações, toque em Perfil e depois em Excluir minha conta.'],
  ['Como posso ver meu progresso?', 'Toque no cartão Meu Progresso, na tela inicial, para ver o histórico de cada item do seu plano.'],
];
SCREENS['s-help'] = () => ({
  html: `<div class="scr">${header('Ajuda')}<div class="scroll pad pb-stack" data-k="s">${FAQ.map(([q, a], i) => {
    const open = ui.faq === i;
    return `<div style="background:#fff;border-radius:8px;margin-bottom:16px;overflow:hidden"><button data-a="faq" data-p="${i}" aria-expanded="${open}" style="width:100%;min-height:50px;padding:8px 16px;display:flex;align-items:center;gap:8px;text-align:left"><span style="flex:1;font-size:16px;color:#333">${q}</span>${ic(open ? 'caret-down' : 'caret-right', 18, '#999')}</button>${open ? `<div style="border-top:1px solid #e5e5ea;padding:10px 16px 16px;font-size:14px;color:#333;line-height:1.5">${a}</div>` : ''}</div>`;
  }).join('')}</div></div>`,
});
SCREENS['s-terms'] = () => ({
  html: `<div class="scr" style="background:#fff">${header('Termos')}<div class="scroll pad pb-stack" data-k="s"><div style="border-radius:10px;background:#F4F6F8;padding:16px;font-size:14px;line-height:1.55;color:#333">
    <p style="margin:0 0 10px"><b>Termos de Uso e Política de Privacidade</b></p>
    <p style="margin:0 0 10px">No aplicativo, os termos completos são carregados do site da Takere.</p>
    <a href="https://www.takere.com.br/policy" target="_blank" rel="noopener" style="color:#0fab7a;font-weight:600">Abrir takere.com.br/policy</a></div></div></div>`,
});

/* ---------- render ---------- */
function saveScroll() {
  if (!rendered) return;
  const sc = {};
  document.querySelectorAll('#screen [data-k]').forEach((el) => { sc[el.dataset.k] = el.scrollTop; });
  rendered.sc = sc;
}
function render(anim) {
  saveScroll();
  const r = cur();
  const sc = SCREENS[r.n](r);
  const scr = document.getElementById('screen');
  scr.innerHTML = sc.html;
  const el = scr.firstElementChild;
  if (anim) el.classList.add(anim);
  document.getElementById('sbar').className = 'statusbar' + (sc.light ? ' light' : '');
  document.getElementById('hind').className = 'home-ind' + (r.n === 'login' ? ' light' : '');
  if (r.sc) Object.entries(r.sc).forEach(([k, v]) => { const s = scr.querySelector(`[data-k="${k}"]`); if (s) s.scrollTop = v; });
  rendered = r;
  sc.mount && sc.mount(el);
  renderModals();
}
function rerenderList(id, html) { const el = document.getElementById(id); if (el) el.innerHTML = html; }

/* ---------- actions ---------- */
function routeFrom(p) { const [n, id] = String(p).split(':'); return id != null ? [n, { id }] : [n, {}]; }
const A = {
  back,
  closeModal: () => { if (!ui.expBusy) closeModal(); },
  go: (p) => { const [n, params] = routeFrom(p); if (n === 'wizard') ui.wz = wzFresh(); if (n === 'progress') ui.prog = null; go(n, params); },
  goHome: () => root('home'),
  toast: (p) => toast(p),
  tab: (p) => {
    if (p === 'chat') { S.unread = false; ui.chatSel = null; }
    ui.q = '';
    root(p);
  },
  togglePass: () => {
    ui.showPass = !ui.showPass;
    const inp = document.getElementById('lpass');
    inp.type = ui.showPass ? 'text' : 'password';
    document.querySelector('[data-a="togglePass"]').innerHTML = ic(ui.showPass ? 'eye-slash' : 'eye', 20, '#999');
  },
  ackChanges: () => { S.seenChanges = true; root('home'); },
  module: (k) => { const m = MODULES.find((x) => x.k === k); go(m.go[0], m.go[1] || {}); },
  allowNotif: () => { S.notifOk = true; toast('Notificações ativadas'); render(); },
  boardPage: (p) => { cur().page = p; render(); },
  toggleHl: (p) => { if (p === 'medication') S.highlight.medication = !S.highlight.medication; else S.highlight.tasks = !S.highlight.tasks; render(); },
  medTake: (id) => { const m = S.meds.find((x) => x.id === +id); m.status = 'CONFIRMED'; toast('Sua resposta foi salva com sucesso'); render(); },
  medSkip: (id) => openJustify(() => { const m = S.meds.find((x) => x.id === +id); m.status = 'JUSTIFIED'; m.reason = ui.lastReason; render(); }),
  medDetail: (id) => { const m = S.meds.find((x) => x.id === +id); openModal({ title: m.name, body: () => medDetailsRows(m) }); },
  justSel: (i) => { ui.just.sel = +i; refreshModal(); },
  justSubmit: () => { ui.lastReason = ui.just.sel === 6 ? ui.just.text.trim() : PDF_REASONS[ui.just.sel]; closeModal(true); toast('Justificativa salva'); ui.justDone && ui.justDone(); },
  openTask: (id) => {
    const t = S.tasks.find((x) => x.id === +id);
    if (t.early) t.early = false;
    go('act', { id: t.id });
  },
  taskSkip: (id) => openJustify(() => { const t = S.tasks.find((x) => x.id === +id); t.status = 'JUSTIFIED'; t.reason = ui.lastReason; popTo('board', { page: 'tasks' }); }),
  taskFinish: (id) => finishTask(+id),
  formRadio: (i) => { const a = ui.act[cur().id]; a.ans[a.q] = +i; render(); },
  formCheck: (i) => { const a = ui.act[cur().id]; const v = a.ans[a.q] || []; const k = +i; a.ans[a.q] = v.includes(k) ? v.filter((x) => x !== k) : v.concat(k); render(); },
  formDial: () => { const a = ui.act[cur().id]; const q = FORM_QS[a.q]; openDial({ title: q.l, min: q.min, max: q.max, step: 1, value: a.ans[a.q], start: 0, unit: '', onDone: (v) => { a.ans[a.q] = v; render(); } }); },
  formNext: () => { ui.act[cur().id].q += 1; render('push'); },
  formPrev: () => { ui.act[cur().id].q -= 1; render('pop'); },
  formFinish: () => finishTask(cur().id),
  askDial: () => { const a = ui.act[cur().id]; const f = a.unit === 1; openDial({ title: 'Temperatura', min: f ? 93 : 34, max: f ? 108 : 42, step: 0.1, value: a.ans[0], start: f ? 97.7 : 36.5, unit: f ? '°F' : '°C', onDone: (v) => { a.ans[0] = v; render(); } }); },
  askUnit: (i) => { const a = ui.act[cur().id]; if (a.unit !== +i) { a.unit = +i; a.ans[0] = null; } render(); },
  askFinish: () => {
    const a = ui.act[cur().id];
    const c = a.unit === 1 ? ((a.ans[0] - 32) * 5) / 9 : a.ans[0];
    const id = cur().id;
    const msg = c >= 37.8 ? 'Sua temperatura indica febre. Tome a dipirona conforme a prescrição e avise sua equipe de saúde se a febre continuar.' : 'Sua temperatura está normal. Continue acompanhando todos os dias.';
    openModal({ title: 'Resposta', body: () => `<p style="font-size:16px;line-height:1.5;margin:0 0 6px">${msg}</p>`, onClose: () => finishTask(id) });
  },
  photoTake: () => { ui.act[cur().id].photo = true; render(); },
  photoRemove: () => { ui.act[cur().id].photo = false; render(); },
  water: (d) => { S.water.intake = Math.max(0, S.water.intake + +d); render(); },
  progShift: (d) => { ui.prog.shift = Math.min(0, ui.prog.shift + +d * ui.prog.len); render(); },
  progLen: () => { ui.prog.len = ui.prog.len === 15 ? 30 : 15; render(); },
  progInactive: () => { ui.prog.inactive = !ui.prog.inactive; render(); },
  progItem: (p) => {
    const [gi, ii] = p.split(':').map(Number);
    const it = progressGroups().groups[gi].items[ii];
    const live = it.slots[0].live;
    openModal({ title: it.name, body: () => (live.drugs ? medDetailsRows({ ...live, times: it.slots.map((s) => s.time) }) : taskDetails(live)) });
  },
  progOpen: (p) => {
    const [gi, ii, si, day] = p.split(':');
    const g = progressGroups().groups[+gi];
    const it = g.items[+ii];
    const d = new Date(day + 'T12:00');
    const t = it.slots[+si].time || '09:00';
    const [hh, mm] = t.split(':').map(Number);
    d.setHours(hh, mm + Math.round(hash(+gi, +ii + d.getDate()) * 40));
    let fields = '';
    if (g.name === 'Temperatura') fields = `<div style="margin-bottom:14px"><div style="font-size:12px;font-weight:600;text-transform:uppercase;color:#999">Temperatura</div><div style="font-size:15px;color:#001D4B">${numPt(36.3 + hash(7, Math.round((new Date(day + 'T00:00') - TODAY) / 86400000) + 900) * 1.1, 1)} °C</div></div>`;
    if (g.name === 'Foto') fields = `<div class="photo-full" style="height:180px;aspect-ratio:auto;border-radius:12px;box-shadow:none"><div class="mock">${ic('camera', 32, 'rgba(255,255,255,.7)')}</div></div>`;
    openModal({ title: it.name, body: () => `<p style="font-size:13px;font-weight:500;color:#999;margin:-6px 0 14px">Concluído em ${fDT(d)}</p>${fields || '<p style="font-style:italic;color:#999;margin:0">Sem detalhes disponíveis.</p>'}` });
  },
  progJustify: (p) => {
    const [gi, ii, si, day] = p.split(':');
    openJustify(() => { S.histOverride[`${gi}-${ii}-${si}-${day}`] = 'JUSTIFIED'; S.histReason[`${gi}-${ii}-${si}-${day}`] = ui.lastReason; render(); });
  },
  chatPick: () => openModal({ title: 'Mensagem', body: () => radioList(CHAT_OPTIONS.map((o) => o[0]), ui.chatSel ?? null, 'chatChoose'), onClose: () => { ui.chatSel = null; render(); } }),
  chatChoose: (i) => { ui.chatSel = +i; closeModal(true); render(); },
  chatSend: () => {
    const o = CHAT_OPTIONS[ui.chatSel];
    ui.chatSel = null;
    S.chat.push({ s: 'PATIENT', b: o[0], t: new Date(), fresh: true });
    ui.typing = true;
    render();
    setTimeout(() => {
      ui.typing = false;
      S.chat.push({ s: 'SYSTEM', b: o[1], t: new Date(), btn: o[2] ? [o[2], o[3]] : null, fresh: true });
      if (cur().n === 'chat') render(); else S.unread = true;
    }, 900);
  },
  chatAction: (p) => {
    if (p === 'LIST_PENDINGS') return root('home');
    if (p === 'CREATE_PATIENT_ITEM') { ui.wz = wzFresh(); return go('wizard'); }
    if (p === 'LIST_GUIDES') return openModal({ title: '', body: () => guideListHtml() });
    if (p === 'LIST_PROGRESS') {
      const pts = Array.from({ length: 12 }, (_, i) => ({ l: fDM(addD(TODAY, (i - 11) * 7)), v: Math.round(18 + i * 2.4 + hash(5, i) * 6) }));
      return openModal({ title: '', body: () => `<div style="margin:0 4px"><b style="font-size:18px">Total</b><p style="margin:4px 0 0;font-size:15px;color:#555">${pts.reduce((s, p) => s + p.v, 0)} itens concluídos</p><b style="display:block;font-size:18px;margin:20px 0 8px">Últimos 3 meses</b>${lineChart(pts, { color: '#178BCA', yMax: 60, thick: 4, h: 260 })}</div>` });
    }
    if (p === 'LIST_CALENDAR') { ui.calShift = 0; return openModal({ title: '', body: calendarHtml }); }
  },
  calShift: (d) => { ui.calShift = Math.min(0, (ui.calShift || 0) + +d); refreshModal(); },
  openGuide: (id) => { closeAllModals(); go('guide', { id: +id, page: 0 }); },
  guidePage: (d) => { cur().page += +d; render(+d > 0 ? 'push' : 'pop'); },
  guideFinish: (id) => { S.guides.find((g) => g.id === +id).read = true; back(); },
  recMed: (id) => { const m = S.meds.find((x) => x.id === +id); openModal({ title: m.name, body: () => medDetailsRows({ ...m, times: S.meds.filter((x) => x.name === m.name).map((x) => x.time).filter(Boolean) }) }); },
  recTask: (id) => { const t = S.tasks.find((x) => x.id === +id); openModal({ title: t.name, body: () => taskDetails(t) }); },
  exportPdf: () => {
    if (ui.exporting) return;
    ui.exporting = 'pdf'; render();
    setTimeout(() => {
      ui.exporting = null;
      if (cur().n !== 'records') return;
      render();
      openPdfViewer(`patient-1-${dKey(TODAY)}.pdf`, buildCarePlanPdf(), 595);
      toast('Prontuário exportado com sucesso.');
    }, 1200);
  },
  exportHist: () => {
    ui.expMonth = 0;
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    openModal({
      title: 'Exportar histórico',
      body: () => { const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + ui.expMonth, 1); const l = `${months[d.getMonth()]} de ${d.getFullYear()}`; return `<p class="mhint" style="margin-bottom:16px">Escolha o mês que deseja exportar.</p><div style="display:flex;align-items:center;justify-content:space-between;border-radius:14px;background:#e7f6f1;padding:8px 10px;margin-bottom:20px"><button class="sqbtn" style="background:#fff" data-a="expMonth" data-p="-1" ${ui.expBusy ? 'disabled' : ''} aria-label="Mês anterior">${ic('caret-left', 24, '#0c8861')}</button><b style="font-size:16px;color:#001D4B;text-transform:capitalize">${l}</b><button class="sqbtn" style="background:#fff" data-a="expMonth" data-p="1" ${ui.expBusy ? 'disabled' : ''} aria-label="Próximo mês">${ic('caret-right', 24, '#0c8861')}</button></div><button class="b-pill" data-a="expGo" ${ui.expBusy ? 'disabled' : ''}>${ui.expBusy ? '<span class="spinner" style="width:20px;height:20px;border-width:3px;border-color:rgba(255,255,255,.35);border-top-color:#fff;display:inline-block;vertical-align:middle"></span>' : 'Exportar PDF'}</button>`; },
    });
  },
  expMonth: (d) => { ui.expMonth += +d; refreshModal(); },
  expGo: () => {
    ui.expBusy = true; refreshModal();
    setTimeout(() => {
      ui.expBusy = false;
      closeModal(true);
      const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + ui.expMonth, 1);
      openPdfViewer(`patient-1-history-${d.getFullYear()}-${pad(d.getMonth() + 1)}.pdf`, buildHistoryPdf(ui.expMonth), 842);
      toast('Histórico do plano exportado com sucesso.');
    }, 1200);
  },
  itemFilter: (k) => {
    const opts = k === 'status' ? [['ALL', 'Todas'], ['PENDING', 'Pendente'], ['APPROVED', 'Aprovada'], ['REJECTED', 'Rejeitada'], ['CANCELED', 'Cancelada']] : [['ALL', 'Todos os tipos'], ['ANY', 'Registro'], ['ADD', 'Adição ao plano']];
    ui.filterOpts = { k, opts };
    openModal({ title: k === 'status' ? 'Filtrar por status' : 'Filtrar por tipo', body: () => radioList(opts.map((o) => o[1]), opts.findIndex((o) => o[0] === ui.itemF[k]), 'itemFilterSet') });
  },
  itemFilterSet: (i) => { const { k, opts } = ui.filterOpts; ui.itemF[k] = opts[+i][0]; closeModal(true); render(); },
  itemEdit: () => toast('No app, a edição reabre o assistente com os dados desta solicitação.'),
  itemCancel: (id) => {
    const it = S.items.find((x) => x.id === +id);
    openModal({ title: 'Cancelar solicitação', body: () => `<p style="font-size:16px;color:#333;margin:0 0 6px">${it.mode === 'ADD' ? 'A solicitação será cancelada e o item sairá do seu plano; os lembretes param.' : 'A solicitação será cancelada.'}</p><button class="b-pill" data-a="itemCancelGo" data-p="${id}">Confirmar</button><button class="b-flat" data-a="closeModal">Cancelar</button>` });
  },
  itemCancelGo: (id) => {
    const it = S.items.find((x) => x.id === +id);
    it.status = 'CANCELED'; it.canceled = new Date();
    if (it.mode === 'ADD') S.meds = S.meds.filter((m) => !(m.review && m.name === it.title));
    closeModal(true); toast('Solicitação cancelada.'); render();
  },
  wzType: (id) => { ui.wz.type = id; ui.wz.err = false; render(); },
  wzSwap: () => { ui.wz = wzFresh(); render(); },
  wzAcc: (k) => { ui.wz.open[k] = !ui.wz.open[k]; render(); },
  wzUseDrug: () => { const m = ui.wz.med; m.useDrug = !m.useDrug; render(); },
  wzDose: () => openDial({ title: 'Dose', min: 0, max: 1000, step: 1, value: ui.wz.med.dose, start: 0, unit: ui.wz.med.unit, onDone: (v) => { ui.wz.med.dose = v; render(); } }),
  wzQty: () => openDial({ title: 'Quantidade', min: 0, max: 10, step: 0.1, value: ui.wz.med.qty, start: 1, unit: '', onDone: (v) => { ui.wz.med.qty = v; render(); } }),
  wzFreq: () => openDial({ title: 'Frequência', min: 1, max: 24, step: 1, value: ui.wz.med.freq, start: 1, unit: 'x ao dia', onDone: (v) => {
    const m = ui.wz.med; m.freq = v;
    const base = [8, 20, 14, 2, 11, 17, 23, 5];
    while (m.times.length < v) m.times.push(pad(base[m.times.length % base.length] ?? 8) + ':00');
    m.times.length = v; ui.wz.open.times = true; render();
  } }),
  wzPhoto: (p) => { ui.wz.photo = p === '1'; render(); },
  wzMeas: (k) => { const n = nbcOf(ui.wz.type); const inp = n.inputs.find((x) => x.k === k); const f = n.units && ui.wz.unit === 1; openDial({ title: inp.l, min: f ? 93 : inp.min, max: f ? 108 : inp.max, step: inp.step, value: ui.wz.vals[k], start: f ? 97.7 : inp.start, unit: f ? '°F' : inp.unit, onDone: (v) => { ui.wz.vals[k] = v; render(); } }); },
  wzUnitSel: (i) => { if (ui.wz.unit !== +i) { ui.wz.unit = +i; ui.wz.vals = {}; } render(); },
  wzDoseAns: (i) => { ui.wz.dose = +i; render(); },
  wzGoto: (s) => { ui.wz.step = +s; ui.wz.err = false; render('pop'); },
  wzBack: () => {
    const w = ui.wz;
    w.err = false;
    if (w.step > 1) { w.step -= 1; render('pop'); } else if (w.type) { w.type = null; render('pop'); } else back();
  },
  wzNext: () => {
    const w = ui.wz;
    if (Object.keys(wzErrors()).length) { w.err = true; if (w.type === 'med') { w.open.times = true; } render(); return; }
    w.err = false; w.step += 1; render('push');
  },
  wzSubmit: () => {
    const w = ui.wz, n = nbcOf(w.type);
    const item = { id: Date.now(), mode: n.id === 'med' ? 'ADD' : 'ANY', status: 'PENDING', nbc: n.id, created: new Date(), justification: w.just };
    if (n.id === 'med') {
      const m = w.med; const name = wzMedName();
      item.title = name;
      item.fields = [['Fármacos', `${m.drug} ${numPt(m.dose)} ${m.unit}`], ['Quantidade e forma', `${numPt(m.qty)} ${m.form}`], ['Frequência', `${m.freq} x ao dia`], ['Horários', m.times.join(', ')]];
      item.answer = w.dose === 0 ? { rows: [['Dose registrada', fDT(new Date())]] } : null;
      item.answered = new Date();
      const formLabel = m.form.replace('(s)', '').toLowerCase();
      m.times.forEach((t, i) => S.meds.push({ id: Date.now() + i, name, drugs: [[m.drug, numPt(m.dose), m.unit]], quantity: m.qty, form: formLabel, admin: 'Oral', food: 'DOESNT_MATTER', times: m.times.slice(), time: t, status: i === 0 && w.dose === 0 ? 'CONFIRMED' : 'PLANNED', days: [1, 1, 1, 1, 1, 1, 1], startsOn: 0, review: true }));
    } else {
      item.title = w.title;
      item.answered = new Date();
      item.answer = n.answer === 'PHOTO' ? { photo: true } : { rows: n.inputs.map((inp) => [inp.l, `${numPt(w.vals[inp.k], inp.step < 1 ? 1 : 0)} ${n.units ? ['°C', '°F'][w.unit] : inp.unit}`]) };
    }
    S.items.push(item);
    ui.wz = null;
    toast('Recebemos sua solicitação. Ela será avaliada pela equipe de saúde assim que possível.');
    stack.pop();
    if (cur().n !== 'items') stack.push({ n: 'items' });
    render('pop');
  },
  faq: (i) => { ui.faq = ui.faq === +i ? null : +i; render(); },
  setLang: (l) => { S.prefs.lang = l; if (l !== 'Português') toast('Neste protótipo, os textos ficam em português.'); back(); },
  setTz: (t) => { S.prefs.tz = t; back(); },
  notifSound: () => {
    openModal({ title: 'Som da notificação', body: () => ['Padrão', 'Alarme'].map((s) => `<div style="display:flex;align-items:center;border-bottom:1px solid #e5e5ea;padding:4px 0"><button data-a="setSound" data-p="${s}" style="flex:1;display:flex;align-items:center;gap:8px;padding:12px 4px;text-align:left;font-size:16px">${s}${S.prefs.sound === s ? ic('check', 22, '#0fab7a') : ''}</button><button data-a="toast" data-p="Aumente o volume do aparelho para ouvir o som" aria-label="Ouvir ${s}" style="padding:8px">${ic('play', 24, '#0fab7a', 'f')}</button></div>`).join('') + '<button data-a="toast" data-p="No celular, abriria a lista de sons do aparelho." style="padding:16px 4px;font-size:16px;color:#333;width:100%;text-align:left">Escolher do telefone</button>' });
  },
  setSound: (s) => { S.prefs.sound = s; closeModal(true); render(); },
  notifNum: (k) => {
    const fu = k === 'followUp';
    const presets = fu ? [5, 10, 15, 30] : [1, 3, 6, 9, 12];
    ui.numPref = { k, v: S.prefs[k] };
    openModal({
      title: fu ? 'Lembrar novamente após' : 'Por no máximo',
      body: () => `<div class="presets">${presets.map((p) => `<button class="${ui.numPref.v === p ? 'on' : ''}" data-a="numPreset" data-p="${p}">${fu ? `${p} min` : p === 1 ? '1 vez' : `${p} vezes`}</button>`).join('')}</div>
        <div class="dial-val">${ui.numPref.v}</div><div class="dial-unit">${fu ? 'min' : ui.numPref.v === 1 ? 'vez' : 'vezes'}</div>
        <div style="display:flex;gap:12px;justify-content:center;margin:12px 0"><button class="sqbtn" data-a="numStep" data-p="-1" aria-label="Diminuir">${ic('caret-left', 24, '#0c8861')}</button><button class="sqbtn" data-a="numStep" data-p="1" aria-label="Aumentar">${ic('caret-right', 24, '#0c8861')}</button></div>
        <button class="b-ok" style="width:100%;height:44px;margin-top:16px" data-a="numSave">Salvar</button>`,
    });
  },
  numPreset: (p) => { ui.numPref.v = +p; refreshModal(); },
  numStep: (d) => { const fu = ui.numPref.k === 'followUp'; ui.numPref.v = Math.max(1, Math.min(fu ? 120 : 20, ui.numPref.v + +d)); refreshModal(); },
  numSave: () => { S.prefs[ui.numPref.k] = ui.numPref.v; closeModal(true); render(); },
  saveProfile: () => { const v = document.getElementById('pw').value.replace(/\D/g, ''); if (v) S.user.phone = v; toast('Perfil atualizado com sucesso'); back(); },
  removeAccount: () => openModal({ title: 'Tem certeza que deseja excluir sua conta?', body: () => '<p class="mhint">Sentimos muito que a sua experiência não tenha sido boa 😥. Você poderia, por favor, nos dizer o motivo que levou você a tomar essa decisão?</p><textarea class="ta" placeholder="Pode ser sincero em seu comentário. Isso nos ajudará a melhorar o aplicativo."></textarea><button class="b-pill danger" data-a="removeGo">Excluir minha conta</button>' }),
  removeGo: () => { closeAllModals(); toast('Conta removida com sucesso'); S.loggedIn = false; root('login'); },
  logout: () => { S.loggedIn = false; root('login'); },
  dialDone: () => ui.dial.done(),
  dialClear: () => ui.dial.clear(),
};
function taskDetails(t) {
  return `<div class="drows">${drow('Tipo', TASK_TYPE[t.type])}${t.freqLabel === 'Dias da semana' ? drow('Dias da semana', weekdayChips(t.days)) : drow('Frequência', esc(t.freqLabel))}${drow('Horários', t.time)}${drow('Data de início', fDMY(addD(TODAY, -40)))}${drow('Data de término', t.endsOn ? fDMY(addD(TODAY, t.endsOn)) : 'Sem data de término')}</div>`;
}
function finishTask(id) {
  const t = S.tasks.find((x) => x.id === id);
  t.status = 'CONFIRMED';
  if (ui.act) delete ui.act[id];
  toast('Sua resposta foi salva com sucesso');
  popTo('board', { page: 'tasks' });
}

const INPUTS = {
  justText: (v) => { ui.just.text = v; const b = document.getElementById('justSubmit'); if (b) b.disabled = !v.trim(); },
  formText: (v) => { const a = ui.act[cur().id]; a.ans[a.q] = v; },
  recSearch: (v) => { ui.q = v; const sc = SCREENS[cur().n](cur()); const tmp = document.createElement('div'); tmp.innerHTML = sc.html; rerenderList('recList', tmp.querySelector('#recList').innerHTML); },
  tzSearch: (v) => { ui.tzq = v; rerenderList('tzList', tzList()); },
  wzTitle: (v) => { ui.wz.title = v; },
  wzJust: (v) => { ui.wz.just = v; const c = document.getElementById('wzCount'); if (c) c.textContent = `${v.length}/1000`; },
  wzDrug: (v) => { ui.wz.med.drug = v; if (ui.wz.med.useDrug) { const n = document.querySelector('[data-in="wzName"]'); if (n) n.value = wzMedName(); } },
  wzName: (v) => { ui.wz.med.name = v; },
  wzUnit: (v) => { ui.wz.med.unit = v; },
  wzForm: (v) => { ui.wz.med.form = v; },
  wzFood: (v) => { ui.wz.med.food = v; },
  wzTime: (v, el) => { ui.wz.med.times[+el.dataset.i] = v; },
  wzStart: (v) => { if (v) ui.wz.med.start = v; },
};

/* ---------- wiring ---------- */
const phone = document.getElementById('phone');
phone.addEventListener('click', (e) => {
  const bd = e.target.closest('.backdrop');
  if (bd && e.target === bd) { if (!ui.expBusy) closeModal(); return; }
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const fn = A[el.dataset.a];
  if (fn) { e.preventDefault(); fn(el.dataset.p, el, e); }
});
phone.addEventListener('input', (e) => { const el = e.target.closest('[data-in]'); if (el && INPUTS[el.dataset.in]) INPUTS[el.dataset.in](el.value, el); });
phone.addEventListener('change', (e) => { const el = e.target.closest('select[data-in],input[type=time][data-in],input[type=date][data-in]'); if (el) { INPUTS[el.dataset.in](el.value, el); if (el.tagName === 'SELECT' || el.type === 'date') render(); } });
phone.addEventListener('submit', (e) => {
  e.preventDefault();
  if (e.target.dataset.form === 'login') {
    const em = document.getElementById('lemail').value.trim();
    const pw = document.getElementById('lpass').value;
    if (!em || !pw) { toast('Email e / ou senha incorretos', true); return; }
    S.loggedIn = true;
    toast('Login realizado com sucesso!');
    root('splash');
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modals.length && !ui.expBusy) closeModal(); });

/* mouse drag scrolls like a finger */
function scrollableAncestor(el, axis) {
  for (let n = el; n && n !== phone; n = n.parentElement) {
    if (n.id === 'ruler') return null;
    const cs = getComputedStyle(n);
    if (axis === 'y' && /(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1) return n;
    if (axis === 'x' && /(auto|scroll)/.test(cs.overflowX) && n.scrollWidth > n.clientWidth + 1) return n;
  }
  return null;
}
let fdrag = null, suppressClick = false, glide = null;
phone.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse' || e.button !== 0) return;
  if (e.target.closest('input, textarea, select, #ruler')) return;
  cancelAnimationFrame(glide);
  fdrag = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, t: performance.now(), v: 0, axis: null, el: null, target: e.target, id: e.pointerId };
});
phone.addEventListener('pointermove', (e) => {
  if (!fdrag || e.pointerId !== fdrag.id) return;
  const dx = e.clientX - fdrag.x, dy = e.clientY - fdrag.y;
  if (!fdrag.axis) {
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    fdrag.axis = Math.abs(dy) >= Math.abs(dx) ? 'y' : 'x';
    fdrag.el = scrollableAncestor(fdrag.target, fdrag.axis);
    if (!fdrag.el) { fdrag = null; return; }
    phone.setPointerCapture(e.pointerId);
    phone.classList.add('dragging');
  }
  const now = performance.now();
  const d = fdrag.axis === 'y' ? e.clientY - fdrag.ly : e.clientX - fdrag.lx;
  if (fdrag.axis === 'y') fdrag.el.scrollTop -= d; else fdrag.el.scrollLeft -= d;
  const dt = Math.max(1, now - fdrag.t);
  fdrag.v = 0.8 * (d / dt) + 0.2 * fdrag.v;
  fdrag.lx = e.clientX; fdrag.ly = e.clientY; fdrag.t = now;
});
function endDrag() {
  if (!fdrag) return;
  if (fdrag.axis) {
    suppressClick = true;
    setTimeout(() => { suppressClick = false; }, 0);
    phone.classList.remove('dragging');
    const { el, axis } = fdrag;
    let v = performance.now() - fdrag.t > 80 ? 0 : fdrag.v * 16;
    const step = () => {
      if (Math.abs(v) < 0.5) return;
      if (axis === 'y') el.scrollTop -= v; else el.scrollLeft -= v;
      v *= 0.94;
      glide = requestAnimationFrame(step);
    };
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) glide = requestAnimationFrame(step);
  }
  fdrag = null;
}
phone.addEventListener('mousedown', (e) => { if (!e.target.closest('input, textarea, select, a')) e.preventDefault(); });
phone.addEventListener('pointerup', endDrag);
phone.addEventListener('pointercancel', endDrag);
phone.addEventListener('click', (e) => { if (suppressClick) { e.stopPropagation(); e.preventDefault(); } }, true);

document.querySelectorAll('[data-jump]').forEach((b) => b.addEventListener('click', () => {
  const j = b.dataset.jump;
  closeAllModals();
  if (j === 'login') { S.loggedIn = false; return root('login'); }
  S.loggedIn = true;
  if (j !== 'changes') S.seenChanges = true;
  ui.q = ''; ui.prog = null;
  if (j.startsWith('board:')) { stack = [{ n: 'home' }, { n: 'board', page: j.split(':')[1] }]; return render('push'); }
  if (j === 'chat') { S.unread = false; return root('chat'); }
  if (['home', 'records', 'changes', 'offline', 'server-off'].includes(j)) return root(j);
  if (j === 'wizard') ui.wz = wzFresh();
  const parent = ['items', 'wizard'].includes(j) ? 'records' : ['s-notif'].includes(j) ? 'settings' : 'home';
  stack = [{ n: parent === 'settings' ? 'home' : parent }];
  if (parent === 'settings') stack.push({ n: 'settings' });
  if (j === 'wizard') stack.push({ n: 'items' });
  stack.push({ n: j });
  render('push');
}));
document.getElementById('reset').addEventListener('click', () => { S = fresh(); ui = {}; stack = [{ n: 'login' }]; modals = []; rendered = null; render('pop'); });

function tickClock() { const el = document.getElementById('sbtime'); if (el) el.textContent = nowHM(); }
setInterval(tickClock, 15000);
tickClock();

S = fresh(); ui = {}; stack = [{ n: 'login' }]; modals = [];
render();
