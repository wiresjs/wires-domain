var domain = require('../../index.js');

domain.setAdapter(domain.adapters.Tiny);

var Shit = domain.models.BaseModel.extend({
    name: 'my_shit',
    schema: {
        id: {},
        header: {},
        desc: {}
    }
});

var loremIpsum = require('lorem-ipsum');



//setInterval(function(){

	console.log("calling")
	var shit = new Shit().find({id: 4500}).first(function(model){
		console.log("Got shit");
	});

//},5000)
/*
for (var i = 0; i <= 10000; i++) {


    var header = loremIpsum({
        count: 1,
        units: 'sentences',
        sentenceLowerBound: 5,
        sentenceUpperBound: 15,
        paragraphLowerBound: 3,
        paragraphUpperBound: 7,
        format: 'plain'
    });

    var desc = loremIpsum({
        count: 20,
        units: 'sentences',
        sentenceLowerBound: 5,
        sentenceUpperBound: 40,
        paragraphLowerBound: 3,
        paragraphUpperBound: 7,
        format: 'plain'
    });
    var shit = new Shit({
        header: header,
        desc: desc
    });
    shit.save();
}*/