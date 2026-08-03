'use strict'

// create instance of ModuloBox
const mobx = new ModuloBox({
// options
	mediaSelector: '.mobx',
	scrollToZoom: true,
	controls: ['zoom', 'play', 'fullScreen', 'download', 'share', 'close'],
	shareButtons: ['facebook', 'twitter', 'pinterest'],
	minZoom: 1,
	zoomTo: 1.8,
	prevNextKey: true,
	mouseWheel: true,
	thumbnails: true,
	thumbnailsNav: 'centered',
	thumbnailSizes: {
		1920: {
			width: 110,
			height: 80,
			gutter: 10
		},
		1280: {
			width: 90,
			height: 65,
			gutter: 10
		},
		480: {
			width: 60,
			height: 44,
			gutter: 5
		}
	}
})
mobx.init()
