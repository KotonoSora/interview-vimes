// src/infrastructure/repositories/postgres-master-data.repository.ts
import { Organization } from "#/domain/entities/organization.entity";
import { Product } from "#/domain/entities/product.entity";
import { Warehouse } from "#/domain/entities/warehouse.entity";
import { IMasterDataRepository } from "#/domain/repositories/master-data.repository.interface";
import { pool } from "#/infrastructure/database/postgres-pool";

export class PostgresMasterDataRepository implements IMasterDataRepository {
  async getActiveOrganizations(): Promise<Organization[]> {
    const sql = `
      SELECT id, code, name, department, created_at
      FROM organizations
      ORDER BY name ASC;
    `;
    const result = await pool.query(sql);
    return result.rows.map((row) =>
      Organization.create({
        id: row.id,
        code: row.code,
        name: row.name,
        department: row.department,
      }),
    );
  }

  async getActiveWarehouses(): Promise<Warehouse[]> {
    const sql = `
      SELECT id, organization_id, code, name, location, is_active
      FROM warehouses
      WHERE is_active = true
      ORDER BY name ASC;
    `;
    const result = await pool.query(sql);
    return result.rows.map((row) =>
      Warehouse.create({
        id: row.id,
        organizationId: row.organization_id,
        code: row.code,
        name: row.name,
        location: row.location,
        isActive: row.is_active,
      }),
    );
  }

  async searchProducts(searchQuery?: string): Promise<Product[]> {
    let sql = `
      SELECT id, code, name, unit, default_price, is_active, created_at
      FROM products
      WHERE is_active = true
    `;
    const params: any[] = [];

    if (searchQuery && searchQuery.trim()) {
      params.push(`%${searchQuery.trim()}%`);
      sql += ` AND (code ILIKE $1 OR name ILIKE $1)`;
    }

    sql += ` ORDER BY name ASC LIMIT 50;`;

    const result = await pool.query(sql, params);
    return result.rows.map((row) =>
      Product.create({
        id: row.id,
        code: row.code,
        name: row.name,
        unit: row.unit,
        defaultPrice: Number(row.default_price),
        isActive: row.is_active,
      }),
    );
  }
}
