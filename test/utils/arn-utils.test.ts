import { arnSplitter } from '../../src/utils/arn-utils.js';

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
});