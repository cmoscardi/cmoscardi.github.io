(function($) {
	
	$.extend({pwTyper: {

		wrap: function(s) {

			// remove legacy span.pwtext elements			
			s = s.replace(/(<span[^>]*?class="[^"]*pwText[^"]*>)([^<]*)(<\/span>)/g, '$2');

			// wraps all text nodes in a span.pwtext element 
			s = s.replace(/(>|^(?!<))([^<]+)(<|(?!>)$)/g, '$1<span class="pwText">$2</span>$3');

			// groups special characters such as &amp; into a span.pwSpecial element
			// only match special characters within existing .pwText elements (not in attributes)
			s = s.replace(/<span class="pwText">[^<]*&\S*;[^<]*<\/span>/g, function(m) { return m.replace(/(&[^;]+;)/g, '</span><span class="pwSpecial">$1</span><span class="pwText">'); });

			// remove empty pwText tags and wrap in a span.pwText if needed
			// s = s.replace(/<span class="pwText">[\n\r]+?<\/span>/g, "");
			
			return s;
		},
		
		// adds the next letter 
		type: function(G) {
		
			// increase dataIndex, which moves to the next element
			if (G.charCount > G.data[G.dataIndex].count) {
				G.dataIndex++;
			}
			
			// If typing is complete, restore the original state
			if (G.dataIndex == G.dataLength) {
				G.thisElement.data("finished", true);
				G.thisElement.html(G.content);
				
				
				// if typing is complete for ALL elements
				if (G.thisElement.data("callback")) {
					var finished = true;
					$(G.thisElement.data("get")).each(function() {
						if (!$(this).data("finished")) { finished = false; }														 
					});
					if (finished) {
						var callback = G.thisElement.data("callback");
						if (callback) {
							callback.call();
						}
					}
				}
				return false;
			}
	
			// show the current element and all previous elements which are still hidden
			var newOrder = G.data[G.dataIndex].element.data("order");
			for (G.order; G.order <= newOrder; G.order++) {
				G.thisElement.find('.order-'+G.order).removeClass('pwHidden');
			}
			
			// type the next character
			G.data[G.dataIndex].element.html(G.data[G.dataIndex].text.substr(0, G.charCount - ((G.dataIndex > 0) ? G.data[G.dataIndex-1].count : 0)));
			G.delay = Math.round(G.minInterval + (Math.random() * (G.maxInterval - G.minInterval)));
			G.thisElement.data("int", setTimeout(function() { $.pwTyper.type(G) }, G.delay));			
			
			G.charCount++;	
			
			// Stores the G data in the element to use in pause and stop functions
			G.thisElement.data("G", G);
		},
		
		// removes the last letter 
		untype: function(G) {
						
			// increase dataIndex, which moves to the next element
			if (G.dataIndex > 0 && G.charCount <= G.data[G.dataIndex - 1].count) {
				G.dataIndex--;
			}
			
			// If untyping is complete
			if (G.charCount === 0) {
				G.thisElement.data("finished", true);
				G.thisElement.html("");
				
				// if untyping is complete for ALL elements
				if (G.thisElement.data("callback") && $(G.thisElement.data("get")).data('finished')) {
					var finished = true;
					$(G.thisElement.data("get")).each(function() {
						if (!$(this).data("finished")) { finished = false; }														 
					});
					if (finished) {
						var callback = G.thisElement.data("callback");
						if (callback) {
							callback.call();
						}
					}
				}
				return false;
			}
	
			// show the current element and all previous elements which are still hidden
			var newOrder = G.data[G.dataIndex].element.data("order");
			for (G.order; G.order > newOrder; G.order--) {
				G.thisElement.find('.order-'+G.order).remove();		
			}
			
			// type the next character
			G.data[G.dataIndex].element.html(G.data[G.dataIndex].text.substr(0, G.charCount - 1 - ((G.dataIndex > 0) ? G.data[G.dataIndex-1].count : 0)));
			G.delay = Math.round(G.minInterval + (Math.random() * (G.maxInterval - G.minInterval)));
			G.thisElement.data("int", setTimeout(function() { $.pwTyper.untype(G) }, G.delay));			
			
			G.charCount--;
			
			// Stores the G data in the element to use in pause and stop functions
			G.thisElement.data("G", G);
		},
		
		createCSS: function (selector, declaration) {
			
			// test for IE
			var ua = navigator.userAgent.toLowerCase();
			var isIE = (/msie/.test(ua)) && !(/opera/.test(ua)) && (/win/.test(ua));
		
			// create the style node for all browsers, if it doesn't already exists	
			var style_node = document.getElementById('pwTyperStyles');
			if ( !style_node ) {
				style_node = document.createElement("style");
				style_node.setAttribute("type", "text/css");
				style_node.setAttribute("media", "screen");
				style_node.setAttribute("id", "pwTyperStyles");
			}
			
			// if the rule doesn't already exist, add it
			if ( style_node.innerHTML.indexOf(selector + " {" + declaration + "}") === -1 ) {
				
				// append a rule for good browsers
				if (!isIE) style_node.appendChild(document.createTextNode(selector + " {" + declaration + "}\n"));

				// append the style node
				document.getElementsByTagName("head")[0].appendChild(style_node);

				// use alternative methods for IE
				if (isIE && document.styleSheets && document.styleSheets.length > 0) {
					var last_style_node = document.styleSheets[document.styleSheets.length - 1];
					if (typeof(last_style_node.addRule) == "object") last_style_node.addRule(selector, declaration);
				}
			}
		}	
	}});
	
	
	$.fn.extend({
	
		stopTyper: function() {
			clearInterval(this.data("int"));
			return this;
		},
		
		resumeTyper: function() {
			this.data('func').call($.pwTyper, this.data("G"));
			return this;
		},
		
		finishTyper: function() {
			clearInterval(this.data("int"));
			if (this.data('func') == $.pwTyper.type) {
				this.html(this.data("content"));
			} else {
				this.empty();
			}
			
			var callback = this.data("callback");
			if (callback) {
				callback.call();
			}

			return this;
		},
					
		type: function(options) {
			
			// add CSS styles if they haven't already been added
			$.pwTyper.createCSS('.pwHidden', 'display:none;');

			clearInterval(this.data("int"));
			
			// Default settings
			var settings = {
				minInterval: 30,
				maxInterval: 90
			};
			
			// Processing settings
			settings = jQuery.extend(settings, options || {});
			
			this.data("func", $.pwTyper.type);
			this.data("get", this.get());
			this.data("callback", (settings.callback) ? settings.callback : null);
			
			
			return this.each(function() {
				
				var G = {
					charCount: 0,
					charTotal: 0,
					data: [],
					dataLength: 0,
					dataIndex: 0,
					thisElement: $(this),
					order: 0, 
					delay: 0,
					newText: "",
					content: "",
					minInterval: settings.minInterval,
					maxInterval: settings.maxInterval
				};
			
				if (!settings.content) {
					G.content = G.thisElement.html();	
				} else if (settings.content instanceof jQuery) {
					G.content = $(settings.content).html();
				} else {
					G.content = settings.content;	
				}
				G.thisElement.data("finished", false);
				G.thisElement.data("content", G.content);
			
				// wraps all text nodes in a pwText span element 
				G.newText = $.pwTyper.wrap(G.content);
			
				// Creates an order for all elements to progressively show them as the typing happens
				G.thisElement.html(G.newText).find('*').each(function(i) {
					$(this).addClass("pwHidden").data("order", i).addClass("order-" + i);									
				});

				// empties the text from the span elements and stores it in the 'data' variable
				G.thisElement.find('.pwText').each(function(i) {
					G.data[i] = {
						order:$(this).data("order"),
						text: $(this).html(),
						element: $(this),
						count: (i > 0) ? $(this).html().length + G.data[i-1].count : $(this).html().length
					};
					$(this).empty();
				});
				
				G.dataLength = G.data.length;
				G.charTotal = G.data[G.dataLength-1].count;

				// if a time is specified, calculate the delay
				if (settings.time) {
					G.delay = Math.floor(settings.time / G.charTotal);
					if (G.delay === 0) { G.delay = 1; }
					if (settings.deviation) {
						if (settings.deviation > 1) { settings.deviation = 1; }
						G.minInterval = Math.round(G.delay * (1 - settings.deviation));
						G.maxInterval = G.delay + (G.delay - G.minInterval);
						if (G.minInterval === 0) { G.minInterval = 1; }
					} else {
						G.minInterval = G.delay;
						G.maxInterval = G.delay;
					}
				}

				if (settings.delay) {
					G.thisElement.data("int", setTimeout( function() { $.pwTyper.type(G) }, settings.delay));
				} else {
					$.pwTyper.type(G);	
				}
			});			
		},
	
		untype: function(options) {
			
			// add CSS styles if they haven't already been added
			$.pwTyper.createCSS('.pwHidden', 'display:none;');
			
			clearInterval(this.data("int"));
			
			// Default settings
			var settings = {
				minInterval: 30,
				maxInterval: 90
			};
			
			// Processing settings
			settings = jQuery.extend(settings, options || {});
			
			this.data("func", $.pwTyper.untype);
			this.data("get", this.get());
			this.data("callback", (settings.callback) ? settings.callback : null);
		
			
			return this.each(function() {
			
				var G = {
					charCount: 0,
					charTotal: 0,
					data: [],
					dataLength: 0,
					dataIndex: 0,
					thisElement: $(this),
					order: 0,
					delay: 0,
					newText:"",
					content: $(this).html(),
					minInterval: settings.minInterval, 
					maxInterval: settings.maxInterval
				};
				G.thisElement.data("finished", false);
				
				// wraps all text nodes in a pwText span element 
				G.newText = $.pwTyper.wrap(G.content);
					
				// Creates an order for all elements to progressively show them as the typing happens
				G.thisElement.html(G.newText).find('*').each(function(i) {
					$(this).data("order", i).addClass("order-" + i);									
				});
				
				// takes the text from the span elements and stores it in the 'data' variable
				G.thisElement.find('.pwText').each(function(i) {
					G.data[i] = {order:$(this).data("order"), text:$(this).html(), element:$(this), count: (i > 0) ? $(this).html().length + G.data[i-1].count : $(this).html().length};
				});
				
				if (G.data.length > 0) {
					G.dataIndex = G.data.length - 1;
					G.charTotal = G.data[G.dataIndex].count;
					G.charCount = G.charTotal;
					G.order = G.data[G.dataIndex].element.data("order");
					
					// if a time is specified, calculate the delay
					if (settings.time) {
						G.delay = Math.floor(settings.time / G.charTotal);
						if (G.delay === 0) { G.delay = 1; }
						if (settings.deviation) {
							if (settings.deviation > 1) { settings.deviation = 1; }
							G.minInterval = Math.round(G.delay * (1 - settings.deviation));
							G.maxInterval = G.delay + (G.delay - G.minInterval);
							if (G.minInterval === 0) { G.minInterval = 1; }
						} else {
							G.minInterval = G.delay;
							G.maxInterval = G.delay;
						}
					}
				}
				
				if (settings.delay) {
					G.thisElement.data("int", setTimeout(function() { $.pwTyper.untype(G) }, settings.delay));
				} else {
					$.pwTyper.untype(G);	
				}
			});
			
		}
	});
		
})(jQuery);