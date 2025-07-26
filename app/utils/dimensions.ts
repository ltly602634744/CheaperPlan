import { Dimensions, PixelRatio } from 'react-native';
import { useEffect, useState } from 'react';

const { width, height } = Dimensions.get('window');

export const screenDimensions = {
  width,
  height,
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
};

export const responsive = {
  // 根据屏幕宽度计算相对尺寸
  wp: (percentage: number) => (width * percentage) / 100,
  hp: (percentage: number) => (height * percentage) / 100,
  
  // 字体大小适配
  fontSize: (size: number) => {
    const scale = width / 375; // 以iPhone X为基准
    return Math.round(PixelRatio.roundToNearestPixel(size * scale));
  },
  
  // 常用断点
  breakpoints: {
    small: 375,
    medium: 414,
    large: 768,
  }
};

// 监听屏幕变化的hook
export const useScreenDimensions = () => {
  const [dimensions, setDimensions] = useState(screenDimensions);
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
        isSmallDevice: window.width < 375,
        isMediumDevice: window.width >= 375 && window.width < 414,
        isLargeDevice: window.width >= 414,
      });
    });
    
    return () => subscription?.remove();
  }, []);
  
  return dimensions;
};