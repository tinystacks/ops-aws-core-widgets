import { arnSplitter, cloudwatchLogsGroupArnToUrl, ecsClusterArnToUrl, ecsServiceArnToUrl, ecsTaskDefinitionArnToUrl, roleArnToUrl, asgArnToUrl } from '../../src/utils/arn-utils.js';

describe('arn-utils', () => {
  describe('arnSplitter', () => {
    it('returns undefined when empty or too short', () => {
      // @ts-ignore
      expect(arnSplitter()).toBeUndefined();
      expect(arnSplitter('')).toBeUndefined();
      expect(arnSplitter('arn:aws:')).toBeUndefined();
    });

    it ('normal length arn returns basic arn', () => {
      expect(arnSplitter('arn:aws:example:us-east-1:12345:cluster')).toStrictEqual({
        partition: 'aws',
        service: 'example',
        region: 'us-east-1',
        account: '12345',
        resourceType: 'cluster',
        resourceName: undefined,
        extra: undefined
      });
    }); 

    it ('extra length arns return correct structure', () => {
      expect(arnSplitter('arn:aws:example:us-east-1:12345:cluster:exampleCluster')).toStrictEqual({
        partition: 'aws',
        service: 'example',
        region: 'us-east-1',
        account: '12345',
        resourceType: 'cluster',
        resourceName: 'exampleCluster',
        extra: undefined
      });

      expect(arnSplitter('arn:aws:example:us-east-1:12345:cluster:exampleCluster:extra')).toStrictEqual({
        partition: 'aws',
        service: 'example',
        region: 'us-east-1',
        account: '12345',
        resourceType: 'cluster',
        resourceName: 'exampleCluster',
        extra: 'extra'
      });
    }); 
  });

  describe('isArn', () => {
    it('correctly assesses isArn', () => {
      expect(arnSplitter('')).toBeFalsy();
      expect(arnSplitter('arn:aws:')).toBeFalsy();
      expect(arnSplitter('arn:aws:rds:us-east-1:12345:cluster')).toBeTruthy();
    });
  });

  describe('cloudwatchLogsGroupArnToUrl', () => {
    it('returns the correct URL for a CloudWatch Logs group ARN', () => {
      const arn = 'arn:aws:logs:us-east-1:123456789012:log-group:my-log-group:*';
      const expectedUrl = 'https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/my-log-group/log-events';
      expect(cloudwatchLogsGroupArnToUrl(arn)).toEqual(expectedUrl);
    });

    it('returns an empty string for an invalid ARN', () => {
      const arn = 'not-an-arn';
      expect(cloudwatchLogsGroupArnToUrl(arn)).toEqual('');
    });
  });

  describe('ecsClusterArnToUrl', () => {
    it('returns the correct URL for an ECS cluster ARN without a service', () => {
      const arn = 'arn:aws:ecs:us-east-1:123456789012:cluster/my-cluster';
      const expectedUrl = 'https://us-east-1.console.aws.amazon.com/ecs/v2/clusters/my-cluster/services';
      expect(ecsClusterArnToUrl(arn)).toEqual(expectedUrl);
    });

    it('returns an empty string for an invalid ARN', () => {
      const arn = 'not-an-arn';
      expect(ecsClusterArnToUrl(arn)).toEqual('');
    });
  });

  describe('ecsServiceArnToUrl', () => {
    it('returns the correct URL for an ECS service ARN', () => {
      const arn = 'arn:aws:ecs:us-east-1:123456789012:service/my-cluster/my-service';
      const expectedUrl = 'https://us-east-1.console.aws.amazon.com/ecs/v2/clusters/my-cluster/services/my-service';
      expect(ecsServiceArnToUrl(arn)).toEqual(expectedUrl);
    });

    it('returns an empty string for an invalid ARN', () => {
      const arn = 'not-an-arn';
      expect(ecsServiceArnToUrl(arn)).toEqual('');
    });
  });

  describe('ecsTaskDefinitionArnToUrl', () => {
    it('returns the correct URL', () => {
      const arn = 'arn:aws:ecs:us-east-1:123456789012:task-definition/my-task:1';
      const expectedUrl = 'https://us-east-1.console.aws.amazon.com/ecs/v2/task-definitions/my-task/1/';
      expect(ecsTaskDefinitionArnToUrl(arn)).toEqual(expectedUrl);
    });
  
    it('returns an empty string if the ARN is invalid', () => {
      expect(ecsTaskDefinitionArnToUrl('invalid-arn')).toEqual('');
    });
  });
  
  describe('roleArnToUrl', () => {
  it('should return the expected url', () => {
    const arn = 'arn:aws:iam::123456789012:role/test-role';
    const expectedUrl = 'https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/roles/details/test-role';
    expect(roleArnToUrl(arn)).toBe(expectedUrl);
  });

  it('should return an empty string for invalid input', () => {
    expect(roleArnToUrl('')).toBe('');
    expect(roleArnToUrl('invalid-arn')).toBe('');
  });
  });

  describe('asgArnToUrl', () => {
    it('returns empty string for invalid ARN', () => {
      expect(asgArnToUrl('invalid-arn')).toBe('');
    });
  
    it('returns correct URL for valid ARN with extra parameter', () => {
      const arn = 'arn:aws:autoscaling:us-west-2:123456789012:autoScalingGroup:890abcdef1234567890abcde:autoScalingGroupName/testing-testing';
      const expectedUrl = 'https://us-west-2.console.aws.amazon.com/ec2/home?region=us-west-2#AutoScalingGroupDetails:id=testing-testing';
      expect(asgArnToUrl(arn)).toBe(expectedUrl);
    });
  
    it('returns correct URL for valid ARN without extra parameter', () => {
      const arn = 'arn:aws:autoscaling:us-east-1:123456789012:autoScalingGroup:890abcdef1234567890abcde';
      const expectedUrl = 'https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#AutoScalingGroupDetails:';
      expect(asgArnToUrl(arn)).toBe(expectedUrl);
    });
  });7   


});