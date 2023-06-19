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

/**
 * @example
 * ```yaml
 * AwsProvider:
    type: AwsCredentialsProvider
    credentials:
      roleArn: arn:aws:iam::123456789012:role/OrganizationAccountAccessRole
      sessionName: ops-console
      region: us-east-1
      primaryCredentials:
        profileName: default
 * ```
 */
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

/**
 * @example
 * ```yaml
 * Logs:
    type: AwsCloudWatchLogs
    displayName: Service Logs
    region: us-east-1
    providers:
      - $ref: '#/Console/providers/AwsProvider'
    logGroupName: 
      $ref: '#/Console/widgets/EcsInfo'
      path: images[0].cwLogsGroupArn
    timeRange:
      time: 12
      unit: h
 * ```
 */
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

/**
 * @example
 * ```yaml
 * CodePipeline:
    type: AwsCodePipeline
    displayName: Code Pipeline
    pipelineName: my-code-pipeline-name
    region: $const.region
    providers:
      - $ref: '#/Console/providers/AwsProvider'
 * ```
 */
export interface AwsCodePipeline extends Widget {
  pipelineName: string;
  region: string;
  pipeline?: Pipeline;
}
// End CodePipeline Types

/**
 * @example
 * ```yaml
 * EcsDeployments:
    type: AwsEcsDeployments
    displayName: Service Deployments
    providers:
      - $ref: '#/Console/providers/AwsProvider'
    region:
      $ref: '#/Console/widgets/EcsInfo'
      path: region
    clusterName:
      $ref: '#/Console/widgets/EcsInfo'
      path: clusterName
    serviceName:
      $ref: '#/Console/widgets/EcsInfo'
      path: serviceName
 * ```
 */
export interface AwsEcsDeployments extends Widget {
  region: string;
  clusterName: string;
  serviceName: string;
}

/**
 * @example
 * ```yaml
 * EcsInfo:
    type: AwsEcsInfo
    displayName: Service Information
    providers:
      - $ref: '#/Console/providers/AwsLocalProvider'
    region: $param.region
    clusterName: $param.clusterName
    serviceName: $param.serviceName
 * ```
 */
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

/**
 * @example
 * ```yaml
 * CPUMetrics:
    type: AwsCloudWatchMetricGraph
    displayName: CPU Utilization Details
    region:
      $ref: '#/Console/widgets/EcsInfo'
      path: region
    period: 300
    providers:
      - $ref: '#/Console/providers/AwsProvider'
    timeRange:
      time: 1
      unit: h
    metrics:
      - metricNamespace: AWS/ECS
        metricName: CPUUtilization
        metricDisplayName: 'Average'
        statistic: Average
        dimensions:
          - key: ClusterName
            value: $param.clusterName
          - key: ServiceName
            value: $param.serviceName
      - metricNamespace: AWS/ECS
        metricName: CPUUtilization
        metricDisplayName: 'Max'
        statistic: Maximum
        dimensions:
          - key: ClusterName
            value: $param.clusterName
          - key: ServiceName
            value: $param.serviceName
      - metricNamespace: AWS/ECS
        metricName: CPUUtilization
        metricDisplayName: 'Min'
        statistic: Minimum
        dimensions:
          - key: ClusterName
            value: $param.clusterName
          - key: ServiceName
            value: $param.serviceName
 * ```
 */
export interface AwsCloudWatchMetricGraph extends Widget {
  region?: string;
  timeRange?: TimeRange;
  metrics: Metric[]
}