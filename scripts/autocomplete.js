// TeXworksScript
// Title: Context aware autocomplete
// Description: Autocompletion inspired by vim.
// Author: Henrik Skov Midtiby
// Version: 0.3
// Date: 2010-01-30
// Script-Type: standalone
// Context: TeXDocument
// Shortcut: Ctrl+M

// Helper functions


function isAlphaNumeric(character)
{
	if('a' <= character && character <= 'z') {
		return(true); }
	if('A' <= character && character <= 'Z') {
		return(true); }
	if('0' <= character && character <= '9') {
		return(true); }
	if('/' == character) {
		return(true); }
	return(false);
}


function isAlphaNumericKommaOrSpace(character)
{
	// Check for alpha numeric values
	if('a' <= character && character <= 'z') {
		return(true); }
	if('A' <= character && character <= 'Z') {
		return(true); }
	if('0' <= character && character <= '9') {
		return(true); }
	// Check for komma
	if(',' == character) {
		return(true); }
	// Check for space and tabulator
	if(' ' == character) {
		return(true); }
	if('\t' == character) {
		return(true); }
	if('/' == character) {
		return(true); }
	return(false);
}


// Function for removing dublicate element in an array.
// Code from http://www.martienus.com/code/javascript-remove-duplicates-from-array.html
function unique(a)
{
   var r = new Array();
   o:for(var i = 0, n = a.length; i < n; i++)
   {
      for(var x = 0, y = r.length; x < y; x++)
      {
         if(r[x]==a[i]) continue o;
      }
      r[r.length] = a[i];
   }
   return r;
}


// Function that returns the largest of two input parameters.
function max(a, b)
{
	if(a > b) {
		return(a);
	} else {
		return(b);
	}
}


// Function that extracts the longest alphanumeric string ending 
// on the current cursor location.
// In addition is it determined if the word is a parameter to a command, in
// this case is the command name returned.
function locateWordEndingOnCursor()
{
	// Locate word ending at cursor location.
	var wordStart = TW.target.selectionStart;
	var wordEnd = TW.target.selectionStart;

	while(isAlphaNumeric(TW.target.text.charAt(wordStart - 1)))
	{
		wordStart = wordStart - 1;
	}

	var extractedWord = TW.target.text.substr(wordStart, wordEnd - wordStart);
	var markedWord = TW.target.selection;
	var lastGuess = extractedWord + markedWord;
	var commandName = getCommandName(wordStart);

	return {wordStart: wordStart, extractedWord: extractedWord, lastGuess: lastGuess, commandName: commandName};
}



function getCommandName(wordStart)
{
	// Determine if the word is a parameter to a command
	var counter = 100;
	var commandName = "nothing";
	while(counter > 0 && isAlphaNumericKommaOrSpace(TW.target.text.charAt(wordStart - 1)))
	{
		wordStart = wordStart - 1;
		counter = counter - 1;
		commandName = "something";
	}
	if(TW.target.text.charAt(wordStart - 1) == "{")
	{
		commandName = "more";
		var commandEnd = wordStart - 1;
		var commandStart = wordStart - 1;
		while(counter > 0 && isAlphaNumeric(TW.target.text.charAt(commandStart - 1)))
		{
			commandName = commandName + counter;
			commandStart = commandStart - 1;
			counter = counter - 1;
		}
		if(TW.target.text.charAt(commandStart - 1) == '\\')
		{
			commandName = TW.target.text.substr(commandStart, commandEnd - commandStart);
		}
	}

	return(commandName);
}


function locateMatchingWordsInString(wordToMatch, parameterText, words)
{
	var searchIndex = 0;
	// TW.target.insertText(parameterText);

	var continueInLoop = true;
	while(continueInLoop)
	{
		continueInLoop = false;
		var tempStart = parameterText.substr(searchIndex).indexOf(wordToMatch);
		if(tempStart > -1)
		{
			var tempEnd = tempStart;
			while(isAlphaNumeric(parameterText.charAt(searchIndex + tempEnd)))
			{
				tempEnd = tempEnd + 1;
			}
			var tempWord = parameterText.substr(searchIndex + tempStart, tempEnd - tempStart);
			if(tempWord.length > wordToMatch.length && !isAlphaNumeric(parameterText.charAt(searchIndex + tempStart - 1)))
			{
				words.push(tempWord);
			}
			searchIndex = searchIndex + tempStart + 1;
			continueInLoop = true;
		}
	}
	return(words);
}


function getTextFromAllOpenWindows()
{
	var windows = TW.app.getOpenWindows();
	var fullText = "";

	for (editor in windows)
    {
       	var targetDocument = windows[editor];
		// TODO: Only parse if the file has .tex as the extension.
		// TODO: Search for citations if the file ends on .bib
		fullText = fullText + targetDocument.text + " ";
	}

	return(fullText);
}

function locateMatchingWords(wordToMatch, commands)
{
	var words = [];
	// Only look for matches if the wordToMatch is nonempty.
	if(wordToMatch.length > 0)
	{
		fullText = getTextFromAllOpenWindows();
		if(commands.length == 0)
		{
			// No command names were specified
			words = locateMatchingWordsInString(wordToMatch, fullText, words);
		}
		else
		{
			// One or more command names were specified.
			// Only search for matching words within parameters to these commands.
			for(idx1 = 0; idx1 < commands.length; idx1++)
			{
				var Command = commands[idx1];
				var RegExpString = "\\\\" + Command + "{([^}]*)}";
				var CommandParameters = new RegExp(RegExpString, "g");
				var labelsList = fullText.match(CommandParameters);
				if(labelsList)
				{
					for(idx = 0; idx < labelsList.length; idx++)
					{
						var parameterText = labelsList[idx];
						words = locateMatchingWordsInString(wordToMatch, parameterText, words);
					}
				}
			}
		}
	}
	return(wordsCleanUp(words, wordToMatch));
}

