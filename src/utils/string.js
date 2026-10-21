/** Capitalize the first character, preserving the rest of the provided name. */
export const capitalize = (value) => {
  if (!value) return '';
  const text = String(value);
  return text.charAt(0).toLocaleUpperCase('pt-BR') + text.slice(1);
};

export const formatName = capitalize;
