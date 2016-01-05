var Promise = require('node-promise').Promise;
var agent = require('superagent');
var fs = require('fs');

function download(remotefile, localfile, type) {
    var promise = new Promise();
    var stream = fs.createWriteStream(localfile);
    agent("GET", remotefile)
    .type(type)
    .redirects(2)
    .pipe(stream);

    stream.on('finish', function() {
        promise.resolve(localfile);
    });
    return promise;
}

module.exports = {
    download: download
}