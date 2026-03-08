"use client";

import { useEffect, useRef } from "react";

interface StreamElement {
  x: number;
  y: number;
  z: number; // 0 (far) to 1 (near)
  speed: number;
  opacity: number;
  size: number;
  isAccent: boolean; // warm ochre variant
  burstTimer: number; // countdown to brightness burst
  burstActive: boolean;
}

const AMBER = { l: 0.72, c: 0.18, h: 80 }; // oklch(0.72 0.18 80)
const OCHRE = { l: 0.60, c: 0.14, h: 70 };  // oklch(0.60 0.14 70)

function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  // Convert oklch -> oklab -> linear sRGB -> sRGB
  const hRad = (h * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  // oklab -> linear sRGB
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

  const ll = l_ * l_ * l_;
  const mm = m_ * m_ * m_;
  const ss = s_ * s_ * s_;

  let r = +4.0767416621 * ll - 3.3077115913 * mm + 0.2309699292 * ss;
  let g = -1.2684380046 * ll + 2.6097574011 * mm - 0.3413193965 * ss;
  let bv = -0.0041960863 * ll - 0.7034186147 * mm + 1.7076147010 * ss;

  // linear sRGB -> sRGB gamma
  const toSrgb = (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 255;
    const g = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    return Math.round(g * 255);
  };

  return [toSrgb(r), toSrgb(g), toSrgb(bv)];
}

const [AR, AG, AB] = oklchToRgb(AMBER.l, AMBER.c, AMBER.h);
const [OR, OG, OB] = oklchToRgb(OCHRE.l, OCHRE.c, OCHRE.h);

export function DataStreamCanvas({
  elementCount = 180,
}: {
  elementCount?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementsRef = useRef<StreamElement[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const frameRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const ctxOrNull = canvas.getContext("2d");
    if (!ctxOrNull) return;
    const ctx: CanvasRenderingContext2D = ctxOrNull;

    const REPEL_RADIUS = 120;
    const accentFraction = 0.2;

    // ── Helpers ──────────────────────────────────────────────────────
    function initElement(el: StreamElement, forceTop = false) {
      const w = sizeRef.current.w;
      const h = sizeRef.current.h;
      el.x = Math.random() * w;
      el.y = forceTop ? Math.random() * -h : Math.random() * h;
      el.z = 0.2 + Math.random() * 0.8;
      el.speed = (1 + Math.random() * 2) * (0.5 + el.z * 2.5); // 3-5 speeds
      el.opacity = 0.3 + el.z * 0.5;
      el.size = 1 + el.z * 2.5;
      el.isAccent = Math.random() < accentFraction;
      el.burstTimer = Math.random() * 300;
      el.burstActive = false;
    }

    function spawnAll() {
      elementsRef.current = Array.from({ length: elementCount }, () => {
        const el: StreamElement = {
          x: 0, y: 0, z: 0, speed: 0,
          opacity: 0, size: 0, isAccent: false,
          burstTimer: 0, burstActive: false,
        };
        initElement(el, false);
        return el;
      });
    }

    // ── Resize ───────────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

    function resize(entries?: ResizeObserverEntry[]) {
      const rect = entries?.[0]?.contentRect ?? canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
      spawnAll();
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement ?? canvas);
    resize();

    // ── Mouse ─────────────────────────────────────────────────────────
    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onMouseLeave() {
      mouseRef.current = { x: -9999, y: -9999 };
    }
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    // ── Animation loop ────────────────────────────────────────────────
    function draw() {
      const { w, h } = sizeRef.current;
      const { x: mx, y: my } = mouseRef.current;

      ctx.clearRect(0, 0, w, h);

      for (const el of elementsRef.current) {
        // Burst lifecycle
        el.burstTimer -= 1;
        if (el.burstTimer <= 0) {
          el.burstActive = true;
          el.burstTimer = 180 + Math.random() * 300;
        }
        if (el.burstActive) {
          el.opacity = Math.min(1, el.opacity + 0.08);
          if (el.opacity >= 0.9) el.burstActive = false;
        } else {
          const baseOp = 0.3 + el.z * 0.5;
          el.opacity = baseOp + (el.opacity - baseOp) * 0.96;
        }

        // Mouse repulsion: slow stream and push x
        const dx = el.x - mx;
        const dy = el.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let speedMod = 1;
        let nudgeX = 0;
        if (dist < REPEL_RADIUS) {
          const t = 1 - dist / REPEL_RADIUS;
          speedMod = 1 - t * 0.8; // slow down
          nudgeX = (dx / dist) * t * 1.2;
        }

        // Move element down
        el.y += el.speed * speedMod;
        el.x += nudgeX;

        // Wrap
        if (el.y > h + 4) {
          initElement(el, true);
        }
        if (el.x < 0) el.x += w;
        if (el.x > w) el.x -= w;

        // Draw — elongated dot (vertical stroke to simulate data stream)
        const [r, g, b] = el.isAccent ? [OR, OG, OB] : [AR, AG, AB];
        const alpha = el.opacity;
        const length = el.size * 4 * el.z;

        // Glow pass
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.25})`;
        ctx.lineWidth = el.size * 3;
        ctx.lineCap = "round";
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.x, el.y + length);
        ctx.stroke();

        // Core pass
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = el.size * 0.8;
        ctx.moveTo(el.x, el.y);
        ctx.lineTo(el.x, el.y + length);
        ctx.stroke();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [elementCount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
      }}
    />
  );
}
