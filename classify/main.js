import Technique from "./Technique.js";
import {UI} from "./UI.js";

class Main {
    //ml5 variables
    poseNet;
    poses = []; //aray of detected poses
    video;
    neuralNetwork;
    options = {
        task: 'classification',
        inputs: 34,
        outputs: 6,
        debug: true
    }
    modelDetails = {
        model: '../static/models/poses4/model.json',
        metadata: '../static/models/poses4/model_meta.json',
        weights: '../static/models/poses4/model.weights.bin'
    }

//UI
    width = 640;
    height = 480;

//other variables
    ready = false
    techniques = [
        new Technique(["Choko Tsuki - Right", "Choko Tsuki - Left"]),
        new Technique(["Kagi Tsuki - Right", "Kagi Tsuki - Left"])
    ];
    currentTechnique;

    constructor() {
        this.loadModels();
    }

    update(){
        requestAnimationFrame(() => UI.getInstance().draw(this.video ,this.poses));
        if (this.poses.length > 0 && this.ready) {
            let pose = this.poses[0].pose;
            let inputs = [];
            pose.keypoints.forEach((keypoint) => {
                inputs.push(keypoint.position.x);
                inputs.push(keypoint.position.y);
            });
            if (inputs.length > this.options.inputs) {
                inputs = inputs.slice(0, this.options.inputs);
                this.neuralNetwork.classify(inputs, (err, results) => {
                    UI.getInstance().displayResults(results);
                    this.currentTechnique.checkPose(results[0]);
                });
            }
        }
    }

    async getVideo() {
        // Grab elements, create settings, etc.
        const videoElement = document.createElement("video");
        videoElement.setAttribute("style", "display: none;");
        videoElement.width = this.width;
        videoElement.height = this.height;
        document.body.appendChild(videoElement);

        // Create a webcam capture
        const capture = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = capture;
        videoElement.play();

        return videoElement;
    }
    async loadModels(){
        this.video = await this.getVideo();
        this.poseNet = ml5.poseNet(this.video);
        // This sets up an event that fills the global variable "poses"
        // with an array every time new poses are detected
        this.poseNet.on("pose", (results) => {
            this.poses = results;
            this.update();
        });

        this.neuralNetwork = ml5.neuralNetwork(this.options);
        this.neuralNetwork.load(this.modelDetails, (this.modelReady).bind(this)); //Bind the instacne to the callback.
    }

    modelReady() {
        UI.getInstance().changeStatus("Model Loaded!");
        this.pickTechnique();
        this.ready = true;
    }
    pickTechnique() {
        let i = Math.round(Math.random() * (this.techniques.length - 1));
        console.log(i);
        this.currentTechnique = this.techniques[i];
        UI.getInstance().changeStatus(`Show: ${this.currentTechnique.poses[0]}`);
    }
}

new Main();