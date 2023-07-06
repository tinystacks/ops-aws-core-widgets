import React from 'react';
import { Views } from '@tinystacks/ops-core';
import { AwsJsonTree as AwsJsonTreeProps } from '../ops-types.js';
import { AwsJsonTree as AwsJsonTreeModel } from '../models/aws-json-tree.js';

import Widget = Views.Widget;

export class AwsJsonTree extends AwsJsonTreeModel implements Widget {
  static fromJson (object: AwsJsonTreeProps): AwsJsonTree {

    //TO-DO validate cloudControlType
    // Minimum length of 10. Maximum length of 196.
    //Pattern: [A-Za-z0-9]{2,64}::[A-Za-z0-9]{2,64}::[A-Za-z0-9]{2,64}
    return new AwsJsonTree(object);
  }

  render (): JSX.Element { return <>TODO</>;  }
}