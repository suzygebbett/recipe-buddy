import z from "zod"

export const RecipeInstructionSchema = z.union([
  z
    .string()
    .array()
    .transform((a) => a.map((b, i) => ({ content: b, order: i }))),
  z
    .object({ "@type": z.literal("HowToStep"), text: z.string() })
    .array()
    .transform((v) => v.map((e, i) => ({ content: e.text, order: i }))),
])

const ImageSchema = z.union([
  z.string(),
  z.object({ url: z.string() }).transform((a) => a.url),
])

const ingredientTransformer = (ing: string) => {
  const ingredientRegex = /^(?:(\d+)\w* )?(.+)$/g

  const res = ingredientRegex.exec(ing)

  if (!res || !res[2]) throw new Error("Could not parse ingredient")

  const name = res[2]
  const quantity = parseInt(res[1] || "1", 10)

  return {
    name,
    quantity,
    originalName: ing,
  }
}

export const RecipeSchema = z.object({
  "@type": z.literal("Recipe"),
  cookTime: z.string().optional(),
  description: z.string().optional(),
  image: ImageSchema.optional(),
  recipeIngredient: z
    .array(z.string())
    .transform((a) => a.map(ingredientTransformer)),
  name: z.string(),
  recipeInstructions: RecipeInstructionSchema,
  recipeYield: z.union([z.string(), z.number()]).optional(),
})

export type RecipeSchema = z.infer<typeof RecipeSchema>
