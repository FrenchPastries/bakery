const Arrange = require('@frenchpastries/arrange')

const jsonResponse = handler => (
  Arrange.jsonBody(
    Arrange.jsonContentType(
      handler
    )
  )
)

const parseBody = handler => request => {
  const newRequest = {
    ...request,
    body: JSON.parse(request.body)
  }
  return handler(newRequest)
}

module.exports = {
  jsonResponse,
  parseBody,
}
