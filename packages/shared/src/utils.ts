export function setTimeoutPromisified(delay: number) {
  return new Promise((res, rej) => {
    setTimeout(res, delay);
  });
}
