import {teacher} from '../../lib/server';
import TeacherLogin from './login';
import Teacher from './teacher';
export const dynamic='force-dynamic';
export default async function Page(){return await teacher()?<Teacher/>:<TeacherLogin/>;}
