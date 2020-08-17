const fruitCombos = Object.freeze([
  {
    watermelon: 1,
    pineapple: 1,
    orange: 0,
  },
  {
    watermelon: 1,
    pineapple: 0,
    orange: 1,
  },
  {
    watermelon: 0,
    pineapple: 1,
    orange: 1,
  },
  {
    watermelon: 2,
    pineapple: 0,
    orange: 0,
  },
  {
    watermelon: 0,
    pineapple: 2,
    orange: 0,
  },
  {
    watermelon: 0,
    pineapple: 0,
    orange: 2,
  },
]);

module.exports = fruitCombos;
