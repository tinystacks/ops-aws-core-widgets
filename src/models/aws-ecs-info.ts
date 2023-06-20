import { Models } from '@tinystacks/ops-core';
import { AwsEcsInfo as AwsEcsInfoProps } from '../ops-types.js';
import { Image } from '../utils/aws-ecs-utils.js';

import Widget = Models.Widget;

type AwsEcsInfoType = AwsEcsInfoProps & {
  serviceArn?: string;
  clusterArn?: string;
  runningCount?: number;
  desiredCount?: number;
  capacity?: number;
  asgArn?: string;
  asgName?: string;
  memory?: string;
  cpu?: string;
  taskDefinitionArn?: string,
  taskDefinitionVersion?: number,
  status?: string;
  roleArn?: string;
  execRoleArn?: string;
  images?: Image[];
  capacityType?: 'EC2' | 'Fargate';
}

class AwsEcsInfo extends Widget {
  static type = 'AwsEcsInfo';
  region: string;
  clusterName: string;
  serviceName: string;
  serviceArn: string;
  clusterArn: string;
  runningCount: number;
  desiredCount: number;
  capacity: number;
  asgArn: string;
  asgName: string;
  memory: string;
  cpu: string;
  taskDefinitionArn: string;
  taskDefinitionVersion: number;
  status: string;
  roleArn: string;
  execRoleArn: string;
  images: Image[];
  capacityType: 'EC2' | 'Fargate';

  constructor (props: AwsEcsInfoType) {
    super(props);
    this.region = props.region;
    this.clusterName = props.clusterName;
    this.serviceName = props.serviceName;
  }

  static fromJson (object: AwsEcsInfoType): AwsEcsInfo {
    const awsEcsInfo = new AwsEcsInfo(object);
    awsEcsInfo.serviceArn = object.serviceArn;
    awsEcsInfo.clusterArn = object.clusterArn;
    awsEcsInfo.runningCount = object.runningCount;
    awsEcsInfo.desiredCount = object.desiredCount;
    awsEcsInfo.capacity = object.capacity;
    awsEcsInfo.asgArn = object.asgArn;
    awsEcsInfo.asgName = object.asgName;
    awsEcsInfo.memory = object.memory;
    awsEcsInfo.cpu = object.cpu;
    awsEcsInfo.taskDefinitionArn = object.taskDefinitionArn;
    awsEcsInfo.taskDefinitionVersion = object.taskDefinitionVersion;
    awsEcsInfo.status = object.status;
    awsEcsInfo.roleArn = object.roleArn;
    awsEcsInfo.execRoleArn = object.execRoleArn;
    awsEcsInfo.images = object.images;
    awsEcsInfo.capacityType = object.capacityType;
    return awsEcsInfo;
  }

  toJson (): AwsEcsInfoType {
    return {
      ...super.toJson(),
      region: this.region,
      clusterName: this.clusterName,
      serviceName: this.serviceName,
      serviceArn: this.serviceArn,
      clusterArn: this.clusterArn,
      runningCount: this.runningCount,
      desiredCount: this.desiredCount,
      capacity: this.capacity,
      asgArn: this.asgArn,
      asgName: this.asgName,
      memory: this.memory,
      cpu: this.cpu,
      taskDefinitionArn: this.taskDefinitionArn,
      taskDefinitionVersion: this.taskDefinitionVersion,
      status: this.status,
      roleArn: this.roleArn,
      execRoleArn: this.execRoleArn,
      images: this.images,
      capacityType: this.capacityType
    };
  }
}

export {
  AwsEcsInfo,
  AwsEcsInfoType
};
export default AwsEcsInfo;