import { APIGatewayProxyHandlerV2, } from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = async (event, _context) => {
  const jwt = event.requestContext.authorizer?.jwt;
  const name = jwt?.claims['name'];
  console.log(JSON.stringify(event.requestContext.authorizer?.jwt));
  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Hello ${name}` }),
  };
};

