import { Request, Response } from "express";
import PDFDocument from "pdfkit";
import { reportsService } from "./reports.service";
import { toCsv } from "../../utils/csv";
import { ApiError } from "../../utils/apiError";

export const reportsController = {
  async stock(req: Request, res: Response) {
    res.json(await reportsService.stockReport());
  },
  async lowStock(req: Request, res: Response) {
    res.json(await reportsService.lowStockReport());
  },
  async outOfStock(req: Request, res: Response) {
    res.json(await reportsService.outOfStockReport());
  },
  async entries(req: Request, res: Response) {
    res.json(await reportsService.entriesReport(req.query as any));
  },
  async exits(req: Request, res: Response) {
    res.json(await reportsService.exitsReport(req.query as any));
  },
  async movements(req: Request, res: Response) {
    res.json(await reportsService.movementsReport(req.query as any));
  },
  async stockValue(req: Request, res: Response) {
    res.json(await reportsService.stockValue());
  },
  async stockValueByCategory(req: Request, res: Response) {
    res.json(await reportsService.stockValueByCategory());
  },
  async topProducts(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    res.json(await reportsService.topMovedProducts({ ...(req.query as any), limit }));
  },

  // Exportação em CSV (compatível com Excel)
  async exportCsv(req: Request, res: Response) {
    const type = req.query.type as string;

    let rows: Record<string, unknown>[];
    let headers: { key: string; label: string }[];
    let filename: string;

    switch (type) {
      case "stock": {
        rows = await reportsService.stockReport();
        headers = [
          { key: "name", label: "Produto" },
          { key: "sku", label: "SKU" },
          { key: "currentStock", label: "Estoque atual" },
          { key: "minStock", label: "Estoque mínimo" },
          { key: "stockStatus", label: "Status" },
          { key: "stockValue", label: "Valor em estoque (R$)" },
        ];
        filename = "relatorio-estoque.csv";
        break;
      }
      case "low-stock": {
        rows = await reportsService.lowStockReport();
        headers = [
          { key: "name", label: "Produto" },
          { key: "sku", label: "SKU" },
          { key: "currentStock", label: "Estoque atual" },
          { key: "minStock", label: "Estoque mínimo" },
        ];
        filename = "relatorio-estoque-baixo.csv";
        break;
      }
      case "movements": {
        const movements = await reportsService.movementsReport(req.query as any);
        rows = movements.map((m) => ({
          data: m.createdAt.toLocaleString("pt-BR"),
          produto: m.product.name,
          sku: m.product.sku,
          tipo: m.type,
          quantidade: m.quantity,
          estoqueAnterior: m.previousStock,
          estoqueAtual: m.newStock,
          usuario: m.user.name,
        }));
        headers = [
          { key: "data", label: "Data" },
          { key: "produto", label: "Produto" },
          { key: "sku", label: "SKU" },
          { key: "tipo", label: "Tipo" },
          { key: "quantidade", label: "Quantidade" },
          { key: "estoqueAnterior", label: "Estoque anterior" },
          { key: "estoqueAtual", label: "Estoque atual" },
          { key: "usuario", label: "Usuário" },
        ];
        filename = "relatorio-movimentacoes.csv";
        break;
      }
      default:
        throw ApiError.badRequest("Tipo de relatório inválido. Use: stock, low-stock ou movements.");
    }

    const csv = toCsv(rows, headers);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  },

  // Exportação em PDF simples (tabela de texto)
  async exportPdf(req: Request, res: Response) {
    const type = req.query.type as string;

    let title: string;
    let rows: string[][];
    let columns: string[];

    switch (type) {
      case "stock": {
        title = "Relatório de Estoque";
        const data = await reportsService.stockReport();
        columns = ["Produto", "SKU", "Estoque", "Mínimo", "Status"];
        rows = data.map((p) => [p.name, p.sku, String(p.currentStock), String(p.minStock), p.stockStatus]);
        break;
      }
      case "low-stock": {
        title = "Relatório de Estoque Baixo";
        const data = await reportsService.lowStockReport();
        columns = ["Produto", "SKU", "Estoque", "Mínimo"];
        rows = data.map((p) => [p.name, p.sku, String(p.currentStock), String(p.minStock)]);
        break;
      }
      default:
        throw ApiError.badRequest("Tipo de relatório inválido. Use: stock ou low-stock.");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${type}.pdf"`);

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    doc.fontSize(18).text("MotoStock", { align: "left" });
    doc.fontSize(14).text(title, { align: "left" });
    doc.moveDown();
    doc.fontSize(9).fillColor("#666").text(`Gerado em ${new Date().toLocaleString("pt-BR")}`);
    doc.moveDown();

    const colWidth = 500 / columns.length;
    doc.fontSize(10).fillColor("#000");
    columns.forEach((col, i) => doc.text(col, 40 + i * colWidth, doc.y, { width: colWidth, continued: i < columns.length - 1 }));
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(540, doc.y).strokeColor("#ccc").stroke();
    doc.moveDown(0.3);

    rows.forEach((row) => {
      const y = doc.y;
      row.forEach((cell, i) => doc.text(cell, 40 + i * colWidth, y, { width: colWidth }));
      doc.moveDown(0.6);
    });

    doc.end();
  },
};
