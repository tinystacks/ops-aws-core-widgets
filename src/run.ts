// import { AwsCredentialsProvider } from "./aws-provider/aws-credentials-provider";
// import { LocalAwsProfile } from "./aws-provider/aws-credentials/local-aws-profile";
// // import { AwsEcsDeployments } from "./aws-widgets/aws-ecs-deployments";
// import { AwsEcsInfo } from "./aws-widgets/aws-ecs-info";

// const awsCredentialsProvider = new AwsCredentialsProvider({
//   credentials: new LocalAwsProfile({
//     profileName: 'ts'
//   })
// });

// const awsEcsInfo = new AwsEcsInfo({
//   region: 'us-east-1',
//   accountId: '',
//   clusterName: 'synth-synth-dev-849087520365-us-east-1-synthsynthdevecscluterCF811BA97-XV2a9zhcwSz9',
//   serviceName: 'synth-synth-dev-849087520365-us-east-1-synthsynthdevsynthdevserviceServiceF5E8D490-5GF69ndho4pF',
//   displayName: '',
//   providerId: '',
//   type: ''
// });

// awsEcsInfo.provider = awsCredentialsProvider;

// awsEcsInfo.getData();

// // const awsEcsDeployments = new AwsEcsDeployments({
// //     region: 'us-east-1',
// //     accountId: '',
// //     clusterName: 'synth-synth-dev-849087520365-us-east-1-synthsynthdevecscluterCF811BA97-XV2a9zhcwSz9',
// //     serviceName: 'synth-synth-dev-849087520365-us-east-1-synthsynthdevsynthdevserviceServiceF5E8D490-5GF69ndho4pF',
// //     displayName: '',
// //     providerId: '',
// //     type: ''
// // });
  
// // awsEcsDeployments.provider = awsCredentialsProvider;

// // awsEcsDeployments.getData();