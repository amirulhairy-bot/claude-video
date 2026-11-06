import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Montserrat variable font (SIL OFL, via @fontsource) bundled locally so renders work offline.
export const FONT = "Montserrat";

loadFont({
  family: FONT,
  url: staticFile("fonts/Montserrat.woff2"),
  weight: "100 900",
  format: "woff2",
});
