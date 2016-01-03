var qiniu = require('qiniu');
var Promise = require('node-promise').Promise;

var Qiniu = {
    init: function(config) {
        qiniu.conf.ACCESS_KEY = config.qiniu_ak;
        qiniu.conf.SECRET_KEY = config.qiniu_sk;
    },

    uploadToQiniu: function(bucketname, localfile, key){
        return this.uploadFile(localfile, key, this.uptoken(bucketname), bucketname);
    },

    uptoken: function(bucketname) {
        var putPolicy = new qiniu.rs.PutPolicy(bucketname);
        return putPolicy.token();
    },

    uploadFile(localfile, key, uptoken) {
        console.log(localfile);
        var promise = new Promise();
        var extra = new qiniu.io.PutExtra();
        extra.mimeType = "zip";
        qiniu.io.putFile(uptoken, key, localfile, extra, function(err, ret) {
            if(!err) {
                promise.resolve(ret);
            } else {
                promise.reject(err);
            }
        });
        return promise;
    }
}

module.exports = Qiniu;