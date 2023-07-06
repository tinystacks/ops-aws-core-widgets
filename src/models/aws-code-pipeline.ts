import { Models } from '@tinystacks/ops-core';
import { ApprovalStatus } from '@aws-sdk/client-codepipeline';
import {
  AwsCodePipeline as AwsCodePipelineType,
  Pipeline
} from '../ops-types.js';

import Widget = Models.Widget;

type AwsCodePipelineOverrides = {
  pipelineName?: string;
  region?: string;
  approval?: {
    stageName: string;
    actionName: string;
    status: ApprovalStatus;
    token: string;
  };
  startPipeline?: boolean;
};

class AwsCodePipeline extends Widget implements AwsCodePipelineType {
  static type = 'AwsCloudWatchLogs';
  pipelineName: string;
  region: string;
  pipeline?: Pipeline;

  constructor (props: AwsCodePipelineType) {
    super(props);
    this.pipelineName = props?.pipelineName;
    this.region = props?.region;
    this.pipeline = props?.pipeline;
  }

  static fromJson (object: AwsCodePipelineType): AwsCodePipeline {
    return new AwsCodePipeline(object);
  }

  toJson (): AwsCodePipelineType {
    return {
      ...super.toJson(),
      region: this.region,
      pipelineName: this.pipelineName,
      pipeline: this.pipeline
    };
  }
}

export {
  AwsCodePipeline,
  AwsCodePipelineOverrides
};
export default AwsCodePipeline;