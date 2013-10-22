// var kod = '(+ 2 (- 5 4) (* 1 (13 42) 2) )';
// var kod = '(defun square (x) (* x x))   (square 4)';

var preSplit = function(line) {
	return line.replace(/\(/g, ' ( ').replace(/\)/g,' ) ');
};

var splitf = function(str) {
	var ret = new Array();
	var read = false;
	var curr = "";
	// var skip = false;
	// var skipChar = "";
	for(var i = 0 ; i < str.length; i++) {
		var c = str.charAt(i);
		if(c==" ") {
			if(read) {
				ret.push(curr);
			}
			curr="";
			read=false;
		} else {
			curr+=c;
			if(!read) read=true;
		}
	}
	return ret;
}

// s ( (d s ) ( ) ) ( ((das) sda)(dsad))

var createStructure = function(tokens) {
	var ret = new Array();
	for(var i = 0 ; i < tokens.length ; i++ ) {
		if(tokens[i] == "(") {
			ret.push(createStructure(tokens.slice(i+1)));
			i++;var j=0; 
			while(true) {//fastforward sramota
				if(j==0 && tokens[i]==")") break;
				if(tokens[i]=="("){
					j++;
				}else if(tokens[i]==")"){
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
	'+' : function(args) {
		var res = 0; for(var i=0;i<args.length;i++) {res+=args[i];} return res;
	},
	'-' : function(args) {
		var res = args.length>1 ? args[0] : 0; for(var i=args.length>1 ? 1 : 0; i<args.length;i++) {res-=args[i];} return res; //ako je jedan onda 0-prvi, inace prvi-ostali
	},
	'*' : function(args) {
		var res = 1; for(var i=0;i<args.length;i++) {res*=args[i];} return res;
	},
	'quote' : function(args) {

	},
	'<' : function(args) {
		if(args.length > 2) { return 'NIL';} //kako ovo hendlati?
		if(eval(args[0]) < eval(args[1])) {
			return true;
		} else {
			return false;
		}
	},
	'>' :function(args) {
		if(args.length > 2) { return 'NIL';} //kako ovo hendlati?
		if(eval(args[0]) > eval(args[1])) {
			return true;
		} else {
			return false;
		}
	},
	'lt' : function(args){ return this['<'](args);}, //ovako sinonime pisati

	'car': function(args) {
		//checkiraj broj argsa
		return args[0][0];  //args[0] je lista, 0i clan nje
	},
	'cdr': function(args) {
		return args[0].slice(1);
	},
	'list': function(args) {
		ret = [];
		for(var i=0; i<args.length; i++) {
			ret.push(eval(args[i]));
		}
		return ret;
	}	
}

var applyArgs = function(simbols,vals,vars) {
	// console.log(vars);
	vars = JSON.parse(JSON.stringify(vars));    //odvratan hack, radi nad drugim varsima, ne onim iz definicije fje
	var applySingle = function(simbol,val,vars) {
		for(var i=0;i<vars.length;i++) {
			if(vars[i]==simbol) vars[i]=val;
			if(vars[i] instanceof Array) applySingle(simbol,val,vars[i]);
		}
	};
	for(var j=0;j<simbols.length;j++) {
		applySingle(simbols[j],vals[j],vars);
	}
	return vars;
};

var specials = {
	'defun' : function(args) {//ime fje (arg or multy) (body)
		var funcName = args[0];
		var funcArgs = args[1];
		var funcBody = args.slice(2);
		var fun = function(args) {
			var retVal = null;
			//eval
			for(var i=0; i<funcBody.length; i++) {
				retVal = eval(applyArgs(funcArgs,args,funcBody[i]));
				console.log(retVal);
			}
			return retVal;
		};
		lib[funcName] = fun;
		// var fun = function(args) {
		// 	var retVal = null;
		// 	console.log("CALL: "+funcName+", args: "+funcArgs+", body: "+funcBody);
		// 	//eval
		// 	for(var i=0; i<funcBody.length; i++) {
		// 		retVal = eval(applyArgs(funcArgs,args,funcBody[i]));-
		// 		console.log("part "+funcBody[i]+" res: "+retVal);
		// 		console.log("----------------------");
		// 	}
		// 	return retVal;
		// };
		return funcName;
	},
	'lambda' : function(args) {

	},
	'if' : function(args) {
		if(args.length != 3 ) {
			//raise error, wrong number of arguments
			return false;
		}
		if(eval(args[0])) {
			console.log('true '+args[1]);
			console.log('true '+args[1]);
			return eval(args[1]);
		} else {
			return eval(args[2]);
		}
	},
	'quote': function(args) {
		if(args.length != 1) {
			//raise error, illegal number of arguments
			console.log('hes dead jim! :/ too many damn arguments');
			return;
		}
		return args[0];  //ne evaluatea nist, samo vrati
	}
};
var globals = {};
var constants = {
	'T' : true,
	'NIL' : false,
};

var eval = function(atom) {
	//ako je array, onda je s-izraz inace atom
	// console.log(atom);
	if(atom instanceof Array) {
		// console.log(atom+" je s-izraz");
		var fja = atom[0];
		var args = atom.slice(1);
		//check if special..
		if(specials.hasOwnProperty(fja)) {
			return specials[fja](args);//specialsi vracaju function obj
		};
		// console.log(args+" args");
		//postoji li fja, evalaj redom argse, prosljedi ih fji
		var evaluatedArgs = new Array();
		for (var i=0;i<args.length;i++) {
			evaluatedArgs.push(eval(args[i]));
		}
		return lib[fja](evaluatedArgs);

	} else {
		var intTry = parseInt(atom); // probaj i double
		if(isNaN(intTry)) {
			//varijabla je je, pogledaj imenik
			// console.log(atom+ " je varijabla");
			if(constants.hasOwnProperty(atom)) {
				return constants[atom];
			}
			if(globals.hasOwnProperty(atom)) {
				//eval nad fjom (or, bolje fja prvo)
				//eval pri definiciji varijable, il svaki put kad se iskoristi?
				return globals[atom];
			} else {
				// console.log("variable "+atom+"is not defined!");
			}
		} else {
			//broj je
			// console.log(atom+" je broj");
			return intTry;
		}
	}
}


var evaluateLine = function(line) {
	var results = [];
	var structure = createStructure(splitf(preSplit(line)));
	for(var g= 0; g<structure.length; g++) {
		results.push(eval(structure[g]));
	}
	return results;
};

console.log(evaluateLine('(quote (2 3 5))'));
// console.log(evaluateLine('(cdr (list 2 (+ 4 5) 5))'));



module.exports = {
	eval: evaluateLine,

};