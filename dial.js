// dial.js：刻度盘的步进、读数与拨格
import { decodeOf, ringDistance } from "./graycode.js";

function nextState(state, patch) {
  return {
    bits: state.bits,
    pos: state.pos,
    steps: state.steps,
    traj: (state.traj || []).slice(),
    reads: (state.reads || []).map(function (row) { return [row[0], row[1]]; }),
    ...patch
  };
}

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

export function turn(state, dir) {
  if (dir !== 1 && dir !== -1) {
    fail("E_BAD_DIR", "direction must be 1 or -1");
  }
  const total = 1 << state.bits;
  const pos = (state.pos + dir + total) % total;
  return nextState(state, {
    pos: pos,
    steps: state.steps + 1,
    traj: (state.traj || []).concat(pos)
  });
}

export function read(state, code) {
  if (typeof code !== "string" ||
      code.length !== state.bits ||
      !/^[01]+$/.test(code)) {
    fail("E_BAD_CODE", "code must be a binary string of length bits");
  }
  const angle = decodeOf(code);
  const distance = ringDistance(state.pos, angle, state.bits);
  return nextState(state, {
    reads: (state.reads || []).concat([[angle, distance]])
  });
}

export function notch(state, spot) {
  const total = 1 << state.bits;
  if (!Number.isInteger(spot) || spot < 0 || spot >= total) {
    fail("E_BAD_NOTCH", "spot must be an integer within [0, 2^bits - 1]");
  }
  const distance = ringDistance(state.pos, spot, state.bits);
  return nextState(state, {
    pos: spot,
    steps: state.steps + distance,
    traj: (state.traj || []).concat(spot)
  });
}
