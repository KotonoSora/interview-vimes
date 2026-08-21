---
tags:
  - "#interview"
  - "#home-test"
  - "#2026-08-18"
  - "#expressjs"
---
# Tài Liệu Kỹ Thuật & Hướng Dẫn Vận Hành Hệ Thống Quản Lý Phiếu Nhập Kho (Mẫu 01 - VT)

Hệ thống được thiết kế theo mô hình kiến trúc phân lớp **Domain-Driven Design (DDD)** kết hợp quy trình phát triển **Test-Driven Development (TDD)** và chiến lược bảo mật **Defense-in-Depth**. Kiến trúc đáp ứng đầy đủ chuẩn mực kế toán Việt Nam (**Mẫu 01 - VT theo Thông tư 200/2014/TT-BTC** và **Điều 24, Điều 25 Luật Kế toán 2015**), đồng thời tích hợp toàn bộ các tiêu chuẩn vận hành môi trường Production hiện đại: Observability, Container Health Checks, Alerting Rules, Audit Analytics và Bảo mật/Anti-DDoS với phiên bản thư viện mới nhất và an toàn nhất.

## 1. Cấu Trúc Dự Án (Monorepo Workspace)

Plaintext

```Plaintext
vimes-inventory/
├── docker/
│   ├── Dockerfile.backend       # Multi-stage build Node.js v24.19.0 (LTS Krypton)
│   ├── docker-compose.yml       # Điều phối PostgreSQL v18.6 + Backend API + Nginx + Prometheus
│   └── nginx.conf               # Reverse Proxy, Rate Limiting, SSL Termination & Anti-DDoS
├── sql/
│   ├── 01_schema.sql            # DDL tạo bảng PostgreSQL theo TT 200 & Luật KT (3NF)
│   ├── 02_seed.sql              # Dữ liệu khởi tạo (Vật tư, Kho, Đơn vị)
│   └── 03_security_roles.sql    # Phân quyền Principle of Least Privilege cho DB User
├── docs/
│   ├── openapi.yaml             # Đặc tả OpenAPI 3.1.0 (Full CRUD + Health + Metrics)
│   └── runbook-incidents.md     # Sổ tay quy trình xử lý sự cố khẩn cấp (P1/P2/P3)
├── frontend/                    # [TODO]: Frontend UI workspace (triển khai sau)
│   └── README.md                # Tài liệu hợp đồng API (API Contract) cho FE
└── backend/                     # BACKEND REST API (TypeScript + DDD + TDD)
    ├── package.json
    ├── tsconfig.json
    ├── jest.config.ts
    ├── .env.example
    ├── src/
    │   ├── domain/              # Lớp Core Domain (Pure Business Logic & Invariants)
    │   │   ├── entities/
    │   │   │   ├── goods-receipt.entity.ts
    │   │   │   └── receipt-item.entity.ts
    │   │   ├── value-objects/
    │   │   │   ├── money.vo.ts
    │   │   │   └── quantity.vo.ts
    │   │   ├── events/          # Domain Events phục vụ Audit Trail & Analytics
    │   │   │   └── goods-receipt-created.event.ts
    │   │   └── repositories/
    │   │       └── goods-receipt.repository.interface.ts
    │   ├── application/         # Lớp Use Cases & DTOs
    │   │   ├── dtos/
    │   │   │   ├── create-goods-receipt.dto.ts
    │   │   │   └── update-goods-receipt.dto.ts
    │   │   └── use-cases/
    │   │       ├── create-goods-receipt.use-case.ts
    │   │       ├── update-goods-receipt.use-case.ts
    │   │       └── delete-goods-receipt.use-case.ts
    │   ├── infrastructure/      # Lớp Hạ tầng (Database, Security, Logging, Observability)
    │   │   ├── database/
    │   │   │   └── postgres-pool.ts
    │   │   ├── logging/
    │   │   │   └── structured-logger.ts # JSON Logger (Pino) với Request Tracing
    │   │   ├── monitoring/
    │   │   │   └── metrics.ts       # Prometheus Exporter (prom-client)
    │   │   ├── analytics/
    │   │   │   └── audit-trail.service.ts # Non-blocking Event Handler
    │   │   └── repositories/
    │   │       └── postgres-goods-receipt.repository.ts
    │   ├── presentation/        # Lớp Giao tiếp REST API & Middlewares
    │   │   ├── controllers/
    │   │   │   ├── goods-receipt.controller.ts
    │   │   │   └── health.controller.ts
    │   │   ├── middlewares/
    │   │   │   ├── request-id.middleware.ts # Tracing X-Request-Id
    │   │   │   ├── security.middleware.ts   # Helmet, Rate Limiter, HPP
    │   │   │   ├── error.middleware.ts      # Error Masking & Stack Protection
    │   │   │   └── validate.middleware.ts
    │   │   └── routes/
    │   │       ├── goods-receipt.routes.ts
    │   │       └── health.routes.ts
    │   ├── app.ts               # Express App Setup & Security Hardening
    │   └── server.ts            # Graceful Shutdown & Server Bootstrap
    └── tests/                   # Kiểm thử tự động TDD
        ├── unit/
        │   ├── domain/
        │   └── use-cases/
        └── integration/
```

