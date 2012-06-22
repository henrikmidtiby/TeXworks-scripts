// TeXworksScript
// Title: Complete path
// Description: Autocompletion inspired by vim.
// Author: Henrik Skov Midtiby
// Version: 0.3
// Date: 2011-05-16
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+Shift+P

function completePath()
{
	showObject('marker');
	var locationInformation = collectDetailsAboutTheCurrentSelection();

	showObject(locationInformation);

	// If in primary argument to input, include, includegraphics or similar, 
	// complete filename.
	var words;
	words = locateMatchingFilenames(locationInformation.extractedWord);

	if(words.length == 0)
	{
		suggestEnvironment(locationInformation);
		return;
	}

	insertSuggestion(words, locationInformation);
}

// Include functionality from other script
var file = TW.readFile("autocompleteFunctions.js");
if (file.status == 0) {
  eval(file.result);
  file = null;  // free mem
}

completePath();

// Debug output
//TW.target.selectRange(inputWord.wordStart + 15);
//TW.target.insertText(inputWord.commandName);
//TW.target.selectRange(inputWord.wordStart + CommonSequence.length, max(0, NextGuess.length - CommonSequence.length));
