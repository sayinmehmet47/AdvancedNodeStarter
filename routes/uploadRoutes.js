const keys = require('../config/keys');
const AWS = require('aws-sdk');
const uuid = require('uuid/v1');
const requireLogin = require('../middlewares/requireLogin');

module.exports = (app) => {
  const s3 = new AWS.S3({
    credentials: {
      accessKeyId: keys.accessKeyId,
      secretAccessKey: keys.secretAccessKey,
    },
    region: 'eu-central-1',
  });

  app.get('/api/upload', requireLogin, (req, res) => {
    const key = `${req.user.id}/${uuid()}.jpeg`;

    s3.getSignedUrl(
      'putObject',
      {
        Bucket: 'sayin-bucket',
        ContentType: 'image/jpeg',
        Key: key,
      },
      (err, url) => res.send({ key, url, err })
    );
  });
};
