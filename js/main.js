/** 
 * @classdesc Converts color codes to variables in css code.
 * 
 * @author Barnabas Kiss <info@radfuse.com>
 */
class ColorToVariableConverter
{
    /**
     * Constructor
     */
    constructor(){
        /** @type {Object.<string, string>} */
        this._colorAsVariable = [];
        /** @type {string} */
        this._preprocessor = '';
        /** @type {string} */
        this._prefix = '';
        /** @type {string} */
        this._sigil = '';
        /** @type {string} */
        this._input = '';
        /** @type {string} */
        this._replacedInput = '';
        /** @type {string} */
        this._variableDeclarations = '';

        this.initializeButtonClick();
        this.initializeCopyButtonClick();
    }

    /**
     * Initializes the convert button onClick event
     */
    initializeButtonClick(){
        document.getElementById('submit-btn').addEventListener('click', () => {
            this.initializeParameters();
            this.convert();
        });
    }

    /**
     * Initializes the copy to clipboard button onClick event
     */
    initializeCopyButtonClick(){
        document.getElementById('copy-to-clipboard').addEventListener('click', () => {
            var copyText = document.getElementById("result");
            var copiedAlert = document.getElementById("copied-alert");

            copyText.select();
            document.execCommand("copy");

            if (window.getSelection) {
                if (window.getSelection().empty) // Chrome
                    window.getSelection().empty();
                else if (window.getSelection().removeAllRanges) // Firefox
                    window.getSelection().removeAllRanges();
            }
            else if (document.selection) // IE
                document.selection.empty();

            copyText.blur();
            copiedAlert.classList.add("active");

            setTimeout(function(){ copiedAlert.classList.remove("active"); }, 2000);
        });
    }

    /**
     * Initializes the required conversion paramterers
     */
    initializeParameters(){
        this._preprocessor = document.getElementById('preprocessor').value;
        this._prefix = document.getElementById('prefix').value;
        this._colorAsVariable = [];

        this.setSigilByPreprocessorType();
        this.initializePrefix();
    }

    /**
     * Sets sigil by preprocessor type
     */
    setSigilByPreprocessorType(){
        var preprocessor = this._preprocessor.toLowerCase();
        switch(preprocessor) {
            case 'less':
                this._sigil = '@';
                break;
            case 'scss':
            case 'sass':
                this._sigil = '$';
                break;
            default:
                this._sigil = '$';
        }
    }

    /**
     * Initializes prefix for variables
     */
    initializePrefix(){
        if(this._sigil && !this._prefix.includes(this._sigil))
            this._prefix = this._sigil + this._prefix;
    }

    /**
     * Converts the input and writes the result
     */
    convert(){
        this.convertColorsToVariables();
        this.setVariablesAndReplaceColor();

        var result = this._variableDeclarations;

        if(Object.keys(this._colorAsVariable).length)
            result += "\n\n";

        result += this._replacedInput;

        document.getElementById('result').innerHTML = result;
    }

    /**
     * Converts the colors from the input into variables
     */
    convertColorsToVariables(){
        var regex = /#([a-f]|[A-F]|[0-9]){3}(([a-f]|[A-F]|[0-9]){3})?\b|rgb\((?:\s*\d+\s*,){2}\s*[\d]+\)|rgba\((\s*\d+\s*,){3}\s?[\d\.]+\)|hsl\(\s*\d+\s*(\s*\,\s*\d+\%){2}\)|hsla\(\s*\d+(\s*,\s*\d+\s*\%){2}\s*\,\s*[\d\.]+\)/g;
        this._input = document.getElementById('source').value;
        var matches = regex.exec(this._input);
        var i = 1; // :(

        this._input.replace(regex, (match, g1, g2) => {
            if(!this._colorAsVariable.hasOwnProperty(match) && !this._colorAsVariable.hasOwnProperty(match.toUpperCase())){
                this._colorAsVariable[match] = this._prefix + i;
                i++;
            }
        });
    }

    /**
     * Sets color variable declarations and replaces colors in code
     */
    setVariablesAndReplaceColor(){
        var variables = [];
        this._replacedInput = this._input;

        Object.keys(this._colorAsVariable).forEach((color) => {
            var variable = this._colorAsVariable[color];
            variables.push(variable + ': ' + color + ';');
            color = color.replace('\(', '\\\(').replace('\)', '\\\)');
            console.log(color);
            this._replacedInput = this._replacedInput.replace(new RegExp(color, 'g'), variable);
            this._replacedInput = this._replacedInput.replace(new RegExp(color.toUpperCase(), 'g'), variable);
        });

        this._variableDeclarations = variables.join("\n");
    }
}