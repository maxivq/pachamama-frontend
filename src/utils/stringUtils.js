/**
 * Capitaliza la primera letra de una cadena
 * @param {string} str - La cadena a capitalizar
 * @returns {string} Cadena con primera letra en mayúscula
 */
export function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}