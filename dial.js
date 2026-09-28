// dial.js：刻度盘的步进、读数与拨格
import { decodeOf, ringDistance } from "./graycode.js";

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function withTraj(state, pos) {
  return {
    bits: state.bits,
    pos: pos,
    steps: state.steps,
    traj: (state.traj || []).concat([pos]),
    reads: state.reads || []
  };
}

export function turn(state, dir) {
  if (dir !== 1 && dir !== -1) {
    fail("E_BAD_DIR", "direction must be 1 or -1");
  }
  const total = 1 << state.bits;
  const pos = (((state.pos + dir) % total) + total) % total;
  const next = withTraj(state, pos);
  next.steps = state.steps + 1;
  return next;
}

export function read(state, code) {
  const bits = state.bits;
  const valid = typeof code === "string" &&
    code.length === bits && /^[01]+$/.test(code);
  if (!valid) {
    fail("E_BAD_CODE", "code must be a " + bits + "-bit string of 0 and 1");
  }
  const angle = decodeOf(code);
  const distance = ringDistance(state.pos, angle, bits);
  return {
    bits: bits,
    pos: state.pos,
    steps: state.steps,
    traj: state.traj || [],
    reads: (state.reads || []).concat([[angle, distance]])
  };
}

export function notch(state, spot) {
  const total = 1 << state.bits;
  if (!Number.isInteger(spot) || spot < 0 || spot >= total) {
    fail("E_BAD_NOTCH", "notch spot out of range");
  }
  const distance = ringDistance(state.pos, spot, state.bits);
  const next = withTraj(state, spot);
  next.steps = state.steps + distance;
  return next;
}
