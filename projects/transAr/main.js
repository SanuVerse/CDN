import * as t from "three";
import { MindARThree as m } from "transAr";
const a = [
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
    ],
    n = {
        uniforms: {
            tDiffuse: { value: null },
            chromaKeyColor: { value: new t.Vector3(0, 1, 0) },
            threshold: { value: 0.7 },
        },
        vertexShader:
            "varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader:
            "uniform sampler2D tDiffuse;uniform vec3 chromaKeyColor;uniform float threshold;varying vec2 vUv;void main(){vec4 texel=texture2D(tDiffuse,vUv);float dist=distance(texel.rgb,chromaKeyColor);float alpha=dist<threshold?0.:1.;gl_FragColor=vec4(texel.rgb,alpha);}",
    };
class r {
    constructor() {
        (this.m = null),
            (this.t = []),
            (this.s = 0.3),
            (this.p = new t.Vector3()),
            (this.q = new t.Quaternion()),
            (this.i = !1);
    }
    async e() {
        (this.m = new m({
            container: document.querySelector("#ar_container"),
            imageTargetSrc: "./markers/targets.mind",
            maxTrack: 1,
            filterMinCF: 0.001,
            filterBeta: 0.01,
        })),
            (this.scene = this.m.scene),
            (this.camera = this.m.camera),
            (this.renderer = this.m.renderer),
            await this.u();
    }
    async u() {
        this.t = a.map((a) => {
            const r = this.m.addAnchor(a.id),
                e = document.createElement("video");
            (e.src = a.videoSrc),
                e.setAttribute("preload", "auto"),
                e.setAttribute("loop", ""),
                e.setAttribute("muted", ""),
                e.setAttribute("playsinline", ""),
                e.setAttribute("webkit-playsinline", "");
            const i = new t.VideoTexture(e);
            (i.minFilter = t.LinearFilter),
                (i.magFilter = t.LinearFilter),
                (i.format = t.RGBAFormat),
                (i.crossOrigin = "anonymous"),
                (o = new t.PlaneGeometry(1, 1)),
                (s = new t.ShaderMaterial({
                    uniforms: { ...n.uniforms, tDiffuse: { value: i } },
                    vertexShader: n.vertexShader,
                    fragmentShader: n.fragmentShader,
                    transparent: !0,
                })),
                (c = new t.Mesh(o, s));
            r.group.add(c);
            return { anchor: r, video: e, videoPlane: c, name: a.name };
        });
    }
    async start() {
        await this.m.start(),
            this.renderer.setAnimationLoop(() => this.update());
    }
    stop() {
        this.m.stop(),
            this.renderer.setAnimationLoop(null),
            this.t.forEach((a) => a.video.pause());
    }
    startTracking() {
        this.i = !0;
        const a = document.querySelector(".scanning");
        a &&
            ((a.style.display = "flex"),
            (a.style.top = "50%"),
            (a.style.left = "50%"),
            (a.style.transform = "translate(-50%,-50%)"));
    }
    stopTracking() {
        this.i = !1;
        const a = document.querySelector(".scanning");
        a && (a.style.display = "none");
    }
    update() {
        if (!this.i) return;
        this.t.forEach((a) => {
            a.anchor.visible
                ? (a.video.play(),
                  (a.videoPlane.visible = !0),
                  this.p.lerp(a.anchor.group.position, this.s),
                  a.anchor.group.position.copy(this.p),
                  this.q.slerp(a.anchor.group.quaternion, this.s),
                  a.anchor.group.quaternion.copy(this.q))
                : (a.video.pause(), (a.videoPlane.visible = !1));
        }),
            this.renderer.render(this.scene, this.camera);
    }
}
class o {
    constructor() {
        (this.m = null),
            (this.r = []),
            (this.t = null),
            (this.a = null),
            (this.s = null),
            (this.c = null),
            (this.i = !1),
            (this.d = 1e4),
            (this.o = null),
            (this.u = null),
            (this.l = null),
            (this.h = /Android/i.test(navigator.userAgent));
    }
    e() {
        return /Android/.test(navigator.userAgent);
    }
    async n() {
        const a = new Blob(this.r, { type: "video/mp4" }),
            t = document.getElementById("recordedVideo"),
            e = document.getElementById("videoPopup"),
            i = document.getElementById("downloadVideoBtn"),
            o = document.getElementById("shareVideoBtn");
        (i.disabled = !0), (o.disabled = !0), e.classList.add("active");
        try {
            t.src = URL.createObjectURL(a);
        } catch (a) {
            console.error("Error processing video:", a);
        } finally {
            (i.disabled = !1), (o.disabled = !1);
        }
        this.c();
    }
    async startRecording(a) {
        try {
            if (this.m?.state === "recording") return;
            const { t: e, i: o, s: c } = this.s(a);
            if (!this.u(e, o, c)) return;
            const r = this.e(),
                l = this.h;
            this.o = this.d(c, l);
            try {
                await this.f(this.o, e, o);
            } catch (a) {
                console.error("All recording methods failed:", a),
                    this.c(),
                    alert("Sorry, recording is not supported on your device.");
            }
        } catch (a) {
            console.error("Error in startRecording:", a), this.c();
        }
    }
    async f(a, t, e) {
        try {
            const i = this.l(a, t, e);
            (this.u = i), (this.m = i), this.a(a, t, e), this.t();
        } catch (a) {
            console.warn(
                "Standard recording failed, trying alternative method:",
                a
            ),
                this.h ? this.f(a, t, e) : a;
        }
    }
    stopRecording() {
        try {
            this.m?.state === "recording" && this.m.stop();
        } catch (a) {
            console.error("Error stopping recording:", a);
        } finally {
            this.c();
        }
    }
    s(a) {
        const t = document.getElementById(a),
            e = t.querySelector("canvas[data-engine='three.js r160']"),
            i = t.querySelector("video");
        return { canvas: e, video: i, container: t };
    }
    u(a, t, e) {
        return !!(a && t && e);
    }
    d(a, t = !1) {
        const e = document.createElement("canvas");
        let i = a.clientWidth,
            o = a.clientHeight;
        t && ((i = Math.floor(i * 0.75)), (o = Math.floor(o * 0.75))),
            (e.width = i),
            (e.height = o);
        return e;
    }
    l(a, t, e) {
        const i = a.getContext("2d"),
            o = window.getComputedStyle(t),
            s = window.getComputedStyle(e),
            c = () => {
                i.clearRect(0, 0, a.width, a.height);
                const r = parseInt(s.left),
                    n = parseInt(s.top),
                    l = parseInt(s.width),
                    d = parseInt(s.height);
                i.drawImage(e, r, n, l, d);
                const h = parseInt(o.left),
                    u = parseInt(o.top),
                    p = parseInt(o.width),
                    f = parseInt(o.height);
                i.drawImage(t, h, u, p, f);
            };
        this.drawFrame = c;
        return a.captureStream(this.h ? 10 : 30);
    }
    m(a) {
        this.r = [];
        const t = [
                "video/mp4",
                "video/mp4;codecs=avc1",
                "video/mp4;codecs=h264",
                "video/webm;codecs=vp8",
            ],
            e = t.find((a) => MediaRecorder.isTypeSupported(a));
        if (!e) throw new Error("No supported MIME type found");
        const i = this.h ? 1e6 : 2.5e6;
        (this.m = new MediaRecorder(a, { mimeType: e, videoBitsPerSecond: i })),
            (this.m.ondataavailable = (a) => {
                a.data.size > 0 && this.r.push(a.data);
            }),
            (this.m.onstop = () => this.n());
    }
    a(a, t, e) {
        this.animationFrameId = requestAnimationFrame(() => {
            this.drawFrame(),
                (this.animationFrameId = requestAnimationFrame(() =>
                    this.a(a, t, e)
                ));
        });
    }
    t() {
        this.recordingTimeout = setTimeout(() => this.stopRecording(), this.d);
    }
    c() {
        this.recordingTimeout && clearTimeout(this.recordingTimeout),
            this.animationFrameId &&
                cancelAnimationFrame(this.animationFrameId),
            this.o && (this.o.remove(), (this.o = null)),
            this.u && this.u.getTracks().forEach((a) => a.stop()),
            (this.u = null),
            (this.m = null),
            (this.r = []),
            (this.animationFrameId = null);
    }
}
class s {
    constructor() {
        this.i = document.querySelector(".instruction-card");
        this.c = document.querySelector(".close-button");
        this.r = document.getElementById("recordButton");
        this.v = document.getElementById("videoPopup");
        this.p = document.querySelector(".video-popup-close");
        this.d = document.getElementById("recordedVideo");
        this.s = document.querySelector(".scanning");
        this.b = document.getElementById("downloadVideoBtn");
        this.h = document.getElementById("shareVideoBtn");
        this.t = !1;

        // Initialize UI state
        if (this.r) this.setRecordingButtonState(!1);
        if (this.s) this.hideScanning();
    }
    e(a, t, e) {
        // Only add event listeners if elements exist
        if (this.c) {
            this.c.addEventListener("click", () => {
                this.hideInstructions(), this.showScanning(), a();
            });
        }

        if (this.r) {
            this.r.addEventListener("mousedown", t);
            this.r.addEventListener("mouseup", e);
            this.r.addEventListener("mouseleave", e);
            this.r.addEventListener("touchstart", (a) => {
                a.preventDefault(), (this.t = !0), t();
            });
            this.r.addEventListener("touchend", (a) => {
                a.preventDefault(), (this.t = !1), e();
            });
            this.r.addEventListener("touchcancel", (a) => {
                a.preventDefault(), (this.t = !1), e();
            });
        }

        if (this.p) {
            this.p.addEventListener("click", () => this.closeVideoPopup());
            this.p.addEventListener("touchend", () => this.closeVideoPopup());
        }

        if (this.b) {
            this.b.addEventListener("click", () => this.downloadVideo());
        }

        if (this.h) {
            this.h.addEventListener("click", () => this.shareVideo());
        }
    }
    showInstructions() {
        if (this.i) this.i.style.display = "block";
    }
    hideInstructions() {
        if (this.i) this.i.style.display = "none";
    }
    setRecordingState(a) {
        if (this.r) this.r.classList.toggle("recording", a);
    }
    setRecordingButtonState(a) {
        if (this.r) {
            this.r.style.opacity = a ? "1" : ".5";
            this.r.style.pointerEvents = a ? "auto" : "none";
            this.r.style.touchAction = a ? "none" : "auto";
        }
    }
    showCloseButton() {
        if (this.c) this.c.style.display = "block";
    }
    hideCloseButton() {
        if (this.c) this.c.style.display = "none";
    }
    showScanning() {
        if (this.s) this.s.style.display = "flex";
    }
    hideScanning() {
        if (this.s) this.s.style.display = "none";
    }
    showVideoPopup() {
        if (this.v) this.v.classList.add("active");
    }
    closeVideoPopup() {
        if (this.v) this.v.classList.remove("active");
        if (this.d) {
            this.d.pause();
            this.d.currentTime = 0;
        }
    }
    downloadVideo() {
        if (!this.d || !this.d.src) return;
        const a = document.createElement("a");
        a.href = this.d.src;
        a.download = "recorded-video.mp4";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    async shareVideo() {
        if (!this.d || !this.d.src) return;
        try {
            const t = await fetch(this.d.src);
            const e = await t.blob();
            const i = new File([e], "recorded-video.mp4", {
                type: "video/mp4",
            });
            if (navigator.canShare && navigator.canShare({ files: [i] })) {
                await navigator.share({
                    files: [i],
                    title: "Recorded Video",
                });
            }
        } catch (a) {
            console.error("Failed to share video:", a);
        }
    }
}
class c {
    constructor() {
        (this.a = new r()), (this.r = new o()), (this.u = new s()), this.e();
    }
    e() {
        this.t(), this.h(), this.start();
    }
    h() {
        const a = document.querySelector(".full-screen-container"),
            t = document.querySelector(".video-popup"),
            e = document.querySelector(".ui_container"),
            i = window.innerHeight;
        a && (a.style.height = `${i}px`),
            e && (e.style.height = `${i}px`),
            t && (t.style.height = `${i}px`);
    }
    t() {
        this.u.e(
            () => this.onCloseInstructions(),
            () => this.startRecording(),
            () => this.stopRecording()
        ),
            window.addEventListener("resize", () => this.h()),
            window.addEventListener("orientationchange", () => this.h());
    }
    async onCloseInstructions() {
        this.a.startTracking(), this.u.setRecordingButtonState(!0);
    }
    async startRecording() {
        document.body.classList.add("recording"),
            await this.r.startRecording("ar_container"),
            this.u.setRecordingState(!0);
    }
    stopRecording() {
        document.body.classList.remove("recording"),
            this.r.stopRecording(),
            this.u.setRecordingState(!1);
    }
    async start() {
        this.u.showInstructions();
        try {
            await this.a.e(), await this.a.start(), this.u.showCloseButton();
        } catch (a) {
            console.error("Failed to initialize AR scene:", a);
        }
    }
    stop() {
        this.a.stop();
    }
}
document.addEventListener("DOMContentLoaded", () => {
    new c();
});
