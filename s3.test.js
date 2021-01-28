var helpers = require('./helpers'),
  AWS = helpers.AWS,
  Stream = AWS.util.stream,
  buffer = AWS.util.buffer;

describe('AWS.S3', function () {
  var s3 = null;
  var request = function (operation, params) {
    return s3.makeRequest(operation, params);
  };
  var env = process.env;
  afterEach(function () {
    process.env = env;
  });
  beforeEach(function (done) {
    process.env = {};
    s3 = new AWS.S3({
      region: void 0
    });
    s3.clearBucketRegionCache();
    return done();
  });

  describe('s3 client retry behavior', function () {
    it('three retries by default', function (done) {
      let expectedDefaultRetries = 3;
      helpers.mockHttpResponse(400, {}, '<xml><Code>RequestTimeout</Code><Message>message</Message></xml>');
      s3.getObject(function (err, data) {
        expect(this.retryCount).to.equal(expectedDefaultRetries);
        done();
      });
    });
    it('retries by the specified amount', function (done) {
      let specifiedRetries = 5;
      s3.config.update({ maxRetries: specifiedRetries });
      helpers.mockHttpResponse(400, {}, '<xml><Code>RequestTimeout</Code><Message>message</Message></xml>');
      s3.getObject(function (err, data) {
        expect(this.retryCount).to.equal(specifiedRetries)
        done();
      })
    });
    it('three retries by default for a 503 slowdown error', function (done) {
      let expectedDefaultRetries = 3;
      helpers.mockHttpResponse(503, {}, '<xml><Code>SlowDown</Code><Message>Please Reduce your request rate.</Message></xml>');
      s3.getObject(function (err, data) {
        expect(this.retryCount).to.equal(expectedDefaultRetries);
        done();
      });
    });
  });
})
