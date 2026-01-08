/**
 * Category and sub-category types
 */

export type Category = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubCategory = {
  _id: string;
  categoryId: string;
  name: string;
  description?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryRequest = {
  name: string;
  description?: string;
  image?: string;
  status?: boolean;
};

export type CreateSubCategoryRequest = {
  categoryId: string;
  name: string;
  description?: string;
  status?: boolean;
};
