import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { scrapeRecipeProcedure } from "@/server/integrations/scraper/scraper"
import z from "zod"
import { prisma } from "@/server/db"

export const recipeRouter = createTRPCRouter({
  scrape: scrapeRecipeProcedure,
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.recipe.findMany()
  }),
  delete: protectedProcedure
    .input(z.object({ recipeId: z.string().cuid() }))
    .mutation(({ input }) => {
      return prisma.recipe.delete({ where: { id: input.recipeId } })
    }),
  getById: protectedProcedure
    .input(z.object({ recipeId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      return prisma.recipe.findUniqueOrThrow({
        where: { id: input.recipeId },
        include: { steps: true, ingredients: true },
      })
    }),
})
