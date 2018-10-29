const MilleFeuille = require('@frenchpastries/millefeuille')

const helloWorldHandler = request => ({
  statusCode: 200,
  headers: {},
  body: {
    content: 'Hello World from MilleFeuille!'
  }
})

const toJSONBody = handler => request => {
  const response = handler(request)
  const jsonResponse = {
    headers: {
      ...response.headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(response.body)
  }
  return { ...response,
    ...jsonResponse
  }
}


console.log('Server running at port 8080')
MilleFeuille.create(
  toJSONBody(helloWorldHandler)
)
