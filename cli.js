#! /usr/bin/env node

'use strict';
const meow = require('meow');
const deploy = require('./');
const extend = require('util')._extend;
const fs = require('fs');
const path = require('path');

const cli = meow({
    version: false,
    description: `
        --name 最后生成的文件名
        --version -v 版本号
        --user github用户名
        --password github密码
        --owner github repo的拥有者(有时候提交人和库的拥有者可能不一样)
        --repo github repo 的名字
        --no-release 如果有这个选项就会在github上发版
        --releases 需要release的分支这里是个数组'master, pod'
        --qiniu-ak 七牛ak
        --qiniu-sk 七牛sk
        --qiniu-buckect 七牛 buckect
        --desc 创建版本的时候的描述
`}, {
    alias: {
        v: 'version'
    }
});

var readOptionsJSON = function () {
    var optionPath = path.resolve(__dirname, '.bugtagsrc');
    var data = {};
    try{
        data = JSON.parse(fs.readFileSync(optionPath, {encoding: 'utf-8'}))
    } catch(e) {
        return data;
    }
    return data;
}

var checkKeys = function(bugtagsrc) {
    var keys = ['name', 'version', 'user', 'password', 'owner', 'repo', 
    ,'branches', 'qiniu-ak', 'qiniu-sk', 'qiniu-buckect'];
    keys.map(function(key){
        if (bugtagsrc[key] === undefined){
            console.log("no options " + key + " in commandline arg or .bugtagsrc");
            process.exit(1);
        }
    });
    return bugtagsrc;
}

deploy(
    checkKeys(
        extend(readOptionsJSON(), cli.flags)
    )
);