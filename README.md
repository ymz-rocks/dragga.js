![project-poster][poster]

[poster]:https://raw.githubusercontent.com/ymz-rocks/emblems/master/dragga.js/logo.png "Dragga project"


dragga
======


An easy-to-use implementation for dragging stuff over web platforms interfaces

This library is a jQuery plugin which aims to assist you to implement your drag options quickly without taking too much care for the technical details

It comes with the library in uncompressed and compressed versions and also includes some samples of code to begin playing with.

1) drag
-------

when you wish to make some drag effect over an element in your document, all you need to do is to call it's selector and use the dragga plugin. For instance:

$('#myDragElement').dragga();

Note that the element must also define the 'x' class, 'y' class or 'xy' class in order to determine the available axis for dragging. For more detailed sample please open '1.drag.html' file in your browser as well as in your code editor


2) gestures
-----------

Capturing gestures is also available, once you control the listeners for every drag element. Basically, each element has 3 main listeners:

start - when the drag (or gesture) begins
drag - when you drag an element or drag your finger around
end - when you finish dragging stuff around

Note that the element itself shouldn't has any class of 'x', 'y' or 'xy' when you create a gesture - these settings are for dragging elements only! More detailed sample can be found at '2.gesture.html'


Now what?
---------

There are more samples to play with... fell free to explore them and check their relevancy to your projects

Enjoy :)

