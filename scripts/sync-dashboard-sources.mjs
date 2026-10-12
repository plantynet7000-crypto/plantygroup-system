import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
for (const [folder,name] of [['private','admin'],['report-client','report']]){
 const sources=Object.fromEntries(readdirSync(folder).filter(x=>x.endsWith('.js')).map(file=>[file,readFileSync(`${folder}/${file}`,'utf8')]));
 writeFileSync(`server/${name}-sources.ts`,`export const ${name}Sources: Record<string,string> = ${JSON.stringify(sources)};\n`);
}
