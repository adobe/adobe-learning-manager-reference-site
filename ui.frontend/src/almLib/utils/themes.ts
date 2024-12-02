import { EXTERNAL_FONT_FACE, STYLE_SHEET } from "./constants";
import { PrimeThemeData, PrimeTheme, PrimeThemeColors, getALMConfig } from "./global";
import { CARD_LOADING_SVG, CUSTOM_CARD_LOADING_SVG } from "./inline_svg";
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  CATALOG_CARD_HEIGHT,
  CardProperties,
  IThemeData,
} from "./widgets/common";
import { GetTrimmedValues } from "./widgets/utils";

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

let theme: PrimeTheme;
const primeThemesMap: { [key: string]: PrimeThemeColors } = {
  Autumn: {
    backgroundColor: "#454545",
    color: "#c7c7c7",
    subtleText: "#8f8f8f",
    textAreaBorder: "#787878",
    textAreaBackground: "#161616",
  },
  Carnival: {
    backgroundColor: "#f5f5f5",
    color: "#4a4a4a",
    subtleText: "#939393",
    textAreaBorder: "#bcbcbc",
    textAreaBackground: "#fff",
  },
  "Prime Default": {
    backgroundColor: "#292929",
    color: "#bfbfbf",
    subtleText: "#7f7f7f",
    textAreaBorder: "#565656",
    textAreaBackground: "#161616",
  },
  Pebbles: {
    backgroundColor: "#454545",
    color: "#c7c7c7",
    subtleText: "#8f8f8f",
    textAreaBorder: "#787878",
    textAreaBackground: "#161616",
  },
  "Winter Sky": {
    backgroundColor: "#f5f5f5",
    color: "#4A4A4A",
    subtleText: "#939393",
    textAreaBorder: "#bcbcbc",
    textAreaBackground: "#fff",
  },
  Vivid: {
    backgroundColor: "#232323",
    color: "#ECECEC",
    subtleText: "#ECECEC",
    textAreaBorder: "#707070",
    textAreaBackground: "#161616",
  },
};
export function InitThemeData(themeDataStr: string, themeDataOverrides: IThemeData): void {
  themeDataOverrides = themeDataOverrides || {};
  const themeData: PrimeThemeData = JSON.parse(themeDataStr);
  const config = getALMConfig();
  const configThemeData = config.themeData;
  const tileColors =
    configThemeData?.tileColors ||
    themeDataOverrides.tileColors ||
    themesMap[themeData.name] ||
    themesMap["Prime Default"];
  const primeThemeColors = primeThemesMap[themeData.name] || primeThemesMap["Prime Default"];

  const primaryColor = themeDataOverrides.primaryColor || themeData.widgetPrimaryColor || "#0265DC";
  const secondaryColor =
    themeDataOverrides.secondaryColor || themeData.sidebarIconColor || "#0091ff";
  let neutralColors = ["#6d6d6d", "#b1b1b1", "#e6e6e6", "#f8f8f8", "#ffffff"];
  let backgroundColor = "#ffffff";
  const darkMode = themeDataOverrides.darkMode || false;
  if (darkMode) {
    neutralColors = ["#ffffff", "#e9e9e9", "#c9c9c9", "#8e8e8e", "#2e2f30"];
    backgroundColor = "#000000";
  }
  if (themeDataOverrides.background) {
    document.body.style.background = themeDataOverrides.background;
  } else {
    document.body.style.backgroundColor = backgroundColor;
  }
  theme = {
    name: themeData.name,
    tileColors,
    primaryColor,
    secondaryColor,
    neutralColors,
    themeOverrides: themeDataOverrides,
    primeThemeColors,
    sidebarColor: themeData.sidebarColor,
    sidebarIconColor: themeData.sidebarIconColor,
    brandColor: themeData.brandColor,
  };
  if (configThemeData?.homePageBackgroundColor) {
    theme["homePageBackgroundColor"] = configThemeData?.homePageBackgroundColor;
  }
  if (configThemeData?.homePageBackgroundImage) {
    theme["homePageBackgroundImage"] = configThemeData?.homePageBackgroundImage;
  }
  if (configThemeData?.fonts) {
    theme["fonts"] = configThemeData?.fonts;
  }
  config.themeData = theme;
  config._cardProperties = GetCardProperties();
  InitFromPrimeTheme();
  intiCssVariablesFromThems(theme);
  setCssVariable("--prime-card-height", config._cardProperties.height + "px");
  setCssVariable("--prime-card-width", config._cardProperties.width + "px");
  setCssVariable("--prime-catalog-card-height", CATALOG_CARD_HEIGHT + "px");
}
const setCssVariable = (attribute: string, color: string) => {
  document.documentElement.style.setProperty(attribute, color);
};
function intiCssVariablesFromThems(theme: PrimeTheme) {
  const {
    neutralColors,
    brandColor,
    primaryColor,
    secondaryColor,
    tileColors,
    sidebarColor,
    sidebarIconColor,
    primeThemeColors,
    homePageBackgroundColor,
    homePageBackgroundImage,
    fonts,
  } = theme;

  setCssVariable("--prime-color-primary", primaryColor);
  setCssVariable("--prime-icon-color", sidebarIconColor);
  setCssVariable("--prime-brand-color", brandColor);
  setCssVariable("--prime-color-secondary", secondaryColor);
  setCssVariable("--prime-color-sidebarColor", sidebarColor);
  setCssVariable("--prime-color-popup-background", primeThemeColors?.backgroundColor || "#292929");
  setCssVariable("--prime-color-popup-color", primeThemeColors?.color || "#bfbfbf");
  setCssVariable("--prime-color-popup-subtle-text", primeThemeColors?.subtleText || "#7f7f7f");
  setCssVariable(
    "--prime-color-popup-text-area-border",
    primeThemeColors?.textAreaBorder || "#565656"
  );
  setCssVariable(
    "--prime-color-popup-text-area-background",
    primeThemeColors?.textAreaBackground || "#161616"
  );
  neutralColors.forEach((color, index) => {
    setCssVariable(`${"--prime-color-neutral-"}${index + 1}`, color);
  });
  tileColors.forEach((color, index) => {
    setCssVariable(`${"--prime-tile-"}${index + 1}`, color);
  });

  setCssVariable("--prime-font-family", theme.themeOverrides.fontNames);
  const background = homePageBackgroundImage
    ? `url('${homePageBackgroundImage}')`
    : homePageBackgroundColor;
  if (background) {
    setCssVariable("--prime-background", "transparent");
  }
  if (fonts && fonts.fontFace) {
    AddStyleSheetToHead(fonts.fontFace, EXTERNAL_FONT_FACE);
  }
  setCssVariable("--prime-font-family", fonts ? fonts.fontName : theme.themeOverrides.fontNames);
}
export function InitFromPrimeTheme() {
  theme = getALMConfig().themeData;
  if (theme.themeOverrides.globalCssText) {
    AddStyleToHead(theme.themeOverrides.globalCssText, "global");
  }
  let fontNames = theme.themeOverrides.fontNames;
  if (fontNames) {
    if (!Array.isArray(fontNames)) {
      fontNames = GetTrimmedValues(fontNames);
    } else {
      fontNames = fontNames[0];
    }
  }
  theme.themeOverrides.fontNames = fontNames || "adobe-clean";
  theme.themeOverrides.componentCssText = theme.themeOverrides.componentCssText || {};
}

