import { useRouter } from "next/router"
import LoggedInShell from "@/components/Shell"
import { api } from "@/utils/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { env } from "@/env.mjs"
import { sentenceCase } from "sentence-case"
import {
  DraftIngredient,
  useRecipeBuilder,
  useRowEditing,
} from "@/hooks/useRecipeBuilder"
import { RecipeEditingProvider } from "@/contexts/RecipeAtomProvider"

export default function RecipePage() {
  const router = useRouter()
  const { id } = router.query

  if (!id || typeof id !== "string") {
    return null
  }
  const { data } = api.recipe.getById.useQuery({ recipeId: id })

  if (!data) return null

  return (
    <LoggedInShell>
      <div className="flex w-screen flex-row justify-center">
        <div className="flex w-5/6 flex-col items-center justify-center">
          <RecipeEditingProvider initialState={data}>
            <IngredientsTable />
            <AddRecipeButton />
          </RecipeEditingProvider>
        </div>
      </div>
    </LoggedInShell>
  )
}

function AddRecipeButton() {
  const { isValidRecipe, constructRecipeInput } = useRecipeBuilder()

  const router = useRouter()

  const addMut = api.grocy.addRecipeToGrocy.useMutation({
    onSuccess: () => {
      router.push("/")
    },
  })

  const handleAdd = () => addMut.mutate(constructRecipeInput())

  return (
    <Button disabled={!isValidRecipe} onClick={handleAdd}>
      Add to Grocy
    </Button>
  )
}

function IngredientsTable() {
  const { recipe } = useRecipeBuilder()

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow>
          <TableHead>Recipe Ingredient</TableHead>
          <TableHead>Grocy Product</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Use any unit</TableHead>
          <TableHead>Quantity Unit</TableHead>
          <TableHead>Create Product</TableHead>
          <TableHead>Confirm/Ignore</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipe.ingredients.map((a) => (
          <IngredientRow ingredient={a} key={a.id} />
        ))}
      </TableBody>
    </Table>
  )
}

function IngredientRow({ ingredient }: { ingredient: DraftIngredient }) {
  const {
    confirmRowToggle,
    ignoreRowToggle,
    setUseAnyUnit,
    setRowGrocyProduct,
    setRowGrocyUnit,
    setRowQuantity,
    rowIsValid,
  } = useRowEditing(ingredient.id)

  const isIgnoredOrConfirmed = ingredient.ignored || ingredient.confirmed

  return (
    <TableRow>
      <TableCell>{ingredient.originalName}</TableCell>
      <TableCell>
        <IngredientSelector
          disabled={isIgnoredOrConfirmed}
          value={ingredient.grocyIngredientId}
          setValue={setRowGrocyProduct}
        />
      </TableCell>
      <TableCell>
        <Input
          value={ingredient.quantity}
          onChange={(a) => setRowQuantity(a.target.value)}
          disabled={isIgnoredOrConfirmed}
        />
      </TableCell>
      <TableCell>
        <Checkbox
          checked={ingredient.useAnyQuantityUnit}
          onCheckedChange={setUseAnyUnit}
          disabled={isIgnoredOrConfirmed}
        />
      </TableCell>
      <TableCell>
        <QuantityUnitSelector
          setValue={setRowGrocyUnit}
          disabled={!ingredient.useAnyQuantityUnit}
          value={ingredient.grocyQuantityUnitId}
        />
      </TableCell>
      <TableCell>
        <a
          target="_blank"
          href={`${
            env.NEXT_PUBLIC_GROCY_URL
          }/product/new?closeAfterCreation&flow=InplaceNewProductWithName&name=${encodeURI(
            sentenceCase(ingredient.name)
          )}`}
        >
          <CreateProductButton
            ingredientId={ingredient.id}
            disabled={ingredient.ignored || ingredient.confirmed}
          />
        </a>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            onClick={confirmRowToggle}
            disabled={ingredient.ignored || !rowIsValid}
          >
            Confirm
          </Button>
          <Button
            variant="destructive"
            onClick={ignoreRowToggle}
            disabled={ingredient.confirmed}
          >
            Ignore
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function CreateProductButton({
  ingredientId,
  disabled,
}: {
  ingredientId: string
  disabled: boolean
}) {
  const utils = api.useContext()

  const { setRowGrocyProduct } = useRowEditing(ingredientId)

  const handleClick = () => {
    const controller = new AbortController()

    const signal = controller.signal

    window.addEventListener(
      "visibilitychange",
      () => {
        if (!document.hidden) {
          utils.grocy.products.fetch().then((data) => {
            const newProd = data.sort(
              (a, b) => parseInt(b.id, 10) - parseInt(a.id, 10)
            )[0]!
            setRowGrocyProduct(newProd.id, newProd.qu_id_stock)
          })
          controller.abort()
        }
      },
      { signal }
    )
  }

  return (
    <Button onClick={handleClick} disabled={disabled}>
      Create Product
    </Button>
  )
}

function IngredientSelector({
  value,
  setValue,
  disabled,
}: {
  disabled: boolean
  value: string
  setValue: (productId: string, unitId: string) => void
}) {
  const { data } = api.grocy.products.useQuery()

  const ings = data ? data.map((a) => ({ label: a.name, value: a.id })) : []

  const handleChange = (prodId: string) => {
    if (!data) throw new Error("Products not loaded")
    const prod = data.find((a) => a.id === prodId)
    if (!prod) throw new Error("No matching product")
    const unitId = prod.qu_id_stock

    setValue(prodId, unitId)
  }

  return (
    <Combobox
      disabled={disabled}
      items={ings}
      value={value}
      setValue={handleChange}
      placeholder="Select an ingredient"
      notFoundMessage="No ingredient found"
    />
  )
}

function QuantityUnitSelector({
  disabled,
  value,
  setValue,
}: {
  disabled: boolean
  value: string
  setValue: (newVal: string) => void
}) {
  const { data } = api.grocy.quantityUnits.useQuery()

  const units = data ? data.map((a) => ({ label: a.name, value: a.id })) : []

  return (
    <Combobox
      disabled={disabled}
      items={units}
      value={value}
      setValue={setValue}
      placeholder="Select a quantity unit"
      notFoundMessage="No quantity unit found"
    />
  )
}
