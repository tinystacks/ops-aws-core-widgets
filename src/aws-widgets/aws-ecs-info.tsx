import React from 'react';
import { HStack, Link, Stack, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { Widget } from '@tinystacks/ops-model';
import {
  ECS,
  DescribeTaskDefinitionCommandOutput,
  DescribeCapacityProvidersCommandOutput
} from '@aws-sdk/client-ecs';
import { STS } from '@aws-sdk/client-sts';
import _ from 'lodash';
import { BaseProvider, BaseWidget } from '@tinystacks/ops-core';
import { getAwsCredentialsProvider } from '../utils/utils.js';
import { getCoreEcsData, hydrateImages, Image } from '../utils/aws-ecs-utils.js';
import EcsPortsModal from '../components/ecs-ports-modal.js';
import EcsEnvVarsModal from '../components/ecs-env-vars-modal.js';
import { asgArnToUrl, cloudwatchLogsGroupArnToUrl, ecsClusterArnToUrl, ecsServiceArnToUrl, ecsTaskDefinitionArnToUrl } from '../utils/arn-utils.js';
import KeyValueStat from '../components/key-value-stat.js';

type AwsEcsInfoProps = Widget & {
  region: string,
  clusterName: string,
  serviceName: string
}

type AwsEcsInfoType = AwsEcsInfoProps & {
  serviceArn: string;
  clusterArn: string;
  runningCount: number;
  desiredCount: number;
  capacity: number;
  asgArn: string;
  memory: string;
  cpu: string;
  taskDefinitionArn: string,
  status: string;
  roleArn: string;
  execRoleArn: string;
  images: Image[];
  capacityType: 'EC2' | 'Fargate';
}

export class AwsEcsInfo extends BaseWidget {
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
  memory: string;
  cpu: string;
  taskDefinitionArn: string;
  status: string;
  roleArn: string;
  execRoleArn: string;
  images: Image[];
  capacityType: 'EC2' | 'Fargate';

  constructor (props: AwsEcsInfoProps) {
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
    awsEcsInfo.memory = object.memory;
    awsEcsInfo.cpu = object.cpu;
    awsEcsInfo.taskDefinitionArn = object.taskDefinitionArn;
    awsEcsInfo.status = object.status;
    awsEcsInfo.roleArn = object.roleArn;
    awsEcsInfo.execRoleArn = object.execRoleArn;
    awsEcsInfo.images = object.images;
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
      memory: this.memory,
      cpu: this.cpu,
      taskDefinitionArn: this.taskDefinitionArn,
      status: this.status,
      roleArn: this.roleArn,
      execRoleArn: this.execRoleArn,
      images: this.images,
      capacityType: this.capacityType
    };
  }

  async getData (providers?: BaseProvider[]): Promise<void> {
    const awsCredentialsProvider = getAwsCredentialsProvider(providers);
    const credentials = await awsCredentialsProvider.getCredentials();
    const stsClient = new STS({
      credentials: credentials,
      region: this.region
    });
    const accountId = await stsClient.getCallerIdentity({}).then(res => res.Account).catch(e => console.error(e)) || '';
    const ecsClient = new ECS({
      credentials,
      region: this.region
    });
    const {
      service,
      cluster
    } = await getCoreEcsData(ecsClient, this.clusterName, this.serviceName);
   
    const primaryDeployment = service?.deployments?.find((deployment) => {
      return deployment.status === 'PRIMARY';
    });
    this.taskDefinitionArn = primaryDeployment?.taskDefinition;
    this.serviceArn = service?.serviceArn;
    this.clusterArn = service?.clusterArn;
    this.runningCount = service?.runningCount;
    this.desiredCount = service?.desiredCount;
    this.status = service?.status;
    this.roleArn = service?.roleArn;

    const promises = [];
    promises.push(ecsClient.describeTaskDefinition({
      taskDefinition: service?.taskDefinition
    }));
    promises.push(ecsClient.describeCapacityProviders({
      capacityProviders: [_.get(cluster, 'defaultCapacityProviderStrategy[0].capacityProvider')]
    }));
    const secondarySettledPromises = (await Promise.allSettled(promises)).map((promise) => {
      if (promise.status === 'fulfilled') {
        return promise.value;
      }
      console.error(promise.reason);
      return undefined;
    });
    const describeTaskDefinitionRes = secondarySettledPromises[0] as DescribeTaskDefinitionCommandOutput;
    const describeCapacityProvidersRes = secondarySettledPromises[1] as DescribeCapacityProvidersCommandOutput;

    const taskDefinition = describeTaskDefinitionRes?.taskDefinition;
    this.memory = taskDefinition?.memory;
    this.cpu = taskDefinition?.cpu;
    this.execRoleArn = taskDefinition?.executionRoleArn;

    const capacityProvider = _.get(describeCapacityProvidersRes, 'capacityProviders[0]');
    this.asgArn = capacityProvider?.autoScalingGroupProvider?.autoScalingGroupArn;
    this.capacity = capacityProvider?.autoScalingGroupProvider?.managedScaling?.targetCapacity | this.desiredCount;
    this.capacityType = capacityProvider?.autoScalingGroupProvider ? 'EC2' : 'Fargate';

    this.images = hydrateImages(taskDefinition, accountId);
  }

  render (): JSX.Element {
    const imageRows = this.images?.map((image) => {
      return (
        <Tr>
          <Td>{image?.containerId}</Td>
          <Td>
            <EcsPortsModal image={image} />
          </Td>
          <Td>
            <EcsEnvVarsModal image={image} />
          </Td>
          <Td>{(image.volumes || []).map(v => v.name).join(', ')}</Td>
          <Td><Link color='purple' href={cloudwatchLogsGroupArnToUrl(image.cwLogsGroupArn)} target='_blank'>View logs</Link></Td>
        </Tr>
      );
    });
    return (
      <Stack p='20px'>
        <HStack alignItems='start'>
          <KeyValueStat
            label='Cluster Arn'
            value={this.clusterArn}
            href={ecsClusterArnToUrl(this.clusterArn)}
          />
          <KeyValueStat
            label='Service Arn'
            value={this.serviceArn}
            href={ecsServiceArnToUrl(this.serviceArn)}
          />
          <KeyValueStat
            label='Tasks Running/Desired'
            value={`${this.runningCount}/${this.desiredCount}`}
          />
          <KeyValueStat
            label='Active Task Def Id'
            value={this.taskDefinitionArn}
            href={ecsTaskDefinitionArnToUrl(this.taskDefinitionArn)}
          />
        </HStack>
        <HStack pl='20px' pr='20px'>
          <KeyValueStat
            label='Provisioned CPU'
            value={this.cpu}
          />
          <KeyValueStat
            label='Provisioned Memory'
            value={this.memory}
          />
          <KeyValueStat
            label='Capacity'
            value={`${this.capacity} (${this.capacityType})`}
          />
          {
            this.asgArn && 
              <KeyValueStat
                label='ASG'
                value={this.asgArn}
                href={asgArnToUrl(this.asgArn)}
              />
          }
        </HStack>
        <TableContainer border='1px' borderRadius='6px' borderColor='gray.100'>
          <Table variant="simple">
            <Thead bgColor='gray.50'>
              <Tr>
                <Th>Container Id</Th>
                <Th>Port Mappings</Th>
                <Th>Environment Variables</Th>
                <Th>Volumes</Th>
                <Th>View logs</Th>
              </Tr>
            </Thead>
            <Tbody>
              {imageRows}
            </Tbody>
          </Table>
        </TableContainer>
      </Stack>
    );
  }
}