function wordsCleanUp(words, wordToMatch)
{
	// Remove duplicates
	words = unique(words);
	// Ensure that there is at least one word in the words list.
	if(words.length == 0)
	{
		words.push(wordToMatch);
	}
	return(words);
}


// Function that examines all the matching words. 
// The longest common prefix is determined from all the matching words.
function determineLongestCommonInitialSequence(words)
{
	var CommonSequence = words[0];
	var SeqLength = words[0].length;
	if(words.length > 1)
	{
		CommonSequence = words[0];
		for(k = 1; k < words.length; k++)
		{
			for(kk = 0; kk < SeqLength; kk++)
			{
				if(words[0].charAt(kk) != words[k].charAt(kk))
				{
					SeqLength = kk;
					CommonSequence = words[0].substr(0, kk);
				}
			}
		}
	}
	return CommonSequence;
}


// Given a list of matching words and the current guess, the function 
// returns the next guess to try.
// If the current guess is empty the first matching word is returned.
function determineNextGuess(words, lastGuess)
{
	// Insert first match after the currently marked section.
	var NextGuess = "";
	if(words.length > 0)
	{
		NextGuess = words[0];
		for(k = 0; k < words.length - 1; k++)
		{
			if(words[k] == lastGuess)
			{
				NextGuess = words[k + 1];
				break;
			}
		}
	}
	return NextGuess;
}


function getEndOfCommonSubstring(CommonSequence, inputWord)
{
	var offset = inputWord.extractedWord.length;
	var seqLength = CommonSequence.length - inputWord.extractedWord.length;
	return CommonSequence.substr(offset, seqLength);
}


function determineMatchingCommandsFromCurrentCommand(currentCommand)
{
	if(currentCommand == "ref" || currentCommand == "pageref")
	{
		return(["label"]);
	}
	if(currentCommand == "label")
	{
		return(["pageref", "ref"]);
	}
	return([]);
}

function getListOfFilesInDir(directory)
{
	var retVal = TW.system("ls " + directory, true);

	return retVal.output;
}

function getMatchingFilenames(filenamesInDirectory, localPath, inputWord, words)
{
	while(filenamesInDirectory.indexOf('\n') > -1)
	{
		var index = filenamesInDirectory.indexOf('\n');
		var tempWord = filenamesInDirectory.substr(0, index);
		if(localPath != "")
		{
			tempWord = localPath + "/" + tempWord;
		}
		filenamesInDirectory = filenamesInDirectory.substr(index + 1, filenamesInDirectory.length - index)

		if(tempWord.indexOf(inputWord.extractedWord) == 0)
		{
			words.push(tempWord);
		}
	}
	if(words.length > 0)
	{
		words = unique(words);
	}
	else
	{
		words.push(inputWord.extractedWord);
	}
	return(words);
}

var inputWord = locateWordEndingOnCursor();
if(inputWord.commandName == "includegraphics" ||
		inputWord.commandName == "input" ||
		inputWord.commandName == "include")
{
	var currentDirectory = getPathFromFilename(TW.target.fileName);
	var localPath = getPathFromFilename(inputWord.extractedWord);
	var filenamesInDirectory = getListOfFilesInDir(currentDirectory + "/" + localPath);
	var words = getMatchingFilenames(filenamesInDirectory, localPath, inputWord, []);
}
else
{
	var matchingCommands = determineMatchingCommandsFromCurrentCommand(inputWord.commandName);
	var words = locateMatchingWords(inputWord.extractedWord, matchingCommands);
	//TW.information(null, "Hej", words);
}
var CommonSequence = determineLongestCommonInitialSequence(words);
//TW.information(null, "CommonSequence", CommonSequence);
var CommonStringInAllMatchingWords = getEndOfCommonSubstring(CommonSequence, inputWord);
//TW.information(null, "CommonStringInAllMatchingWords", CommonStringInAllMatchingWords);


// Insert remaining part of the common substring
TW.target.insertText(CommonStringInAllMatchingWords);

var NextGuess = determineNextGuess(words, inputWord.lastGuess);
//TW.information(null, "NextGuess", NextGuess);

TW.target.insertText(NextGuess.substr(CommonSequence.length, NextGuess.length));
TW.target.selectRange(inputWord.wordStart + CommonSequence.length, max(0, NextGuess.length - CommonSequence.length));

//TW.information(null, "Hej", getListOfFilesInDir('.'))
//TW.information(null, "Hej", inputWord.commandName)

//var mYchildrenRegion = TW.target.childrenRegion;
//var howMany = mYchildrenRegion.numRects;
//TW.information(null, "childrenRegion Rectangles", howMany);
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
			//TW.information(null, "Val", filename.charAt(counter));
		}
		counter += 1;
	}
	//TW.information(null, "Counter:", "Counter: " + counter + " filename.length: " + filename.length);
	var basepath = filename.substr(0, lastDirectorySeparator);
	return basepath;
}


// Debug output
//TW.target.selectRange(inputWord.wordStart + 15);
//TW.target.insertText(inputWord.commandName);
//TW.target.selectRange(inputWord.wordStart + CommonSequence.length, max(0, NextGuess.length - CommonSequence.length));
