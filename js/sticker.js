/*

Sticker.js beta

Compatible with:
IE: 6+
Firefox: 4+
Safari: 4+
Chrome: 14+
Opera: 11.6+

*/
var stickerValidate = {
		email: /^[^\@\,]+\@[^\@\,]+\.[^\@\,]{2,}$/,
		url: /^(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})$/
},
stickerDefaults = {},
stckerOnStart,
sticker = function(){};

(function(){
/*
Cross Browser addEventListener
*/
var addEvent = function(obj, evt, fnc)
{
	if (obj.addEventListener)
	{
		obj.addEventListener(evt, fnc, false);
		return true;
	}

	else if (obj.attachEvent)
	{
		return obj.attachEvent('on' + evt, fnc);
	}

	else
	{
		evt = 'on' + evt;
		if (typeof obj[evt] === 'function')
		{
			fnc = (function(f1, f2)
			{
				return function()
				{
					f1.apply(this, arguments);
					f2.apply(this, arguments);
				}
			})(obj[evt], fnc);
		}
		obj[evt] = fnc;
		return true;
	}
	return false;
};

/*
Create drag event
*/
var addDragEvent = function() {},
	/*
	Function to get actual client X and Y
	*/
	getClientPosition = function(e)
	{
		return {
			x: (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX,
			y: (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY
		}
	};

(function()
{
	/*
	Drag cache for contain stuff
	*/
	var dragData = {
			element: null,
			dragging: false,
			startX: null,
			startY: null,
			disableMouse: false,
			enableMouseTimeout: false
		},
		/*
		Function to mouse/touch move
		*/
		pointerMove = function(e)
		{
			if (dragData.element && !dragData.dragging)
			{
				var position = getClientPosition(e),
					distX = position.x - dragData.startX,
					distY = position.y - dragData.startY,
					dist = Math.sqrt(distX * distX + distY * distY);

				if (dist > dragData.element.dragThreshold)
				{
					dragData.dragging = true;
					dragData.element.dragStart(e);
				}
			}

			if (dragData.element && dragData.dragging)
			{
				dragData.element.dragStep(e,
				{
					x: dragData.startX,
					y: dragData.startY
				});
			}
		},
		/*
		Function to mouse/touch up
		*/
		pointerUp = function(e)
		{
			if (dragData.element && dragData.dragging)
			{
				dragData.element.dragEnd(e);
				dragData.dragging = false;
			}
			if (dragData.element)
			{
				dragData.element.dragUp(e);
				dragData.element = null;
			}
		};

	/*
	Add event listeners
	*/
	addEvent(document, 'touchmove', pointerMove);
	addEvent(document, 'mousemove', pointerMove);
	addEvent(document, 'touchend', pointerUp);
	addEvent(document, 'touchcancel', pointerUp);
	addEvent(document, 'mouseup', pointerUp);

	/*
	Add main drag event function
	*/
	addDragEvent = function(element, options)
	{
		var blankFunction = function() {},
			pointerDown = function(e)
			{
				var position = getClientPosition(e);

				dragData.startX = position.x;
				dragData.startY = position.y;

				dragData.element = element;
				element.dragClick(e);
			};

		element.dragClick = (options && options.onClick) ? options.onClick : blankFunction;
		element.dragStart = (options && options.onStart) ? options.onStart : blankFunction;
		element.dragStep = (options && options.onDrag) ? options.onDrag : blankFunction;
		element.dragEnd = (options && options.onEnd) ? options.onEnd : blankFunction;
		element.dragUp = (options && options.onUp) ? options.onUp : blankFunction;
		element.dragElementUp = (options && options.onElementUp) ? options.onElementUp : blankFunction;
		element.dragThreshold = (options && options.threshold) ? options.threshold : 0;

		addEvent(element, 'touchstart', pointerDown);
		addEvent(element, 'mousedown', pointerDown);

		/*
		Touch up event to check if element is a touchend target
		*/
		var touchUp = function(e)
		{
			/*
			Check elementFromPoint support
			*/
			if (document.elementFromPoint)
			{
				var positionX = e.changedTouches[0].clientX,
					positionY = e.changedTouches[0].clientY,
					target = document.elementFromPoint(positionX, positionY);

				/*
				Check if target is getted element
				*/
				if (target === element)
				{
					element.dragElementUp(e);
				}
				else
				{
					/*
					If not, loop parents to get element
					*/
					var parent = target.parentNode;

					while (parent)
					{
						if (parent === element)
						{
							/*
							If parent is element, run event
							*/
							element.dragElementUp(e);
							break;
						}
						parent = parent.parentNode;
					}
				}
			}
			else
			{
				/*
				Run event if elementFromPoint support not found
				*/
				element.dragElementUp(e);
			}
		};

		addEvent(element, 'touchend', touchUp);
		addEvent(element, 'touchcancel', touchUp);
		addEvent(element, 'mouseup', function(e)
		{
			if (dragData.element && dragData.element === element)
				element.dragElementUp(e)
		});
	};

})();

/*
Function to outside click
*/
var outsideClick = false;

addEvent(document,'click',function(){
	if(outsideClick)
	{
		addClass(outsideClick,'hidden');
		outsideClick = false;
	}
});

/*
Function to class changes
*/
var hasClass = function(ele, cls)
	{
		return ele.className.match(new RegExp("(\\s+|^)" + cls + "(\\s+|$)"));
	},
	addClass = function(ele, cls)
	{
		if (!hasClass(ele, cls)) ele.className += " " + cls;
	},
	removeClass = function(ele, cls)
	{
		if (hasClass(ele, cls))
		{
			var reg = new RegExp("(\\s*|^)" + cls);
			ele.className = ele.className.replace(reg, "");
		}
	};

/*
Function to change normal input/textarea to sticker
*/
var stickerElement = function(element)
	{
		/*
		Create options variable
		*/
		var options = {
				type: 'text',
				appearance: 'text',
				state: 'normal',
				label: false,
				tip: false,
				errorTip: false,
				successTip: false,
				tipPosition: 'default',
				info: false,
				icon: false,
				iconPosition: 'default',
				validate: false,
				required: false,
				'required-info': false,
				'required-tip': 'This field is required',
				width: false,
				height: false,
				expand: false,
				mask: false,
				points: '5',
				min: 0,
				max: 1,
				step: 0.1,
				multiple: false,
				hideNumbers: false,
				uploadText: 'File',
				placeholder: 'Select',
				captcha: false,
				inputStyle: false,
				onlyError: false,
				value: '',
				disabled: false
			},
			defaultOptions = {},
			k, attribute,
			getElementAttribute = function(attribute)
			{
				var getted = element[attribute] || element.getAttribute(attribute);
				if (getted === "")
					getted = true;

				return getted;
			};

		/*
		Mix user config with default config
		*/
		for (k in stickerDefaults)
		{
			options[k] = stickerDefaults[k];
		};

		/*
		Get options from element
		*/
		for (k in options)
		{
			attribute = getElementAttribute(k);
			if (attribute)
			{
				options[k] = attribute;
			}
		};

		/*
		Save default options
		*/
		for (k in options)
		{
			defaultOptions[k] = options[k];
		};

		/*
		Change appearance
		*/
		if (element.type && element.tagName.toLowerCase() !== 'select')
		{
			options.appearance = element.type;
		}
		else
		{
			options.appearance = element.tagName.toLowerCase();
		}

		/*
		If element hasn't got onChange event - add it
		*/
		if(!element.onChange)
			element.onChange = function(){};

		/*
		Get appearance one more time
		*/
		(function()
		{
			attribute = getElementAttribute('appearance');
			if (attribute)
			{
				options['appearance'] = attribute;
			}
		})();

		/*
		Reset basic requied
		*/
		element.required = false;

		/*
		Create main elements
		*/
		var inputBox = document.createElement('div'),
			inputLabel = document.createElement('div'),
			inputTip = document.createElement('div'),
			inputErrorTip = document.createElement('div'),
			inputSuccessTip = document.createElement('div'),
			inputInfo = document.createElement('div'),
			inputElement,
			styleElement;

		/*
		Configure classes
		*/
		inputBox.className = 'input ' + options.appearance + 'Input';
		inputLabel.className = 'inputLabel';
		inputTip.className = 'inputTip ' + (options.tipPosition + 'Tip');
		inputErrorTip.className = 'inputTip error ' + (options.tipPosition + 'Tip');
		inputSuccessTip.className = 'inputTip success ' + (options.tipPosition + 'Tip');
		inputInfo.className = 'inputInfo';

		/*
		Add element to box and box to element's place
		*/
		element.parentNode.insertBefore(inputBox, element);

		/*
		LABEL
		Setup label
		*/
		if (options.label)
		{
			inputLabel.innerHTML = options.label;
			inputBox.appendChild(inputLabel);
		}

		/*
		Setup input
		*/
		inputBox.appendChild(element);

		/*
		SWITCH
		Only if appearance is "switch"
		*/
		if (options.appearance === 'switch')
		{
			/*
			Create switch elements
			*/
			var switchBox = document.createElement('div'),
				switchButton = document.createElement('div'),
				previousInfo = options.info,
				previousError = options.errorTip,
				checked = false;

			/*
			Setup main element
			*/
			inputElement = switchBox;
			styleElement = switchBox;

			/*
			Configure class names
			*/
			switchBox.className = 'switch' + (element.checked ? ' checked' : '');
			switchButton.className = 'switchButton';

			/*
			Add switch button to switch box
			*/
			switchBox.appendChild(switchButton);

			/*
			Add switch box to input box
			*/
			inputBox.appendChild(switchBox);

			/*
			Disable selection in IE
			*/
			switchBox.selectionStart = function()
			{
				return false
			};

			/*
			Function to set checked
			*/
			element.setChecked = function(newCheck,flag,flag2)
			{
				/*
				Set new checked value
				*/
				element.checked = newCheck;

				/*
				Set styles
				*/
				if (element.checked)
				{
					addClass(switchBox, 'checked');
					addClass(inputBox, 'inputChecked');
				}
				else
				{
					removeClass(switchBox, 'checked');
					removeClass(inputBox, 'inputChecked');
				}

				if (checked)
				{
					element.check();
				}
				if(!flag)
					element.onChange();

				/*
				Refresh others if radio
				*/
				if(options.type === 'radio' && !flag2)
				{
					var inputs = document.getElementsByTagName('input'),
						input;

					for(var i = 0, j = inputs.length; i<j; ++i)
					{
						input = inputs[i];
						if(input.setChecked && input !== element) input.setChecked(input.checked,false,true);
					}
				}
			}

			/*
			Element check
			*/
			element.check = function()
			{
				var error = false,
					message = '';

				if (options.required && !element.checked)
				{
					error = true;
					if (options['required-tip']) element.setErrorTip(options['required-tip']);
					if (options['required-info']) message += options['required-info'];
				}

				/*
				Configure on end
				*/
				if (!error)
				{
					if(!options.onlyError)
						element.setState('success');
					else
						element.setState('normal');
					element.setInfo(previousInfo);
					element.setErrorTip(previousError);
				}
				if (error)
				{
					element.setState('error');
					if(message)
						element.setInfo(message);
				}

				checked = true;

				return !error;
			}

			/*
			Tab-nav support
			*/
			addEvent(element, 'change', function()
			{
				element.setChecked(element.checked);
			});

			/*
			Fix for IE6 - not support onchange event correctly
			*/
			addEvent(element, 'keyup', function()
			{
				window.setTimeout(function()
				{
					element.setChecked(element.checked);
				}, 10);
			});

			/*
			Focus and blur classes
			*/
			addEvent(element, 'focus', function()
			{
				addClass(switchBox, 'focus');
				addClass(inputBox, 'inputFocus');
			});

			addEvent(element, 'blur', function()
			{
				removeClass(switchBox, 'focus');
				removeClass(inputBox, 'inputFocus');
			});

			/*
			Add drag events to change active state
			*/
			var dragged = false;

			addDragEvent(switchBox,
			{
				threshold: 20,
				onClick: function(e)
				{
					/*
					Add active class on press
					*/
					addClass(switchBox, 'active');
					addClass(inputBox, 'inputActive');

					/*
					Disable page scrolling
					*/
					if (e.preventDefault) e.preventDefault();
					if (e.stopPropagation) e.stopPropagation();
				},
				onStart: function(e)
				{
					dragged = true;
				},
				onDrag: function(e, start)
				{
					/*
					Get current position
					*/
					var pos = getClientPosition(e),
						lastChecked = element.checked;

					/*
					Set actual checked
					*/
					if (lastChecked !== start.x - pos.x < 0 && !element.disabled)
					{
						element.setChecked(start.x - pos.x < 0);
						lastChecked = element.checked;
					}
				},
				onUp: function(e)
				{
					/*
					Remove active class on up
					*/
					removeClass(switchBox, 'active');
					removeClass(inputBox, 'inputActive');
				},
				onElementUp: function(e)
				{
					/*
					Change checked value if element wasn't dragged
					*/
					if (!dragged && !element.disabled)
					{
						element.setChecked(!element.checked);
					}
				},
				onEnd: function(e)
				{
					dragged = false;
				}
			})
		};

		/*
		CHECKBOX, RADIO & ICONBOX
		Only if appearance is "switch"
		*/
		if (
			options.appearance === "checkbox" ||
			options.appearance === "radio" ||
			options.appearance === "iconbox"
		)
		{
			/*
			Create switch elements
			*/
			var switchBox = document.createElement('div'),
				switchButton = document.createElement('div'),
				previousInfo = options.info,
				previousError = options.errorTip,
				checked = false;

			/*
			Configure class names
			*/
			switchBox.className = options.appearance + (element.checked ? ' checked' : '');
			switchButton.className = options.appearance + 'Button';

			/*
			Add switch button to switch box
			*/
			switchBox.appendChild(switchButton);

			/*
			Setup main element
			*/
			inputElement = switchBox;
			styleElement = switchBox;

			/*
			Add switch box to input box
			*/
			inputBox.appendChild(switchBox);

			/*
			For iconbox
			*/
			if (options.appearance === 'iconbox')
			{
				switchBox.innerHTML = '<i class="' + options.icon + '"></i>';
			}

			/*
			Disable selection in IE
			*/
			switchBox.selectionStart = function()
			{
				return false
			};

			/*
			Function to set checked
			*/
			element.setChecked = function(newCheck,flag,flag2)
			{
				/*
				Set new checked value
				*/
				element.checked = newCheck;

				/*
				Set styles
				*/
				if (element.checked)
				{
					addClass(switchBox, 'checked');
					addClass(inputBox, 'inputChecked');
				}
				else
				{
					removeClass(switchBox, 'checked');
					removeClass(inputBox, 'inputChecked');
				}

				if (checked)
				{
					element.check();
				}
				if(!flag)
					element.onChange();

				/*
				Refresh others if radio
				*/
				if(options.type === 'radio' && !flag2)
				{
					var inputs = document.getElementsByTagName('input'),
						input;

					for(var i = 0, j = inputs.length; i<j; ++i)
					{
						input = inputs[i];
						if(input.setChecked && input !== element) input.setChecked(input.checked,false,true);
					}
				}
			}

			/*
			Element check
			*/
			element.check = function()
			{
				var error = false,
					message = '';

				if (options.required && !element.checked)
				{
					error = true;
					if (options['required-tip']) element.setErrorTip(options['required-tip']);
					if (options['required-info']) message += options['required-info'];
				}

				/*
				Configure on end
				*/
				if (!error)
				{
					if(!options.onlyError)
						element.setState('success');
					else
						element.setState('normal');
					element.setInfo(previousInfo);
					element.setErrorTip(previousError);
				}
				if (error)
				{
					element.setState('error');
					if(message)
						element.setInfo(message);
				}

				checked = true;

				return !error;
			}

			/*
			Tab-nav support
			*/
			addEvent(element, 'change', function()
			{
				element.setChecked(element.checked);
			});

			/*
			Fix for IE6 - not support onchange event correctly
			*/
			addEvent(element, 'keyup', function()
			{
				window.setTimeout(function()
				{
					element.setChecked(element.checked);
				}, 10);
			});

			/*
			Focus and blur classes
			*/
			addEvent(element, 'focus', function()
			{
				addClass(switchBox, 'focus');
				addClass(inputBox, 'inputFocus');
			});

			addEvent(element, 'blur', function()
			{
				removeClass(switchBox, 'focus');
				removeClass(inputBox, 'inputFocus');
			});

			/*
			Add drag events to change active state
			*/
			addDragEvent(switchBox,
			{
				onClick: function(e)
				{
					/*
					Add active class on press
					*/
					addClass(switchBox, 'active');
					addClass(inputBox, 'inputActive');

					/*
					Disable mouse events
					*/
					if (e.preventDefault) e.preventDefault();
					if (e.stopPropagation) e.stopPropagation();
				},
				onUp: function(e)
				{
					/*
					Remove active class on up
					*/
					removeClass(switchBox, 'active');
					removeClass(inputBox, 'inputActive');
				},
				onElementUp: function(e)
				{
					/*
					Change checked value if element wasn't dragged
					*/
					if (!element.disabled)
						element.setChecked(!element.checked);
				}
			})
		};

		/*
		INPUT, TEXTAREA &&  BIGTEXT
		Only if appearance is "switch"
		*/
		if (
			options.appearance === "text" ||
			options.appearance === "textarea" ||
			options.appearance === "bigtext"
		)
		{
			/*
			Setup element
			*/
			var textBox = document.createElement('div');
			textBox.className = options.appearance + (options.captcha?' captcha':'');
			inputElement = textBox;
			styleElement = textBox;

			textBox.appendChild(element);
			inputBox.appendChild(textBox);

			/*
			Set height
			*/
			if (options.appearance === 'textarea' && options.height)
			{
				styleElement.style.height = options.height;
			}

			/*
			Add icon if specifed
			*/
			if (options.icon)
			{
				var iconBox = document.createElement('div');
				iconBox.className = 'inputIcon';
				iconBox.innerHTML = '<i class="' + options.icon + '"></i>';
				addClass(inputBox, options.iconPosition + 'Icon');
				textBox.appendChild(iconBox);
			}

			/*
			Focus and blur classes
			*/
			addEvent(element, 'focus', function()
			{
				addClass(textBox, 'focus');
				addClass(inputBox, 'inputFocus');
				/*
				Set expand height
				*/
				if (options.appearance === 'textarea' && options.expand)
				{
					styleElement.style.height = options.expand;
				}
			});

			addEvent(element, 'blur', function()
			{
				removeClass(textBox, 'focus');
				removeClass(inputBox, 'inputFocus');
				/*
				Set previous height
				*/
				if (options.appearance === 'textarea' && options.expand)
				{
					if (options.height)
						styleElement.style.height = options.height;
					else
						styleElement.style.height = '';
				}
			});

			/*
			Options for masked input
			*/
			if (options.mask)
			{
				if (typeof $ !== 'undefined' && $.mask)
				{
					var maskParted = options.mask.split(""),
						placeholder = getElementAttribute('mask-placeholder'),
						maskOptions = {},
						i, j, newDef;

					for (i = 0, j = maskParted.length; i < j; ++i)
					{
						newDef = getElementAttribute('mask-' + maskParted[i]);

						if (newDef)
							$.mask.definitions[maskParted[i]] = newDef;
					}

					if (placeholder)
						maskOptions.placeholder = placeholder;

					$(element).mask(options.mask, maskOptions);
				}
				else
				{
					if (typeof console !== 'undefined' && console)
						console.warn('Load jQuery and Masked Input Plugin to use mask.')
				}
			}

			/*
			Setup validation
			*/
			if (options.validate)
			{
				var validateAttribute = (options.validate.length > 0) ? options.validate : '',
					validateList = validateAttribute.replace(/\s*\,\s*/gim, ',').split(','),
					validateRegexp = {},
					validateMessages = {},
					validateTips = {},
					validateName,
					newRegex,
					expression,
					flags,
					validateInput,
					previousError = options.errorTip,
					previousInfo = options.info,
					firstWrite = true;

				if (validateList[0] === "")
				{
					validateList = []
				}

				/*
				Get validate regexp, messages and tips
				*/
				for (var i = 0, j = validateList.length; i < j; ++i)
				{
					/*
					Basic setup
					*/
					validateName = validateList[i];
					newRegex = getElementAttribute('validate-' + validateName);
					validateMessages[validateName] = getElementAttribute('validate-' + validateName + '-info');
					validateTips[validateName] = getElementAttribute('validate-' + validateName + '-tip');

					/*
					Check if new regex is in attributes
					*/
					if (newRegex)
					{
						/*
						Get only expression
						*/
						expression = newRegex.match(/\/.*\//i);

						/*
						If expression exist
						*/
						if (expression)
						{
							expression = expression[0].replace(/^\/|\/$/ig, '');
							flags = newRegex.match(/[a-z]*$/i)[0];

							/*
							Set validation type to list
							*/
							validateRegexp[validateName] = new RegExp(expression, flags)
						}

					}
					else if (/((more\-than\-)|(less\-than\-))[0-9]+/.test(validateName))
					{
						if (/(more\-than\-)[0-9]+/.test(validateName))
							validateRegexp[validateName] = new RegExp('^[\\s\\S]{' + validateName.match(/[0-9]+$/)[0] + ',}');
						else
							validateRegexp[validateName] = new RegExp('^[\\s\\S]{0,' + validateName.match(/[0-9]+$/)[0] + '}');
					}
					else
					{
						/*
						Set validation type to list
						*/
						validateRegexp[validateName] = stickerValidate[validateName];
					}
				}

				/*
				After getting validate options, setup validation
				*/
				var validateInput = function(testValue)
				{
					var k,
						error = false,
						errorNum = 0,
						message = '';

					/*
					Test every regexp
					*/
					for (k in validateRegexp)
					{
						if (!validateRegexp[k].test(testValue))
						{
							/*
							Set errors tips and generate message
							*/
							if (validateTips[k]) element.setErrorTip(validateTips[k]);
							if (validateMessages[k])
							{
								message += (errorNum > 0 ? '<br/>' : '') + validateMessages[k];
								errorNum++;
							}
							error = true;
						}
					}

					if (options.required && testValue === '')
					{
						if (options['required-tip']) element.setErrorTip(options['required-tip']);
						if (options['required-info']) message += (errorNum > 0 ? '<br/>' : '') + options['required-info'];
						error = true;
					}

					/*
					Configure on end
					*/
					if (!error)
					{
						if(!options.onlyError)
							element.setState('success');
						else
							element.setState('normal');
						element.setInfo(previousInfo);
						element.setErrorTip(previousError);
					}
					if (error)
					{
						element.setState('error');
						if(message)
							element.setInfo(message);
					}

					return !error;
				}

				/*
				Configure events
				*/
				if (options.state === 'error')
					firstWrite = false;

				addEvent(element, 'input', function()
				{
					if (!firstWrite)
						validateInput(element.value);
				});
				/*
				Fix for IE6
				*/
				addEvent(element, 'keyup', function()
				{
					if (!firstWrite)
						validateInput(element.value);
				});
				addEvent(element, 'change', function()
				{
					if (firstWrite)
					{
						validateInput(element.value);
						firstWrite = false;
					}
				})

				/*
				Element check
				*/
				element.check = function()
				{
					firstWrite = false;
					return validateInput(element.value);
				}
			}
			/*
			If captcha
			*/
			else if( options.captcha )
			{
				var previousInfo = options.info,
					previousError = options.errorTip,
					checked = false;
				/*
				Create captcha elements
				*/
				var captchaImage = new Image();
				captchaImage.src = options.captcha;
				captchaImage.className = 'captcha';

				/*
				Add refresh event
				*/
				addEvent(captchaImage,'click',function(){
					captchaImage.src = options.captcha;
				})

				/*
				Set captcha flag
				*/
				element.isCaptcha = true;

				/*
				Set reset function to refresh captcha too
				*/
				element.reset = function()
				{
					if(element.setValue)
						element.setValue(options.value);
					else
						element.value = options.value;

					captchaImage.src = options.captcha;

					if(defaultOptions.disabled) element.setState('disabled');
					else element.setState(defaultOptions.state);
					element.setTip(defaultOptions.tip);
					element.setErrorTip(defaultOptions.errorTip);
					element.setSuccessTip(defaultOptions.successTip);
					element.setInfo(defaultOptions.info);
				};

				/*
				Add check event
				*/
				element.check = function(onSuccess)
				{
					/*
					activeX versions to check for in IE
					*/
					var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"],
					mypostrequest;

					if (window.ActiveXObject)
					{
						for (var i=0; i<activexmodes.length; i++)
						{
							try
							{
								mypostrequest = new ActiveXObject(activexmodes[i]);
							}
							catch(e)
							{
							}
						}
					}
					else if (window.XMLHttpRequest)
						mypostrequest = new XMLHttpRequest();
					else
						return false;


					mypostrequest.onreadystatechange=function(){
						if (mypostrequest.readyState == 4)
						{
							if (mypostrequest.status == 200)
							{
								var error = false;

								if(mypostrequest.responseText == 'success')
								{
									if(!options.onlyError)
										element.setState('success');
									else
										element.setState('normal');
									onSuccess();
								}
								else
								{
									element.setState('error');
									element.value = '';
									captchaImage.src = options.captcha;
								}
							}
							else{
								element.value = 'Error';
							}
						}
					}

					var parameters="captcha="+element.value;
					mypostrequest.open("POST", options.captcha, true);
					mypostrequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
					mypostrequest.send(parameters);
				}

				textBox.appendChild(captchaImage);
			}
			/*
			If element hasn't validate
			*/
			else
			{
				/*
				Variables
				*/
				var previousInfo = options.info,
					previousError = options.errorTip,
					checked = false;

				/*
				Element check
				*/
				element.check = function()
				{
					var error = false,
						message = '';

					if (options.required && element.value === "")
					{
						error = true;
						if (options['required-tip']) element.setErrorTip(options['required-tip']);
						if (options['required-info']) message += options['required-info'];
					}

					/*
					Configure on end
					*/
					if (!error)
					{
						if(!options.onlyError)
							element.setState('success');
						else
							element.setState('normal');
						element.setInfo(previousInfo);
						element.setErrorTip(previousError);
					}
					if (error)
					{
						element.setState('error');
						if(message)
							element.setInfo(message);
					}

					checked = true;

					return !error;
				}

				/*
				Events
				*/
				addEvent(element, 'input', function()
				{
					if (checked)
						element.check()
				});
				/*
				Fix for IE6
				*/
				addEvent(element, 'keyup', function()
				{
					if (checked)
						element.check()
				});
			};

			addEvent(element,'change',function(){
				if(element.onChange) element.onChange();
			})
		};

		/*
		FILE
		Only for file input
		*/
		if (options.appearance === "file")
		{
			/*
			Create drag elements
			*/
			var fileBox = document.createElement('div'),
				fileText = document.createElement('div'),
				fileButton = document.createElement('div'),
				checked = false,
				previousInfo = options.info,
				previousError = options.errorTip,
				checked = false;

			/*
			Configure box
			*/
			fileBox.appendChild(fileText);
			fileBox.appendChild(fileButton);

			fileButton.innerHTML = options.uploadText;

			inputElement = fileBox;
			styleElement = fileBox;

			/*
			Configure classes
			*/
			fileBox.className = "file";
			fileText.className = "fileText";
			fileButton.className = "fileButton";

			/*
			Add fileBox to inputBox
			*/
			inputBox.appendChild(fileBox);

			/*
			Configure mouse events
			*/
			addDragEvent(fileBox,
			{
				onElementUp: function(e)
				{
					if(!element.disabled)
						element.click();
					if(e.preventDefault) e.preventDefault();
					if(e.stopPropagation) e.stopPropagation();
				}
			});

			/*
			Element check
			*/
			element.check = function()
			{
				var error = false,
					message = '';

				if (options.required && element.value === "")
				{
					error = true;
					if (options['required-tip']) element.setErrorTip(options['required-tip']);
					if (options['required-info']) message += options['required-info'];
				}

				/*
				Configure on end
				*/
				if (!error)
				{
					if(!options.setErrorTip)
						element.setState('success');
					else
						element.setState('normal');
					element.setInfo(previousInfo);
					element.setErrorTip(previousError);
				}
				if (error)
				{
					element.setState('error');
					if(message)
						element.setInfo(message);
				}

				checked = true;

				return !error;
			}

			/*
			Add onchange event
			*/
			addEvent(element, 'change', function()
			{
				var newValue = element.value.match(/[^\/\\]+/gim);
				if (newValue)
					fileText.innerHTML = newValue.pop();
				else
					fileText.innerHTML = '';

				if (checked)
					element.check()

				element.onChange();
			});
		};

		/*
		RATE
		Only for rate appearance
		*/
		if (options.appearance === 'rate')
		{
			/*
			Create main element
			*/
			var rateBox = document.createElement('div'),
				pointsList = [],
				points = options.points * 1,
				setted = false,
				previousInfo = options.info,
				previousError = options.errorTip,
				checked = false;

			inputElement = rateBox;
			styleElement = rateBox;

			/*
			Configure styles
			*/
			rateBox.className = 'rate';

			/*
			Configure
			*/
			for (var i = 0; i < points; ++i)
			{
				(function()
				{
					var pointBox = document.createElement('span'),
						id = i + 1;

					pointBox.className = options.icon;

					/*
					Configure mouseover
					*/
					addEvent(pointBox, 'mouseenter', function()
					{
						for (var i = 0; i < id; ++i)
						{
							addClass(pointsList[i], 'active');
						}
					});

					/*
					Configure mouseout
					*/
					addEvent(pointBox, 'mouseleave', function()
					{
						for (var i = 0; i < points; ++i)
						{
							removeClass(pointsList[i], 'active');
						}
					});

					/*
					Drag event using to changing value
					*/
					addDragEvent(pointBox,
					{
						onClick: function()
						{
							if(!element.disabled)
								element.setValue(id);
						}
					})

					pointsList.push(pointBox);

					rateBox.appendChild(pointBox);
				})();
			};

			/*
			setValue function
			*/
			element.setValue = function(newValue,flag)
			{
				newValue = parseInt(newValue);

				element.value = newValue;

				for (var i = 0; i < points; ++i)
				{
					removeClass(pointsList[i], 'checked');
				}

				for (var i = 0; i < newValue; ++i)
				{
					addClass(pointsList[i], 'checked');
				}

				if(!flag)
					setted = true;

				if (checked)
				{
					element.check();
				}
				if(!flag && element.onChange)
					element.onChange();
			}

			/*
			Check
			*/
			element.check = function()
			{
				var error = false,
					message = '';

				if (options.required && !setted)
				{
					error = true;
					if (options['required-tip']) element.setErrorTip(options['required-tip']);
					if (options['required-info']) message += options['required-info'];
				}

				/*
				Configure on end
				*/
				if (!error)
				{
					if(!options.onlyError)
						element.setState('success');
					else
						element.setState('normal');
					element.setInfo(previousInfo);
					element.setErrorTip(previousError);
				}
				if (error)
				{
					element.setState('error');
					element.setInfo(message);
				}

				checked = true;

				return !error;
			}

			/*
			Set value on start
			*/
			if(element.value)
				element.setValue( element.value*1, true );

			/*
			Add rate box to main input
			*/
			inputBox.appendChild(rateBox);
		};

		/*
		RANGE
		Only for range appearance
		*/
		if (options.appearance === 'range')
		{
			/*
			Create range elements
			*/
			var rangeBox = document.createElement('div'),
				rangeLine = document.createElement('div'),
				rangeFill = document.createElement('div'),
				rangeButton1 = document.createElement('div'),
				rangeButton2 = document.createElement('div'),
				rangeText1 = document.createElement('div'),
				rangeText2 = document.createElement('div'),
				rangeMin = document.createElement('div'),
				rangeMax = document.createElement('div'),
				value1,
				value2,
				min = options.min * 1,
				max = options.max * 1,
				step = options.step * 1,
				button1Left = 0,
				button2Left = 0;

			inputElement = rangeBox;
			styleElement = rangeBox;

			/*
			Configure classes
			*/
			rangeBox.className = 'range' + (options.hideNumbers ? ' hiddenNumbers' : '');
			rangeLine.className = 'rangeLine';
			rangeFill.className = 'rangeFill';
			rangeButton1.className = 'rangeButton';
			rangeButton2.className = 'rangeButton';
			rangeText1.className = 'rangeText';
			rangeText2.className = 'rangeText';
			rangeMin.className = 'rangeMin';
			rangeMax.className = 'rangeMax';

			/*
			Configure elemens
			*/
			rangeMin.innerHTML = min;
			rangeMax.innerHTML = max;

			/*
			Normalize value
			*/
			var normalizeValue = function(newValue, flag)
			{
				if (flag)
				{
					/*
					If you want to calculate min-able value
					*/
					if (flag === 'min')
						return Math.round((Math.ceil(newValue / step) * step) * 10000000000) / 10000000000;
					/*
					Same for max-able
					*/
					else
						return Math.round((Math.floor(newValue / step) * step) * 10000000000) / 10000000000;
				}
				else
				/*
				Regular rounding
				*/
					return Math.round((Math.round(newValue / step) * step) * 10000000000) / 10000000000;
			}

			/*
			Set value function
			*/
			element.setValue = function(newValue1, newValue2, flag, flag2)
			{
				/*
				Declare main variables
				*/
				var lineWidth = rangeLine.offsetWidth,
					buttonWidth = rangeButton1.offsetWidth,
					halfButton = buttonWidth / 2,
					offsetWidth = lineWidth - buttonWidth;

				/*
				Case for multiple range
				*/
				if (options.multiple)
				{
					/*
					Normalize values
					*/
					newValue1 = normalizeValue(newValue1);
					newValue2 = normalizeValue(newValue2);

					/*
					Check if 1st value is in range
					*/
					if (newValue1 < min)
						newValue1 = normalizeValue(min, 'min');
					if (newValue1 > max)
						newValue1 = normalizeValue(max, 'max');

					/*
					Check if 1st value is less than 2nd
					*/
					if (newValue1 > newValue2 && flag === 1)
						newValue1 = newValue2;

					/*
					Check if 2nd value is in range
					*/
					if (newValue2 < min)
						newValue2 = normalizeValue(min, 'min');
					if (newValue2 > max)
						newValue2 = normalizeValue(max, 'max');

					/*
					Check if 2nd value is greaten than 1st
					*/
					if (newValue2 < newValue1 && flag === 2)
						newValue2 = newValue1;

					/*
					Calculate percent (to display buttons)
					*/
					var percent1 = (newValue1 - min) / (max - min),
						percent2 = (newValue2 - min) / (max - min);

					/*
					Calculate buttons positions
					*/
					button1Left = offsetWidth * percent1 + halfButton;
					button2Left = offsetWidth * percent2 + halfButton;

					/*
					Setup range fill
					*/
					rangeFill.style.width = (button2Left - button1Left) + 'px';
					rangeFill.style.marginLeft = button1Left + 'px';

					/*
					Set text
					*/
					rangeText1.innerHTML = '<span>' + newValue1 + '</span>';
					rangeText2.innerHTML = '<span>' + newValue2 + '</span>';

					/*
					Style range buttons
					*/
					rangeButton1.style.left = rangeText1.style.left = button1Left + 'px';
					rangeButton2.style.left = rangeText2.style.left = button2Left + 'px';

					if(Math.abs(button1Left - button2Left) < 40)
					{
						rangeText2.style.display = 'none';
						rangeText1.innerHTML = '<span>' + newValue1 + ' - ' + newValue2 + '</span>';
						rangeText1.style.left = (button1Left + button2Left)/2 + 'px';
					}
					else
					{
						rangeText2.style.display = '';
					}

					/*
					Oversave values
					*/
					value1 = newValue1;
					value2 = newValue2;

					/*
					Set element value
					*/
					element.value = newValue1 + ',' + newValue2;
				}
				/*
				Case for single range
				*/
				else
				{
					/*
					Normalize value
					*/
					newValue1 = normalizeValue(newValue1);

					/*
					Check if value is in range
					*/
					if (newValue1 < min)
						newValue1 = normalizeValue(min, 'min');
					if (newValue1 > max)
						newValue1 = normalizeValue(max, 'max');

					/*
					Calculate percent to display button
					*/
					var percent1 = (newValue1 - min) / (max - min);

					/*
					Calculate buttons left position
					*/
					button1Left = offsetWidth * percent1 + halfButton;

					/*
					Set text
					*/
					rangeText1.innerHTML = '<span>' + newValue1 + '</span>';

					/*
					Setup styles
					*/
					rangeFill.style.width = button1Left + 'px';
					rangeButton1.style.left = rangeText1.style.left = offsetWidth * percent1 + halfButton + 'px';

					/*
					Oversave value
					*/
					value1 = newValue1;

					/*
					Setup element value
					*/
					element.value = newValue1;
				}

				if(!flag2)
					element.onChange();
			};

			/*
			Drag event
			*/
			(function()
			{
				/*
				Setup start variables
				*/
				var lineWidth,
					buttonWidth,
					halfButton,
					offsetWidth,
					startX,
					startButtonLeft;

				/*
				Add drag event to #1 button
				*/
				addDragEvent(rangeButton1,
				{
					onClick: function(e)
					{
						/*
						Setup start vars
						*/
						lineWidth = rangeLine.offsetWidth;
						buttonWidth = rangeButton1.offsetWidth;
						halfButton = buttonWidth / 2;
						offsetWidth = lineWidth - buttonWidth;
						startButtonLeft = button1Left;
						startX = getClientPosition(e).x;

						/*
						Disable "untouchable" bug
						*/
						if (options.multiple)
							rangeLine.insertBefore(rangeButton2, rangeButton1, 1);

						/*
						Add class
						*/
						addClass(rangeButton1,'active');
						addClass(rangeBox,'active');

						/*
						Disable page scrolling
						*/
						if (e.preventDefault) e.preventDefault();
						if (e.stopPropagation) e.stopPropagation();
					},
					onDrag: function(e)
					{
						/*
						Calculate new X and buttons position
						*/
						var newX = getClientPosition(e).x;
						button1Left = (newX - startX) + startButtonLeft;

						/*
						Calculate percent and set value
						*/
						var percent = (button1Left - halfButton) / offsetWidth,
							newValue = (max - min) * percent + min;

						if(!element.disabled)
							element.setValue(newValue, value2, 1);
					},
					onUp: function(e)
					{
						/*
						Remove class
						*/
						removeClass(rangeButton1,'active');
						removeClass(rangeBox,'active');
					}
				});

				/*
				Add drav event to #2 button
				*/
				addDragEvent(rangeButton2,
				{
					onClick: function(e)
					{
						/*
						Setup start vars
						*/
						lineWidth = rangeLine.offsetWidth;
						buttonWidth = rangeButton1.offsetWidth;
						halfButton = buttonWidth / 2;
						offsetWidth = lineWidth - buttonWidth;
						startButtonLeft = button2Left;
						startX = getClientPosition(e).x;

						/*
						Disable "untouchable" bug
						*/
						rangeLine.insertBefore(rangeButton1, rangeButton2, 2);

						/*
						Add class
						*/
						addClass(rangeButton2,'active');
						addClass(rangeBox,'active');

						/*
						Disable page scrolling
						*/
						if (e.preventDefault) e.preventDefault();
						if (e.stopPropagation) e.stopPropagation();
					},
					onDrag: function(e)
					{
						/*
						Calculate new X and buttons position
						*/
						var newX = getClientPosition(e).x;
						button2Left = (newX - startX) + startButtonLeft;

						/*
						Calculate percent and set value
						*/
						var percent = (button2Left - halfButton) / offsetWidth,
							newValue = (max - min) * percent + min;

						if(!element.disabled)
							element.setValue(value1, newValue, 2);
					},
					onUp: function(e)
					{
						/*
						Remove class
						*/
						removeClass(rangeButton2,'active');
						removeClass(rangeBox,'active');
					}
				});
			})();

			/*
			Set value on start
			Timeout is for getting elements sizes
			*/
			window.setTimeout(function()
			{
				if (options.multiple)
				{
					var values = element.value.split(","),
						value1 = values[0] ? values[0] : min,
						value2 = values[1] ? values[1] : max;

					element.setValue(value1, value2, 1, true);
				}
				else
				{
					element.setValue(element.value,0,1,true);
				}
			}, 1);

			/*
			Add resize event
			*/
			addEvent(window,'resize',function(){
				if (options.multiple)
				{
					var values = element.value.split(","),
						value1 = values[0] ? values[0] : min,
						value2 = values[1] ? values[1] : max;

					element.setValue(value1, value2, 1, true);
				}
				else
				{
					element.setValue(element.value,0,1,true);
				}
			});

			/*
			Configure boxes
			*/
			rangeLine.appendChild(rangeFill);
			rangeLine.appendChild(rangeButton1);
			if (options.multiple)
				rangeLine.appendChild(rangeButton2);
			rangeLine.appendChild(rangeText1);
			if (options.multiple)
				rangeLine.appendChild(rangeText2);

			rangeBox.appendChild(rangeLine);
			if (!options.hideNumbers)
			{
				rangeBox.appendChild(rangeMin);
				rangeBox.appendChild(rangeMax);
			}

			/*
			Add to main input
			*/
			inputBox.appendChild(rangeBox);
		};

		/*
		SELECT APPEARANCE
		FOR SELECT ONLY
		*/
		if (options.appearance === 'select')
		{
			/*
			Create select element
			*/
			var selectBox = document.createElement('div'),
				selectList = document.createElement('div'),
				selectText = document.createElement('div'),
				selectIcon = document.createElement('icon');

			inputElement = selectBox;
			styleElement = selectBox;

			selectBox.appendChild(selectText);
			selectBox.appendChild(selectList);
			inputBox.appendChild(selectBox);

			selectText.innerHTML = options.placeholder;

			if(options.icon)
			{
				selectIcon.innerHTML = '<i class="'+options.icon+'"></i>';
				addClass(inputBox, options.iconPosition + 'Icon');
				selectBox.appendChild(selectIcon);
			}

			/*
			Configure class
			*/
			selectBox.className = 'select' + (options.multiple ? ' multiple' : ' single');
			selectList.className = 'selectList' + (options.multiple ? '' : ' hidden');
			selectText.className ='selectText';
			selectIcon.className = 'inputIcon';

			/*
			Enable better scrollbar
			*/
			if(typeof $ !== 'undefined' && $.fn.perfectScrollbar)
			{
				selectList.style.overflow = 'hidden';
				$(selectList).perfectScrollbar();
				addEvent(selectList,'mouseenter',function(){
					$(selectList).perfectScrollbar('update');
				})
			}

			/*
			If single add event on click to show list
			*/
			if(!options.multiple)
			{
				addEvent(selectText,'click',function(e){
					if(!element.disabled)
					{
						if(outsideClick)
						{
							addClass(outsideClick,'hidden');
						}
						
						if(outsideClick !== selectList)
						{
							removeClass(selectList, 'hidden');
							outsideClick = selectList;
						}
						else
						{
							addClass(selectList, 'hidden');
							outsideClick = false;
						}
						if(e.stopPropagation) e.stopPropagation();
						if(e.preventDefault) e.preventDefault();
					}
				});
				/*
				Disable propagination to list
				*/
				addEvent(selectList,'click',function(e){
					if(e.stopPropagation) e.stopPropagation();
					if(e.preventDefault) e.preventDefault();
				});
			}

			/*
			Configure stage
			*/
			var optionsList = element.children,
				option,
				elementsList = [],
				checked = false,
				wasSelected = false;

			var addOption = function(option, inGroup)
			{
				var optionBox = document.createElement('div');
				optionBox.className = 'selectItem' + (inGroup?' ingroup':'');

				/*
				Add element to elements list for slider
				*/
				elementsList.push(optionBox)

				/*
				Set text
				*/
				optionBox.appendChild(document.createTextNode(option.innerHTML));

				/*
				In multiple add checkboxes
				*/
				if(options.multiple)
				{
					var multiCheck = document.createElement('input');
					multiCheck.type = 'checkbox';
					multiCheck.appearance = 'radio';
					multiCheck.checked = option.selected;
					multiCheck.disabled = option.disabled;
					optionBox.appendChild(multiCheck);
					stickerElement(multiCheck);
					multiCheck.check = false;

					if(option.disabled)
					{
						addClass(optionBox,'disabled');
					}

					if(option.selected)
					{
						addClass(optionBox,'checked');
					}

					/*
					Set selected on checkbox change
					*/
					multiCheck.onChange = function()
					{
						option.selected = multiCheck.checked;
						if(option.selected)
						{
							addClass(optionBox,'checked');
						}
						else
						{
							removeClass(optionBox,'checked');
						}

						if(checked)
							element.check();
					}

					/*
					Set focus and blur events
					*/
					addEvent(multiCheck,'focus',function(){
						addClass(optionBox,'focus');

						/*
						Scroll to this element
						*/
						var offset = 0;

						for(var i = 0, j = elementsList.length; i<j; ++i)
						{
							if(elementsList[i] !== optionBox)
							{
								offset += elementsList[i].offsetHeight;
							}
							else
							{
								break;
							}
						}

						selectList.scrollTop = offset;
					});
					addEvent(multiCheck,'blur',function(){
						removeClass(optionBox,'focus');
					});
				}
				else
				{
					/*
					Configure
					*/
					if(option.selected)
					{
						selectText.innerHTML = option.innerHTML;
					}
					if(option.disabled)
					{
						addClass(optionBox,'disabled');
					}
					else
					{
						/*
						Set click
						*/
						addEvent(optionBox,'click',function(e){
							option.selected = true;
							selectText.innerHTML = option.innerHTML;
							addClass(selectList,'hidden');
							outsideClick = false;
							wasSelected = true;
							if(checked)
								element.check();
						})
					}
				}

				/*
				Add option to list
				*/
				selectList.appendChild(optionBox);
			};

			/*
			Process all option elements
			*/
			for (var i = 0, j = optionsList.length; i < j; ++i)
			{
				option = optionsList[i];

				/*
				For option tag
				*/
				if(option.tagName.toLowerCase() === 'option')
				{
					addOption(option);
				}
				/*
				For group tag to loop its options
				*/
				else if (option.tagName.toLowerCase() === 'optgroup')
				{
					/*
					Add header
					*/
					var selectHeader = document.createElement('div'),
						label = option['label'] || option.getAttribute('label') || '';

					selectHeader.innerHTML = label;
					selectHeader.className = 'selectHeader';

					selectList.appendChild(selectHeader);

					/*
					Get all options in group
					*/
					var inOptions = option.getElementsByTagName('option');

					/*
					Loop group options
					*/
					for (var k = 0, l = inOptions.length; k < l; ++k)
					{
						addOption(inOptions[k], true);
					}
				}
			}

			/*
			Set check function
			*/
			element.check = function()
			{
				/*
				Get all options elements for check selected num
				*/
				var selectOptions = element.getElementsByTagName('option'),
					selectNum = 0,
					error = false;

				/*
				Get number of selected
				*/
				for(var i = 0, j = selectOptions.length; i<j; ++i)
				{
					if(selectOptions[i].selected)
						selectNum++;
				}

				/*
				If multiple, max & min
				*/
				if(options.multiple)
				{
					if(options.max && options.max*1 < selectNum)
						error = true;
					if(options.min && options.min*1 > selectNum)
						error = true;
				}

				/*
				If single and required
				*/
				if(options.required && !wasSelected)
				{
					error = true;
				}

				/*
				Set state
				*/
				if(error)
				{
					element.setState('error');
				}
				else
				{
					if(!options.onlyError)
						element.setState('success');
					else
						element.setState('normal');
				}

				checked = true;

				return !error;
			}
		}

		/*
		SETUP STYLES
		*/
		/*
		Style box
		*/
		if(element.style) inputBox.style.cssText = element.style.cssText;
		element.style.cssText = '';

		/*
		Style element
		*/
		if(!styleElement) styleElement = element;
		if(options.inputStyle) styleElement.style.cssText = options.inputStyle;
		if(options.width) styleElement.style.width = options.width;
		if(options.height) styleElement.style.height = options.height;

		/*
		Setup reset function to reset value
		*/
		if(!element.reset)
		{
			element.reset = function()
			{
				if(element.setValue)
					element.setValue(defaultOptions.value);
				else
					element.value = defaultOptions.value;

				if(defaultOptions.disabled) element.setState('disabled');
				else element.setState(defaultOptions.state);
				element.setTip(defaultOptions.tip);
				element.setErrorTip(defaultOptions.errorTip);
				element.setSuccessTip(defaultOptions.successTip);
				element.setInfo(defaultOptions.info);
			};
		}

		/*
		SETUP FEATURES
		After adding main input add some features
		*/
		inputBox.appendChild(inputInfo);
		inputBox.appendChild(inputTip);
		inputBox.appendChild(inputSuccessTip);
		inputBox.appendChild(inputErrorTip);

		/*
		setState function
		*/
		element.setState = function(newState)
		{
			removeClass(inputBox, options.state);
			if (inputElement)
				removeClass(inputElement, options.state);

			options.state = newState;

			addClass(inputBox, options.state);
			if (inputElement)
				addClass(inputElement, options.state);

			if (newState === 'disabled')
			{
				element.disabled = true;
			}
			else
			{
				element.disabled = false;
			}

			addClass(inputTip, 'hidden');
			addClass(inputErrorTip, 'hidden');
			addClass(inputSuccessTip, 'hidden');

			switch (newState)
			{
				case 'normal':
					if (options.tip) removeClass(inputTip, 'hidden');
					break;
				case 'error':
					if (options.errorTip) removeClass(inputErrorTip, 'hidden');
					break;
				case 'success':
					if (options.successTip) removeClass(inputSuccessTip, 'hidden');
					break;
			}

			return element;
		}

		/*
		getState function
		*/
		element.getState = function()
		{
			return options.state;
		}

		/*
		Function to set tip
		*/
		element.setTip = function(newTip)
		{
			options.tip = newTip;

			if (options.tip)
			{
				inputTip.innerHTML = newTip;
			}

			if (options.state === 'normal' && options.tip)
			{
				removeClass(inputTip, 'hidden');
			}
			else
			{
				addClass(inputTip, 'hidden');
			}

			return element;
		}

		/*
		Function to set error tip
		*/
		element.setErrorTip = function(newTip)
		{
			options.errorTip = newTip;

			if (options.errorTip)
			{
				inputErrorTip.innerHTML = newTip;
			}

			if (options.state === 'error' && options.errorTip)
			{
				removeClass(inputErrorTip, 'hidden');
			}
			else
			{
				addClass(inputErrorTip, 'hidden');
			}

			return element;
		}

		/*
		Function to set success tip
		*/
		element.setSuccessTip = function(newTip)
		{
			options.successTip = newTip;

			if (options.successTip)
			{
				inputSuccessTip.innerHTML = newTip;
			}

			if (options.state === 'success' && options.successTip)
			{
				removeClass(inputSuccessTip, 'hidden');
			}
			else
			{
				addClass(inputSuccessTip, 'hidden');
			}

			return element;
		}

		/*
		Function to set info
		*/
		element.setInfo = function(newInfo)
		{
			options.info = newInfo;

			if (options.info)
			{
				removeClass(inputInfo, 'hidden');
				inputInfo.innerHTML = newInfo;
			}
			else
			{
				addClass(inputInfo, 'hidden');
			}

			return element;
		}

		/*
		Configure all on end
		*/
		if(element.disabled) element.setState('disabled');
		else element.setState(options.state);
		element.setTip(options.tip);
		element.setErrorTip(options.errorTip);
		element.setSuccessTip(options.successTip);
		element.setInfo(options.info);
	},

	stickerForm = function(element)
	{
		element.onsubmit = function()
		{
			element.check(function(){
				element.submit();
			});

			return false;
		};

		element.reset = function()
		{
			var elements = [
				element.getElementsByTagName('input'),
				element.getElementsByTagName('textarea'),
				element.getElementsByTagName('select')
			],
			ele;

			for(var i = 0; i<3; ++i)
			{
				for(var j = 0, k = elements[i].length; j<k; ++j)
				{
					ele = elements[i][j];
					if(ele.reset) ele.reset();
				}
			}
		}

		element.check = function( onSuccess )
		{

			var inputs = element.getElementsByTagName('input'),
				textareas = element.getElementsByTagName('textarea'),
				selects = element.getElementsByTagName('select'),
				captcha = [],
				i, j,
				error = false;

			for (i = 0, j = inputs.length; i < j; ++i)
			{
				if(!inputs[i].isCaptcha)
				{
					var test = (inputs[i].check && !inputs[i].disabled) ? inputs[i].check() : true;
					if (!test)
						error = true;
				}
				else
				{
					captcha.push(inputs[i]);
				}
			}
			for (i = 0, j = textareas.length; i < j; ++i)
			{
				var test = (textareas[i].check && !textareas[i].disabled) ? textareas[i].check() : true;
				if (!test)
					error = true;
			}
			for (i = 0, j = selects.length; i < j; ++i)
			{
				var test = (selects[i].check && !selects[i].disabled) ? selects[i].check() : true;
				if (!test)
					error = true;
			}

			/*
			Check captcha if no errors
			*/
			var successed = 0;
			if(!error && captcha.length > 0)
			{
				for (i = 0, j = captcha.length; i < j; ++i)
				{
					captcha[i].check(function(){
						successed++;
						if(successed === captcha.length)
						{
							onSuccess();
						}
					});
				}
			}
			else
			{
				if(!error)
				{
					onSuccess();
				}
			}
		};
	};

	sticker = function(element)
	{

		if (!element)
			element = document;

		var tagName = (element.tagName) ? element.tagName.toLowerCase() : '';

		if (tagName === 'input' || tagName === 'textarea')
		{
			stickerElement(element);
		}
		else if (tagName === 'form')
		{
			stickerForm(element);
		}
		else
		{
			var inputs = element.getElementsByTagName('input'),
				forms = element.getElementsByTagName('form'),
				textareas = element.getElementsByTagName('textarea'),
				selects = element.getElementsByTagName('select'),
				i, j;

			for (i = 0, j = inputs.length; i < j; ++i)
			{
				if(!inputs[i].formified) stickerElement(inputs[i]);
				inputs[i].formified = true;
			}
			for (i = 0, j = textareas.length; i < j; ++i)
			{
				if(!textareas[i].formified) stickerElement(textareas[i]);
				textareas[i].formified = true;
			}
			for (i = 0, j = selects.length; i < j; ++i)
			{
				if(!selects[i].formified) stickerElement(selects[i]);
				selects[i].formified = true;
			}
			for (i = 0, j = forms.length; i < j; ++i)
			{
				if(!forms[i].formified) stickerForm(forms[i]);
				forms[i].formified = true;
			}
		}

	}
})();