var qiniu = require('qiniu');
var defer = require('node-promise').defer;

var Qiniu = {
    init: function(config) {
        qiniu.conf.ACCESS_KEY = config['qiniu-ak'];
        qiniu.conf.SECRET_KEY = config['qiniu-sk'];
    },

    uploadToQiniu: function(bucketname, localfile, key){
        return this.uploadFile(localfile, key, this.uptoken(bucketname), bucketname);
    },

    uptoken: function(bucketname) {
        var putPolicy = new qiniu.rs.PutPolicy(bucketname);
        return putPolicy.token();
    },

    uploadFile(localfile, key, uptoken) {
        var deferred = new defer();
        var extra = new qiniu.io.PutExtra();
        extra.mimeType = "zip";
        qiniu.io.putFile(uptoken, key, localfile, extra, function(err, ret) {
            if(!err) {
                deferred.resolve(ret);
            } else {
                deferred.reject(err);
            }
        });
        return deferred.promise;
    }
}

module.exports = Qiniu;