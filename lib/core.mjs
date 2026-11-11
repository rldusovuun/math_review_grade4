export const units = ['분수의 덧셈과 뺄셈','삼각형','소수의 덧셈과 뺄셈','사각형','꺾은선그래프'];
export function normalizeNumber(value) {
  const s = String(value ?? '').normalize('NFKC').trim();
  if (!/^\d{1,3}$/.test(s) || +s < 1 || +s > 999) throw new Error('번호는 1~999 사이의 숫자로 입력해 주세요.');
  return +s;
}
export function numeric(value) {
  const s = String(value ?? '').normalize('NFKC').trim();
  const mixed = s.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return +mixed[3] ? +mixed[1] + +mixed[2] / +mixed[3] : NaN;
  const frac = s.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac) return +frac[2] ? +frac[1] / +frac[2] : NaN;
  return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}
export function isCorrect(q, value) {
  if (q.type === 'choice') return String(value) === String(q.answer);
  const a = numeric(value), b = numeric(q.answer);
  return Number.isFinite(a) && Math.abs(a - b) < 1e-9;
}
export function publicQuestion(q) {
  const {answer, explanation, ...safe} = q;
  return safe;
}
export function grade(questions, answers, previous = null) {
  const solved = new Set(previous?.solved ?? []);
  const required = questions.filter(q => !solved.has(q.id));
  if (!required.length) throw new Error('이미 모든 문제를 해결했어요.');
  const submitted = {};
  for (const q of required) {
    const value = answers[q.id] ?? '';
    if (typeof value !== 'string' || value.length > 80) throw new Error('답안은 80자 이내로 입력해 주세요.');
    submitted[q.id] = value.trim();
    if (!submitted[q.id]) continue;
    if (q.type === 'choice' && !q.options.includes(answers[q.id])) throw new Error('보기에서 답을 선택해 주세요.');
    if (q.type !== 'choice' && !Number.isFinite(numeric(answers[q.id]))) throw new Error('숫자 또는 분수 형식으로 답을 입력해 주세요.');
    if (isCorrect(q, answers[q.id])) solved.add(q.id);
  }
  return {solved: [...solved], answers: {...(previous?.answers ?? {}), ...submitted}};
}
export function unitSummary(questions, first, latest) {
  return units.map((title, i) => {
    const qs = questions.filter(q => q.unit === i + 1);
    return {unit:i + 1, title, total: first ? qs.length : 0, wrong:first ? qs.filter(q => !first.solved.includes(q.id)).length : 0, remaining:latest ? qs.filter(q => !latest.solved.includes(q.id)).length : 0};
  });
}
export function questionStats(questions, records) {
  return questions.map(q => {
    const wrong = records.filter(r => !r.first.solved.includes(q.id));
    return {...q, submitted:records.length, wrong:wrong.length, rate:records.length ? Math.round(wrong.length / records.length * 1000) / 10 : null, remaining:records.filter(r => !r.latest.solved.includes(q.id)).length, wrongNumbers:wrong.map(r => r.number)};
  });
}
