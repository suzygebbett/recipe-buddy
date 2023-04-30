import { createTRPCRouter } from "@recipe-buddy/server/api/trpc"
import { exampleRouter } from "@recipe-buddy/server/api/routers/example"
import { grocyRouter } from "@recipe-buddy/server/api/routers/grocy"
import { recipeRouter } from "@/server/api/routers/recipe"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  grocy: grocyRouter,
  recipe: recipeRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
