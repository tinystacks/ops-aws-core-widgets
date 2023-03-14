export function arnSplitter (arn: string) {
  if (!arn) return undefined;
  const splitArn = arn.split(':');
  if (arn.length < 6) return undefined;
  const arnMap: any = {
    partition: splitArn[1],
    service: splitArn[2],
    region: splitArn[3],
    account: splitArn[4],
    resourceType: splitArn[5]
  };

  if (arn.length > 6) {
    arnMap['resourceName'] = splitArn[6];
  }
  if (arn.length > 7) {
    arnMap['extra'] = splitArn[7];
  }
  return arnMap;
}

export function isArn (arn: string) {
  return arn.startsWith('arn:aws') && arn.split('').length >= 6;
}

export function cloudwatchLogsGroupArnToUrl (arn: string) {
  const splitArn = arnSplitter(arn);
  if (!splitArn) return '';
  return `https://${splitArn.region}.console.aws.amazon.com/cloudwatch/home?region=${splitArn.region}#logsV2:log-groups/log-group/${splitArn.resourceName}/log-events`;
}

export function ecsClusterArnToUrl (arn: string) {
  const splitArn = arnSplitter(arn);
  if (!splitArn) return '';
  const splitResourceType = splitArn.resourceType.split('/');
  let baseUrl =`https://${splitArn.region}.console.aws.amazon.com/ecs/v2/clusters/`;
  if (splitResourceType.length >= 2) {
    baseUrl = baseUrl + `${splitResourceType[1]}/services`;
  }

  return baseUrl;
}

export function ecsServiceArnToUrl (arn: string) {
  const splitArn = arnSplitter(arn);
  if (!splitArn) return '';
  const splitResourceType = splitArn.resourceType.split('/');
  let baseUrl =`https://${splitArn.region}.console.aws.amazon.com/ecs/v2/clusters/`;
  if (splitResourceType.length >= 3) {
    baseUrl += `${splitResourceType[1]}/services/${splitResourceType[2]}`;
  }

  return baseUrl;
}

export function ecsTaskDefinitionArnToUrl (arn: string) {
  const splitArn = arnSplitter(arn);
  if (!splitArn) return '';
  const splitResourceType = splitArn.resourceType.split('/');
  let baseUrl =`https://${splitArn.region}.console.aws.amazon.com/ecs/v2/task-definitions/`;
  if (splitResourceType.length >= 2) {
    baseUrl += `${splitResourceType[1]}/`;
  }
  if (splitArn.resourceName) {
    baseUrl += `${splitArn.resourceName}/`;    
  }

  return baseUrl;
}

export function roleArnToUrl (arn: string) {
  const splitArn = arnSplitter(arn);
  if (!splitArn) return '';
  const splitResourceType = splitArn.resourceType.split('/');
  // iam is global
  // TODO: partition aware
  let baseUrl ='https://us-east-1.console.aws.amazon.com/iamv2/home?region=us-east-1#/roles/';
  if (splitResourceType.length >= 2) {
    baseUrl += `details/${splitResourceType[1]}`;
  }

  return baseUrl;
}

export function asgArnToUrl (arn: string) {
  const splitArn = arnSplitter(arn);
  if (!splitArn) return '';
  let baseUrl = `https://${splitArn.region}.console.aws.amazon.com/ec2/home?region=${splitArn.region}#AutoScalingGroupDetails:`;
  if (splitArn.extra) {
    baseUrl += splitArn.extra.replace('autoScalingGroupName/', 'id=');
  }
  return baseUrl;
}