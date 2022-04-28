const args = [];

if (process.env.NO_SANDBOX ?? false) {
  args.push('--no-sandbox');
}

module.exports = {
  launch: {
    args,
  },
};
