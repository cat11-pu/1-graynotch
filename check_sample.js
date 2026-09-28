import fs from "node:fs";
import { codeOf, decodeOf, ringDistance } from "./graycode.js";
import { turn, read, notch } from "./dial.js";

const __lines = [];
function emit(label, value) {
  __lines.push([String(label).replace(/ =$/, ""), value]);
}

const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/dial.json", "utf8"));
const bits = spec.bits;
let state = {
  bits: spec.state.bits, pos: spec.state.pos, steps: spec.state.steps,
  traj: (spec.state.traj || []).slice(),
  reads: (spec.state.reads || []).map(function (row) { return [row[0], row[1]]; })
};
let failed = 0;
for (const event of spec.events || []) {
  try {
    if (event.kind === "turn") {
      state = turn(state, event.dir);
    } else if (event.kind === "read") {
      state = read(state, event.code);
    } else {
      state = notch(state, event.spot);
    }
  } catch (error) {
    failed += 1;
  }
}

const notches = [];
for (let spot = 0; spot < (1 << bits); spot += 1) {
  notches.push(codeOf(spot, bits));
}
let single = true;
for (let spot = 0; spot < notches.length; spot += 1) {
  let diff = 0;
  for (let at = 0; at < bits; at += 1) {
    if (notches[spot][at] !== notches[(spot + 1) % notches.length][at]) {
      diff += 1;
    }
  }
  if (diff !== 1) {
    single = false;
  }
}

emit("收尾后位置", state.pos);
emit("收尾后码字", codeOf(state.pos, bits));
emit("收尾后累计步数", state.steps);
emit("收尾后读数记录", JSON.stringify(state.reads));
emit("收尾后轨迹", JSON.stringify(state.traj));
emit("盘面单步不变量", single);
emit("读数条数", state.reads.length);
emit("非法事件数", failed);
emit("刻度总数", notches.length);
emit("样例事件数", (spec.events || []).length);
emit("前进一格码字", codeOf((spec.state.pos + 1) % (1 << bits), bits));
emit("环回距离 2 到 7", ringDistance(2, 7, 3));


// ---- 异常路径探针：真调用实现，看它报出什么码 ----
try {
  turn({ bits: 3, pos: 0, steps: 0, traj: [], reads: [] }, 2);
  emit("方向不合法报码", "没有报错");
} catch (error) {
  emit("方向不合法报码", error && error.code ? error.code : String(error.message));
}
try {
  read({ bits: 3, pos: 0, steps: 0, traj: [], reads: [] }, "12");
  emit("码字不合法报码", "没有报错");
} catch (error) {
  emit("码字不合法报码", error && error.code ? error.code : String(error.message));
}
try {
  notch({ bits: 3, pos: 0, steps: 0, traj: [], reads: [] }, 8);
  emit("刻度号越界报码", "没有报错");
} catch (error) {
  emit("刻度号越界报码", error && error.code ? error.code : String(error.message));
}

// ---- 期望值（参考模型算出）----
const EXPECTED = {
  "收尾后位置": 0,
  "收尾后码字": "000",
  "收尾后累计步数": 8,
  "收尾后读数记录": [
    [
      4,
      2
    ],
    [
      0,
      2
    ]
  ],
  "收尾后轨迹": [
    1,
    2,
    7,
    6,
    0
  ],
  "盘面单步不变量": true,
  "读数条数": 2,
  "非法事件数": 0,
  "刻度总数": 8,
  "样例事件数": 7,
  "前进一格码字": "001",
  "环回距离 2 到 7": 3,
  "方向不合法报码": "E_BAD_DIR",
  "码字不合法报码": "E_BAD_CODE",
  "刻度号越界报码": "E_BAD_NOTCH"
};
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  if (__same(found[1], want)) { console.log("一致 " + label + " = " + JSON.stringify(found[1])); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(found[1])); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
