/**
 * Category and sub-category types
 */

export type Category = {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  displayLevel?: string;
  themeColor?: string;
  textColor?: string;
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

export type CourseModule = {
  _id: string;
  subCategoryId: string;
  subCategoryName?: string | null;
  name: string;
  description?: string;
  status: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
};

export type CourseLesson = {
  _id: string;
  moduleId: string;
  moduleName?: string | null;
  name: string;
  description?: string;
  contentType?: "video" | "text" | "quiz" | "assignment" | "other";
  contentUrl?: string;
  duration?: number;
  status: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryRequest = {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  displayLevel?: string;
  themeColor?: string;
  textColor?: string;
  status?: boolean;
};

export type CreateSubCategoryRequest = {
  categoryId: string;
  name: string;
  description?: string;
  status?: boolean;
};

export type CreateCourseModuleRequest = {
  subCategoryId: string;
  name: string;
  description?: string;
  status?: boolean;
  order?: number;
};

export type CreateCourseLessonRequest = {
  moduleId: string;
  name: string;
  description?: string;
  contentType?: "video" | "text" | "quiz" | "assignment" | "other";
  contentUrl?: string;
  duration?: number;
  status?: boolean;
  order?: number;
};
