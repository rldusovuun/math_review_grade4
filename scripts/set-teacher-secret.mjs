import {spawn} from 'node:child_process';
import {sha256} from '../lib/auth.mjs';
const password=process.env.TEACHER_PASSWORD;
if(!password||password.length<16||password.length>256)throw new Error('TEACHER_PASSWORD must be 16–256 characters.');
const env={...process.env};delete env.TEACHER_PASSWORD;
const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','put','TEACHER_PASSWORD_SHA256','--config','dist/server/wrangler.json'],{env,stdio:['pipe','inherit','inherit']});
child.stdin.end(await sha256(password)+'\n');
child.on('error',()=>{console.error('Could not start Wrangler.');process.exitCode=1;});
child.on('close',code=>{process.exitCode=code??1;});
