/* jshint expr:true */

var bot = require('../../index'),
    expect = bot.expect;

describe('lib | rewire', function () {

    it('expose | Should require a module given a relative path', function () {
        var example = bot.expose('../data/example');
        expect(example.sum).to.be.a.function;
    });

    it('expose | Should use exported property as expected', function () {
        var example = bot.expose('../data/example');

        expect(example.sum(2, 2)).to.equal(4);
    });

    it('get | Should access a non-exported property', function () {
        var example = bot.expose('../data/example');
        var privateStuff = bot.get(example, 'privateStuff');

        expect(privateStuff).to.be.an.object;
    });

    it('get | Should access non-exported deeply nested property with string dot syntax', function () {
        var example = bot.expose('../data/example');
        var value = bot.get(example, 'privateStuff.deeply.nested.object.value');

        expect(value).to.equal('here');
    });

    it('set | Should set a value of a private property', function () {
        var example = bot.expose('../data/example');

        var replacement = 'there';

        bot.set(example, 'privateStuff.deeply.nested.object.value', replacement);
        var value = bot.get(example, 'privateStuff.deeply.nested.object.value');

        expect(value).to.equal('there');
    });
});

