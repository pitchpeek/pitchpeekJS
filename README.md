# pitchpeekJS
Create google streetview panoramas with over 40 options in one line of javascript

Over 40 Configurable Options, 
Positionable Menu Overlay, 
Load Tour Data from XML, 
Optional Auto-Rotation, 
Hotspots with Info Windows, 
Helper Functions for Coders, and more to come!


For a full tutorial, visit http://pitchpeek.com/js/documentation/

Basic Usage:
Include the Google Maps Api and pitchpeek.js in the head of your page.

```<script src="https://maps.googleapis.com/maps/api/js?v=3"></script>```

```<script src="pitchpeek.js"></script>```

Somewhere on your page, create a div with an id, with width & height.

```<div id="sample-panorama" style="width:500px;height:280px;">```

```  you can put placeholder text or an image in your div```

``` </div> ```

Now we're ready to create our first pitchpeek object using the id of our div.

```var pano = new pitchpeek('sample-panorama',{initialPano:'YuxV_6KDjN0AAAQYn87sYg', rotatingStart:true, rotatingSpeed:-.3});```

There are over 40 options that can be set, visit http://pitchpeek.com/js/documentation/ for a tutorial and explanation of how pitchpeek works.

~Jonathan Damon
