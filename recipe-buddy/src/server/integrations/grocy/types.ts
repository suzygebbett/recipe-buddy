import { z } from "zod"

export const GrocyQuantityUnit = z.object({
  id: z.string(),
  name: z.string(),
  name_plural: z.string(),
})

export type GrocyQuantityUnit = z.infer<typeof GrocyQuantityUnit>

export const GrocyProduct = z.object({
  id: z.string(),
  name: z.string(),
  qu_id_stock: z.string(),
})

export type GrocyProduct = z.infer<typeof GrocyProduct>

export const GrocyIngredientInput = z.object({
  productId: z.string().trim().min(1),
  amount: z.string().trim().min(1),
  quantityUnitId: z.string().trim().min(1),
  onlyCheckSingleUnitInStock: z.boolean(),
})

export const GrocyRecipeInput = z.object({
  dbId: z.string(),
  name: z.string().trim().min(1),
  steps: z.string().array(),
  ingredients: GrocyIngredientInput.array(),
})

export type GrocyRecipeInput = z.infer<typeof GrocyRecipeInput>

export const GrocyRecipe = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
})

export type GrocyRecipe = z.infer<typeof GrocyRecipe>

export const GrocyRecipePos = z.object({
  id: z.string(),
  recipe_id: z.string(),
  product_id: z.string(),
  amount: z.string(),
  qu_id: z.string(),
  only_check_single_unit_in_stock: z.union([z.literal("0"), z.literal("1")]),
})

export type GrocyRecipePos = z.infer<typeof GrocyRecipePos>

export const GrocyCreationResponse = z.object({
  created_object_id: z.string(),
})
