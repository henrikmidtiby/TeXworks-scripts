// TeXworksScript
// Title: Context aware autocomplete, unit tests
// Description: Unittests for autocompleter.
// Author: Henrik Skov Midtiby
// Version: 0.3
// Date: 2012-06-21
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+Shift+M


// Include functionality from other script
var file = TW.readFile("autocompleteFunctions.js");
if (file.status == 0) {
  eval(file.result);
  file = null;  // free mem
}

function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
  return 'AssertException: ' + this.message;
}

function assert(exp, message) {
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

// autocomplete
// collectDetailsAboutTheCurrentSelection
// getCurrentLine
// closeEnvironment
// suggestEnvironment
// addLabelBelow
// makeCaptionContextSensitive
// camelize
assert(camelize('testing') == 'testing');
assert(camelize('testing two') == 'testingTwo');
// shouldCompleteFilename
assert(shouldCompleteFilename('includegraphics') == true);
assert(shouldCompleteFilename('unknowncommand') != true);
// locateMatchingFilenames
// locateMatchingCommandNames
// locateMatchingWordsAwareOfContext
// insertSuggestion
// insertSuggestionModified
// locateWordEndingOnCursor
// getCommandName
// detectCertainCommands
// determineEnvironmentStackBeforeCursor
// isAlphaNumeric
assertEqual(true, isAlphaNumeric("A"))
assertEqual(false, isAlphaNumeric(":"))
// isAlphaNumericKommaOrSpace
assertEqual(true, isAlphaNumericKommaOrSpace("A"))
assertEqual(false, isAlphaNumericKommaOrSpace(":"))
// getPathFromFilename
assertEqual(getPathFromFilename('C:/Users/hemi/Dropbox/Work/2012-06-07PhdDefence/doc/presentation.tex'), 'C:/Users/hemi/Dropbox/Work/2012-06-07PhdDefence/doc');
assertEqual(getPathFromFilename('pic/c'), 'pic');
// getListOfFilesInDir
// getMatchingFilenames
// getTypeOfLineBreak
// unique
//assertEqual(unique(['a', 'b', 'c']), ['a', 'b', 'c']); // Does not work for some reason ...
// determineMatchingCommandsFromCurrentCommand
//assertEqual("include", determineMatchingCommandsFromCurrentCommand("includeonly"))
// isElementInList
assertEqual(isElementInList(["a", "b"], "c"), false);
assertEqual(isElementInList(["a", "b"], "b"), true);
// locateMatchingWords
// getTextFromAllOpenWindows
// getBibtexKeys
assertEqual(getBibtexKeys("\n\@article{key, \n"), "\\cite{key} ")
assertEqual(getBibtexKeys("\n\@article{keyOne, \n\n\@book{keyTwo, \n"), "\\cite{keyOne} \\cite{keyTwo} ")
// locateMatchingWordsInString
//assertEqual(locateMatchingWordsInString("tes", "testing other words", []), ["testing"])
// wordsCleanUp
// determineLongestCommonInitialSequence
assertEqual(determineLongestCommonInitialSequence(['includegraphics', 'includepdf']), 'include');
// getEndOfCommonSubstring
assertEqual(getEndOfCommonSubstring("test", "tes"), "t")
assertEqual(getEndOfCommonSubstring("testing", "tes"), "ting")
// determineNextGuess
assertEqual(determineNextGuess(['a', 'b', 'ba'], 'b'), 'ba');
assertEqual(determineNextGuess(['a', 'b', 'ba'], 'ba'), 'a');
assertEqual(determineNextGuess(['a', 'b', 'ba'], 'asdba'), 'a');
assertEqual(determineNextGuess([], 'asdba'), '');
// max
assert(max(1, 3) == 3);
// showObject


var temp = {};
temp.message = 'Test passed';
showObject(temp);


// Debug output
//TW.target.selectRange(inputWord.wordStart + 15);
//TW.target.insertText(inputWord.commandName);
//TW.target.selectRange(inputWord.wordStart + CommonSequence.length, max(0, NextGuess.length - CommonSequence.length));
