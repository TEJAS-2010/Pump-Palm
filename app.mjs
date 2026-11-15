import { probeCalibration, validAdc, withProbeCalibration } from './calibration/probe-model.mjs';
import express from 'express';
import helmet from 'helmet';
import { randomBytes, randomUUID, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { makeEarth, catalog, external } from './earth.mjs';

export function makeApp({ query, prod, assetMiddleware, config }) {
  const derive = promisify(scrypt);
  const hash = value => createHash('sha256').update(value).digest('hex');
  const secret = () => randomBytes(32).toString('hex');
  const earth = makeEarth(query, config);
  const app = express();
  if(prod) app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet({contentSecurityPolicy:{directives:{
    imgSrc:["'self'",'data:','https://server.arcgisonline.com','https://*.tile.openstreetmap.org','https://tile.openstreetmap.org','https://gibs.earthdata.nasa.gov'],
    connectSrc:["'self'","https://api.open-meteo.com"],
    fontSrc:["'self'",'https://fonts.gstatic.com'],
    styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],
    upgradeInsecureRequests:prod?[]:null
  }}}));
  if (assetMiddleware) app.use(assetMiddleware);
  app.use('/api',express.json({limit:'128kb'}),(_req,res,next)=>{res.set('Cache-Control','no-store');next();});

  const period = 7*86400000;
  const attempts = new Map();
  function limited(key,max,windowMs) {
    const time=Date.now();
    if (attempts.size > 4000) {
      for (const [name, entry] of attempts) if (entry.until <= time) attempts.delete(name);
      if (attempts.size > 4000 && !attempts.has(key)) return true;
    }
    let entry=attempts.get(key);
    if(!entry || time>=entry.until){entry={n:0,until:time+windowMs};attempts.set(key,entry);}
    return ++entry.n>max;
  }


  const cookieOptions={httpOnly:true,sameSite:'strict',secure:prod,path:'/'};
  function cookie(req){return req.get('cookie')?.match(/(?:^|;\s*)pump_session=([a-f0-9]{64})(?:;|$)/)?.[1];}
  const bad=(res,status,code)=>res.status(status).json({error:code});
  async function auth(req,res,next){
    const token=cookie(req);
    if(!token)return bad(res,401,'signIn');
    const [row]=await query('SELECT accounts.id,accounts.email FROM sessions JOIN accounts ON accounts.id=sessions.owner WHERE sessions.token=? AND sessions.expires>?',[hash(token),Date.now()]);
    if(!row)return bad(res,401,'signIn');
    req.account=row;next();
  }
  async function fieldAccess(req,res,next){
    const [field]=await query('SELECT id,name,payload FROM fields WHERE id=? AND owner=?',[req.params.field,req.account.id]);
    if(!field)return bad(res,404,'missingField');
    req.field={...JSON.parse(field.payload),id:field.id,name:field.name};next();
  }
  async function password(value,salt){return (await derive(value,salt,64)).toString('hex');}
  async function startSession(res,owner){
    const token=secret();
    await query('DELETE FROM sessions WHERE expires<?',[Date.now()]);
    await query('INSERT INTO sessions(token,owner,expires) VALUES(?,?,?)',[hash(token),owner,Date.now()+period]);
    res.cookie('pump_session',token,{...cookieOptions,maxAge:period});
  }
  app.post('/api/auth/:mode',async(req,res)=>{
    const {mode}=req.params;
    if(mode!=='register'&&mode!=='login')return bad(res,404,'missing');
    if(limited('auth:'+req.ip,20,900000))return bad(res,429,'rate');
    const email=typeof req.body?.email==='string'?req.body.email.trim().toLowerCase():'';
    const pass=req.body?.password;
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||typeof pass!=='string'||pass.length<12||pass.length>128)return bad(res,400,'credentials');
    const [account]=await query('SELECT id,email,pass FROM accounts WHERE email=?',[email]);
    if(mode==='register'){
      if(account)return bad(res,409,'emailUsed');
      const id=randomUUID(),salt=secret();
      try{await query('INSERT INTO accounts(id,email,pass) VALUES(?,?,?)',[id,email,salt+':'+await password(pass,salt)]);}
      catch(error){if(error.code==='23505'||String(error.message).includes('UNIQUE constraint'))return bad(res,409,'emailUsed');throw error;}
      await startSession(res,id);return res.status(201).json({email});
    }
    const [salt,stored]=(account?.pass??'0'.repeat(64)+':'+ '0'.repeat(128)).split(':');
    const candidate=await password(pass,salt);
    if(!account||!timingSafeEqual(Buffer.from(candidate,'hex'),Buffer.from(stored,'hex')))return bad(res,401,'badLogin');
    await startSession(res,account.id);res.json({email});
  });
  app.post('/api/logout',async(req,res)=>{
    const token=cookie(req);
    if(token)await query('DELETE FROM sessions WHERE token=?',[hash(token)]);
    res.clearCookie('pump_session',cookieOptions);res.json({ok:true});
  });
  app.get('/api/me',auth,(req,res)=>res.json(req.account));
  app.get('/api/fields',auth,async(req,res)=>{
    const rows=await query('SELECT id,name,payload FROM fields WHERE owner=? ORDER BY name',[req.account.id]);
    res.json(rows.map(row=>({...JSON.parse(row.payload),id:row.id,name:row.name})));
  });
  const numberIn=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
  const optional=(value,min,max)=>value==null||numberIn(value,min,max);
  function fieldInput(body){
    if(!body||(body.name!=null&&(typeof body.name!=='string'||body.name.length>80))||!(/^[A-Z]{2}$/).test(body.country)||!numberIn(body.lat,-85,85)||!numberIn(body.lon,-180,180))return null;
    const polygon=body.polygon??[];
    if(!Array.isArray(polygon)||polygon.length>100||(polygon.length>0&&polygon.length<3)||polygon.some(point=>!Array.isArray(point)||point.length!==2||!numberIn(point[0],-85,85)||!numberIn(point[1],-180,180)))return null;
    if(!optional(body.ece,0,100)||!optional(body.soilEcLimit,0,100)||!optional(body.labEcLimit,0,100)||!optional(body.surfaceHeat,0,95)||!optional(body.dry,0,100)||!optional(body.wet,0,100)||!optional(body.maxEc,0,100)||!optional(body.eventLimit,0,1e8)||!optional(body.depth,0,300)||!optional(body.heat,0,65)||(body.dry!=null&&body.wet!=null&&body.dry>=body.wet))return null;
    const previous=Array.isArray(body.previous)?body.previous.slice(0,2).map(v=>String(v).trim().slice(0,50)):[];
    const crop=['palm','vegetables','other'].includes(body.crop)?body.crop:null;
    return {name:body.name?.trim()||'My field',country:body.country,lat:body.lat,lon:body.lon,polygon,previous,crop,
      ece:body.ece??null,soilEcLimit:body.soilEcLimit??null,labEcLimit:body.labEcLimit??null,surfaceHeat:body.surfaceHeat??null,dry:body.dry??null,wet:body.wet??null,maxEc:body.maxEc??null,eventLimit:body.eventLimit??null,depth:body.depth??null,heat:body.heat??null};
  }
  app.post('/api/fields',auth,async(req,res)=>{
    const input=fieldInput(req.body);
    if(!input)return bad(res,400,'invalidField');
    const rows=await query('SELECT id FROM fields WHERE owner=? LIMIT 50',[req.account.id]);
    if(rows.length>=50)return bad(res,400,'fieldLimit');
    const id=randomUUID();
    await query('INSERT INTO fields(id,owner,name,payload) VALUES(?,?,?,?)',[id,req.account.id,input.name,JSON.stringify(input)]);
    res.status(201).json({...input,id});
  });
  app.put('/api/fields/:field',auth,fieldAccess,async(req,res)=>{
    const input=fieldInput(req.body);
    if(!input)return bad(res,400,'invalidField');
    await query('UPDATE fields SET name=?,payload=? WHERE id=? AND owner=?',[input.name,JSON.stringify({...input,plan:req.field.plan??null}),req.field.id,req.account.id]);
    res.json({...input,plan:req.field.plan??null,id:req.field.id});
  });
  app.put('/api/fields/:field/plan',auth,fieldAccess,async(req,res)=>{
    const value=req.body??{};
    const numbers=['budget','base','legume','mixed'];
    if(!['water','cover','harvest'].includes(value.priority)||numbers.some(key=>!optional(value[key],0,1e6)))return bad(res,400,'invalidField');
    const plan={priority:value.priority,...Object.fromEntries(numbers.map(key=>[key,value[key]??null]))};
    const next={...req.field,plan};
    await query('UPDATE fields SET payload=? WHERE id=? AND owner=?',[JSON.stringify(next),req.field.id,req.account.id]);
    res.json(next);
  });
  app.get('/api/fields/:field/devices',auth,fieldAccess,async(req,res)=>{
    res.json(await query('SELECT id,label FROM devices WHERE field=? ORDER BY label',[req.field.id]));
  });
  app.post('/api/fields/:field/devices',auth,fieldAccess,async(req,res)=>{
    const label=typeof req.body?.label==='string'?req.body.label.trim().slice(0,65):'';
    if(!label)return bad(res,400,'deviceLabel');
    const rows=await query('SELECT id FROM devices WHERE field=? LIMIT 20',[req.field.id]);
    if(rows.length>=20)return bad(res,400,'deviceLimit');
    const token=secret(),id=randomUUID();
    await query('INSERT INTO devices(id,field,label,token) VALUES(?,?,?,?)',[id,req.field.id,label,hash(token)]);
    res.status(201).json({id,label,token});
  });
  app.post('/api/fields/:field/devices/:device/rotate',auth,fieldAccess,async(req,res)=>{
    const [device]=await query('SELECT id FROM devices WHERE id=? AND field=?',[req.params.device,req.field.id]);
    if(!device)return bad(res,404,'missing');
    const token=secret();
    await query('UPDATE devices SET token=? WHERE id=? AND field=?',[hash(token),device.id,req.field.id]);
    res.json({token});
  });
  function readingInput(body){
    if(!body||typeof body.timestamp!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{1,3})?)?(?:Z|[+-]\d\d:\d\d)$/.test(body.timestamp))return null;
    const time=Date.parse(body.timestamp);
    if(!Number.isFinite(time)||time>Date.now()+300000)return null;
    const value={timestamp:new Date(time).toISOString(),moisture_pct:body.moisture_pct??null,ecw_dsm:body.ecw_dsm??null,soil_ec_dsm:body.soil_ec_dsm??null,litres:body.litres??null,soil_temp_c:body.soil_temp_c??null};
    const raw = body.raw_adc;
    const calibration = body.probe_calibration;
    if ((raw != null && !validAdc(raw)) || (calibration != null && (raw == null || calibration !== probeCalibration.id))) return null;
    if (raw != null) value.raw_adc = raw;
    if (calibration != null) value.probe_calibration = calibration;
    if(Object.values(value).slice(1).every(v=>v===null)||!optional(value.moisture_pct,0,100)||!optional(value.ecw_dsm,0,100)||!optional(value.soil_ec_dsm,0,100)||!optional(value.litres,0,1e8)||!optional(value.soil_temp_c,-30,100))return null;
    return withProbeCalibration(value);
  }
  async function insertReading(device,value,origin){
    await query('INSERT INTO readings(device,stamp,received,payload) VALUES(?,?,?,?) ON CONFLICT(device,stamp) DO NOTHING',[device,value.timestamp,Date.now(),JSON.stringify({...value,origin})]);
  }
  app.post('/api/telemetry',async(req,res)=>{
    if(limited('ingest-ip:'+req.ip,600,60000))return bad(res,429,'rate');
    const token=req.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    if(!token)return bad(res,401,'deviceAuth');
    const key=hash(token);
    const [device]=await query('SELECT id FROM devices WHERE token=?',[key]);
    if(!device)return bad(res,401,'deviceAuth');
    if(limited('ingest-device:'+device.id,120,60000))return bad(res,429,'rate');
    const reading=readingInput(req.body);
    if(!reading)return bad(res,400,'reading');
    await insertReading(device.id,reading,'arduino');
    res.status(202).json({ok:true,timestamp:reading.timestamp});
  });
  app.post('/api/fields/:field/import',auth,fieldAccess,async(req,res)=>{
    const rows=req.body?.rows;
    if(!Array.isArray(rows)||!rows.length||rows.length>500)return bad(res,400,'reading');
    const parsed=rows.map(readingInput);
    if(parsed.some(value=>!value))return bad(res,400,'reading');
    const device='csv-'+req.field.id;
    await query('INSERT INTO devices(id,field,label,token) VALUES(?,?,?,?) ON CONFLICT(id) DO NOTHING',[device,req.field.id,'CSV',hash(secret())]);
    for(const reading of parsed)await insertReading(device,reading,'csv');
    res.json({count:parsed.length});
  });
  app.get('/api/fields/:field/readings',auth,fieldAccess,async(req,res)=>{
    const rows=await query('SELECT readings.payload,readings.received,devices.label,devices.id FROM readings JOIN devices ON readings.device=devices.id WHERE devices.field=? ORDER BY readings.stamp DESC LIMIT 250',[req.field.id]);
    res.json(rows.map(row=>({...JSON.parse(row.payload),received:Number(row.received),label:row.label,device:row.id})));
  });
  app.get('/api/tasks/smap-refresh',async(req,res)=>{
    const secret = config.CRON_SECRET;
    const authorization = req.get('authorization');
    if (!secret || !authorization || !timingSafeEqual(Buffer.from(hash(authorization)),Buffer.from(hash('Bearer '+secret)))) {
      return bad(res,401,'signIn');
    }
    await earth.refreshSmap({timeBudgetMs:42000});
    res.json({ok:true});
  });
  app.get('/api/catalog',auth,(_req,res)=>res.json({catalog,external}));
  app.get('/api/fields/:field/earth/:kind',auth,fieldAccess,async(req,res)=>{
    const {kind}=req.params;
    if(limited('earth:'+req.account.id,180,60000))return bad(res,429,'rate');
    if(kind==='forecast')return res.json(await earth.forecast(req.field));
    if(kind==='thermal')return res.json(await earth.thermal(req.field));
    if(kind==='power'||kind==='smap')return res.json(await earth.series(kind,req.field));
    if(!Object.hasOwn(catalog,kind))return bad(res,404,'missing');
    res.json(await earth.scenes(kind,req.field));
  });
  app.use('/api',(_req,res)=>bad(res,404,'missing'));

  app.use((error,_req,res,_next)=>{
    if(error.status===400||error.status===413)return bad(res,error.status,'invalidRequest');
    console.error(error.message);bad(res,500,'serverError');
  });
  return app;
}
