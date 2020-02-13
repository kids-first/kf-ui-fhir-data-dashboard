export const getHumanReadableNumber = value =>
  value.toLocaleString(navigator.language, {minimumFractionDigits: 0});
