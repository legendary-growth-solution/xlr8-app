import { Plan } from 'src/types/session';

export interface PlanCartSelection {
  planId: string;
  cartType: string;
  count: number;
}

export interface DiscountInfo {
  code: string;
  amount: number;
  type: 'absolute' | 'percentage' | 'percent';
}

interface CalculateBookingTotalParams {
  peopleCount: number;
  selections: PlanCartSelection[];
  plans: Plan[];
  sameForAll: boolean;
  discount?: DiscountInfo;
}

export function calculateBookingTotal({
  peopleCount,
  selections,
  plans,
  sameForAll,
  discount,
}: CalculateBookingTotalParams) {
  let subtotal = 0;

  if (sameForAll && selections.length > 0) {
    const selection = selections[0];
    const plan = plans.find((p) => p.plan_id === selection.planId);
    subtotal = (plan?.amount || 0) * peopleCount;
  } else {
    selections.forEach((selection) => {
      const plan = plans.find((p) => p.plan_id === selection.planId);
      subtotal += (plan?.amount || 0) * selection.count;
    });
  }

  if (!discount) {
    return { subtotal, discountAmount: 0, total: subtotal };
  }

  let discountAmount = 0;
  if (discount.type === 'percentage' || discount.type === 'percent') {
    discountAmount = (subtotal * discount.amount) / 100;
  } else {
    discountAmount = discount.amount;
  }

  const total = Math.max(0, subtotal - discountAmount);

  return { subtotal, discountAmount, total };
}

