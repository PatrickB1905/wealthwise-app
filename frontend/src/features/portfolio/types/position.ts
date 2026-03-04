export type Position = {
  id: number;
  ticker: string;
  quantity: number;
  buyPrice: number;
  buyDate: string;
  sellPrice?: number;
  sellDate?: string;
};
