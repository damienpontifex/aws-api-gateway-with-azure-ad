#!/usr/bin/env node
import { join } from 'path';
import * as cdk from '@aws-cdk/core';
import * as api from '@aws-cdk/aws-apigatewayv2';
import * as authorizers from '@aws-cdk/aws-apigatewayv2-authorizers';
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as nodeLambda from '@aws-cdk/aws-lambda-nodejs';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const gatewayAuthorizer = new authorizers.HttpJwtAuthorizer({
      authorizerName: 'AzureAD',
      jwtAudience: ['api://3de0aab3-a2eb-47e4-b76c-0f1f8e70d959'],
      jwtIssuer: 'https://sts.windows.net/ff2b9041-8733-4fbd-a4e6-23f30567c4a4/',
    });

    const httpApi = new api.HttpApi(this, 'HttpApi', {
      defaultAuthorizer: gatewayAuthorizer,
    });

    const loggingFn = new nodeLambda.NodejsFunction(this, 'test', {
      entry: join(__dirname, './logger-lambda/handler.ts'),
    });

    httpApi.addRoutes({
      path: '/test',
      methods: [ api.HttpMethod.GET, ],
      integration: new integrations.LambdaProxyIntegration({
	handler: loggingFn,
      }),
      authorizationScopes: [ 'LambdaApi.Read', ],
    });

    new cdk.CfnOutput(this, 'ApiGatewayUrl', {
      value: httpApi.url || '',
      description: 'The https endpoint of the API gateway',
    });
  }
}

const app = new cdk.App();
new InfrastructureStack(app, 'InfrastructureStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
