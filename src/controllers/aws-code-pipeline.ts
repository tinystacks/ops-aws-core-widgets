import {
  Controllers,
  Provider,
  TinyStacksError
} from '@tinystacks/ops-core';
import {
  CodePipeline,
  GetPipelineStateOutput,
  PipelineDeclaration
} from '@aws-sdk/client-codepipeline';
import { AwsCredentialsProvider } from '../aws-provider/aws-credentials-provider.js';
import { findProvider } from '../utils/utils.js';
import {
  AwsCodePipeline as AwsCodePipelineType
} from '../ops-types.js';
import {
  AwsCodePipeline as AwsCodePipelineModel,
  AwsCodePipelineOverrides
} from '../models/aws-code-pipeline.js';

import Widget = Controllers.Widget;

class AwsCodePipeline extends AwsCodePipelineModel implements Widget {
  static fromJson (object: AwsCodePipelineType): AwsCodePipeline {
    return new AwsCodePipeline(object);
  }

  async getData (providers?: Provider[], overrides: AwsCodePipelineOverrides = {}): Promise<void> {
    try {
      const {
        pipelineName = this.pipelineName,
        region = this.region,
        approval,
        startPipeline
      } = overrides;
      const awsCredentialsProvider = findProvider<AwsCredentialsProvider>(providers, AwsCredentialsProvider.type);
      const codePipelineClient = new CodePipeline({
        credentials: await awsCredentialsProvider.getCredentials(),
        region: region
      });

      if (approval) {
        const {
          actionName,
          stageName,
          status,
          token
        } = approval;
        await codePipelineClient.putApprovalResult({
          pipelineName,
          actionName,
          stageName,
          result: {
            status,
            summary: `${status} through Ops Console`
          },
          token
        });
      }
      if (startPipeline) {
        await codePipelineClient.startPipelineExecution({
          name: pipelineName
        });
      }
      const pipelineResponse = await codePipelineClient.getPipeline({
        name: this.pipelineName
      });
      const { pipeline = {}, metadata = {} } = pipelineResponse || {};
      const {
        name = this.pipelineName,
        stages = []
      } = pipeline as PipelineDeclaration;
      const pipelineState: GetPipelineStateOutput = await codePipelineClient.getPipelineState({
        name: this.pipelineName
      });
      this.pipeline = {
        name: name,
        arn: metadata.pipelineArn,
        stages: stages.map((stage) => {
          const stageState = pipelineState?.stageStates?.find(state => state.stageName === stage.name);
          return {
            name: stage.name,
            status: stageState?.latestExecution?.status,
            actions: stage.actions?.map((action) => {
              const actionState = stageState?.actionStates?.find(aState => aState.actionName === action.name);
              return {
                name: action.name,
                status: actionState?.latestExecution?.status,
                lastStatusChange: actionState?.latestExecution?.lastStatusChange,
                token: actionState?.latestExecution?.token,
                category: action.actionTypeId.category,
                provider: action.actionTypeId.provider,
                runOrder: action.runOrder
              };
            })
          };
        })
      };
    } catch (e: any) {
      console.error(e);
      throw TinyStacksError.fromJson({
        message: 'Failed to get Code Pipeline details!',
        status: e.status || e.$metadata?.status || 500,
        stack: e.stack
      });
    }
  }
}

export {
  AwsCodePipeline
};
export default AwsCodePipeline;