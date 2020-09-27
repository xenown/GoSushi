const dev = process.env.SHORT;

const handSizeMap = dev ? 
{
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
}
: 
{
  2: 10,
  3: 10,
  4: 9,
  5: 9,
  6: 8,
  7: 8,
  8: 7,
};

module.exports = handSizeMap;
