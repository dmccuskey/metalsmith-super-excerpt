'use strict';

var
	shortcode = require('shortcode-parser'),
	each = require('lodash.forEach'),
	plugin;


plugin = function(opts) {
	opts = opts || {};

	return function(files, metalsmith, done) {
		setImmediate(done);

		var metadata = metalsmith.metadata();
		metadata.insertExcerpt = metadata.insertExcerpt || {};
		var insertExcerpt = metadata.insertExcerpt;

		// first pass: grab all excerpts

		each(files, (function(file, path) {
			var cnt = file.contents.toString();

			if (opts.clean) {
				cnt = cnt.replace(/(<p>)(\[.*?\])(<\/p>)/gi, (function(all, p, code) {
					return code;
				}));
			}

			var ctx =  {
				'excerpt': function( str, params ) {
					if (params.name) {
						insertExcerpt[ params.name ] = str;
					} else {
						file.excerpt = str;
					}
					if (params.hidden==true) {
						str='';
					}
					return str;
				}
			};

			file.contents = new Buffer(shortcode.parseInContext(cnt, ctx));

		}));

		// second pass: insert excerpts

		each(files, (function(file, path) {
			var cnt = file.contents.toString();

			var ctx = {
				'insertExcerpt': function( _, params ) {
					var
						name = params.name || '',
						str = '';
					if (name && insertExcerpt.hasOwnProperty( name )) {
						str = insertExcerpt[ name ];
					}
					return str;
				}
			};

			file.contents = new Buffer(shortcode.parseInContext(cnt, ctx));

		}));

	};
};
module.exports = plugin;
