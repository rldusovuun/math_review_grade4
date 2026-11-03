import {readFileSync,writeFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('wrangler.json','utf8').replace(/^\uFEFF/,''));
const id=process.env.CLOUDFLARE_D1_DATABASE_ID;
if(id){if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw new Error('CLOUDFLARE_D1_DATABASE_ID must be a D1 UUID.');config.d1_databases[0].database_id=id;writeFileSync('wrangler.json',JSON.stringify(config,null,2)+'\n');}
if(process.argv.includes('--production')&&config.d1_databases[0].database_id==='00000000-0000-4000-8000-000000000000')throw new Error('Create D1 and set CLOUDFLARE_D1_DATABASE_ID before deployment.');
if(process.argv.includes('--production')&&(!process.env.TEACHER_PASSWORD||process.env.TEACHER_PASSWORD.length<16||process.env.TEACHER_PASSWORD.length>256))throw new Error('Set TEACHER_PASSWORD to a 16–256 character password in GitHub Secrets.');
console.log('Cloudflare configuration checked.');
