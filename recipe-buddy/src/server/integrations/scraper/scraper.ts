import { protectedProcedure } from "@recipe-buddy/server/api/trpc"
import z from "zod"
import { JSDOM } from "jsdom"
import { RecipeSchema } from "@recipe-buddy/server/integrations/scraper/types"
import { prisma } from "@recipe-buddy/server/db"

export const scrapeRecipeProcedure = protectedProcedure
  .input(z.object({ url: z.string().url() }))
  .mutation(async ({ input }) => {
    await scrapeRecipe(input.url)
  })

export async function scrapeRecipe(url: string) {
  const nodeList = await getNodeListFromUrl(url)
  const scrapedRecipe = getRecipeFromNodes(nodeList)

  await prisma.recipe.create({
    data: {
      title: scrapedRecipe.name,
      steps: {
        createMany: {
          data: scrapedRecipe.recipeInstructions,
        },
      },
      ingredients: {
        createMany: {
          data: scrapedRecipe.recipeIngredient,
        },
      },
      imageUrl: scrapedRecipe.image,
    },
  })
}

async function getNodeListFromUrl(url: string) {
  const dom = await JSDOM.fromURL(url)

  const nodeList: NodeList = dom.window.document.querySelectorAll(
    "script[type='application/ld+json']"
  )

  if (nodeList.length === 0)
    throw new Error("The linked page contains no metadata")

  return nodeList
}

function getRecipeFromNodes(nodeList: NodeList) {
  for (const i of nodeList) {
    if (!i.textContent) continue

    const s = RecipeSchema.safeParse(JSON.parse(i.textContent))

    if (s.success) {
      return s.data
    }
  }

  throw new Error("None of the metadata on the page is of recipe type")
}
