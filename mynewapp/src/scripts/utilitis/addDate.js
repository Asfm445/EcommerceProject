
export function add(day) {
  let today = new Date();
  let d = today.getDay() - 1;
  let m = today.getMonth();
  let y = today.getFullYear();
  return new Date(y, m, d + day).toISOString();
}
