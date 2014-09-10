#*rainbow.js*


rainbow.js is a small library that can do big things.

It creates and manages a color gradient between some specified colors (minimum 2).

The fun part is that you can change not only the position of the color checkpoints, you can also change the type of transition from liniar to any type you want (quadratic and cubic bezier curves are advised).

----------

##Overview

The library exports only one global object: *Rainbow*. This is a constructor. Besides this, there are two other constructors which are exported through *Rainbow*. These are *Rainbow.RainbowCore* and *Rainbow.Utils*. You should be able to use the library without those two constructors but you can check them out anyway.


#####RainbowCore and Rainbow

The core of the algorithm is (you guessd it) in *RainbowCore*. *Rainbow* is a more user-friendly interface. 

You can input RGBA or Hex colors in the constructor of *Rainbow* but you can only input arrays of 4 elements in the constructor of *RainbowCore*, since it operates only on colors represented as array of 4.

#####Utils

Utils has some neat functions.

---------

##Usage


```javascript
var rain = new Rainbow('#ff0101', '#0000ff')

var someColor = rain.getHexColorAt( 0.2 )
var otherColor = rain.getRgbaColorAt( 0.6 )


```