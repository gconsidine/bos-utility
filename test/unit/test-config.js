/* jshint expr:true */

var bot = require('../../index'),
    expect = bot.expect;

describe('lib | config', function () {
    var config;

    beforeEach(function () {
        config = bot.expose('../../lib/config');
    });

    afterEach(function () {
        bot.flush();
    });

    it('merge | Should return config service with defaults if no external configs exist', function (done) {
        var inject = bot.expose('../../lib/inject');
        var injectConfig = bot.get(inject, 'injectConfig');
        var merge = bot.get(config, 'merge');

        injectConfig()
            .then(function () {
                return merge();
            })
            .then(function (configService) {
                expect(configService.get('logger').colors.info).to.equal('green');
                done();
            })
            .catch(done);
    });

    it('merge | Should layer configs so configs[n+1] overrides configs[n]', function (done) {
        var inject = bot.expose('../../lib/inject');
        var injectConfig = bot.get(inject, 'injectConfig');
        var merge = bot.get(config, 'merge');

        var cBot = {
            configs: [__dirname + '/../data/config.one.json', __dirname + '/../data/config.two.json']
        };

        injectConfig(cBot)
            .then(function () {
                return merge(cBot);
            })
            .then(function (configService) {
                expect(configService.get('logger').colors.silly).to.equal('orange');
                done();
            })
            .catch(done);
    });

    it('merge | Should layer configs so override object takes precedence', function (done) {
        var inject = bot.expose('../../lib/inject'),
            injectConfig = bot.get(inject, 'injectConfig'),
            merge = bot.get(config, 'merge');

        var cBot = {
            configs: [__dirname + '/../data/config.one.json', __dirname + '/../data/config.two.json']
        };

        var override = { logger: { colors: { silly: 'green' } } };

        injectConfig(cBot)
            .then(function () {
                return merge(cBot, override);
            })
            .then(function (configService) {
                expect(configService.get('logger').colors.silly).to.equal('green');
                done();
            })
            .catch(done);
    });

    it('merge | Should reject if decrypt fails', function (done) {
        var inject = bot.expose('../../lib/inject'),
            injectConfig = bot.get(inject, 'injectConfig'),
            merge = bot.get(config, 'merge'),
            decrypt = bot.get(config, 'decrypt');

        decrypt = function (fake, callback) {
            callback(new Error('decryption error'));
        };

        bot.set(config, 'decrypt', decrypt);

        injectConfig()
            .then(function () {
                return merge();
            })
            .catch(function (error) {
                expect(error).to.be.an.Error;
                done();
            });
    });

    it('merge | Should decrypt file if encrypted values are present', function () {
        var decrypt = bot.get(config, 'decrypt'),
            cfg = { key: '{aes-256-cbc}df8621cc02f7ac61b4faaf48c345e554=' };

        process.env.decryptionKey = 'secret';
        decrypt(cfg);

        expect(cfg.key).to.equal('value');
    });

    it('setSources | Should throw when configs property is not an array', function () {
        var setSources = bot.get(config, 'setSources');
        expect(setSources.bind(null, 'ugh')).to.throw(Error);
    });

    it('setSources | Should set empty array for configs property if not present', function () {
        var setSources = bot.get(config, 'setSources');
        var cBot = setSources();

        expect(cBot.configs).to.have.length(0);
    });

    it('setDefaultValues | Should populate config with BlueOak defaults', function () {
        bot.get(config, 'setDefaultValues')();
        var _config = bot.get(config, 'config');

        expect(_config.logger.colors.silly).to.equal('magenta');
    });
});

