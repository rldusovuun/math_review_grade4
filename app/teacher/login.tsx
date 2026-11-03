'use client';
import {useState} from 'react';
import {Header,api} from '../components';
export default function TeacherLogin(){
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  async function submit(e:React.FormEvent){
    e.preventDefault();setError('');setBusy(true);
    try{await api('teacherLogin',{password});location.assign('/teacher');}
    catch(e){setError((e as Error).message);setBusy(false);}
  }
  return <><Header teacher/><main><section className="login-card" style={{maxWidth:480,margin:'70px auto'}}>
    <span className="eyebrow">TEACHER'S DESK</span><h1 style={{fontSize:30}}>교사 공간</h1>
    <p className="muted">교사용 비밀번호로 학급 기록을 확인하세요.</p>
    <form style={{display:'block'}} onSubmit={submit}>
      <label>교사용 비밀번호<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={16} maxLength={256}/></label>
      {error&&<p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy} style={{width:'100%',marginTop:20}}>{busy?'확인 중…':'교사 로그인 →'}</button>
    </form><small>학생은 첫 화면에서 학급 코드와 번호로 입장합니다.</small>
  </section></main></>;
}
