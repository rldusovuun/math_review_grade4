// Server-only: preserve choices and add unambiguously incorrect distractors.
export function fiveOptions(q) {
 const options=[...q.options];
 const additions=q.unit===2?['정삼각형','이등변삼각형']:
 q.unit===4?(options.length===2?['일치','직각이 아닌 각으로 만남','꼬인 위치']:['오각형','삼각형']):['모든 구간의 변화량이 같다'];
 for(const value of additions)if(options.length<5&&!options.includes(value))options.push(value);
 if(options.length!==5||new Set(options).size!==5)throw new Error('Expected five distinct options: '+q.id);
 return options;
}
