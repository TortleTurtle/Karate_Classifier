export default class Technique {
    poses = [];
    poseIndex = 0;

    constructor(poseLabels) {
        poseLabels.forEach((poseLabel) => {
            this.poses.push(poseLabel);
        })
    }

    checkPose(result){
        if (result.label === this.poses[this.poseIndex] && result.confidence > 0.80){
            if (this.poseIndex >= this.poses.length) {
                this.poseIndex = 0;
                return "next technique";
            } else {
                this.poseIndex++;
                return "next pose";
            }
        }
    }
}