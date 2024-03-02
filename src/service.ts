import joi from 'joi'

export type Service = {
  uuid: string
  name: string
  address: string
  version: string
  state: number
  interface: {
    type: 'REST'
    value: {
      method: string
      path: string
    }[]
  }
}

const endpoint = joi
  .object({
    method: joi.string().required(),
    path: joi.string().required(),
  })
  .required()

export const schema = joi.object<Omit<Service, 'uuid'>>({
  name: joi.string().required(),
  address: joi.string().required(),
  version: joi.string().required(),
  state: joi.string().required(),
  interface: joi
    .object({
      type: joi.string().allow('REST').required(),
      value: joi.array().items(endpoint).required(),
    })
    .required(),
})
