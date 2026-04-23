"use client";
import { jsx as ae } from "react/jsx-runtime";
import { useState as Q, useCallback as re, useId as pt, useLayoutEffect as Ue, useEffect as me, useRef as O, createContext as ht, useImperativeHandle as Ke, useMemo as Se, useSyncExternalStore as Xe, useContext as mt } from "react";
function gt(e, t) {
  const n = getComputedStyle(e), o = parseFloat(n.fontSize);
  return t * o;
}
function yt(e, t) {
  const n = getComputedStyle(e.ownerDocument.body), o = parseFloat(n.fontSize);
  return t * o;
}
function St(e) {
  return e / 100 * window.innerHeight;
}
function vt(e) {
  return e / 100 * window.innerWidth;
}
function bt(e) {
  switch (typeof e) {
    case "number":
      return [e, "px"];
    case "string": {
      const t = parseFloat(e);
      return e.endsWith("%") ? [t, "%"] : e.endsWith("px") ? [t, "px"] : e.endsWith("rem") ? [t, "rem"] : e.endsWith("em") ? [t, "em"] : e.endsWith("vh") ? [t, "vh"] : e.endsWith("vw") ? [t, "vw"] : [t, "%"];
    }
  }
}
function ie({
  groupSize: e,
  panelElement: t,
  styleProp: n
}) {
  let o;
  const [i, s] = bt(n);
  switch (s) {
    case "%": {
      o = i / 100 * e;
      break;
    }
    case "px": {
      o = i;
      break;
    }
    case "rem": {
      o = yt(t, i);
      break;
    }
    case "em": {
      o = gt(t, i);
      break;
    }
    case "vh": {
      o = St(i);
      break;
    }
    case "vw": {
      o = vt(i);
      break;
    }
  }
  return o;
}
function T(e) {
  return parseFloat(e.toFixed(3));
}
function ne({
  group: e
}) {
  const { orientation: t, panels: n } = e;
  return n.reduce((o, i) => (o += t === "horizontal" ? i.element.offsetWidth : i.element.offsetHeight, o), 0);
}
function ve(e) {
  const { panels: t } = e, n = ne({ group: e });
  return n === 0 ? t.map((o) => ({
    groupResizeBehavior: o.panelConstraints.groupResizeBehavior,
    collapsedSize: 0,
    collapsible: o.panelConstraints.collapsible === !0,
    defaultSize: void 0,
    disabled: o.panelConstraints.disabled,
    minSize: 0,
    maxSize: 100,
    panelId: o.id
  })) : t.map((o) => {
    const { element: i, panelConstraints: s } = o;
    let l = 0;
    if (s.collapsedSize !== void 0) {
      const f = ie({
        groupSize: n,
        panelElement: i,
        styleProp: s.collapsedSize
      });
      l = T(f / n * 100);
    }
    let r;
    if (s.defaultSize !== void 0) {
      const f = ie({
        groupSize: n,
        panelElement: i,
        styleProp: s.defaultSize
      });
      r = T(f / n * 100);
    }
    let a = 0;
    if (s.minSize !== void 0) {
      const f = ie({
        groupSize: n,
        panelElement: i,
        styleProp: s.minSize
      });
      a = T(f / n * 100);
    }
    let c = 100;
    if (s.maxSize !== void 0) {
      const f = ie({
        groupSize: n,
        panelElement: i,
        styleProp: s.maxSize
      });
      c = T(f / n * 100);
    }
    return {
      groupResizeBehavior: s.groupResizeBehavior,
      collapsedSize: l,
      collapsible: s.collapsible === !0,
      defaultSize: r,
      disabled: s.disabled,
      minSize: a,
      maxSize: c,
      panelId: o.id
    };
  });
}
function C(e, t = "Assertion error") {
  if (!e)
    throw Error(t);
}
function be(e, t) {
  return Array.from(t).sort(
    e === "horizontal" ? zt : xt
  );
}
function zt(e, t) {
  const n = e.element.offsetLeft - t.element.offsetLeft;
  return n !== 0 ? n : e.element.offsetWidth - t.element.offsetWidth;
}
function xt(e, t) {
  const n = e.element.offsetTop - t.element.offsetTop;
  return n !== 0 ? n : e.element.offsetHeight - t.element.offsetHeight;
}
function qe(e) {
  return e !== null && typeof e == "object" && "nodeType" in e && e.nodeType === Node.ELEMENT_NODE;
}
function Ye(e, t) {
  return {
    x: e.x >= t.left && e.x <= t.right ? 0 : Math.min(
      Math.abs(e.x - t.left),
      Math.abs(e.x - t.right)
    ),
    y: e.y >= t.top && e.y <= t.bottom ? 0 : Math.min(
      Math.abs(e.y - t.top),
      Math.abs(e.y - t.bottom)
    )
  };
}
function wt({
  orientation: e,
  rects: t,
  targetRect: n
}) {
  const o = {
    x: n.x + n.width / 2,
    y: n.y + n.height / 2
  };
  let i, s = Number.MAX_VALUE;
  for (const l of t) {
    const { x: r, y: a } = Ye(o, l), c = e === "horizontal" ? r : a;
    c < s && (s = c, i = l);
  }
  return C(i, "No rect found"), i;
}
let fe;
function Pt() {
  return fe === void 0 && (typeof matchMedia == "function" ? fe = !!matchMedia("(pointer:coarse)").matches : fe = !1), fe;
}
function Je(e) {
  const { element: t, orientation: n, panels: o, separators: i } = e, s = be(
    n,
    Array.from(t.children).filter(qe).map((x) => ({ element: x }))
  ).map(({ element: x }) => x), l = [];
  let r = !1, a = !1, c = -1, f = -1, g = 0, d, b = [];
  {
    let x = -1;
    for (const u of s)
      u.hasAttribute("data-panel") && (x++, u.hasAttribute("data-disabled") || (g++, c === -1 && (c = x), f = x));
  }
  if (g > 1) {
    let x = -1;
    for (const u of s)
      if (u.hasAttribute("data-panel")) {
        x++;
        const p = o.find(
          (m) => m.element === u
        );
        if (p) {
          if (d) {
            const m = d.element.getBoundingClientRect(), S = u.getBoundingClientRect();
            let v;
            if (a) {
              const y = n === "horizontal" ? new DOMRect(
                m.right,
                m.top,
                0,
                m.height
              ) : new DOMRect(
                m.left,
                m.bottom,
                m.width,
                0
              ), h = n === "horizontal" ? new DOMRect(S.left, S.top, 0, S.height) : new DOMRect(S.left, S.top, S.width, 0);
              switch (b.length) {
                case 0: {
                  v = [
                    y,
                    h
                  ];
                  break;
                }
                case 1: {
                  const w = b[0], M = wt({
                    orientation: n,
                    rects: [m, S],
                    targetRect: w.element.getBoundingClientRect()
                  });
                  v = [
                    w,
                    M === m ? h : y
                  ];
                  break;
                }
                default: {
                  v = b;
                  break;
                }
              }
            } else
              b.length ? v = b : v = [
                n === "horizontal" ? new DOMRect(
                  m.right,
                  S.top,
                  S.left - m.right,
                  S.height
                ) : new DOMRect(
                  S.left,
                  m.bottom,
                  S.width,
                  S.top - m.bottom
                )
              ];
            for (const y of v) {
              let h = "width" in y ? y : y.element.getBoundingClientRect();
              const w = Pt() ? e.resizeTargetMinimumSize.coarse : e.resizeTargetMinimumSize.fine;
              if (h.width < w) {
                const P = w - h.width;
                h = new DOMRect(
                  h.x - P / 2,
                  h.y,
                  h.width + P,
                  h.height
                );
              }
              if (h.height < w) {
                const P = w - h.height;
                h = new DOMRect(
                  h.x,
                  h.y - P / 2,
                  h.width,
                  h.height + P
                );
              }
              const M = x <= c || x > f;
              !r && !M && l.push({
                group: e,
                groupSize: ne({ group: e }),
                panels: [d, p],
                separator: "width" in y ? void 0 : y,
                rect: h
              }), r = !1;
            }
          }
          a = !1, d = p, b = [];
        }
      } else if (u.hasAttribute("data-separator")) {
        u.ariaDisabled !== null && (r = !0);
        const p = i.find(
          (m) => m.element === u
        );
        p ? b.push(p) : (d = void 0, b = []);
      } else
        a = !0;
  }
  return l;
}
class Ze {
  #e = {};
  addListener(t, n) {
    const o = this.#e[t];
    return o === void 0 ? this.#e[t] = [n] : o.includes(n) || o.push(n), () => {
      this.removeListener(t, n);
    };
  }
  emit(t, n) {
    const o = this.#e[t];
    if (o !== void 0)
      if (o.length === 1)
        o[0].call(null, n);
      else {
        let i = !1, s = null;
        const l = Array.from(o);
        for (let r = 0; r < l.length; r++) {
          const a = l[r];
          try {
            a.call(null, n);
          } catch (c) {
            s === null && (i = !0, s = c);
          }
        }
        if (i)
          throw s;
      }
  }
  removeAllListeners() {
    this.#e = {};
  }
  removeListener(t, n) {
    const o = this.#e[t];
    if (o !== void 0) {
      const i = o.indexOf(n);
      i >= 0 && o.splice(i, 1);
    }
  }
}
let F = /* @__PURE__ */ new Map();
const Qe = new Ze();
function Lt(e) {
  F = new Map(F), F.delete(e);
}
function ke(e, t) {
  for (const [n] of F)
    if (n.id === e)
      return n;
}
function H(e, t) {
  for (const [n, o] of F)
    if (n.id === e)
      return o;
  if (t)
    throw Error(`Could not find data for Group with id ${e}`);
}
function X() {
  return F;
}
function ze(e, t) {
  return Qe.addListener("groupChange", (n) => {
    n.group.id === e && t(n);
  });
}
function $(e, t) {
  const n = F.get(e);
  F = new Map(F), F.set(e, t), Qe.emit("groupChange", {
    group: e,
    prev: n,
    next: t
  });
}
function Ct(e, t, n) {
  let o, i = {
    x: 1 / 0,
    y: 1 / 0
  };
  for (const s of t) {
    const l = Ye(n, s.rect);
    switch (e) {
      case "horizontal": {
        l.x <= i.x && (o = s, i = l);
        break;
      }
      case "vertical": {
        l.y <= i.y && (o = s, i = l);
        break;
      }
    }
  }
  return o ? {
    distance: i,
    hitRegion: o
  } : void 0;
}
function Rt(e) {
  return e !== null && typeof e == "object" && "nodeType" in e && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
function Mt(e, t) {
  if (e === t) throw new Error("Cannot compare node with itself");
  const n = {
    a: Te(e),
    b: Te(t)
  };
  let o;
  for (; n.a.at(-1) === n.b.at(-1); )
    o = n.a.pop(), n.b.pop();
  C(
    o,
    "Stacking order can only be calculated for elements with a common ancestor"
  );
  const i = {
    a: De(Ie(n.a)),
    b: De(Ie(n.b))
  };
  if (i.a === i.b) {
    const s = o.childNodes, l = {
      a: n.a.at(-1),
      b: n.b.at(-1)
    };
    let r = s.length;
    for (; r--; ) {
      const a = s[r];
      if (a === l.a) return 1;
      if (a === l.b) return -1;
    }
  }
  return Math.sign(i.a - i.b);
}
const Et = /\b(?:position|zIndex|opacity|transform|webkitTransform|mixBlendMode|filter|webkitFilter|isolation)\b/;
function kt(e) {
  const t = getComputedStyle(et(e) ?? e).display;
  return t === "flex" || t === "inline-flex";
}
function It(e) {
  const t = getComputedStyle(e);
  return !!(t.position === "fixed" || t.zIndex !== "auto" && (t.position !== "static" || kt(e)) || +t.opacity < 1 || "transform" in t && t.transform !== "none" || "webkitTransform" in t && t.webkitTransform !== "none" || "mixBlendMode" in t && t.mixBlendMode !== "normal" || "filter" in t && t.filter !== "none" || "webkitFilter" in t && t.webkitFilter !== "none" || "isolation" in t && t.isolation === "isolate" || Et.test(t.willChange) || t.webkitOverflowScrolling === "touch");
}
function Ie(e) {
  let t = e.length;
  for (; t--; ) {
    const n = e[t];
    if (C(n, "Missing node"), It(n)) return n;
  }
  return null;
}
function De(e) {
  return e && Number(getComputedStyle(e).zIndex) || 0;
}
function Te(e) {
  const t = [];
  for (; e; )
    t.push(e), e = et(e);
  return t;
}
function et(e) {
  const { parentNode: t } = e;
  return Rt(t) ? t.host : t;
}
function Dt(e, t) {
  return e.x < t.x + t.width && e.x + e.width > t.x && e.y < t.y + t.height && e.y + e.height > t.y;
}
function Tt({
  groupElement: e,
  hitRegion: t,
  pointerEventTarget: n
}) {
  if (!qe(n) || n.contains(e) || e.contains(n))
    return !0;
  if (Mt(n, e) > 0) {
    let o = n;
    for (; o; ) {
      if (o.contains(e))
        return !0;
      if (Dt(o.getBoundingClientRect(), t))
        return !1;
      o = o.parentElement;
    }
  }
  return !0;
}
function xe(e, t) {
  const n = [];
  return t.forEach((o, i) => {
    if (i.disabled)
      return;
    const s = Je(i), l = Ct(i.orientation, s, {
      x: e.clientX,
      y: e.clientY
    });
    l && l.distance.x <= 0 && l.distance.y <= 0 && Tt({
      groupElement: i.element,
      hitRegion: l.hitRegion.rect,
      pointerEventTarget: e.target
    }) && n.push(l.hitRegion);
  }), n;
}
function Ot(e, t) {
  if (e.length !== t.length)
    return !1;
  for (let n = 0; n < e.length; n++)
    if (e[n] != t[n])
      return !1;
  return !0;
}
function D(e, t, n = 0) {
  return Math.abs(T(e) - T(t)) <= n;
}
function A(e, t) {
  return D(e, t) ? 0 : e > t ? 1 : -1;
}
function Z({
  overrideDisabledPanels: e,
  panelConstraints: t,
  prevSize: n,
  size: o
}) {
  const {
    collapsedSize: i = 0,
    collapsible: s,
    disabled: l,
    maxSize: r = 100,
    minSize: a = 0
  } = t;
  if (l && !e)
    return n;
  if (A(o, a) < 0)
    if (s) {
      const c = (i + a) / 2;
      A(o, c) < 0 ? o = i : o = a;
    } else
      o = a;
  return o = Math.min(r, o), o = T(o), o;
}
function le({
  delta: e,
  initialLayout: t,
  panelConstraints: n,
  pivotIndices: o,
  prevLayout: i,
  trigger: s
}) {
  if (D(e, 0))
    return t;
  const l = s === "imperative-api", r = Object.values(t), a = Object.values(i), c = [...r], [f, g] = o;
  C(f != null, "Invalid first pivot index"), C(g != null, "Invalid second pivot index");
  let d = 0;
  switch (s) {
    case "keyboard": {
      {
        const u = e < 0 ? g : f, p = n[u];
        C(
          p,
          `Panel constraints not found for index ${u}`
        );
        const {
          collapsedSize: m = 0,
          collapsible: S,
          minSize: v = 0
        } = p;
        if (S) {
          const y = r[u];
          if (C(
            y != null,
            `Previous layout not found for panel index ${u}`
          ), D(y, m)) {
            const h = v - y;
            A(h, Math.abs(e)) > 0 && (e = e < 0 ? 0 - h : h);
          }
        }
      }
      {
        const u = e < 0 ? f : g, p = n[u];
        C(
          p,
          `No panel constraints found for index ${u}`
        );
        const {
          collapsedSize: m = 0,
          collapsible: S,
          minSize: v = 0
        } = p;
        if (S) {
          const y = r[u];
          if (C(
            y != null,
            `Previous layout not found for panel index ${u}`
          ), D(y, v)) {
            const h = y - m;
            A(h, Math.abs(e)) > 0 && (e = e < 0 ? 0 - h : h);
          }
        }
      }
      break;
    }
    default: {
      const u = e < 0 ? g : f, p = n[u];
      C(
        p,
        `Panel constraints not found for index ${u}`
      );
      const m = r[u], { collapsible: S, collapsedSize: v, minSize: y } = p;
      if (S && A(m, y) < 0)
        if (e > 0) {
          const h = y - v, w = h / 2, M = m + e;
          A(M, y) < 0 && (e = A(e, w) <= 0 ? 0 : h);
        } else {
          const h = y - v, w = 100 - h / 2, M = m - e;
          A(M, y) < 0 && (e = A(100 + e, w) > 0 ? 0 : -h);
        }
      break;
    }
  }
  {
    const u = e < 0 ? 1 : -1;
    let p = e < 0 ? g : f, m = 0;
    for (; ; ) {
      const v = r[p];
      C(
        v != null,
        `Previous layout not found for panel index ${p}`
      );
      const h = Z({
        overrideDisabledPanels: l,
        panelConstraints: n[p],
        prevSize: v,
        size: 100
      }) - v;
      if (m += h, p += u, p < 0 || p >= n.length)
        break;
    }
    const S = Math.min(Math.abs(e), Math.abs(m));
    e = e < 0 ? 0 - S : S;
  }
  {
    let p = e < 0 ? f : g;
    for (; p >= 0 && p < n.length; ) {
      const m = Math.abs(e) - Math.abs(d), S = r[p];
      C(
        S != null,
        `Previous layout not found for panel index ${p}`
      );
      const v = S - m, y = Z({
        overrideDisabledPanels: l,
        panelConstraints: n[p],
        prevSize: S,
        size: v
      });
      if (!D(S, y) && (d += S - y, c[p] = y, d.toFixed(3).localeCompare(Math.abs(e).toFixed(3), void 0, {
        numeric: !0
      }) >= 0))
        break;
      e < 0 ? p-- : p++;
    }
  }
  if (Ot(a, c))
    return i;
  {
    const u = e < 0 ? g : f, p = r[u];
    C(
      p != null,
      `Previous layout not found for panel index ${u}`
    );
    const m = p + d, S = Z({
      overrideDisabledPanels: l,
      panelConstraints: n[u],
      prevSize: p,
      size: m
    });
    if (c[u] = S, !D(S, m)) {
      let v = m - S, h = e < 0 ? g : f;
      for (; h >= 0 && h < n.length; ) {
        const w = c[h];
        C(
          w != null,
          `Previous layout not found for panel index ${h}`
        );
        const M = w + v, P = Z({
          overrideDisabledPanels: l,
          panelConstraints: n[h],
          prevSize: w,
          size: M
        });
        if (D(w, P) || (v -= P - w, c[h] = P), D(v, 0))
          break;
        e > 0 ? h-- : h++;
      }
    }
  }
  const b = Object.values(c).reduce(
    (u, p) => p + u,
    0
  );
  if (!D(b, 100, 0.1))
    return i;
  const x = Object.keys(i);
  return c.reduce((u, p, m) => (u[x[m]] = p, u), {});
}
function W(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length)
    return !1;
  for (const n in e)
    if (t[n] === void 0 || A(e[n], t[n]) !== 0)
      return !1;
  return !0;
}
function U({
  layout: e,
  panelConstraints: t
}) {
  const n = Object.values(e), o = [...n], i = o.reduce(
    (r, a) => r + a,
    0
  );
  if (o.length !== t.length)
    throw Error(
      `Invalid ${t.length} panel layout: ${o.map((r) => `${r}%`).join(", ")}`
    );
  if (!D(i, 100) && o.length > 0)
    for (let r = 0; r < t.length; r++) {
      const a = o[r];
      C(a != null, `No layout data found for index ${r}`);
      const c = 100 / i * a;
      o[r] = c;
    }
  let s = 0;
  for (let r = 0; r < t.length; r++) {
    const a = n[r];
    C(a != null, `No layout data found for index ${r}`);
    const c = o[r];
    C(c != null, `No layout data found for index ${r}`);
    const f = Z({
      overrideDisabledPanels: !0,
      panelConstraints: t[r],
      prevSize: a,
      size: c
    });
    c != f && (s += c - f, o[r] = f);
  }
  if (!D(s, 0))
    for (let r = 0; r < t.length; r++) {
      const a = o[r];
      C(a != null, `No layout data found for index ${r}`);
      const c = a + s, f = Z({
        overrideDisabledPanels: !0,
        panelConstraints: t[r],
        prevSize: a,
        size: c
      });
      if (a !== f && (s -= f - a, o[r] = f, D(s, 0)))
        break;
    }
  const l = Object.keys(e);
  return o.reduce((r, a, c) => (r[l[c]] = a, r), {});
}
function tt({
  groupId: e,
  panelId: t
}) {
  const n = () => {
    const r = X();
    for (const [
      a,
      {
        defaultLayoutDeferred: c,
        derivedPanelConstraints: f,
        layout: g,
        groupSize: d,
        separatorToPanels: b
      }
    ] of r)
      if (a.id === e)
        return {
          defaultLayoutDeferred: c,
          derivedPanelConstraints: f,
          group: a,
          groupSize: d,
          layout: g,
          separatorToPanels: b
        };
    throw Error(`Group ${e} not found`);
  }, o = () => {
    const r = n().derivedPanelConstraints.find(
      (a) => a.panelId === t
    );
    if (r !== void 0)
      return r;
    throw Error(`Panel constraints not found for Panel ${t}`);
  }, i = () => {
    const r = n().group.panels.find((a) => a.id === t);
    if (r !== void 0)
      return r;
    throw Error(`Layout not found for Panel ${t}`);
  }, s = () => {
    const r = n().layout[t];
    if (r !== void 0)
      return r;
    throw Error(`Layout not found for Panel ${t}`);
  }, l = (r) => {
    const a = s();
    if (r === a)
      return;
    const {
      defaultLayoutDeferred: c,
      derivedPanelConstraints: f,
      group: g,
      groupSize: d,
      layout: b,
      separatorToPanels: x
    } = n(), u = g.panels.findIndex((v) => v.id === t), p = u === g.panels.length - 1, m = le({
      delta: p ? a - r : r - a,
      initialLayout: b,
      panelConstraints: f,
      pivotIndices: p ? [u - 1, u] : [u, u + 1],
      prevLayout: b,
      trigger: "imperative-api"
    }), S = U({
      layout: m,
      panelConstraints: f
    });
    W(b, S) || $(g, {
      defaultLayoutDeferred: c,
      derivedPanelConstraints: f,
      groupSize: d,
      layout: S,
      separatorToPanels: x
    });
  };
  return {
    collapse: () => {
      const { collapsible: r, collapsedSize: a } = o(), { mutableValues: c } = i(), f = s();
      r && f !== a && (c.expandToSize = f, l(a));
    },
    expand: () => {
      const { collapsible: r, collapsedSize: a, minSize: c } = o(), { mutableValues: f } = i(), g = s();
      if (r && g === a) {
        let d = f.expandToSize ?? c;
        d === 0 && (d = 1), l(d);
      }
    },
    getSize: () => {
      const { group: r } = n(), a = s(), { element: c } = i(), f = r.orientation === "horizontal" ? c.offsetWidth : c.offsetHeight;
      return {
        asPercentage: a,
        inPixels: f
      };
    },
    isCollapsed: () => {
      const { collapsible: r, collapsedSize: a } = o(), c = s();
      return r && D(a, c);
    },
    resize: (r) => {
      const { group: a } = n(), { element: c } = i(), f = ne({ group: a }), g = ie({
        groupSize: f,
        panelElement: c,
        styleProp: r
      }), d = T(g / f * 100);
      l(d);
    }
  };
}
function Oe(e) {
  if (e.defaultPrevented)
    return;
  const t = X();
  xe(e, t).forEach((o) => {
    if (o.separator && !o.separator.disableDoubleClick) {
      const i = o.panels.find(
        (s) => s.panelConstraints.defaultSize !== void 0
      );
      if (i) {
        const s = i.panelConstraints.defaultSize, l = tt({
          groupId: o.group.id,
          panelId: i.id
        });
        l && s !== void 0 && (l.resize(s), e.preventDefault());
      }
    }
  });
}
function pe(e) {
  const t = X();
  for (const [n] of t)
    if (n.separators.some(
      (o) => o.element === e
    ))
      return n;
  throw Error("Could not find parent Group for separator element");
}
function nt({
  groupId: e
}) {
  const t = () => {
    const n = X();
    for (const [o, i] of n)
      if (o.id === e)
        return { group: o, ...i };
    throw Error(`Could not find Group with id "${e}"`);
  };
  return {
    getLayout() {
      const { defaultLayoutDeferred: n, layout: o } = t();
      return n ? {} : o;
    },
    setLayout(n) {
      const {
        defaultLayoutDeferred: o,
        derivedPanelConstraints: i,
        group: s,
        groupSize: l,
        layout: r,
        separatorToPanels: a
      } = t(), c = U({
        layout: n,
        panelConstraints: i
      });
      return o ? r : (W(r, c) || $(s, {
        defaultLayoutDeferred: o,
        derivedPanelConstraints: i,
        groupSize: l,
        layout: c,
        separatorToPanels: a
      }), c);
    }
  };
}
function B(e, t) {
  const n = pe(e), o = H(n.id, !0), i = n.separators.find(
    (g) => g.element === e
  );
  C(i, "Matching separator not found");
  const s = o.separatorToPanels.get(i);
  C(s, "Matching panels not found");
  const l = s.map((g) => n.panels.indexOf(g)), a = nt({ groupId: n.id }).getLayout(), c = le({
    delta: t,
    initialLayout: a,
    panelConstraints: o.derivedPanelConstraints,
    pivotIndices: l,
    prevLayout: a,
    trigger: "keyboard"
  }), f = U({
    layout: c,
    panelConstraints: o.derivedPanelConstraints
  });
  W(a, f) || $(n, {
    defaultLayoutDeferred: o.defaultLayoutDeferred,
    derivedPanelConstraints: o.derivedPanelConstraints,
    groupSize: o.groupSize,
    layout: f,
    separatorToPanels: o.separatorToPanels
  });
}
function Ge(e) {
  if (e.defaultPrevented)
    return;
  const t = e.currentTarget, n = pe(t);
  if (!n.disabled)
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault(), n.orientation === "vertical" && B(t, 5);
        break;
      }
      case "ArrowLeft": {
        e.preventDefault(), n.orientation === "horizontal" && B(t, -5);
        break;
      }
      case "ArrowRight": {
        e.preventDefault(), n.orientation === "horizontal" && B(t, 5);
        break;
      }
      case "ArrowUp": {
        e.preventDefault(), n.orientation === "vertical" && B(t, -5);
        break;
      }
      case "End": {
        e.preventDefault(), B(t, 100);
        break;
      }
      case "Enter": {
        e.preventDefault();
        const o = pe(t), i = H(o.id, !0), { derivedPanelConstraints: s, layout: l, separatorToPanels: r } = i, a = o.separators.find(
          (d) => d.element === t
        );
        C(a, "Matching separator not found");
        const c = r.get(a);
        C(c, "Matching panels not found");
        const f = c[0], g = s.find(
          (d) => d.panelId === f.id
        );
        if (C(g, "Panel metadata not found"), g.collapsible) {
          const d = l[f.id], b = g.collapsedSize === d ? o.mutableState.expandedPanelSizes[f.id] ?? g.minSize : g.collapsedSize;
          B(t, b - d);
        }
        break;
      }
      case "F6": {
        e.preventDefault();
        const i = pe(t).separators.map(
          (a) => a.element
        ), s = Array.from(i).findIndex(
          (a) => a === e.currentTarget
        );
        C(s !== null, "Index not found");
        const l = e.shiftKey ? s > 0 ? s - 1 : i.length - 1 : s + 1 < i.length ? s + 1 : 0;
        i[l].focus({
          preventScroll: !0
        });
        break;
      }
      case "Home": {
        e.preventDefault(), B(t, -100);
        break;
      }
    }
}
let ee = {
  cursorFlags: 0,
  state: "inactive"
};
const we = new Ze();
function K() {
  return ee;
}
function Gt(e) {
  return we.addListener("change", e);
}
function At(e) {
  const t = ee, n = { ...ee };
  n.cursorFlags = e, ee = n, we.emit("change", {
    prev: t,
    next: n
  });
}
function te(e) {
  const t = ee;
  ee = e, we.emit("change", {
    prev: t,
    next: e
  });
}
function Ae(e) {
  if (e.defaultPrevented)
    return;
  if (e.pointerType === "mouse" && e.button > 0)
    return;
  const t = X(), n = xe(e, t), o = /* @__PURE__ */ new Map();
  let i = !1;
  n.forEach((s) => {
    s.separator && (i || (i = !0, s.separator.element.focus({
      preventScroll: !0
    })));
    const l = t.get(s.group);
    l && o.set(s.group, l.layout);
  }), te({
    cursorFlags: 0,
    hitRegions: n,
    initialLayoutMap: o,
    pointerDownAtPoint: { x: e.clientX, y: e.clientY },
    state: "active"
  }), n.length && e.preventDefault();
}
const Ft = (e) => e, ye = () => {
}, ot = 1, it = 2, rt = 4, st = 8, Fe = 3, Ne = 12;
let de;
function _e() {
  return de === void 0 && (de = !1, typeof window < "u" && (window.navigator.userAgent.includes("Chrome") || window.navigator.userAgent.includes("Firefox")) && (de = !0)), de;
}
function Nt({
  cursorFlags: e,
  groups: t,
  state: n
}) {
  let o = 0, i = 0;
  switch (n) {
    case "active":
    case "hover":
      t.forEach((s) => {
        if (!s.mutableState.disableCursor)
          switch (s.orientation) {
            case "horizontal": {
              o++;
              break;
            }
            case "vertical": {
              i++;
              break;
            }
          }
      });
  }
  if (!(o === 0 && i === 0)) {
    switch (n) {
      case "active": {
        if (e && _e()) {
          const s = (e & ot) !== 0, l = (e & it) !== 0, r = (e & rt) !== 0, a = (e & st) !== 0;
          if (s)
            return r ? "se-resize" : a ? "ne-resize" : "e-resize";
          if (l)
            return r ? "sw-resize" : a ? "nw-resize" : "w-resize";
          if (r)
            return "s-resize";
          if (a)
            return "n-resize";
        }
        break;
      }
    }
    return _e() ? o > 0 && i > 0 ? "move" : o > 0 ? "ew-resize" : "ns-resize" : o > 0 && i > 0 ? "grab" : o > 0 ? "col-resize" : "row-resize";
  }
}
const $e = /* @__PURE__ */ new WeakMap();
function Pe(e) {
  if (e.defaultView === null || e.defaultView === void 0)
    return;
  let { prevStyle: t, styleSheet: n } = $e.get(e) ?? {};
  n === void 0 && (n = new e.defaultView.CSSStyleSheet(), e.adoptedStyleSheets && e.adoptedStyleSheets.push(n));
  const o = K();
  switch (o.state) {
    case "active":
    case "hover": {
      const i = Nt({
        cursorFlags: o.cursorFlags,
        groups: o.hitRegions.map((l) => l.group),
        state: o.state
      }), s = `*, *:hover {cursor: ${i} !important; }`;
      if (t === s)
        return;
      t = s, i ? n.cssRules.length === 0 ? n.insertRule(s) : n.replaceSync(s) : n.cssRules.length === 1 && n.deleteRule(0);
      break;
    }
    case "inactive": {
      t = void 0, n.cssRules.length === 1 && n.deleteRule(0);
      break;
    }
  }
  $e.set(e, {
    prevStyle: t,
    styleSheet: n
  });
}
function at({
  document: e,
  event: t,
  hitRegions: n,
  initialLayoutMap: o,
  mountedGroups: i,
  pointerDownAtPoint: s,
  prevCursorFlags: l
}) {
  let r = 0;
  n.forEach((c) => {
    const { group: f, groupSize: g } = c, { orientation: d, panels: b } = f, { disableCursor: x } = f.mutableState;
    let u = 0;
    s ? d === "horizontal" ? u = (t.clientX - s.x) / g * 100 : u = (t.clientY - s.y) / g * 100 : d === "horizontal" ? u = t.clientX < 0 ? -100 : 100 : u = t.clientY < 0 ? -100 : 100;
    const p = o.get(f), m = i.get(f);
    if (!p || !m)
      return;
    const {
      defaultLayoutDeferred: S,
      derivedPanelConstraints: v,
      groupSize: y,
      layout: h,
      separatorToPanels: w
    } = m;
    if (v && h && w) {
      const M = le({
        delta: u,
        initialLayout: p,
        panelConstraints: v,
        pivotIndices: c.panels.map((P) => b.indexOf(P)),
        prevLayout: h,
        trigger: "mouse-or-touch"
      });
      if (W(M, h)) {
        if (u !== 0 && !x)
          switch (d) {
            case "horizontal": {
              r |= u < 0 ? ot : it;
              break;
            }
            case "vertical": {
              r |= u < 0 ? rt : st;
              break;
            }
          }
      } else
        $(c.group, {
          defaultLayoutDeferred: S,
          derivedPanelConstraints: v,
          groupSize: y,
          layout: M,
          separatorToPanels: w
        });
    }
  });
  let a = 0;
  t.movementX === 0 ? a |= l & Fe : a |= r & Fe, t.movementY === 0 ? a |= l & Ne : a |= r & Ne, At(a), Pe(e);
}
function je(e) {
  const t = X(), n = K();
  switch (n.state) {
    case "active":
      at({
        document: e.currentTarget,
        event: e,
        hitRegions: n.hitRegions,
        initialLayoutMap: n.initialLayoutMap,
        mountedGroups: t,
        prevCursorFlags: n.cursorFlags
      });
  }
}
function He(e) {
  if (e.defaultPrevented)
    return;
  const t = K(), n = X();
  switch (t.state) {
    case "active": {
      if (
        // Skip this check for "pointerleave" events, else Firefox triggers a false positive (see #514)
        e.buttons === 0
      ) {
        te({
          cursorFlags: 0,
          state: "inactive"
        }), t.hitRegions.forEach((o) => {
          const i = H(o.group.id, !0);
          $(o.group, i);
        });
        return;
      }
      for (const o of t.hitRegions)
        if (o.separator) {
          const { element: i } = o.separator;
          i.hasPointerCapture?.(e.pointerId) || i.setPointerCapture?.(e.pointerId);
        }
      at({
        document: e.currentTarget,
        event: e,
        hitRegions: t.hitRegions,
        initialLayoutMap: t.initialLayoutMap,
        mountedGroups: n,
        pointerDownAtPoint: t.pointerDownAtPoint,
        prevCursorFlags: t.cursorFlags
      });
      break;
    }
    default: {
      const o = xe(e, n);
      o.length === 0 ? t.state !== "inactive" && te({
        cursorFlags: 0,
        state: "inactive"
      }) : te({
        cursorFlags: 0,
        hitRegions: o,
        state: "hover"
      }), Pe(e.currentTarget);
      break;
    }
  }
}
function Ve(e) {
  if (e.relatedTarget instanceof HTMLIFrameElement)
    switch (K().state) {
      case "hover":
        te({
          cursorFlags: 0,
          state: "inactive"
        });
    }
}
function Be(e) {
  if (e.defaultPrevented)
    return;
  if (e.pointerType === "mouse" && e.button > 0)
    return;
  const t = K();
  switch (t.state) {
    case "active":
      te({
        cursorFlags: 0,
        state: "inactive"
      }), t.hitRegions.length > 0 && (Pe(e.currentTarget), t.hitRegions.forEach((n) => {
        const o = H(n.group.id, !0);
        $(n.group, o);
      }), e.preventDefault());
  }
}
function We(e) {
  let t = 0, n = 0;
  const o = {};
  for (const s of e)
    if (s.defaultSize !== void 0) {
      t++;
      const l = T(s.defaultSize);
      n += l, o[s.panelId] = l;
    } else
      o[s.panelId] = void 0;
  const i = e.length - t;
  if (i !== 0) {
    const s = T((100 - n) / i);
    for (const l of e)
      l.defaultSize === void 0 && (o[l.panelId] = s);
  }
  return o;
}
function _t(e, t, n) {
  if (!n[0])
    return;
  const i = e.panels.find((c) => c.element === t);
  if (!i || !i.onResize)
    return;
  const s = ne({ group: e }), l = e.orientation === "horizontal" ? i.element.offsetWidth : i.element.offsetHeight, r = i.mutableValues.prevSize, a = {
    asPercentage: T(l / s * 100),
    inPixels: l
  };
  i.mutableValues.prevSize = a, i.onResize(a, i.id, r);
}
function $t(e, t) {
  if (Object.keys(e).length !== Object.keys(t).length)
    return !1;
  for (const o in e)
    if (e[o] !== t[o])
      return !1;
  return !0;
}
function jt({
  group: e,
  nextGroupSize: t,
  prevGroupSize: n,
  prevLayout: o
}) {
  if (n <= 0 || t <= 0 || n === t)
    return o;
  let i = 0, s = 0, l = !1;
  const r = /* @__PURE__ */ new Map(), a = [];
  for (const g of e.panels) {
    const d = o[g.id] ?? 0;
    switch (g.panelConstraints.groupResizeBehavior) {
      case "preserve-pixel-size": {
        l = !0;
        const b = d / 100 * n, x = T(
          b / t * 100
        );
        r.set(g.id, x), i += x;
        break;
      }
      case "preserve-relative-size":
      default: {
        a.push(g.id), s += d;
        break;
      }
    }
  }
  if (!l || a.length === 0)
    return o;
  const c = 100 - i, f = { ...o };
  if (r.forEach((g, d) => {
    f[d] = g;
  }), s > 0)
    for (const g of a) {
      const d = o[g] ?? 0;
      f[g] = T(
        d / s * c
      );
    }
  else {
    const g = T(
      c / a.length
    );
    for (const d of a)
      f[d] = g;
  }
  return f;
}
function Ht(e, t) {
  const n = e.map((i) => i.id), o = Object.keys(t);
  if (n.length !== o.length)
    return !1;
  for (const i of n)
    if (!o.includes(i))
      return !1;
  return !0;
}
const J = /* @__PURE__ */ new Map();
function Vt(e) {
  let t = !0;
  C(
    e.element.ownerDocument.defaultView,
    "Cannot register an unmounted Group"
  );
  const n = e.element.ownerDocument.defaultView.ResizeObserver, o = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), s = new n((u) => {
    for (const p of u) {
      const { borderBoxSize: m, target: S } = p;
      if (S === e.element) {
        if (t) {
          const v = ne({ group: e });
          if (v === 0)
            return;
          const y = H(e.id);
          if (!y)
            return;
          const h = ve(e), w = y.defaultLayoutDeferred ? We(h) : y.layout, M = jt({
            group: e,
            nextGroupSize: v,
            prevGroupSize: y.groupSize,
            prevLayout: w
          }), P = U({
            layout: M,
            panelConstraints: h
          });
          if (!y.defaultLayoutDeferred && W(y.layout, P) && $t(
            y.derivedPanelConstraints,
            h
          ) && y.groupSize === v)
            return;
          $(e, {
            defaultLayoutDeferred: !1,
            derivedPanelConstraints: h,
            groupSize: v,
            layout: P,
            separatorToPanels: y.separatorToPanels
          });
        }
      } else
        _t(e, S, m);
    }
  });
  s.observe(e.element), e.panels.forEach((u) => {
    C(
      !o.has(u.id),
      `Panel ids must be unique; id "${u.id}" was used more than once`
    ), o.add(u.id), u.onResize && s.observe(u.element);
  });
  const l = ne({ group: e }), r = ve(e), a = e.panels.map(({ id: u }) => u).join(",");
  let c = e.mutableState.defaultLayout;
  c && (Ht(e.panels, c) || (c = void 0));
  const f = e.mutableState.layouts[a] ?? c ?? We(r), g = U({
    layout: f,
    panelConstraints: r
  }), d = e.element.ownerDocument;
  J.set(
    d,
    (J.get(d) ?? 0) + 1
  );
  const b = /* @__PURE__ */ new Map();
  return Je(e).forEach((u) => {
    u.separator && b.set(u.separator, u.panels);
  }), $(e, {
    defaultLayoutDeferred: l === 0,
    derivedPanelConstraints: r,
    groupSize: l,
    layout: g,
    separatorToPanels: b
  }), e.separators.forEach((u) => {
    C(
      !i.has(u.id),
      `Separator ids must be unique; id "${u.id}" was used more than once`
    ), i.add(u.id), u.element.addEventListener("keydown", Ge);
  }), J.get(d) === 1 && (d.addEventListener("dblclick", Oe, !0), d.addEventListener("pointerdown", Ae, !0), d.addEventListener("pointerleave", je), d.addEventListener("pointermove", He), d.addEventListener("pointerout", Ve), d.addEventListener("pointerup", Be, !0)), function() {
    t = !1, J.set(
      d,
      Math.max(0, (J.get(d) ?? 0) - 1)
    ), Lt(e), e.separators.forEach((p) => {
      p.element.removeEventListener("keydown", Ge);
    }), J.get(d) || (d.removeEventListener(
      "dblclick",
      Oe,
      !0
    ), d.removeEventListener(
      "pointerdown",
      Ae,
      !0
    ), d.removeEventListener("pointerleave", je), d.removeEventListener("pointermove", He), d.removeEventListener("pointerout", Ve), d.removeEventListener("pointerup", Be, !0)), s.disconnect();
  };
}
function Bt() {
  const [e, t] = Q({}), n = re(() => t({}), []);
  return [e, n];
}
function Le(e) {
  const t = pt();
  return `${e ?? t}`;
}
const q = typeof window < "u" ? Ue : me;
function se(e) {
  const t = O(e);
  return q(() => {
    t.current = e;
  }, [e]), re(
    (...n) => t.current?.(...n),
    [t]
  );
}
function Ce(...e) {
  return se((t) => {
    e.forEach((n) => {
      if (n)
        switch (typeof n) {
          case "function": {
            n(t);
            break;
          }
          case "object": {
            n.current = t;
            break;
          }
        }
    });
  });
}
function Re(e) {
  const t = O({ ...e });
  return q(() => {
    for (const n in e)
      t.current[n] = e[n];
  }, [e]), t.current;
}
const lt = ht(null);
function Wt(e, t) {
  const n = O({
    getLayout: () => ({}),
    setLayout: Ft
  });
  Ke(t, () => n.current, []), q(() => {
    Object.assign(
      n.current,
      nt({ groupId: e })
    );
  });
}
function Ut({
  children: e,
  className: t,
  defaultLayout: n,
  disableCursor: o,
  disabled: i,
  elementRef: s,
  groupRef: l,
  id: r,
  onLayoutChange: a,
  onLayoutChanged: c,
  orientation: f = "horizontal",
  resizeTargetMinimumSize: g = {
    coarse: 20,
    fine: 10
  },
  style: d,
  ...b
}) {
  const x = O({
    onLayoutChange: {},
    onLayoutChanged: {}
  }), u = se((z) => {
    W(x.current.onLayoutChange, z) || (x.current.onLayoutChange = z, a?.(z));
  }), p = se((z) => {
    W(x.current.onLayoutChanged, z) || (x.current.onLayoutChanged = z, c?.(z));
  }), m = Le(r), S = O(null), [v, y] = Bt(), h = O({
    lastExpandedPanelSizes: {},
    layouts: {},
    panels: [],
    resizeTargetMinimumSize: g,
    separators: []
  }), w = Ce(S, s);
  Wt(m, l);
  const M = se(
    (z, L) => {
      const k = K(), R = ke(z), E = H(z);
      if (E) {
        let I = !1;
        switch (k.state) {
          case "active": {
            I = k.hitRegions.some(
              (V) => V.group === R
            );
            break;
          }
        }
        return {
          flexGrow: E.layout[L] ?? 1,
          pointerEvents: I ? "none" : void 0
        };
      }
      if (n?.[L])
        return {
          flexGrow: n?.[L]
        };
    }
  ), P = Re({
    defaultLayout: n,
    disableCursor: o
  }), G = Se(
    () => ({
      get disableCursor() {
        return !!P.disableCursor;
      },
      getPanelStyles: M,
      id: m,
      orientation: f,
      registerPanel: (z) => {
        const L = h.current;
        return L.panels = be(f, [
          ...L.panels,
          z
        ]), y(), () => {
          L.panels = L.panels.filter(
            (k) => k !== z
          ), y();
        };
      },
      registerSeparator: (z) => {
        const L = h.current;
        return L.separators = be(f, [
          ...L.separators,
          z
        ]), y(), () => {
          L.separators = L.separators.filter(
            (k) => k !== z
          ), y();
        };
      },
      updatePanelProps: (z, { disabled: L }) => {
        const R = h.current.panels.find(
          (V) => V.id === z
        );
        R && (R.panelConstraints.disabled = L);
        const E = ke(m), I = H(m);
        E && I && $(E, {
          ...I,
          derivedPanelConstraints: ve(E)
        });
      },
      updateSeparatorProps: (z, {
        disabled: L,
        disableDoubleClick: k
      }) => {
        const E = h.current.separators.find(
          (I) => I.id === z
        );
        E && (E.disabled = L, E.disableDoubleClick = k);
      }
    }),
    [M, m, y, f, P]
  ), N = O(null);
  return q(() => {
    const z = S.current;
    if (z === null)
      return;
    const L = h.current;
    let k;
    if (P.defaultLayout !== void 0 && Object.keys(P.defaultLayout).length === L.panels.length) {
      k = {};
      for (const j of L.panels) {
        const Y = P.defaultLayout[j.id];
        Y !== void 0 && (k[j.id] = Y);
      }
    }
    const R = {
      disabled: !!i,
      element: z,
      id: m,
      mutableState: {
        defaultLayout: k,
        disableCursor: !!P.disableCursor,
        expandedPanelSizes: h.current.lastExpandedPanelSizes,
        layouts: h.current.layouts
      },
      orientation: f,
      panels: L.panels,
      resizeTargetMinimumSize: L.resizeTargetMinimumSize,
      separators: L.separators
    };
    N.current = R;
    const E = Vt(R), { defaultLayoutDeferred: I, derivedPanelConstraints: V, layout: ue } = H(R.id, !0);
    !I && V.length > 0 && (u(ue), p(ue));
    const oe = ze(m, (j) => {
      const { defaultLayoutDeferred: Y, derivedPanelConstraints: Ee, layout: ce } = j.next;
      if (Y || Ee.length === 0)
        return;
      const ut = R.panels.map(({ id: _ }) => _).join(",");
      R.mutableState.layouts[ut] = ce, Ee.forEach((_) => {
        if (_.collapsible) {
          const { layout: ge } = j.prev ?? {};
          if (ge) {
            const ft = D(
              _.collapsedSize,
              ce[_.panelId]
            ), dt = D(
              _.collapsedSize,
              ge[_.panelId]
            );
            ft && !dt && (R.mutableState.expandedPanelSizes[_.panelId] = ge[_.panelId]);
          }
        }
      });
      const ct = K().state !== "active";
      u(ce), ct && p(ce);
    });
    return () => {
      N.current = null, E(), oe();
    };
  }, [
    i,
    m,
    p,
    u,
    f,
    v,
    P
  ]), me(() => {
    const z = N.current;
    z && (z.mutableState.defaultLayout = n, z.mutableState.disableCursor = !!o);
  }), /* @__PURE__ */ ae(lt.Provider, { value: G, children: /* @__PURE__ */ ae(
    "div",
    {
      ...b,
      className: t,
      "data-group": !0,
      "data-testid": m,
      id: m,
      ref: w,
      style: {
        height: "100%",
        width: "100%",
        overflow: "hidden",
        ...d,
        display: "flex",
        flexDirection: f === "horizontal" ? "row" : "column",
        flexWrap: "nowrap",
        // Inform the browser that the library is handling touch events for this element
        // but still allow users to scroll content within panels in the non-resizing direction
        // NOTE This is not an inherited style
        // See github.com/bvaughn/react-resizable-panels/issues/662
        touchAction: f === "horizontal" ? "pan-y" : "pan-x"
      },
      children: e
    }
  ) });
}
Ut.displayName = "Group";
function he(e, t) {
  return `react-resizable-panels:${[e, ...t].join(":")}`;
}
function Kt({
  id: e,
  panelIds: t,
  storage: n
}) {
  const o = he(e, []), i = n.getItem(o);
  if (i)
    try {
      const s = JSON.parse(i);
      if (t) {
        const l = t.join(","), r = s[l];
        if (r && Array.isArray(r.layout) && t.length === r.layout.length) {
          const a = {};
          for (let c = 0; c < t.length; c++)
            a[t[c]] = r.layout[c];
          return a;
        }
      } else {
        const l = Object.keys(s);
        if (l.length === 1) {
          const r = s[l[0]];
          if (r && Array.isArray(r.layout)) {
            const a = l[0].split(",");
            if (a.length === r.layout.length) {
              const c = {};
              for (let f = 0; f < a.length; f++)
                c[a[f]] = r.layout[f];
              return c;
            }
          }
        }
      }
    } catch {
    }
}
function on({
  debounceSaveMs: e = 100,
  panelIds: t,
  storage: n = localStorage,
  ...o
}) {
  const i = t !== void 0, s = "id" in o ? o.id : o.groupId, l = he(s, t ?? []), r = Xe(
    Xt,
    () => n.getItem(l),
    () => n.getItem(l)
  ), a = Se(() => {
    if (r) {
      const u = JSON.parse(r), p = Object.values(u);
      if (Array.from(p).every((m) => typeof m == "number"))
        return u;
    }
  }, [r]), c = Se(() => {
    if (!a)
      return Kt({
        id: s,
        panelIds: t,
        storage: n
      });
  }, [a, s, t, n]), f = a ?? c, g = O(null), d = re(() => {
    const u = g.current;
    u && (g.current = null, clearTimeout(u));
  }, []);
  Ue(() => () => {
    d();
  }, [d]);
  const b = re(
    (u) => {
      d();
      let p;
      i ? p = he(s, Object.keys(u)) : p = he(s, []);
      try {
        n.setItem(p, JSON.stringify(u));
      } catch (m) {
        console.error(m);
      }
    },
    [d, i, s, n]
  ), x = re(
    (u) => {
      d(), e === 0 ? b(u) : g.current = setTimeout(() => {
        b(u);
      }, e);
    },
    [d, e, b]
  );
  return {
    /**
     * Pass this value to `Group` as the `defaultLayout` prop.
     */
    defaultLayout: f,
    /**
     * Attach this callback on the `Group` as the `onLayoutChange` prop.
     *
     * @deprecated Use the {@link onLayoutChanged} prop instead.
     */
    onLayoutChange: x,
    /**
     * Attach this callback on the `Group` as the `onLayoutChanged` prop.
     */
    onLayoutChanged: b
  };
}
function Xt() {
  return function() {
  };
}
function rn() {
  return Q(null);
}
function sn() {
  return O(null);
}
function Me() {
  const e = mt(lt);
  return C(
    e,
    "Group Context not found; did you render a Panel or Separator outside of a Group?"
  ), e;
}
function qt(e, t) {
  const { id: n } = Me(), o = O({
    collapse: ye,
    expand: ye,
    getSize: () => ({
      asPercentage: 0,
      inPixels: 0
    }),
    isCollapsed: () => !1,
    resize: ye
  });
  Ke(t, () => o.current, []), q(() => {
    Object.assign(
      o.current,
      tt({ groupId: n, panelId: e })
    );
  });
}
function Yt({
  children: e,
  className: t,
  collapsedSize: n = "0%",
  collapsible: o = !1,
  defaultSize: i,
  disabled: s,
  elementRef: l,
  groupResizeBehavior: r = "preserve-relative-size",
  id: a,
  maxSize: c = "100%",
  minSize: f = "0%",
  onResize: g,
  panelRef: d,
  style: b,
  ...x
}) {
  const u = !!a, p = Le(a), m = Re({
    disabled: s
  }), S = O(null), v = Ce(S, l), {
    getPanelStyles: y,
    id: h,
    orientation: w,
    registerPanel: M,
    updatePanelProps: P
  } = Me(), G = g !== null, N = se(
    (R, E, I) => {
      g?.(R, a, I);
    }
  );
  q(() => {
    const R = S.current;
    if (R !== null) {
      const E = {
        element: R,
        id: p,
        idIsStable: u,
        mutableValues: {
          expandToSize: void 0,
          prevSize: void 0
        },
        onResize: G ? N : void 0,
        panelConstraints: {
          groupResizeBehavior: r,
          collapsedSize: n,
          collapsible: o,
          defaultSize: i,
          disabled: m.disabled,
          maxSize: c,
          minSize: f
        }
      };
      return M(E);
    }
  }, [
    r,
    n,
    o,
    i,
    G,
    p,
    u,
    c,
    f,
    N,
    M,
    m
  ]), me(() => {
    P(p, { disabled: s });
  }, [s, p, P]), qt(p, d);
  const z = () => {
    const R = y(h, p);
    if (R)
      return JSON.stringify(R);
  }, L = Xe(
    (R) => ze(h, R),
    z,
    z
  );
  let k;
  return L ? k = JSON.parse(L) : i ? k = {
    flexGrow: void 0,
    flexShrink: void 0,
    flexBasis: i
  } : k = { flexGrow: 1 }, /* @__PURE__ */ ae(
    "div",
    {
      ...x,
      "data-disabled": s || void 0,
      "data-panel": !0,
      "data-testid": p,
      id: p,
      ref: v,
      style: {
        ...Jt,
        display: "flex",
        flexBasis: 0,
        flexShrink: 1,
        overflow: "visible",
        ...k
      },
      children: /* @__PURE__ */ ae(
        "div",
        {
          className: t,
          style: {
            maxHeight: "100%",
            maxWidth: "100%",
            flexGrow: 1,
            overflow: "auto",
            ...b,
            // Inform the browser that the library is handling touch events for this element
            // but still allow users to scroll content within panels in the non-resizing direction
            // NOTE This is not an inherited style
            // See github.com/bvaughn/react-resizable-panels/issues/662
            touchAction: w === "horizontal" ? "pan-y" : "pan-x"
          },
          children: e
        }
      )
    }
  );
}
Yt.displayName = "Panel";
const Jt = {
  minHeight: 0,
  maxHeight: "100%",
  height: "auto",
  minWidth: 0,
  maxWidth: "100%",
  width: "auto",
  border: "none",
  borderWidth: 0,
  padding: 0,
  margin: 0
};
function an() {
  return Q(null);
}
function ln() {
  return O(null);
}
function Zt({
  layout: e,
  panelConstraints: t,
  panelId: n,
  panelIndex: o
}) {
  let i, s;
  const l = e[n], r = t.find(
    (a) => a.panelId === n
  );
  if (r) {
    const a = r.maxSize, c = r.collapsible ? r.collapsedSize : r.minSize, f = [o, o + 1];
    s = U({
      layout: le({
        delta: c - l,
        initialLayout: e,
        panelConstraints: t,
        pivotIndices: f,
        prevLayout: e
      }),
      panelConstraints: t
    })[n], i = U({
      layout: le({
        delta: a - l,
        initialLayout: e,
        panelConstraints: t,
        pivotIndices: f,
        prevLayout: e
      }),
      panelConstraints: t
    })[n];
  }
  return {
    valueControls: n,
    valueMax: i,
    valueMin: s,
    valueNow: l
  };
}
function Qt({
  children: e,
  className: t,
  disabled: n,
  disableDoubleClick: o,
  elementRef: i,
  id: s,
  style: l,
  ...r
}) {
  const a = Le(s), c = Re({
    disabled: n,
    disableDoubleClick: o
  }), [f, g] = Q({}), [d, b] = Q("inactive"), [x, u] = Q(!1), p = O(null), m = Ce(p, i), {
    disableCursor: S,
    id: v,
    orientation: y,
    registerSeparator: h,
    updateSeparatorProps: w
  } = Me(), M = y === "horizontal" ? "vertical" : "horizontal";
  q(() => {
    const N = p.current;
    if (N !== null) {
      const z = {
        disabled: c.disabled,
        disableDoubleClick: c.disableDoubleClick,
        element: N,
        id: a
      }, L = h(z), k = Gt(
        (E) => {
          b(
            E.next.state !== "inactive" && E.next.hitRegions.some(
              (I) => I.separator === z
            ) ? E.next.state : "inactive"
          );
        }
      ), R = ze(
        v,
        (E) => {
          const { derivedPanelConstraints: I, layout: V, separatorToPanels: ue } = E.next, oe = ue.get(z);
          if (oe) {
            const j = oe[0], Y = oe.indexOf(j);
            g(
              Zt({
                layout: V,
                panelConstraints: I,
                panelId: j.id,
                panelIndex: Y
              })
            );
          }
        }
      );
      return () => {
        k(), R(), L();
      };
    }
  }, [v, a, h, c]), me(() => {
    w(a, { disabled: n, disableDoubleClick: o });
  }, [n, o, a, w]);
  let P;
  n && !S && (P = "not-allowed");
  let G;
  if (n)
    G = "disabled";
  else
    switch (d) {
      case "active": {
        G = "active";
        break;
      }
      default:
        x ? G = "focus" : G = d;
    }
  return /* @__PURE__ */ ae(
    "div",
    {
      ...r,
      "aria-controls": f.valueControls,
      "aria-disabled": n || void 0,
      "aria-orientation": M,
      "aria-valuemax": f.valueMax,
      "aria-valuemin": f.valueMin,
      "aria-valuenow": f.valueNow,
      children: e,
      className: t,
      "data-separator": G,
      "data-testid": a,
      id: a,
      onBlur: () => u(!1),
      onFocus: () => u(!0),
      ref: m,
      role: "separator",
      style: {
        flexBasis: "auto",
        cursor: P,
        ...l,
        flexGrow: 0,
        flexShrink: 0,
        // Inform the browser that the library is handling touch events for this element
        // See github.com/bvaughn/react-resizable-panels/issues/662
        touchAction: "none"
      },
      tabIndex: n ? void 0 : 0
    }
  );
}
Qt.displayName = "Separator";
export {
  Ut as Group,
  Yt as Panel,
  Qt as Separator,
  Pt as isCoarsePointer,
  on as useDefaultLayout,
  rn as useGroupCallbackRef,
  sn as useGroupRef,
  an as usePanelCallbackRef,
  ln as usePanelRef
};
//# sourceMappingURL=react-resizable-panels.js.map
