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
        }



    });

    prompt.value.walk(promptsWalker);

    return extractedData;
});

function extractProperty(property) {
    var key = property.key;
    if (key === "type" || key === "name") {
        return property.value.value;
    }

    return {};
}

fs.writeFile("output/features.json", JSON.stringify(prompts, null, 4), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
