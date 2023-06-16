import { Models } from '@tinystacks/ops-core';
import { AwsEcsDeployments as AwsEcsDeploymentsProps } from '../ops-types.js';
import { Image } from '../utils/aws-ecs-utils.js';

import Widget = Models.Widget;

type Task = {
  taskId?: string;
  startTime?: Date;
  stopTime?: Date;
  status?: string;
  group?: string;
  version?: number;
  cwLogsArn?: string;
};

type TaskDefinition = {
  taskDefinitionArn?: string;
  cpu?: string;
  memory?: string;
  roleArn?: string;
  execRoleArn?: string;
  containers?: Image[];
  tasks?: Task[];
};

type Deployment = {
  deploymentId?: string;
  status?: string;
  startTime?: Date;
  runningCount?: number;
  pendingCount?: number;
  desiredCount?: number;
  taskDefinition?: TaskDefinition;
};

type AwsEcsDeploymentsType = AwsEcsDeploymentsProps & {
  deployments?: Deployment[];
};

type AwsEcsDeploymentsOverrides = {
  stoppedTaskId?: string;
};

class AwsEcsDeployments extends Widget implements AwsEcsDeploymentsType {
  static type = 'AwsEcsDeployments';
  region: string;
  clusterName: string;
  serviceName: string;
  deployments?: Deployment[];

  constructor (props: AwsEcsDeploymentsType) {
    super(props);
    this.region = props.region;
    this.clusterName = props.clusterName;
    this.serviceName = props.serviceName;
    this.deployments = props.deployments || [];
  }

  static fromJson (object: AwsEcsDeploymentsType): AwsEcsDeployments {
    return new AwsEcsDeployments(object);
  }

  toJson (): AwsEcsDeploymentsType {
    return {
      ...super.toJson(),
      region: this.region,
      clusterName: this.clusterName,
      serviceName: this.serviceName,
      deployments: this.deployments
    };
  }
}

export {
  AwsEcsDeployments,
  AwsEcsDeploymentsOverrides,
  AwsEcsDeploymentsType,
  Deployment,
  TaskDefinition,
  Task
};
export default AwsEcsDeployments;