import * as THREE from 'three';
import { gsap } from "gsap";
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Initialize
const textureLoader = new THREE.TextureLoader()
let isDoorOpen = false;
let isMove = false;
let isSit = false;
let isIphoneOn = true;
let ballMoveDistance = 1;

// Constant Variables
const walkSpeed = 0.1;

// Add Scene
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);
// Cam -> FOV, Aspect Ratio, Near Clip, Far Clip
var cam = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 100);
cam.position.z += 15;
cam.position.y = 0.75;
// Add Renderer
var renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// Add Models
const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

// Add Ball
const collBall = [];
let modelBall;
gltfLoader.load('models/hyper_realistic_low_poly_3d_soccer_ball_model/scene.gltf', function (gltf) {
    modelBall = gltf.scene;
    modelBall.position.set(3, -1, 0);
    modelBall.scale.set(0.25, 0.25, 0.25);

    scene.add(modelBall);

    modelBall.traverse(function (child) {
        if (child.isMesh) {
            collBall.push(child);
        }
    });
}, undefined, function (error) {
    console.error(error);
});

//Office Interior
const collOffice = [];
let modelOffice;
gltfLoader.load( 'models/studio_office_interior/scene.gltf', function ( gltf ) {
    modelOffice = gltf.scene;
    modelOffice.position.set(0,-1,0);

	scene.add( modelOffice );

    modelOffice.traverse(function(child){
        if(child.isMesh){
            collOffice.push(child);
        }
    });
}, undefined, function ( error ) {
	console.error( error );
});

// Door 
const collDoor = [];
let modelDoor;
objLoader.load( 'models/door/model_2.obj', function ( object ) {
    modelDoor = object;
    modelDoor.position.set(-3.6,-1,4.7);
	scene.add( modelDoor );

    modelDoor.traverse(function(child){
        if(child.isMesh){
            collDoor.push(child);
            
            // Apply the Wallnut_wood.png texture
            const texture = textureLoader.load('models/door/Wallnut_wood.png');
            child.material = new THREE.MeshPhongMaterial({ map: texture });

            // Apply the Lightmap.png as lightmap texture
            const lightmapTexture = textureLoader.load('models/door/Lightmap.png');
            child.material.lightMap = lightmapTexture;
        }
    });
}, undefined, function ( error ) {
	console.error( error );
});
// Handle
let modelHandle;
objLoader.load( 'models/door/model_1.obj', function ( object ) {
    modelHandle = object;
    modelHandle.position.set(-3.6,-1,4.7);
	scene.add( modelHandle );

    modelHandle.traverse(function(child){
        if(child.isMesh){
            collDoor.push(child);
        }
    });
}, undefined, function ( error ) {
	console.error( error );
});

// Office Table
const collTable = [];
let modelTable;
gltfLoader.load( 'models/office-desk/source/office_desk_140x60/scene.gltf', function ( gltf ) {
    modelTable = gltf.scene;
    modelTable.position.set(-3,-1,-5.5); // -3, -10,5
    modelTable.scale.set(1.5,1.5,1.5);

	scene.add( modelTable );

    modelTable.traverse(function(child){
        if(child.isMesh){
            collTable.push(child);
        }
    });
}, undefined, function ( error ) {
	console.error( error );
});

// Office Chair
const collChair = [];
let modelChair;
gltfLoader.load( 'models/office_chair/scene.gltf', function ( gltf ) {
    modelChair = gltf.scene;
    modelChair.position.set(-3,-0.20,-4.5);
    modelChair.scale.set(1.5,1.5,1.5);
    modelChair.rotation.y = Math.PI;

	scene.add( modelChair );

    modelChair.traverse(function(child){
        if(child.isMesh){
            collChair.push(child);
        }
    });
}, undefined, function ( error ) {
	console.error( error );
});

// Desk Lamp
const collLamp = [];
let modelLamp;
gltfLoader.load( 'models/desk_lamp/scene.gltf', function ( gltf ) {
    modelLamp = gltf.scene;
    modelLamp.position.set(-3.5,0.1,-5.5);
    modelLamp.scale.set(0.3,0.3,0.3);

	scene.add( modelLamp );

    modelLamp.traverse(function(child){
        if(child.isMesh){
            collLamp.push(child);
        }
    });
}, undefined, function ( error ) {
	console.error( error );
});

// Iphone
const collIphone = [];
let modelIphone;
gltfLoader.load('models/iphone-x/source/model.gltf', function ( gltf ){
    modelIphone = gltf.scene;
    modelIphone.scale.set(0.025, 0.025, 0.025);
    modelIphone.rotation.set(Math.PI/2, 0, Math.PI);
    modelIphone.position.set(-2.2,0.35,-5.1);

    scene.add(modelIphone);
    modelIphone.traverse(function(child){
        if(child.isMesh){
            collIphone.push(child);
        }
    })
});




