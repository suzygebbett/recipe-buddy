import {
  createTRPCRouter,
  protectedProcedure,
} from "@recipe-buddy/server/api/trpc"
import { grocyClient } from "@recipe-buddy/server/integrations/grocy/grocy"

export const grocyRouter = createTRPCRouter({
  products: protectedProcedure.query(grocyClient.getProducts.bind(grocyClient)),
})
