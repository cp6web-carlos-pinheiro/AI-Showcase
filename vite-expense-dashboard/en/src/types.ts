export type Category = "food" | "transport" | "leisure" | "health" | "other";

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
}