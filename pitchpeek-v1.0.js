/**
 *  Copyright 2015 Jonathan Damon
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * Represents a pitchpeek object which provides helpful methods of enhancing Google Streetviews.
 *
 * Simple examples you can use after including the maps api and this file...
 *
 * var myPitchpeek = new pitchpeek('myDiv'); //the hello world of pitchpeek
 * var myPitchpeek = new pitchpeek('myDiv',{initialPano:'dwFEQYodwY0AAAQXL2YgRA',rotatingStart:true}); //passing options
 * var streetViewObj= myPitchpeek.panorama; //direct access to the StreetViewPanorama object from the maps api
 * 
 * Additional options can be set after starting a pitchpeek, which you can fire off based on user interaction
 * myPitchpeek.options.clickToGo=true;
 * myPitchpeek.options.panControl=true;
 * myPitchpeek.tour();
 * 
 * @constructor
 * @param {string} elementId - The id of the web element you're calling this on, typically a div with explicit height and width.
 * @param {object} optionalArguments - The options object, containing any options that you want to override the defaults.
 */
function pitchpeek(elementId,optionalArguments){
	/*
	 * first we will define the default options
	 * edit these if you keep using the same options
	 */
	this.options = {
    	initTour:true,
		renderMode:'webgl',
		initialPano:'dwFEQYodwY0AAAQXL2YgRA',
		disableDefaultUI: false,
		addressControl: false,
		zoomControl: false,
		clickToGo: false,
		linksControl: true,
		panControl: false,
		enableCloseButton: false,
		visible:true,
    	xml:null,
		rotatingStart:false,
		rotatingStopOnHover:true,
		rotatingFramerate:33,
		rotatingSpeed:.1,
		contentBefore:'<div id="content">',
		contentAfter:'</div>',
		menuFirstId:0,
		menuPosition:'LEFT_TOP',
		menuButtonBackgroundColor:'#fff',
		menuButtonBorder:'2px solid #fff',
		menuButtonBorderRadius:'3px',
		menuButtonBoxShadow:'0 2px 6px rgba(0,0,0,.3)',
		menuButtonCursor:'pointer',
		menuButtonMargin:'3px',
		menuButtonMinWidth:'100px',
		menuButtonOpacity:.9,
		menuButtonTextAlign:'center',
		menuButtonTitlePrepend:'Click to go to ',
		menuButtonTitleAppend:'.',
		menuTextColor:'rgb(25,25,25)',
		menuTextFontFamily:'Roboto,Arial,sans-serif',
		menuTextFontSize:'16px',
		menuTextLineHeight:'38px',
		menuTextPaddingLeft:'5px',
		menuTextPaddingRight:'5px',
		infowindowMaxWidth:null,
		hotspotDraggable:false,
		hotspotStrokeColor:'#000',
		hotspotFillColor:'#0266C8',
		hotspotOpacity:.9,
		hotspotRotation:0,
		hotspotScale:2,
		hotspotAnchorX:0,
		hotspotAnchorY:0,
		hotspotSvgIcon:'M16,1.466C7.973,1.466,1.466,7.973,1.466,16c0,8.027,6.507,14.534,14.534,14.534c8.027,0,14.534-6.507,14.534-14.534C30.534,7.973,24.027,1.466,16,1.466z M14.757,8h2.42v2.574h-2.42V8z M18.762,23.622H16.1c-1.034,0-1.475-0.44-1.475-1.496v-6.865c0-0.33-0.176-0.484-0.484-0.484h-0.88V12.4h2.662c1.035,0,1.474,0.462,1.474,1.496v6.887c0,0.309,0.176,0.484,0.484,0.484h0.88V23.622z'
    }
	
	//honestly, have I been using jquery all these years just to make this one line shorter?
	this.element = document.getElementById(elementId);
	
	//if any options have been passed, loop through them and override the defaults.
	if(typeof optionalArguments !== 'undefined'){
		for (var key in this.options){
			if (optionalArguments.hasOwnProperty(key))this.options[key] = optionalArguments[key];
		}
    }

	/**
	 * Takes a regular array and turns it into an object with keys that match the original values
	 * I am shocked that there is no easy way in javascript to test if an array contains a value
	 * Out of stubbornness, I chose to keep my original array, this function allows me to use the "in" when checking marker v. pano
	 * @param {array} arr - An array containing the panos that a hotspot should show up on.
	 * @return {object} obj - The object containing the original array's values, but now as object properties/keys.
	 */
	function objectify(arr){
		var obj = {};
		for(var i=0;i<arr.length;i++){
			obj[arr[i]]='';
		}
		return obj;
	}
	
	/**
	 * Takes a regular array and turns it into an object with keys that match the original values
	 * I am shocked that there is no easy way in javascript to test if an array contains a value
	 * Out of stubbornness, I chose to keep my original array, this function allows me to use the "in" when checking marker v. pano
	 * @param {object} panorama - a StreetViewPanorama object
	 * @param {object} hotspots - a 2d array with a bunch of hotspots, each containing a list of panos that hotspot should show on
	 */
	function showMarkers(panorama,hotspots){
		for (var i in hotspots){
			if(panorama.getPano() in objectify(hotspots[i].show)){
				hotspots[i].marker.setMap(panorama);
			}else{
				hotspots[i].marker.setMap(null);
			}
		}
	}
			   
	/**
	 * This function loops through the views and creates the menu items
	 * It also sets the pano and the pov to that of the first menu item, as long as you kept the default options.menuFirstId=0
	 * Set options.menuFirstId to -1 and it will load your second menu item, -2 to load your third, 1 to load none
	 * You can access this pitchpeek property after loading if you want to add more through javascript.
	 * @param {object} panorama - a StreetViewPanorama object
	 * @param {object} options - the object with all of the options
	 * @param {object} views - a 2d object, if such a thing exists, keys of panoid containing pov objects
	 * @param {object} hotspots - a 2d array with a bunch of hotspots, each containing a list of panos that hotspot should show on
	 */	   
	function addViews(panorama,options,views,hotspots) {
		for (var panoid in views) {
			if(options.menuFirstId==0){
				panorama.setPano(panoid);
				panorama.setPov(/** @type {google.maps.StreetViewPov} */({
					heading: views[panoid].heading,
					pitch: views[panoid].pitch,
					zoom: views[panoid].zoom
				}));
			}
			var centerControlDiv = document.createElement('div');
			var centerControl = new createMenuItem(centerControlDiv, panorama,options,views[panoid],hotspots);
			centerControlDiv.index = options.menuFirstId++;
			//the following eval line concerns me.  I've heard it's dangerous especially when end users can pass in values
			//if anyone knows of a better way to access this control position constant without eval, please contact me
			panorama.controls[eval('google.maps.ControlPosition.'+options.menuPosition)].push(centerControlDiv);
		}
	}
	
	/**
	 * This function loops through the hotspots and creates the markers
	 * It also creates the infowindows and fills them with content
	 * and adds listeners to show the infowindows when you click the marker
	 * @param {object} panorama - a StreetViewPanorama object
	 * @param {object} options - the object with all of the options
	 * @param {object} hotspots - a 2d array with a bunch of hotspots, each containing a list of panos that hotspot should show on
	 */	 
	function addHotspots(panorama,options,hotspots){
		for (var i in hotspots){
			var hotspotIcon = {
				path: options.hotspotSvgIcon,
				strokeColor: options.hotspotStrokeColor,
				fillColor: options.hotspotFillColor,
				fillOpacity: options.hotspotOpacity,
				rotation:options.hotspotRotation,
				anchor:new google.maps.Point(options.hotspotAnchorX, options.hotspotAnchorY),
				scale: options.hotspotScale
			};
			var content = options.contentBefore+hotspots[i].content+options.contentAfter;
			var infowindow = new google.maps.InfoWindow({
				content: content,
				maxWidth: options.infowindowMaxWidth
			});
			var hotspot = new google.maps.LatLng(hotspots[i].latitude,hotspots[i].longitude);
			var marker = new google.maps.Marker({
				position: hotspot,
				map: panorama,
				icon: hotspotIcon,
				draggable:options.hotspotDraggable,
				title: hotspots[i].title
			});
			hotspots[i]['marker']=marker;
			google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
				return function() {
					infowindow.setContent(content);
					infowindow.open(panorama,marker);
				};
			})(marker,content,infowindow)); 
		}
	}
	
	/**
	 * This function just makes the buttons, adds them to the control div,
	 * and adds a listener so that when you click on a menu button you go there
	 * @param {object} controlDiv - the div that holds and positions the buttons
	 * @param {object} panorama - a StreetViewPanorama object
	 * @param {object} options - the object with all of the options
	 * @param {object} view - contains panoid and pov
	 * @param {object} hotspots - a 2d array with a bunch of hotspots, each containing a list of panos that hotspot should show on
	 */	
	function createMenuItem(controlDiv, panorama,options,view,hotspots) {
		var controlUI = document.createElement('div');
		controlUI.style.backgroundColor = options.menuButtonBackgroundColor;
		controlUI.style.border = options.menuButtonBorder;
		controlUI.style.borderRadius = options.menuButtonBorderRadius;
		controlUI.style.boxShadow = options.menuButtonBoxShadow;
		controlUI.style.cursor = options.menuButtonCursor;
		controlUI.style.margin = options.menuButtonMargin;
		controlUI.style.minWidth = options.menuButtonMinWidth;
		controlUI.style.opacity = options.menuButtonOpacity;
		controlUI.style.textAlign = options.menuButtonTextAlign;
		controlUI.title = options.menuButtonTitlePrepend+view.title+options.menuButtonTitleAppend;
		controlDiv.appendChild(controlUI);
		// Set CSS for the control interior
		var controlText = document.createElement('div');
		controlText.style.color = options.menuTextColor;
		controlText.style.fontFamily = options.menuTextFontFamily;
		controlText.style.fontSize = options.menuTextFontSize;
		controlText.style.lineHeight = options.menuTextLineHeight;
		controlText.style.paddingLeft = options.menuTextPaddingLeft;
		controlText.style.paddingRight = options.menuTextPaddingRight;
		controlText.innerHTML = view.title;
		controlUI.appendChild(controlText);
		google.maps.event.addDomListener(controlUI, 'click', function() {
			panorama.setPano(view.panoid);
			panorama.setPov(/** @type {google.maps.StreetViewPov} */({
				heading: view.heading,
				pitch: view.pitch,
				zoom: view.zoom
			}));
		});
	}
	
	/**
	 * This stops the rotation
	 * @param {int} timer - the id of the timer, you need it anyway but especially with more than one pitchpeek per page
	 */	
	function stopRotation( timer ) {
		return function() {
			clearInterval( timer );
		}
	}	
	
	/**
	 * This function starts the rotation	 
	 * @param {object} panorama - a StreetViewPanorama object
	 * @param {float} rotateTick - how much to rotate per "frame"
	 */	
	function startRotation(panorama,rotateTick){
		var currentPov=panorama.getPov(); 
		panorama.setPov({
			heading: currentPov.heading+rotateTick,
			pitch: currentPov.pitch,
			zoom: currentPov.zoom
		});
	}
	
	/**
	 * This public function combines setPano and setPov, but will take an incomplete view object.
	 * So if you only need to update the heading and pitch, you can ignore the zoom and it will use the current setting.
	 * @param {object} panorama - a StreetViewPanorama object
	 */	
	this.setView=function(view){
		var panoid = (view.panoid === undefined) ? this.panorama.getPano() : view.panoid;
		var heading = (view.heading === undefined) ? this.panorama.getPov().heading : view.heading;
		var pitch = (view.pitch === undefined) ? this.panorama.getPov().pitch : view.pitch;
		var zoom = (view.zoom === undefined) ? this.panorama.getPov().zoom : view.zoom;
		this.panorama.setPano(panoid);
		this.panorama.setPov(/** @type {google.maps.StreetViewPov} */({
			heading: heading,
			pitch: pitch,
			zoom: zoom
		}));
	}
	
	/**
	 * This public function fetches the tour data from an xml file, and calls other functions to load the tour
	 * @param {object} options - all of the settings
	 * @param {object} panorama - a StreetViewPanorama object
	 * @param {object} tourHotSpots - I couldn't bind on multiple objects so I pass them by reference. Wish I knew more about javascript!
	 */
	this.loadXMLDoc=function(options,panorama,tourHotspots){
		var xmlhttp;
		var views,hotspots;
		if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp=new XMLHttpRequest();
		}else{// code for IE6, IE5
			xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
		}
		xmlhttp.onreadystatechange=function(){
			if (xmlhttp.readyState==4 && xmlhttp.status==200){
				views=xmlhttp.responseXML.documentElement.getElementsByTagName("VIEW");
				var tourViews={};
				for (var i=0;i<views.length;i++){
					var panoid=views[i].getElementsByTagName("PANOID")[0].firstChild.nodeValue;
					var title=views[i].getElementsByTagName("TITLE")[0].firstChild.nodeValue;
					var heading=parseFloat(views[i].getElementsByTagName("HEADING")[0].firstChild.nodeValue);
					var pitch=parseFloat(views[i].getElementsByTagName("PITCH")[0].firstChild.nodeValue);
					var zoom=parseFloat(views[i].getElementsByTagName("ZOOM")[0].firstChild.nodeValue);
					tourViews[panoid]={panoid:panoid,title:title,heading:heading,pitch:pitch,zoom:zoom};
				}
				hotspots=xmlhttp.responseXML.documentElement.getElementsByTagName("HOTSPOT");
				var tourHotspots={};
				for (i=0;i<hotspots.length;i++){
					var title=hotspots[i].getElementsByTagName("TITLE")[0].firstChild.nodeValue;
					var content=hotspots[i].getElementsByTagName("CONTENT")[0].firstChild.nodeValue;
					var latitude=parseFloat(hotspots[i].getElementsByTagName("LATITUDE")[0].firstChild.nodeValue);
					var longitude=parseFloat(hotspots[i].getElementsByTagName("LONGITUDE")[0].firstChild.nodeValue);
					var pano=hotspots[i].getElementsByTagName("PANO");
					var show=[];
					for (var j = 0; j < pano.length; j++){
						show.push(pano[j].firstChild.nodeValue);
					}
					tourHotspots[i]={title:title,content:content,latitude:latitude,longitude:longitude,show:show};
				}
				addViews(panorama,options,tourViews,tourHotspots);
				addHotspots(panorama,options,tourHotspots);
				showMarkers(panorama,tourHotspots);
				google.maps.event.addListener(panorama, 'pano_changed', function() {
					showMarkers(panorama,tourHotspots);
				});
				
			}
		}
		xmlhttp.open("GET",options.xml,true);
		xmlhttp.send();
	}
	
	/**
	 * This is THE public function that runs the show, and it runs automatically by default
	 * Set options.initTour=false to disable this from running, then call tour() later
	 */
	this.tour = function () {
		var panoramaOptions = {
			pano: this.options.initialPano,
			mode: this.options.renderMode,
			disableDefaultUI: this.options.disableDefaultUI,
			addressControl: this.options.addressControl,
			zoomControl: this.options.zoomControl,
			clickToGo: this.options.clickToGo,
			linksControl: this.options.linksControl,
			panControl: this.options.panControl,
			enableCloseButton: this.options.enableCloseButton,
			visible:this.options.visible
		};
		this.panorama = new google.maps.StreetViewPanorama(this.element, panoramaOptions);
		if(this.options.xml)this.loadXMLDoc(this.options,this.panorama,this.tourHotspots);
		if(this.options.rotatingStart){
			var timer=setInterval(startRotation, this.options.rotatingFramerate, this.panorama, this.options.rotatingSpeed);
			if(this.options.rotatingStopOnHover)this.element.onmouseover=stopRotation(timer);
		}
	}
	//the following line will load the tour by default settings
	if(this.options.initTour)this.tour();
}

/*
 * This code was written by Jonathan Damon, please attribute.
 * Donations to this project can be made at pitchpeek.com.
 */
