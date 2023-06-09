import { Provider, Widget } from '@tinystacks/ops-model';
import { OutputLogEvent } from '@aws-sdk/client-cloudwatch-logs';

// Start Aws Credential Provider Types
export interface AwsKeys {
  AwsAccessKeyId: string;
  AwsSecretAccessKey: string;
  AwsSessionToken?: string;
}

export interface LocalAwsProfile {
  profileName: string;
}

export interface AwsAssumedRole {
  roleArn: string;
  sessionName: string;
  region: string;
  primaryCredentials: AwsCredentials;
  duration?: number;
}

export type AwsCredentials = AwsAssumedRole | AwsKeys | LocalAwsProfile;

export interface AwsCredentialsProvider extends Provider {
  credentials: AwsCredentials,
  accountId?: string,
  region?: string,
  cliEnv?: { [key: string]: string }
}
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

export interface AbsoluteTimeRange {
  startTime: number;
  endTime: number;
}

export interface RelativeTime {
  time: number;
  unit: TimeUnit;
}

export type TimeRange = AbsoluteTimeRange | RelativeTime;

export interface AwsCloudWatchLogs extends Widget {
  region: string,
  logGroupName: string,
  logStreamName?: string,
  timeRange: TimeRange,
  showTimeRangeSelector?: boolean;
  events?: OutputLogEvent[];
}
// End Aws CloudWatch Types

// Start CodePipeline Types
export interface PipelineAction {
  name: string;
  status: string;
  lastStatusChange?: Date;
  token?: string;
  category: string;
  provider: string;
  runOrder: number;
}

export interface StageAction extends PipelineAction {
  stageName: string;
}

export interface PipelineStage {
  name: string;
  status: string;
  actions: PipelineAction[]
}

export interface Pipeline {
  name: string;
  arn: string;
  stages: PipelineStage[]
}

export interface AwsCodePipeline extends Widget {
  pipelineName: string;
  region: string;
  pipeline?: Pipeline;
}
// End CodePipeline Types

export interface AwsEcsDeployments extends Widget {
  region: string;
  clusterName: string;
  serviceName: string;
}

export interface AwsEcsInfo extends Widget {
  region: string;
  clusterName: string;
  serviceName: string;
}

export interface AwsIamJson extends Widget {
  region: string,
  roleArn?: string,
  policyArn?: string,
}

export interface AwsJsonTree extends Widget {
  region: string,
  cloudControlType: string,
  resourceModel?: string,
  paths?: string[]
}

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface MetricData {
  value: number;
  unit: string;
  timestamp: number;
}

export interface Metric {
  metricNamespace: string;
  metricName: string;
  metricDisplayName: string;
  statistic?: string;
  dimensions: KeyValuePair[];
  data?: MetricData[];
}

export interface AwsCloudWatchMetricGraph extends Widget {
  region?: string;
  timeRange?: TimeRange;
  metrics: Metric[]
}