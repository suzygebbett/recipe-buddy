import {
  createTRPCRouter,
  protectedProcedure,
} from "@recipe-buddy/server/api/trpc"
import { grocyClient } from "@recipe-buddy/server/integrations/grocy/grocy"
import { GrocyRecipeInput } from "@/server/integrations/grocy/types"
import axios from "axios"
import { prisma } from "@/server/db"

export const grocyRouter = createTRPCRouter({
  products: protectedProcedure.query(grocyClient.getProducts.bind(grocyClient)),
  quantityUnits: protectedProcedure.query(
    grocyClient.getQuantityUnits.bind(grocyClient)
  ),
  addRecipeToGrocy: protectedProcedure
    .input(GrocyRecipeInput)
    .mutation(async ({ input }) => {
      const getDescription = () =>
        `<ol>${input.steps.map((step) => `<li>${step}</li>`).join(" ")}</ol>`

      const recipe = await grocyClient.createRecipe({
        name: input.name,
        description: getDescription(),
      })

      for (const a of input.ingredients) {
        await grocyClient.createRecipePos({
          recipe_id: recipe.created_object_id,
          amount: a.amount,
          qu_id: a.quantityUnitId,
          product_id: a.productId,
          only_check_single_unit_in_stock: a.onlyCheckSingleUnitInStock
            ? "1"
            : "0",
        })
      }

      await prisma.recipe.delete({ where: { id: input.dbId } })

      return recipe
    }),
})
