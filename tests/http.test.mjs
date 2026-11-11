import {spawn,spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
import {rounds} from '../lib/questions.mjs';
import {sha256} from '../lib/auth.mjs';
const cli='node_modules/wrangler/bin/wrangler.js';
const migrated=spawnSync(process.execPath,[cli,'d1','migrations','apply','DB','--local','--config','wrangler.json','--persist-to','.wrangler/state'],{stdio:'inherit',env:{...process.env,CI:'true'}});
assert.equal(migrated.status,0,'local migrations');
const password='ci-only-teacher-password-824615',origin='http://127.0.0.1:8787';
const child=spawn(process.execPath,[cli,'dev','--config','dist/server/wrangler.json','--local','--persist-to','.wrangler/state','--ip','127.0.0.1','--port','8787','--inspector-port','0','--var',`TEACHER_PASSWORD_SHA256:${await sha256(password)}`],{env:{...process.env,CI:'true'},stdio:['ignore','pipe','pipe']});
let log='';for(const stream of [child.stdout,child.stderr])stream.on('data',x=>{log=(log+x.toString()).slice(-24000);});
let teacherCookie='',studentCookie='';
async function request(op,data={},cookie='',status=200){const res=await fetch(origin+'/api/math',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...(cookie?{Cookie:cookie}:{})},body:JSON.stringify({op,...data})});const body=await res.json();assert.equal(res.status,status,JSON.stringify(body));return {body,cookie:res.headers.get('set-cookie')?.split(';')[0]};}
try{
 let ready=false;for(let i=0;i<90;i++){try{const res=await fetch(origin);if(res.ok){assert((await res.text()).includes('차곡차곡'));ready=true;break;}}catch{}if(child.exitCode!==null)break;await delay(1000);}
 assert(ready,'server readiness: '+log);
 const signIn=await fetch(origin+'/teacher');assert.equal(signIn.status,200);assert((await signIn.text()).includes('교사용 비밀번호'));
 await request('teacher',{},'',403);
 teacherCookie=(await request('teacherLogin',{password})).cookie;
 assert(teacherCookie,'teacher cookie');
 const cls=(await request('createClass',{label:'CI 테스트 학급'},teacherCookie)).body.classes.at(-1);
 studentCookie=(await request('login',{code:cls.code,number:'01'})).cookie;
 const initial=(await request('status',{},studentCookie)).body;
 assert.equal(initial.student.number,1);assert.equal(initial.rounds.length,5);
 for(const q of initial.rounds.flatMap(r=>r.questions)){assert(!('answer' in q));assert(!('explanation' in q));if(q.type==='choice')assert.equal(q.options.length,5);else assert(!q.options);}
 await request('teacher',{},studentCookie,403);
 const questions=rounds[0].questions;
 const answers=Object.fromEntries(questions.map(q=>[q.id,q.answer]));
 for(const q of questions.slice(0,4))answers[q.id]='0';
 const requestId=crypto.randomUUID();
 const submitted=(await request('submit',{round:1,revision:0,requestId,answers},studentCookie)).body;
 assert.equal(submitted.statuses[0].wrong.length,4);
 assert.equal(submitted.total[0].wrong,4);
 const repeated=(await request('submit',{round:1,revision:0,requestId,answers},studentCookie)).body;
 assert.equal(repeated.statuses[0].revision,1);
 const retry=Object.fromEntries(questions.slice(0,4).map((q,i)=>[q.id,i===3?'0':q.answer]));
 const retried=(await request('submit',{round:1,revision:1,requestId:crypto.randomUUID(),answers:retry},studentCookie)).body;
 assert.equal(retried.statuses[0].wrong.length,1);assert.equal(retried.total[0].wrong,4);assert.equal(retried.total[0].remaining,1);
 const emptyRound=(await request('submit',{round:2,revision:0,requestId:crypto.randomUUID(),answers:{}},studentCookie)).body;
 assert.equal(emptyRound.statuses[1].wrong.length,20);
 const oneFraction=rounds[1].questions[0];
 const blankRetry=(await request('submit',{round:2,revision:1,requestId:crypto.randomUUID(),answers:{[oneFraction.id]:'10/18'}},studentCookie)).body;
 assert.equal(blankRetry.statuses[1].wrong.length,19);
 const teacherData=(await request('teacher',{classId:cls.id},teacherCookie)).body;
 const emptyRec=teacherData.records.find(r=>r.number===1&&r.round===2);
 assert.equal(emptyRec.first.solved.length,0);assert.equal(emptyRec.latest.solved.length,1);
 assert.equal(emptyRec.first.answers[oneFraction.id],'');assert.equal(teacherData.analysis[1].questions[0].rate,100);
 const rec=teacherData.records.find(r=>r.number===1&&r.round===1);
 assert.equal(rec.first.solved.length*5,80);assert.equal(rec.latest.solved.length*5,95);assert.equal(rec.revision,2);
 assert.equal(teacherData.analysis[0].questions[0].rate,100);assert.equal(teacherData.analysis[0].questions[0].remaining,0);
 const rotated=(await request('rotate',{classId:cls.id},teacherCookie)).body;
 await request('status',{},studentCookie,401);
 studentCookie=(await request('login',{code:rotated.classes.find(c=>c.id===cls.id).code,number:'1'})).cookie;
 assert.equal((await request('status',{},studentCookie)).body.statuses[0].revision,2);
 console.log('PASS: production Worker HTTP flow, SSR, teacher authorization, student login, answer exclusion, grading, idempotency, retry, analytics, code rotation and record persistence.');
}catch(e){console.error(log);throw e;}finally{child.kill('SIGTERM');}
