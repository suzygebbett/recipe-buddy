/* eslint @typescript-eslint/no-non-null-assertion: 0 */

import { useRecipeEditAtom } from "@/contexts/RecipeAtomProvider"
import {
  GrocyIngredientInput,
  GrocyRecipeInput,
} from "@/server/integrations/grocy/types"
import { api } from "@/utils/api"

export type DraftIngredient = {
  id: string
  name: string
  originalName: string
  grocyIngredientId: string
  quantity: string
  grocyQuantityUnitId: string
  useAnyQuantityUnit: boolean
  confirmed: boolean
  ignored: boolean
}

export type DraftRecipe = {
  dbId: string
  steps: string[]
  ingredients: DraftIngredient[]
  name: string
}

export function useRecipeBuilder() {
  const [recipe] = useRecipeEditAtom()

  const constructRecipeInput = (): GrocyRecipeInput => ({
    dbId: recipe.dbId,
    name: recipe.name,
    steps: recipe.steps,
    ingredients: recipe.ingredients
      .filter((a) => a.confirmed)
      .map((a) => ({
        productId: a.grocyIngredientId,
        amount: a.quantity,
        quantityUnitId: a.grocyQuantityUnitId,
        onlyCheckSingleUnitInStock: a.useAnyQuantityUnit,
      })),
  })

  const allRowsConfirmedOrIgnored = recipe.ingredients.every(
    (a) => a.ignored || a.confirmed
  )

  const conformsToSchema = GrocyRecipeInput.safeParse(
    constructRecipeInput()
  ).success

  const isValidRecipe = conformsToSchema && allRowsConfirmedOrIgnored

  return {
    isValidRecipe,
    recipe,
    constructRecipeInput,
  }
}

export function useRowEditing(ingredientId: string) {
  const [recipe, setRecipe] = useRecipeEditAtom()

  const ingredient = recipe.ingredients.find((a) => a.id === ingredientId)
  if (!ingredient) throw new Error("No matching ingredient")

  const prods = api.grocy.products.useQuery().data

  const rowIsValid = GrocyIngredientInput.safeParse({
    productId: ingredient.grocyIngredientId,
    amount: ingredient.quantity,
    quantityUnitId: ingredient.grocyQuantityUnitId,
    onlyCheckSingleUnitInStock: ingredient.useAnyQuantityUnit,
  }).success

  const ignoreRowToggle = () =>
    setRecipe((draft) => {
      const iI = draft.ingredients.findIndex((a) => a.id === ingredientId)
      if (iI < 0) throw new Error("No ingredient with that ID")
      draft.ingredients[iI]!.ignored = !draft.ingredients[iI]!.ignored
    })

  const confirmRowToggle = () =>
    setRecipe((draft) => {
      const iI = draft.ingredients.findIndex((a) => a.id === ingredientId)
      if (iI < 0) throw new Error("No ingredient with that ID")
      draft.ingredients[iI]!.confirmed = !draft.ingredients[iI]!.confirmed
    })

  const setUseAnyUnit = (newValue: boolean) =>
    setRecipe((draft) => {
      const iI = draft.ingredients.findIndex((a) => a.id === ingredientId)
      if (iI < 0) throw new Error("No ingredient with that ID")
      draft.ingredients[iI]!.useAnyQuantityUnit = newValue

      if (newValue === false) {
        if (!prods) throw new Error("Products not loaded")
        if (ingredient.grocyIngredientId !== "") {
          draft.ingredients[iI]!.grocyQuantityUnitId =
            prods.find((a) => a.id === ingredient.grocyIngredientId)
              ?.qu_id_stock || ""
        } else {
          draft.ingredients[iI]!.grocyQuantityUnitId = ""
        }
      }
    })

  const setRowGrocyProduct = (productId: string, unitId: string) => {
    setRecipe((draft) => {
      const iI = draft.ingredients.findIndex((a) => a.id === ingredientId)
      if (iI < 0) throw new Error("No ingredient with that ID")

      draft.ingredients[iI]!.grocyIngredientId = productId
      draft.ingredients[iI]!.grocyQuantityUnitId = unitId
    })
  }

  const setRowGrocyUnit = (unitId: string) => {
    setRecipe((draft) => {
      const iI = draft.ingredients.findIndex((a) => a.id === ingredientId)
      if (iI < 0) throw new Error("No ingredient with that ID")

      draft.ingredients[iI]!.grocyQuantityUnitId = unitId
    })
  }

  const setRowQuantity = (quantity: string) => {
    setRecipe((draft) => {
      const iI = draft.ingredients.findIndex((a) => a.id === ingredientId)
      if (iI < 0) throw new Error("No ingredient with that ID")

      draft.ingredients[iI]!.quantity = quantity
    })
  }

  return {
    ignoreRowToggle,
    confirmRowToggle,
    setUseAnyUnit,
    setRowGrocyProduct,
    setRowGrocyUnit,
    setRowQuantity,
    rowIsValid,
  }
}
