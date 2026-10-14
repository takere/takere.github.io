'use strict';

/* Mock of the PDFs the backend draws with pdfkit, shown in an in-app viewer. 1px here = 1pt there. */
const PDFC = { primary: '#0CB17B', navy: '#001D4B', muted: '#5A6B7D', mutedL: '#8A94A6', border: '#E3E8EF', itemBg: '#F8FAFC', divider: '#E8EBF0', review: '#B45309' };
const PDF_CATS = {
  med: { l: 'Medicamentos', c: '#db594f', i: 'pill' },
  task: { l: 'Tarefas', c: '#f974bc', i: 'list-checks' },
  water: { l: 'Controle de água', c: '#0D6EFD', i: 'drop' },
  guide: { l: 'Guias', c: '#46bdc6', i: 'graduation-cap' },
};
const INSTITUTION = 'Clínica Saúde Integral';
const PDF_REASONS = ['Esquecimento', 'Estava se sentindo mal', 'Sem estoque', 'Estava fora de casa', 'Já realizou, mas não marcou no app', 'Efeitos colaterais'];
const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
const dayOff = (d) => Math.round((addD(d, 0) - TODAY) / 86400000);
const FORM_NAME = { comprimido: 'Comprimido', 'cápsula': 'Cápsula' };

/* ---------- pagination ---------- */
function paginate(blocks, { w, h, margin }) {
  const contentW = w - margin * 2;
  const avail = h - margin * 2 - 18;
  const meas = document.createElement('div');
  meas.className = 'pdf-measure';
  meas.style.width = `${contentW}px`;
  document.body.appendChild(meas);
  const pages = [[]];
  let used = 0;
  blocks.forEach((b) => {
    if (b.newPage && pages[pages.length - 1].length) { pages.push([]); used = 0; }
    meas.innerHTML = b.html;
    const height = meas.firstElementChild.getBoundingClientRect().height + (b.gap || 0);
    if (used + height > avail && pages[pages.length - 1].length) { pages.push([]); used = 0; }
    pages[pages.length - 1].push(b.html);
    used += height;
  });
  meas.remove();
  return pages.map((p, i) => `<div class="pdf-page" style="width:${w}px;height:${h}px;padding:${margin}px"><div class="pdf-content" style="width:${contentW}px">${p.join('')}</div><div class="pdf-num" style="right:${margin}px;bottom:${margin - 9}px">${i + 1}</div></div>`);
}
function pdfHeader(logoW, logoH, fs) {
  return `<div class="pdf-head" style="height:${logoH}px"><img src="img/logo-pdf.png" alt="Takere" style="width:${logoW}px"><div style="font-size:${fs}px;color:${PDFC.muted};text-align:right;line-height:1.25">Instituição: ${INSTITUTION}<br>Exportado em: ${new Date().toLocaleString('pt-BR')}</div></div><div style="height:1px;background:${PDFC.divider};margin:6px 0 ${fs === 9 ? 10 : 12}px"></div>`;
}

