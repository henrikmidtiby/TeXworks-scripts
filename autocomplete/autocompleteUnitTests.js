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
// isAlphaNumericKommaOrSpace
// getPathFromFilename
// getListOfFilesInDir
// getMatchingFilenames
// getTypeOfLineBreak
// unique
// determineMatchingCommandsFromCurrentCommand
// isElementInList
// locateMatchingWords
// getTextFromAllOpenWindows
// getBibtexKeys
// locateMatchingWordsInString
// wordsCleanUp
// determineLongestCommonInitialSequence
// getEndOfCommonSubstring
// determineNextGuess
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
