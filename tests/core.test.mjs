import assert from 'node:assert/strict';
import {rounds,bank} from '../lib/questions.mjs';
import {numeric,isCorrect,grade,publicQuestion,unitSummary,questionStats,normalizeNumber} from '../lib/core.mjs';
assert.equal(bank.length,100);assert.equal(new Set(bank.map(q=>q.id)).size,100);
for(const r of rounds){
 assert.equal(r.questions.length,20);
 for(let u=1;u<=5;u++){
  const qs=r.questions.filter(q=>q.unit===u);assert.equal(qs.length,4);
  for(const l of ['하','중','상'])assert(qs.some(q=>q.difficulty===l));
 }
 for(const [level,count] of [['하',6],['중',8],['상',6]]) assert.equal(r.questions.filter(q=>q.difficulty===level).length,count);
 for(const q of r.questions){
  assert(q.prompt&&q.explanation&&q.standardCodes.length);
  assert(isCorrect(q,q.answer));
  if(q.type==='choice') {assert.equal(q.options.length,5);assert.equal(new Set(q.options).size,5);assert.equal(q.options.filter(o=>o===q.answer).length,1);}
  else assert(numeric(q.answer)>=0);
  const safe=publicQuestion(q);assert(!('answer' in safe));assert(!('explanation' in safe));
 }
 const graph=r.questions.find(q=>q.diagram?.kind==='line').diagram;
 const deltas=graph.values.slice(1).map((v,i)=>Math.abs(v-graph.values[i]));
 assert.equal(deltas.filter(x=>x===Math.max(...deltas)).length,1,'graph maximum change must have a unique interval');
 const correct=Object.fromEntries(r.questions.map(q=>[q.id,q.answer]));
 assert.equal(grade(r.questions,correct).solved.length,20);
 const empty=grade(r.questions,{});assert.equal(empty.solved.length,0);assert.equal(Object.keys(empty.answers).length,20);assert(Object.values(empty.answers).every(v=>v===''));
 const partly=grade(r.questions,{[r.questions[0].id]:r.questions[0].answer});assert.equal(partly.solved.length,1);
 const blankRetry=grade(r.questions,{},partly);assert.deepEqual(blankRetry.solved,partly.solved);assert.equal(blankRetry.answers[r.questions[0].id],r.questions[0].answer);
 assert.equal(unitSummary(r.questions,empty,blankRetry).reduce((n,u)=>n+u.wrong,0),20);
}
assert.equal(normalizeNumber('01'),1);assert.equal(normalizeNumber('１'),1);
for(const value of ['','0','-1','1.1','1000','abc'])assert.throws(()=>normalizeNumber(value));
assert.equal(numeric('1 3/4'),1.75);assert(Number.isNaN(numeric('1/0')));assert(Number.isNaN(numeric('1e2')));
assert(isCorrect({type:'number',answer:'2/4'},'1/2'));assert(isCorrect({type:'number',answer:'1.20'},'1.2'));
const qs=rounds[0].questions,answers=Object.fromEntries(qs.map(q=>[q.id,q.answer]));
answers[qs[0].id]='0';answers[qs[4].id]=qs[4].options.find(x=>x!==qs[4].answer);
const first=grade(qs,answers);assert.equal(first.solved.length,18);
const latest=grade(qs,{[qs[0].id]:qs[0].answer,[qs[4].id]:answers[qs[4].id]},first);
assert.equal(first.solved.length,18);assert.equal(latest.solved.length,19);
const summary=unitSummary(qs,first,latest);assert.equal(summary[0].wrong,1);assert.equal(summary[0].remaining,0);assert.equal(summary[1].remaining,1);
const allCorrect=grade(qs,Object.fromEntries(qs.map(q=>[q.id,q.answer])));
const recs=Array.from({length:10},(_,i)=>({number:i+1,first:i<4?first:allCorrect,latest:i===0?first:allCorrect}));
const stats=questionStats(qs,recs);assert.equal(stats[0].rate,40);assert.equal(stats[0].remaining,1);assert.deepEqual(stats[0].wrongNumbers,[1,2,3,4]);
assert.equal(questionStats(qs,[])[0].rate,null);
assert.equal(unitSummary(qs,null,null).reduce((n,x)=>n+x.total,0),0);
console.log('PASS: 100 questions, 5 balanced rounds, unique graph answers, fractions, normalization, grading, retry immutability, 40% wrong-rate fixture, empty state, answer exclusion.');
