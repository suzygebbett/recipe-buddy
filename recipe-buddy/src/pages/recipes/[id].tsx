import { useRouter } from "next/router"
import LoggedInShell from "@/components/Shell"
import { api } from "@/utils/api"

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
      <div className="max-w-md">
        <div className="text-xl font-bold">{data.title}</div>
      </div>
    </LoggedInShell>
  )
}
