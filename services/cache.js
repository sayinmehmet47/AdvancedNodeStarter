const mongoose = require('mongoose');

const exec = mongoose.Query.prototype.exec;
const redis = require('redis');
const util = require('util');
const redisUrl = 'redis://127.0.0.1:6379';

const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

mongoose.Query.prototype.exec = async function (options = {}) {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  // See if we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key);

  // If we do, return that
  if (cacheValue) {
    console.log('SERVING FROM CACHE');
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map((d) => new this.model(d))
      : new this.model(doc);
  }

  // Otherwise, issue the query and store the result in redis

  const result = await exec.apply(this, arguments);
  console.log('SERVING FROM MONGODB');

  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
  return result;
};

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
};
