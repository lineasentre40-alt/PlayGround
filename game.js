(()=>{'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),W=960,H=540,$=s=>document.querySelector(s);
const ui={menuScreen:$('#menuScreen'),start:$('#startButton'),home:$('#homeButton'),pause:$('#pauseButton'),round:$('#roundLabel'),clock:$('#clock'),status:$('#fightStatus'),toast:$('#comboToast'),brk:$('#roundBreak'),cont:$('#continueButton'),result:$('#resultScreen'),title:$('#resultTitle'),text:$('#resultText'),eyebrow:$('#resultEyebrow'),rematch:$('#rematchButton'),menuButton:$('#menuButton'),shell:document.querySelector('.game-shell'),ph:$('#playerHealth'),eh:$('#enemyHealth'),ps:$('#playerStamina'),es:$('#enemyStamina'),pb:$('#playerBody'),eb:$('#enemyBody'),pn:$('#playerName'),en:$('#enemyName'),stick:$('#stick'),knob:$('#stickKnob'),specialFill:$('#specialFill')};
const moves={jab:['JAB',5,5,.36,105,'jab'],cross:['CROSS',8,8,.48,115,'cross'],hook:['HOOK',9,9,.58,105,'hook'],uppercut:['UPPERCUT',11,11,.66,90,'upper'],lowkick:['LOW KICK',8,9,.62,118,'low'],highkick:['HIGH KICK',13,15,.85,120,'high'],special:['SPECIAL',19,24,.92,128,'special'],takedown:['TAKEDOWN',13,15,.82,83,'takedown'],grab:['GRAB',3,5,.54,75,'grab']};
let p,e,mode='quick',running=false,paused=false,round=1,time=180,last=0,elapsed=0,shake=0,particles=[],texts=[],stains=[],seq=[],seqTimer=0,aiTimer=1,champ=0,career=0,careerWins=Number(localStorage.getItem('fnCareerWins')||0),stickId=null,stickVec={x:0,y:0},announce=0,view={w:960,h:540,dpr:1},camX=480;
const names=['THE VETERAN','IRON JACKSON','EL TORO','NIGHTMARE','LA SOMBRA','TITAN'];
const combos={ 'JAB+CROSS+HOOK':['TRIPLE CORONA',1.4], 'JAB+HOOK+UPPERCUT':['DEMOLEDOR',1.55], 'LOW KICK+CROSS+HIGH KICK':['TORNADO',1.5], 'JAB+CROSS+TAKEDOWN':['DERRIBO TÁCTICO',1.35] };
function resize(){const d=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);view={w:r.width,h:r.height,dpr:d}}addEventListener('resize',resize);resize();
function fighter(x,player){return{x,y:0,hp:100,st:100,body:0,momentum:0,player,action:null,block:false,blockTimer:0,dodge:0,stun:0,flash:0,score:0,knock:0,face:player?1:-1,step:0,fallen:false,fallTime:0,damageTaken:0,down:0,combo:0,lastHit:-9,counter:0,pendingCombo:null,lastKey:''}}
function start(){mode=document.querySelector('.mode.active').dataset.mode;if(mode!=='championship')champ=0;if(mode!=='career')career=0;round=1;time=180;paused=false;running=true;elapsed=0;particles=[];texts=[];stains=[];seq=[];announce=2.4;p=fighter(365,true);e=fighter(595,false);const level=mode==='championship'?champ:mode==='career'?career:0;e.hp=100+level*4;e.st=100;e.aggression=.55+level*.07;e.skill=.5+level*.09;ui.pn.textContent=mode==='career'?`CARRERA · ${careerWins} VICTORIAS`:'EL DESAFIANTE';ui.en.textContent=mode==='championship'?names[(champ+1)%names.length]:mode==='career'?['ROOKIE KANE','IRON JACKSON','EL TORO','LA SOMBRA','NIGHTMARE'][Math.min(career,4)]:names[Math.floor(Math.random()*names.length)];ui.menuScreen.classList.add('hidden');ui.shell.classList.remove('menu-open');ui.result.classList.remove('show');ui.brk.classList.remove('show');ui.status.textContent=mode==='training'?'ENTRENAMIENTO':'COMBATE EN VIVO';ui.pause.textContent='Ⅱ';updateHud()}
function menu(){running=false;paused=false;announce=0;const wide=view.w/(view.h||1)>1.05;p=fighter(wide?660:410,true);e=fighter(wide?830:590,false);p.step=.9;e.step=2.1;p.hp=e.hp=100;ui.menuScreen.classList.remove('hidden');ui.shell.classList.add('menu-open');ui.result.classList.remove('show');ui.brk.classList.remove('show');ui.status.textContent='COMBATE EN VIVO';updateHud()}
ui.start.onclick=start;ui.home.onclick=menu;ui.rematch.onclick=start;ui.menuButton.onclick=menu;ui.cont.onclick=()=>{ui.brk.classList.remove('show');paused=false;round++;time=180;announce=2.4;p.hp=Math.min(100,p.hp+13);e.hp=Math.min(100,e.hp+10);p.st=e.st=100;p.block=false;e.block=false;updateHud()};
ui.pause.onclick=()=>{if(!running||ui.result.classList.contains('show'))return;paused=!paused;ui.pause.textContent=paused?'▶':'Ⅱ';ui.status.textContent=paused?'PAUSADO':(mode==='training'?'ENTRENAMIENTO':'COMBATE EN VIVO')};
document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>{document.querySelectorAll('.mode').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
function showToast(t){ui.toast.textContent=t;ui.toast.classList.remove('show');void ui.toast.offsetWidth;ui.toast.classList.add('show')}
function attack(f,key){if(!running||paused||!f||f.fallen||f.down>0||f.stun>0)return;if(key==='block'){f.block=true;return}if(key==='dodge'){if(f.st<4)return;f.dodge=.4;f.counter=.85;f.st=Math.max(0,f.st-4);f.action={key:'dodge',t:0,d:.34,hit:true};return}
const data=moves[key];if(!data)return;if(f.action&&f.action.t<f.action.d*.6)return;if(f.st<data[2]*.55){if(f.player)showToast('SIN RESISTENCIA');return}
if(key==='special'){if(f.momentum<40){if(f.player)showToast('ESPECIAL SIN CARGAR');return}f.momentum-=40}
const chain=elapsed-f.lastHit<1.15;f.combo=chain?Math.min(4,f.combo+1):0;f.lastHit=elapsed;f.lastKey=key;f.st-=data[2]*(chain?.88:1);f.action={key,t:0,d:data[3]*(1-Math.min(.24,f.combo*.055)),hit:false,boost:1+(chain?f.combo*.08:0),chain};f.block=false;
if(f.player){seq.push(key.toUpperCase());seqTimer=1.4;if(seq.length>4)seq.shift();for(const pattern in combos){const parts=pattern.split('+');if(seq.slice(-parts.length).join('+')===pattern){f.pendingCombo=combos[pattern];showToast('¡'+combos[pattern][0]+'!');break}}if(key==='special')showToast('PATADA ESPECIAL');else if(key==='takedown')showToast('DERRIBO');else if(key==='grab')showToast('CLINCH');}
}
document.querySelectorAll('[data-action]').forEach(b=>{const key=b.dataset.action;b.addEventListener('pointerdown',ev=>{ev.preventDefault();b.classList.add('pressed');b.setPointerCapture(ev.pointerId);attack(p,key)});const up=ev=>{b.classList.remove('pressed');if(key==='block'&&p)p.block=false};b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up)});
const keys={KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',KeyU:'jab',KeyI:'cross',KeyO:'hook',KeyP:'uppercut',KeyJ:'lowkick',KeyK:'highkick',KeyL:'block',KeyQ:'dodge',KeyE:'grab',KeyR:'takedown',KeyF:'special',Space:'special'};let held={};
addEventListener('keydown',ev=>{const a=keys[ev.code];if(a){ev.preventDefault();if(!held[ev.code]&&a!=='up'&&a!=='down'&&a!=='left'&&a!=='right')attack(p,a);held[ev.code]=true;if(a==='block'&&p)p.block=true}if(ev.code==='Escape'||ev.code==='Enter'&&ui.menuScreen.classList.contains('hidden'))ui.pause.click()});addEventListener('keyup',ev=>{const a=keys[ev.code];held[ev.code]=false;if(a==='block'&&p)p.block=false});
ui.stick.addEventListener('pointerdown',ev=>{stickId=ev.pointerId;ui.stick.setPointerCapture(stickId);moveStick(ev)});ui.stick.addEventListener('pointermove',ev=>{if(ev.pointerId===stickId)moveStick(ev)});function moveStick(ev){const r=ui.stick.getBoundingClientRect(),dx=(ev.clientX-(r.left+r.width/2))/(r.width*.38),dy=(ev.clientY-(r.top+r.height/2))/(r.height*.38),m=Math.hypot(dx,dy),k=m>1?1/m:1;stickVec={x:dx*k,y:dy*k};ui.knob.style.left=`${50+stickVec.x*31}%`;ui.knob.style.top=`${50+stickVec.y*31}%`}function releaseStick(){stickId=null;stickVec={x:0,y:0};ui.knob.style.left='50%';ui.knob.style.top='50%'}ui.stick.addEventListener('pointerup',releaseStick);ui.stick.addEventListener('pointercancel',releaseStick);
function movement(f,dt){if(f.fallen||f.down>0)return;let dx=0,dy=0;if(f.player){dx=stickVec.x;dy=stickVec.y;if(held.KeyA||held.ArrowLeft)dx--;if(held.KeyD||held.ArrowRight)dx++;if(held.KeyW||held.ArrowUp)dy--;if(held.KeyS||held.ArrowDown)dy++}else{const gap=p.x-f.x,dist=Math.abs(gap);if(dist>122)dx=gap>0?1:-1;else if(dist<68)dx=gap>0?-1:1;if(f.wantY==null||Math.random()<dt*.5)f.wantY=p.y+(Math.random()-.5)*30;dy=Math.max(-.7,Math.min(.7,(f.wantY-f.y)*.05))}
if(f.dodge>0){dx+=(f.player?-f.face:f.face)*.75;dy*=.3}let m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m}const slow=(1-f.body*.0022)*(f.block?.55:1)*(f.action?.86:1)*(f.st<12?.72:1);f.x+=dx*150*slow*dt;f.y+=dy*82*slow*dt;f.x=Math.max(250,Math.min(710,f.x));f.y=Math.max(-34,Math.min(26,f.y));if(Math.abs(dx)+Math.abs(dy)>.12)f.step+=dt*13;f.face=f.player?1:-1;if(f.player&&f.block&&f.st>.5)f.st=Math.max(0,f.st-dt*3.2)}
function resolveAttack(f,target){const a=f.action;if(!a||a.hit||a.key==='dodge')return;const start=a.d*.2,end=a.d*.76;if(a.t<start||a.t>end)return;a.hit=true;const data=moves[a.key];if(!data)return;const dist=Math.abs(target.x-f.x),lane=Math.abs(target.y-f.y),reach=data[4];if(dist>reach||lane>34||target.down>0){if(f.player&&target.down<=0)floatText(f.x,f.y-135,'FALLO','#dadada');return}
if(target.dodge>0){if(f.player)floatText(target.x,target.y-145,'ESQUIVA','#a8e7ff');target.score+=1;target.momentum=Math.min(100,target.momentum+5);return}
const blocked=target.block&&target.st>4&&a.key!=='takedown';const combo=f.pendingCombo;const boost=(a.boost||1)*(combo?combo[1]:1);let damage=data[1]*boost*(blocked?.22:1)*(target.st<18?1.12:1)*(target.stun>0?1.15:1)*(1+target.body*.0035);const didCounter=f.counter>0;if(didCounter){damage*=1.65;f.counter=0}const clean=Math.round(damage);target.hp=Math.max(0,target.hp-damage);target.damageTaken+=damage;target.st=Math.max(0,target.st-(blocked?3:damage*.7));target.body=Math.min(100,target.body+damage*(a.key.includes('kick')||a.key==='takedown'?1.35:.7));target.flash=.2;target.knock=.22;target.stun=blocked?.06:.14+damage*.008;target.score+=data[5];f.score+=data[5];f.momentum=Math.min(100,f.momentum+5+damage*.35+(combo?15:0));target.momentum=Math.min(100,target.momentum+2+damage*.15);shake=Math.max(shake,blocked?2.5:Math.min(14,damage*.5));
const counterHit=didCounter;floatText(target.x+(Math.random()-.5)*20,target.y-140,blocked?'BLOQUEADO':combo?combo[0]:counterHit?'¡CONTRAGOLPE!':`-${clean}`,blocked?'#d8ff3e':combo?'#ffd75e':counterHit?'#ff9e4d':'#ff7c73');
const px=target.x,py=groundY(target),headY=py-155;const count=blocked?4:8+(combo?8:0);for(let i=0;i<count;i++)particles.push({x:px+(Math.random()-.5)*30,y:headY+Math.random()*45,vx:(Math.random()-.5)*(combo?260:150),vy:-Math.random()*(combo?190:110),life:.3+Math.random()*.4,color:blocked?['#f1e6a5','#d8ff3e'][i%2]:i%3===0?'#d93b43':i%2?'#f5e1c4':'#e9b99e',size:combo?3.5:2.4});
if(combo){for(let i=0;i<10;i++)particles.push({x:px,y:headY+20,vx:(Math.random()-.5)*230,vy:(Math.random()-.5)*180,life:.45,color:'#ffd75e',size:2.5});f.pendingCombo=null;shake=Math.max(shake,11)}
if(!blocked&&damage>6){stains.push({x:target.x+(Math.random()-.5)*20,y:py-2+Math.random()*8,r:2+damage*.3,a:.05+Math.min(.12,damage*.006)});if(stains.length>26)stains.shift()}
if(blocked){target.st=Math.max(0,target.st-1.5)}
if((a.key==='takedown'||(combo&&combo[0]==='DERRIBO TÁCTICO'))&&!blocked&&target.hp>0){target.down=1.35;target.stun=.1;target.dodge=0;floatText(target.x,target.y-110,'DERRIBADO','#ffce6b');target.hp=Math.max(1,target.hp-5)}
if(target.hp<=0){target.fallen=true;target.fallTime=0;target.down=0;finish('KO',f.player?'PLAYER':'ENEMY')}else if(target.hp<=11&&!blocked){target.fallen=true;target.fallTime=0;finish('TKO',f.player?'PLAYER':'ENEMY')}}
function groundY(f){return 390-f.y}function floatText(x,y,text,color){texts.push({x,y,text,color,life:.85})}
function ai(dt){if(!running||paused||!e||e.fallen||e.down>0||mode==='training')return;if(e.queue){e.queue.t-=dt;if(e.queue.t<=0){const q=e.queue.key;e.queue=null;attack(e,q)}}aiTimer-=dt;e.blockTimer=Math.max(0,e.blockTimer-dt);e.block=e.blockTimer>0;const d=Math.abs(e.x-p.x),skill=e.skill||.5,aggr=e.aggression||.6;
if(p.action&&!p.action.hit&&d<155&&Math.random()<dt*(3+skill*4)){if(Math.random()<.58+skill*.15){e.blockTimer=.42}else{attack(e,'dodge')}}
if(aiTimer>0)return;aiTimer=(1.05-skill*.45)*(.55+Math.random()*.8);
if(e.st<18){if(d<130&&Math.random()<.4)e.blockTimer=.35;return}
if(d>150){if(Math.random()<.22+skill*.15)attack(e,Math.random()<.4?'lowkick':'jab')}
else if(d>95){const roll=Math.random();if(roll<.55*aggr){const pool=['jab','cross','lowkick','hook'];attack(e,pool[Math.floor(Math.random()*pool.length)])}else if(roll<.7){attack(e,'takedown')}}
else{const roll=Math.random();if(roll<.62+skill*.2){const pool=['hook','uppercut','cross','jab','highkick'];if(comboReady(e))attack(e,'hook');else attack(e,pool[Math.floor(Math.random()*pool.length)])}else if(roll<.8&&e.momentum>=40){attack(e,'special')}else if(roll<.9){attack(e,'grab')}else{e.blockTimer=.3}}
if(e.lastHit&&elapsed-e.lastHit<1.1&&!e.queue&&Math.random()<.45+skill*.35&&d<135){const follow=['cross','hook','uppercut','lowkick'];e.queue={key:follow[Math.floor(Math.random()*follow.length)],t:.1+Math.random()*.16};aiTimer=.3}
}
function comboReady(f){return(f.combo||0)>=1}
function updateHud(){for(const [el,val]of[[ui.ph,p?.hp??100],[ui.eh,e?.hp??100],[ui.ps,p?.st??100],[ui.es,e?.st??100]])el.style.width=Math.max(0,val)+'%';ui.pb.style.width=(p?.body??0)+'%';ui.eb.style.width=(e?.body??0)+'%';ui.round.textContent=mode==='training'?'ENTRENAMIENTO':`RONDA ${round} / 3`;ui.clock.textContent=mode==='training'?'∞':`${String(Math.floor(time/60)).padStart(2,'0')}:${String(Math.floor(time%60)).padStart(2,'0')}`;if(ui.specialFill)ui.specialFill.style.width=(p?.momentum??0)+'%';document.querySelector('[data-action="special"]')?.classList.toggle('ready',(p?.momentum??0)>=40)}
function finish(type,winner){if(!running)return;running=false;paused=false;ui.result.classList.add('show');let playerWon=winner==='PLAYER';ui.rematch.textContent='REVANCHA';ui.title.textContent=playerWon?'VICTORIA':'DERROTA';ui.title.style.color=playerWon?'#d8ff3e':'#ff646b';ui.eyebrow.textContent=type==='DECISIÓN'?'DECISIÓN DE LOS JUECES':type==='TKO'?'PARADA DEL ÁRBITRO':'COMBATE FINALIZADO';ui.text.textContent=type==='DECISIÓN'?`${playerWon?'Victoria':'Derrota'} por decisión · ${p.score} — ${e.score}`:`${type} · Ronda ${round}`;
if(mode==='championship'&&playerWon){champ++;if(champ>=3){ui.title.textContent='¡CAMPEÓN!';ui.text.textContent='Has conquistado el cinturón de Fight Night.';champ=0;ui.rematch.textContent='NUEVO CAMPEONATO'}else{ui.text.textContent=`Victoria por ${type} · Desafío ${champ} de 3`;ui.rematch.textContent='SIGUIENTE DESAFÍO'}}
if(mode==='career'){if(playerWon){career++;careerWins++;try{localStorage.setItem('fnCareerWins',careerWins)}catch(_){}if(career>=5){ui.title.textContent='¡CAMPEÓN MUNDIAL!';ui.text.textContent='Carrera completada: 5 victorias. Eres leyenda.';career=0;ui.rematch.textContent='NUEVA CARRERA'}else{ui.text.textContent=`Victoria por ${type} · Pelea ${career} de 5 completada`;ui.rematch.textContent='SIGUIENTE PELEA'}}else{ui.text.textContent=`Derrota por ${type} · Reintenta el desafío ${career+1}`;ui.rematch.textContent='REINTENTAR'}}}
function nextRound(){if(round>=3){const won=p.score>=e.score;finish('DECISIÓN',won?'PLAYER':'ENEMY')}else{paused=true;ui.brk.classList.add('show');ui.status.textContent='DESCANSO ENTRE ASALTOS'}}
function update(dt){elapsed+=dt;if(!running||paused)return;if(announce>0)announce-=dt;if(mode!=='training'){time-=dt;if(time<=0){time=0;updateHud();nextRound();return}}if(seqTimer>0){seqTimer-=dt;if(seqTimer<=0)seq=[]}
for(const f of[p,e]){f.st=Math.min(100,f.st+dt*(f.action?2.2:9)*(1-f.body*.003));f.stun=Math.max(0,f.stun-dt);f.flash=Math.max(0,f.flash-dt);f.dodge=Math.max(0,f.dodge-dt);f.knock=Math.max(0,f.knock-dt);f.counter=Math.max(0,f.counter-dt);if(f.block){f.blockTimer=Math.max(0,f.blockTimer-dt);if(!f.player&&f.blockTimer<=0)f.block=false}
if(f.down>0){f.down-=dt;f.action=null;f.block=false;if(f.down<=0){f.down=0;f.stun=.22;f.hp=Math.max(1,f.hp);floatText(f.x,f.y-120,'SE LEVANTA','#e9e3d5')}}
if(f.action){f.action.t+=dt;if(f.action.t>f.action.d)f.action=null}if(f.fallen)f.fallTime+=dt;
if(f.st<42&&running&&Math.random()<dt*(f.st<20?12:4)){particles.push({x:f.x+(Math.random()-.5)*28,y:groundY(f)-150+Math.random()*35,vx:(Math.random()-.5)*40,vy:20+Math.random()*40,life:.45,color:'#d8efff',size:1.4})}
}
movement(p,dt);movement(e,dt);if(!p.fallen&&!e.fallen&&p.down<=0&&e.down<=0){const dx=e.x-p.x,dy=e.y-p.y,dd=Math.hypot(dx,dy*1.6),min=62;if(dd<min&&dd>0){const push=(min-dd)/2,nx=dx/dd,ny=dy/dd;p.x-=nx*push;e.x+=nx*push;p.y=Math.max(-34,p.y-ny*push*.55);e.y=Math.min(26,e.y+ny*push*.55);p.x=Math.max(250,p.x);e.x=Math.min(710,e.x)}}ai(dt);resolveAttack(p,e);resolveAttack(e,p);
if(mode==='training'&&(e.hp<20||p.hp<20)){if(e.hp<20){e.hp=100;e.body=Math.max(0,e.body-20);showToast('¡BUEN GOLPE! SIGUE ASÍ')}if(p.hp<20)p.hp=100}
for(const z of particles){z.x+=z.vx*dt;z.y+=z.vy*dt;z.vy+=210*dt;z.life-=dt}particles=particles.filter(z=>z.life>0);for(const t of texts){t.y-=22*dt;t.life-=dt}texts=texts.filter(t=>t.life>0);shake=Math.max(0,shake-dt*18);updateHud()}
function polygon(points,fill,stroke=null,width=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.lineWidth=width;ctx.strokeStyle=stroke;ctx.stroke()}}
const crowd=[];function initCrowd(){let seed=73;const rnd=()=>{seed=seed*16807%2147483647;return seed/2147483647};for(let row=0;row<7;row++){const count=26+row*4;for(let i=0;i<count;i++){crowd.push({x:-150+i*(1290/count)+rnd()*9-4,y:58+row*29+(rnd()-.5)*6,s:.66+rnd()*.5,skin:['#2c2422','#5c4035','#8c614b','#b68563','#d3a27b','#211b1a'][Math.floor(rnd()*6)],shirt:['#1c2028','#292f37','#36282a','#22333a','#3a3931','#16181e'][Math.floor(rnd()*6)],phone:rnd()<.11,arm:rnd()<.13,lean:(rnd()-.5)*.2})}}}initCrowd();
function drawArena(bottom){
let bg=ctx.createLinearGradient(0,-600,0,420);bg.addColorStop(0,'#050609');bg.addColorStop(.45,'#101319');bg.addColorStop(.78,'#292127');bg.addColorStop(1,'#5c4032');ctx.fillStyle=bg;ctx.fillRect(-400,-700,1760,1200);
// spotlight cones
ctx.save();ctx.globalCompositeOperation='screen';for(const [x,col]of[[-70,'#8b6cff'],[1020,'#ffb066'],[240,'#5ac8ff'],[760,'#ff6b72']]){let c=ctx.createLinearGradient(x,-430,480,390);c.addColorStop(0,col+'33');c.addColorStop(.55,col+'0e');c.addColorStop(1,col+'00');ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x-18,-420);ctx.lineTo(x+18,-420);ctx.lineTo(650,395);ctx.lineTo(310,395);ctx.closePath();ctx.fill()}ctx.restore();
// ceiling truss
ctx.fillStyle='#08090c';ctx.fillRect(-400,-620,1760,230);ctx.strokeStyle='#2c3039';ctx.lineWidth=6;for(let y=-470;y<-250;y+=55){ctx.beginPath();ctx.moveTo(-400,y);ctx.lineTo(1360,y);ctx.stroke()}for(let x=-300;x<1360;x+=130){ctx.beginPath();ctx.moveTo(x,-500);ctx.lineTo(x+70,-250);ctx.stroke()}ctx.fillStyle='#e5dfff22';ctx.beginPath();ctx.moveTo(30,-330);ctx.lineTo(60,-330);ctx.lineTo(15,-290);ctx.lineTo(-15,-290);ctx.fill();ctx.beginPath();ctx.moveTo(890,-330);ctx.lineTo(920,-330);ctx.lineTo(965,-290);ctx.lineTo(935,-290);ctx.fill();
// jumbotron
ctx.save();ctx.translate(480,-128);ctx.fillStyle='#05070b';ctx.fillRect(-152,-54,304,104);ctx.strokeStyle='#2f3540';ctx.lineWidth=4;ctx.strokeRect(-152,-54,304,104);ctx.fillStyle='#0b0f15';ctx.fillRect(-142,-44,284,84);let scr=ctx.createLinearGradient(0,-40,0,40);scr.addColorStop(0,'#1b2a20');scr.addColorStop(1,'#0a0f0c');ctx.fillStyle=scr;ctx.fillRect(-136,-38,272,72);ctx.textAlign='center';ctx.fillStyle='#d8ff3e';ctx.font='900 30px "Barlow Condensed",Arial';ctx.fillText('FIGHT NIGHT',0,-6);ctx.fillStyle='#ffffffa8';ctx.font='800 9px Arial';ctx.fillText('M M A   C H A M P I O N S H I P',0,12);ctx.fillStyle='#ff4c53';ctx.beginPath();ctx.arc(-122,-28,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 8px Arial';ctx.textAlign='left';ctx.fillText('LIVE',-113,-25);ctx.fillStyle='#ffffff35';ctx.fillRect(-152,54,304,3);ctx.restore();
// stands
polygon([[-400,20],[1360,20],[1360,352],[-400,352]],'#0e1014');for(let r=0;r<7;r++){const y=44+r*29;ctx.fillStyle=r%2?'#161920':'#12151a';ctx.fillRect(-400,y,1760,29);ctx.strokeStyle='#ffffff09';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-400,y+29);ctx.lineTo(1360,y+29);ctx.stroke()}
// crowd bodies
for(const c of crowd){const s=c.s;ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.lean);ctx.fillStyle=c.shirt;ctx.beginPath();ctx.ellipse(0,8*s,9*s,10*s,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=c.skin;ctx.beginPath();ctx.arc(0,-2*s,5.4*s,0,Math.PI*2);ctx.fill();ctx.fillStyle='#00000042';ctx.beginPath();ctx.arc(0,-4.5*s,5.4*s,Math.PI,Math.PI*2);ctx.fill();if(c.arm){ctx.strokeStyle=c.skin;ctx.lineWidth=2.4*s;ctx.beginPath();ctx.moveTo(7*s,4*s);ctx.lineTo(13*s,-9*s);ctx.stroke()}if(c.phone){ctx.fillStyle='#d8ecff';ctx.globalAlpha=.8;ctx.fillRect(9*s,-10*s,2.4*s,3.4*s);ctx.shadowColor='#8ad4ff';ctx.shadowBlur=8;ctx.fillRect(9*s,-10*s,2.4*s,3.4*s);ctx.shadowBlur=0;ctx.globalAlpha=1}ctx.restore()}
// haze
let haze=ctx.createLinearGradient(0,60,0,390);haze.addColorStop(0,'#8a6d5520');haze.addColorStop(1,'#00000000');ctx.fillStyle=haze;ctx.fillRect(-400,40,1760,360);
// LED band
ctx.fillStyle='#080a0d';ctx.fillRect(-400,270,1760,58);ctx.fillStyle='#10141a';ctx.fillRect(-400,274,1760,46);ctx.textAlign='left';ctx.font='800 15px "Barlow Condensed",Arial';for(let i=0;i<12;i++){const x=-380+i*158;ctx.fillStyle=i%3===0?'#d8ff3e':'#cfd0d2';ctx.fillText(i%3===0?'FN':'FIGHT NIGHT',x,301);ctx.fillStyle='#ff4c53';ctx.fillRect(x-14,284,3,22)}ctx.fillStyle='#ff4c5340';ctx.fillRect(-400,270,1760,1);ctx.fillRect(-400,327,1760,1);
// cage mesh
ctx.save();ctx.beginPath();ctx.rect(-400,145,1760,246);ctx.clip();ctx.strokeStyle='#b8c1c622';ctx.lineWidth=1.1;for(let x=-500;x<1500;x+=26){ctx.beginPath();ctx.moveTo(x,145);ctx.lineTo(x+210,392);ctx.stroke();ctx.beginPath();ctx.moveTo(x,392);ctx.lineTo(x+210,145);ctx.stroke()}ctx.strokeStyle='#8b929c33';ctx.lineWidth=2;for(const y of [190,270,350]){ctx.beginPath();ctx.moveTo(-400,y);ctx.lineTo(1360,y);ctx.stroke()}
// cage posts
for(let i=0;i<5;i++){const x=20+i*235;ctx.fillStyle='#07080a';ctx.fillRect(x-8,145,16,246);ctx.fillStyle='#3a3e46';ctx.fillRect(x-8,145,3.5,246);ctx.fillStyle='#c7cbd2';ctx.fillRect(x-8,145,16,3)}ctx.fillStyle='#1a1c21';ctx.fillRect(-400,143,1760,7);ctx.fillStyle='#5b6068';ctx.fillRect(-400,143,1760,1.5);
// corner pads
ctx.fillStyle='#1c5f89';ctx.fillRect(4,156,52,150);ctx.fillStyle='#2e93c9';ctx.fillRect(4,156,52,5);ctx.fillStyle='#8e2b32';ctx.fillRect(904,156,52,150);ctx.fillStyle='#d13d45';ctx.fillRect(904,156,52,5);ctx.restore();
// background official
drawRef(480,374,.76,elapsed);
// outer floor
ctx.fillStyle='#0c0d10';ctx.fillRect(-400,366,1760,Math.max(300,bottom-360));
// octagon mat
let mat=ctx.createLinearGradient(0,368,0,540);mat.addColorStop(0,'#8e8a80');mat.addColorStop(.22,'#c2bdb0');mat.addColorStop(.7,'#a49e92');mat.addColorStop(1,'#767168');polygon([[82,366],[878,366],[1010,432],[920,516],[40,516],[-50,432]],mat);
// mat border
ctx.strokeStyle='#e8e0d26b';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(82,366);ctx.lineTo(878,366);ctx.stroke();ctx.strokeStyle='#3a3630';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(82,363);ctx.lineTo(878,363);ctx.stroke();
// mat texture
ctx.save();ctx.beginPath();ctx.moveTo(82,366);ctx.lineTo(878,366);ctx.lineTo(1010,432);ctx.lineTo(920,516);ctx.lineTo(40,516);ctx.lineTo(-50,432);ctx.closePath();ctx.clip();ctx.strokeStyle='#ffffff16';ctx.lineWidth=1;for(let i=0;i<11;i++){const x=80+i*80;ctx.beginPath();ctx.moveTo(x,366);ctx.lineTo(x-40,520);ctx.stroke()}for(let i=0;i<4;i++){const y=380+i*38;ctx.beginPath();ctx.moveTo(-20,y);ctx.lineTo(1000,y);ctx.stroke()}
// center logo
ctx.globalAlpha=.32;ctx.strokeStyle='#272521';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(480,455,192,46,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(480,455,130,31,0,0,Math.PI*2);ctx.stroke();ctx.textAlign='center';ctx.fillStyle='#292723';ctx.font='900 34px "Barlow Condensed",Arial';ctx.fillText('FIGHT NIGHT',480,449);ctx.font='800 11px Arial';ctx.fillText('M M A   C H A M P I O N S H I P',480,469);ctx.globalAlpha=1;
// corner color arcs
ctx.strokeStyle='#2b6d9e88';ctx.lineWidth=15;ctx.beginPath();ctx.arc(110,470,40,.4,2.2);ctx.stroke();ctx.strokeStyle='#a33b4188';ctx.beginPath();ctx.arc(850,470,40,3.5,5.4);ctx.stroke();
// stains
for(const st of stains){ctx.globalAlpha=st.a;ctx.fillStyle='#6d1518';ctx.beginPath();ctx.ellipse(st.x,st.y,st.r*2.5,st.r,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
ctx.restore();
// cage foreground edge
ctx.fillStyle='#121316';ctx.fillRect(-400,514,1760,10);ctx.fillStyle='#383c43';ctx.fillRect(-400,514,1760,2);
ctx.fillStyle='#0a0b0e';ctx.fillRect(-400,366,1760,4);
}
function drawRef(x,y,s,t){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#0b0c0f';ctx.beginPath();ctx.ellipse(0,2,28,6,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#24262c';ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-5,-44);ctx.lineTo(-9,-20);ctx.lineTo(-13,-2);ctx.stroke();ctx.beginPath();ctx.moveTo(5,-44);ctx.lineTo(10,-20);ctx.lineTo(13,-2);ctx.stroke();ctx.fillStyle='#2e3036';ctx.fillRect(-15,-90,30,48);ctx.fillStyle='#d7d4cd';ctx.fillRect(-3,-90,6,48);ctx.strokeStyle='#b0896e';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-13,-84);ctx.lineTo(-20,-55+Math.sin(t*2)*2);ctx.stroke();ctx.beginPath();ctx.moveTo(13,-84);ctx.lineTo(23,-64+Math.sin(t*2)*2);ctx.stroke();ctx.fillStyle='#b0896e';ctx.beginPath();ctx.arc(0,-103,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#282420';ctx.beginPath();ctx.arc(0,-106,10,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#111';ctx.fillRect(-8,-124,16,4);ctx.restore()}
function fighterDraw(f){
const gy=groundY(f),dir=f.player?1:-1;
ctx.save();ctx.translate(f.x,gy);
ctx.fillStyle='#0000005c';ctx.beginPath();ctx.ellipse(0,3,50,10,0,0,Math.PI*2);ctx.fill();
const fall=f.fallen?Math.min(1,f.fallTime*2.2):0;
const down=f.down>0?Math.max(0,Math.min(1,Math.min((1.35-f.down)*8,f.down*5))):0;
const pose=Math.max(fall,down*.9);
if(f.fallen)ctx.globalAlpha=Math.max(.5,1-f.fallTime*.09);
ctx.translate(pose*14,0);ctx.rotate(-pose*1.2);
ctx.scale(dir*1.16,1.16);
const act=f.action,p=act?Math.min(1,act.t/act.d):0,env=act?Math.sin(p*Math.PI):0,kind=act?(moves[act.key]?.[5]||act.key):'';
let punch=0,kick=0;
if(['jab','cross','hook','upper','special','grab','takedown'].includes(kind))punch=env;
if(kind==='low'||kind==='high')kick=env;
const bob=Math.sin(f.step)*1.7+Math.sin(elapsed*2.8+f.x*.02)*.8;
const fatigue=Math.max(0,Math.min(1,(36-f.st)/36));
const block=f.block&&f.st>2;
const crouch=(block?4:0)+fatigue*2.5+(kind==='takedown'?punch*17:0);
const hitWobble=f.knock>0?Math.sin(elapsed*62)*f.knock:0;
const lean=(kind==='high'?-kick*.2:kind==='low'?-kick*.08:0)+(kind==='hook'?punch*.08:kind==='special'?punch*.16:0)+fatigue*.045+hitWobble*.1;
const skin=f.player?'#b57b5b':'#7f523d',skinL=f.player?'#d09a75':'#95654a',skinD=f.player?'#7c4d38':'#533428';
const shorts=f.player?'#173f5e':'#5e2830',shortsL=f.player?'#266e9f':'#8b3c44',glove=f.player?'#1a87c6':'#d1373e',gloveD=f.player?'#0b4f78':'#79171d',trim=f.player?'#bfeaff':'#ffd6cf';
ctx.lineCap='round';ctx.lineJoin='round';
const seg=(x1,y1,x2,y2,w,c)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()};
function leg(hx,hy,kx,ky,ax,ay,fx,fy,w,dark){
 seg(hx,hy,kx,ky,w+4,'#2e1e18');seg(hx,hy,kx,ky,w,dark?skinD:skin);
 seg(kx,ky,ax,ay,w+2,'#2e1e18');seg(kx,ky,ax,ay,w-2,dark?skinD:skin);
 seg(ax,ay,fx,fy,w-1,'#2e1e18');seg(ax,ay,fx,fy,w-4,dark?skinD:skin);
 ctx.fillStyle='#2e1e18';ctx.beginPath();ctx.ellipse(fx+2,fy+1,11,4.6,.02,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=dark?skinD:skin;ctx.beginPath();ctx.ellipse(fx+2,fy+.6,9.4,3.6,.02,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=dark?skinD:skin;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(fx+8,fy-1);ctx.lineTo(fx+8,fy+3);ctx.moveTo(fx+5,fy-1.6);ctx.lineTo(fx+5,fy+3.4);ctx.stroke();
}
function gloveAt(x,y,r,sc){
 ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.scale(sc,sc);
 ctx.fillStyle='#1c1211';ctx.beginPath();ctx.ellipse(0,1,13,11,0,0,Math.PI*2);ctx.fill();
 let gg=ctx.createLinearGradient(-9,-9,9,9);gg.addColorStop(0,glove);gg.addColorStop(1,gloveD);
 ctx.fillStyle=gg;ctx.beginPath();ctx.ellipse(0,-1,12,10,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=trim;ctx.fillRect(-12,5,24,3);
 ctx.fillStyle='#ffffff35';ctx.beginPath();ctx.ellipse(-4,-5,4.5,2.6,-.4,0,Math.PI*2);ctx.fill();
 ctx.restore();
}
function arm(sx,sy,ex,ey,gx,gy,w,front){
 const c=front?skin:skinD;
 seg(sx,sy,ex,ey,w+4,'#2e1e18');seg(sx,sy,ex,ey,w,c);
 seg(ex,ey,gx,gy,w+2,'#2e1e18');seg(ex,ey,gx,gy,w-2,c);
 ctx.fillStyle=trim;ctx.beginPath();ctx.arc(gx-Math.sign(gx-ex)*7,gy+2,4,0,Math.PI*2);ctx.fill();
}
// back leg
const stepSwing=Math.sin(f.step)*3;
leg(-7,-88,-17,-46,-23+stepSwing*.4,-8,-34+stepSwing*.5,-3,14,true);
// back arm
let farE=[-22,-136],farG=[-4,-155];
if(block){farE=[-13,-139];farG=[-1,-166]}
if(kind==='jab'){farE=[12,-147];farG=[58,-151]}
if(kind==='grab'||kind==='takedown'){farE=[8,-137];farG=[43,-133-punch*12]}
if(kind==='special'){farE=[-6,-128];farG=[-36,-112]}
arm(-17,-146,farE[0],farE[1],farG[0],farG[1],10,false);
gloveAt(farG[0],farG[1],.1,.92);
// torso group
ctx.save();ctx.translate(0,-90);ctx.rotate(lean+(hitWobble*.05));ctx.translate(0,90-crouch+bob);
// traps + delts
ctx.fillStyle=skinD;ctx.beginPath();ctx.arc(-19,-145,8,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(18,-144,9,0,Math.PI*2);ctx.fill();
// torso
let tg=ctx.createLinearGradient(-24,-150,25,-96);tg.addColorStop(0,skinL);tg.addColorStop(.48,skin);tg.addColorStop(1,skinD);
polygon([[-22,-148],[-12,-157],[10,-157],[23,-146],[19,-120],[16,-99],[8,-90],[-9,-90],[-18,-101],[-21,-121]],tg,'#301e17',1.2);
// pec + abs definition
ctx.strokeStyle='#4b2b2088';ctx.lineWidth=1.4;
ctx.beginPath();ctx.arc(-7,-137,11,.2,1.7);ctx.stroke();ctx.beginPath();ctx.arc(10,-138,12,-1.8,-.1);ctx.stroke();
for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-1,-128+i*9);ctx.lineTo(13,-130+i*9);ctx.stroke()}
ctx.beginPath();ctx.moveTo(5,-129);ctx.lineTo(5,-103);ctx.stroke();
ctx.fillStyle='#ffffff1c';ctx.beginPath();ctx.ellipse(-10,-139,8,4,-.5,0,Math.PI*2);ctx.fill();
// sweat shine
ctx.fillStyle='#ffffff2b';ctx.beginPath();ctx.ellipse(-13,-113,3,8,.2,0,Math.PI*2);ctx.fill();
// shorts
polygon([[-20,-101],[21,-101],[25,-60],[14,-53],[-17,-54],[-24,-63]],shorts,'#241519',1.2);
ctx.fillStyle=shortsL;ctx.fillRect(-20,-100,42,7);
ctx.fillStyle=trim;ctx.fillRect(-22,-66,5,11);ctx.fillRect(18,-66,5,11);
ctx.fillStyle='#ffffffb0';ctx.font='800 6px Arial';ctx.textAlign='center';ctx.fillText('FN',2,-78);
// near leg
let fK=[17,-45],fA=[24,-8],fF=[37,-3];
if(kind==='low'){fK=[22+14*kick,-44];fA=[26+50*kick,-24-16*kick];fF=[40+42*kick,-16-30*kick]}
if(kind==='high'){fK=[22+10*kick,-55-11*kick];fA=[30+42*kick,-52-35*kick];fF=[42+30*kick,-61-55*kick]}
leg(8,-88,fK[0],fK[1],fA[0],fA[1],fF[0],fF[1],15,false);
// kick trail
if(kick>.25){ctx.strokeStyle=glove+'40';ctx.lineWidth=6;ctx.beginPath();ctx.arc(8,-72,72,-1.1+ .2,-1.1+kick*1.5);ctx.stroke()}
// neck
ctx.fillStyle=skinD;ctx.fillRect(-6,-165,12,12);
// head
const hx=hitWobble*2.2,hy=hitWobble*2;
ctx.save();ctx.translate(hx,hy);
const hg=ctx.createRadialGradient(-4,-184,3,2,-174,22);hg.addColorStop(0,skinL);hg.addColorStop(.6,skin);hg.addColorStop(1,skinD);
ctx.fillStyle=hg;ctx.beginPath();ctx.ellipse(1,-176,15.5,18,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.moveTo(8,-164);ctx.lineTo(13,-168);ctx.lineTo(13,-159);ctx.lineTo(7,-155);ctx.closePath();ctx.fillStyle=skin;ctx.fill();
// ear
ctx.fillStyle=skinD;ctx.beginPath();ctx.ellipse(-12,-175,4.5,6.5,-.15,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#4c2a21';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(-12,-175,2.4,0,Math.PI*2);ctx.stroke();
// hair
if(f.player){ctx.fillStyle='#191413';ctx.beginPath();ctx.moveTo(-13,-181);ctx.bezierCurveTo(-15,-196,15,-199,16,-183);ctx.bezierCurveTo(11,-189,3,-191,-3,-187);ctx.bezierCurveTo(-7,-185,-10,-182,-13,-181);ctx.fill();ctx.fillStyle='#191413';ctx.beginPath();ctx.ellipse(4,-161,8,5,-.1,0,Math.PI);ctx.fill();ctx.fillStyle='#1b1514';ctx.beginPath();ctx.arc(-13,-176,2.6,0,Math.PI*2);ctx.fill()}
else{ctx.fillStyle='#2a211e';ctx.beginPath();ctx.arc(1,-184,14.8,Math.PI*1.02,Math.PI*2.02);ctx.fill();ctx.fillStyle='#ffffff1c';ctx.beginPath();ctx.ellipse(-2,-187,8,3.4,-.2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#211916';ctx.beginPath();ctx.ellipse(4,-161,7,4.4,.1,0,Math.PI);ctx.fill();ctx.strokeStyle='#7d3f39';ctx.globalAlpha=.5;ctx.lineWidth=1;ctx.beginPath();ctx.arc(-6,-181,8,.1,1.8);ctx.stroke();ctx.globalAlpha=1}
// jaw + cheek shading
ctx.strokeStyle=`${skinD}aa`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-8,-164);ctx.quadraticCurveTo(2,-154,10,-160);ctx.stroke();
ctx.fillStyle=`${skinD}55`;ctx.beginPath();ctx.ellipse(-5,-171,7,9,0,0,Math.PI*2);ctx.fill();
// features (facing right)
ctx.fillStyle='#1d1511';ctx.beginPath();ctx.ellipse(9.2,-178.6,4,2.2,-.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#f4e9dd';ctx.beginPath();ctx.arc(10.3,-179.2,1.05,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#241814';ctx.beginPath();ctx.arc(10.6,-178.7,.8,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#3b2119';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(3.5,-183.4);ctx.lineTo(14,-182.2);ctx.stroke();
ctx.fillStyle=skinD;ctx.beginPath();ctx.moveTo(13.2,-177.2);ctx.lineTo(16.4,-173.4);ctx.lineTo(12.4,-172.4);ctx.closePath();ctx.fill();
ctx.fillStyle='#3e1117';ctx.beginPath();ctx.ellipse(9,-166.8,4.6,1.8,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ded4c1';ctx.beginPath();ctx.ellipse(9.8,-167.2,3.4,.8,0,0,Math.PI*2);ctx.fill();
// damage
const dmg=1-f.hp/100;
if(dmg>.12){ctx.fillStyle=`rgba(130,20,24,${.12+dmg*.42})`;ctx.beginPath();ctx.ellipse(9.5,-171.5,5,3,.2,0,Math.PI*2);ctx.fill();ctx.fillStyle=`rgba(70,24,30,${.1+dmg*.35})`;ctx.beginPath();ctx.ellipse(8.5,-177.5,4.4,2,0,0,Math.PI*2);ctx.fill()}
if(dmg>.34){ctx.strokeStyle='#7f1117';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(12.5,-185);ctx.lineTo(14.6,-176);ctx.lineTo(13,-171.5);ctx.stroke();ctx.fillStyle='#8c161c';ctx.beginPath();ctx.ellipse(14.3,-169.2,1.4,2.7,.2,0,Math.PI*2);ctx.fill()}
if(f.stun>0){ctx.fillStyle='#ffffff12';ctx.beginPath();ctx.ellipse(4,-176,15,18,0,0,Math.PI*2);ctx.fill()}
ctx.restore();
// near arm
let nearE=[22,-137],nearG=[15,-159];
if(block){nearE=[24,-139];nearG=[11,-168]}
if(kind==='cross'){nearE=[33,-147];nearG=[65,-151]}
if(kind==='hook'){nearE=[36,-136];nearG=[52,-154]}
if(kind==='upper'){nearE=[27,-133];nearG=[41,-169]}
if(kind==='special'){nearE=[30,-145];nearG=[58,-166]}
if(kind==='grab'){nearE=[32,-135];nearG=[49,-129]}
if(kind==='takedown'){nearE=[30,-114];nearG=[51,-99]}
arm(15,-145,nearE[0],nearE[1],nearG[0],nearG[1],11,true);
gloveAt(nearG[0],nearG[1],.15,1);
// block guard glint
if(block){ctx.strokeStyle='#f8e58b';ctx.globalAlpha=.35+Math.sin(elapsed*7)*.1;ctx.lineWidth=2.6;ctx.beginPath();ctx.arc(4,-132,32,-2.1,-.35);ctx.stroke();ctx.globalAlpha=1}
ctx.restore();
ctx.restore();
}

function render(){const v=view,w=v.w,h=v.h;ctx.setTransform(v.dpr,0,0,v.dpr,0,0);ctx.clearRect(0,0,w,h);let base=ctx.createLinearGradient(0,0,0,h);base.addColorStop(0,'#06070a');base.addColorStop(.55,'#121116');base.addColorStop(1,'#211b18');ctx.fillStyle=base;ctx.fillRect(0,0,w,h);if(!p||!e)return;const aspect=w/h,sep=Math.abs(p.x-e.x),s=aspect<1.05?Math.min(1.7,Math.max(.6,w/Math.max(300,sep+120))):Math.min(1.2,Math.max(.6,w/960)),half=w/(2*s),mid=(p.x+e.x)/2;camX=half>=480?480:Math.max(half+30,Math.min(960-half-30,mid));const gy=h*(aspect<1.05?.66:(h<560?.73:.70)),ox=w/2-camX*s,oy=gy-390*s,sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;ctx.save();ctx.translate(ox+sx,oy+sy);ctx.scale(s,s);drawArena((h-oy-sy)/s+140);
const order=[p,e].sort((a,b)=>a.y-b.y);for(const f of order)fighterDraw(f);
for(const z of particles){ctx.globalAlpha=Math.max(0,z.life*2.2);ctx.fillStyle=z.color;ctx.beginPath();ctx.arc(z.x,z.y,z.size||2.4,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
for(const t of texts){const a=Math.max(0,Math.min(1,t.life*1.8));ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='900 18px "Barlow Condensed",Arial';ctx.lineWidth=4;ctx.strokeStyle='#0b0b0d';ctx.strokeText(t.text,t.x,t.y);ctx.fillStyle=t.color;ctx.fillText(t.text,t.x,t.y)}ctx.globalAlpha=1;ctx.restore();
const vig=ctx.createRadialGradient(w/2,h*.44,Math.min(w,h)*.25,w/2,h*.5,Math.max(w,h)*.75);vig.addColorStop(0,'transparent');vig.addColorStop(1,'#050507bb');ctx.fillStyle=vig;ctx.fillRect(0,0,w,h);
if(announce>0&&running&&!paused){const a=Math.min(1,announce*1.6);ctx.globalAlpha=a*(announce>.95?1:1);ctx.textAlign='center';ctx.fillStyle='#d8ff3e';ctx.font=`900 ${Math.min(64,w*.078)}px "Barlow Condensed",Arial`;ctx.fillText(announce>.95?(mode==='training'?'ENTRENAMIENTO':`RONDA ${round}`):'¡PELEA!',w/2,h*.36);ctx.globalAlpha=1}
if(paused&&!ui.brk.classList.contains('show')&&!ui.result.classList.contains('show')){ctx.fillStyle='#050608b8';ctx.fillRect(0,0,w,h);ctx.textAlign='center';ctx.fillStyle='#d8ff3e';ctx.font=`900 ${Math.min(42,w*.055)}px "Barlow Condensed",Arial`;ctx.fillText('PAUSA',w/2,h*.45);ctx.fillStyle='#ffffffa8';ctx.font='700 11px "DM Sans",Arial';ctx.fillText('TOCA ▶ PARA CONTINUAR',w/2,h*.45+30)}}
function frame(now){const dt=Math.min(.04,(now-last)/1000||0);last=now;update(dt);render();requestAnimationFrame(frame)}menu();requestAnimationFrame(frame);
})();
