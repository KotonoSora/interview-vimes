// tests/unit/domain/master-data-entities.test.ts
import { describe, it, expect } from "vitest";
import { Organization } from "#/domain/entities/organization.entity";
import { Product } from "#/domain/entities/product.entity";
import { Warehouse } from "#/domain/entities/warehouse.entity";

describe("[Domain] Master Data Entities Coverage", () => {
  it("TC-ENT-ORG: Phải khởi tạo và truy xuất đầy đủ getters/toJSON của Organization", () => {
    const org = Organization.create({
      id: "org-1",
      code: "VIMES",
      name: "Tập đoàn VIMES",
      department: "Kho Vận",
    });

    expect(org.id).toBe("org-1");
    expect(org.code).toBe("VIMES");
    expect(org.name).toBe("Tập đoàn VIMES");
    expect(org.department).toBe("Kho Vận");
    expect(org.toJSON()).toEqual({
      id: "org-1",
      code: "VIMES",
      name: "Tập đoàn VIMES",
      department: "Kho Vận",
    });
  });

  it("TC-ENT-PROD: Phải khởi tạo và truy xuất đầy đủ getters/toJSON của Product", () => {
    const prod = Product.create({
      id: "prod-1",
      code: "VT01",
      name: "Cồn Y Tế",
      unit: "Chai",
      defaultPrice: 15000,
      isActive: true,
    });

    expect(prod.id).toBe("prod-1");
    expect(prod.code).toBe("VT01");
    expect(prod.name).toBe("Cồn Y Tế");
    expect(prod.unit).toBe("Chai");
    expect(prod.defaultPrice).toBe(15000);
    expect(prod.isActive).toBe(true);
    expect(prod.toJSON()).toEqual({
      id: "prod-1",
      code: "VT01",
      name: "Cồn Y Tế",
      unit: "Chai",
      defaultPrice: 15000,
      isActive: true,
    });

    // Test default fallback isActive
    const prodDefault = new Product({
      code: "VT02",
      name: "Gạc",
      unit: "Gói",
      defaultPrice: 5000,
    });
    expect(prodDefault.isActive).toBe(true);
  });

  it("TC-ENT-WH: Phải khởi tạo và truy xuất đầy đủ getters/toJSON của Warehouse", () => {
    const wh = Warehouse.create({
      id: "wh-1",
      organizationId: "org-1",
      code: "KHO-HN",
      name: "Kho Tổng",
      location: "Hà Nội",
      isActive: true,
    });

    expect(wh.id).toBe("wh-1");
    expect(wh.organizationId).toBe("org-1");
    expect(wh.code).toBe("KHO-HN");
    expect(wh.name).toBe("Kho Tổng");
    expect(wh.location).toBe("Hà Nội");
    expect(wh.isActive).toBe(true);
    expect(wh.toJSON()).toEqual({
      id: "wh-1",
      organizationId: "org-1",
      code: "KHO-HN",
      name: "Kho Tổng",
      location: "Hà Nội",
      isActive: true,
    });

    // Test default fallback isActive
    const whDefault = new Warehouse({
      organizationId: "org-1",
      code: "KHO-DN",
      name: "Kho Đà Nẵng",
    });
    expect(whDefault.isActive).toBe(true);
  });
});
