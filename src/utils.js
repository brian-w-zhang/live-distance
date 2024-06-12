// src/utils.js
export const isMobileDevice = () => {
  return /Mobi|Android/i.test(navigator.userAgent);
};
