
var Rainbow = (function () {	

	var Rainbow = (function () {
		function Rainbow (startColor, endColor) {
			this.core = new RainbowCore(Utils.hexToColor(startColor), Utils.hexToColor(endColor))

			this.minNum = 0
			this.maxNum = 1
		}	

		Rainbow.prototype.setMinMax = function (minNum, maxNum) {
			this.minNum = minNum 
			this.maxNum = maxNum
		}

		Rainbow.prototype.getColorAt = function (pos) {
			Utils.checkPosBetween(pos, this.minNum, this.maxNum)

			var realPos = Utils.invApplyPosition(pos, this.minNum, this.maxNum, Utils.identityFunc)
			return this.core.coreGetColorAt( realPos )
		}

		Rainbow.prototype.getHexColorAt = function (pos) {
			return Utils.colorToHex( this.getColorAt(pos) )
		}

		Rainbow.prototype.getRgbaColorAt = function (pos) {
			return Utils.colorToRgba( this.getColorAt(pos) )
		}

		Rainbow.prototype.putColorAt = function (pos, color, func) {
			Utils.checkPosBetween(pos, 0, 1)

			func = func || Utils.identityFunc

			var floorCheckpoint = this.getFloorCheckpoint(pos)
			this.checkpoints.splice(floorCheckpoint+1, 0, {pos: pos, color: Utils.hexToColor(color)})
			this.transitions.splice(floorCheckpoint+1, 0, func)
		}


		return Rainbow
	})()

	var RainbowCore = (function () {
		function RainbowCore (startColor, endColor) {
			Utils.checkGoodColor(startColor)
			Utils.checkGoodColor(endColor)

			this.checkpoints = [{pos: 0, color: startColor}, {pos: 1, color: endColor}]

			this.transitions = [ Utils.identityFunc ]

		}	

		RainbowCore.prototype.coreGetColorAt = function (pos) {
			Utils.checkPosBetween(pos)

			var floorCheckpoint = this.getFloorCheckpoint(pos)
			var startColor = this.checkpoints[ floorCheckpoint ].color
			var endColor = this.checkpoints[ floorCheckpoint + 1 ].color
			var realPos = Utils.invApplyPosition(pos, this.checkpoints[floorCheckpoint].pos, this.checkpoints[floorCheckpoint+1].pos)

			var retColor = []

			for (var i = 0; i < 4; i++) {
				var num = Utils.applyPosition( realPos, startColor[i], endColor[i], this.transitions[floorCheckpoint] )
				num = Math.round( num )

				if (i < 3) //colors without alpha
					num = (num + 256) % 256

				retColor.push(num)
			}

			return retColor
		}

		RainbowCore.prototype.corePutColorAt = function (pos, color, func) {
			Utils.checkPosBetween(pos, 0, 1)

			func = func || Utils.identityFunc

			var floorCheckpoint = this.getFloorCheckpoint(pos)
			this.checkpoints.splice(floorCheckpoint+1, 0, {pos: pos, color: color})
			this.transitions.splice(floorCheckpoint+1, 0, func)
		}

		RainbowCore.prototype.getFloorCheckpoint = function (pos) {
			Utils.checkPosBetween(pos, 0, 1)

			for (var i = 0, len = this.checkpoints.length; i < len; i++)
				if (this.checkpoints[i].pos > pos)
					return i-1
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

		Utils.checkPosBetween = function (pos, min, max) {
			if (pos < min || pos > max)
				throw new Error("A good position should be between " + min + " and " + max)
		}

		Utils.checkGoodColor = function (color) {
			if (!(Array.isArray(color) && color.length == 4))
				throw new Error("Invalid color, a color should be an array with exactly 4 elements")
			
			for (var i = 0; i < 3; i++) {
				Utils.checkPosBetween(color[i], 0, 255)
			}
			Utils.checkPosBetween(color[3], 0, 1)
		}

		Utils.numToHex = function (c) {
			var hex = c.toString(16);
			return hex.length == 1 ? "0" + hex : hex;
		}

		Utils.colorToHex = function (col) {
			return "#" + Utils.numToHex(parseInt(col[0])) + Utils.numToHex(parseInt(col[1])) + Utils.numToHex(parseInt(col[2]));
		}

		Utils.hexToColor = function(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			if (result)
				return [
					parseInt(result[1], 16),
					parseInt(result[2], 16),
					parseInt(result[3], 16),
					[1]
				]
			else
				throw Error("Invalid hex color.")
		}

		Utils.colorToRgba = function (col) {
			return "rgba(" + 
				parseInt(col[0]) + ", " + 
				parseInt(col[1]) + ", " + 
				parseInt(col[2]) + ", " +
				parseInt(col[3]) + ")"
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
			this.err = 0.0039

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


	Rainbow.Utils = Utils

	return Rainbow
})()


// For node.js
var module
if (module) {
	module.exports = Rainbow
}
