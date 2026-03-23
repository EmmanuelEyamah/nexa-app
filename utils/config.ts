import { Dimensions, PixelRatio, Platform } from "react-native";

const { height: screenHeight, width: screenWidth } = Dimensions.get("screen");

const touch = 10;

export const isAndroid = Platform.OS === "android";
export const isIOS = Platform.OS === "ios";

export const detectTouch = {
  bottom: touch,
  right: touch,
  left: touch,
  top: touch,
};

const frame = { height: 853, width: 393 }; // Frame according to figma design

function normalize(size: number, based = "width") {
  const newSize =
    based === "height"
      ? (size * screenHeight) / frame.height
      : (size * screenWidth) / frame.width;
  return newSize;
}

// for width pixel
const widthPixel = (size: number) => normalize(size, "width");
// for height pixel
const heightPixel = (size: number) => normalize(size, "height");
// for font pixel
const fontPixel = (size: number) => {
  return widthPixel(size);
};

const heightPercentageToDP = (heightPercent: number) => {
  return PixelRatio.roundToNearestPixel((screenHeight * heightPercent) / 100);
};

const widthPercentageToDP = (widthPercent: number) => {
  return PixelRatio.roundToNearestPixel((screenWidth * widthPercent) / 100);
};

export {
  fontPixel as fs,
  screenHeight as SCREEN_HEIGHT,
  screenWidth as SCREEN_WIDTH,
  heightPixel as hp,
  widthPixel as wp,
  heightPercentageToDP as hpt,
  widthPercentageToDP as wpt,
};
