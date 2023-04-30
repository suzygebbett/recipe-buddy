import { env } from "@recipe-buddy/env.mjs"
import axios, { AxiosHeaders } from "axios"
import {
  GrocyProduct,
  GrocyQuantityUnit,
} from "@recipe-buddy/server/integrations/grocy/types"

type GrocyEntity = "quantity_units" | "products"
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

  private getEntities(entity: GrocyEntity) {
    return this.axiosGet(`/objects/${entity}`)
  }

  async getProducts() {
    const entities = await this.getEntities("products")
    return GrocyProduct.array().parse(entities.data)
  }

  async getQuantityUnits() {
    const entities = await this.getEntities("quantity_units")
    return GrocyQuantityUnit.array().parse(entities.data)
  }
}

export const grocyClient = new GrocyClient(env.GROCY_API_KEY, env.GROCY_API_URL)