/* ---------- PDF A: prontuário (care plan, full layout) ---------- */
function carePlanItems() {
  const items = [];
  recMeds().forEach((m) => {
    const times = S.meds.filter((x) => x.name === m.name).map((x) => x.time).filter(Boolean);
    const n = times.length || 4;
    const formName = FORM_NAME[m.form] || m.form;
    items.push({
      cat: 'med', icon: 'pill', color: '#db594f', times,
      name: `${m.name} | ${numPt(m.quantity)} ${formName.charAt(0).toUpperCase() + formName.slice(1)}`,
      badge: m.review ? 'review' : null,
      params: [
        ['Fármacos', m.drugs.map((d) => `${d[0]} ${d[1]} ${d[2]}`).join(' + ')],
        ['Quantidade', numPt(m.quantity)],
        ['Forma', `${formName.charAt(0).toUpperCase() + formName.slice(1)}(s)`],
        ['Via', m.admin],
        ['Relação com a refeição', FOOD_LABEL[m.food] || 'Indiferente'],
        ['Tempo de jejum', m.offset ? m.offset.replace('min', ' min') : null],
        ['Frequência', `${n}x`],
        ['Tipo de aprazamento', m.freqLabel || `${n} x ao dia`],
        ['Prazo', m.waiting ? null : '2 horas'],
        ['Data de início', fDMY(addD(TODAY, m.startsOn))],
        ['Motivo', m.why],
        ['Observações', m.notes],
      ],
    });
  });
  const taskParams = {
    ASK_ANSWER: [['Pergunta', 'Qual é a sua temperatura agora?']],
    FORM: [['Perguntas', FORM_QS.map((q, i) => `${i + 1}. ${q.l}${q.o ? ' ' + q.o.map((o) => `( ) ${o}`).join(' ') : ''}`).join(' ')]],
    PHOTO: [['Nome', 'Foto da ferida']],
    TEXT: [['Conteúdo', 'Passo a passo para trocar o curativo em casa.']],
  };
  S.tasks.forEach((t) => {
    const wk = t.days.every(Boolean);
    items.push({
      cat: 'task', icon: t.icon, color: '#f974bc', times: [t.time], name: t.name,
      params: [...(taskParams[t.type] || []), ['Frequência', '1x'], ['Tipo de aprazamento', wk ? '1 x ao dia' : `Dias da semana (${WD_CHIPS.filter((_, i) => t.days[i]).join(', ')})`], ['Prazo', '2 horas'], ['Data de início', fDMY(addD(TODAY, -40))], ['Data de término', t.endsOn ? fDMY(addD(TODAY, t.endsOn)) : null]],
      alerts: t.type === 'ASK_ANSWER' ? [['Temperatura for maior que 37,8', 'instituição', 'Paciente com febre. Avaliar a necessidade de contato.']] : null,
    });
  });
  items.push({ cat: 'water', icon: 'drop', color: '#0D6EFD', times: [], name: 'Controle de água', params: [['Meta diária (ml)', String(S.water.goal)], ['Tipo de aprazamento', '1 x ao dia'], ['Data de início', fDMY(addD(TODAY, -40))]] });
  S.guides.forEach((g) => items.push({ cat: 'guide', icon: 'graduation-cap', color: '#46bdc6', times: [], name: g.name, params: [['Descrição', g.description]] }));
  return items;
}
function cpItemCard(it) {
  const params = it.params.filter((p) => p[1]).map(([k, v]) => `<div class="pc-row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
  const badgeHtml = it.badge ? `<span class="pc-badge" style="color:${PDFC.review};background:${rgba(PDFC.review, 0.12)};border-color:${rgba(PDFC.review, 0.35)}">Aguardando revisão</span>` : '';
  const alerts = it.alerts ? `<div class="pc-sec">${ic('lightning', 9, rgba(PDFC.navy, 0.45), 'f')}ALERTAS</div>${it.alerts.map(([w, to, msg]) => `<div class="pc-alert"><div style="width:46%"><small>QUANDO</small><b>${esc(w)}</b></div><div style="width:18%"><small>ENTREGA PARA</small><span class="pc-to">${to}</span></div><div style="width:36%"><small>MENSAGEM</small><span style="color:${PDFC.muted}">${esc(msg)}</span></div></div>`).join('')}` : '';
  return `<div class="pc-item"><div class="pc-ih"><span class="pc-tile" style="background:${rgba(it.color, 0.1)}">${ic(it.icon, 12, it.color)}</span><div><div class="pc-name">${esc(it.name)}</div>${badgeHtml}</div></div><div class="pc-params">${params}</div></div>${alerts}`;
}
function buildCarePlanPdf() {
  const items = carePlanItems();
  const times = [...new Set(items.flatMap((i) => i.times))].sort();
  const keys = [...times, ''];
  const blocks = [{ html: `<div>${pdfHeader(90, 28, 9)}<div style="font:bold 14px Helvetica,Arial,sans-serif;color:${PDFC.navy}">${esc(S.user.firstName)} ${esc(S.user.lastName)}</div><div style="width:44px;height:2px;background:${PDFC.primary};margin:4px 0 8px"></div></div>` }];
  const usedKeys = keys.filter((k) => items.some((i) => (k ? i.times.includes(k) : !i.times.length)));
  usedKeys.forEach((k, idx) => {
    const inBlock = items.filter((i) => (k ? i.times.includes(k) : !i.times.length));
    const p = k ? period(k) : { c: PDFC.muted, i: 'calendar-x', l: '' };
    const last = idx === usedKeys.length - 1;
    const cats = ['med', 'task', 'water', 'guide'].filter((c) => inBlock.some((i) => i.cat === c));
    const sub = cats.map((c, ci) => {
      const cat = PDF_CATS[c];
      const its = inBlock.filter((i) => i.cat === c);
      return `<div class="pc-sub" style="border-color:${rgba(cat.c, 0.14)}"><div class="pc-band" style="background:${rgba(cat.c, 0.08)};border-bottom-color:${rgba(cat.c, 0.14)};${ci === 0 ? 'border-radius:9px 9px 0 0' : ''}"><span class="pc-sq" style="background:${cat.c}">${ic(cat.i, 8, '#fff', 'b')}</span><b>${cat.l}</b><span class="pc-cnt" style="color:${cat.c};background:${rgba(cat.c, 0.12)};border-color:${rgba(cat.c, 0.22)}">${its.length}</span></div><div class="pc-items">${its.map(cpItemCard).join('')}</div></div>`;
    }).join('');
    blocks.push({
      gap: last ? 0 : 22,
      html: `<div class="pc-block" style="margin-bottom:${last ? 0 : 22}px">
        <div class="pc-rail">
          <span class="pc-dot" style="background:${p.c}">${ic(p.i, 13, '#fff')}</span>
          <div class="pc-rt">${k ? `<b style="font-size:14px">${k}</b><span class="pc-chip" style="color:${p.c};background:${rgba(p.c, 0.12)};border-color:${rgba(p.c, 0.28)}">${p.l.toUpperCase()}</span>` : '<b style="font-size:9px">Sem horário</b>'}<span class="pc-count">${inBlock.length} ${inBlock.length === 1 ? 'item' : 'itens'}</span></div>
          ${last ? '' : `<span class="pc-line" style="background:${rgba(p.c, 0.28)}"></span>`}
        </div>
        <div class="pc-card">${sub}${last ? '' : `<span class="pc-arrow" style="border-color:${p.c};color:${p.c}"></span>`}</div>
      </div>`,
    });
  });
  return paginate(blocks, { w: 595, h: 842, margin: 36 });
}

/* ---------- PDF B: month history ---------- */
function monthRows() {
  if (!ui.prog) ui.prog = { shift: 0, len: 15, inactive: false };
  const { groups } = progressGroups();
  const rows = { med: [], task: [] };
  groups.forEach((g, gi) => g.items.forEach((it, ii) => it.slots.forEach((s, si) => {
    (gi === 0 ? rows.med : rows.task).push({ gi, ii, si, it, s, first: si === 0, title: it.name, time: s.time });
  })));
  rows.task.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  rows.water = [{ water: true, first: true, title: 'Controle de água', time: '' }];
  return rows;
}
function monthStatus(r, d) {
  const off = dayOff(d);
  if (r.water) {
    if (off < -40) return null;
    if (off > 0) return 'PLANNED';
    if (off === 0) return S.water.intake >= S.water.goal ? 'CONFIRMED' : 'PLANNED';
    const key = `w--${dKey(d)}`;
    if (S.histOverride[key]) return S.histOverride[key];
    const x = hash(41, off + 700);
    return x < 0.75 ? 'CONFIRMED' : x < 0.9 ? 'SKIPPED' : 'JUSTIFIED';
  }
  if (off > 0) {
    if (off < (r.it.startsOn ?? -60)) return null;
    const wd = (d.getDay() + 6) % 7;
    return r.it.days && !r.it.days[wd] ? 'NOT_SCHEDULED' : 'PLANNED';
  }
  const st = histStatus(r.it, r.s, d, r.gi, r.ii, r.si);
  return st === 'PLANNED_FUTURE' ? 'PLANNED' : st;
}
function reasonFor(r, d) {
  const key = r.water ? `w--${dKey(d)}` : `${r.gi}-${r.ii}-${r.si}-${dKey(d)}`;
  if (S.histReason && S.histReason[key]) return S.histReason[key];
  if (dayOff(d) === 0 && r.s && r.s.live.reason) return r.s.live.reason;
  return PDF_REASONS[Math.floor(hash(r.gi || 9, dayOff(d) + 300 + (r.ii || 0)) * PDF_REASONS.length)];
}
const PDF_SOFT = { PLANNED: '#e8eaee', CONFIRMED: '#eafaf1', SKIPPED: '#eceeef', JUSTIFIED: '#fff4eb', NOT_SCHEDULED: '#eceeef' };
function pdfMark(st, size = 11) {
  if (!st) return '';
  if (st === 'NOT_SCHEDULED') return ic('circle', 6, '#b0b5bd', 'f');
  const s = STATUS[st === 'EXPIRED' ? 'SKIPPED' : st];
  return ic(s.i, size, s.c, s.w);
}
function sectionHeading(title) {
  return `<div class="ph-sec"><span style="background:${PDFC.primary}">${ic('bandaids', 10, '#fff')}</span>${title}</div>`;
}
function pdfChartCard(title, pts, color) {
  const W = 375, H = 140, axis = 36, padT = 6;
  const vals = pts.map((p) => p.v);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const span = mx - mn || 1;
  const lo = Math.max(0, mn - span * 0.2), hi = mx + span * 0.2;
  const x = (i) => axis + 6 + (pts.length === 1 ? (W - axis - 12) / 2 : (i * (W - axis - 12)) / (pts.length - 1));
  const y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - 16);
  let grid = '';
  for (let k = 0; k < 5; k++) { const v = lo + ((hi - lo) * k) / 4; grid += `<line x1="${axis}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="${rgba(PDFC.navy, k === 0 ? 0.12 : 0.08)}" stroke-width="${k === 0 ? 0.6 : 0.4}" ${k === 0 ? '' : 'stroke-dasharray="3 3"'}/><text x="${axis - 4}" y="${y(v) + 2.5}" text-anchor="end" font-size="7" fill="${PDFC.mutedL}">${numPt(+v.toFixed(1), v % 1 ? 1 : 0)}</text>`; }
  const P = pts.map((p, i) => [x(i), y(p.v)]);
  const line = smoothPath(P);
  const gid = 'pg' + Math.random().toString(36).slice(2, 7);
  const every = Math.ceil(pts.length / 10);
  const xl = pts.map((p, i) => (i % every === 0 ? `<text x="${x(i)}" y="${H - 3}" text-anchor="middle" font-size="7" fill="${PDFC.mutedL}">${p.l}</text>` : '')).join('');
  const sorted = [...vals].sort((a, b) => a - b);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const med = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
  const f2 = (v) => numPt(+v.toFixed(2), 0).replace(/^(-?\d+)$/, '$1');
  const stats = [['N', vals.length], ['Média', f2(mean)], ['Mediana', f2(med)], ['DP', f2(Math.sqrt(variance))], ['Variância', f2(variance)], ['Mín.', f2(mn)], ['Máx.', f2(mx)], ['Amplitude', f2(mx - mn)]];
  return `<div class="ph-chart"><b class="ph-ct">${title}</b>
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><linearGradient id="${gid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    ${grid}${line ? `<path d="${line} L${P[P.length - 1][0]},${y(lo)} L${P[0][0]},${y(lo)} Z" fill="url(#${gid})"/><path d="${line}" fill="none" stroke="${color}" stroke-width="2"/>` : ''}${P.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="${P.length === 1 ? 4 : 2.5}" fill="${color}" stroke="#fff" stroke-width="1.2"/>`).join('')}${xl}</svg>
    <div class="ph-stats">${stats.map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div></div>`;
}
function buildHistoryPdf(monthOffset) {
  const base = new Date(TODAY.getFullYear(), TODAY.getMonth() + monthOffset, 1);
  const nDays = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: nDays }, (_, i) => new Date(base.getFullYear(), base.getMonth(), i + 1));
  const W = 842, H = 595, M = 28, CW = W - M * 2, LABEL = 150, colW = (CW - LABEL) / nDays;
  const rows = monthRows();
  const todayIdx = days.findIndex((d) => dKey(d) === dKey(TODAY));
  const blocks = [{
    html: `<div>${pdfHeader(100, 32, 10)}
      <div class="ph-patient"><span class="ph-av">${S.user.firstName[0]}${S.user.lastName[0]}</span><div style="flex:1"><small>HISTÓRICO</small><b>${esc(S.user.firstName)} ${esc(S.user.lastName)}</b></div>
      <div class="ph-date"><small>INÍCIO</small><b>${fDMY(days[0])}</b></div><div class="ph-date"><small>FIM</small><b>${fDMY(days[nDays - 1])}</b></div></div></div>`,
    gap: 14,
  }];
  const groupDefs = [['med', rows.med], ['task', rows.task], ['water', rows.water]];
  const justified = [];
  groupDefs.forEach(([c, rs]) => {
    const cat = PDF_CATS[c];
    const cells = rs.map((r) => days.map((d) => monthStatus(r, d)));
    if (!cells.some((row) => row.some(Boolean))) return;
    rs.forEach((r, ri) => days.forEach((d, di) => { if (cells[ri][di] === 'JUSTIFIED') justified.push({ d, time: r.time || '—', title: r.title, reason: reasonFor(r, d) }); }));
    const items = new Set(rs.map((r) => r.title)).size;
    const header = `<div class="ph-row ph-dh" style="grid-template-columns:${LABEL}px repeat(${nDays},1fr)"><span></span>${days.map((d) => `<span class="${d.getDay() % 6 === 0 ? 'we' : ''}"><small>${WD_SHORT[d.getDay()]}</small><b>${fDM(d)}</b></span>`).join('')}</div>`;
    const body = rs.map((r, ri) => `<div class="ph-row ${r.first ? 'first' : ''}" style="grid-template-columns:${LABEL}px repeat(${nDays},1fr)"><span class="ph-lab"><i>${r.first ? esc(r.title) : ''}</i><em>${r.time || ''}</em></span>${days.map((d, di) => `<span class="ph-cell ${d.getDay() % 6 === 0 ? 'we' : ''}">${pdfMark(cells[ri][di])}</span>`).join('')}</div>`).join('');
    const todayRing = todayIdx >= 0 ? `<span class="ph-today" style="left:${LABEL + todayIdx * colW + 1.2}px;width:${colW - 2.4}px;border-radius:${colW / 2}px"></span>` : '';
    blocks.push({
      gap: 14,
      html: `<div class="ph-group" style="border-color:${rgba(cat.c, 0.2)};margin-bottom:14px">
        <div class="ph-band" style="background:${rgba(cat.c, 0.08)};border-bottom-color:${rgba(cat.c, 0.14)}"><span class="ph-sq" style="background:${cat.c}">${ic(cat.i, 11.5, '#fff', 'b')}</span><b>${cat.l}</b><span class="ph-cnt" style="color:${cat.c};background:${rgba(cat.c, 0.12)};border-color:${rgba(cat.c, 0.22)}">${items}</span></div>
        <div style="position:relative">${header}${body}${todayRing}</div>
      </div>`,
    });
  });
  if (blocks.length === 1) blocks.push({ html: `<div class="ph-empty">Nenhum item do plano de cuidado agendado neste período.</div>` });
  blocks.push({ html: `<div class="ph-legend"><b>Legenda de status</b><div>${['PLANNED', 'CONFIRMED', 'SKIPPED', 'JUSTIFIED', 'NOT_SCHEDULED'].map((k) => `<span><i style="background:${PDF_SOFT[k]}">${pdfMark(k, 10)}</i>${STATUS[k].l}</span>`).join('')}</div></div>` });

  /* appendix: charts */
  const confirmedDays = (pred) => {
    const r = rows.task.find(pred);
    return r ? days.filter((d) => dayOff(d) <= 0 && monthStatus(r, d) === 'CONFIRMED') : [];
  };
  const tempDays = confirmedDays((r) => r.s.live.type === 'ASK_ANSWER');
  const formDays = confirmedDays((r) => r.s.live.type === 'FORM');
  const charts = [];
  if (tempDays.length) charts.push(pdfChartCard('Qual é a sua temperatura agora?', tempDays.map((d) => ({ l: fDM(d), v: +(36.3 + hash(7, dayOff(d) + 900) * 1.1).toFixed(1) })), '#f974bc'));
  if (formDays.length) charts.push(pdfChartCard('Nível de dor (0 a 10)', formDays.map((d) => ({ l: fDM(d), v: Math.round(hash(11, dayOff(d) + 400) * 6) })), '#f974bc'));
  if (charts.length) {
    blocks.push({ newPage: true, html: `<div>${sectionHeading('Gráficos')}</div>` });
    blocks.push({ html: `<div class="ph-charts">${charts.join('')}</div>` });
  }
  /* appendix: justifications */
  if (justified.length) {
    blocks.push({ newPage: true, html: `<div>${sectionHeading('Justificativas')}</div>` });
    const byDay = new Map();
    justified.sort((a, b) => a.d - b.d || a.time.localeCompare(b.time)).forEach((j) => { const k = dKey(j.d); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(j); });
    byDay.forEach((list) => blocks.push({
      gap: 10,
      html: `<div class="ph-jcard" style="margin-bottom:10px"><div class="ph-jh">${ic('calendar-blank', 11, PDFC.primary)}<b>${fDMY(list[0].d)}</b><span>${list.length}</span></div>${list.map((j) => `<div class="ph-je"><div class="ph-jt">${ic('clock', 9, PDFC.primary)}<em>${j.time}</em><b>${esc(j.title)}</b></div><div class="ph-ans" style="font-style:italic">${esc(j.reason)}</div></div>`).join('')}</div>`,
    }));
  }
  /* appendix: questionnaire answers */
  if (formDays.length) {
    blocks.push({ newPage: true, html: `<div>${sectionHeading('Respostas dos questionários')}</div>` });
    formDays.forEach((d) => {
      const o = dayOff(d);
      const pick = Math.floor(hash(13, o + 50) * 3);
      const pain = Math.round(hash(11, o + 400) * 6);
      const sym = [0, 1, 2, 3, 4].filter((i) => hash(17 + i, o) > 0.7);
      const qs = FORM_QS.map((q, qi) => {
        let ans;
        if (q.type === 'radio') ans = q.o.map((opt, i) => `<div class="ph-opt ${i === pick ? 'on' : ''}">${i === pick ? ic('check-circle', 10, PDFC.primary, 'f') : ic('circle', 10, PDFC.mutedL)}${opt}</div>`).join('');
        else if (q.type === 'checkbox') ans = q.o.map((opt, i) => { const on = sym.length ? sym.includes(i) : i === 4; return `<div class="ph-opt ${on ? 'on' : ''}">${on ? ic('check-circle', 10, PDFC.primary, 'f') : ic('circle', 10, PDFC.mutedL)}${opt}</div>`; }).join('');
        else if (q.type === 'integer') ans = `<div class="ph-ans">${pain}</div>`;
        else ans = `<div class="ph-ans">${pain > 3 ? 'Dor um pouco mais forte à noite.' : 'Sem observações.'}</div>`;
        return `<div class="ph-q"><div class="ph-qt"><span>${qi + 1}</span>${esc(q.l)}</div>${ans}</div>`;
      }).join('');
      blocks.push({ gap: 10, html: `<div class="ph-jcard" style="margin-bottom:10px"><div class="ph-jh">${ic('calendar-blank', 11, PDFC.primary)}<b>${fDMY(d)}</b></div><div class="ph-je"><div class="ph-jt">${ic('clock', 9, PDFC.primary)}<em>14:00</em><b>Questionário de sintomas</b></div>${qs}</div></div>` });
    });
  }
  return paginate(blocks, { w: W, h: H, margin: M });
}

/* ---------- viewer (iOS QuickLook) ---------- */
function openPdfViewer(fileName, pages, pageW) {
  const root = document.getElementById('viewer-root');
  root.innerHTML = `<div class="qv">
    <div class="qv-bar"><button class="qv-ok" id="qvClose">OK</button><div class="qv-title"><b>${esc(fileName)}</b><small>Documento PDF</small></div><button id="qvShare" aria-label="Compartilhar" style="padding:6px">${ic('export', 22, '#007AFF')}</button></div>
    <div class="qv-body" id="qvBody">${pages.map((p) => `<div class="qv-wrap">${p}</div>`).join('')}</div>
    <div class="qv-ind" id="qvInd">1 de ${pages.length}</div>
  </div>`;
  document.getElementById('sbar').className = 'statusbar';
  const body = document.getElementById('qvBody');
  let zoom = 1;
  const layout = () => {
    const s = ((body.clientWidth - 24) / pageW) * zoom;
    body.querySelectorAll('.qv-wrap').forEach((w) => {
      const pg = w.firstElementChild;
      w.style.width = `${pg.offsetWidth * s}px`;
      w.style.height = `${pg.offsetHeight * s}px`;
      pg.style.transform = `scale(${s})`;
    });
  };
  layout();
  body.addEventListener('scroll', () => {
    const wraps = [...body.querySelectorAll('.qv-wrap')];
    const mid = body.scrollTop + body.clientHeight / 2;
    let idx = wraps.findIndex((w) => w.offsetTop + w.offsetHeight > mid);
    if (idx < 0) idx = wraps.length - 1;
    document.getElementById('qvInd').textContent = `${idx + 1} de ${wraps.length}`;
  });
  body.addEventListener('dblclick', () => { zoom = zoom === 1 ? 2.2 : 1; layout(); });
  document.getElementById('qvClose').addEventListener('click', () => { root.innerHTML = ''; render(); });
  document.getElementById('qvShare').addEventListener('click', () => toast('No celular, abriria o menu de compartilhamento.'));
}
