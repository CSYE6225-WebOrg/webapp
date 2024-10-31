import AWS from 'aws-sdk';

AWS.config.update({
    region: process.env.AWS_REGION,
    credentials: new AWS.SharedIniFileCredentials({ profile: 'dev' })
  });

const s3 = new AWS.S3({
   region: process.env.AWS_REGION
});

// const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Upload File to S3
export const uploadFile = async (file, userId) => {
  const key = `user-images/${userId}/${file.originalname}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private'
  };
//   await s3.upload(params).promise();
const s3Upload = await s3.upload(params).promise();
  return s3Upload;
};

// Generate a Presigned URL to Get File from S3
export const getFileUrl = async (userId) => {
  const key = `user-images/${userId}/snowflake3.png`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: 3600 // URL is valid for 1 hour
  };
  return s3.getSignedUrlPromise('getObject', params);
};

// Delete File from S3
export const deleteFile = async (userId) => {
  const key = `user-images/${userId}/snowflake3.png`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };
  await s3.deleteObject(params).promise();
};
