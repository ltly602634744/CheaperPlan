// 运营商官网URL映射
export const PROVIDER_URLS: { [key: string]: string } = {
  // 加拿大主要运营商
  'Rogers': 'https://www.rogers.com',
  'Bell': 'https://www.bell.ca',
  'Telus': 'https://www.telus.com',
  'Freedom Mobile': 'https://www.freedommobile.ca',
  'Fido': 'https://www.fido.ca',
  'Virgin Plus': 'https://www.virginplus.ca',
  'Koodo': 'https://www.koodomobile.com',
  'Chatr': 'https://www.chatrwireless.com',
  'Public Mobile': 'https://www.publicmobile.ca',
  'Lucky Mobile': 'https://www.luckymobile.ca',
};

/**
 * 根据运营商名称获取官网URL
 * @param provider 运营商名称
 * @returns 官网URL，如果找不到则返回null
 */
export const getProviderUrl = (provider: string): string | null => {
  if (!provider) return null;
  
  // 直接匹配
  if (PROVIDER_URLS[provider]) {
    return PROVIDER_URLS[provider];
  }
  
  // 模糊匹配（不区分大小写）
  const normalizedProvider = provider.toLowerCase().trim();
  for (const [key, url] of Object.entries(PROVIDER_URLS)) {
    if (key.toLowerCase().includes(normalizedProvider) || 
        normalizedProvider.includes(key.toLowerCase())) {
      return url;
    }
  }
  
  return null;
};

/**
 * 检查是否有运营商官网URL
 * @param provider 运营商名称
 * @returns 是否有对应的官网URL
 */
export const hasProviderUrl = (provider: string): boolean => {
  return getProviderUrl(provider) !== null;
}; 