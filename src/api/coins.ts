import { api } from './client';
import type { CoinPackage, CoinPurchaseRequest } from '@/types';

// Buying coins or a matrimony subscription (both manual bKash/Nagad top-ups
// unlocking something usable inside the app) is intentionally view-only here
// — "Buy coins"/"Subscribe" open chtplus.xyz in the system browser instead of
// submitting the purchase from inside the app, to stay clear of Google Play's
// billing requirements for in-app digital goods. Spending an existing coin
// balance (sponsoring, unlocking) is unaffected and lives in services.ts /
// marketplace.ts / biodata.ts.

export function getCoinPackages() {
  return api.get<CoinPackage[]>('/coin-packages').then((r) => r.data);
}

export function getMyCoinPurchaseHistory() {
  return api.get<CoinPurchaseRequest[]>('/coin-purchase-requests').then((r) => r.data);
}

export interface SubscriptionStatus {
  id: number;
  method: 'bkash' | 'nagad';
  transactionId: string;
  phone: string;
  amount: number;
  status: 'pending' | 'active' | 'rejected' | 'expired';
  requestedAt: string;
  decidedAt: string | null;
  expiresAt: string | null;
}

export function getMySubscriptionStatus() {
  return api.get<{ subscription: SubscriptionStatus | null }>('/subscriptions').then((r) => r.data);
}
