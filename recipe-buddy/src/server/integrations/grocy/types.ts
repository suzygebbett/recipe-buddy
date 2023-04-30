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
