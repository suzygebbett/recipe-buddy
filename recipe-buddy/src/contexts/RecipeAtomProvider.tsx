import { atomWithImmer } from "jotai-immer"
import { DraftRecipe } from "@/hooks/useRecipeBuilder"
import { createContext, PropsWithChildren, useContext, useMemo } from "react"
import { useAtom } from "jotai/react"
import { RouterOutputs } from "@/utils/api"

type DbRecipe = RouterOutputs["recipe"]["getById"]

const emptyRecipe = (dbRecipe: DbRecipe): DraftRecipe => ({
  dbId: dbRecipe.id,
  steps: dbRecipe.steps.map((a) => a.content),
  ingredients: dbRecipe.ingredients.map((a) => ({
    quantity: a.quantity.toString(),
    productId: "",
    id: a.id,
    name: a.name,
    originalName: a.originalName,
    confirmed: false,
    ignored: false,
    grocyIngredientId: "",
    grocyQuantityUnitId: "",
    useAnyQuantityUnit: false,
  })),
  name: dbRecipe.title,
})

const createRecipeAtom = (dbRecipe: DbRecipe) =>
  atomWithImmer<DraftRecipe>(emptyRecipe(dbRecipe))

const RecipeAtomContext = createContext<
  ReturnType<typeof createRecipeAtom> | undefined
>(undefined)

export const RecipeEditingProvider = ({
  initialState,
  children,
}: PropsWithChildren<{ initialState: DbRecipe }>) => {
  const recipeAtom = useMemo(() => createRecipeAtom(initialState), [])

  return (
    <RecipeAtomContext.Provider value={recipeAtom}>
      {children}
    </RecipeAtomContext.Provider>
  )
}

export const useRecipeEditAtom = () => {
  const value = useContext(RecipeAtomContext)
  if (value === undefined) {
    throw new Error(
      "Recipe editing should be called within RecipeEditingProvider"
    )
  }

  return useAtom(value)
}
