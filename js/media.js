import {db} from './api.js';
const BUCKET='qa-question-images';
// Convert inline JPEG images to teacher-owned files in a public-read image bucket.
// Supabase credentials stay with the authenticated client; no secret key is used here.
export async function moveQuizImagesToStorage(questions,userId){
 for(const question of questions){
  if(!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(question.image||''))continue;
  const bytes=await (await fetch(question.image)).blob();
  if(bytes.size>500000)throw Error('Question picture is too large.');
  const filename=`${userId}/${crypto.randomUUID()}.jpg`;
  const {error}=await db.storage.from(BUCKET).upload(filename,bytes,{contentType:'image/jpeg',upsert:false,cacheControl:'3600'});
  if(error)throw Error('Question picture upload failed: '+error.message);
  const {data}=db.storage.from(BUCKET).getPublicUrl(filename);
  question.image=data.publicUrl;
 }
}
