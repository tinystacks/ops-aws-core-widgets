import AWS from "aws-sdk";
import AwsKeys from "../../src/credential-providers/aws-keys";

const mockV2Credentials = new AWS.Credentials({
  accessKeyId: 'test-access-key',
  secretAccessKey: 'test-secret-key',
  sessionToken: 'test-session-token'
});

describe('getV2Credentials', () => {
  afterEach(() => {
    // for mocks
    jest.clearAllMocks();
    // for spies
    jest.restoreAllMocks();
  });

  it('creates credentials', async () => {
    const awsKeys = new AwsKeys('test-access-key', 'test-secret-key', 'test-session-token');
    const result = await awsKeys.getV2Credentials();
    expect(result).toEqual(mockV2Credentials);   
  });
});