// Add Plane
var plane = new THREE.PlaneGeometry(1000, 1000, 500, 500);
var planeMaterial = new THREE.MeshLambertMaterial({color : 0xaaffaa});
var planeMesh = new THREE.Mesh(plane, planeMaterial);
planeMesh.position.set(0,-1,0);
planeMesh.rotation.x = -Math.PI/2;
scene.add(planeMesh);

// Add Grid Helper
var gridHelper = new THREE.GridHelper(1000, 1000);
gridHelper.position.set(0, -1, 0); // Set the position of the grid helper
scene.add(gridHelper);


// Add Lights
var ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

var deskLight = new THREE.PointLight(0xffffff, 0.1, 30);
deskLight.position.set(-3,0.4,-5.3);
scene.add(deskLight);

// Add Controls
let raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
let controls = new PointerLockControls(cam, renderer.domElement);

let keyboard = [];
document.body.onkeydown = function(evt){
    keyboard[evt.key] = true;

    // Other Keys
    if(evt.key == "Shift" && isSit){
        isSit = false;
        isMove = true;

        cam.position.copy(modelChair.position);
        cam.position.x += 1;
        cam.position.y = 0.75;
    }
}
document.body.onkeyup = function(evt){
    keyboard[evt.key] = false;
}



function draw() {
    // Process Movement 
    if (isMove) {
        const direction = new THREE.Vector3();
        cam.getWorldDirection(direction);
        direction.setY(0);
        direction.normalize();

        if (keyboard['w']) {
            cam.position.addScaledVector(direction, walkSpeed);
        }
        if (keyboard['a']) {
            const angle = Math.PI / 2;
            const leftDirection = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
            cam.position.addScaledVector(leftDirection, walkSpeed);
        }
        if (keyboard['s']) {
            cam.position.addScaledVector(direction, -walkSpeed);
        }
        if (keyboard['d']) {
            const angle = Math.PI / 2;
            const rightDirection = direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -angle);
            cam.position.addScaledVector(rightDirection, walkSpeed);
        }
    }

    renderer.render(scene, cam);
    requestAnimationFrame(draw);
}
draw();

// Helpers
const doorHelper = new THREE.BoxHelper(modelDoor);
scene.add(doorHelper);
const boxMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
doorHelper.material = boxMaterial;



// EventListeners
window.addEventListener("click", function(){
    if(controls.isLocked){
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera(mouse, cam);
        
        // Calculate the direction from the camera's position to the center of the screen
        var cameraDirection = new THREE.Vector3();
        cam.getWorldDirection(cameraDirection);
        raycaster.ray.direction.copy(cameraDirection);

        // Check Collisions
        if(raycaster.intersectObjects(collDoor).length > 0){
            console.log("Door Clicked - " + isDoorOpen);
            if(isDoorOpen){
                isDoorOpen = false;
                gsap.to(modelDoor.rotation, {y:0});
                gsap.to(modelHandle.rotation, {y: 0});
            }
            else{
                isDoorOpen = true;
                gsap.to(modelDoor.rotation, {y:1.5});
                gsap.to(modelHandle.rotation, {y: 1.5});
            }
        }
        else if(raycaster.intersectObjects(collChair).length > 0){
            console.log("Chair Clicked");
            isSit = true;
            isMove = false;
            cam.position.copy(modelChair.position); // Duduk
            cam.position.y = 0.5;
        }
        else if(raycaster.intersectObjects(collLamp).length > 0){
            console.log("Lamp Clicked");
            if(deskLight.intensity === 0){
                deskLight.intensity = 0.1;
            }else{
                deskLight.intensity = 0;
            }
        } else if (raycaster.intersectObjects(collBall).length > 0) {
            console.log("Ball Clicked");
            const direction = new THREE.Vector3();
            cam.getWorldDirection(direction);
            direction.setY(0);
            direction.normalize();

            var newPosition = new THREE.Vector3();
            newPosition.copy(modelBall.position).addScaledVector(direction, ballMoveDistance);
            gsap.to(modelBall.position, { x: newPosition.x, z: newPosition.z, duration: 1 });
        }
    }else{
        controls.lock();
        isMove = true; // Enable Movements
    }
})
controls.addEventListener( 'unlock', function () {
    isMove = false; // Disable Movements
} );

// Crosshair
var crosshair = document.getElementById('crosshair');
var centerX = window.innerWidth / 2;
var centerY = window.innerHeight / 2;
crosshair.style.left = centerX + 'px';
crosshair.style.top = centerY + 'px';

