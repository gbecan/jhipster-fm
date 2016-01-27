var UglifyJS = require('uglify-js');
var fs = require('fs');

// Input file
var filename = "./jhipster-config/index.js"//process.argv[1];

// Parse Javascript
var ast = UglifyJS.parse(String(fs.readFileSync(filename)));

// Export AST to Javascript
var code = ast.print_to_string({
    beautify: true
});

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
var prompts = prompting.properties.map(function(prompt) {

    var extractedData = {
        name: prompt.key,
        prompts: []
    };

    var promptsWalker = new UglifyJS.TreeWalker(function(node) {



        if (node instanceof UglifyJS.AST_VarDef) { // find 'var prompts ='
            var name = node.name.name;
            if (name === "prompts") {
                var elements = node.value.elements;
                elements.forEach(function(element) {
                    var promptData = {};
                    element.properties.forEach(function(property) {
                        promptData[property.key] = extractProperty(property);
                    });
                    extractedData.prompts.push(promptData);
                });


            }
        } else if (node instanceof  UglifyJS.AST_Call) {
            if (node.expression.print_to_string() === "this.prompt") {

                node.args.forEach(function(arg) {

                    if (arg instanceof UglifyJS.AST_Object) {
                        var promptData = {};
                        arg.properties.forEach(function(property) {
                            promptData[property.key] = extractProperty(property);
                        });
                        extractedData.prompts.push(promptData);
                    }

                });

            }

        }



    });

    prompt.value.walk(promptsWalker);JSON.stringify(prompts);

    return extractedData;
});

function extractProperty(property) {
    var key = property.key;
    if (key === "type" || key === "name" || key === "default") {
        return property.value.value;
    } else if (key === "message") {
        return property.value.print_to_string();
    } else if (key === "choices" && typeof property.value.elements !== 'undefined') {

        return property.value.elements.map(function(elem) {
            var choices = {};
            elem.properties.forEach(function(choice) {
                choices[choice.key] = choice.value.value;
            });
            return choices;
        });
    } else if (key === "when") {
        // TODO : extract boolean expression
        var condition = property.value.body[0].value;
        return condition.left.property + " " + condition.operator + " " + condition.right.value;
    } else {
        return {};
    }
}

fs.writeFile("output/features.json", JSON.stringify(prompts, null, 4), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
