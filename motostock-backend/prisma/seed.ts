import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do MotoStock...");

  // Limpa dados existentes (ordem respeita as chaves estrangeiras)
  await prisma.stockMovement.deleteMany();
  await prisma.stockOperationItem.deleteMany();
  await prisma.stockOperation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // ---------- USUÁRIOS ----------
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const funcPasswordHash = await bcrypt.hash("funcionario123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Carlos Andrade",
      email: "admin@motostock.com",
      passwordHash: adminPasswordHash,
      role: "ADMINISTRADOR",
      status: "ATIVO",
      lastAccessAt: new Date(),
    },
  });

  const funcionario = await prisma.user.create({
    data: {
      name: "Juliana Souza",
      email: "juliana@motostock.com",
      passwordHash: funcPasswordHash,
      role: "FUNCIONARIO",
      status: "ATIVO",
      lastAccessAt: new Date(),
    },
  });

  // ---------- CATEGORIAS ----------
  const categoryNames = [
    "Capacetes",
    "Pneus",
    "Relação",
    "Freios",
    "Motor",
    "Elétrica",
    "Lubrificantes",
    "Acessórios",
    "Vestuário",
    "Outros",
  ];

  const categories = await Promise.all(
    categoryNames.map((name) => prisma.category.create({ data: { name } }))
  );
  const categoryByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  // ---------- FORNECEDORES ----------
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        legalName: "Distribuidora Nacional de Peças Ltda",
        tradeName: "DNP Peças",
        document: "12.345.678/0001-90",
        phone: "(11) 3333-4444",
        whatsapp: "(11) 99999-1111",
        email: "vendas@dnppecas.com.br",
        city: "São Paulo",
        state: "SP",
      },
    }),
    prisma.supplier.create({
      data: {
        legalName: "Moto Peças Brasil S.A.",
        tradeName: "MPB",
        document: "23.456.789/0001-11",
        phone: "(19) 3222-1010",
        whatsapp: "(19) 98888-2222",
        email: "contato@motopecasbrasil.com.br",
        city: "Campinas",
        state: "SP",
      },
    }),
    prisma.supplier.create({
      data: {
        legalName: "NGK do Brasil Componentes Ltda",
        tradeName: "NGK Brasil",
        document: "34.567.890/0001-22",
        phone: "(11) 4004-5000",
        email: "comercial@ngk.com.br",
        city: "Mogi das Cruzes",
        state: "SP",
      },
    }),
    prisma.supplier.create({
      data: {
        legalName: "Pro Tork Equipamentos e Acessórios Ltda",
        tradeName: "Pro Tork",
        document: "45.678.901/0001-33",
        phone: "(51) 3030-4040",
        whatsapp: "(51) 97777-3333",
        email: "vendas@protork.com.br",
        city: "Caxias do Sul",
        state: "RS",
      },
    }),
  ]);

  // ---------- PRODUTOS ----------
  const productsData = [
    {
      name: "Kit Relação Honda CG 160",
      sku: "KR-CG160-001",
      barcode: "7891234560011",
      category: "Relação",
      brand: "Rider",
      application: "Honda CG 160 (2016-2023)",
      costPrice: 89.9,
      salePrice: 159.9,
      currentStock: 42,
      minStock: 10,
      location: "Corredor A - Prateleira 3",
      supplierIndex: 0,
      supplierProductCode: "VAZ-CP-160-PRO",
    },
    {
      name: "Pastilha de Freio Yamaha Fazer 250",
      sku: "PF-FAZER250-002",
      barcode: "7891234560028",
      category: "Freios",
      brand: "Cobreq",
      application: "Yamaha Fazer 250 (2010-2020)",
      costPrice: 24.5,
      salePrice: 49.9,
      currentStock: 8,
      minStock: 15,
      location: "Corredor B - Prateleira 1",
      supplierIndex: 1,
    },
    {
      name: "Pneu 90/90-18",
      sku: "PN-9090-18-003",
      barcode: "7891234560035",
      category: "Pneus",
      brand: "Pirelli",
      application: "Uso geral - traseiro/dianteiro",
      costPrice: 145.0,
      salePrice: 259.9,
      currentStock: 0,
      minStock: 6,
      location: "Depósito - Setor Pneus",
      supplierIndex: 1,
    },
    {
      name: "Vela de Ignição NGK",
      sku: "VI-NGK-004",
      barcode: "7891234560042",
      category: "Motor",
      brand: "NGK",
      application: "Diversas aplicações 125cc-160cc",
      costPrice: 12.9,
      salePrice: 24.9,
      currentStock: 120,
      minStock: 30,
      location: "Corredor C - Prateleira 2",
      supplierIndex: 2,
    },
    {
      name: "Filtro de Óleo Honda CG",
      sku: "FO-CG-005",
      barcode: "7891234560059",
      category: "Motor",
      brand: "Honda Original",
      application: "Honda CG 125/150/160",
      costPrice: 9.9,
      salePrice: 19.9,
      currentStock: 65,
      minStock: 20,
      location: "Corredor C - Prateleira 1",
      supplierIndex: 0,
    },
    {
      name: "Manete de Freio Honda Titan",
      sku: "MF-TITAN-006",
      barcode: "7891234560066",
      category: "Freios",
      brand: "Rider",
      application: "Honda Titan 150/160",
      costPrice: 18.0,
      salePrice: 34.9,
      currentStock: 5,
      minStock: 12,
      location: "Corredor B - Prateleira 2",
      supplierIndex: 0,
    },
    {
      name: "Capacete Pro Tork Liberty",
      sku: "CP-LIBERTY-007",
      barcode: "7891234560073",
      category: "Capacetes",
      brand: "Pro Tork",
      application: "Uso geral",
      costPrice: 95.0,
      salePrice: 189.9,
      currentStock: 22,
      minStock: 8,
      location: "Vitrine - Capacetes",
      supplierIndex: 3,
    },
    {
      name: "Óleo Motul 5100 10W40",
      sku: "OL-MOTUL5100-008",
      barcode: "7891234560080",
      category: "Lubrificantes",
      brand: "Motul",
      application: "Motores 4 tempos",
      costPrice: 32.0,
      salePrice: 59.9,
      currentStock: 54,
      minStock: 15,
      location: "Corredor D - Prateleira 1",
      supplierIndex: 1,
    },
    {
      name: "Bateria 12V 7Ah",
      sku: "BT-12V7AH-009",
      barcode: "7891234560097",
      category: "Elétrica",
      brand: "Moura",
      application: "Motos até 160cc",
      costPrice: 78.0,
      salePrice: 139.9,
      currentStock: 14,
      minStock: 6,
      location: "Corredor E - Prateleira 1",
      supplierIndex: 0,
    },
    {
      name: "Lâmpada LED H4",
      sku: "LP-LEDH4-010",
      barcode: "7891234560103",
      category: "Elétrica",
      brand: "Osram",
      application: "Farol dianteiro - uso geral",
      costPrice: 22.0,
      salePrice: 44.9,
      currentStock: 3,
      minStock: 10,
      location: "Corredor E - Prateleira 2",
      supplierIndex: 2,
    },
    {
      name: "Jaqueta Impermeável Pro Tork",
      sku: "JQ-IMPPT-011",
      barcode: "7891234560110",
      category: "Vestuário",
      brand: "Pro Tork",
      application: "Uso geral - tamanhos P ao GG",
      costPrice: 110.0,
      salePrice: 219.9,
      currentStock: 18,
      minStock: 5,
      location: "Vitrine - Vestuário",
      supplierIndex: 3,
    },
    {
      name: "Luva de Proteção Pro Tork",
      sku: "LV-PROTORK-012",
      barcode: "7891234560127",
      category: "Vestuário",
      brand: "Pro Tork",
      application: "Uso geral - tamanhos P ao GG",
      costPrice: 28.0,
      salePrice: 54.9,
      currentStock: 30,
      minStock: 10,
      location: "Vitrine - Vestuário",
      supplierIndex: 3,
    },
    {
      name: "Suporte de Celular Universal",
      sku: "SC-UNIV-013",
      barcode: "7891234560134",
      category: "Acessórios",
      brand: "Pro Tork",
      application: "Uso geral - guidão",
      costPrice: 15.0,
      salePrice: 34.9,
      currentStock: 40,
      minStock: 10,
      location: "Balcão - Acessórios",
      supplierIndex: 3,
    },
    {
      name: "Baú Traseiro 33L",
      sku: "BT-33L-014",
      barcode: "7891234560141",
      category: "Acessórios",
      brand: "Pro Tork",
      application: "Uso geral",
      costPrice: 145.0,
      salePrice: 279.9,
      currentStock: 6,
      minStock: 4,
      location: "Depósito - Setor Acessórios",
      supplierIndex: 3,
    },
    {
      name: "Cabo de Embreagem Honda CG 160",
      sku: "CE-CG160-015",
      barcode: "7891234560158",
      category: "Motor",
      brand: "Rider",
      application: "Honda CG 160 (2016-2023)",
      costPrice: 16.5,
      salePrice: 32.9,
      currentStock: 0,
      minStock: 8,
      location: "Corredor A - Prateleira 4",
      supplierIndex: 0,
    },
  ];

  const products = [];
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        categoryId: categoryByName[p.category].id,
        brand: p.brand,
        application: p.application,
        costPrice: p.costPrice,
        salePrice: p.salePrice,
        currentStock: p.currentStock,
        minStock: p.minStock,
        location: p.location,
        supplierId: suppliers[p.supplierIndex].id,
        supplierProductCode: (p as any).supplierProductCode ?? null,
      },
    });
    products.push(product);
  }

  // ---------- MOVIMENTAÇÕES DE EXEMPLO ----------
  // Entrada inicial de estoque (simula abastecimento do fornecedor)
  const entryOperation = await prisma.stockOperation.create({
    data: {
      type: "ENTRADA",
      supplierId: suppliers[0].id,
      invoiceNumber: "NF-000123",
      referenceCode: "NF 104.992",
      observation: "Reposição mensal de estoque",
      userId: admin.id,
      totalItems: 20,
      totalValue: 1798.0,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: products[0].id,
      operationId: entryOperation.id,
      type: "ENTRADA",
      quantity: 20,
      previousStock: 22,
      newStock: 42,
      observation: "Reposição mensal de estoque",
      userId: admin.id,
    },
  });

  // Saída por venda
  const exitOperation = await prisma.stockOperation.create({
    data: {
      type: "SAIDA",
      reason: "VENDA",
      referenceCode: "Pedido Balcão #8841",
      observation: "Venda balcão",
      userId: funcionario.id,
      totalItems: 2,
      totalValue: 99.8,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: products[4].id,
      operationId: exitOperation.id,
      type: "SAIDA",
      quantity: 2,
      previousStock: 67,
      newStock: 65,
      reason: "VENDA",
      observation: "Venda balcão",
      userId: funcionario.id,
    },
  });

  // Ajuste de estoque (correção de inventário)
  const adjustOperation = await prisma.stockOperation.create({
    data: {
      type: "AJUSTE",
      observation: "Correção após inventário físico",
      userId: admin.id,
      totalItems: 1,
      totalValue: 0,
    },
  });

  await prisma.stockMovement.create({
    data: {
      productId: products[9].id,
      operationId: adjustOperation.id,
      type: "AJUSTE",
      quantity: 2,
      previousStock: 5,
      newStock: 3,
      observation: "Correção após inventário físico",
      userId: admin.id,
    },
  });

  // ---------- NOTIFICAÇÕES ----------
  await prisma.notification.createMany({
    data: [
      { type: "ESTOQUE_BAIXO", message: "Pastilha de Freio Yamaha Fazer 250 está com estoque baixo." },
      { type: "SEM_ESTOQUE", message: "Pneu 90/90-18 está sem estoque." },
      { type: "SEM_ESTOQUE", message: "Cabo de Embreagem Honda CG 160 está sem estoque." },
      { type: "ESTOQUE_BAIXO", message: "Manete de Freio Honda Titan está com estoque baixo." },
      { type: "ESTOQUE_BAIXO", message: "Lâmpada LED H4 está com estoque baixo." },
      { type: "ENTRADA_REGISTRADA", message: "Entrada de 20 produtos registrada." },
      { type: "AJUSTE_ESTOQUE", message: "Estoque ajustado pelo administrador." },
    ],
  });

  console.log("✅ Seed concluído com sucesso!");
  console.log("");
  console.log("Usuários de teste:");
  console.log("  Administrador -> admin@motostock.com / admin123");
  console.log("  Funcionário   -> juliana@motostock.com / funcionario123");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
