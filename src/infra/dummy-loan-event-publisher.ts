import {
  LoanEventPublisher,
  LoanUpdateEvent,
} from '../app/loan-event-publisher';

/**
 * Dummy implementation of LoanEventPublisher for tests and local dev.
 * Simply logs events to the console instead of publishing to a real message queue.
 */
export class DummyLoanEventPublisher implements LoanEventPublisher {
  private events: LoanUpdateEvent[] = [];

  async publishLoanUpdated(event: LoanUpdateEvent): Promise<void> {
    console.log('📢 Loan Update Event:', {
      catalogueItemId: event.catalogueItemId,
      delta: event.delta,
      availableUnits: event.availableUnits,
      reason: event.reason,
      occurredAt: event.occurredAt,
    });
    // Store the event for testing purposes
    this.events.push({ ...event });
  }

  /**
   * Helper method to retrieve published events (useful for testing).
   */
  getPublishedEvents(): LoanUpdateEvent[] {
    return [...this.events];
  }

  /**
   * Helper method to clear published events (useful for testing).
   */
  clearEvents(): void {
    this.events = [];
  }
}