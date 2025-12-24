import {
  LoanEventPublisher,
  LoanUpdateEvent,
} from '../app/loan-event-publisher';
import { EventGridPublisherClient, AzureKeyCredential } from '@azure/eventgrid';
import { randomUUID } from 'crypto';

export type EventGridOptions = {
  endpoint: string;
  key: string;
};

/**
 * Azure Event Grid implementation of LoanEventPublisher.
 * Publishes loan update events to an Event Grid topic.
 */
export class EventGridLoanEventPublisher implements LoanEventPublisher {
  private client: EventGridPublisherClient<'CloudEvent'>;

  constructor(options: EventGridOptions) {
    if (!options.endpoint || options.endpoint.trim() === '') {
      throw new Error(
        'EventGridLoanEventPublisher requires a non-empty endpoint'
      );
    }
    if (!options.key || options.key.trim() === '') {
      throw new Error(
        'EventGridLoanEventPublisher requires a non-empty key'
      );
    }

    this.client = new EventGridPublisherClient(
      options.endpoint,
      'CloudEvent',
      new AzureKeyCredential(options.key)
    );
  }

  async publishLoanUpdated(event: LoanUpdateEvent): Promise<void> {
    const cloudEvent = {
      id: randomUUID(),
      type: 'catalogue.item.availability.changed',
      source: '/catalogue/items',
      subject: `catalogue-items/${event.catalogueItemId}`,
      time: new Date(event.occurredAt),
      specversion: '1.0',
      datacontenttype: 'application/json',
      data: {
        catalogueItemId: event.catalogueItemId,
        delta: event.delta,
        availableUnits: event.availableUnits,
        reason: event.reason,
        occurredAt: event.occurredAt,
      },
    };

    await this.client.send([cloudEvent]);
  }
}