import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import Fc from '@alicloud/fc20230330';
import OpenApi from '@alicloud/openapi-client';
import OSS from 'ali-oss';

const [action,configPath]=process.argv.slice(2);
if(!configPath)throw new Error('Usage: cloud.mjs preflight|deploy|domain <private-deploy.json>');
const local=JSON.parse(fs.readFileSync(configPath));
const aliyun=JSON.parse(fs.readFileSync(path.join(os.homedir(),'.aliyun/config.json')));
const profile=aliyun.profiles.find(p=>p.name===(process.env.ALIYUN_PROFILE||aliyun.current));
if(!profile?.access_key_id || !profile?.access_key_secret)throw new Error('An existing Aliyun CLI AccessKey profile is required');
const Client=Fc.default;
const accountId=local.role.split(':')[3];
const fc=new Client(new OpenApi.Config({accessKeyId:profile.access_key_id,accessKeySecret:profile.access_key_secret,securityToken:profile.sts_token,endpoint:`${accountId}.${local.region}.fc.aliyuncs.com`,readTimeout:60000,connectTimeout:10000}));
const oss=new OSS({region:`oss-${local.region}`,accessKeyId:profile.access_key_id,accessKeySecret:profile.access_key_secret,secure:true,bucket:local.environmentVariables.OSS_BUCKET});
async function optional(fn){try{return await fn();}catch(e){if(e.statusCode===404 || /NotFound|NotExist/.test(e.code||''))return undefined;throw e;}}
async function preflight(){
 const status=execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim();
 if(status)throw new Error('Commit tracked changes before deployment');
 if(local.region!==local.environmentVariables.OSS_REGION.replace(/^oss-/,''))throw new Error('FC and state bucket must use the same region');
 const info=await oss.getBucketInfo(local.environmentVariables.OSS_BUCKET);
 if(info.bucket.AccessControlList.Grant!=='private')throw new Error('State bucket must be private');
 const versioning=await oss.getBucketVersioning(local.environmentVariables.OSS_BUCKET);
 if(versioning.versionStatus)throw new Error('State bucket must never enable versioning: one-time claims rely on forbid-overwrite');
 console.log(JSON.stringify({preflight:'passed',region:local.region,function:local.functionName}));
}
try{
 if(action==='preflight')await preflight();
 else if(action==='deploy'){
  await preflight();
  const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  // Always package this checkout, never a dist directory from an older commit.
  execFileSync('npm',['run','build'],{stdio:'inherit'});
  const archive=path.resolve('dist/function.zip');
  execFileSync('python3',['-c',`import zipfile, pathlib, sys
with zipfile.ZipFile(sys.argv[1], 'w', zipfile.ZIP_DEFLATED) as z:
 for name in ['server.cjs','LICENSE','THIRD_PARTY_NOTICES.md']: z.write('dist/'+name, name)
 z.write(sys.argv[2], 'node')`,archive,local.nodeBinary]);
  const digest=crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex'),key=`releases/feishu/${revision}-${digest}.zip`;
  await oss.put(key,archive);
  const common={description:`Feishu MCP ${revision}`,runtime:'custom.debian11',handler:'index.handler',cpu:0.5,memorySize:1024,diskSize:512,timeout:60,instanceConcurrency:10,internetAccess:true,role:local.role,disableInjectCredentials:'Request',
   customRuntimeConfig:{command:['/code/node','/code/server.cjs'],port:Number(local.environmentVariables.PORT||9000),healthCheckConfig:{httpGetUrl:'/feishu/healthz',initialDelaySeconds:0,periodSeconds:3,timeoutSeconds:2,failureThreshold:3,successThreshold:1}},
   ...(local.logConfig ? {logConfig:{...local.logConfig,enableRequestMetrics:true,enableInstanceMetrics:true,logBeginRule:'None'}} : {}),
   environmentVariables:{...local.environmentVariables,REVISION:revision},code:{ossBucketName:local.environmentVariables.OSS_BUCKET,ossObjectName:key}};
  const existing=await optional(()=>fc.getFunction(local.functionName,new Fc.GetFunctionRequest({}))); 
  if(existing)await fc.updateFunction(local.functionName,new Fc.UpdateFunctionRequest({body:new Fc.UpdateFunctionInput(common)}));
  else await fc.createFunction(new Fc.CreateFunctionRequest({body:new Fc.CreateFunctionInput({...common,functionName:local.functionName})}));
  const trigger=await optional(()=>fc.getTrigger(local.functionName,'http'));
  if(!trigger)await fc.createTrigger(local.functionName,new Fc.CreateTriggerRequest({body:new Fc.CreateTriggerInput({triggerName:'http',triggerType:'http',qualifier:'LATEST',triggerConfig:JSON.stringify({authType:'anonymous',methods:['GET','POST','DELETE','OPTIONS']})})}));
  const receipt={function:local.functionName,region:local.region,revision,sha256:digest,codeObject:key,deployedAt:new Date().toISOString()};
  fs.writeFileSync(path.join(path.dirname(configPath),'deployment-receipt.json'),JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));
 }else if(action==='domain'){
  const existing=await optional(()=>fc.getCustomDomain(local.domain));
  const routes=[...(existing?.body?.routeConfig?.routes||[])];
  for(const route of local.routes){const index=routes.findIndex(r=>r.path===route.path);if(index>=0)routes[index]={...route,qualifier:routes[index].qualifier||route.qualifier};else routes.push(route);}
  const body={domainName:local.domain,protocol:'HTTPS',routeConfig:{routes},certConfig:{certName:local.domain,certificate:fs.readFileSync(local.certificatePath,'utf8'),privateKey:fs.readFileSync(local.privateKeyPath,'utf8')}};
  if(existing)await fc.updateCustomDomain(local.domain,new Fc.UpdateCustomDomainRequest({body:new Fc.UpdateCustomDomainInput(body)}));
  else await fc.createCustomDomain(new Fc.CreateCustomDomainRequest({body:new Fc.CreateCustomDomainInput(body)}));
  console.log(JSON.stringify({domain:local.domain,region:local.region,routes:routes.map(r=>({path:r.path,function:r.functionName}))}));
 }else throw new Error('Unknown action');
}catch(error){console.error(JSON.stringify({error:error.code||error.name,message:String(error.message).replace(/access[_-]?key[^,\n]*/ig,'[redacted]')}));process.exit(1);}
