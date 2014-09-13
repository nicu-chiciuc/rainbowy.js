
var Rainbowy = (function () {	

	var Rainbow = (function () {
		function Rainbow (startColor, endColor) {
			this.core = new RainbowCore(Color.hexToColor(startColor), Color.hexToColor(endColor))

			this.minNum = 0
			this.maxNum = 1
		}	

		Rainbow.prototype.setMinMax = function (minNum, maxNum) {
			this.minNum = minNum
			this.maxNum = maxNum
		}

		Rainbow.prototype.getColorAt = function (pos, type) {
			Check.checkPosBetween(pos, this.minNum, this.maxNum)

			var realPos = Utils.invApplyPosition(pos, this.minNum, this.maxNum, Utils.identityFunc)
			var color = this.core.coreGetColorAt( realPos )
			return Color.colorTo(color, type)
		}

		Rainbow.prototype.putColorAt = function (pos, color, func) {
			Check.checkPosBetween(pos, this.minNum, this.maxNum)
			func = func || Utils.identityFunc

			var realPos = Utils.invApplyPosition(pos, this.minNum, this.maxNum, Utils.identityFunc)
			var colorType = Color.getColorType(color)
			var realColor = Color.fromColor(color, colorType)

			this.core.corePutColorAt(realPos, realColor, func)
		}

		Rainbow.prototype.removeColorAtIndex = function (index) {
			Check.checkPosBetween(index, 1, this.core.checkpoints.length-2)

			this.core.checkpoints.splice(index, 1)
		}

		return Rainbow
	})()

	var RainbowCore = (function () {
		function RainbowCore (startColor, endColor) {
			Check.checkGoodColor(startColor)
			Check.checkGoodColor(endColor)

			this.checkpoints = [{pos: 0, color: startColor}, {pos: 1, color: endColor}]
			this.transitions = [ Utils.identityFunc ]
		}	

		RainbowCore.prototype.coreGetColorAt = function (pos) {
			Check.checkPosBetween(pos)

			var floorCheckpoint = this.getFloorCheckpoint(pos)
			var startColor = this.checkpoints[ floorCheckpoint ].color
			var endColor = this.checkpoints[ floorCheckpoint + 1 ].color
			var realPos = Utils.invApplyPosition(pos, this.checkpoints[floorCheckpoint].pos, this.checkpoints[floorCheckpoint+1].pos)

			var retColor = []

			for (var i = 0; i < 4; i++) {
				var num = Utils.applyPosition( realPos, startColor[i], endColor[i], this.transitions[floorCheckpoint] )

				if (i < 3) 
					num = Math.round( Utils.getPosBetween(num, 0, 255) )
				else
					num = Utils.getPosBetween(num, 0, 1)

				retColor.push(num)
			}

			// console.log(retColor)

			return retColor
		}

		RainbowCore.prototype.corePutColorAt = function (pos, color, func) {
			Check.checkPosBetween(pos, 0, 1)
			Check.checkGoodColor(color)
			func = func || Utils.identityFunc


			var floorCheckpoint = this.getFloorCheckpoint(pos)
			this.checkpoints.splice(floorCheckpoint+1, 0, {pos: pos, color: color})
			this.transitions.splice(floorCheckpoint+1, 0, func)
		}

		RainbowCore.prototype.getFloorCheckpoint = function (pos) {
			Check.checkPosBetween(pos, 0, 1)

			var len = this.checkpoints.length
			for (var i = 0; i < len; i++)
				if (this.checkpoints[i].pos > pos)
					return i-1

			return len - 2
		}

		return RainbowCore
	})()

	var Utils = {
		identityFunc : function (x) {
				return x
			},

		applyPosition : function (pos01, start, end, func) {
				Check.checkPosBetween(pos01, 0, 1)
				func = func || Utils.identityFunc

				var fun = func(pos01)
				var ret = (end - start) * fun + start
				func(pos01)
				return ret
			},

		invApplyPosition : function (pos01, start01, end01, func) {
				Check.checkPosBetween(pos01, start01, end01)
				func = func || Utils.identityFunc

				return (pos01 - start01) / (end01 - start01)
			},

		getPosBetween : function (pos, min, max) {
				if (pos < min)
					return min
				else 
				if (pos > max)
					return max
				else
					return pos
			},

		
		getBezier01 : function (x, x1, y1) {
				var t = (-x1 + Math.sqrt(x1*x1 + x*(1-2*x1))) / (1-2*x1)
				var y = 2*t*(1-t) * y1 + t*t
				return y 
			},

		CubicBezier : function (x1, y1, x2, y2) {
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
			},
	}

	var Check = {
		checkPosBetween : function (pos, min, max) {
				if (pos < min || pos > max)
					throw new Error("A good position should be between " + min + " and " + max)
			},

		checkGoodColor : function (color) {
				if (!(Array.isArray(color) && color.length == 4))
					throw new Error("Invalid color, a color should be an array with exactly 4 elements")
				
				for (var i = 0; i < 3; i++) 
					Check.checkPosBetween(color[i], 0, 255)
				
				Check.checkPosBetween(color[3], 0, 1)
			},
	}

	var Color = {
		numToHex : function (c) {
				var hex = c.toString(16)
				return hex.length == 1 ? "0" + hex : hex
			},

		colorToHex : function (col) {
				return "#" + Color.numToHex(parseInt(col[0])) + Color.numToHex(parseInt(col[1])) + Color.numToHex(parseInt(col[2]))
			},

		hexRegex : /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,

		hexToColor : function (hex) {
				var result = Color.hexRegex.exec(hex)
				if (result)
					return [
						parseInt(result[1], 16),
						parseInt(result[2], 16),
						parseInt(result[3], 16),
						1
					]
				else
					throw Error("Invalid hex color.")
			},

		rgbaRegex : /^rgba\((\d+),(\d+),(\d+),(\d*\.\d*)\)$/i,

		rgbaToColor : function (rgba) {
				rgba = rgba.replace(/\s/g, "") 
				var result = Color.rgbaRegex.exec(rgba)

				var ret = [
					parseInt(result[1]),
					parseInt(result[2]),
					parseInt(result[3]),
					parseFloat(result[4])
				]

				return ret
			},

		rgbRegex : /^rgb\((\d+),(\d+),(\d+)\)$/i,

		rgbToColor : function (rgb) {
				rgb = rgb.replace(/\s/g, "") 
				var result = rgbRegex.exec(rgb)

				var ret = [
					parseInt(result[1]),
					parseInt(result[2]),
					parseInt(result[3])
				]

				return ret
			},

		colorToRgba : function (col) {
				return "rgba(" + 
					parseInt(col[0]) + ", " + 
					parseInt(col[1]) + ", " + 
					parseInt(col[2]) + ", " +
					parseInt(col[3]) + ")"
			},

		colorToRgb : function (col) {
			return "rgb(" +
				parseInt(col[0]) + ", " + 
				parseInt(col[1]) + ", " + 
				parseInt(col[2]) + ")"
		},

		getColorType : function (col) {
			if (Color.hexRegex.test(col)) return 'hex'
			if (Color.rgbaRegex.test(col)) return 'rgba'
			if (Color.rgbRegex.test(col)) return 'rgb'
			return undefined
		},

		fromColor : function (color, colorType) {
			switch (colorType) {
				case 'hex' : return Color.hexToColor( color ) 
				case 'rgba' : return Color.rgbaToColor( color ) 
				case 'rgb' : return Color.rgbToColor( color ) 
				default : return color	
			}
		},

		colorTo : function (color, colorType) {
			switch (colorType) {
				case 'hex' : return Color.colorToHex( color )
				case 'rgba' : return Color.colorToRgba( color )
				case 'rgb' : return Color.colorToRgb( color )
				default : return color
			}
		},
	}

	Rainbow.Utils = Utils
	Rainbow.Check = Check
	Rainbow.Color = Color	
	Rainbow.RainbowCore = RainbowCore

	return Rainbow
})()


// For node.js
var module
if (module) {
	module.exports = Rainbowy
}
