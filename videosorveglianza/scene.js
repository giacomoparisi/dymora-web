try {
const THREE = await import('./vendor/three.module.min.js');
const host = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0xf4f0e8,0);
host.appendChild(renderer.domElement);
renderer.domElement.setAttribute('aria-hidden','true');
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-10,10,8,-8,.1,100);
const target = new THREE.Vector3(0,1,0);
const world = new THREE.Group();scene.add(world);
scene.add(new THREE.HemisphereLight(0xffffff,0xb0aaa0,2.1));
const sun = new THREE.DirectionalLight(0xffffff,2.8);sun.position.set(-8,15,9);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:40});sun.shadow.bias=-.0005;sun.shadow.normalBias=.035;sun.shadow.radius=5;scene.add(sun);
const mat = (color,extra={}) => new THREE.MeshStandardMaterial({color,roughness:.85,...extra});
const white=mat(0xeae9e5), edge=mat(0xf7f6f2), concrete=mat(0xb9bab5), dark=mat(0x292929), glass=mat(0x535353,{metalness:.25,roughness:.28}), lawn=mat(0xc0c0bc), foliage=mat(0xbfbfbc), metal=mat(0x575954);
function box(w,h,d,x,y,z,material=white,parent=world){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function sphere(x,y,z,sx,sy,sz,material,parent=world){const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function rod(a,b,r,material,parent=world,r2=r){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),delta=vb.clone().sub(va);const m=new THREE.Mesh(new THREE.CylinderGeometry(r2,r,delta.length(),12),material);m.position.copy(va).add(vb).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());m.castShadow=true;parent.add(m);return m;}
// A raised architectural model, with a garden and a two-storey villa.
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.12}));ground.rotation.x=-Math.PI/2;ground.position.y=-.29;ground.receiveShadow=true;scene.add(ground);
box(11.8,.28,10,0,-.12,0,edge);box(11.45,.055,9.65,0,.05,0,concrete);
box(10.9,.05,4.1,0,.105,2.57,lawn);box(2.2,.06,8.5,-4.55,.1,0,lawn);
box(6.9,.18,5.1,.4,.2,-1.42,edge);
box(5.8,2.35,3.45,.5,1.42,-2.1,white);
// Ground-floor glazing faces the garden.
box(5.15,1.96,.065,.48,1.48,-.355,glass);
for(let x=-2.08;x<3.1;x+=1.28)box(.055,2,.085,x,1.48,-.3,dark);
box(5.35,.08,.14,.5,.51,-.28,edge);box(.1,2.07,.12,.48,1.48,-.27,edge);
box(7.0,.23,5.0,.4,2.75,-1.5,edge);
box(.18,2.35,.18,-2.95,1.45,.72,edge);box(.18,2.35,.18,3.74,1.45,.72,edge);
// Upper storey: recessed glass, wraparound balcony and parapet.
box(4.6,2.35,3.4,1.1,4.02,-2.05,white);
box(2.35,2.05,.07,-.06,4.0,-.31,glass);
box(.08,2.08,.1,-1.2,4,-.24,dark);box(.065,2.08,.1,-.12,4,-.24,dark);box(.08,2.08,.1,1.06,4,-.24,dark);
box(1.75,1.92,.07,2.26,3.9,-.315,glass);
box(.075,1.96,.1,2.22,3.9,-.25,edge);
box(.06,1.87,2.52,3.43,3.95,-2.12,glass);
for(let z=-3.32;z<-.6;z+=.85)box(.1,1.94,.05,3.48,3.95,z,dark);
box(5,.17,3.75,1.13,5.26,-2.05,edge);
box(5,.37,.13,1.13,5.5,-3.86,white);box(5,.37,.13,1.13,5.5,-.24,white);box(.13,.37,3.6,-1.31,5.5,-2.05,white);box(.13,.37,3.6,3.57,5.5,-2.05,white);
box(4.66,.03,3.37,1.13,5.36,-2.05,concrete);
// Slatted pergola above the left terrace.
for(let z=-3.6;z<=.3;z+=.29)box(1.8,.1,.075,-2.3,5.13,z,edge);
box(.11,2.24,.11,-3.15,3.97,.3,edge);box(.11,2.24,.11,-1.46,3.97,.3,edge);
for(let y=3.05;y<3.65;y+=.18){box(6.65,.045,.045,.37,y,.84,edge);box(.045,.045,4.35,-2.95,y,-1.3,edge);box(.045,.045,4.35,3.7,y,-1.3,edge);}
for(let x=-2.95;x<3.9;x+=1.1)box(.04,.84,.04,x,3.2,.84,metal);
// Deck, steps, furniture and pavers.
box(6.8,.09,1.35,.35,.35,.24,white);
for(let z=-.2;z<.9;z+=.16)box(6.65,.01,.013,.35,.4,z,concrete);
box(2.3,.13,.45,.25,.28,1.1,edge);box(2.5,.1,.42,.25,.19,1.46,edge);
for(let z=1.9;z<4.65;z+=.6)box(1.7,.07,.43,.25,.15,z,edge);
for(const x of [-1.9,1.95]){box(.9,.09,.9,x,.78,.15,concrete);for(const dx of [-.35,.35])for(const dz of [-.35,.35])rod([x+dx,.4,.15+dz],[x+dx,.75,.15+dz],.025,metal);}
box(.9,.15,.72,-2.2,2.97,-.3,concrete);box(.9,.5,.13,-2.2,3.2,-.61,white);
// Perimeter wall, hedges, planting and slim garden lamps.
box(11.5,.5,.14,0,.35,-4.65,white);box(.14,.5,8.9,-5.7,.35,-.18,white);
for(let x=-4.8;x<5.3;x+=.55)sphere(x,.57,-4.35,.36,.42,.3,foliage);
function tree(x,z,size=1){rod([x,.1,z],[x,2.4*size,z],.095,metal,world,.055);for(const [dx,dy,dz,s] of [[0,2.8,0,.8],[-.45,2.4,.15,.65],[.4,2.45,-.1,.67],[0,2.4,.4,.6]])sphere(x+dx*size,dy*size,z+dz*size,s*size,s*.87*size,s*size,foliage);box(1.35,.18,1.35,x,.18,z,edge);}
tree(-4.5,-2.3,1.02);tree(4.7,-3.45,.8);
for(const x of [-4.9,4.8])for(let z=1.2;z<4.5;z+=.7)sphere(x,.35,z,.29,.22,.27,foliage);
for(const x of [-3.7,3.8]){box(.085,.62,.085,x,.42,3.3,dark);box(.12,.07,.12,x,.7,3.3,edge);}
// Two visible cameras look out towards the garden.
function securityCamera(x,y,z,aim){const g=new THREE.Group();g.position.set(x,y,z);world.add(g);rod([0,0,-.17],[0,0,.15],.045,metal,g);box(.3,.22,.46,0,.02,.3,edge,g);box(.23,.16,.025,0,.02,.54,dark,g);sphere(0,.02,.565,.064,.064,.02,glass,g);g.rotation.y=aim;return new THREE.Vector3(x,y,z+.35);}
const origin=securityCamera(3.36,2.56,.81,-.28);securityCamera(-2.78,2.56,.81,.2);
// Ground footprint plus translucent frustum makes the camera's field of view legible.
const footprintMat = new THREE.MeshBasicMaterial({color:0x707873,transparent:true,opacity:.07,side:THREE.DoubleSide,depthWrite:false});
const beamMat = new THREE.MeshBasicMaterial({color:0x707873,transparent:true,opacity:.025,side:THREE.DoubleSide,depthWrite:false});
const a=new THREE.Vector3(-.8,.17,4.55),b=new THREE.Vector3(5.25,.17,4.3),c=new THREE.Vector3(3.35,.17,.9);
const footprintGeo=new THREE.BufferGeometry().setFromPoints([c,a,b]);footprintGeo.setIndex([0,1,2]);const footprint=new THREE.Mesh(footprintGeo,footprintMat);world.add(footprint);
const beamGeo=new THREE.BufferGeometry().setFromPoints([origin,a,b,c]);beamGeo.setIndex([0,1,2,0,3,1,0,2,3]);world.add(new THREE.Mesh(beamGeo,beamMat));
const beamLineMat=new THREE.LineBasicMaterial({color:0x707873,transparent:true,opacity:.22});world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([origin,a,b,origin]),beamLineMat));
// Cat built from solid geometry, with pointed ears, a curved tail and four legs.
const cat=new THREE.Group();world.add(cat);const catMaterial=mat(0x3d3e3b);
sphere(0,.4,0,.35,.19,.15,catMaterial,cat);sphere(.3,.52,0,.16,.16,.14,catMaterial,cat);
for(const z of [-.1,.1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.072,.17,3),catMaterial);ear.position.set(.3,.7,z);cat.add(ear);}
const catLegs=[];for(const x of [-.2,.2])for(const z of [-.1,.1])catLegs.push(rod([x,.15,z],[x,.39,z],.043,catMaterial,cat));
const tailPath=new THREE.CatmullRomCurve3([new THREE.Vector3(-.27,.4,0),new THREE.Vector3(-.55,.48,0),new THREE.Vector3(-.64,.73,.01),new THREE.Vector3(-.57,.85,.02)]);cat.add(new THREE.Mesh(new THREE.TubeGeometry(tailPath,16,.034,7,false),catMaterial));
// A walking person, articulated at the hips and shoulders.
const person=new THREE.Group();world.add(person);const personMat=mat(0x303332);
sphere(0,1.51,0,.145,.18,.145,personMat,person);sphere(0,1.08,0,.22,.35,.13,personMat,person);rod([0,1.2,0],[0,1.39,0],.065,personMat,person);
const limbs=[];for(const x of [-.13,.13]){const pivot=new THREE.Group();pivot.position.set(x,.87,0);person.add(pivot);rod([0,0,0],[0,-.71,.01],.078,personMat,pivot);sphere(0,-.72,.065,.085,.06,.145,personMat,pivot);limbs.push(pivot);}
for(const x of [-.25,.25]){const pivot=new THREE.Group();pivot.position.set(x,1.28,0);person.add(pivot);rod([0,0,0],[0,-.52,.025],.057,personMat,pivot);limbs.push(pivot);}
const ringMat=new THREE.MeshBasicMaterial({color:0x19734b,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false});const ring=new THREE.Mesh(new THREE.RingGeometry(.45,.465,64),ringMat);ring.rotation.x=-Math.PI/2;ring.position.y=.18;world.add(ring);
const label=document.getElementById('object-label');let lastP=0,lastPhase=0,lastReduced=false;
function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h,false);const view=innerWidth<701?17.7:16.3;camera.left=-view*w/h/2;camera.right=view*w/h/2;camera.top=view/2;camera.bottom=-view/2;camera.updateProjectionMatrix();render(lastP,lastPhase,lastReduced);}
function render(p,phase,reduced){lastP=p;lastPhase=phase;lastReduced=reduced;const angle=.66+(reduced?0:Math.sin(p*Math.PI)*.1);camera.position.set(Math.sin(angle)*17,12.5,Math.cos(angle)*17);camera.lookAt(target);
const catT=THREE.MathUtils.clamp((p-.3)/.35,0,1), humanT=THREE.MathUtils.clamp((p-.65)/.35,0,1);
cat.visible=phase===1;person.visible=phase===2;ring.visible=phase>0;
cat.position.set(3.75-catT*3,.17,3.2);cat.rotation.y=Math.PI;catLegs.forEach((leg,i)=>leg.rotation.z=reduced?0:Math.sin(catT*26+i%2*Math.PI)*.22);
person.position.set(4.1-humanT*2.1,.17,3.45);person.rotation.y=-Math.PI/2;limbs.forEach((limb,i)=>limb.rotation.x=reduced?0:Math.sin(humanT*18+(i%2)*Math.PI)*(i<2?.42:.32));
const color=phase===1?0x269263:phase===2?0xcd4141:0x707873;footprintMat.color.setHex(color);beamMat.color.setHex(color);beamLineMat.color.setHex(color);ringMat.color.setHex(color);footprintMat.opacity=phase?.13:.065;beamMat.opacity=phase?.045:.018;beamLineMat.opacity=phase?.45:.15;
const entity=phase===1?cat:person;ring.position.x=entity.position.x;ring.position.z=entity.position.z;label.style.opacity=phase?'1':'0';label.dataset.kind=phase===1?'cat':'human';label.textContent=phase===1?'GATTO · IGNORATO':'PERSONA · ALLARME';
scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);if(phase){const pos=entity.position.clone();pos.y+=phase===1?.9:1.9;pos.project(camera);label.style.left=(host.offsetLeft+(pos.x*.5+.5)*host.clientWidth)+'px';label.style.top=(host.offsetTop+(-pos.y*.5+.5)*host.clientHeight)+'px';}
renderer.render(scene,camera);}
window.dymoraScene=(p,phase,reduced)=>{if(p!==lastP || phase!==lastPhase || reduced!==lastReduced) render(p,phase,reduced);};
new ResizeObserver(resize).observe(host);
renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.classList.remove('ready');document.body.classList.add('no-webgl');label.style.opacity='0';});
renderer.domElement.addEventListener('webglcontextrestored',()=>{host.classList.add('ready');document.body.classList.remove('no-webgl');resize();});
resize();host.classList.add('ready');window.dispatchEvent(new Event('dymora-scene-ready'));
} catch(error) {document.body.classList.add('no-webgl');console.warn('Anteprima 3D non disponibile:',error);}
