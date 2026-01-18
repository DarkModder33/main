// Premium feature gating utilities
export function checkPremiumAccess(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check localStorage for premium status
  const isPremium = localStorage.getItem('isPremium') === 'true';
  
  // TODO: Validate with backend API
  // const response = await fetch('/api/premium/verify')
  
  return isPremium;
}

export function setPremiumStatus(status: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('isPremium', String(status));
}

export const PREMIUM_FEATURES = {
  UNLIMITED_TASKS: 'unlimited_tasks',
  CLOUD_SYNC: 'cloud_sync',
  DUE_DATES: 'due_dates',
  PRIORITY_LEVELS: 'priority_levels',
  EXPORT: 'export',
  AD_FREE: 'ad_free',
  BLOCKCHAIN_VERIFY: 'blockchain_verify'
} as const;

export function hasFeature(feature: string): boolean {
  const isPremium = checkPremiumAccess();
  
  // All features require premium except basic task management
  return isPremium || feature === 'basic';
}
