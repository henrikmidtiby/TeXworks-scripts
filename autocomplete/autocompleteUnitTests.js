// TeXworksScript
// Title: Context aware autocomplete, unit tests
// Description: Unittests for autocompleter.
// Author: Henrik Skov Midtiby
// Version: 0.3
// Date: 2012-06-21
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+Shift+M


function showObject(inputObject, header)
{
	if(arguments.length == 1)
	{
		header = "Hej";
	}
	var tempText = "";
	for(var prop in inputObject){
		tempText += prop + " -> " + inputObject[prop] + "\n";
	}
	TW.information(null, header, tempText);
}



// Include functionality from other script
var file = TW.readFile("autocompleteFunctions.js");
if (file.status == 0) {
  eval(file.result);
  file = null;  // free mem
}

var file = TW.readFile("../utilities/functionsForUnittesting.js");
if(file.status == 2) {
  TW.information(null, "Unable to open file", "Unable to open file, please check permissions in Texworks");
}
if (file.status == 0) {
  eval(file.result);
  file = null;  // free mem
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
// determineEnvironmentStack
//assertEqual(determineEnvironmentStack("\\begin{document}"), ["document"])
//assertEqual(determineEnvironmentStack("\\begin{document}\\begin{figure}\\end{figure}"), ["document"])
//assertEqual(determineEnvironmentStack("\\begin{document}\\begin{figure}"), ["document", "figure"])
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
assertEqual(getTypeOfLineBreak("\n\n"), "\n")
assertEqual(getTypeOfLineBreak("\r\n"), "\r\n")
// unique
//assertEqual(unique(['a', 'b', 'c']), ['a', 'b', 'c']); // Does not work for some reason ...
// determineMatchingCommandsFromCurrentCommand
assertEqualLists(determineMatchingCommandsFromCurrentCommand("includeonly"), ["include"])
assertEqualLists(determineMatchingCommandsFromCurrentCommand("label"), ["pageref", "ref", "eqref", "nameref", "autoref"])
// isElementInList
assertEqual(isElementInList(["a", "b"], "c"), false);
assertEqual(isElementInList(["a", "b"], "b"), true);
// locateMatchingWords
// getTextFromAllOpenWindows
// get_bibtex_filenames_from_magic_mark
assertEqualLists(get_bibtex_filenames_from_magic_mark("\n% !TEX bibfile = library.bib\n"), ["library.bib"]);
assertEqualLists(get_bibtex_filenames_from_magic_mark("\n% !TEX bibfile = library.bib, library2.bib\n"), ["library.bib", "library2.bib"]);
assertEqualLists(get_bibtex_filenames_from_magic_mark("\n% !TEX root = master.tex\n"), []);
assertEqualLists(get_bibtex_filenames_from_magic_mark("\n% !TEX root = master.tex\n% !TEX bibfile = library.bib\n"), ["library.bib"]);
// get_lines_with_magic_mark
assertEqualLists(get_lines_with_magic_mark("\n% !TEX bibfile = library.bib\n"), ["% !TEX bibfile = library.bib"]);
assertEqualLists(get_lines_with_magic_mark("\n% !TEX root = master.tex\n"), ["% !TEX root = master.tex"]);
assertEqualLists(get_lines_with_magic_mark("\n% !TEX root = master.tex\n% !TEX bibfile = library.bib\n"), ["% !TEX root = master.tex", "% !TEX bibfile = library.bib"]);
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


showTestSummary();



// Debug output
//TW.target.selectRange(inputWord.wordStart + 15);
//TW.target.insertText(inputWord.commandName);
//TW.target.selectRange(inputWord.wordStart + CommonSequence.length, max(0, NextGuess.length - CommonSequence.length));
