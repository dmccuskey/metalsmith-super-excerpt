'use strict';

var
	shortcode = require('shortcode-parser'),
	each = require('lodash.foreach'),
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
				// unwrap paragraphs holding only a shortcode tag, eg <p>[excerpt]</p>
				cnt = cnt.replace(/<p>(\[[^\]]*\])<\/p>/gi, (function(all, code) {
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

			cnt = shortcode.parseInContext(cnt, ctx);

			if (opts.clean) {
				// remove paragraphs emptied by hidden excerpts
				cnt = cnt.replace(/<p><\/p>\n?/gi, '');
			}

			file.contents = Buffer.from(cnt);

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

			file.contents = Buffer.from(shortcode.parseInContext(cnt, ctx));

		}));

	};
};
module.exports = plugin;
