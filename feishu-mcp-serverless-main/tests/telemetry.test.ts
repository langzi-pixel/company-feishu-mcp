import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requestContext, timed } from '../src/telemetry.js';

test('concurrent timing keeps correlation and never serializes values or errors',async()=>{
 const records:any[]=[];const original=console.info;console.info=(line:string)=>records.push(JSON.parse(line));
 try {
  await Promise.all(['a','b'].map(id=>requestContext.run({requestId:id},async()=>{
   assert.equal(await timed('mcp_tool','read',async()=>{await new Promise(r=>setTimeout(r,id==='a'?10:1));return 'private-body';}),'private-body');
   await assert.rejects(timed('mcp_tool','failure',async()=>{throw new Error('private-token');}));
  })));
  assert.equal(records.length,4);
  for(const id of ['a','b'])assert.deepEqual(records.filter(r=>r.request_id===id).map(r=>r.outcome),['ok','error']);
  assert.ok(!JSON.stringify(records).includes('private'));
 }finally{console.info=original;}
});