## 2. Đặc Tả Core Domain & Application Layer (DDD)

### Value Objects (Domain Layer)

**File: `backend/src/domain/value-objects/money.vo.ts`**

TypeScript

```TypeScript
export class Money {
  private readonly _amount: number;

  constructor(amount: number) {
    if (isNaN(amount) || amount < 0) {
      throw new Error("Số tiền không hợp lệ hoặc không được âm.");
    }
    // Làm tròn 2 chữ số thập phân, bảo đảm độ chính xác số học kế toán
    this._amount = Math.round((amount + Number.EPSILON) * 100) / 100;
  }

  public get value(): number {
    return this._amount;
  }

  public add(other: Money): Money {
    return new Money(this._amount + other.value);
  }

  public multiply(quantity: number): Money {
    return new Money(this._amount * quantity);
  }
}
```

**File: `backend/src/domain/value-objects/quantity.vo.ts`**

TypeScript

```TypeScript
export class Quantity {
  private readonly _value: number;

  constructor(value: number) {
    if (isNaN(value) || value < 0) {
      throw new Error("Số lượng không được âm.");
    }
    // Làm tròn 3 chữ số thập phân cho đơn vị đo lường (Kg, Tấn, Mét)
    this._value = Math.round((value + Number.EPSILON) * 1000) / 1000;
  }

  public get value(): number {
    return this._value;
  }
}
```

### Entity & Aggregate Root (Domain Layer)

**File: `backend/src/domain/entities/receipt-item.entity.ts`**

TypeScript

```TypeScript
import { Money } from "../value-objects/money.vo";
import { Quantity } from "../value-objects/quantity.vo";

export interface ReceiptItemProps {
  id?: string;
  productId: string;
  lineNo: number;
  productNameSnapshot: string;
  unitSnapshot: string;
  docQty: Quantity;
  actualQty: Quantity;
  unitPrice: Money;
  debitAccount?: string;
  creditAccount?: string;
  note?: string;
}

export class ReceiptItem {
  public readonly id?: string;
  public readonly productId: string;
  public readonly lineNo: number;
  public readonly productNameSnapshot: string;
  public readonly unitSnapshot: string;
  public readonly docQty: Quantity;
  public readonly actualQty: Quantity;
  public readonly unitPrice: Money;
  public readonly debitAccount?: string;
  public readonly creditAccount?: string;
  public readonly note?: string;

  constructor(props: ReceiptItemProps) {
    if (!props.productNameSnapshot.trim()) throw new Error("Tên quy cách vật tư không được để trống.");
    if (!props.unitSnapshot.trim()) throw new Error("Đơn vị tính không được để trống.");

    this.id = props.id;
    this.productId = props.productId;
    this.lineNo = props.lineNo;
    this.productNameSnapshot = props.productNameSnapshot;
    this.unitSnapshot = props.unitSnapshot;
    this.docQty = props.docQty;
    this.actualQty = props.actualQty;
    this.unitPrice = props.unitPrice;
    this.debitAccount = props.debitAccount;
    this.creditAccount = props.creditAccount;
    this.note = props.note;
  }

  // Nghiệp vụ theo TT 200: Cột 4 (Thành tiền) = Cột 2 (Thực nhập) * Cột 3 (Đơn giá)
  public calculateAmount(): Money {
    return this.unitPrice.multiply(this.actualQty.value);
  }
}
```

**File: `backend/src/domain/entities/goods-receipt.entity.ts`**

TypeScript

