all:
	pug index.pug
	stylus -p index.styl > index.css
	lsc -cb index.ls
	node convert-to-modern-js.js
