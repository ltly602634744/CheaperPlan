/**
 * CheaperPlan App Color Scheme
 * 
 * 统一的颜色配置文件，用于管理整个应用的颜色主题
 */

export const Colors = {
  // 品牌主色（Primary）
  primary: {
    main: '#03A472',      // 亮绿：主要按钮、重点信息、logo主色
    soft: '#2AB68D',      // 柔绿：辅助按钮、二级强调、背景块
  },

  // 中性色（Neutral / Grayscale）
  neutral: {
    darkest: '#212121',   // 文字主色（深灰）
    dark: '#616161',      // 文字次级（浅灰）
    medium: '#9E9E9E',    // 禁用文字
    light: '#E0E0E0',     // 分割线/边框
    lightest: '#FAFAFA',  // 卡片背景
    white: '#FFFFFF',     // 背景基础
  },

  // 功能色（Functional Colors）
  functional: {
    success: '#4CAF50',   // 成功
    warning: '#FFC107',   // 警告
    error: '#F44336',     // 错误
    info: '#2196F3',      // 信息
  },

  // 辅助色（Accent）
  accent: {
    blue: '#2979FF',      // 强调蓝：链接、轻度强调
    orange: '#FF9800',    // 柔橙色：促销、特别提醒
  },

  // 背景色组合
  background: {
    primary: '#FFFFFF',   // 主背景
    secondary: '#FAFAFA', // 次要背景/卡片
    card: '#FFFFFF',      // 卡片背景
  },

  // 文字色组合
  text: {
    primary: '#212121',   // 主要文字
    secondary: '#616161', // 次要文字
    placeholder: '#9E9E9E', // 输入框占位符文字
    disabled: '#9E9E9E',  // 禁用文字
    inverse: '#FFFFFF',   // 反色文字（白色）
  },

  // 边框色
  border: {
    light: '#E0E0E0',     // 浅色边框
    medium: '#9E9E9E',    // 中等边框
    primary: '#03A472',   // 主色边框
    soft: '#2AB68D',      // 柔和主色边框
  },

  // 状态色组合（带透明度）
  status: {
    successBg: '#E8F5E8',     // 成功背景
    warningBg: '#FFF8E1',     // 警告背景
    errorBg: '#FFEBEE',       // 错误背景
    infoBg: '#E3F2FD',        // 信息背景
    primaryBg: '#E8F5E8',     // 主色背景
  },

  // 按钮色组合
  button: {
    primaryBg: '#03A472',     // 主按钮背景
    primaryText: '#FFFFFF',   // 主按钮文字
    secondaryBg: '#FFFFFF',   // 次按钮背景
    secondaryBorder: '#2AB68D', // 次按钮边框
    secondaryText: '#2AB68D', // 次按钮文字
    disabledBg: '#E0E0E0',    // 禁用按钮背景
    disabledText: '#9E9E9E',  // 禁用按钮文字
  },

  // Tab栏色
  tab: {
    active: '#03A472',        // 激活状态
    inactive: '#9E9E9E',      // 非激活状态
    background: '#FAFAFA',    // 背景色
    border: '#E0E0E0',        // 边框色
  },
};

// 导出常用颜色组合供快速使用
export const QuickColors = {
  // 主要操作
  primaryAction: Colors.primary.main,
  secondaryAction: Colors.primary.soft,
  
  // 文字
  primaryText: Colors.text.primary,
  secondaryText: Colors.text.secondary,
  
  // 背景
  screenBg: Colors.background.primary,
  cardBg: Colors.background.card,
  
  // 边框
  lightBorder: Colors.border.light,
  primaryBorder: Colors.border.primary,
  
  // 状态
  success: Colors.functional.success,
  error: Colors.functional.error,
  warning: Colors.functional.warning,
  info: Colors.functional.info,
};

export default Colors;