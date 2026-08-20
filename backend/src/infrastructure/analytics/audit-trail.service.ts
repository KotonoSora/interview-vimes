// src/infrastructure/analytics/audit-trail.service.ts
export interface AuditEventPayload {
  eventName: string;
  requestId: string;
  receiptId: string;
  receiptNumber?: string;
  warehouseId?: string;
  totalAmount?: number;
  itemCount?: number;
  timestamp: Date;
  [key: string]: unknown;
}

export class AuditTrailService {
  public logEvent(event: AuditEventPayload): void {
    // Non-blocking fire-and-forget logging logic for Audit & Analytics
    // Sẵn sàng đẩy sang Message Queue (Kafka/RabbitMQ) hoặc ClickHouse
  }
}
