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

// destructive red for error flash
const vec3 ERROR_COLOR = vec3(0.85, 0.18, 0.18);

varying vec2 vUv;

const float PI = 3.14159265358979323846;

// Helper: draw an oval in polar UV space with soft falloff
bool drawOval(vec2 polarUv, vec2 polarCenter, float a, float b,
              bool reverseGradient, float softness, out vec4 color) {
  vec2 p = polarUv - polarCenter;
  float oval = (p.x * p.x) / (a * a) + (p.y * p.y) / (b * b);
  float edge = smoothstep(1.0, 1.0 - softness, oval);
  if (edge > 0.0) {
    float gradient = reverseGradient
      ? (1.0 - (p.x / a + 1.0) / 2.0)
      : ((p.x / a + 1.0) / 2.0);
    gradient = mix(0.5, gradient, 0.1);
    color = vec4(vec3(gradient), 0.85 * edge);
    return true;
  }
  return false;
}

// Map grayscale to 4-stop color ramp
vec3 colorRamp(float t, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
  if (t < 0.33) return mix(c1, c2, t * 3.0);
  if (t < 0.66) return mix(c2, c3, (t - 0.33) * 3.0);
  return mix(c3, c4, (t - 0.66) * 3.0);
}

// Noisy ring radius from fbm
float sharpRing(float theta, float radius, float time) {
  float noiseVal = fbm(vec3(cos(theta), sin(theta), time * 0.12)) * 0.5 + 0.5;
  return 1.0 + (noiseVal - 0.5) * 0.45;
}

float smoothRing(float theta, float radius, float time) {
  float noiseVal = fbm(vec3(cos(theta) * 0.7, sin(theta) * 0.7, time * 0.08)) * 0.5 + 0.5;
  return 0.9 + (noiseVal - 0.5) * 0.32;
}

// Procedural flow distortion (replaces texture sampling from ElevenLabs original)
float flow(float theta, float radius, float time) {
  return fbm(vec3(cos(theta) * radius, sin(theta) * radius, time * 0.15)) * 0.5 + 0.5;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;

  float radius = length(uv);
  float theta = atan(uv.y, uv.x);
  if (theta < 0.0) theta += 2.0 * PI;

  // Phase-modulated audio volumes
  // uPhaseT: 0=idle,1=listening,2=thinking,3=speaking,4=error
  float isListening  = clamp(1.0 - abs(uPhaseT - 1.0), 0.0, 1.0);
  float isThinking   = clamp(1.0 - abs(uPhaseT - 2.0), 0.0, 1.0);
  float isSpeaking   = clamp(1.0 - abs(uPhaseT - 3.0), 0.0, 1.0);

  float inputDrive  = uInputVolume  * isListening;
  float outputDrive = uOutputVolume * isSpeaking;

  // thinking: slow radial pulse
  float thinkPulse  = isThinking * (0.5 + 0.5 * sin(uTime * 2.2));

  float effectiveDrive = max(inputDrive, max(outputDrive, thinkPulse * 0.5));

  // Flow distortion of angle (replaces texture-based flow in original)
  float flowNoise = flow(theta, radius * 0.5, uAnimation * 0.2) - 0.5;
  theta += flowNoise * mix(0.08, 0.28, effectiveDrive);

  vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

  // Animated oval blobs (same approach as ElevenLabs original, procedural noise for size)
  float originalCenters[7];
  originalCenters[0] = 0.0;
  originalCenters[1] = 0.5 * PI;
  originalCenters[2] = 1.0 * PI;
  originalCenters[3] = 1.5 * PI;
  originalCenters[4] = 2.0 * PI;
  originalCenters[5] = 2.5 * PI;
  originalCenters[6] = 3.0 * PI;

  float centers[7];
  for (int i = 0; i < 7; i++) {
    centers[i] = originalCenters[i] + 0.5 * sin(uTime / 20.0 + uOffsets[i]);
  }

  for (int i = 0; i < 7; i++) {
    // Use procedural noise for oval size variation instead of texture
    float n = fbm(vec3(float(i) * 1.7 + uAnimation * 0.05, 0.5, 0.5)) * 0.5 + 0.5;
    float a = 0.5 + n * 0.3;
    float b = n * mix(3.5, 2.5, inputDrive);
    bool rev = (i % 2 == 1);

    float distTheta = min(
      abs(theta - centers[i]),
      min(abs(theta + 2.0 * PI - centers[i]), abs(theta - 2.0 * PI - centers[i]))
    );

    vec4 ovalColor;
    if (drawOval(vec2(distTheta, radius), vec2(0.0), a, b, rev, 0.6, ovalColor)) {
      color.rgb = mix(color.rgb, ovalColor.rgb, ovalColor.a);
      color.a = max(color.a, ovalColor.a);
    }
  }

  // Noisy rings driven by input volume
  float rr1 = sharpRing(theta, radius, uTime);
  float rr2 = smoothRing(theta, radius, uTime);
  float inputR1 = radius + inputDrive * 0.2;
  float inputR2 = radius + inputDrive * 0.15;
  float opa1 = mix(0.2, 0.6, inputDrive);
  float opa2 = mix(0.15, 0.45, inputDrive);
  float ringAlpha1 = (inputR2 >= rr1) ? opa1 : 0.0;
  float ringAlpha2 = smoothstep(rr2 - 0.05, rr2 + 0.05, inputR1) * opa2;
  float totalRingAlpha = max(ringAlpha1, ringAlpha2);
  color.rgb = 1.0 - (1.0 - color.rgb) * (1.0 - vec3(1.0) * totalRingAlpha);

  // Color ramp: black → colorA → colorB → white
  vec3 effectiveColorA = mix(uColorA, ERROR_COLOR, uErrorFlash);
  vec3 effectiveColorB = mix(uColorB, ERROR_COLOR * 0.6, uErrorFlash * 0.7);

  float luminance = color.r;
  color.rgb = colorRamp(luminance,
    vec3(0.0),
    effectiveColorA,
    effectiveColorB,
    vec3(1.0)
  );

  // Press squish: slightly brighten core on press
  color.rgb = mix(color.rgb, color.rgb * 1.12, uPressed * smoothstep(0.6, 0.0, radius));

  color.a *= uOpacity;
  gl_FragColor = color;
}
`;
