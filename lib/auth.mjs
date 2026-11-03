const enc=new TextEncoder();
export async function sha256(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function validPassword(password,expected){
 if(typeof password!=='string'||password.length<16||password.length>256||!/^[a-f0-9]{64}$/.test(expected??''))return false;
 const actual=await sha256(password);let diff=0;for(let i=0;i<64;i++)diff|=actual.charCodeAt(i)^expected.charCodeAt(i);return diff===0;
}
async function key(secret){return crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
function hex(bytes){return Array.from(new Uint8Array(bytes)).map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function issueTeacherToken(secret,now=Date.now()){
 const payload=`${now+8*3600000}.${crypto.randomUUID()}`;
 return payload+'.'+hex(await crypto.subtle.sign('HMAC',await key(secret),enc.encode(payload)));
}
export async function verifyTeacherToken(token,secret,now=Date.now()){
 if(!/^[a-f0-9]{64}$/.test(secret??'')||typeof token!=='string')return false;
 const parts=token.split('.');if(parts.length!==3||!/^\d+$/.test(parts[0])||!/^[a-f0-9-]{36}$/.test(parts[1])||!/^[a-f0-9]{64}$/.test(parts[2]))return false;
 if(+parts[0]<=now||+parts[0]>now+8*3600000)return false;
 const signature=Uint8Array.from(parts[2].match(/../g),x=>parseInt(x,16));
 return crypto.subtle.verify('HMAC',await key(secret),signature,enc.encode(parts.slice(0,2).join('.')));
}
