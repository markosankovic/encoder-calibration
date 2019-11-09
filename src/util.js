export function calcAcGain(val) {
  const table = [4.4, 7.8, 12.4, 20.7];
  return table[val];
}

export function calcAfGain(val) {
  if (val === 0x0) {
    return 1;
  } else if (val === 0x1) {
    return 1.45;
  } else if (val === 0x7) {
    return 13.75;
  } else {
    return Math.exp(Math.log(20) / 8 * val);
  }
}

export function furtherFromValue(a, b, value) {
  const aDiff = Math.abs(value - a);
  const bDiff = Math.abs(value - b);
  if (aDiff > bDiff) {
    return 1;
  } else if (aDiff < bDiff) {
    return -1;
  } else {
    return 0;
  }
}
