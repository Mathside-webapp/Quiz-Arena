const cfg=window.QUIZARENA_CONFIG||{};
export const configured=Boolean(/^https:\/\//.test(cfg.supabaseUrl)&&cfg.supabaseAnonKey);
export const db=configured?window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}):null;
export async function rpc(name,args){if(!db)throw Error('QuizArena is awaiting setup. Follow the installation guide to connect Supabase.');const {data,error}=await db.rpc(name,args);if(error)throw error;return data;}
export async function query(q){const {data,error}=await q;if(error)throw error;return data;}
export async function user(){if(!db)return null;const {data,error}=await db.auth.getUser();if(error&&error.name!=='AuthSessionMissingError')throw error;return data?.user||null;}
export async function guest(){let u=await user();if(!u){const {data,error}=await db.auth.signInAnonymously();if(error)throw error;u=data.user;}return u;}
export const teacher=u=>Boolean(u&&!u.is_anonymous);
