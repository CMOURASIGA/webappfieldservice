import { StockMaterial } from "../types";

export const getStockStatus = (material: StockMaterial) => {
  const { physicalBalance, reservedBalance, minStock } = material;
  const availableBalance = physicalBalance - reservedBalance;

  if (physicalBalance === 0) return "Sem saldo";
  if (availableBalance <= minStock) return "Crítico";
  if (physicalBalance <= minStock) return "Atenção";
  return "Normal";
};
