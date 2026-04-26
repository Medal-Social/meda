// SPDX-License-Identifier: Apache-2.0
// Portions adapted from ElevenLabs UI's Orb component (MIT):
// https://github.com/elevenlabs/ui/blob/main/apps/www/registry/elevenlabs-ui/ui/orb.tsx
// Copyright (c) ElevenLabs Inc.
// Adaptations: Meda token-driven theming, 5-phase state model (idle/listening/thinking/
// speaking/error), outputLevel uniform, procedural simplex noise (replaces texture sampling).
// Simplex noise implementation based on Stefan Gustavson's public-domain GLSL noise.

export const VERTEX_SHADER = /* glsl */ `
uniform float uTime;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Stefan Gustavson's simplex noise — public domain
// https://github.com/stegu/webgl-noise (public domain)
const SIMPLEX_NOISE_GLSL = /* glsl */ `
vec3 mod289_3(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289_4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289_4(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289_3(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractional Brownian Motion: stacked octaves of simplex noise
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
${SIMPLEX_NOISE_GLSL}

uniform float uTime;
uniform float uAnimation;
uniform float uInputVolume;
uniform float uOutputVolume;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform float uPhaseT;
uniform float uErrorFlash;
uniform float uPressed;
uniform float uOpacity;
uniform float uOffsets[7];

const vec3 ERROR_COLOR = vec3(0.85, 0.18, 0.18);
const float PI = 3.14159265358979323846;

varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float r = length(uv);

  // Discard fragments outside the unit circle so the canvas stays clean.
  if (r > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // ---- Phase masks (0..1 for each phase) -----------------------------------
  // uPhaseT smoothly interpolates between numeric phases:
  // 0=idle, 1=listening, 2=thinking, 3=speaking, 4=error.
  float isListening = clamp(1.0 - abs(uPhaseT - 1.0), 0.0, 1.0);
  float isThinking  = clamp(1.0 - abs(uPhaseT - 2.0), 0.0, 1.0);
  float isSpeaking  = clamp(1.0 - abs(uPhaseT - 3.0), 0.0, 1.0);

  float inputDrive  = uInputVolume  * isListening;
  float outputDrive = uOutputVolume * isSpeaking;
  float thinkPulse  = isThinking * (0.5 + 0.5 * sin(uTime * 2.0));
  float drive = max(inputDrive, max(outputDrive, thinkPulse * 0.4));

  // ---- Surface displacement: gentle 3D feel via noise ---------------------
  // Sample fbm in 3D with time as the third axis so the surface evolves slowly.
  float n = fbm(vec3(uv * 1.4, uAnimation * 0.18)) * 0.5 + 0.5;     // 0..1
  float n2 = fbm(vec3(uv * 2.6 + 4.7, uAnimation * 0.10)) * 0.5 + 0.5;

  // ---- Color: smooth two-stop gradient driven by noise + radius ----------
  vec3 cA = mix(uColorA, ERROR_COLOR, uErrorFlash);
  vec3 cB = mix(uColorB, ERROR_COLOR * 0.55, uErrorFlash * 0.7);

  // Mix factor blends two colors based on noise — keeps the orb gradient-y.
  // Subtle vertical bias so the top is slightly brighter (3D illusion).
  float topLight = smoothstep(-1.0, 1.0, uv.y * 0.6 + 0.4);
  float mixT = clamp(n * 0.6 + topLight * 0.4 + n2 * 0.1, 0.0, 1.0);
  vec3 base = mix(cA, cB, mixT);

  // Internal highlight (top-left, classic glass orb)
  vec2 highlightCenter = vec2(-0.35, 0.45);
  float hi = smoothstep(0.55, 0.0, length(uv - highlightCenter));
  base += vec3(1.0) * hi * 0.18;

  // Bottom shadow (depth illusion)
  float shadow = smoothstep(0.3, 1.0, -uv.y) * 0.25;
  base = mix(base, base * 0.6, shadow);

  // ---- Audio reactivity: pulse intensity on listening/speaking ------------
  // Drive an inner glow that pulses with input/output volume.
  float glow = (1.0 - r) * (1.0 - r);
  base += cA * drive * glow * 0.6;

  // ---- Press: slight core brighten ----------------------------------------
  base = mix(base, base * 1.18, uPressed * (1.0 - smoothstep(0.0, 0.55, r)));

  // ---- Edge falloff: smooth rim, soft halo --------------------------------
  // Sphere-like alpha falloff at the edge of the unit circle.
  float alpha = smoothstep(1.0, 0.92, r);
  // Outer halo glow extends slightly beyond the disc — but we discarded
  // r > 1.0 above to keep canvas clean. For a rim, fade in a thin shell.
  float rim = smoothstep(0.85, 1.0, r);
  base += cA * rim * 0.25 * mix(0.6, 1.0, drive);

  gl_FragColor = vec4(base, alpha * uOpacity);
}
`;