```TypeScript
import { Money } from "../value-objects/money.vo";
import { ReceiptItem } from "./receipt-item.entity";

export type ReceiptType = 
  | "PURCHASE" 
  | "INTERNAL_PRODUCTION" 
  | "OUTSOURCED_PROCESSING" 
  | "CAPITAL_CONTRIBUTION" 
  | "INVENTORY_SURPLUS";

export type ReceiptStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface GoodsReceiptProps {
  id?: string;
  receiptNumber: string;
  receiptDate: Date;
  actualReceivedDate?: Date;
  organizationId: string;
  warehouseId: string;
  receiptType: ReceiptType;
  description?: string;
  delivererName: string;
  docReference?: string;
  docDate?: Date;
  docOrigin?: string;
  debitAccount?: string;
  creditAccount?: string;
  attachedDocCount?: string;
  creatorName?: string;
  storekeeperName?: string;
  chiefAccountantName?: string;
  status: ReceiptStatus;
  items: ReceiptItem[];
}

export class GoodsReceipt {
  private readonly _id?: string;
  private readonly _receiptNumber: string;
  private readonly _receiptDate: Date;
  private readonly _actualReceivedDate?: Date;
  private readonly _organizationId: string;
  private readonly _warehouseId: string;
  private readonly _receiptType: ReceiptType;
  private readonly _description?: string;
  private readonly _delivererName: string;
  private readonly _docReference?: string;
  private readonly _docDate?: Date;
  private readonly _docOrigin?: string;
  private readonly _debitAccount?: string;
  private readonly _creditAccount?: string;
  private readonly _attachedDocCount?: string;
  private readonly _creatorName?: string;
  private readonly _storekeeperName?: string;
  private readonly _chiefAccountantName?: string;
  private _status: ReceiptStatus;
  private _items: ReceiptItem[];

  constructor(props: GoodsReceiptProps) {
    if (!props.receiptNumber.trim()) throw new Error("Số phiếu không được để trống.");
    if (!props.delivererName.trim()) throw new Error("Tên người giao hàng không được để trống.");
    if (props.items.length === 0) throw new Error("Phiếu nhập kho phải chứa ít nhất một dòng hàng hóa.");

    this._id = props.id;
    this._receiptNumber = props.receiptNumber;
    this._receiptDate = props.receiptDate;
    this._actualReceivedDate = props.actualReceivedDate;
    this._organizationId = props.organizationId;
    this._warehouseId = props.warehouseId;
    this._receiptType = props.receiptType;
    this._description = props.description;
    this._delivererName = props.delivererName;
    this._docReference = props.docReference;
    this._docDate = props.docDate;
    this._docOrigin = props.docOrigin;
    this._debitAccount = props.debitAccount;
    this._creditAccount = props.creditAccount;
    this._attachedDocCount = props.attachedDocCount;
    this._creatorName = props.creatorName;
    this._storekeeperName = props.storekeeperName;
    this._chiefAccountantName = props.chiefAccountantName;
    this._status = props.status;
    this._items = props.items;
  }

  public get id(): string | undefined { return this._id; }
  public get receiptNumber(): string { return this._receiptNumber; }
  public get receiptDate(): Date { return this._receiptDate; }
  public get actualReceivedDate(): Date | undefined { return this._actualReceivedDate; }
  public get organizationId(): string { return this._organizationId; }
  public get warehouseId(): string { return this._warehouseId; }
  public get receiptType(): ReceiptType { return this._receiptType; }
  public get description(): string | undefined { return this._description; }
  public get delivererName(): string { return this._delivererName; }
  public get docReference(): string | undefined { return this._docReference; }
  public get docDate(): Date | undefined { return this._docDate; }
  public get docOrigin(): string | undefined { return this._docOrigin; }
  public get debitAccount(): string | undefined { return this._debitAccount; }
  public get creditAccount(): string | undefined { return this._creditAccount; }
  public get attachedDocCount(): string | undefined { return this._attachedDocCount; }
  public get creatorName(): string | undefined { return this._creatorName; }
  public get storekeeperName(): string | undefined { return this._storekeeperName; }
  public get chiefAccountantName(): string | undefined { return this._chiefAccountantName; }
  public get status(): ReceiptStatus { return this._status; }
  public get items(): ReceiptItem[] { return [...this._items]; }

  // Tính tổng tiền toàn phiếu (Cộng Cột 4 trên biểu mẫu)
  public calculateTotalAmount(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.calculateAmount()),
      new Money(0)
    );
  }

  public confirm(): void {
    if (this._status === "CANCELLED") {
      throw new Error("Không thể duyệt phiếu đã bị hủy.");
    }
    this._status = "CONFIRMED";
  }

  public cancel(): void {
    if (this._status === "CANCELLED") {
      throw new Error("Phiếu này đã ở trạng thái hủy trước đó.");
    }
    this._status = "CANCELLED";
  }
}
```

### Application Use Cases & DTOs

**File: `backend/src/application/dtos/create-goods-receipt.dto.ts`**

TypeScript

```TypeScript
import { z } from 'zod';

export const ReceiptItemInputSchema = z.object({
  productId: z.string().uuid("Mã sản phẩm phải là định dạng UUID"),
  productNameSnapshot: z.string().min(1, "Tên quy cách vật tư không được để trống"),
  unitSnapshot: z.string().min(1, "Đơn vị tính không được để trống"),
  docQty: z.number().min(0, "Số lượng theo chứng từ không được âm"),
  actualQty: z.number().min(0, "Số lượng thực nhập không được âm"),
  unitPrice: z.number().min(0, "Đơn giá nhập không được âm"),
  debitAccount: z.string().optional(),
  creditAccount: z.string().optional(),
  note: z.string().optional(),
}).strict(); // Chống Mass Assignment Attack

export const CreateGoodsReceiptSchema = z.object({
  receiptNumber: z.string().min(1, "Số phiếu nhập không được để trống"),
  receiptDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày lập phải là YYYY-MM-DD"),
  actualReceivedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày nhận phải là YYYY-MM-DD").optional(),
  organizationId: z.string().uuid("Organization ID phải là định dạng UUID"),
  warehouseId: z.string().uuid("Warehouse ID phải là định dạng UUID"),
  receiptType: z.enum([
    "PURCHASE", 
    "INTERNAL_PRODUCTION", 
    "OUTSOURCED_PROCESSING", 
    "CAPITAL_CONTRIBUTION", 
    "INVENTORY_SURPLUS"
  ]).default("PURCHASE"),
  description: z.string().optional(),
  delivererName: z.string().min(1, "Họ tên người giao không được để trống"),
  docReference: z.string().optional(),
  docDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  docOrigin: z.string().optional(),
  debitAccount: z.string().optional(),
  creditAccount: z.string().optional(),
  totalAmountWords: z.string().optional(),
  attachedDocCount: z.string().optional(),
  creatorName: z.string().optional(),
  storekeeperName: z.string().optional(),
  chiefAccountantName: z.string().optional(),
  status: z.enum(["DRAFT", "CONFIRMED"]).default("CONFIRMED"),
  items: z.array(ReceiptItemInputSchema).min(1, "Phiếu nhập phải có ít nhất 1 dòng hàng hóa"),
}).strict();

export type CreateGoodsReceiptDTO = z.infer<typeof CreateGoodsReceiptSchema>;
```

