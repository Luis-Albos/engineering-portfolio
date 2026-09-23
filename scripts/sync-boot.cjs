const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').trim();
let html=read('index.html');
const css=read('css/boot.css').replace(/url\('\.\.\/assets\/landing\/alephon.svg[^']*'\)/g,`url("data:image/svg+xml,${encodeURIComponent(read('assets/landing/alephon.svg')).replace(/'/g,'%27')}")`);
html=html.replace(/(?:<link rel="stylesheet" href="css\/boot.css[^>]+>|<!-- boot-style:start -->[\s\S]*?<!-- boot-style:end -->)/,`<!-- boot-style:start --><style>${css}</style><!-- boot-style:end -->`);
const script=`<!-- boot-controller:start --><script>\n${read('js/boot.js')}\n</script><!-- boot-controller:end -->`;
if(html.includes('<!-- boot-controller:start -->'))html=html.replace(/<!-- boot-controller:start -->[\s\S]*?<!-- boot-controller:end -->/,script);
else html=html.replace('    <header class="site-header">',script+'\n\n    <header class="site-header">');
html=html.replace(/<img src="assets\/landing\/alephon.svg[^>]+>/,`<img src="data:image/svg+xml,${encodeURIComponent(read('assets/landing/alephon.svg')).replace(/'/g,'%27')}" alt="">`);
if(process.argv.includes('--check')){
  if(read('index.html')!==html)throw new Error('Run node scripts/sync-boot.cjs to update the embedded cinematic.');
}else fs.writeFileSync(path.join(root,'index.html'),html+'\n');
