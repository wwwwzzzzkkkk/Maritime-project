import {createServer} from 'node:http';
import {Readable} from 'node:stream';
import {pathToFileURL} from 'node:url';
import {handleAiRequest} from './ai-handler.mjs';
export function createExplainServer({env=process.env,request=fetch}={}) {
  return createServer(async(req,res)=>{
    const body=['GET','HEAD'].includes(req.method)?undefined:Readable.toWeb(req);
    const input=new Request(new URL(req.url,'http://127.0.0.1'),{method:req.method,headers:req.headers,body,duplex:'half'});
    const output=await handleAiRequest(input,{env,request});
    res.writeHead(output.status,Object.fromEntries(output.headers));res.end(Buffer.from(await output.arrayBuffer()));
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const port=Number(process.env.PORT||48185);createExplainServer().listen(port,'127.0.0.1',()=>console.log(`MAREG local AI service: http://127.0.0.1:${port} (keys remain server-side)`));}
