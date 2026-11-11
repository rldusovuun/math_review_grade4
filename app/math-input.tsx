'use client';
import {useState} from 'react';
export function MathText({text}:{text:string}) {
  const parts=String(text??'').split(/((?:\d+\s+)?\d+\s*\/\s*\d+)/g);
  return <>{parts.map((part,i)=>{
    const match=part.match(/^(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);
    if(!match)return part;
    const [,whole,numerator,denominator]=match;
    return <span key={i} className="math-expression" role="math" aria-label={`${whole?whole+'과 ':''}${denominator}분의 ${numerator}`}>
      {whole&&<span aria-hidden="true">{whole}</span>}
      <span className="stacked-fraction" aria-hidden="true"><span>{numerator}</span><span>{denominator}</span></span>
    </span>;
  })}</>;
}
export function FractionInput({number,initialValue='',onChange}:{number:number,initialValue?:string,onChange:(value:string)=>void}) {
  const initial=initialValue.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  const [whole,setWhole]=useState(initial?.[1]??(initial?'':initialValue)),[top,setTop]=useState(initial?.[2]??''),[bottom,setBottom]=useState(initial?.[3]??'');
  function change(part:'whole'|'top'|'bottom',value:string){
    if(!/^\d*$/.test(value))return;
    const w=part==='whole'?value:whole,n=part==='top'?value:top,d=part==='bottom'?value:bottom;
    if(part==='whole')setWhole(value);else if(part==='top')setTop(value);else setBottom(value);
    onChange(n&&d&&Number(d)>0?`${w?w+' ':''}${n}/${d}`:!n&&!d?w:'');
  }
  return <fieldset className="fraction-answer"><legend>{number}번 답 · 수식 입력</legend>
    <div className="fraction-editor">
      <label>자연수<input aria-label={`${number}번 자연수 부분`} inputMode="numeric" autoComplete="off" placeholder="선택" maxLength={4} value={whole} onChange={e=>change('whole',e.target.value)}/></label>
      <div className="fraction-fields">
        <label><span className="sr-only">분자</span><input aria-label={`${number}번 분자`} inputMode="numeric" autoComplete="off" placeholder="분자" maxLength={4} value={top} onChange={e=>change('top',e.target.value)}/></label>
        <label><span className="sr-only">분모</span><input aria-label={`${number}번 분모`} inputMode="numeric" autoComplete="off" placeholder="분모" maxLength={4} value={bottom} onChange={e=>change('bottom',e.target.value)}/></label>
      </div>
    </div>
    <small>{(top||bottom)&&(!top||!bottom||Number(bottom)===0)?'분자와 0이 아닌 분모를 모두 입력해 주세요. 미완성 답안은 미응답으로 제출됩니다.':'대분수는 자연수 부분도 입력해요. 자연수로 답할 때는 자연수 칸만 채워요.'}</small>
  </fieldset>;
}
