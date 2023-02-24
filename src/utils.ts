import { BaseProvider } from '@tinystacks/ops-core';
import isEmpty from 'lodash.isempty';
import { AwsCredentialsProvider } from './aws-provider/aws-credentials-provider.js';

export function getAwsCredentialsProvider (providers?: BaseProvider[]): AwsCredentialsProvider {
  if (!providers || isEmpty(providers)) {
    throw new Error('No AwsCredentialsProvider provided');
  }

  const provider = providers[0];
  if (providers[0].type !== AwsCredentialsProvider.type) {
    throw new Error(`The passed in provider ${provider.id} is not an AwsCredentialsProvider`);
  }

  return provider as AwsCredentialsProvider;
}