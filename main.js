var UglifyJS = require('uglify-js');
var fs = require('fs');
var filename = "./jhipster-config/index.js"//process.argv[1];
console.log(filename);
var ast = UglifyJS.parse(String(fs.readFileSync(filename)));
//console.log(JSON.stringify(ast));


fs.writeFile("/tmp/ast.js", JSON.stringify(ast), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 

function visit(node) {

	if (typeof node.body !== 'undefined') {
		console.log("body");
		visit(node.body);
	} else if (node instanceof Array) {
		console.log("array");
		for (var i = 0; i < node.length; i++) {
		    visit(node[i])
		}
	} else if (node.hasOwnProperty("definitions")) {
//		console.log(node.definitions)
//		visit(node.definitions);		
	} else {
		console.log("other");
//		console.log(node);
	}


}

//visit(ast);

// Extract prompting property
var prompting;

var promptingWalker = new UglifyJS.TreeWalker(function(node) {
    if (node instanceof UglifyJS.AST_ObjectKeyVal && node.key === "prompting") {
        prompting = node.value;
        return true;
    }
});

ast.walk(promptingWalker);

// Extract prompts
var prompts = prompting.properties;
// TODO

// Extract prompts information
// TODO


//console.log(prompts);

//if (node instanceof UglifyJS.AST_VarDef) {
//    var name = node.name.print_to_string();
//    var value = node.value;
//    //console.log(name);
//    if (name === "prompts") {
//        prompts.push(value);
//        //return true;
//    }
//
//}


//if (node instanceof UglifyJS.AST_Array) {
//    //console.log(node.print_to_string({
//    //    beautify: true
//    //}));
//}

// Export AST to js
var code = ast.print_to_string({
    beautify: true
});

fs.writeFile("/tmp/index.js", code, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
