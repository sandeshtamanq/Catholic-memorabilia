export enum ShippingMethod {
  Standard = 'standard',
  Express = 'express',
}

export interface ShippingOption {
  method: ShippingMethod;
  fee: number;
  estimate: string;
}

export const SHIPPING_POLICY = {
  standardFee: 8,
  expressFee: 15,
  freeShippingThreshold: 100,
  standardEstimate: '5–7 business days',
  expressEstimate: '1–2 business days',
} as const;

export function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

export function getShippingFee(
  subtotal: number,
  method: ShippingMethod = ShippingMethod.Standard,
): number {
  const discountedSubtotal = Math.max(Number(subtotal) || 0, 0);

  if (discountedSubtotal <= 0) {
    return 0;
  }

  if (method === ShippingMethod.Express) {
    return SHIPPING_POLICY.expressFee;
  }

  return discountedSubtotal >= SHIPPING_POLICY.freeShippingThreshold
    ? 0
    : SHIPPING_POLICY.standardFee;
}

export function getAvailableShippingOptions(
  subtotal: number,
): ShippingOption[] {
  return [
    {
      method: ShippingMethod.Standard,
      fee: getShippingFee(subtotal, ShippingMethod.Standard),
      estimate: SHIPPING_POLICY.standardEstimate,
    },
    {
      method: ShippingMethod.Express,
      fee: getShippingFee(subtotal, ShippingMethod.Express),
      estimate: SHIPPING_POLICY.expressEstimate,
    },
  ];
}

export function calculateCheckoutTotal(
  subtotal: number,
  shippingMethod: ShippingMethod = ShippingMethod.Standard,
  additionalCharges = 0,
): { subtotal: number; shippingFee: number; total: number } {
  const discountedSubtotal = roundMoney(Math.max(Number(subtotal) || 0, 0));
  const shippingFee = roundMoney(
    getShippingFee(discountedSubtotal, shippingMethod),
  );
  const total = roundMoney(
    discountedSubtotal +
      shippingFee +
      Math.max(Number(additionalCharges) || 0, 0),
  );

  return {
    subtotal: discountedSubtotal,
    shippingFee,
    total,
  };
}
