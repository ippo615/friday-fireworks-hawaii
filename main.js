function dumpObject(obj, lines = [], isLast = true, prefix = '') {
    const localPrefix = isLast ? '└─' : '├─';
    lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || '*no-name*'} [${obj.type}]`);
    const newPrefix = prefix + (isLast ? '  ' : '│ ');
    const lastNdx = obj.children.length - 1;
    obj.children.forEach((child, ndx) => {
        const isLast = ndx === lastNdx;
        dumpObject(child, lines, isLast, newPrefix);
    });
    return lines;
}

CameraControls.install( { THREE: THREE } );

// not very useful for the style of animations we have
function transitionAction(previousAction, nextAction, duration){
    if( previousAction !== nextAction ){
        previousAction.fadeOut(duration);
    }
    nextAction
        .reset()
        .setEffectiveTimeScale( 1 )
        .setEffectiveWeight( 1 )
        .fadeIn( duration )
        .play();
}

// NOTE: every action in actions must be unique otherwise
// it will not play the way you expect.
// For example: actions=['a','b','a','b','c']
// will ask 'a' to play at time 0 and then will ask 'a'
// to play after 'b' but it's the same 'a' so it's behavior
// will be unexpected (I forget it is just plays at the
// first time or the last time)
function playActionSequence(actions){
    // Stop and reset all the actions
    for( let i=0, l=actions.length; i<l; i+=1 ){
        actions[0].stop();
    }
    // Play all of the actions at the correct time
    actions[0].play();
    let cumulativeTime = 0.0;
    for( let i=1, l=actions.length; i<l; i+=1 ){
        cumulativeTime += actions[i-1].duration;
        // console.info(i);
        // console.info(actions);
        // console.info(actions[i]);
        actions[i].startAt(cumulativeTime).play();
    }
}

function loadAnimationClip(mixer, animations, clipName){
    var clip = THREE.AnimationClip.findByName(animations, clipName);
    var action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.enable = true;
    //action.zeroSlopeAtEnd = false;
    //action.zeroSlopeAtStart = false;
    return action;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 750, window.innerWidth / window.innerHeight, 0.1, 1000 );
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();
var mixer;
var actions = {};
var globalGltf;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMappingExposure = 2.3;
renderer.gammaFactor = 0;
document.body.appendChild( renderer.domElement );
const cameraControls = new CameraControls( camera, renderer.domElement );
camera.position.z = 50;

//const geometry = new THREE.BoxGeometry();
//const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
//const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

const light_color = 0xFFFFFF;
const light_intensity = 1.0;
const light = new THREE.AmbientLight(light_color, light_intensity);
scene.add(light);

//const skyColor = 0xB1E1FF;  // light blue
//const groundColor = 0xB97A20;  // brownish orange
//const intensity = 0.6;
//const light2 = new THREE.HemisphereLight(skyColor, groundColor, intensity);
//scene.add(light2);
function randomColor(){
    let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff];
    return colors[Math.floor(Math.random()*colors.length)];
}
function randomChoice(options){
    return options[Math.floor(Math.random()*options.length)];
}
// var texture = textureLoader.load('assets/white_to_black.png')
var texture = textureLoader.load('assets/sparkle01.png');
var defaultTexutre = texture;
var textures = [
    textureLoader.load('assets/sparkle01.png'),
    textureLoader.load('assets/star.png'),
    textureLoader.load('assets/star_p7.png'),
    textureLoader.load('assets/star_p11.png'),
    textureLoader.load('assets/white_to_black.png'),
];
// for(let i=0; i<100; i+=1){
//     var flareMat = new THREE.SpriteMaterial({
//         map: texture,
//         color: new THREE.Color(randomColor()),
//         // side: THREE.DoubleSide,
//         transparent: true,
//     });
//     flareMat.blending = THREE.CustomBlending;
//     flareMat.blendEquation = THREE.AddEquation; //default
//     flareMat.blendSrc = THREE.OneFactor;
//     flareMat.blendDst = THREE.OneFactor;
//     // flareMat.opacity = 0.5; // adjustable when transparent=true
//     const flare = new THREE.Sprite(flareMat);
//     flare.position.x = 10+5*Math.random();
//     flare.position.y = 10+5*Math.random();
//     flare.position.z = 10+5*Math.random();
//     scene.add(flare);
// }


const gltfLoader = new THREE.GLTFLoader();
// const url = 'example-01.glb';  // +Y up: off
//const url = 'baked_ao_04_multi.glb'
//const url = 'assets/light_animation.glb'
const url = 'assets/07.glb'
gltfLoader.load(url, (gltf) => {
    console.info(gltf);
    console.info(dumpObject(gltf.scene));
    globalGltf = gltf;

    scene.add(gltf.scene);

    // ENABLE SHADOWS (NO WORK)
    // Need to configure and adjust things
    // gltf.scene.traverse((obj) => {
    //     if (obj.castShadow !== undefined) {
    //         obj.castShadow = true;
    //         obj.receiveShadow = true;
    //     }
    // });
    // const shadowLight = new THREE.DirectionalLight(0xffffff, 1);
    // shadowLight.castShadow = true;
    // shadowLight.position.set(-250, 800, -850);
    // shadowLight.target.position.set(-550, 40, -450);
    // shadowLight.shadow.bias = -0.004;
    // shadowLight.shadow.mapSize.width = 2048;
    // shadowLight.shadow.mapSize.height = 2048;
    // scene.add(shadowLight);
    // scene.add(shadowLight.target);
    // const shadowCam = shadowLight.shadow.camera;
    // shadowCam.near = 1;
    // shadowCam.far = 2000;
    // shadowCam.left = -1500;
    // shadowCam.right = 1500;
    // shadowCam.top = 1500;
    // shadowCam.bottom = -1500;

    renderer.render( scene, camera );

    // cameraControls.azimuthAngle = 90*Math.PI/180;
    cameraControls.polarAngle = 90*Math.PI/180;
    cameraControls.distance = 20;
    cameraControls.fitToSphere( gltf.scene, true );
    animate();
});

class Particle{
    constructor(system){
        this.colorStart = new THREE.Color(0xffffff);
        this.colorEnd = new THREE.Color(0x000000);
        this.colorNow = new THREE.Color(0xffffff);
        this.lifeTime = 10.0; // seconds??
        this.age = 0.0;
        this.isAlive = true;
        this.percent = 0.0;
        this.material = null;
        this.sprite = null;
        this.positionStart = new THREE.Vector3(0,0,0);
        this.velocity = new THREE.Vector3(0,0,0);
        this.acceleration = new THREE.Vector3(0,0,0);
        this.motionDamping = new THREE.Vector3(0.9, 0.9, 0.9);
        this.scene = null;
        this.texture = defaultTexutre;
        this.system = system;
    }
    addToScene(scene){
        this.material = new THREE.SpriteMaterial({
            map: this.texture,
            color: this.colorStart,
            transparent: true,
        });
        this.material.blending = THREE.CustomBlending;
        this.material.blendEquation = THREE.AddEquation; //default
        this.material.blendSrc = THREE.OneFactor;
        this.material.blendDst = THREE.OneFactor;
        this.sprite = new THREE.Sprite(this.material);
        this.sprite.position.copy(this.positionStart);
        scene.add(this.sprite);
        this.scene = scene;
    }
    _threeJsCleanup(){
        this.scene.remove(this.sprite);
        this.sprite = null;
        this.material = null;
        this.scene = null;
    }
    preDestroy(){}
    destroy(){
        this.preDestroy();
        this._threeJsCleanup();
        this.system = null;
    }
    _updateAge(delta){
        this.age += delta;
        if(this.age > this.lifeTime){
            this.age = this.lifeTime;
            this.isAlive = false;
        }
        this.percent = this.age / this.lifeTime;
    }
    _updateMaterial(delta){
        this.colorNow.copy(this.colorStart).lerp(this.colorEnd, this.percent);
        this.material.color.copy(this.colorNow);
        this.material.needsUpdate = true;
    }
    _updatePosition(delta){
        var a = this.acceleration.clone().multiplyScalar(delta);
        this.velocity.add(a);
        var damping = this.motionDamping.clone().multiplyScalar(delta);
        var dampingInv = (new THREE.Vector3(1,1,1)).sub(damping);
        this.velocity.multiply(dampingInv);
        this.sprite.position.add(this.velocity);
    }
    preUpdate(delta){}
    postUpdate(delta){}
    update(delta){
        if(!this.isAlive){return}
        this.preUpdate(delta);
        this._updateAge(delta);
        this._updateMaterial(delta);
        this._updatePosition(delta);
        this.postUpdate(delta);
    }
}
class TrailParticle extends Particle {
    constructor(system){
        super(system)
        this.trailFadeTime = 1; // seconds
        this.trailMinimumSpeed = 0.01; // velocity.length
        this.trailLikelyhood = 0.25;
        this.trailParticleGenerator = function(original){
            let p = new Particle(original.system);
            p.positionStart.copy(original.sprite.position);
            p.colorStart.copy(original.colorStart);
            // p.velocity.random().multiply(this.velocity);
            // p.velocity.random().multiplyScalar(0.5-Math.random());
            p.lifeTime = original.trailFadeTime;
            return p;
        }
    }
    postUpdate(delta){
        // only add a trail when moving fast enough
        if(this.velocity.length() < this.trailMinimumSpeed){
            return
        }
        // randomly select when to add trail particles based on likelyhood
        if(this.trailLikelyhood < Math.random()){
            return
        }
        let p = this.trailParticleGenerator(this);
        this.system.particles.push(p);
        p.addToScene(this.scene);
    }
}
class Twinkle extends Particle{
    constructor(system){
        super(system)
        this.frequency = 100+30*Math.random();
        this.offset = Math.random();
    }
    _updateAge(delta){
        this.age += delta;
        this.percent = this.age / this.lifeTime;
    }
    _updateMaterial(delta){
        let amplitude = 0.5+0.5*Math.sin(this.frequency*this.percent*Math.PI/2+this.offset);
        if(this.age > this.lifeTime){
            if(amplitude > 0.95){
                this.isAlive = false;
            }
        }
        this.colorNow.copy(this.colorStart).lerp(this.colorEnd, amplitude);
        this.material.color.copy(this.colorNow);
        this.material.needsUpdate = true;
    }
}
class FireWorkShell extends TrailParticle {
    constructor(system){
        super(system);
        this.colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff];
        this.textures = textures;
    }
    preDestroy(){
        this.system.burst(Twinkle, Math.floor(50+100*Math.random()), this.sprite.position, 0.5, this.colors, this.textures)
    }
}
class ParticleSystem{
    constructor(){
        this.particles = [];
    }
    launch(ParticleType, positionStart, lanuchSpeed, color){
        let p = new ParticleType(this);
        p.positionStart.copy(positionStart);
        p.colorStart = new THREE.Color(color);
        p.motionDamping = new THREE.Vector3(2.0, 2.0, 2.0);
        p.acceleration = new THREE.Vector3(0, -0.01, 0);
        p.lifeTime = 1.0;
        p.velocity.x = (0.5-Math.random())*lanuchSpeed.x;
        p.velocity.y = lanuchSpeed.y;
        p.velocity.z = (0.5-Math.random())*lanuchSpeed.z;
        p.addToScene(scene);
        this.particles.push(p);
        return p;
    }
    burst(ParticleType, count, positionStart, maxSpeed, colors, textures){
        for(let i=0; i<count; i+=1){
            let p = new ParticleType(this);
            p.positionStart.copy(positionStart);
            p.colorStart = new THREE.Color(randomChoice(colors));
            p.motionDamping = new THREE.Vector3(2.0, 2.0, 2.0);
            p.acceleration = new THREE.Vector3(0, -0.01, 0);
            p.lifeTime = 1.0;
            p.texture = randomChoice(textures);
            p.velocity.x = (0.5-Math.random())*maxSpeed;
            p.velocity.y = (0.5-Math.random())*maxSpeed;
            p.velocity.z = (0.5-Math.random())*maxSpeed;
            p.velocity.normalize().multiplyScalar((0.5-Math.random())*maxSpeed)
            p.addToScene(scene);
            p.sprite.scale.multiplyScalar(0.5+Math.random()*0.5);
            this.particles.push(p);
        }
    }
    update(delta){
        // update the particles
        for(let i=0, l=this.particles.length; i<l; i+=1){
            let p = this.particles[i];
            p.update(delta);
        }
        // cleanup any dead particles
        let deadParticles = this.particles.filter(p => ! p.isAlive);
        this.particles = this.particles.filter(p => p.isAlive);
        for(let i=0, l=deadParticles.length; i<l; i+=1){
            let p = deadParticles[i];
            p.destroy();
        }
        // update the light
        light.intensity = 1.0+this.particles.length / 100.0;
    }
}

let particles = [];
// for(let i=0; i<100; i+=1){
//     let p = new Particle();
//     let maxSpeed = 0.5;
//     p.colorStart = new THREE.Color(randomColor());
//     p.positionStart = new THREE.Vector3(0,5,0);
//     p.velocity.x = (0.5-Math.random())*maxSpeed;
//     p.velocity.y = (0.5-Math.random())*maxSpeed;
//     p.velocity.z = (0.5-Math.random())*maxSpeed;
//     p.addToScene(scene);
//     particles.push(p);
// }

let colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff];
let particleSystem = new ParticleSystem();
particleSystem.burst(Twinkle, 100, new THREE.Vector3(0,15,0), 1.0, colors, textures);

const animate = function () {
    requestAnimationFrame( animate );
    const delta = clock.getDelta();
    const hasControlsUpdated = cameraControls.update( delta );
    particleSystem.update(delta);
    for(let i=0, l=particles.length; i<l; i+=1){
        particles[i].update(delta);
    }
    if(mixer){
        mixer.update(delta);
    }
    renderer.render( scene, camera );
};

function launchFireWorks(){
    let startPosition = new THREE.Vector3(0,0,0);
    startPosition.x = 10-Math.random()*20;
    startPosition.y = 0;
    startPosition.z = 10-Math.random()*20;
    let shell = particleSystem.launch(FireWorkShell, startPosition, new THREE.Vector3(0.1, 0.5, 0.1), 0xffffff);
    if(Math.random()<0.9){
        shell.colors = [randomChoice(colors)];
    }
    if(Math.random()<0.9){
        shell.textures = [randomChoice(textures)];
    }
    // particleSystem.burst(FireWorkShell, 100, new THREE.Vector3(0,15,0), 0.5, colors);
    // particleSystem.burst(TrailParticle, 100, new THREE.Vector3(0,15,0), 0.5, colors);
}
window.addEventListener('mousedown', launchFireWorks);

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.render( scene, camera );
}

