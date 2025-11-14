import { Plan } from 'src/types/session';

export interface PlanCartSelection {
  planId: string;
  cartType: string;
  count: number;
}

interface CalculateBookingTotalParams {
  peopleCount: number;
  selections: PlanCartSelection[];
  plans: Plan[];
  sameForAll: boolean;
}

export function calculateBookingTotal({
  peopleCount,
  selections,
  plans,
  sameForAll,
}: CalculateBookingTotalParams) {
  let total = 0;

  if (sameForAll && selections.length > 0) {
    const selection = selections[0];
    const plan = plans.find((p) => p.plan_id === selection.planId);
    total = (plan?.amount || 0) * peopleCount;
  } else {
    selections.forEach((selection) => {
      const plan = plans.find((p) => p.plan_id === selection.planId);
      total += (plan?.amount || 0) * selection.count;
    });
  }

  return total;
}

