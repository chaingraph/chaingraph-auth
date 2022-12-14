const express = require('express')
import { log } from './logger'
import { URL } from 'url'
import { db } from './db'
import { config } from './config'

const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/', async (req: any, res: any) => {
  try {
    // If you configure your webhook to use POST, then Hasura will send all client headers in payload.
    const headers = req.body.headers || []
    console.log({ headers })
    const apiKey: string = headers['x-chaingraph-api-key'] || ''
    console.log(`/auth hook called with ${apiKey}`)
    if (!apiKey) throw new Error('Invalid API key')

    log.info(`running api key validation api key = "${apiKey}"`)

    // find user for this key. keys are unique
    const result = await db.query(`SELECT * FROM api_users WHERE api_key = '${apiKey}'`)

    // Use 401
    // https://hasura.io/docs/latest/auth/authentication/webhook/
    if (result.length === 0) return res.sendStatus(401).end()
    const user = result[0]

    // validate it is valid hostname for this key

    const hostname = new URL(headers.Origin || headers.origin).hostname
    if (!user?.domain_names?.split(',').includes(hostname)) return res.sendStatus(401).end()

    // https://hasura.io/docs/latest/graphql/core/auth/authorization/index.html
    return res.send({
      'X-Hasura-User-Id': user.id.toString(),
      'X-Hasura-Role': 'api_user',
      'X-Hasura-Is-Owner': 'true',
      'Cache-Control': 'max-age=600',
    })
  } catch (error) {
    console.error('@@@error@@@', error)
    return res.sendStatus(401).end()
  }
})

app.get('/', async (req: any, res: any) => {
  return res.send({ status: 'ok' })
})

app.listen(config.port, '0.0.0.0', () => log.info(`Server running at http://0.0.0.0:${config.port}/`))
