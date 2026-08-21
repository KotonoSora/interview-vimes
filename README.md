
# Vimes Technical Assignment

Project submission for the Vimes engineering assessment, covering database architecture, full-stack implementation, automated testing, and containerized deployment.

---

## Project Timeline

- [x] **2026-08-17**: Received the take-home technical assessment via email.
- [x] **2026-08-18**: Analyzed domain rules, technical requirements, and architectural planning with Gemini AI.
- [x] **2026-08-19**: Reviewed Express.js modern patterns and project structure best practices.
- [x] **2026-08-20**: Implemented database schemas, backend APIs, and frontend user interfaces.
- [x] **2026-08-21**: Conducted QA checks, finalized test coverage, and submitted the project to <huyen.vimes@gmail.com>.

---

## Assignment Requirements

Reference materials provided for the assessment:

- [Project Specification (README.md)](./assignment-requirement/README.md)
  1. Design normalized relational database schemas for data persistence.
  2. Implement a responsive user interface for data entry.
  3. Build full-stack workflows to process, validate, and persist submitted records.
  4. Write comprehensive automated test suites.
- [Specification PDF](./assignment-requirement/README.pdf)
- [Domain Rules & Compliance Constraints](./assignment-requirement/laws-and-rules.md)

---

## Solution Deliverables

### 1. Database Architecture & Schema Design

- [Entity-Relationship Diagram (ERD)](./docs/database-entity-relation-diagram.md)
- [Database Technical Specification](./docs/database-design.md)
- [DDL Schema Script (`01_schema.sql`)](./sql/01_schema.sql)
- [Seed Data Script (`02_seed.sql`)](./sql/02_seed.sql)
- [Database Security & RBAC Configuration (`03_security_roles.sql`)](./sql/03_security_roles.sql)

### 2. User Interface

- [Frontend Service Documentation](./frontend/README.md)

### 3. Application Services & Orchestration

- [Docker Infrastructure & Reverse Proxy](./docker/README.md)
- [Backend REST API Service](./backend/README.md)
- [Frontend Web Application](./frontend/README.md)

### 4. Quality Assurance & Automated Testing

- [TDD Methodology & Unit Testing Documentation](./docs/tdd-and-unit-test.md)