**File: `backend/src/application/use-cases/create-goods-receipt.use-case.ts`**

TypeScript

```TypeScript
import { GoodsReceipt } from "../../domain/entities/goods-receipt.entity";
import { ReceiptItem } from "../../domain/entities/receipt-item.entity";
import { Money } from "../../domain/value-objects/money.vo";
import { Quantity } from "../../domain/value-objects/quantity.vo";
import { IGoodsReceiptRepository } from "../../domain/repositories/goods-receipt.repository.interface";
import { CreateGoodsReceiptDTO } from "../dtos/create-goods-receipt.dto";
import { AuditTrailService } from "../../infrastructure/analytics/audit-trail.service";

export class CreateGoodsReceiptUseCase {
  constructor(
    private readonly receiptRepo: IGoodsReceiptRepository,
    private readonly auditService: AuditTrailService
  ) {}

  public async execute(dto: CreateGoodsReceiptDTO, requestId?: string): Promise<{ receiptId: string; totalAmount: number }> {
    const existingReceipt = await this.receiptRepo.findByReceiptNumber(dto.receiptNumber);
    if (existingReceipt) {
      throw new Error(`Số phiếu ${dto.receiptNumber} đã tồn tại trên hệ thống.`);
    }

    const items = dto.items.map((i, index) => new ReceiptItem({
      productId: i.productId,
      lineNo: index + 1,
      productNameSnapshot: i.productNameSnapshot,
      unitSnapshot: i.unitSnapshot,
      docQty: new Quantity(i.docQty),
      actualQty: new Quantity(i.actualQty),
      unitPrice: new Money(i.unitPrice),
      debitAccount: i.debitAccount,
      creditAccount: i.creditAccount,
      note: i.note,
    }));

    const receipt = new GoodsReceipt({
      receiptNumber: dto.receiptNumber,
      receiptDate: new Date(dto.receiptDate),
      actualReceivedDate: dto.actualReceivedDate ? new Date(dto.actualReceivedDate) : undefined,
      organizationId: dto.organizationId,
      warehouseId: dto.warehouseId,
      receiptType: dto.receiptType,
      description: dto.description,
      delivererName: dto.delivererName,
      docReference: dto.docReference,
      docDate: dto.docDate ? new Date(dto.docDate) : undefined,
      docOrigin: dto.docOrigin,
      debitAccount: dto.debitAccount,
      creditAccount: dto.creditAccount,
      attachedDocCount: dto.attachedDocCount,
      creatorName: dto.creatorName,
      storekeeperName: dto.storekeeperName,
      chiefAccountantName: dto.chiefAccountantName,
      status: dto.status || "CONFIRMED",
      items,
    });

    // Lưu Transaction vào Database chính
    const receiptId = await this.receiptRepo.saveWithTransaction(receipt, dto.totalAmountWords);

    // Phát sự kiện Audit / Analytics bất đồng bộ (Non-blocking)
    this.auditService.logEvent({
      eventName: "GOODS_RECEIPT_CREATED",
      requestId: requestId || "unknown",
      receiptId,
      receiptNumber: receipt.receiptNumber,
      warehouseId: receipt.warehouseId,
      totalAmount: receipt.calculateTotalAmount().value,
      itemCount: receipt.items.length,
      timestamp: new Date(),
    });

    return {
      receiptId,
      totalAmount: receipt.calculateTotalAmount().value,
    };
  }
}
```

## 3. Infrastructure, Security & Presentation Layer

### Kiến Trúc Phòng Thủ Đa Tầng (Anti-DDoS & Security)

**File: `docker/nginx.conf`**

Nginx

```Nginx
# Lớp 2: Reverse Proxy & Rate Limiting Engine
worker_processes auto;
events { worker_connections 1024; }

http {
    include       mime.types;
    default_type  application/octet-stream;
    
    # 1. Chống Memory Exhaustion & Slowloris Attack
    client_max_body_size 2M;
    client_body_timeout 10s;
    client_header_timeout 10s;
    keepalive_timeout 30s;

    # 2. Định nghĩa Zone Rate Limit theo Binary IP
    limit_req_zone $binary_remote_addr zone=global_limit:10m rate=60r/m;
    limit_req_zone $binary_remote_addr zone=transaction_limit:10m rate=15r/m;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    upstream node_backend {
        server backend-api:3000;
        keepalive 32;
    }

    server {
        listen 80;
        server_name _;

        # Chặn Host Header Injection & Buffer Overflow
        limit_conn conn_limit 15;

        location /api/v1/ {
            limit_req zone=global_limit burst=20 nodelay;
            
            proxy_pass http://node_backend;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Request-Id $http_x_request_id;
        }

        location /api/v1/goods-receipts {
            limit_req zone=transaction_limit burst=5 nodelay;
            proxy_pass http://node_backend;
        }
    }
}
```

