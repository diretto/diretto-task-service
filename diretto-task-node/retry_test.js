var dns = require('dns');
var retry = require('./lib/dependencies/node-retry');

function faultTolerantResolve(address, cb) {
  var operation = retry.operation();

  operation.try(function(currentAttempt) {
    dns.resolve(address, function(err, addresses) {
      if (operation.retry(err)) {
        return;
      }

      cb(operation.mainError(), addresses);
    });
  });
}

faultTolerantResolve('nodejs.org', function(err, addresses) {
  console.log(err, addresses);
});
