import {NextResponse} from 'next/server';
import {db,teacher,teacherSecret,student,records,studentStatus,hash} from '../../../lib/server';
import {validPassword,issueTeacherToken} from '../../../lib/auth.mjs';
import {rounds} from '../../../lib/questions.mjs';
import {normalizeNumber,grade,publicQuestion,questionStats} from '../../../lib/core.mjs';
export const dynamic='force-dynamic';
function response(data:any,status=200) {return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});}
function code() {return Array.from(crypto.getRandomValues(new Uint8Array(8))).map(x=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x%31]).join('');}
export async function POST(req:Request) {
  try {
    if(req.headers.get('origin')!==new URL(req.url).origin || !req.headers.get('content-type')?.includes('application/json')) return response({error:'허용되지 않은 요청입니다.'},403);
    if(Number(req.headers.get('content-length')??0)>20000) return response({error:'요청이 너무 큽니다.'},413);
    const raw=await req.text();if(raw.length>20000) return response({error:'요청이 너무 큽니다.'},413);
    const body=JSON.parse(raw),op=body.op;
    if(op==='teacherLogin') {
      if(!teacherSecret())return response({error:'교사용 비밀번호가 아직 설정되지 않았습니다. 배포 안내를 확인해 주세요.'},503);
      const ipHash=await hash(req.headers.get('cf-connecting-ip')??'local');
      const bucket=Math.floor(Date.now()/900000),limitKey=ipHash+':'+bucket;
      const limit=await db().prepare('INSERT INTO auth_limits(key,count) VALUES (?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(limitKey).first<{count:number}>();
      if((limit?.count??99)>10)return response({error:'로그인 시도가 많습니다. 15분 후 다시 시도해 주세요.'},429);
      if(!await validPassword(body.password,teacherSecret()))return response({error:'교사용 비밀번호를 확인해 주세요.'},401);
      const res=response({ok:true});res.cookies.set('teacher_session',await issueTeacherToken(teacherSecret()),{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'strict',path:'/',maxAge:8*3600});return res;
    }
    if(op==='teacherLogout'){const res=response({ok:true});res.cookies.set('teacher_session','',{path:'/',maxAge:0});return res;}
    if(op==='login') {
      const classCode=String(body.code??'').trim().toUpperCase();
      const number=normalizeNumber(body.number);
      if(!/^[A-Z2-9]{8}$/.test(classCode)) return response({error:'학급 코드를 확인해 주세요.'},400);
      const c=await db().prepare('SELECT * FROM classes WHERE code=?').bind(classCode).first<any>();
      if(!c) return response({error:'학급 코드를 확인해 주세요.'},400);
      const token=crypto.randomUUID()+crypto.randomUUID();
      await db().prepare('INSERT INTO sessions(token,class_id,number,revision,expires) VALUES (?,?,?,?,?)').bind(await hash(token),c.id,number,c.revision,Date.now()+7*86400000).run();
      const res=response({ok:true});res.cookies.set('math_session',token,{httpOnly:true,secure:new URL(req.url).protocol==='https:',sameSite:'strict',path:'/',maxAge:7*86400});return res;
    }
    if(op==='logout') {const res=response({ok:true});res.cookies.set('math_session','',{path:'/',maxAge:0});return res;}
    if(['teacher','createClass','rotate'].includes(op)) {
      if(!await teacher()) return response({error:'교사 계정으로 로그인해 주세요.'},403);
      if(op==='createClass') {
        const label=String(body.label??'').trim();if(!label||label.length>40) return response({error:'학급 표시명을 1~40자로 입력해 주세요.'},400);
        await db().prepare('INSERT INTO classes(id,label,code,created) VALUES (?,?,?,?)').bind(crypto.randomUUID(),label,code(),new Date().toISOString()).run();
      }
      if(op==='rotate') await db().prepare('UPDATE classes SET code=?,revision=revision+1 WHERE id=?').bind(code(),body.classId).run();
      const classes=(await db().prepare('SELECT * FROM classes ORDER BY created').all()).results;
      const selected=classes.find((c:any)=>c.id===body.classId)??classes[0];
      const recs=selected?await records(String(selected.id)):[];
      return response({classes,selected:selected?.id??null,records:recs,analysis:rounds.map(r=>({id:r.id,questions:questionStats(r.questions,recs.filter(x=>x.round===r.id))}))});
    }
    const st=await student();if(!st) return response({error:'학급 코드와 번호로 다시 접속해 주세요.'},401);
    if(op==='status') return response({student:{number:st.number,label:st.label},...studentStatus(await records(st.class_id,st.number)),rounds:rounds.map(r=>({...r,questions:r.questions.map(publicQuestion)}))});
    if(op==='submit') {
      const round=rounds.find(r=>r.id===body.round);if(!round) return response({error:'회차를 확인해 주세요.'},400);
      if(typeof body.requestId!=='string'||!/^[a-f0-9-]{36}$/.test(body.requestId)) return response({error:'요청 번호가 올바르지 않습니다.'},400);
      const duplicate=await db().prepare('SELECT id FROM attempts WHERE class_id=? AND number=? AND request_id=?').bind(st.class_id,st.number,body.requestId).first();
      if(duplicate) return response({ok:true,...studentStatus(await records(st.class_id,st.number))});
      const recs=await records(st.class_id,st.number),rec=recs.find(r=>r.round===body.round);
      const revision=rec?.revision??0;
      if(body.revision!==revision) return response({error:'다른 화면에서 제출된 기록이 있습니다. 새로고침 후 다시 확인해 주세요.'},409);
      if(!body.answers||typeof body.answers!=='object') return response({error:'답안을 입력해 주세요.'},400);
      const data=grade(round.questions,body.answers,rec?.latest??null);
      try {await db().prepare('INSERT INTO attempts(id,class_id,number,round,revision,request_id,data,created) VALUES (?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),st.class_id,st.number,round.id,revision+1,body.requestId,JSON.stringify(data),new Date().toISOString()).run();}
      catch {return response({error:'제출 상태가 변경되었습니다. 새로고침하여 결과를 확인해 주세요.'},409);}
      return response({ok:true,...studentStatus(await records(st.class_id,st.number))});
    }
    return response({error:'지원하지 않는 요청입니다.'},400);
  } catch(e) {console.error('math request failed',e);return response({error:e instanceof Error && /입력|문제|보기|숫자|분수|해결/.test(e.message)?e.message:'처리하지 못했습니다. 입력한 답은 유지됩니다. 잠시 후 다시 시도해 주세요.'},400);}
}