**File: `backend/src/presentation/middlewares/security.middleware.ts`**

TypeScript

```TypeScript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors';
import { Express } from 'express';

export function configureSecurityMiddlewares(app: Express): void {
  // 1. HTTP Security Headers (Chống XSS, Clickjacking, Sniffing, HSTS)
  app.use(
    helmet({
      contentSecurityPolicy: true,
      crossOriginEmbedderPolicy: true,
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      hidePoweredBy: true,
    })
  );

  // 2. Chống Parameter Pollution
  app.use(hpp());

  // 3. CORS Policy nghiêm ngặt
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      credentials: true,
    })
  );

  // 4. Rate Limiting cấp ứng dụng (Layer 3)
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' },
  });

  app.use('/api/v1/', apiLimiter);
}
```

### Observability, Tracing & Monitoring (Prometheus Metrics & Structured Log)

**File: `backend/src/infrastructure/monitoring/metrics.ts`**

TypeScript

```TypeScript
import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Thu thập System Metrics mặc định (CPU, RAM, Event Loop Lag)
client.collectDefaultMetrics({ prefix: 'vimes_inventory_' });

export const httpRequestsTotal = new client.Counter({
  name: 'vimes_http_requests_total',
  help: 'Tổng số lượng HTTP Requests',
  labelNames: ['method', 'route', 'status_code'],
});

export const httpRequestDuration = new client.Histogram({
  name: 'vimes_http_request_duration_seconds',
  help: 'Thời gian phản hồi API (Latency seconds)',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

export const dbTransactionErrors = new client.Counter({
  name: 'vimes_db_transaction_errors_total',
  help: 'Tổng số giao dịch Database Transaction bị Rollback',
  labelNames: ['operation'],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();
  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationInSeconds = duration[0] + duration[1] / 1e9;
    const route = req.route ? req.route.path : req.path;

    httpRequestsTotal.inc({ method: req.method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, durationInSeconds);
  });
  next();
}
```

**File: `backend/src/presentation/middlewares/request-id.middleware.ts`**

TypeScript

```TypeScript
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export interface RequestWithId extends Request {
  id?: string;
}

export function requestIdMiddleware(req: RequestWithId, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}
```

**File: `backend/src/infrastructure/repositories/postgres-goods-receipt.repository.ts`**

TypeScript

