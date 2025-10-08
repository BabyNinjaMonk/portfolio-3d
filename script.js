/* ===== 0. shuffle bag ===== */
const rand=(arr)=>arr[Math.floor(Math.random()*arr.length)];
const animIn=['from-top','from-left','fade','glitch'];
const pal=[0xc0a377,0x00d9ff,0xe1251b,0x0057d2];
const mood=['slow','fast','spiral'];
const picked={in:rand(animIn),color:rand(pal),speed:rand(mood)};

/* ===== 1. three boilerplate ===== */
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,100);
camera.position.set(0,0,7);
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('webgl'),alpha:true,antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
/* lights */
scene.add(new THREE.AmbientLight(0xffffff,.3));
const d=new THREE.DirectionalLight(picked.color,1.5);
d.position.set(5,5,5);
scene.add(d);

/* particles */
const pCount= picked.speed==='fast' ? 8000 : 4000;
const geo=new THREE.BufferGeometry();
const pos=new Float32Array(pCount*3);
for(let i=0;i<pCount*3;i++)pos[i]=(Math.random()-.5)*30;
geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
const mat=new THREE.PointsMaterial({color:picked.color,size:.02});
const particles=new THREE.Points(geo,mat);
scene.add(particles);

/* glass plane */
const plane=new THREE.Mesh(
  new THREE.PlaneGeometry(20,20),
  new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.05,side:THREE.DoubleSide})
);
plane.position.z=-4;
scene.add(plane);

/* ===== 2. scroll camera ===== */
gsap.registerPlugin(ScrollTrigger);
gsap.to(camera.position,{
  z:15,
  scrollTrigger:{trigger:'body',start:'top top',end:'bottom bottom',scrub:true}
});

/* ===== 3. entrance roulette ===== */
fetch('data.json').then(r=>r.json()).then(data=>{
  document.getElementById('app').innerHTML=`
  <section id="hero">
    <h1>${data.name}</h1>
    <p>${data.tag}</p>
    <p>${data.about}</p>
    <a class="btn" href="#work">Explore work</a>
  </section>
  <section id="work">
    <h2>Selected work</h2>
    <div class="cards">
    ${data.work.map(w=>`
      <div class="card">
        <h3>${w.co}</h3>
        <span>${w.date}</span>
        <p>${w.desc}</p>
      </div>`).join('')}
    </div>
  </section>
  <section id="skills">
    <h2>Skills</h2>
    <div class="bars">
    ${Object.entries(data.skills).map(([k,v])=>`
      <div class="bar">
        <label>${k}</label>
        <div class="track"><div class="fill" style="width:${v}%"></div></div>
      </div>`).join('')}
    </div>
  </section>
  <section id="contact">
    <h2>Contact</h2>
    <p>${data.email} | ${data.phone}</p>
    <a class="btn" href="${data.linkedin}" target="_blank">LinkedIn</a>
    <a class="btn" href="https://github.com/BabyNinjaMonk" target="_blank">GitHub</a>
  </section>
  `;
  /* animate skills bars */
  gsap.utils.toArray('.fill').forEach(bar=>{
    gsap.from(bar,{width:0,scrollTrigger:{trigger:bar,start:'top 90%',toggleActions:'play none none reverse'}});
  });
  /* hero anim */
  const hero=document.querySelector('#hero');
  if(picked.in==='from-top') gsap.from(hero,{y:-200,opacity:0,duration:1.6,ease:'power3'});
  if(picked.in==='from-left') gsap.from(hero,{x:-200,opacity:0,duration:1.6,ease:'power3'});
  if(picked.in==='fade') gsap.from(hero,{opacity:0,duration:2});
  if(picked.in==='glitch'){
    const tl=gsap.timeline();
    for(let i=0;i<6;i++)tl.to(hero,{x:Math.random()*10-5,y:Math.random()*10-5,duration:.04});
    tl.to(hero,{x:0,y:0,duration:.3});
  }
});

/* ===== 4. RAF ===== */
renderer.setAnimationLoop(()=>{
  particles.rotation.y+=(picked.speed==='fast'?.008:.002);
  if(picked.speed==='spiral')particles.rotation.x+=.003;
  renderer.render(scene,camera);
});
