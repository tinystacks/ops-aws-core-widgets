import { AwsCredentialsProvider } from "../../../src/aws-provider/aws-credentials-provider.js";



describe('AwsCredentialsProvider', () => {
  describe('getCredentials', () => {
    it('should return credentials when using AwsKeys', async () => {
      const credentials = {
        AwsAccessKeyId: 'ACCESS_KEY',
        AwsSecretAccessKey: 'SECRET_ACCESS_KEY',
        AwsSessionToken: 'SESSION_TOKEN'
      };
      const provider = new AwsCredentialsProvider({ id: 'test', type: 'AwsKeysConfig', credentials, accountId: '1232', region: 'us-east-1' });
      const result = await provider.getCredentials();
      expect(result).toEqual({
        "accessKeyId": "ACCESS_KEY",
        "secretAccessKey": "SECRET_ACCESS_KEY",
        "sessionToken": "SESSION_TOKEN",
      });
    });
  });
  describe('getCliEnvironment', () => {
    it('should return the CLI environment variables with access key and secret key', async () => {
      const credentials = {
        AwsAccessKeyId: 'ACCESS_KEY',
        AwsSecretAccessKey: 'SECRET_ACCESS_KEY',
        AwsSessionToken: 'SESSION_TOKEN'
      };
      const provider = new AwsCredentialsProvider({ id: 'test', type: 'AwsKeysConfig', credentials, accountId: '1232', region: 'us-east-1' });
      const environment = await provider.getCliEnvironment();

      // Assert that the environment variables are correct
      expect(environment).toEqual({
        AWS_ACCESS_KEY_ID: 'ACCESS_KEY',
        AWS_SECRET_ACCESS_KEY: 'SECRET_ACCESS_KEY',
        AWS_SESSION_TOKEN: 'SESSION_TOKEN'
      });
    });
  });
});


