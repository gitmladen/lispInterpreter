// var kod = '(+ 2 (- 5 4) (* 1 (13 42) 2) )';
// var kod = '(defun square (x) (* x x))   (square 4)';

var preSplit = function (line) {
	return line.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
};

var splitf = function (str) {
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
	return ret;
}

// s ( (d s ) ( ) ) ( ((das) sda)(dsad))

var createStructure = function (tokens) {
	var ret = new Array();
	for (var i = 0; i < tokens.length; i++) {
		if (tokens[i] == "(") {
			ret.push(createStructure(tokens.slice(i + 1)));
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
	return ret;
}

var lib = {
	'+': function (args) {
		var res = 0;
		for (var i = 0; i < args.length; i++) {
			res += args[i];
		}
		return res;
	},
	'-': function (args) {
		var res = args.length > 1 ? args[0] : 0;
		for (var i = args.length > 1 ? 1 : 0; i < args.length; i++) {
			res -= args[i];
		}
		return res; //ako je jedan onda 0-prvi, inace prvi-ostali
	},
	'*': function (args) {
		var res = 1;
		for (var i = 0; i < args.length; i++) {
			res *= args[i];
		}
		return res;
	},
	'quote': function (args) {

	},
	'<': function (args) {
		if (args.length > 2) {
			return 'NIL';
		} //kako ovo hendlati?//pa valjda se ocekuje da je evalano vec?!
		if (eval(args[0]) < eval(args[1])) {
			return true;
		} else {
			return false;
		}
	},
	'>': function (args) {
		if (args.length > 2) {
			return 'NIL';
		} //kako ovo hendlati?  //isto tako valjda je evalano
		if (eval(args[0]) > eval(args[1])) {
			return true;
		} else {
			return false;
		}
	},
	'lt': function (args) {
		return this['<'](args);
	}, //ovako sinonime pisati

	'car': function (args) {
		//checkiraj broj argsa
		return args[0][0]; //args[0] je lista, 0i clan nje
	},
	'cdr': function (args) {
		return args[0].slice(1);
	},
	'list': function (args) {
		ret = [];
		for (var i = 0; i < args.length; i++) {
			ret.push(eval(args[i]));
		}
		return ret;
	}
}


//binds formal to actual params creating new closure with the calling one as parent and still accessible if not hidden by the new binding
var bind = function (formal, actual, parentScope) {
	var closure = {};
	for (var i = 0; i < formal.length; i++) {
		closure[formal[i]] = actual[i];
	}
	closure.__proto__ = parentScope;
	return closure;
};

var specials = {
	'defun': function (args, definitionScope) { //ime fje (arg or multy) (body) (body2) (body3)
		var funcName = args[0];
		var params = args[1];
		var funcBody = args.slice(2);
		var fun = function (args, callingScope) {
			var retVal = null;
			//calling scope na atributima glavni, definition scope za lokalne varijable ne moze biti pregazen nikako, cak ni definiranjem ponovo u callingscopeu
			for (var i = 0; i < funcBody.length; i++) {
				retVal = eval(funcBody[i], bind(params, args, callingScope)); //izostavljen scope u kojem je fja definirana
				console.log(retVal);
			}

			return retVal;
		};

		lib[funcName] = fun;
		return funcName;
	},
	'lambda': function (params, body, args, scope) {
		for (var i = 0; i < args.length; i++) {
			args[i] = eval(args[i], scope);
		}
		return eval(body, bind(params, args, scope));

	},
	'if': function (args, scope) {
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
	'quote': function (args) {
		if (args.length != 1) {
			//raise error, illegal number of arguments
			throw 'hes dead jim! :/ too many damn arguments';
			return;
		}
		return args[0]; //ne evaluatea nist, samo vrati
	},
	'let': function (args, scope) {
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
	'setq': function (args, scope) {
		var val;
		var symbol;
		for (var i = 0; i < args.length; i += 2) {
			symbol = args[i];
			val = eval(args[i + 1], scope);
			globalScope[symbol] = val;
		}
		return val;
	}

};

var globalScope = {
	'T': true,
	'NIL': false,
};


var eval = function (atom, scope) {
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
}


var evaluateLine = function (line) {
	var results = [];
	var structure = createStructure(splitf(preSplit(line)));
	for (var g = 0; g < structure.length; g++) {
		results.push(eval(structure[g], globalScope));
	}
	return results;
};

// console.log(evaluateLine('(defun fact (x) (if (> x 1) (* (fact (- x 1)) x ) (+ 0 1))) (fact 5)'));
console.log(evaluateLine('( (lambda (x) (+ x 1)) 4 )'));

module.exports = {
	eval: evaluateLine,

};