// src/infrastructure/repositories/postgres-master-data.repository.ts
import {
  IMasterDataRepository,
  OrganizationSummary,
  ProductSummary,
  WarehouseSummary,
} from "#/domain/repositories/master-data.repository.interface";
import { pool } from "#/infrastructure/database/postgres-pool";

export class PostgresMasterDataRepository implements IMasterDataRepository {
  async getActiveOrganizations(): Promise<OrganizationSummary[]> {
    const sql = `
      SELECT id, code, name, department
      FROM organizations
      ORDER BY name ASC;
    `;
    const result = await pool.query(sql);
    return result.rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      department: row.department ?? null,
    }));
  }

  async getActiveWarehouses(): Promise<WarehouseSummary[]> {
    const sql = `
      SELECT id, code, name, location
      FROM warehouses
      WHERE is_active = true
      ORDER BY name ASC;
    `;
    const result = await pool.query(sql);
    return result.rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      location: row.location ?? null,
    }));
  }

  async searchProducts(searchQuery?: string): Promise<ProductSummary[]> {
    let sql = `
      SELECT id, code, name, unit, default_price::float AS "defaultPrice", default_price
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
    return result.rows.map((row) => {
      const rawPrice =
        row.defaultPrice !== undefined ? row.defaultPrice : row.default_price;
      return {
        id: row.id,
        code: row.code,
        name: row.name,
        unit: row.unit,
        defaultPrice: Number(rawPrice) || 0,
      };
    });
  }
}
