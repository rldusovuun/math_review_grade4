'use client';
export async function api(op:string, data:object={}) {const res=await fetch('/api/math',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({op,...data})});const result=await res.json();if(!res.ok) throw new Error(result.error||'연결을 확인해 주세요.');return result;}
export function Header({teacher=false}:{teacher?:boolean}){return <header><a className="brand" href="/"><span className="brand-icon">▦</span> 차곡차곡 <b>수학</b></a><nav><span className="nav-tag">4학년 · 2학기</span><a href={teacher?'/':'/teacher'}>{teacher?'학생 화면 ↗':'교사 공간 ↗'}</a></nav></header>;}
export function Diagram({data:d}:{data:any}) {
  if(!d)return null;
  if(d.kind==='line') {
    const y=(v:number)=>180-v/d.max*140;
    return <figure><figcaption>{d.title} <small>({d.unit})</small></figcaption><svg viewBox="0 0 360 225" role="img" aria-label={`${d.title} 꺾은선그래프. ${d.labels.map((l:string,i:number)=>`${l} ${d.values[i]}${d.unit}`).join(', ')}`}>
      {Array.from({length:d.max/d.step+1},(_,i)=>i*d.step).map(v=><g key={v}><line x1="42" x2="330" y1={y(v)} y2={y(v)} stroke="#dae2df"/><text x="30" y={y(v)+4} textAnchor="end">{v}</text></g>)}
      <path d="M42 35V180H335" fill="none" stroke="#7f9290"/><polyline points={d.values.map((v:number,i:number)=>`${50+i*68},${y(v)}`).join(' ')} fill="none" stroke="#208471" strokeWidth="3"/>
      {d.values.map((v:number,i:number)=><g key={i}><circle cx={50+i*68} cy={y(v)} r="4" fill="#208471"/><text x={50+i*68} y="203" textAnchor="middle">{d.labels[i]}</text></g>)}
    </svg></figure>;
  }
  if(d.kind==='triangle') {const half=90*Math.tan(d.apex*Math.PI/360);return <figure><svg viewBox="0 0 360 180" role="img" aria-label={`같은 두 변 사이의 각이 ${d.apex}도인 이등변삼각형`}><polygon points={`180,35 ${180-half},125 ${180+half},125`} fill="#e1f0ea" stroke="#208471" strokeWidth="2.5"/><text x="180" y="66" textAnchor="middle">{d.apex}°</text><text x="180" y="155" textAnchor="middle">양쪽 빗변의 길이가 같아요</text></svg></figure>;}
  return <figure><svg viewBox="0 0 360 170" role="img" aria-label={d.kind==='rectangle'?`가로 ${d.width}cm, 세로 ${d.height}cm인 직사각형`:`위쪽 변 ${d.top}cm인 평행사변형`}><polygon points={d.kind==='rectangle'?'80,45 280,45 280,130 80,130':'100,45 290,45 250,130 60,130'} fill="#e1f0ea" stroke="#208471" strokeWidth="2.5"/><text x="190" y="30" textAnchor="middle">{d.top??d.width} cm</text><text x={d.kind==='rectangle'?310:155} y={d.kind==='rectangle'?95:153} textAnchor="middle">{d.kind==='rectangle'?`${d.height} cm`:'? cm'}</text></svg></figure>;
}
export function Summary({rows,title}:{rows:any[],title:string}) {
  const max=Math.max(...rows.map(x=>x.wrong));const done=rows.reduce((n,x)=>n+x.total,0);const leaders=rows.filter(x=>x.wrong===max).map(x=>`${x.unit}단원 ${x.title}`).join(', ');
  return <section className="summary"><div className="section-head"><h3>{title}</h3><span className="eyebrow">나의 복습 지도</span></div><p className="summary-message">{!done?'학습을 제출하면 복습할 단원을 알려드려요.':max?<>조금 더 살펴볼 단원은 <strong>{leaders}</strong>이에요.</>:'첫 도전에서 모든 문제를 맞혔어요. 멋진 출발이에요!'}</p><div className="unit-stats">{rows.map(x=><div key={x.unit}><span>{x.unit}단원</span><b>{x.title}</b><div className="bar"><i style={{width:`${x.total?x.wrong/x.total*100:0}%`}}/></div><small>처음 틀린 문제 {x.wrong} / {x.total} · 남은 오답 {x.remaining}</small></div>)}</div><small className="muted">처음 제출한 결과로 비교해요. 다시 풀면 남은 오답 수가 줄어들어요.</small></section>;
}
