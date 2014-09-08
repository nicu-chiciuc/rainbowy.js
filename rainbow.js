
var Rainbow = (function () {	

	var Rainbow = (function () {
			
	})()

	var RainbowCore = (function () {
		function RainbowCore (startColor, endColor) {
			RainbowCore.checkGoodColor(startColor)
			RainbowCore.checkGoodColor(endColor)

			this.colors = [startColor, endColor]
			this.checkpoints = [0, 1]
			
			this.transitionFunc = [ Utils.identityFunc ]

		}	

		RainbowCore.prototype.getColorAt = function (pos) {
			RainbowCore.checkGoodPos(pos)

			var floorCheckpoint = this.getFloorCheckpoint(pos)
			var startColor = this.colors[ floorCheckpoint ]
			var endColor = this.colors[ floorCheckpoint + 1 ]
			var realPos = Utils.invApplyPosition(pos, this.checkpoints[floorCheckpoint], this.checkpoints[floorCheckpoint+1])

			var retColor = [
				Utils.applyPosition( realPos, startColor[0], endColor[0], this.transitionFunc[floorCheckpoint] ) ,
				Utils.applyPosition( realPos, startColor[1], endColor[1], this.transitionFunc[floorCheckpoint] ) ,
				Utils.applyPosition( realPos, startColor[2], endColor[2], this.transitionFunc[floorCheckpoint] ) ,
				Utils.applyPosition( realPos, startColor[3], endColor[3], this.transitionFunc[floorCheckpoint] ) ,
			]

			return retColor
		}

		RainbowCore.prototype.putColorAt = function (pos, color, func) {
			RainbowCore.checkGoodPos(pos)

			func = func || Utils.identityFunc

			var floorCheckpoint = this.getFloorCheckpoint(pos)
			this.colors.splice(floorCheckpoint+1, 0, color)
			this.checkpoints.splice(floorCheckpoint+1, 0, pos)
			this.transitionFunc.splice(floorCheckpoint+1, 0, func)
		}

		RainbowCore.prototype.getFloorCheckpoint = function (pos) {
			RainbowCore.checkGoodPos(pos)

			for (var i = 0, len = this.checkpoints.length; i < len; i++)
				if (this.checkpoints[i] > pos)
					return i-1
		}

		RainbowCore.checkGoodPos = function (pos) {
			if (pos < 0 || pos > 1)
				throw new Error("A good position should be between 0 and 1")
		}

		RainbowCore.checkGoodColor = function (color) {
			if (!(Array.isArray(color) && color.length == 4))
				throw new Error("Invalid color, a color should be an array with exactly 4 elements")
		}

		return RainbowCore
	})()

	var Utils = (function () {
		Utils = {}

		Utils.identityFunc = function (x) {
			return x
		}	

		Utils.applyPosition = function (pos01, start, end, func) {
			func = func || Utils.identityFunc
			return (end - start) * func(pos01) + start
		}	

		Utils.invApplyPosition = function (pos01, start01, end01, func) {
			func = func || Utils.identityFunc
			if (pos01 < start01 || pos01 > end01)
				throw new Error("pos01 should be between start01 and end01")

			return (pos01 - start01) / (end01 - start01)
		}

		return Utils
	})()

	var Gradient = (function () {
		Gradient.defaultStartColor = [0, 255, 255, 1]
		Gradient.defaultEndColor = [0, 0, 0, 1]
		Gradient.defaultTransFunc = function (x) {
			return x
		}


		function Gradient (startColor, endColor, transFunc) {
			this.startColor = startColor || Gradient.defaultStartColor
			this.endColor = endColor || Gradient.defaultEndColor
			this.transFunc = transFunc || Gradient.defaultTransFunc
		}

		Gradient.prototype.getNumberAt = function (pos, startNum, endNum) {
			if (pos < 0 || pos > 1) 
				throw new RangeError("Number should be between 0 and 1 inclusive")

			return (endNum - startNum) * this.transFunc[pos] + startNum
		}

		Gradient.prototype.getColorAt = function (pos) {
			var color = []

			for (var i = 0; i < 4; i++) 
				color[i] = this.getNumberAt(pos, this.startColor[i], this.endColor[i])

			return color
		}
	})() 



	return RainbowCore
})()