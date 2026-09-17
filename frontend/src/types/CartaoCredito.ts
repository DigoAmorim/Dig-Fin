export interface CartaoCredito {
  id: string;
  name: string;
  cardBrandId: string;
  cardBrandDescription: string;
  dueDay: number;
}

export interface CartaoCreditoInput {
  name: string;
  cardBrandId: string;
  dueDay: number;
}