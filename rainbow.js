
var Rainbow = (function () {	

	var Rainbow = (function () {
		function Rainbow (startColor, endColor) {
			
		}	

	})()

	var RainbowCore = (function () {
		function RainbowCore (startColor, endColor) {
			RainbowCore.checkGoodColor(startColor)
			RainbowCore.checkGoodColor(endColor)

			this.checkpoints = [{pos: 0, color: startColor}, {pos: 1, color: endColor}]

			this.transitions = [ Utils.identityFunc ]

		}	

		RainbowCore.prototype.getColorAt = function (pos) {
			RainbowCore.checkGoodPos(pos)

			var floorCheckpoint = this.getFloorCheckpoint(pos)
			var startColor = this.checkpoints[ floorCheckpoint ].color
			var endColor = this.checkpoints[ floorCheckpoint + 1 ].color
			var realPos = Utils.invApplyPosition(pos, this.checkpoints[floorCheckpoint].pos, this.checkpoints[floorCheckpoint+1].pos)

			var retColor = [
				Utils.applyPosition( realPos, startColor[0], endColor[0], this.transitions[floorCheckpoint] ) ,
				Utils.applyPosition( realPos, startColor[1], endColor[1], this.transitions[floorCheckpoint] ) ,
				Utils.applyPosition( realPos, startColor[2], endColor[2], this.transitions[floorCheckpoint] ) ,
				Utils.applyPosition( realPos, startColor[3], endColor[3], this.transitions[floorCheckpoint] ) ,
			]

			return retColor
		}

		RainbowCore.prototype.putColorAt = function (pos, color, func) {
			RainbowCore.checkGoodPos(pos)

			func = func || Utils.identityFunc

			var floorCheckpoint = this.getFloorCheckpoint(pos)
			this.checkpoints.splice(floorCheckpoint+1, 0, {pos: pos, color: color})
			this.transitions.splice(floorCheckpoint+1, 0, func)
		}

		RainbowCore.prototype.getFloorCheckpoint = function (pos) {
			RainbowCore.checkGoodPos(pos)

			for (var i = 0, len = this.checkpoints.length; i < len; i++)
				if (this.checkpoints[i].pos > pos)
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

		// For p0(0, 0), p2(1, 1)
		Utils.getBezier01 = function (x, x1, y1) {
			var t = (-x1 + Math.sqrt(x1*x1 + x*(1-2*x1))) / (1-2*x1)
			var y = 2*t*(1-t) * y1 + t*t
			return y
		}

		Utils.CubicBezier = function (x1, y1, x2, y2) {
			this.x1 = x1
			this.y1 = y1
			this.x2 = x2
			this.y2 = y2
			this.err = 0.001

			var p = Math.pow

			this.tTox = function (t) {
				return 3*p(1 - t, 2)*t*this.x1 + 3*(1 - t)*p(t, 2)*this.x2 + p(t, 3)
			}

			this.tToy = function (t) {
				return 3*p(1 - t, 2)*t*this.y1 + 3*(1 - t)*p(t, 2)*this.y2 + p(t, 3)
			}

			this.xToy = function (x) {
				return this.tToy(this.xTot(x))
			}

			this.xTot = function (x) {
				var tmin = 0,
					tmax = 1,
					tnow,
					xnow,
					maxRep = 1 / this.err

				while (maxRep-- > 0) {
					tnow = (tmax+tmin) / 2
					xnow = this.tTox(tnow)

					if (Math.abs(x-xnow) < this.err) {
						return tnow
					} else
					if (xnow < x) {
					    tmin = tnow
					} else {
						tmax = tnow
					}
				}
			}
		}

		return Utils
	})()



	RainbowCore.Utils = Utils

	return RainbowCore
})()


// For node.js
var module
if (module) {
	module.exports = Rainbow
}
