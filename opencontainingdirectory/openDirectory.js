// TeXworksScript
// Title: Open containing directory
// Description: Open containing directory.
// Author: Henrik Skov Midtiby
// Version: 0.1
// Date: 2012-04-10
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+D

function openDirectory()
{
	var temp = {};
	temp.fullFilename = locateContentsOfBraces();
	temp.pathName = getPathFromFilename(temp.fullFilename);
	temp.currentDirectory = getPathFromFilename(TW.target.fileName);
	temp.combinedDirectory = temp.currentDirectory + "/" + temp.pathName;
	temp.result = TW.launchFile(temp.combinedDirectory);
	if(temp.result["status"] == 2) // SystemAccess_PermissionDenied
	{
		TW.information(null, "System access permission denied", "Cannot open the containing directory, due to insufficient permissions.\n\nEnable \"Enable scripts to run system commands.\" in the preferences menu.");
	}
}
function locateContentsOfBraces()
{
	// Locate word ending at cursor location.
	var wordStart = TW.target.selectionStart;
	var wordEnd = TW.target.selectionStart;

	while("[({".indexOf(TW.target.text.charAt(wordStart - 1)) === -1)
	{
		wordStart = wordStart - 1;
		if(wordStart < 1)
		{
			break;
		}
	}
	while("])}".indexOf(TW.target.text.charAt(wordEnd + 1)) === -1)
	{
		wordEnd = wordEnd + 1;
		if(wordEnd >= TW.target.text.length)
		{
			break;
		}
	}

	var extractedWord = TW.target.text.substr(wordStart, wordEnd - wordStart);

	return extractedWord;
}
function getPathFromFilename(filename)
{
	// Locate the last directory separator
	var counter = 0;
	var lastDirectorySeparator = -1;
	while(counter < filename.length)
	{
		if(filename.charAt(counter) == '/')
		{
			lastDirectorySeparator = counter;
		}
		counter += 1;
	}
	var basepath = filename.substr(0, lastDirectorySeparator);
	return basepath;
}
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


openDirectory();


// Debug output
//TW.target.selectRange(inputWord.wordStart + 15);
//TW.target.insertText(inputWord.commandName);
//TW.target.selectRange(inputWord.wordStart + CommonSequence.length, max(0, NextGuess.length - CommonSequence.length));
