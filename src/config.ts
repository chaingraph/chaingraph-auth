import * as env from 'env-var'

export interface Config {
  database_url: string
  port: number
}

export const config: Config = {
  database_url: env.get('DATABASE_URL').required().asString(),
  port: env.get('PORT').required().asIntPositive(),
}
