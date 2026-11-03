import {env} from 'cloudflare:workers';
import {verifyTeacherToken} from './auth.mjs';
import {cookies} from 'next/headers';
import {rounds} from './questions.mjs';
import {unitSummary} from './core.mjs';
export function db(): D1Database { if(!env.DB) throw new Error('학습 저장소를 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.'); return env.DB; }
export async function teacher() {
  return verifyTeacherToken((await cookies()).get('teacher_session')?.value, teacherSecret());
}
export function teacherSecret(){return (env as unknown as Record<string,string>).TEACHER_PASSWORD_SHA256;}
export async function hash(value:string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');
}
export async function student() {
  const token=(await cookies()).get('math_session')?.value;
  if(!token) return null;
  return db().prepare('SELECT s.class_id, s.number, c.label FROM sessions s JOIN classes c ON c.id=s.class_id WHERE s.token=? AND s.expires>? AND s.revision=c.revision').bind(await hash(token),Date.now()).first<{class_id:string,number:number,label:string}>();
}
export async function records(classId:string, number?:number) {
  const sql='SELECT * FROM attempts WHERE class_id=?'+(number ? ' AND number=?':'')+' ORDER BY revision ASC';
  const result=await db().prepare(sql).bind(...(number?[classId,number]:[classId])).all<any>();
  const groups=new Map<string,any>();
  for(const row of result.results) {
    const key=`${row.number}:${row.round}`;
    const data=JSON.parse(row.data);
    const prev=groups.get(key);
    if(!prev) groups.set(key,{number:row.number,round:row.round,first:data,latest:data,revision:row.revision,created:row.created,updated:row.created,history:[{...data,created:row.created}]});
    else { prev.latest=data;prev.revision=row.revision;prev.updated=row.created;prev.history.push({...data,created:row.created}); }
  }
  return [...groups.values()];
}
export function studentStatus(recs:any[]) {
  const statuses=rounds.map(r=>{
    const rec=recs.find(x=>x.round===r.id);
    return {round:r.id,revision:rec?.revision??0,wrong:rec?r.questions.filter(q=>!rec.latest.solved.includes(q.id)).map(q=>q.id):[],summary:unitSummary(r.questions,rec?.first,rec?.latest)};
  });
  const total=statuses[0].summary.map((item:any,i:number)=>({...item,total:statuses.reduce((n,s)=>n+s.summary[i].total,0),wrong:statuses.reduce((n,s)=>n+s.summary[i].wrong,0),remaining:statuses.reduce((n,s)=>n+s.summary[i].remaining,0)}));
  return {statuses,total};
}
