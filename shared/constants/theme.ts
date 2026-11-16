/**
 * Paleta del rediseño editorial. La superficie es plana (sin degradados): el
 * color lo fija el estado del tema en `index.css` y aquí se exponen los valores
 * que necesita el código compartido.
 */

export const alertColors = {
  yellow: "#FFD600",
  orange: "#FF9500",
  red: "#FF3B30",
} as const;

/** Fondo del aviso según severidad (el amarillo usa un tono pastel legible). */
export const alertBackground: Record<keyof typeof alertColors, string> = {
  yellow: "#FFF4B8",
  orange: "#FF9500",
  red: "#FFD9D6",
};

/** Etiqueta corta del nivel de aviso. */
export const alertSeverityLabel: Record<keyof typeof alertColors, string> = {
  yellow: "Amarillo",
  orange: "Naranja",
  red: "Rojo",
};
