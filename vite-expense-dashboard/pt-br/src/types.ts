export type Categoria = "alimento" | "transporte" | "lazer" | "saúde" | "outros";

export interface Despesa {
  id: string;
  titulo: string;
  valor: number;
  categoria: Categoria;
}
