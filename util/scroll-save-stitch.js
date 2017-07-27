/* ==========================================================================
 Utility to capture a screenshot of the current browser window.
 ========================================================================== */

'use strict';

var _screenShotDirectory = 'test/';
var Jimp = require( 'jimp' );
var _imageBuffer;


function _errorHandler( err  ) {
	console.log( err );
}

function start( scrollAmount = 0 ) {
	_imageBuffer = [];

	return _getBrowserInfo()
		   .then( _takeScreenshot )
		   .then( _stitch )
		   .catch( _errorHandler );
}

function _addImageInfoToBuffer( [imageInfo, scrollAmount] ) {
	var image = { scrollAmount: scrollAmount,
		          data: new Buffer( imageInfo, 'base64' )
		        };

	return _imageBuffer.push( image );
}

function _getBrowserInfo() {
	function _getBrowserInfoScript() {

		return {
			bodyHeight:      document.body.offsetHeight,
			bodyWidth:       document.body.offsetWidth,
			maxScrollAmount: document.body.offsetHeight - window.innerHeight,
			pixelRatio:      window.devicePixelRatio,
			scrollAmount:    0,
			windowHeight:    window.innerHeight
		};
	}

	return browser.executeScript( _getBrowserInfoScript );
}

function _scroll( scrollAmount ) {

	function _scrollScript( _scrollAmount ) {
		let style = document.documentElement.style;
    let translate = 'translate( 0px, -' + _scrollAmount + 'px)';

    /**
     * IE8 or older
     */
    if (document.all && !document.addEventListener) {
    	document.body.style.marginTop = '-' + scrollAmount + 'px';
    } else {
    	style.webkitTransform = translate;
    	style.mozTransform = translate;
    	style.msTransform = translate;
    	style.oTransform = translate;
    	style.transform = translate;
    }

    return _scrollAmount;
	}

	return browser.executeScript( _scrollScript, scrollAmount );
}

function _stitch( imageInfo ) {
	let compositeImage = new Jimp( imageInfo.bodyWidth,
		                             imageInfo.bodyHeight );
	let imageBuffer = imageInfo.imageBuffer;

	function _readImage( image, _compositeImage ) {

			return Jimp
			       .read( image.data )
			       .then( function _composeImage( jimpImage ) {

											return  Promise.resolve( _compositeImage.composite(
															jimpImage.scale( 1 / imageInfo.pixelRatio ),
												      0,
												      image.scrollAmount ) )
							} );
	}

	function reducer( promise, image ) {

		return promise.then( _readImage.bind( null, image ) );
	};

	return imageBuffer.reduce( reducer, Promise.resolve( compositeImage ) );
}

function _getNextScrollAmount( browserInfo ) {
	let scrollAmount = browserInfo.scrollAmount;
	let maxScrollAmount = browserInfo.maxScrollAmount;

	if ( scrollAmount === maxScrollAmount ) {
		scrollAmount = Infinity;
	} else {
		scrollAmount = Math.min( scrollAmount + browserInfo.windowHeight,
		                         maxScrollAmount );
	}

	return scrollAmount;
}

function _wrapFn( value ) {

	return function() {

		return value
	};
}

function _takeScreenshot( browserInfo ) {
	if ( browserInfo.scrollAmount <= browserInfo.maxScrollAmount ) {
		let nextScrollAmount = _getNextScrollAmount( browserInfo );
		let newBrowserInfo = Object.assign( {},
			                                  browserInfo,
			                                  { scrollAmount: nextScrollAmount } );

		return Promise.all( [ browser.takeScreenshot(), _wrapFn( browserInfo.scrollAmount )() ] )
		       .then( _addImageInfoToBuffer )
		       .then( _wrapFn( nextScrollAmount ) )
		       .then( _scroll )
		       .then( _wrapFn( newBrowserInfo ) )
		       .then( _takeScreenshot )
		       .catch( _errorHandler );
	} else {
		let imageInfo = Object.assign( browserInfo, { imageBuffer: _imageBuffer } );

		return Promise.resolve( imageInfo );
	}
}

// Expose public methods.
module.exports = { start: start };
