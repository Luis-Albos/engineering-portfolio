const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n?/g,'\n').trim();
let html=read('index.html');
const style=`<!-- boot-style:start --><style>${read('css/boot.css')}</style><!-- boot-style:end -->`;
const script=`<!-- boot-controller:start --><script>\n${read('js/boot.js')}\n</script><!-- boot-controller:end -->`;
html=html.replace(/<!-- boot-style:start -->[\s\S]*?<!-- boot-style:end -->/,style);
html=html.replace(/<!-- boot-controller:start -->[\s\S]*?<!-- boot-controller:end -->/,script);
if(process.argv.includes('--check')){
  if(read('index.html')!==html)throw new Error('Run node scripts/sync-boot.cjs to update the embedded loader.');
}else fs.writeFileSync(path.join(root,'index.html'),html+'\n');
