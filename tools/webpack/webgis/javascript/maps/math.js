function roundCustom(value, opt_decimals) {
  const number = Math.pow(10, (opt_decimals || 7) - 1);
  return Math.round(value * number) / number;
}

export { roundCustom };
