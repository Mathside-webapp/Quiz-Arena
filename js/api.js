const cfg=window.QUIZARENA_CONFIG||{};
export const configured=Boolean(/^https:\/\//.test(cfg.supabaseUrl)&&cfg.supabaseAnonKey);
export const db=configured?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
export async function rpc(name,args){if(!db)throw Error('QuizArena is awaiting setup. Follow the installation guide to connect Supabase.');const {data,error}=await db.rpc(name,args);if(error)throw error;return data;}
export async function query(q){const {data,error}=await q;if(error)throw error;return data;}
export async function user(){if(!db)return null;const {data,error}=await db.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;return data?.user||null;}
export async function guest(){
  if(!db)throw Error('QuizArena is not connected to Supabase yet. Ask your teacher to complete the site setup.');
  let u=await user();
  if(u)return u;
  const {data,error}=await db.auth.signInAnonymously();
  if(error){
    const message=String(error.message||'Anonymous sign-in failed');
    // A host's "Allow anonymous players" switch controls a game, but it cannot
    // enable the Supabase Authentication provider for the project.
    if(/anonymous|signup(s)?(?: are)? disabled|sign.?ups? not allowed|provider.*disabled/i.test(message)){
      throw Error('Guest entry is not enabled in QuizArena Supabase. Teacher: open Authentication > Sign In / Providers and enable Allow anonymous sign-ins. Then try again. ('+message+')');
    }
    if(/captcha/i.test(message))throw Error('Guest sign-in was blocked by Supabase CAPTCHA settings. Ask your teacher to check the Authentication security settings. ('+message+')');
    throw Error('Unable to join as a guest: '+message);
  }
  if(!data?.user||!data?.session)throw Error('Supabase did not return a guest session. Ask your teacher to check QuizArena Authentication settings.');
  return data.user;
}
export const teacher=u=>Boolean(u&&!u.is_anonymous);
