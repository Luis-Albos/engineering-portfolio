// Development-only static server shared by browser checks.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const projectRoot=path.resolve(__dirname,'..');
module.exports=(rootDir=projectRoot,port=0)=>new Promise(resolve=>{
  const root=path.resolve(rootDir);
  const server=http.createServer((req,res)=>{
    let file=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(!file.startsWith('/engineering-portfolio/')){res.writeHead(404).end();return;}
    file=file.slice('/engineering-portfolio/'.length);if(!file||file.endsWith('/'))file+='index.html';
    const target=path.resolve(root,file);if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    fs.readFile(target,(error,data)=>{if(error){res.writeHead(404).end();return;}
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.pdf':'application/pdf','.json':'application/json'})[path.extname(file)]||'application/octet-stream');
      res.setHeader('Accept-Ranges','bytes');
      const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if(range){
        const start=Number(range[1]),end=range[2]?Math.min(Number(range[2]),data.length-1):data.length-1;
        if(start>=data.length||end<start){res.writeHead(416,{'Content-Range':`bytes */${data.length}`}).end();return;}
        res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1}).end(data.subarray(start,end+1));return;
      }
      res.end(data);
    });
  });
  server.listen(port,'127.0.0.1',()=>resolve({server,base:`http://127.0.0.1:${server.address().port}/engineering-portfolio/`}));
});
