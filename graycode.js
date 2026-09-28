// graycode.js：格雷码与二进制互转、环回最短距离
export function codeOf(angle, bits) {
  const gray = angle ^ (angle >> 1);
  return gray.toString(2).padStart(bits, "0");
}

export function decodeOf(code) {
  let angle = 0;
  let bit = 0;
  for (const ch of code) {
    bit ^= Number(ch);
    angle = (angle << 1) | bit;
  }
  return angle;
}

export function ringDistance(from, to, bits) {
  const total = 1 << bits;
  const diff = Math.abs(to - from) % total;
  return Math.min(diff, total - diff);
}