function GetCardProperties(): CardProperties {
  if (theme && theme.themeOverrides.cardLayout) {
    const cardLayout = theme.themeOverrides.cardLayout;
    if (cardLayout.cardLayoutName == "compact") {
      return {
        height: 110,
        showActionElement: false,
        cardLoadingImage: CUSTOM_CARD_LOADING_SVG(),
        width: CARD_WIDTH,
        ...cardLayout,
      } as CardProperties;
    }
  }
  return {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    showActionElement: true,
    cardLoadingImage: CARD_LOADING_SVG(),
  } as CardProperties;
}
export const getTileImageIndex = (id: string) => {
  return id ? parseInt(id?.split(":")[1], 10) % 12 : 0;
};

export function GetTileImageFromId(id: string): string {
  return `https://cpcontents.adobe.com/public/images/default_card_icons/${getTileImageIndex(
    id
  ).toString()}.svg`;
}

export function AddStyleToHead(styleContent: string | undefined, styleId: string) {
  if (styleContent) {
    const styleEl = document.createElement("style");
    styleEl.textContent = styleContent;
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
}

export function AddStyleSheetToHead(styleContent: string | undefined, styleId: string) {
  if (styleContent && !document.getElementById(styleId)) {
    const linkElement = document.createElement("link");
    linkElement.rel = STYLE_SHEET;
    linkElement.id = styleId;
    linkElement.href = styleContent;
    document.head.appendChild(linkElement);
  }
}

export function GetTileColor(id: string): string {
  return GetTileColorFromIndex(getTileImageIndex(id));
}

export function GetTileColorFromIndex(index: number): string {
  const theme = getALMConfig().themeData;
  return theme.tileColors[index];
}
