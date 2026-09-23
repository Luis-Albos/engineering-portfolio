// Development-only static server shared by browser checks and fallback rendering.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
module.exports=()=>new Promise(resolve=>{
  const server=http.createServer((req,res)=>{
    let file=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if(!file.startsWith('/engineering-portfolio/')){res.writeHead(404).end();return;}
    file=file.slice('/engineering-portfolio/'.length);if(!file||file.endsWith('/'))file+='index.html';
    const target=path.resolve(root,file);if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    fs.readFile(target,(error,data)=>{if(error){res.writeHead(404).end();return;}
      res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.pdf':'application/pdf','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(data);
    });
  });
  server.listen(0,'127.0.0.1',()=>resolve({server,base:`http://127.0.0.1:${server.address().port}/engineering-portfolio/`}));
});
