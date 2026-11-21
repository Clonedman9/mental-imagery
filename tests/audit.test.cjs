const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function extract(file,name){return html(file).match(new RegExp('function '+name+'\\([^]*?\\n}'))[0];}
function run(code,context){vm.createContext(context);vm.runInContext(code,context);return context;}
test('all maintained inline scripts parse',()=>{for(const file of fs.readdirSync(path.join(__dirname,'..')).filter(f=>f.endsWith('.html'))){for(const m of html(file).matchAll(/<script(?:\s[^>]*)?>([^]*?)<\/script>/g))new vm.Script(m[1],{filename:file});}});

test('switching lab experiment retires prior keyboard states',()=>{
 const c=run(extract('lab.html','switchExp'),{clearAll(){},E1:{phase:'run'},E2:{phase:'respond'},E3:{phase:'answer'},document:{querySelectorAll:()=>[]},e1Intro(){},e2Intro(){},e3Intro(){}});
 c.switchExp(2);assert.equal(c.E1.phase,'idle');assert.equal(c.E3.phase,'idle');
});
test('judge starts timing only after frame and ignores stale frames',()=>{
 const frames=[];const node={};const c=run(extract('gym.html','newJudgeTrial'),{session:{count:0,mode:'judge'},TRIALS:24,clearTimers(){},$:()=>node,makeAsymShape:()=>({pts:[],mi:0}),nextAngle:()=>60,Judge:{},drawJudge(){},requestAnimationFrame:f=>frames.push(f),performance:{now:()=>42}});
 c.newJudgeTrial();assert.equal(c.Judge.active,false);c.newJudgeTrial();frames[0]();assert.equal(c.Judge.active,false);frames[1]();assert.equal(c.Judge.active,true);assert.equal(c.Judge.t0,42);
});
