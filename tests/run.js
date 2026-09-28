import assert from "node:assert";
import { codeOf, decodeOf, ringDistance } from "../graycode.js";
import { turn, read, notch } from "../dial.js";
import { render } from "../app.js";

const base = {
  bits: 3,
  state: { bits: 3, pos: 0, steps: 0, traj: [], reads: [] },
  events: [{ kind: "turn", dir: 1 }]
};

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("codeOf returns a string", () => {
  assert.strictEqual(typeof codeOf(3, 3), "string");
});

check("decodeOf returns a number", () => {
  assert.strictEqual(typeof decodeOf("110"), "number");
});

check("ringDistance returns a number", () => {
  assert.strictEqual(typeof ringDistance(0, 4, 3), "number");
});

check("turn returns a state", () => {
  assert.strictEqual(typeof turn(base.state, 1).pos, "number");
});

check("render marks the dial", () => {
  assert.strictEqual(typeof render(base).single_step, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
