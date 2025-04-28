import * as e from "three";
import { MindARThree as t } from "transAR";

export const i = [
    {
        id: 0,
        name: "target1",
        videoSrc: "../../assets/c2_videos/1.mp4",
        scale: 1,
    },
    {
        id: 1,
        name: "target2",
        videoSrc: "../../assets/c2_videos/2.mp4",
        scale: 1,
    },
    {
        id: 2,
        name: "target3",
        videoSrc: "../../assets/c2_videos/3.mp4",
        scale: 1,
    },
    {
        id: 3,
        name: "target4",
        videoSrc: "../../assets/c2_videos/4.mp4",
        scale: 1,
    },
    {
        id: 4,
        name: "target5",
        videoSrc: "../../assets/c2_videos/5.mp4",
        scale: 1,
    },
    {
        id: 5,
        name: "target6",
        videoSrc: "../../assets/c2_videos/6.mp4",
        scale: 1,
    },
    // Add more targets here as needed
];

let chromaKeyShader = {
    uniforms: {
        tDiffuse: { value: null },
        chromaKeyColor: { value: new e.Vector3(0, 1, 0) },
        threshold: { value: 0.7 },
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform vec3 chromaKeyColor;
        uniform float threshold;
        varying vec2 vUv;
        void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            float dist = distance(texel.rgb, chromaKeyColor);
            float alpha = dist < threshold ? 0.0 : 1.0;
            gl_FragColor = vec4(texel.rgb, alpha);
        }
    `,
};

class ARScene {
    constructor() {
        (this.mindarThree = null),
            (this.targetObjects = []),
            (this.smoothFactor = 0.3),
            (this.smoothedPosition = new e.Vector3()),
            (this.smoothedRotation = new e.Quaternion()),
            (this.isTracking = !1);
    }
    async initialize() {
        this.mindarThree = new t({
            container: document.querySelector("#ar_container"),
            imageTargetSrc: "./markers/targets.mind",
            maxTrack: 1,
            filterMinCF: 0.001,
            filterBeta: 0.01,
        });
        let { renderer: e, scene: i, camera: r } = this.mindarThree;
        (this.scene = i),
            (this.camera = r),
            (this.renderer = e),
            await this.setupTargets();
    }
    async setupTargets() {
        this.targetObjects = i.map((t) => {
            let i = this.mindarThree.addAnchor(t.id),
                r = document.createElement("video");
            (r.src = t.videoSrc),
                r.setAttribute("preload", "auto"),
                r.setAttribute("loop", ""),
                r.setAttribute("muted", ""),
                r.setAttribute("playsinline", ""),
                r.setAttribute("webkit-playsinline", "");
            let o = new e.VideoTexture(r);
            (o.minFilter = e.LinearFilter),
                (o.magFilter = e.LinearFilter),
                (o.format = e.RGBAFormat),
                (o.crossOrigin = "anonymous");
            let s = new e.PlaneGeometry(1, 1),
                n = new e.ShaderMaterial({
                    uniforms: {
                        ...chromaKeyShader.uniforms,
                        tDiffuse: { value: o },
                    },
                    vertexShader: chromaKeyShader.vertexShader,
                    fragmentShader: chromaKeyShader.fragmentShader,
                    transparent: !0,
                }),
                a = new e.Mesh(s, n);
            return (
                i.group.add(a),
                { anchor: i, video: r, videoPlane: a, name: t.name }
            );
        });
    }
    async start() {
        await this.mindarThree.start(),
            this.renderer.setAnimationLoop(() => this.update());
    }
    stop() {
        this.mindarThree.stop(),
            this.renderer.setAnimationLoop(null),
            this.targetObjects.forEach((e) => {
                e.video.pause();
            });
    }
    startTracking() {
        this.isTracking = !0;
        let e = document.querySelector(".scanning");
        e &&
            ((e.style.display = "flex"),
            (e.style.top = "50%"),
            (e.style.left = "50%"),
            (e.style.transform = "translate(-50%, -50%)"));
    }
    stopTracking() {
        this.isTracking = !1;
        let e = document.querySelector(".scanning");
        e && (e.style.display = "none");
    }
    update() {
        this.isTracking &&
            (this.targetObjects.forEach((e) => {
                e.anchor.visible
                    ? (e.video.play(),
                      (e.videoPlane.visible = !0),
                      this.smoothedPosition.lerp(
                          e.anchor.group.position,
                          this.smoothFactor
                      ),
                      e.anchor.group.position.copy(this.smoothedPosition),
                      this.smoothedRotation.slerp(
                          e.anchor.group.quaternion,
                          this.smoothFactor
                      ),
                      e.anchor.group.quaternion.copy(this.smoothedRotation))
                    : (e.video.pause(), (e.videoPlane.visible = !1));
            }),
            this.renderer.render(this.scene, this.camera));
    }
}

class UIService {
    constructor() {
        (this.instructionCard = document.querySelector(".instruction-card")),
            (this.closeButton = document.querySelector(".close-button")),
            (this.recordButton = document.getElementById("recordButton")),
            (this.videoPopup = document.getElementById("videoPopup")),
            (this.videoPopupClose =
                document.querySelector(".video-popup-close")),
            (this.recordedVideo = document.getElementById("recordedVideo")),
            (this.scanningElement = document.querySelector(".scanning")),
            (this.downloadBtn = document.getElementById("downloadVideoBtn")),
            (this.shareBtn = document.getElementById("shareVideoBtn")),
            this.setRecordingButtonState(!1),
            this.hideScanning(),
            (this.isTouching = !1);
    }
    bindEvents(e, t, i) {
        this.closeButton.addEventListener("click", () => {
            this.hideInstructions(), this.showScanning(), e();
        }),
            this.recordButton.addEventListener("mousedown", t),
            this.recordButton.addEventListener("mouseup", i),
            this.recordButton.addEventListener("mouseleave", i),
            this.recordButton.addEventListener("touchstart", (e) => {
                e.preventDefault(), (this.isTouching = !0), t();
            }),
            this.recordButton.addEventListener("touchend", (e) => {
                e.preventDefault(), (this.isTouching = !1), i();
            }),
            this.recordButton.addEventListener("touchcancel", (e) => {
                e.preventDefault(), (this.isTouching = !1), i();
            }),
            this.videoPopupClose.addEventListener("click", () =>
                this.closeVideoPopup()
            ),
            this.videoPopupClose.addEventListener("touchend", () =>
                this.closeVideoPopup()
            ),
            this.downloadBtn &&
                this.downloadBtn.addEventListener("click", () =>
                    this.downloadVideo()
                ),
            this.shareBtn &&
                this.shareBtn.addEventListener("click", () =>
                    this.shareVideo()
                );
    }
    showInstructions() {
        this.instructionCard.style.display = "block";
    }
    hideInstructions() {
        this.instructionCard.style.display = "none";
    }
    setRecordingState(e) {
        this.recordButton.classList.toggle("recording", e);
    }
    setRecordingButtonState(e) {
        (this.recordButton.style.opacity = e ? "1" : "0.5"),
            (this.recordButton.style.pointerEvents = e ? "auto" : "none"),
            (this.recordButton.style.touchAction = e ? "none" : "auto");
    }
    showCloseButton() {
        this.closeButton.style.display = "block";
    }
    hideCloseButton() {
        this.closeButton.style.display = "none";
    }
    showScanning() {
        this.scanningElement && (this.scanningElement.style.display = "flex");
    }
    hideScanning() {
        this.scanningElement && (this.scanningElement.style.display = "none");
    }
    showVideoPopup() {
        this.videoPopup.classList.add("active");
    }
    closeVideoPopup() {
        this.videoPopup.classList.remove("active"),
            this.recordedVideo.pause(),
            (this.recordedVideo.currentTime = 0);
    }
    downloadVideo() {
        let e = this.recordedVideo;
        if (!e || !e.src) return;
        let t = document.createElement("a");
        (t.href = e.src),
            (t.download = "recorded-video.mp4"),
            document.body.appendChild(t),
            t.click(),
            document.body.removeChild(t);
    }
    async shareVideo() {
        let e = this.recordedVideo;
        if (e && e.src)
            try {
                let t = await fetch(e.src),
                    i = await t.blob(),
                    r = new File([i], "recorded-video.mp4", {
                        type: "video/mp4",
                    });
                navigator.canShare && navigator.canShare({ files: [r] })
                    ? await navigator.share({
                          files: [r],
                          title: "Recorded Video",
                      })
                    : alert("Sharing is not supported on this device/browser.");
            } catch (o) {
                alert("Failed to share video.");
            }
    }
}

class RecordingService {
    constructor() {
        (this.mediaRecorder = null),
            (this.recordedChunks = []),
            (this.recordingTimeout = null),
            (this.animationFrameId = null),
            (this.maxRecordingTime = 1e4),
            (this.recordingCanvas = null),
            (this.actualMimeType = null),
            (this.recordingStream = null),
            (this.isAndroid = /Android/i.test(navigator.userAgent));
    }
    isIOSDevice() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }
    isAndroidDevice() {
        return /Android/.test(navigator.userAgent);
    }
    isMobileDevice() {
        return this.isIOSDevice() || this.isAndroidDevice();
    }
    isChromeBased() {
        return (
            /Chrome/.test(navigator.userAgent) &&
            !/Edge|Edg/.test(navigator.userAgent)
        );
    }
    async handleRecordingComplete() {
        let e = new Blob(this.recordedChunks, { type: "video/mp4" }),
            t = document.getElementById("recordedVideo"),
            i = document.getElementById("videoPopup"),
            r = document.getElementById("downloadVideoBtn"),
            o = document.getElementById("shareVideoBtn");
        (r.disabled = !0), (o.disabled = !0), i.classList.add("active");
        try {
            t.src = URL.createObjectURL(e);
        } catch (s) {
            console.error("Error processing video:", s);
        } finally {
            (r.disabled = !1), (o.disabled = !1);
        }
        this.cleanup();
    }
    async startRecording(e) {
        try {
            if (this.mediaRecorder?.state === "recording") return;
            let {
                canvas: t,
                video: i,
                container: r,
            } = this.getRecordingElements(e);
            if (!this.validateElements(t, i, r)) return;
            let o = this.isAndroidDevice(),
                s = this.createCombinedCanvas(r, o);
            this.recordingCanvas = s;
            try {
                await this.setupRecordingWithFallbacks(s, t, i);
            } catch (n) {
                console.error("All recording methods failed:", n),
                    this.cleanup(),
                    alert("Sorry, recording is not supported on your device.");
            }
        } catch (a) {
            console.error("Error in startRecording:", a), this.cleanup();
        }
    }
    async setupRecordingWithFallbacks(e, t, i) {
        try {
            let r = this.setupRecordingStream(e, t, i);
            (this.recordingStream = r),
                this.initializeMediaRecorder(r),
                this.startRecordingAnimation(e, t, i),
                this.setRecordingTimeout();
            return;
        } catch (o) {
            if (
                (console.warn(
                    "Standard recording failed, trying alternative method:",
                    o
                ),
                this.isAndroid)
            )
                try {
                    let s = this.setupRecordingStream(e, t, i);
                    (this.recordingStream = s),
                        this.initializeMediaRecorder(s),
                        this.startRecordingAnimation(e, t, i),
                        this.setRecordingTimeout();
                    return;
                } catch (n) {
                    throw (
                        (console.warn("Android WebM recording failed:", n),
                        Error("All recording methods failed"))
                    );
                }
            else throw o;
        }
    }
    stopRecording() {
        try {
            this.mediaRecorder?.state === "recording" &&
                this.mediaRecorder.stop();
        } catch (e) {
            console.error("Error stopping recording:", e);
        } finally {
            this.cleanup();
        }
    }
    getRecordingElements(e) {
        let t = document.getElementById(e),
            i = t.querySelector("canvas[data-engine='three.js r160']"),
            r = t.querySelector("video");
        return { canvas: i, video: r, container: t };
    }
    validateElements(e, t, i) {
        return (
            (!!e && !!t && !!i) ||
            (console.error("Required recording elements not found"), !1)
        );
    }
    createCombinedCanvas(e, t = !1) {
        let i = document.createElement("canvas"),
            r = e.clientWidth,
            o = e.clientHeight;
        return (
            t && ((r = Math.floor(0.75 * r)), (o = Math.floor(0.75 * o))),
            (i.width = r),
            (i.height = o),
            i
        );
    }
    setupRecordingStream(e, t, i) {
        let r = e.getContext("2d"),
            o = window.getComputedStyle(t),
            s = window.getComputedStyle(i),
            n = () => {
                r.clearRect(0, 0, e.width, e.height);
                let n = parseInt(s.left),
                    a = parseInt(s.top),
                    d = parseInt(s.width),
                    c = parseInt(s.height);
                r.drawImage(i, n, a, d, c);
                let h = parseInt(o.left),
                    l = parseInt(o.top),
                    u = parseInt(o.width),
                    m = parseInt(o.height);
                r.drawImage(t, h, l, u, m);
            };
        return (this.drawFrame = n), e.captureStream(this.isAndroid ? 10 : 30);
    }
    initializeMediaRecorder(e) {
        this.recordedChunks = [];
        try {
            let t = null;
            for (let i of [
                "video/mp4",
                "video/mp4;codecs=avc1",
                "video/mp4;codecs=h264",
                "video/webm;codecs=vp8",
            ])
                if (MediaRecorder.isTypeSupported(i)) {
                    t = i;
                    break;
                }
            if (!t) throw Error("No supported MIME type found");
            let r = this.isAndroid ? 1e6 : 25e5;
            (this.mediaRecorder = new MediaRecorder(e, {
                mimeType: t,
                videoBitsPerSecond: r,
            })),
                (this.mediaRecorder.ondataavailable = (e) => {
                    e.data.size > 0 && this.recordedChunks.push(e.data);
                }),
                (this.mediaRecorder.onstop = () =>
                    this.handleRecordingComplete()),
                this.mediaRecorder.start();
        } catch (o) {
            throw (console.error("Error initializing MediaRecorder:", o), o);
        }
    }
    startRecordingAnimation(e, t, i) {
        let r = () => {
            this.drawFrame(),
                (this.animationFrameId = requestAnimationFrame(r));
        };
        r();
    }
    setRecordingTimeout() {
        this.recordingTimeout = setTimeout(() => {
            this.stopRecording();
        }, this.maxRecordingTime);
    }
    cleanup() {
        this.animationFrameId &&
            (cancelAnimationFrame(this.animationFrameId),
            (this.animationFrameId = null)),
            this.recordingTimeout &&
                (clearTimeout(this.recordingTimeout),
                (this.recordingTimeout = null)),
            this.recordingStream &&
                (this.recordingStream.getTracks().forEach((e) => e.stop()),
                (this.recordingStream = null)),
            this.recordingCanvas &&
                (this.recordingCanvas.remove(), (this.recordingCanvas = null)),
            (this.mediaRecorder = null),
            (this.recordedChunks = []);
    }
}

class App {
    constructor() {
        (this.arScene = new ARScene()),
            (this.recordingService = new RecordingService()),
            (this.uiService = new UIService()),
            this.initialize();
    }
    initialize() {
        this.bindEvents(), this.setActualHeight(), this.start();
    }
    setActualHeight() {
        let e = document.querySelector(".full-screen-container"),
            t = document.querySelector(".video-popup"),
            i = document.querySelector(".ui_container"),
            s = window.innerHeight;
        e && (e.style.height = `${s}px`),
            i && (i.style.height = `${s}px`),
            t && (t.style.height = `${s}px`);
    }
    bindEvents() {
        this.uiService.bindEvents(
            () => this.onCloseInstructions(),
            () => this.startRecording(),
            () => this.stopRecording()
        ),
            window.addEventListener("resize", () => this.setActualHeight()),
            window.addEventListener("orientationchange", () =>
                this.setActualHeight()
            );
    }
    async onCloseInstructions() {
        this.arScene.startTracking(),
            this.uiService.setRecordingButtonState(!0);
    }
    async startRecording() {
        document.body.classList.add("recording"),
            await this.recordingService.startRecording("ar_container"),
            this.uiService.setRecordingState(!0);
    }
    stopRecording() {
        document.body.classList.remove("recording"),
            this.recordingService.stopRecording(),
            this.uiService.setRecordingState(!1);
    }
    async start() {
        this.uiService.showInstructions();
        try {
            await this.arScene.initialize(),
                await this.arScene.start(),
                this.uiService.showCloseButton();
        } catch (e) {
            console.error("Failed to initialize AR scene:", e);
        }
    }
    stop() {
        this.arScene.stop();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new App();
});
