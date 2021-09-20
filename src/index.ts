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
  const apiKey: string = req.body.headers['x-chaingraph-api-key'] || ''
  if (!apiKey) throw new Error('Invalid API key')

  log.info(`running api key validation api key = "${apiKey}"`)

  // find user for this key. keys are unique
  const result = await db.query(`SELECT * FROM api_users WHERE api_key = '${apiKey}'`)

  if (result.length === 0) return res.sendStatus(404).end()
  const user = result[0]

  // validate it is valid hostname for this key
  const hostname = new URL(req.body.headers.Origin || req.body.headers.origin).hostname
  if (!user?.domain_names?.split(',').includes(hostname)) return res.sendStatus(404).end()

  // https://hasura.io/docs/latest/graphql/core/auth/authorization/index.html
  return res.send({
    'X-Hasura-User-Id': user.id.toString(),
    'X-Hasura-Role': 'api_user',
    'X-Hasura-Is-Owner': 'true',
    'Cache-Control': 'max-age=600',
  })
})

app.listen(config.port, '0.0.0.0', () => log.info(`Server running at http://0.0.0.0:${config.port}/`))
