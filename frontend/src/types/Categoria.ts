export interface Subcategoria {
  id: number;
  categoryId: number | null;
  name: string;
  color: string;
  icon: string;
}

export interface Categoria {
  id: number;
  name: string;
  color: string;
  icon: string;
  subcategories: Subcategoria[];
}

export interface CategoriaResponse {
  categories: Categoria[];
  ungroupedSubcategories: Subcategoria[];
}

export interface CategoriaInput {
  name: string;
  color: string;
  icon: string;
}

export interface SubcategoriaInput extends CategoriaInput {
  categoryId: number | null;
}
