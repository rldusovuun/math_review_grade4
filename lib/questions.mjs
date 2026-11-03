// Server-only question bank. Never import this module from a client component.
import {units} from './core.mjs';
const standards = [['4수01-15'],['4수03-08','4수03-09'],['4수01-12','4수01-13','4수01-14','4수01-16'],['4수03-03','4수03-10'],['4수04-02','4수04-03']];
const f = (n,d) => `${n}/${d}`;
const dec = n => (n / 100).toFixed(2);
const triangles = ['이등변삼각형','정삼각형','직각삼각형','둔각삼각형','예각삼각형'];
const quadNames = ['사다리꼴','평행사변형','마름모','직사각형','정사각형'];
const contexts = ['독서 시간','줄넘기 횟수','식물의 키','도서관 방문자 수','물통 속 물의 양'];
const graphUnits = ['분','회','cm','명','L'];
const labels = [['월','화','수','목','금'],['월','화','수','목','금'],['1주','2주','3주','4주','5주'],['월','화','수','목','금'],['1시','2시','3시','4시','5시']];
export const rounds = Array.from({length:5}, (_,r) => {
  const list = [];
  function add(unit, difficulty, prompt, answer, explanation, extra = {}) {
    list.push({id:`r${r+1}q${list.length+1}`,number:list.length+1,round:r+1,unit,difficulty,prompt,answer:String(answer),explanation,type:'number',standardCodes:standards[unit-1],...extra});
  }
  const extras = Array.from({length:5},(_,u) => ['하','중','중','중','상'][(u+r)%5]);
  const d = [7,9,11,8,12][r];
  add(1,'하',`${f(2,d)} + ${f(3,d)}의 값을 구하세요.`,f(5,d),`분모는 그대로 두고 분자끼리 더하면 ${f(5,d)}입니다.`,{unitLabel:''});
  add(1,'중',`${r+3} ${f(1,d)} − 1 ${f(4,d)}의 값을 구하세요.`,f((r+2)*d-3,d),`자연수 1을 ${f(d,d)}로 바꾸어 받아내림합니다. 결과는 ${f((r+2)*d-3,d)}입니다.`);
  const items=['리본','색종이 띠','끈','천','철사'];
  add(1,'상',`${items[r]} ${r+3}m에서 ${f(d-2,d)}m를 사용하고, 다시 1 ${f(3,d)}m를 사용했습니다. 남은 길이는 몇 m인가요?`,f((r+1)*d-1,d),`사용한 길이는 2 ${f(1,d)}m입니다. 전체에서 빼면 ${r} ${f(d-1,d)}m입니다.`,{unitLabel:'m'});
  const ef=extras[0];
  if(ef==='하') add(1,ef,`${f(d-1,d)} − ${f(2,d)}의 값을 구하세요.`,f(d-3,d),'분모가 같으므로 분자끼리 뺍니다.');
  else if(ef==='중') add(1,ef,`□ + ${f(3,d)} = 1 ${f(2,d)}입니다. □에 알맞은 수를 구하세요.`,f(d-1,d),`1 ${f(2,d)}에서 ${f(3,d)}을 빼면 ${f(d-1,d)}입니다.`);
  else add(1,ef,`물 ${r+2}L 중 오전에 ${f(4,d)}L를 마셨습니다. 오후에는 오전보다 ${f(1,d)}L 더 마셨습니다. 남은 물은 몇 L인가요?`,f((r+2)*d-9,d),`오후에 ${f(5,d)}L, 하루에 ${f(9,d)}L를 마셨으므로 전체에서 뺍니다.`,{unitLabel:'L'});

  const triLow=[['두 변의 길이가 5cm, 나머지 한 변의 길이가 6cm인 삼각형을 변의 길이에 따라 분류하면 무엇인가요?','이등변삼각형'],['세 변의 길이가 모두 7cm인 삼각형은 무엇인가요?','정삼각형'],['한 각이 직각인 삼각형은 무엇인가요?','직각삼각형'],['한 각의 크기가 110°인 삼각형을 각의 크기에 따라 분류하면 무엇인가요?','둔각삼각형'],['세 각이 모두 예각인 삼각형은 무엇인가요?','예각삼각형']][r];
  add(2,'하',...triLow,'변의 길이 또는 각의 크기에 따른 삼각형의 분류 기준을 적용합니다.',{type:'choice',options:triangles});
  const apex=[40,80,100,60,120][r];
  add(2,'중',`두 변의 길이가 같은 이등변삼각형입니다. 같은 두 변 사이의 각이 ${apex}°일 때, 나머지 두 각 중 한 각은 몇 도인가요?`,(180-apex)/2,`나머지 두 각의 크기가 같으므로 (180 − ${apex}) ÷ 2 = ${(180-apex)/2}°입니다.`,{unitLabel:'°',diagram:{kind:'triangle',apex}});
  const sum=[24,30,36,42,48][r],base=[6,8,10,12,14][r];
  add(2,'상',`이등변삼각형의 세 변의 길이의 합은 ${sum}cm입니다. 길이가 다른 한 변은 ${base}cm입니다. 길이가 같은 두 변 중 한 변은 몇 cm인가요?`,(sum-base)/2,`길이가 같은 두 변의 길이의 합은 ${sum-base}cm이므로 한 변은 ${(sum-base)/2}cm입니다.`,{unitLabel:'cm'});
  const et=extras[1];
  if(et==='하') add(2,et,'정삼각형의 세 각 중 한 각의 크기는 몇 도인가요?',60,'세 각이 모두 같고 합이 180°이므로 한 각은 60°입니다.',{unitLabel:'°'});
  else if(et==='중') add(2,et,`세 각의 크기가 ${[30,40,20,50,35][r]}°, ${[60,50,70,40,55][r]}°, 90°인 삼각형은 무엇인가요?`,'직각삼각형','한 각이 90°이므로 직각삼각형입니다.',{type:'choice',options:['예각삼각형','직각삼각형','둔각삼각형']});
  else add(2,et,'이등변삼각형의 한 각이 100°입니다. 가장 작은 각의 크기는 몇 도인가요?',40,'100°인 각이 두 개일 수 없으므로 나머지 같은 두 각은 각각 (180−100)÷2=40°입니다.',{unitLabel:'°'});

  const a=[124,235,346,457,568][r],b=[53,42,31,62,21][r];
  add(3,'하',`${dec(a)} + ${dec(b)}의 값을 구하세요.`,dec(a+b),'소수점의 자리를 맞추어 더합니다.');
  const c=[400,500,600,700,800][r],sub=[176,248,359,467,578][r];
  add(3,'중',`${dec(c)} − ${dec(sub)}의 값을 구하세요.`,dec(c-sub),'소수점의 자리를 맞춘 뒤 받아내림하여 뺍니다.');
  const start=[450,560,670,780,890][r],use=[135,146,157,168,179][r],diff=[25,35,45,55,65][r];
  add(3,'상',`주스가 ${dec(start)}L 있습니다. 첫날 ${dec(use)}L를 마시고, 둘째 날에는 첫날보다 ${dec(diff)}L 더 마셨습니다. 남은 주스는 몇 L인가요?`,dec(start-2*use-diff),`둘째 날에는 ${dec(use+diff)}L를 마셨습니다. ${dec(start)} − ${dec(use)} − ${dec(use+diff)} = ${dec(start-2*use-diff)}L입니다.`,{unitLabel:'L'});
  const ed=extras[2];
  if(ed==='하') add(3,ed,`${r+2}.47에서 숫자 4가 나타내는 수는 얼마인가요?`,'0.4','4는 소수 첫째 자리이므로 0.4를 나타냅니다.');
  else if(ed==='중') add(3,ed,`□ − ${dec(a)} = ${dec(b)}입니다. □에 알맞은 수를 구하세요.`,dec(a+b),`빼는 수와 차를 더하면 ${dec(a+b)}입니다.`);
  else add(3,ed,`길이 ${dec(start)}m인 끈에서 ${dec(use)}m와 ${dec(use+diff)}m를 잘랐습니다. 남은 끈은 2m보다 몇 m 더 긴가요?`,dec(start-2*use-diff-200),`남은 길이 ${dec(start-2*use-diff)}m에서 2m를 빼면 ${dec(start-2*use-diff-200)}m입니다.`,{unitLabel:'m'});

  const quadLow=[['두 직선이 만나서 이루는 각이 직각일 때, 두 직선은 어떤 관계인가요?','수직',['수직','평행']],['아무리 늘여도 만나지 않는 한 평면 위의 두 직선은 어떤 관계인가요?','평행',['수직','평행']],['마주 보는 두 쌍의 변이 각각 평행한 사각형을 무엇이라고 하나요?','평행사변형',quadNames],['네 변의 길이가 모두 같은 사각형을 무엇이라고 하나요?','마름모',['사다리꼴','평행사변형','마름모','직사각형']],['네 각이 모두 직각인 사각형을 무엇이라고 하나요?','직사각형',['사다리꼴','평행사변형','마름모','직사각형']]][r];
  add(4,'하',quadLow[0],quadLow[1],'수직·평행 또는 사각형의 정의를 적용합니다.',{type:'choice',options:quadLow[2]});
  const side=5+r;
  add(4,'중',`그림의 도형은 평행사변형입니다. 위쪽 변이 ${side}cm일 때 마주 보는 아래쪽 변은 몇 cm인가요?`,side,'평행사변형은 마주 보는 두 변의 길이가 같습니다.',{unitLabel:'cm',diagram:{kind:'parallelogram',top:side}});
  const total=28+r*4;
  add(4,'상',`마름모의 네 변의 길이를 모두 더하면 ${total}cm입니다. 정사각형의 한 변은 이 마름모의 한 변보다 2cm 깁니다. 정사각형의 한 변은 몇 cm인가요?`,total/4+2,`마름모의 한 변은 ${total} ÷ 4 = ${total/4}cm이므로 정사각형의 한 변은 ${total/4+2}cm입니다.`,{unitLabel:'cm'});
  const eq=extras[3];
  if(eq==='하') add(4,eq,'평행한 변이 적어도 한 쌍 있는 사각형을 무엇이라고 하나요?','사다리꼴', '평행한 변이 적어도 한 쌍 있는 사각형은 사다리꼴입니다.',{type:'choice',options:quadNames});
  else if(eq==='중') add(4,eq,`직사각형의 가로가 ${8+r}cm, 세로가 ${3+r}cm입니다. 네 변의 길이를 모두 더하면 몇 cm인가요?`,2*(11+2*r),'마주 보는 두 변의 길이가 같으므로 가로 두 개와 세로 두 개를 더합니다.',{unitLabel:'cm',diagram:{kind:'rectangle',width:8+r,height:3+r}});
  else add(4,eq,`평행사변형의 네 변의 길이의 합은 ${36+4*r}cm입니다. 한 변의 길이가 ${12+r}cm일 때, 그 변과 이웃한 변은 몇 cm인가요?`,6+r,`마주 보는 두 변의 길이가 같으므로 (${36+4*r} − ${2*(12+r)}) ÷ 2 = ${6+r}cm입니다.`,{unitLabel:'cm'});

  const values=[[20,30,25,45,40],[30,50,40,70,60],[10,15,25,30,45],[20,40,30,60,50],[50,40,45,25,30]][r];
  const diagram={kind:'line',title:contexts[r],labels:labels[r],values,unit:graphUnits[r],max:r===1?80:60,step:r===1?20:10};
  add(5,'하',`꺾은선그래프에서 ${labels[r][2]}의 ${contexts[r]}은 얼마인가요?`,values[2],`가로축의 ${labels[r][2]}에 해당하는 점을 읽으면 ${values[2]}${graphUnits[r]}입니다.`,{diagram,unitLabel:graphUnits[r]});
  add(5,'중',`그래프에서 가장 큰 값과 가장 작은 값의 차는 얼마인가요?`,Math.max(...values)-Math.min(...values),'그래프의 가장 큰 값에서 가장 작은 값을 뺍니다.',{diagram,unitLabel:graphUnits[r]});
  const changes=values.slice(1).map((v,i)=>Math.abs(v-values[i])), maxChange=Math.max(...changes),idx=changes.indexOf(maxChange);
  const periods=values.slice(1).map((v,i)=>`${labels[r][i]}~${labels[r][i+1]}`);
  add(5,'상','서로 이웃한 두 시점 사이에서 증가하거나 감소한 양이 가장 큰 구간은 어디인가요?',periods[idx],`각 구간의 변화량은 ${changes.join(', ')}${graphUnits[r]}입니다. 가장 큰 ${maxChange}${graphUnits[r]}의 변화가 있는 구간을 고릅니다.`,{type:'choice',options:periods,diagram});
  const eg=extras[4];
  if(eg==='하') add(5,eg,`이 그래프의 세로축에서 표시된 숫자 사이 큰 눈금 한 칸은 얼마를 나타내나요?`,diagram.step,`세로축의 이웃한 표시값의 차는 ${diagram.step}${graphUnits[r]}입니다.`,{diagram,unitLabel:graphUnits[r]});
  else if(eg==='중') add(5,eg,`마지막 시점의 값은 첫 시점의 값보다 얼마나 ${values[4]>values[0]?'큰가요':'작은가요'}?`,Math.abs(values[4]-values[0]),'첫 시점과 마지막 시점의 값을 읽고 큰 값에서 작은 값을 뺍니다.',{diagram,unitLabel:graphUnits[r]});
  else add(5,eg,`다음 시점의 값이 마지막 시점보다 ${5+r}만큼 증가한다고 예상합니다. 예상한 값은 첫 시점의 값보다 얼마나 큰가요?`,values[4]+5+r-values[0],`예상값 ${values[4]+5+r}에서 첫 값 ${values[0]}을 뺍니다.`,{diagram,unitLabel:graphUnits[r]});
  return {id:r+1,title:['첫걸음 다지기','개념을 연결해요','생각을 넓혀요','실력을 쌓아요','복습을 완성해요'][r],questions:list};
});
export const bank = rounds.flatMap(r=>r.questions);
