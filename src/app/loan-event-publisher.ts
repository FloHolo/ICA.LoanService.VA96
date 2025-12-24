
export type LoanUpdateEvent = {
  catalogueItemId: string;
  delta: number; // -1 reserve, +1 return
  availableUnits: number;
  reason: 'RESERVED' | 'RETURNED';
  occurredAt: string;
};

export interface LoanEventPublisher {
  /**
   * Publish an event when a product is updated.
   */
  publishLoanUpdated(event: LoanUpdateEvent): Promise<void>;
}