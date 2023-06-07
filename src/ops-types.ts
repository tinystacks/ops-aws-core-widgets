import { Provider, Widget } from '@tinystacks/ops-model';
import { OutputLogEvent } from '@aws-sdk/client-cloudwatch-logs';

// Start Aws Credential Provider Types
export type AwsKeys = { 
  AwsAccessKeyId: string;
  AwsSecretAccessKey: string;
  AwsSessionToken?: string;
}

export type LocalAwsProfile = { 
  profileName: string;
};

export type AwsAssumedRole = {
  roleArn: string;
  sessionName: string;
  region: string;
  primaryCredentials: AwsCredentials;
  duration?: number;
}

export type AwsCredentials = AwsAssumedRole | AwsKeys | LocalAwsProfile;

export type AwsCredentialsProvider = Provider & {
  credentials: AwsCredentials,
  accountId?: string,
  region?: string,
  cliEnv?: { [key: string]: string }
};
// End Aws Credential Provider Types

// Start Aws CloudWatch Types
export enum TimeUnit {
  ns = 'ns',
  ms = 'ms',
  s = 's',
  m = 'm',
  hr = 'h',
  d = 'd',
  w = 'w',
  mo = 'mo',
  yr = 'yr'
}

export type AbsoluteTimeRange = {
  startTime: number;
  endTime: number;
}

export type RelativeTime = {
  time: number;
  unit: TimeUnit;
}

export type TimeRange = AbsoluteTimeRange | RelativeTime;

export type AwsCloudWatchLogs = Widget & {
  region: string,
  logGroupName: string,
  logStreamName?: string,
  timeRange: TimeRange,
  showTimeRangeSelector?: boolean;
  events?: OutputLogEvent[];
}
// End Aws CloudWatch Types

// Start CodePipeline Types
export type PipelineAction = {
  name: string;
  status: string;
  lastStatusChange?: Date;
  token?: string;
  category: string;
  provider: string;
  runOrder: number;
};

export type StageAction = PipelineAction & {
  stageName: string;
}

export type PipelineStage = {
  name: string;
  status: string;
  actions: PipelineAction[]
};

export type Pipeline = {
  name: string;
  arn: string;
  stages: PipelineStage[]
}

export type AwsCodePipeline = Widget & {
  pipelineName: string;
  region: string;
  pipeline?: Pipeline;
};
// End CodePipeline Types

export type AwsEcsDeployments = Widget & {
  region: string;
  clusterName: string;
  serviceName: string;
};

export type AwsEcsInfo = Widget & {
  region: string;
  clusterName: string;
  serviceName: string;
}

export type AwsIamJson = Widget & {
  region: string,
  roleArn?: string,
  policyArn?: string,
}

export type AwsJsonTree = Widget & {
  region: string,
  cloudControlType: string,
  resourceModel?: string,
  paths?: string[]
}

export type KeyValuePair = {
  key: string;
  value: string;
}

export type MetricData = {
  value: number;
  unit: string;
  timestamp: number;
}

export type Metric = {
  metricNamespace: string;
  metricName: string;
  metricDisplayName: string;
  statistic?: string;
  dimensions: KeyValuePair[];
  data?: MetricData[];
}

export type AwsCloudWatchMetricGraph = Widget & {
  region?: string;
  timeRange?: TimeRange;
  metrics: Metric[]
}