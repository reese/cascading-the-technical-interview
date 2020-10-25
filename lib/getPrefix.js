const PREFIXES = ["Moz", "Webkit", "O", "ms"];


export function getPrefix() {
  if (typeof window === "undefined" || typeof window.document === "undefined")
    return "";

  const { style } = window.document.documentElement;

  if ("transform" in style) {
    return "";
  }

  for (let i = 0; i < PREFIXES.length; ++i) {
    if (PREFIXES[i] + "Transform" in style) {
      return PREFIXES[i];
    }
  }
  return "";
}
