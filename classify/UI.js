export class UI {
    static instance;

    status
    score
    canvas;
    width = 640;
    height = 480;
    ctx;

    constructor() {
        this.status = document.querySelector("#status");
        this.score = document.querySelector("#score");
        this.canvas = document.querySelector("#myCanvas");
        this.ctx = this.canvas.getContext("2d");
        //flip horizontally so left and right matches users left and right.
        this.ctx.translate(640,0);
        this.ctx.scale(-1,1);
    }

    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        else {
            this.instance = new UI();
            return this.instance;
        }
    }

    displayResults(results) {
        this.score.innerHTML = "";
        let list = document.createElement('ul');
        results.forEach((result) => {
            let li = document.createElement("li");
            li.innerHTML = `${result.label} : ${result.confidence}`;
            list.appendChild(li);
        });
        this.score.appendChild(list);
    }
    changeStatus(message) {
        this.status.innerHTML = message;
    }

    //draw functions
    draw(video, poses) {
        this.ctx.drawImage(video, 0, 0, this.width, this.height);
        // We can call both functions to draw all keypoints and the skeletons
        this.drawKeypoints(poses);
        this.drawSkeleton(poses);
    }
    drawKeypoints(poses) {
        if (poses.length > 0) {
            //loop through all the keypoints
            const pose = poses[0].pose;
            for (let j = 0; j < pose.keypoints.length; j += 1) {
                // A keypoint is an object describing a body part (like rightArm or leftShoulder)
                const keypoint = pose.keypoints[j];
                // Only draw an ellipse is the pose probability is bigger than 0.2
                if (keypoint.score > 0.2) {
                    this.ctx.fillStyle = "rgb(213, 0, 143)";
                    this.ctx.beginPath();
                    this.ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI);
                    this.ctx.fill();
                    this.ctx.stroke();
                }
            }
        }
    }
    drawSkeleton(poses) {
        // Draw the first detected skeleton
        if (poses.length > 0) {
            const skeleton = poses[0].skeleton;
            //loop through all body connections
            for (let j = 0; j < skeleton.length; j += 1) {
                const partA = skeleton[j][0];
                const partB = skeleton[j][1];
                this.ctx.beginPath();
                this.ctx.moveTo(partA.position.x, partA.position.y);
                this.ctx.lineTo(partB.position.x, partB.position.y);
                this.ctx.strokeStyle = "#FF0000";
                this.ctx.stroke();
            }
        }
    }
}