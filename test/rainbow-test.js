var assert = require('assert') ,
	Rainbow = require('../Rainbow')



function testBasic () {
	var rain = new Rainbow([0, 0, 0, 1], [255, 255, 255, 1])

	console.log(rain.checkpoints)


	assert.deepEqual(rain.checkpoints, [ 
		{pos: 0, color: [0, 0, 0, 1]}, 
		{pos: 1, color: [255, 255, 255, 1]}
	], "The constructor doesn't work!")
	

}

testBasic()