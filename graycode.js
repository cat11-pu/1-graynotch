// graycode.js：格雷码与二进制互转、环回最短距离
export function codeOf(angle, bits) {
  const gray = (angle ^ (angle >> 1)) >>> 0;
  return gray.toString(2).padStart(bits, "0");
}

export function decodeOf(code) {
  let value = 0;
  let running = 0;
  for (const char of code) {
    running ^= Number(char);
    value = (value << 1) | running;
  }
  return value >>> 0;
}

export function ringDistance(from, to, bits) {
  const total = 1 << bits;
  const forward = (((to - from) % total) + total) % total;
  return Math.min(forward, total - forward);
}
