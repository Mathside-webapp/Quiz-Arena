const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
(async()=>{
  const uploads=[];
  const mockDb={storage:{from(bucket){assert.equal(bucket,'qa-question-images');return {async upload(name,blob,opt){uploads.push({name,blob,opt});return {error:null};},getPublicUrl(name){return {data:{publicUrl:'https://cdn.example.test/'+name}};}};}}};
  const source=fs.readFileSync(path.join(__dirname,'../js/media.js'),'utf8')
    .replace("import {db} from './api.js';",'')
    .replace('export async function moveQuizImagesToStorage','async function moveQuizImagesToStorage');
  const ctx=vm.createContext({db:mockDb,fetch,crypto:require('node:crypto').webcrypto,Error,console});
  vm.runInContext(source+'\nthis.run=moveQuizImagesToStorage;',ctx);
  const data='data:image/jpeg;base64,'+Buffer.from('fake JPEG bytes').toString('base64');
  const qs=[{image:data},{image:'https://existing-image.test/example.jpg'},{image:''}];
  await ctx.run(qs,'teacher_123');
  assert.equal(uploads.length,1);
  assert.ok(uploads[0].name.startsWith('teacher_123/'));
  assert.ok(uploads[0].name.endsWith('.jpg'));
  assert.equal(uploads[0].opt.contentType,'image/jpeg');
  assert.ok(qs[0].image.startsWith('https://cdn.example.test/teacher_123/'));
  assert.equal(qs[1].image,'https://existing-image.test/example.jpg');
  console.log('PASS: question pictures are uploaded once under teacher folder and replaced with a URL; existing links are untouched.');
})().catch(e=>{console.error(e);process.exit(1)});
