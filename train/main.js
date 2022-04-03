//ml5 variables
let poseNet;
let poses = []; //aray of detected poses
let video;
let neuralNetwork;
const options = {
    task: 'classification',
    inputs: 34, // must be a multiplication of 34.
    outputs: 6,
    debug: true
}
let targetLabel;
let inputs = [];

//UI
let status
let canvas;
const width = 640;
const height = 480;
let ctx;

//other variables
let recording = false;

async function setup() {
    status = document.querySelector("#status");
    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");
    //flip horizontally so left and right matches users left and right.
    ctx.translate(640,0);
    ctx.scale(-1,1);

    video = await getVideo();
    poseNet = ml5.poseNet(video, modelReady);
    // This sets up an event that fills the global variable "poses"
    // with an array every time new poses are detected
    poseNet.on("pose", function(results) {
        poses = results;
        update();
    });

    neuralNetwork = ml5.neuralNetwork(options);

    document.addEventListener("keypress", keyPressed);
    requestAnimationFrame(draw);
}

function update(){
    if (poses.length > 0) {
        let pose = poses[0].pose;

        if (recording) {
            //flatten keypoint data to array.
            let target = [targetLabel];
            pose.keypoints.forEach((keypoint) => {
                inputs.push(keypoint.position.x);
                inputs.push(keypoint.position.y);
            });
            if (inputs.length > options.inputs) {
                inputs = inputs.slice(0, options.inputs - 1);
                neuralNetwork.addData(inputs, target);
                inputs = [];
            }
        }
    }
}

setup();

//draw functions
function draw() {
    requestAnimationFrame(draw);
    ctx.drawImage(video, 0, 0, width, height);

    // We can call both functions to draw all keypoints and the skeletons
    drawKeypoints();
    drawSkeleton();
}
function drawKeypoints() {
    if (poses.length > 0) {
        //loop through all the keypoints
        const pose = poses[0].pose;
        for (let j = 0; j < pose.keypoints.length; j += 1) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            const keypoint = pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
                ctx.fillStyle = "rgb(213, 0, 143)";
                ctx.beginPath();
                ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            }
        }
    }
}
function drawSkeleton() {
    // Draw the first detected skeleton
    if (poses.length > 0) {
        const skeleton = poses[0].skeleton;
        //loop through all body connections
        for (let j = 0; j < skeleton.length; j += 1) {
            const partA = skeleton[j][0];
            const partB = skeleton[j][1];
            ctx.beginPath();
            ctx.moveTo(partA.position.x, partA.position.y);
            ctx.lineTo(partB.position.x, partB.position.y);
            ctx.strokeStyle = "#FF0000";
            ctx.stroke();
        }
    }
}

//helper functions
async function getVideo() {
    // Grab elements, create settings, etc.
    const videoElement = document.createElement("video");
    videoElement.setAttribute("style", "display: none;");
    videoElement.width = width;
    videoElement.height = height;
    document.body.appendChild(videoElement);

    // Create a webcam capture
    let capture
    try{
        capture = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (e) {
        console.error(e);
    }
    videoElement.srcObject = capture;
    videoElement.play();

    return videoElement;
}
function modelReady() {
    status.innerHTML = "Model Loaded!";
}

function keyPressed(e){
    console.log(e.code);
    switch (e.code) {
        case "Digit1":
            record("Choko Tsuki - Right");
            break;
        case "Digit2":
            record("Choko Tsuki - Left");
            break;
        case "Digit3":
            record("Kagi Tsuki - Right");
            break;
        case "Digit4":
            record("Kagi Tsuki - Left");
            break;
        case "Digit5":
            record("Heiko Dachi");
            break;
        case "Digit6":
            record("Kiba Dachi");
            break;
        case "KeyS":
            neuralNetwork.saveData();
            break;
        case "KeyL":
            console.log("Loading data");
            neuralNetwork.loadData("../static/data/poses_3.json", () => {console.log("loaded data!")});
            break;
        case "KeyT":
            neuralNetwork.normalizeData();
            neuralNetwork.train({batch: 10,epochs: 100}, () => console.log("Done Training!") );
            break;
        case "KeyM":
            neuralNetwork.save();
            break;
        default:
            console.log("This key does nothing");
            break;
    }
}

function record(label) {
    targetLabel = label;
    status.innerHTML = `Recording ${label} in 5 seconds`;
    setTimeout(() => {recording = true; status.innerHTML = `Recording: ${label}`;}, 5000);
    setTimeout(() => {recording = false; status.innerHTML = `Stopped recording: ${label}`;}, 15000);
}