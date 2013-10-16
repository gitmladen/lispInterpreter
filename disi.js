// var kod = '(+ 2 (- 5 4) (* 1 (13 42) 2) )';
var kod = '(defun square (x) (* x x))   (square 4)';



kod = kod.replace(/\(/g, ' ( ').replace(/\)/g,' ) ');
console.log(kod);

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

	}
}

var applyArgs = function(simbols,vals,vars) {
	console.log(vars);
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
		console.log(args);
		var funcName = args[0];
		var funcArgs = args[1];
		var funcBody = args.slice(2);
		var fun = function(args) {
			var retVal = null;
			console.log("CALL: "+funcName+", args: "+funcArgs+", body: "+funcBody);
			//eval
			for(var i=0; i<funcBody.length; i++) {
				retVal = eval(applyArgs(funcArgs,args,funcBody[i]));
				console.log("part "+funcBody[i]+" res: "+retVal);
				console.log("----------------------");
			}
			return retVal;
		};
		lib[funcName] = fun;
		return funcName;
	},
	'lambda' : function(args) {

	}
};
var globals = {};


var eval = function(atom) {
	//ako je array, onda je s-izraz inace atom
	if(atom instanceof Array) {
		// console.log(atom+" je s-izraz");
		var fja = atom[0];
		var args = atom.slice(1);
		//check if special..
		if(specials.hasOwnProperty(fja)) {
			return specials[fja](args);//specialsi vracaju function obj
		};
		// console.log(lib[fja]+" fja");
		// console.log(args+" args");
		//postoji li fja, evalaj redom argse, prosljedi ih fji
		var evaluatedArgs = new Array();
		for (var i=0;i<args.length;i++) {
			evaluatedArgs.push(eval(args[i]));
		}
		// console.log("evaled args "+evaluatedArgs);
		return lib[fja](evaluatedArgs);

	} else {
		var intTry = parseInt(atom); // probaj i double
		if(isNaN(intTry)) {
			//varijabla je je, pogledaj imenik
			// console.log(atom+ " je varijabla");
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

// console.log(createStructure(splitf(kod)));

var c = createStructure(splitf(kod));
console.log(eval(c[0]));
console.log(eval(c[1]));

// applyArgs("x",3,["x",2,[2,[1,"x"],"x"]]);