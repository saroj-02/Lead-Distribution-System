export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  try{
    const { name, email, message } = req.body;
    if(!message || message.trim().length < 5) return res.status(400).json({error:'Message too short'});

    // For now, just log feedback — later we can persist to DB or send an email
    console.log('Feedback received:', { name, email, message, time: new Date().toISOString() });

    return res.status(200).json({ok:true});
  }catch(err){
    console.error('Feedback error', err);
    return res.status(500).json({error:'Server error'});
  }
}
