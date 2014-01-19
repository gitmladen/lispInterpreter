// var kod = '(+ 2 (- 5 4) (* 1 (13 42) 2) )';
// var kod = '(defun square (x) (* x x))   (square 4)';
// var lexerTest = function (l) {
// 	console.log('input: ' + l);
// 	console.log('replace multy: ' + l.replace(/ +/g, ' '));
// }
// lexerTest('d               sda sd    ads asd    das');

(function() {

	var preSplit = function(line) {
		line = line.replace(/ +/g, ' ');
		return line.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
	};

	//lexer
	var scan = function(str) {
		var ret = new Array();
		var read = false;
		var curr = "";
		// var skip = false;
		// var skipChar = "";
		for (var i = 0; i < str.length; i++) {
			var c = str.charAt(i);
			if (c == " ") {
				if (read) {
					ret.push(curr);
				}
				curr = "";
				read = false;
			} else {
				curr += c;
				if (!read) read = true;
			}
		}
		console.log('Lexical stage: ');
		console.log(ret);
		console.log('======================================');
		return ret;
	};

	// s ( (d s ) ( ) ) ( ((das) sda)(dsad))
	//parser, syntax analysis
	var parse = function(tokens) {
		var ret = new Array();
		for (var i = 0; i < tokens.length; i++) {
			if (tokens[i] == "(") {
				ret.push(parse(tokens.slice(i + 1)));
				i++;
				var j = 0;
				while (true) { //fastforward sramota
					if (j == 0 && tokens[i] == ")") break;
					if (tokens[i] == "(") {
						j++;
					} else if (tokens[i] == ")") {
						j--;
					}
					i++;
				}
			} else if (tokens[i] == ")") {
				return ret;
			} else {
				ret.push(tokens[i]);
			}
			// console.log(ret);

		}
		console.log('Syntactical stage: ');
		console.log(ret);
		console.log('======================================');
		return ret;
	};

	var lib = {
		'+': function(args) {
			var res = 0;
			for (var i = 0; i < args.length; i++) {
				res += args[i];
			}
			return res;
		},
		'-': function(args) {
			var res = args.length > 1 ? args[0] : 0;
			for (var i = args.length > 1 ? 1 : 0; i < args.length; i++) {
				res -= args[i];
			}
			return res; //ako je jedan onda 0-prvi, inace prvi-ostali
		},
		'*': function(args) {
			var res = 1;
			for (var i = 0; i < args.length; i++) {
				res *= args[i];
			}
			return res;
		},
		'quote': function(args) {

		},
		'<': function(args) {
			if (args.length > 2) {
				return 'NIL';
			} //kako ovo hendlati?//pa valjda se ocekuje da je evalano vec?!
			if (eval(args[0]) < eval(args[1])) {
				return true;
			} else {
				return false;
			}
		},
		'>': function(args) {
			if (args.length > 2) {
				return 'NIL';
			} //kako ovo hendlati?  //isto tako valjda je evalano
			if (eval(args[0]) > eval(args[1])) {
				return true;
			} else {
				return false;
			}
		},
		'lt': function(args) {
			return this['<'](args);
		}, //ovako sinonime pisati

		'car': function(args) {
			//checkiraj broj argsa
			return args[0][0]; //args[0] je lista, 0i clan nje
		},
		'cdr': function(args) {
			return args[0].slice(1);
		},
		'list': function(args) {
			ret = [];
			console.log("list created:  " + args);
			for (var i = 0; i < args.length; i++) {
				ret.push(args[i]);
			}
			return ret;
		},
		'nth': function(args) {
			return args[1][parseInt(args[0])];
		},
		'print': function(args) {
			console.log('printing: ');
			console.log('printing ' + args[0]);
		},
		'eq': function(args) {
			if (args[0] == args[1]) {
				return true;
			} else {
				return false;
			}
		},
		'cons': function(args, scope) { //only in case the eval, evaluates args before passing to function
			if (args.length != 2) {
				console.log('Illegal number of arguments to CONS function ' + args.length);
			}
			console.log('cons args: ');
			console.log(args);
			var fir = args[0];
			var sec = args[1];
			var fa = fir instanceof Array;
			var sa = sec instanceof Array;
			if (fa) {
				if (sa) {
					for (var i = 0; i < sec.length; i++) {
						fir.push(sec[i]);
					}
					return fir;
				} else {
					if (sec) {
						fir.push(sec);

					}
					return fir;
				}
			} else {
				if (sa) {
					var ar = new Array();
					ar.push(fir);
					for (var i = 0; i < sec.length; i++) {
						ar.push(sec[i]);
					}
					return ar;
				} else {
					var ar = new Array();
					if (fir && sec) {
						ar.push(fir);
						ar.push(sec);
					}

					return ar;
				}
			}

		},
		'load': function(args, scope) {
			console.log('loading file: ');
			console.log(args[0]);
			//var fs = require('fs');
			//var contents = fs.readFileSync(args[0]).toString();

			//contents = contents.replace(/\n+/g, '');
			//console.log(evaluateLine(data.toString()));

		}
	};

	//binds formal to actual params creating new closure with the calling one as parent and still accessible if not hidden by the new binding
	var bind = function(formal, actual, parentScope) {
		var closure = {};
		for (var i = 0; i < formal.length; i++) {
			closure[formal[i]] = actual[i];
		}
		closure.__proto__ = parentScope;
		return closure;
	};

	var specials = {
		'defun': function(args, definitionScope) { //ime fje (arg or multy) (body) (body2) (body3)
			var funcName = args[0];
			var params = args[1];
			var funcBody = args.slice(2);
			var fun = function(args, callingScope) {
				var retVal = null;
				//calling scope na atributima glavni, definition scope za lokalne varijable ne moze biti pregazen nikako, cak ni definiranjem ponovo u callingscopeu
				for (var i = 0; i < funcBody.length; i++) {
					retVal = eval(funcBody[i], bind(params, args, callingScope)); //izostavljen scope u kojem je fja definirana
					//console.log(retVal);
				}

				return retVal;
			};

			lib[funcName] = fun;
			return funcName;
		},
		'lambda': function(params, body, args, scope) {
			for (var i = 0; i < args.length; i++) {
				args[i] = eval(args[i], scope);
			}
			return eval(body, bind(params, args, scope));

		},
		'if': function(args, scope) {
			if (args.length != 3) {
				//raise error, wrong number of arguments
				return false;
			}
			if (eval(args[0], scope)) {
				// console.log('true ' + args[1]);
				// console.log('true ' + args[1]);
				return eval(args[1], scope);
			} else {
				return eval(args[2], scope);
			}
		},
		'quote': function(args, scope) {
			if (args.length != 1) {
				//raise error, illegal number of arguments
				throw 'hes dead jim! :/ too many damn arguments';
				return;
			}
			return args[0]; //ne evaluatea nist, samo vrati
		},
		'let': function(args, scope) {
			var bindings = args[0];
			var bodies = args.slice(1);

			var innerScope = {};

			for (var i = 0; i < bindings.length; i++) {
				var symbol = bindings[i][0];
				var val = eval(bindings[i][1], scope);
				innerScope[symbol] = val;
			}
			// console.log('calced closure ');
			// console.log(innerScope);
			// console.log('function ' + bodies);
			// console.log('outer ');
			// console.log(scope);
			innerScope.__proto__ = scope;
			var res = 0;
			for (var i = 0; i < bodies.length; i++) {
				res = eval(bodies[i], innerScope);
			}

			return res;
		},
		'setq': function(args, scope) {
			var val;
			var symbol;
			for (var i = 0; i < args.length; i += 2) {
				symbol = args[i];
				val = eval(args[i + 1], scope);
				globalScope[symbol] = val;
			}
			return val;
		},
		'defstruct': function(args, scope) {
			//strukture su immutable
			//generira strukturu
			//u fje doda za svaki atribut structa    imestructa-atribut fju
			//(defstruct ime atr1 atr2 atr3...)
			var name = args[0];
			var attributes = args.slice(1);
			var struct = {}; //definition
			struct.attributes = {};
			struct.name = name;
			struct.accessors = [];
			struct.setters = [];

			attributes.forEach(function(attr) {
				struct.attributes[attr] = null;
			});

			console.log('defined: ' + name);
			console.log(struct);

			var constructorName = 'make-' + name;
			var constructor = function(consArgs, callingScope) { //argsi pocinju s :
				var instance = {};
				for (var definedAttr in struct.attributes) {
					if (struct.attributes.hasOwnProperty(definedAttr)) {
						instance[definedAttr] = null;
					}
				}
				console.log(instance);
				for (var i = 0; i < consArgs.length; i += 2) {
					console.log(consArgs[i] + '   ' + consArgs[i + 1]);
					instance[consArgs[i]] = consArgs[i + 1];
				}

				console.log('constructed: ');
				console.log(instance);
				return instance;
			}

			attributes.forEach(function(attr) {
				var accessorName = name + '-' + attr;

				console.log('creating accessor ' + accessorName);
				var accessor = function(args) {
					var instance = args[0];
					return instance[attr];
				}
				struct.accessors.push(accessor);
				lib[accessorName] = accessor;
			});


			specials[constructorName] = constructor; //konstruktori specialsi jer oni ne evalaju argumente, vratiti na fje kad se doda :arg
			return name;
		}
	};

	var globalScope = {
		'T': true,
		'NIL': false,
	};

	var structures = {};

	var eval = function(atom, scope) {
		//ako je array, onda je s-izraz inace atom
		// console.log(atom);
		if (atom instanceof Array) {
			// console.log(atom + " je s-izraz " + scope);
			var fja = atom[0];
			var args = atom.slice(1);
			if (fja instanceof Array) {
				if (fja[0].toLowerCase() == 'lambda') {
					var lParams = fja[1];
					var lBody = fja[2];
					return specials.lambda(lParams, lBody, args, scope);

				} else {
					throw 'lambda err'
				}
			}
			//check if special..
			if (specials.hasOwnProperty(fja)) {
				return specials[fja](args, scope); //specialsi vracaju function obj
			};
			// console.log(args+" args");
			//postoji li fja, evalaj redom argse, prosljedi ih fji
			var evaluatedArgs = new Array();
			for (var i = 0; i < args.length; i++) {
				evaluatedArgs.push(eval(args[i], scope));
			}
			// console.log(fja + '   args: ' + evaluatedArgs + '  ' + scope);
			return lib[fja](evaluatedArgs, scope); //fja treba raditi? optimizacija kod OR-a npr...

		} else if (atom instanceof Object) {
			return atom;
		} else {
			var intTry = parseInt(atom); // probaj i double
			if (isNaN(intTry)) {
				return scope[atom];
			} else {
				//broj je
				// console.log(atom+" je broj");
				return intTry;
			}
		}
	};

	var evaluateLine = function(line) {
		var results = [];
		var structure = parse(scan(preSplit(line)));
		for (var g = 0; g < structure.length; g++) {
			results.push(eval(structure[g], globalScope));
		}
		return results;
	};

	//load file fja

	// console.log(evaluateLine('(defun fact (x) (if (> x 1) (* (fact (- x 1)) x ) (+ 0 1))) (fact 5)'));
	// console.log(evaluateLine('( defstruct st a b c  )  ( setq disi (make-st a 1 b 2)  )   (st-b disi)'));

	// var sys = require("sys");

	// var stdin = process.openStdin();

	// stdin.addListener("data", function(d) {
	// 	console.log('pre');
	// 	console.log(d);
	// 	var input = d.toString().substring(0, d.length - 1);
	// 	console.log('line: ' + input);
	// 	console.log(evaluateLine(input));

	// });

	var output = null;

	var defaultOutput = function(out) {
		console.log(out);
	};

	var setOutput = function(newOutput) {
		output = newOutput;
	}

	output = defaultOutput;

	window.ListJS = {
		eval: evaluateLine,
		onOutput: setOutput
	};

})();