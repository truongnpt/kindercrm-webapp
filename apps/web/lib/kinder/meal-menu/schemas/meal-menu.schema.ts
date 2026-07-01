import { z } from 'zod';

export const UpsertIngredientSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId: z.string().uuid(),
  name: z.string().min(1).max(200),
  unit: z.string().max(50).default('g'),
  allergenTags: z.array(z.string().max(50)).default([]),
  notes: z.string().max(1000).optional().or(z.literal('')),
  inventoryProductId: z.string().uuid().optional().or(z.literal('')),
});

export const UpsertDishSchema = z.object({
  id: z.string().uuid().optional(),
  schoolId: z.string().uuid(),
  mealCategoryId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().or(z.literal('')),
  allergenTags: z.array(z.string().max(50)).default([]),
});

export const CreateMenuSchema = z.object({
  schoolId: z.string().uuid(),
  title: z.string().min(1).max(200),
  periodType: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  notes: z.string().max(2000).optional().or(z.literal('')),
});

export const UpsertMenuItemSchema = z.object({
  schoolId: z.string().uuid(),
  menuId: z.string().uuid(),
  menuDate: z.string().min(1),
  mealSlot: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
  dishId: z.string().uuid().optional(),
  customDishName: z.string().max(200).optional().or(z.literal('')),
  portionNotes: z.string().max(500).optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const PublishMenuSchema = z.object({
  schoolId: z.string().uuid(),
  menuId: z.string().uuid(),
});

export const DeleteMenuItemSchema = z.object({
  schoolId: z.string().uuid(),
  menuItemId: z.string().uuid(),
});

export const SaveMenuTemplateSchema = z.object({
  schoolId: z.string().uuid(),
  menuId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
});

export const ApplyMenuTemplateSchema = z.object({
  schoolId: z.string().uuid(),
  menuId: z.string().uuid(),
  templateId: z.string().uuid(),
});

export const DeleteMenuTemplateSchema = z.object({
  schoolId: z.string().uuid(),
  templateId: z.string().uuid(),
});
