var GithubApi = require('github');
var Promise = require('node-promise').Promise;

Github = {
    init: function(config) {
        this.github = new GithubApi(this.githubConf);
        this.github.authenticate({
            type: 'basic',
            username: config.user,
            password: config.password
        });
        this.repo = config.repo;
        this.owner = config.owner;
    },

    getBranches: function(branches) {
        var promise = new Promise(),
            data = {};
        data.owner = this.owner;
        data.repo = this.repo;
        this.github.repos.getBranches(data, 
            this.promiseCallBack(promise));
        return promise;
    },

    createRelease: function(data){
        var promise = new Promise();
        console.log(data);
        data.repo = this.repo;
        data.owner = this.owner;
        this.github.releases.createRelease(data, this.promiseCallBack(promise));
        return promise;
    },

    promiseCallBack: function(promise) {
        return function(err, data) {
            if (err) {
                promise.reject(err, data);
            } else {
                promise.resolve(data);
            }
        }
    },

    githubConf: {
        version: "3.0.0",
        debug: false,    
        protocol: "https",
        host: "api.github.com",
        timeout: 5000,
        header: {
            "user-agent": "bugtags-demo-cli"
        }
    }
}

module.exports = Github;