import { PrimeThemeData } from "./global";

export const defaultTheme = [
  "#455d88",
  "#bdb4b4",
  "#4d728f",
  "#787c80",
  "#859072",
  "#84767e",
  "#6aa0aa",
  "#a2988f",
  "#7390a5",
  "#65747b",
  "#487789",
  "#bfa47a",
];

export const themesMap: { [key: string]: Array<string> } = {
  Autumn: [
    "#cc7a7a",
    "#e8c367",
    "#e0a168",
    "#f29b5f",
    "#cca691",
    "#e2b788",
    "#da9084",
    "#dd756b",
    "#d89b8f",
    "#f2ab6a",
    "#e6bfbf",
    "#a58499",
  ],
  Carnival: [
    "#19277c",
    "#2d9bd8",
    "#2ccddd",
    "#6fce98",
    "#e55c5c",
    "#756dbf",
    "#f29e57",
    "#a8548c",
    "#66aa9d",
    "#9c65b8",
    "#57caf2",
    "#f9c94f",
  ],
  "Prime Default": defaultTheme,
  Default: defaultTheme,
  Pebbles: [
    "#626b99",
    "#7aabcc",
    "#8fc6cc",
    "#beccb6",
    "#d88a82",
    "#827daf",
    "#ccaf8f",
    "#af82a2",
    "#79b5aa",
    "#af7d7d",
    "#6b99b2",
    "#ddc587",
  ],
  "Winter Sky": [
    "#6b99b2",
    "#439bba",
    "#7aabcc",
    "#61c1db",
    "#8fc6cc",
    "#bcccaa",
    "#beccb6",
    "#c9c6af",
    "#bfc4b8",
    "#a5beb9",
    "#7fabaf",
    "#649ea7",
  ],
  Vivid: [
    "#075a20",
    "#008099",
    "#0a852f",
    "#9f52cb",
    "#4568f2",
    "#ad5700",
    "#C74E1F",
    "#474747",
    "#d23b00",
    "#737373",
    "#007ab8",
    "#99157a",
  ],
};

const setColor = (attribute: string, color: string) => {
  document.documentElement.style.setProperty(attribute, color);
};

export const setThemeVariables = (themesData: PrimeThemeData) => {
  const primaryColor = themesData.widgetPrimaryColor;
  const sidebarIconColor = themesData.sidebarIconColor;
  const brandColor = themesData.brandColor;
  setColor("--prime-color-primary", primaryColor);
  setColor("--prime-icon-color", sidebarIconColor);
  setColor("--prime-brand-color", brandColor);
};