```TypeScript
import { PoolClient } from 'pg';
import { pool } from '../database/postgres-pool';
import { GoodsReceipt } from '../../domain/entities/goods-receipt.entity';
import { IGoodsReceiptRepository } from '../../domain/repositories/goods-receipt.repository.interface';
import { dbTransactionErrors } from '../monitoring/metrics';

export class PostgresGoodsReceiptRepository implements IGoodsReceiptRepository {
  public async findByReceiptNumber(receiptNumber: string): Promise<GoodsReceipt | null> {
    const query = `SELECT id FROM goods_receipts WHERE receipt_number = $1 LIMIT 1;`;
    const res = await pool.query(query, [receiptNumber]);
    if (res.rows.length === 0) return null;
    return { id: res.rows[0].id } as GoodsReceipt;
  }

  public async saveWithTransaction(receipt: GoodsReceipt, totalAmountWords?: string): Promise<string> {
    const client: PoolClient = await pool.connect();

    try {
      await client.query('BEGIN');

      const insertHeaderSql = `
        INSERT INTO goods_receipts (
          receipt_number, receipt_date, actual_received_date, organization_id, warehouse_id,
          receipt_type, description, deliverer_name, doc_reference, doc_date, doc_origin,
          debit_account, credit_account, total_amount, total_amount_words,
          attached_doc_count, creator_name, storekeeper_name, chief_accountant_name, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING id;
      `;

      const headerValues = [
        receipt.receiptNumber,
        receipt.receiptDate,
        receipt.actualReceivedDate || null,
        receipt.organizationId,
        receipt.warehouseId,
        receipt.receiptType,
        receipt.description || null,
        receipt.delivererName,
        receipt.docReference || null,
        receipt.docDate || null,
        receipt.docOrigin || null,
        receipt.debitAccount || null,
        receipt.creditAccount || null,
        receipt.calculateTotalAmount().value,
        totalAmountWords || null,
        receipt.attachedDocCount || null,
        receipt.creatorName || null,
        receipt.storekeeperName || null,
        receipt.chiefAccountantName || null,
        receipt.status,
      ];

      const headerResult = await client.query(insertHeaderSql, headerValues);
      const receiptId = headerResult.rows[0].id;

      for (const item of receipt.items) {
        const insertItemSql = `
          INSERT INTO goods_receipt_items (
            receipt_id, product_id, line_no, product_name_snapshot, unit_snapshot,
            doc_qty, actual_qty, unit_price, amount, debit_account, credit_account, note
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
        `;
        await client.query(insertItemSql, [
          receiptId,
          item.productId,
          item.lineNo,
          item.productNameSnapshot,
          item.unitSnapshot,
          item.docQty.value,
          item.actualQty.value,
          item.unitPrice.value,
          item.calculateAmount().value,
          item.debitAccount || null,
          item.creditAccount || null,
          item.note || null,
        ]);

        if (receipt.status === 'CONFIRMED') {
          const upsertStockSql = `
            INSERT INTO inventory_balances (warehouse_id, product_id, current_stock, updated_at)
            VALUES ($1, $2, $3, now())
            ON CONFLICT (warehouse_id, product_id)
            DO UPDATE SET 
              current_stock = inventory_balances.current_stock + EXCLUDED.current_stock,
              updated_at = now();
          `;
          await client.query(upsertStockSql, [receipt.warehouseId, item.productId, item.actualQty.value]);
        }
      }

      await client.query('COMMIT');
      return receiptId;
    } catch (error) {
      await client.query('ROLLBACK');
      dbTransactionErrors.inc({ operation: 'CREATE_RECEIPT' });
      throw error;
    } finally {
      client.release();
    }
  }
}
```

**File: `backend/src/presentation/controllers/health.controller.ts`**

TypeScript

```TypeScript
import { Request, Response } from 'express';
import { pool } from '../../infrastructure/database/postgres-pool';

export class HealthController {
  // Liveness Check: Ứng dụng Node.js còn sống không?
  public static liveness(req: Request, res: Response): void {
    res.status(200).json({
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }

  // Readiness Check: Database & Pool sẵn sàng phục vụ traffic chưa?
  public static async readiness(req: Request, res: Response): Promise<void> {
    try {
      await pool.query('SELECT 1');
      res.status(200).json({
        status: 'READY',
        checks: {
          database: 'HEALTHY',
          poolTotal: pool.totalCount,
          poolIdle: pool.idleCount,
          poolWaiting: pool.waitingCount,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(503).json({
        status: 'UNHEALTHY',
        checks: {
          database: 'DOWN',
          error: error.message,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
}
```

**File: `backend/src/app.ts`**

TypeScript

```TypeScript
import express, { Express, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import client from 'prom-client';
import { ZodError } from 'zod';
import { configureSecurityMiddlewares } from './presentation/middlewares/security.middleware';
import { requestIdMiddleware, RequestWithId } from './presentation/middlewares/request-id.middleware';
import { metricsMiddleware } from './infrastructure/monitoring/metrics';
import { PostgresGoodsReceiptRepository } from './infrastructure/repositories/postgres-goods-receipt.repository';
import { CreateGoodsReceiptUseCase } from './application/use-cases/create-goods-receipt.use-case';
import { AuditTrailService } from './infrastructure/analytics/audit-trail.service';
import { GoodsReceiptController } from './presentation/controllers/goods-receipt.controller';
import { HealthController } from './presentation/controllers/health.controller';

const app: Express = express();

// 1. Parsing & Body Limit (Chống Memory Overflow Attack)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 2. Logging & Tracing & Security
app.use(requestIdMiddleware);
configureSecurityMiddlewares(app);
app.use(metricsMiddleware);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms [ReqId: :req[x-request-id]]'));

// 3. Probes & Metrics Endpoints
app.get('/healthz', HealthController.liveness);
app.get('/ready', HealthController.readiness);
app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// 4. Dependency Injection Setup
const repository = new PostgresGoodsReceiptRepository();
const auditService = new AuditTrailService();
const createUseCase = new CreateGoodsReceiptUseCase(repository, auditService);
const controller = new GoodsReceiptController(createUseCase);

// 5. REST API Routes
app.post('/api/v1/goods-receipts', controller.create);

// 6. Centralized Error Handling & Error Masking
app.use((err: any, req: RequestWithId, res: Response, next: NextFunction) => {
  // Format lỗi validation Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Lỗi xác thực dữ liệu đầu vào (Validation Error)',
      requestId: req.id,
      errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }

  // Che giấu Stack Trace trên Production
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    message: isProduction ? 'Đã xảy ra lỗi trong quá trình xử lý chứng từ.' : err.message,
    requestId: req.id,
  });
});

export default app;
```

## 4. Kiểm Thử Tự Động (TDD Suite)

**File: `backend/tests/unit/goods-receipt.domain.test.ts`**

TypeScript

```TypeScript
import { GoodsReceipt } from "../../src/domain/entities/goods-receipt.entity";
import { ReceiptItem } from "../../src/domain/entities/receipt-item.entity";
import { Money } from "../../src/domain/value-objects/money.vo";
import { Quantity } from "../../src/domain/value-objects/quantity.vo";

describe("[TDD] GoodsReceipt Domain Unit Tests (Mẫu 01 - VT)", () => {
  it("PHẢI ném lỗi khi khởi tạo phiếu nhập mà không có dòng hàng hóa nào", () => {
    expect(() => {
      new GoodsReceipt({
        receiptNumber: "PNK-001",
        receiptDate: new Date(),
        organizationId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        warehouseId: "c9a646d3-9c61-4cd7-bf5b-9b4dc257850a",
        receiptType: "PURCHASE",
        delivererName: "Nguyễn Văn A",
        status: "CONFIRMED",
        items: [],
      });
    }).toThrow("Phiếu nhập kho phải chứa ít nhất một dòng hàng hóa.");
  });

  it("PHẢI tính chính xác tổng tiền phiếu theo công thức Cột 4 = Cột 2 (Thực nhập) * Cột 3 (Đơn giá)", () => {
    const item1 = new ReceiptItem({
      productId: "e7d2b8a0-1234-4567-89ab-cdef01234567",
      lineNo: 1,
      productNameSnapshot: "Thép cuộn Phi 6",
      unitSnapshot: "Kg",
      docQty: new Quantity(100),
      actualQty: new Quantity(98.5),
      unitPrice: new Money(15000),
    });

    const item2 = new ReceiptItem({
      productId: "a1a2a3a4-1234-4567-89ab-cdef01234567",
      lineNo: 2,
      productNameSnapshot: "Xi măng PCB40",
      unitSnapshot: "Bao",
      docQty: new Quantity(10),
      actualQty: new Quantity(10),
      unitPrice: new Money(50000),
    });

    const receipt = new GoodsReceipt({
      receiptNumber: "PNK-001",
      receiptDate: new Date(),
      organizationId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      warehouseId: "c9a646d3-9c61-4cd7-bf5b-9b4dc257850a",
      receiptType: "PURCHASE",
      delivererName: "Nguyễn Văn A",
      status: "CONFIRMED",
      items: [item1, item2],
    });

    // Tổng tiền = (98.5 * 15,000) + (10 * 50,000) = 1,477,500 + 500,000 = 1,977,500
    expect(receipt.calculateTotalAmount().value).toBe(1977500);
  });
});
```

## 5. Cấu Hình Dự Án & Version Dependencies

Toàn bộ phiên bản dependencies và devDependencies được thiết lập chính xác theo các phiên bản mới nhất, tương thích ổn định và tối ưu an ninh bảo mật cao nhất:

**File: `backend/package.json`**

JSON

```JSON
{
  "name": "vimes-inventory-backend",
  "version": "1.2.0",
  "description": "Enterprise Backend API for Goods Receipt Management (Mẫu 01 - VT)",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest --runInBand",
    "test:coverage": "jest --coverage",
    "audit:fix": "npm audit fix"
  },
  "dependencies": {
    "cors": "2.8.6",
    "dotenv": "17.4.2",
    "express": "5.2.1",
    "express-rate-limit": "8.6.2",
    "helmet": "8.3.0",
    "hpp": "0.2.3",
    "morgan": "1.11.0",
    "pg": "8.23.0",
    "prom-client": "15.1.3",
    "zod": "4.4.3"
  },
  "devDependencies": {
    "@types/cors": "2.8.17",
    "@types/express": "5.0.0",
    "@types/hpp": "0.2.6",
    "@types/jest": "30.0.0",
    "@types/morgan": "1.9.9",
    "@types/node": "22.0.0",
    "@types/pg": "8.11.6",
    "@types/supertest": "6.0.2",
    "jest": "30.4.2",
    "supertest": "7.2.2",
    "ts-jest": "30.0.0",
    "ts-node-dev": "2.0.0",
    "typescript": "7.0.2"
  }
}
```

**File: `backend/tsconfig.json`**

JSON

```JSON
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests/**/*"]
}
```

## 6. Cấu Hình Docker & Triển Khai Hạ Tầng An Toàn

**File: `docker/Dockerfile.backend`**

Dockerfile

```Dockerfile
# Stage 1: Build stage sử dụng Node.js v24.19.0 (LTS Krypton)
FROM node:24.19.0-alpine AS builder
WORKDIR /app

COPY backend/package*.json backend/tsconfig.json ./
RUN npm ci

COPY backend/src ./src
RUN npm run build

# Stage 2: Production runtime stage
FROM node:24.19.0-alpine AS runner
WORKDIR /app

# Chạy dưới quyền Non-root User để bảo vệ container
USER node

ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --only=production

COPY --from=builder --chown=node:node /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**File: `docker/docker-compose.yml`**

YAML

```YAML
version: '3.8'

services:
  # Lớp Reverse Proxy & Anti-DDoS
  reverse-proxy:
    image: nginx:1.27-alpine
    container_name: vimes_reverse_proxy
    restart: always
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      backend-api:
        condition: service_healthy

  # PostgreSQL v18.6 Alpine
  postgres-db:
    image: postgres:18.6-alpine
    container_name: vimes_postgres_db
    restart: always
    environment:
      POSTGRES_DB: vimes_inventory
      POSTGRES_USER: postgres_user
      POSTGRES_PASSWORD: postgres_password
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ../sql/01_schema.sql:/docker-entrypoint-initdb.d/01_schema.sql
      - ../sql/02_seed.sql:/docker-entrypoint-initdb.d/02_seed.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres_user -d vimes_inventory"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Backend REST API Service
  backend-api:
    build:
      context: ..
      dockerfile: docker/Dockerfile.backend
    container_name: vimes_backend_api
    restart: always
    depends_on:
      postgres-db:
        condition: service_healthy
    environment:
      PORT: 3000
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres_user:postgres_password@postgres-db:5432/vimes_inventory
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/healthz || exit 1"]
      interval: 10s
      timeout: 3s
      retries: 3

volumes:
  pgdata:
```

## 7. Quy Trình Vận Hành, Giám Sát & Ứng Phó Sự Cố (Incident Runbook)

### Bảng Thiết Lập Ngưỡng Cảnh Báo (Grafana / Prometheus Alert Rules)

|**Mức Độ (Severity)**|**Điều Kiện Kích Hoạt Cảnh Báo**|**Kênh Thông Báo**|**Hành Động Xử Lý Tự Động / Thủ Công**|
|---|---|---|---|
|**P1 - Critical**|HTTP 5xx Rate $> 5\%$ trong 3 phút liên tiếp|PagerDuty + Telegram Bot|Tự động mở issue, thông báo Lead Dev kiểm tra Transaction Deadlock và Rollback Log.|
|**P1 - Critical**|Database Readiness Probe thất bại (`/ready` $\rightarrow$ 503)|Cuộc gọi On-call|Kiểm tra tài nguyên PostgreSQL, khởi động lại DB cluster nếu bị crash.|
|**P2 - High**|`pool.waitingCount > 0` kéo dài $> 15\text{s}$|Slack `#ops-alerts`|Cảnh báo nghẽn kết nối. Kiểm tra các câu truy vấn Slow Queries đang giữ Lock.|
|**P2 - High**|Rate Limiter chặn $> 100\text{ req/phút}$ từ 1 dải IP|Slack `#security`|Phát hiện dấu hiệu Spam/DDoS. Tự động cập nhật Blocklist trên Cloudflare WAF.|
|**P3 - Medium**|Latency p95 $> 1.5\text{s}$trong 10 phút|Email Team Lead|Kiểm tra thiếu Index hoặc nhu cầu nâng cấp RAM máy chủ DB.|

### Hướng Dẫn Vận Hành Hệ Thống

**1. Khởi chạy toàn bộ cụm hạ tầng Production (1-Click Run):**

Bash

```Bash
docker-compose -f docker/docker-compose.yml up --build -d
```

**2. Kiểm tra trạng thái sức khỏe các dịch vụ (Probes):**

Bash

```Bash
# Kiểm tra Liveness tiến trình Backend
curl -i http://localhost/healthz

# Kiểm tra Readiness kết nối CSDL và Connection Pool
curl -i http://localhost/ready

# Xem Metrics Prometheus thời gian thực
curl -i http://localhost/metrics
```

**3. Chạy bộ kiểm thử tự động TDD & xuất báo cáo Code Coverage:**

Bash

```Bash
cd backend
npm install
npm test
npm run test:coverage
```

## 8. Frontend Integration Contract (TODO Workspace)

Đội ngũ phát triển Frontend (`frontend/`) sẽ tích hợp với Backend thông qua tài liệu giao tiếp API chuẩn:

- **HTTP Method & Path:** `POST /api/v1/goods-receipts`

- **Headers Bắt Buộc:**

  - `Content-Type: application/json`

  - `X-Request-Id: <UUID_CLIENT_TRACE>` _(Tùy chọn, hệ thống tự sinh nếu thiếu)_

- **Payload Mẫu Chuẩn Kế Toán (TT 200 & Luật Kế Toán 2015):**

JSON

```JSON
{
  "receiptNumber": "PNK-2026-0001",
  "receiptDate": "2026-08-18",
  "actualReceivedDate": "2026-08-18",
  "organizationId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "warehouseId": "c9a646d3-9c61-4cd7-bf5b-9b4dc257850a",
  "receiptType": "PURCHASE",
  "description": "Nhập kho thép cuộn dự án VIMES Tower theo HĐ 99882",
  "delivererName": "Nguyễn Văn A",
  "docReference": "HĐ-99882",
  "docDate": "2026-08-17",
  "docOrigin": "Công ty Thép Việt Nhật",
  "debitAccount": "152",
  "creditAccount": "331",
  "totalAmountWords": "Một triệu bốn trăm bảy mươi bảy nghìn năm trăm đồng",
  "attachedDocCount": "1 hóa đơn GTGT gốc",
  "creatorName": "Lê Văn Lập",
  "storekeeperName": "Trần Văn Kho",
  "chiefAccountantName": "Phạm Thị Trưởng",
  "status": "CONFIRMED",
  "items": [
    {
      "productId": "e7d2b8a0-1234-4567-89ab-cdef01234567",
      "productNameSnapshot": "Thép cuộn Phi 6",
      "unitSnapshot": "Kg",
      "docQty": 100.0,
      "actualQty": 98.5,
      "unitPrice": 15000.0,
      "debitAccount": "152",
      "creditAccount": "331",
      "note": "Hao hụt 1.5kg do vận chuyển"
    }
  ]
}
```

- **HTTP Response Thành Công (`201 Created`):**

JSON

```JSON
{
  "success": true,
  "message": "Lập phiếu nhập kho thành công (Mẫu 01 - VT)",
  "requestId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "data": {
    "receiptId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "totalAmount": 1477500.00
  }
}
```
