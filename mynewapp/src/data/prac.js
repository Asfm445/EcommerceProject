let today = new Date();
let day = today.getDay();
let m = today.getMonth();
let y = today.getFullYear();
let newDay = new Date(y, m, day);

console.log(today, newDay);
