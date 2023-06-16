import { type NextPage } from "next"
import Head from "next/head"
import { signIn, signOut, useSession } from "next-auth/react"

import { api } from "@recipe-buddy/utils/api"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"

const Home: NextPage = () => {
  const utils = api.useContext()

  const [recipeUrl, setRecipeUrl] = useState("")

  const getRecipes = api.recipe.getAll.useQuery()

  const scrape = api.recipe.scrape.useMutation({
    onSuccess: async () => {
      setRecipeUrl("")
      await utils.recipe.getAll.invalidate()
    },
  })

  const doScrape = () => scrape.mutate({ url: recipeUrl })

  const delMut = api.recipe.delete.useMutation({
    onSuccess: async () => {
      await utils.recipe.getAll.invalidate()
    },
  })

  const router = useRouter()

  return (
    <>
      <Head>
        <title>Recipe Buddy</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Recipe Buddy
          </h1>

          <div className="flex flex-col items-center gap-2">
            <AuthShowcase />
            <div className="flex flex-row space-x-2">
              <Input
                placeholder="Recipe URL"
                value={recipeUrl}
                onChange={(a) => {
                  setRecipeUrl(a.target.value)
                }}
              />
              <Button onClick={doScrape}>Add Recipe</Button>
            </div>
          </div>
          {getRecipes.data ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {getRecipes.data.map((a) => (
                <Card key={a.id}>
                  <CardHeader>
                    {a.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.imageUrl}
                        className="max-h-xs max-w-xs object-scale-down"
                        alt={`Photo of ${a.title}`}
                      />
                    )}
                    <CardTitle>{a.title}</CardTitle>
                  </CardHeader>
                  <CardFooter>
                    <div className="flex grow flex-row justify-between">
                      <Button
                        variant="destructive"
                        onClick={() => delMut.mutate({ recipeId: a.id })}
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={() => {
                          router.push(`/recipes/${a.id}`)
                        }}
                      >
                        Add to Grocy
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
      </main>
    </>
  )
}

export default Home

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession()

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  )
}
