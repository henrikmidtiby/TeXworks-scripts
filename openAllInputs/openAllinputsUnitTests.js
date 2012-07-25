// TeXworksScript
// Title: Context aware autocomplete, unit tests
// Description: Unittests for autocompleter.
// Author: Henrik Skov Midtiby
// Version: 0.3
// Date: 2012-06-21
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+Alt+O


// Include functionality from other script
var file = TW.readFile("openAllinputsFunctions.js");
if (file.status == 0) {
  eval(file.result);
  file = null;  // free mem
}

var testPassed = 0;

function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
}

function assert(exp, message) {
  testPassed++;
  if (!exp) {
    throw new AssertException(message);
  }
}

function assertEqual(value, expectedValue)
{
	if(value !== expectedValue)
	{
		var temp = {};
		temp.value = value;
		temp.expectedValue = expectedValue;
		showObject(temp, 'Assertion failed');
		showObject(value, "Value");
		showObject(expectedValue, "Expected value");
	}
	assert(value === expectedValue, 'Got "' + value + '" expected "' + expectedValue + '"');
}


function assertEqualLists(value, expectedValue)
{
	len1 = value.length;
	len2 = expectedValue.length;
	assert(len1 === len2, 'List lengths differs');
	for(k = 0; k < len1; k++)
	{
		assert(value[k] === expectedValue[k], 'The ' + k + 'th element differs. Actual value: "' + value[k] + '" expected value "' + expectedValue[k] + '".');
		testPassed--;
	}
}

function assertEqualDicts(value, expectedValue)
{
	for(prop in value)
	{
		assert(expectedValue[prop] !== undefined, 
			'expectedValue["' + prop + '"] is not defined.');
		testPassed--;
		assert(value[prop] == expectedValue[prop], 'Property: "' + prop + '" does not match.' + 
			' value["' + prop + '"] = "' + value[prop] + '" ' + 
			' expectedValue["' + prop + '"] = "' + expectedValue[prop] + '"' );
		testPassed--;
	}

	for(prop in expectedValue)
	{
		assert(value[prop] !== undefined, 
			'value["' + prop + '"] is not defined.');
		testPassed--;
		assert(value[prop] == expectedValue[prop], 'Property: "' + prop + '" does not match.' + 
			' value["' + prop + '"] = "' + value[prop] + '" ' + 
			' expectedValue["' + prop + '"] = "' + expectedValue[prop] + '"' );
		testPassed--;
	}
	testPassed++;
}



// showObject
// getCurrentLine
// getTexWorksLines
var res = {};
res["program"] = "pdflatex";
assertEqualDicts(getTexWorksLines("\n%! TEX program = pdflatex\n\n"), res);
assertEqualDicts(getTexWorksLines("\n%! TEX program = pdflatex\n%TEX spell=danish\n"), res);
res["spell"] = "danish";
assertEqualDicts(getTexWorksLines("\n%! TEX program = pdflatex\n%!TEX spell=danish\n"), res);
assertEqualDicts(getTexWorksLines("\n%! TeX program =         pdflatex\n%!TEX spell=danish\n"), res);
// OpenAllInputFiles
filehandler = OpenAllInputFiles();
// obj.openInputFiles
// obj.initializeVariables
// obj.getTextToAnalyze
// obj.checkForRootFile
// obj.detectIncludeOnlyStatements
// obj.handleActiveIncludeOnlys
// obj.searchForInputStatements
// TODO: The method mentioned above is rather large. Extract functionality from it.
// obj.doesLineContainInput
assertEqual(filehandler.doesLineContainInput("\\input{filename.tex}"), true);
assertEqual(filehandler.doesLineContainInput("\\include{filename.tex}"), false);
// obj.doesLineContainInclude
assertEqual(filehandler.doesLineContainInclude("\\input{filename.tex}"), false);
assertEqual(filehandler.doesLineContainInclude("\\include{filename.tex}"), true);
// obj.doesLineContainInputOrInclude
assertEqual(filehandler.doesLineContainInputOrInclude("\\input{filename.tex}"), true);
// obj.suggestFilenames
assertEqualLists(filehandler.suggestFilenames("file.tex"), ["file.tex"]);
assertEqualLists(filehandler.suggestFilenames("file.tikz"), ["file.tikz"]);
assertEqualLists(filehandler.suggestFilenames("file"), ["file.tex", "file.tikz", "file"]);
// obj.hasProperFilenameEnding
assertEqual(filehandler.hasProperFilenameEnding("file.tex"), true);
assertEqual(filehandler.hasProperFilenameEnding("file.tx"), false);
assertEqual(filehandler.hasProperFilenameEnding("file.tikz"), true);
// obj.isFileInIncludeList
assertEqual(filehandler.isFileInIncludeList("a", ["a", "b"]), true);
assertEqual(filehandler.isFileInIncludeList("c", ["a", "b"]), false);
// obj.openLocatedFiles
// obj.createAndOpenFile
// obj.copyTEXOptionsFromCurrentDocumentToNewDocument
// 


var temp = {};
temp.message = testPassed + ' tests passed';
showObject(temp);


