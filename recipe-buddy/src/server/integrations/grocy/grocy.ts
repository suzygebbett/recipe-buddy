import { env } from "@recipe-buddy/env.mjs"
import axios, { AxiosHeaders } from "axios"
import {
  GrocyCreationResponse,
  GrocyProduct,
  GrocyQuantityUnit,
  GrocyRecipe,
  GrocyRecipePos,
} from "@recipe-buddy/server/integrations/grocy/types"

type GrocyEntity = "quantity_units" | "products" | "recipes" | "recipes_pos"
class GrocyClient {
  private readonly apiUrl: string
  private readonly apiKey: string

  private readonly headers: AxiosHeaders

  constructor(apiKey: string, apiUrl: string) {
    this.apiKey = apiKey
    this.apiUrl = apiUrl

    this.headers = new AxiosHeaders()
    this.headers.set("GROCY-API-KEY", this.apiKey)
  }

  private axiosGet(url: string) {
    return axios.get(`${this.apiUrl}${url}`, { headers: this.headers })
  }

  private axiosPost(url: string, body: Record<string, unknown>) {
    return axios.post(`${this.apiUrl}${url}`, body, { headers: this.headers })
  }

  private axiosPut(url: string, body: Record<string, unknown> | File) {
    return axios.put(`${this.apiUrl}${url}`, body, { headers: this.headers })
  }

  private getEntities(entity: GrocyEntity) {
    return this.axiosGet(`/objects/${entity}`)
  }

  private postEntities(entity: GrocyEntity, body: Record<string, unknown>) {
    return this.axiosPost(`/objects/${entity}`, body)
  }

  async getProducts() {
    const entities = await this.getEntities("products")
    return GrocyProduct.array().parse(entities.data)
  }

  async getQuantityUnits() {
    const entities = await this.getEntities("quantity_units")
    return GrocyQuantityUnit.array().parse(entities.data)
  }

  async createRecipe(input: Omit<GrocyRecipe, "id">) {
    GrocyRecipe.omit({ id: true }).parse(input)

    console.log(`Creating recipe: ${JSON.stringify(input)}`)

    const recipe = await this.postEntities("recipes", input)

    console.log(JSON.stringify(recipe.data))
    return GrocyCreationResponse.parse(recipe.data)
  }

  async createRecipePos(input: Omit<GrocyRecipePos, "id">) {
    GrocyRecipePos.omit({ id: true }).parse(input)

    console.log(`Creating recipe ingredient: ${JSON.stringify(input)}`)

    const recipePos = await this.postEntities("recipes_pos", input)
    console.log(JSON.stringify(recipePos.data))
    return GrocyCreationResponse.parse(recipePos.data)
  }

  async uploadRecipeImageFile(file: File) {
    const fileNameB64 = btoa(file.name)

    const uploadedFile = await this.axiosPut(
      `/recipepictures/${fileNameB64}`,
      file
    )

    return uploadedFile
  }
}

export const grocyClient = new GrocyClient(
  env.GROCY_API_KEY,
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  `${env.NEXT_PUBLIC_GROCY_URL}/api`
)
