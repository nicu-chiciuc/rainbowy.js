# *rainbowy.js*


rainbowy.js is a small library that can do big things.

It creates and manages a color gradient between some specified colors (minimum 2).

The fun part is that you can change not only the position of the color checkpoints, you can also change the type of transition from liniar to any type you want (quadratic and cubic bezier curves are advised).

## Examples

I didn't yet made a normal example page, yet, you can check out [example.html](http://nicusor.org.md/experiment/rainbowy/example.html) for a first impression.
There you have a gradient of 3 colors. The transition function is the sum of a random number (-0.3 to 0.3) and a quadratic bezier curve controlled by the position of the mouse inside the yellow square. If you click, the green color dissappears and only two colors remain.

----------

## Overview

The library exports only one global object: *Rainbowy*. This is a constructor. Besides this, there are some other constructors and objects which are exported through *Rainbowy*. These are *Rainbowy.RainbowCore*, *Rainbowy.Utils*, *Rainbowy.Check*, and *Rainbowy.Color*. You should be able to use the library without those objects but you can check them out anyway.


##### RainbowCore and Rainbowy

The core of the algorithm is (you guessd it) in *RainbowCore*. *Rainbowy* is a more user-friendly interface. 

You can input RGBA or Hex colors in the constructor of *Rainbowy* but you can only input arrays of 4 elements in the constructor of *RainbowCore*, since it operates only on colors represented as array of 4.

---------

## Usage


```javascript
var rain = new Rainbowy('#ff0101', '#0000ff')

rain.setMinMax(0, 512)
rain.putColorAt(200, 'rgb(123, 0, 200)')

var someColor = rain.getColorAt( 0.2, 'hex' )
```