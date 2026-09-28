// app.js：渲染刻度盘
import { codeOf, decodeOf, ringDistance } from "./graycode.js";
import { turn, read, notch } from "./dial.js";

function copyState(state) {
  return {
    bits: state.bits, pos: state.pos, steps: state.steps,
    traj: (state.traj || []).slice(),
    reads: (state.reads || []).map(function (row) { return [row[0], row[1]]; })
  };
}

export function render(spec) {
  const bits = spec.bits;
  let state = copyState(spec.state);
  let failed = 0;
  const marks = [];
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
      marks.push([event.kind, error && error.code ? error.code : "E_BAD_EVENT"]);
    }
  }
  const notches = [];
  for (let spot = 0; spot < (1 << bits); spot += 1) {
    notches.push([spot, codeOf(spot, bits)]);
  }
  let singleStep = true;
  for (let spot = 0; spot < notches.length; spot += 1) {
    const here = notches[spot][1];
    const next = notches[(spot + 1) % notches.length][1];
    let diff = 0;
    for (let at = 0; at < bits; at += 1) {
      if (here[at] !== next[at]) {
        diff += 1;
      }
    }
    if (diff !== 1) {
      singleStep = false;
    }
  }
  return { pos: state.pos, code: codeOf(state.pos, bits), steps: state.steps,
           reads: state.reads, traj: state.traj, notches: notches,
           single_step: singleStep, failed_events: failed, failed_marks: marks,
           count_events: (spec.events || []).length,
           tail: decodeOf("110") + ringDistance(2, 7, 3) + codeOf(7, 3).length };
}
