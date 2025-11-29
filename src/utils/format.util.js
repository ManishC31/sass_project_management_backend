export const StandardCase = (str) => {
  // Handle empty or null strings
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
