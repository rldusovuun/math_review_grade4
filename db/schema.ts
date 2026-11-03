import {integer, sqliteTable, text, uniqueIndex} from 'drizzle-orm/sqlite-core';
export const authLimits=sqliteTable('auth_limits',{key:text('key').primaryKey(),count:integer('count').notNull()});
export const classes = sqliteTable('classes', {
  id: text('id').primaryKey(), label:text('label').notNull(), code:text('code').notNull().unique(), revision:integer('revision').notNull().default(1), created:text('created').notNull()
});
export const sessions = sqliteTable('sessions', {
  token:text('token').primaryKey(), classId:text('class_id').notNull().references(()=>classes.id), number:integer('number').notNull(), revision:integer('revision').notNull(), expires:integer('expires').notNull()
});
export const attempts = sqliteTable('attempts', {
  id:text('id').primaryKey(), classId:text('class_id').notNull().references(()=>classes.id), number:integer('number').notNull(), round:integer('round').notNull(), revision:integer('revision').notNull(), requestId:text('request_id').notNull(), data:text('data').notNull(), created:text('created').notNull()
}, t=>[uniqueIndex('attempt_revision').on(t.classId,t.number,t.round,t.revision),uniqueIndex('attempt_request').on(t.classId,t.number,t.requestId)]);
