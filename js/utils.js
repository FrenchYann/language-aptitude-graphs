const random_int = (min, max) => Math.floor(min + (max - min) * Math.random());
const random_color = () =>
  '#' +
  new Array(3)
    .fill()
    .map(() =>
      random_int(0, 256)
        .toString(16)
        .padStart(2, '0')
    )
    .join('');
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};
const parse_query_string = qs => {
  if (qs.charAt(0) === '?') {
    qs = qs.substr(1);
  }
  let tuple_list = qs.split('&').map(group => group.split('='));
  let res = {};
  for (let tuple of tuple_list) {
    let [key, value] = tuple;
    value = decodeURIComponent(value);
    if (key in res) {
      if (!Array.isArray(res[key])) {
        res[key] = [res[key]];
      }
      res[key].push(value);
    } else {
      res[key] = value;
    }
  }
  return res;
};

const enforce_array_length = (arr, length, default_value) => {
  let res = [];
  for (let i = 0; i < length; i++) {
    if (i < arr.length) {
      res.push(arr[i]);
    } else {
      res.push(default_value);
    }
  }
  return res;
};
