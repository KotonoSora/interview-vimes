// src/infrastructure/repositories/postgres-master-data.repository.ts
import { pool } from "#/infrastructure/database/postgres-pool";
import { IMasterDataRepository } from "#/domain/repositories/master-data.repository.interface";
import { Organization } from "#/domain/entities/organization.entity";

export class PostgresMasterDataRepository implements IMasterDataRepository {
  async getActiveOrganizations(): Promise<Organization[]> {
    const sql = `
      SELECT 
        id, 
        code, 
        name, 
        department, 
        created_at, 
        updated_at
      FROM organizations
      ORDER BY name ASC;
    `;
    const result = await pool.query(sql);

    return result.rows.map(
      (row) =>
        new Organization({
          id: row.id,
          code: row.code,
          name: row.name,
          department: row.department,
        }),
    );
  }

  // Tương thích ngược nếu có use case cũ gọi getOrganizations
  async getOrganizations(): Promise<Organization[]> {
    return this.getActiveOrganizations();
  }
}
