import React from 'react';
import isNil from 'lodash.isnil';
import { Views, TinyStacksError } from '@tinystacks/ops-core';
import { AwsIamJson as AwsIamJsonProps } from '../ops-types.js';
import { AwsIamJson as AwsIamJsonModel } from '../models/aws-iam-json.js';

import Widget = Views.Widget;

export class AwsIamJson extends AwsIamJsonModel implements Widget {
  static fromJson (object: AwsIamJsonProps): AwsIamJson {
    if(isNil(object.roleArn) && isNil(object.policyArn)){ 
      throw TinyStacksError.fromJson({
        message: 'Either role arn or policy arn must be defined for IAM Json Widget',
        status: 400
      });
    }

    return new AwsIamJson(object);
  }

  render (): JSX.Element { return <>TODO</>; }
}