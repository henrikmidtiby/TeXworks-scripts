// TeXworksScript
// Title: Autocomplete
// Description: Autocompletion inspired by vim.
// Author: Henrik Skov Midtiby
// Version: 0.1
// Date: 2010-12-26
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
	return(false);
}


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


function max(a, b)
{
	if(a > b) {
		return(a);
	} else {
		return(b);
	}
}


function locateWordEndingOnCursor()
{
	var wordStart = TW.target.selectionStart;
	var wordEnd = TW.target.selectionStart;

	while(isAlphaNumeric(TW.target.text.charAt(wordStart - 1)))
	{
		wordStart = wordStart - 1;
	}

	var extractedWord = TW.target.text.substr(wordStart, wordEnd - wordStart);
	var markedWord = TW.target.selection;
	var lastGuess = extractedWord + markedWord;

	return {wordStart: wordStart, extractedWord: extractedWord, lastGuess: lastGuess};
}


function locateMatchingWords(wordToMatch)
{
	var words = [];
	fullText = TW.target.text;
	var selectionStart = TW.target.selectionStart;
	var searchIndex = 0;
	var tempStart = 0;
	var continueInLoop = true;
	while(continueInLoop)
	{
		continueInLoop = false;
		tempStart = fullText.substr(searchIndex).indexOf(wordToMatch);
		if(tempStart > -1)
		{
			var tempEnd = tempStart;
			while(isAlphaNumeric(fullText.charAt(searchIndex + tempEnd)))
			{
				tempEnd = tempEnd + 1;
			}
			var tempWord = fullText.substr(searchIndex + tempStart, tempEnd - tempStart);
			if(tempWord.length > wordToMatch.length)
			{
				words.push(tempWord);
			}
			searchIndex = searchIndex + tempStart + 1;
			continueInLoop = true;
		}
	}
	// Remove duplicates
	words = unique(words);
	// Ensure that there is at least one word in the words list.
	if(words.length == 0)
	{
		words.push(wordToMatch);
	}
	return(words);
}


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


var inputWord = locateWordEndingOnCursor();
var words = locateMatchingWords(inputWord.extractedWord);
var CommonSequence = determineLongestCommonInitialSequence(words);
var CommonStringInAllMatchingWords = getEndOfCommonSubstring(CommonSequence, inputWord);


// Insert remaining part of the common substring
TW.target.insertText(CommonStringInAllMatchingWords);

var NextGuess = determineNextGuess(words, inputWord.lastGuess);

TW.target.insertText(NextGuess.substr(CommonSequence.length, NextGuess.length));
TW.target.selectRange(inputWord.wordStart + CommonSequence.length, max(0, NextGuess.length - CommonSequence.length));


