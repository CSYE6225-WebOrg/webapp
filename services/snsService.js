// import { SNSClient, PublishCommand } from 'aws-sdk/client-sns';
import AWS from 'aws-sdk';

const snsClient = new AWS.SNS({
    accessKeyId : process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRETS_KEY,
    region: process.env.AWS_REGION
});

export const sendVerificationLinkToLambda = async (email, verificationLink) => {
    const snsParams = {
      Message: JSON.stringify({
        email,
        verificationLink,
      }),
      TopicArn: process.env.SNS_TOPIC_ARN,
    }
  
    try {
        console
      console.log(snsParams);
     // const command = new AWS.PublishCommand(snsParams);
    //   const data = await snsClient.send(command);
    const data = await snsClient.publish(snsParams).promise();
      console.log('Verification link sent to Lambda:');
    } catch (error) {
      console.error('Error sending verification link to Lambda:', error);
    }
  }

  export default{
    sendVerificationLinkToLambda
  };