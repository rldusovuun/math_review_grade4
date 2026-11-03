import assert from 'node:assert/strict';
import {sha256,validPassword,issueTeacherToken,verifyTeacherToken} from '../lib/auth.mjs';
const password='test-only-long-password-123456',secret=await sha256(password),now=1793713200000;
assert(await validPassword(password,secret));assert(!await validPassword('incorrect-password-123',secret));assert(!await validPassword(password,undefined));
const token=await issueTeacherToken(secret,now);assert(await verifyTeacherToken(token,secret,now));assert(!await verifyTeacherToken(token,secret,now+8*3600000));assert(!await verifyTeacherToken(token+'x',secret,now));assert(!await verifyTeacherToken(token,await sha256('different'),now));assert(!await verifyTeacherToken(undefined,secret,now));
console.log('PASS: teacher password check, signed session, expiry, tampering, rotation, missing credentials.');
