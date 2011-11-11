//TeXworksScript
//Title: Open All .tex Inputs/Includes (one per line)
//Description: Within A Selection or all Text \inputs \include with .tex in them are opened
//Author: Paul A Norman  paul.a.norman@gmail.com
// with modifications by Henrik Skov Midtiby
//Version: 0.2
//Date: 2011-11-11
//Script-Type: standalone

/* Main Usage Points:

	 1. If the cursor is between the braces of an \include{here.tex} or 
	 \input{there.tex} that document only will be opened

	 2. If you Select some lines of text anywhere (even before or after the 
	 document environment) all \include{my-files.tex} or 
	 \input{my-other-files.tex} will be opened (even for \include{files.tex} 
	 that are not in \includeonly{list.tex,of.tex,files.tex}

	 3. If you Select nothing and the cursor is not between 
	 \something{braces} then all active \input{}-s and include{}-s between 
	 \begin{document and \end{document} will be processed. If an 
	 \includeonly is active in the preamble (not % commented out) it will be 
	 used to check for any \include{file-names.tex} before using them.

	 4. Any %commented out lines will be ignored except when the cursor is 
	 between braces for the opening of one file only.

	 5. All \input{filename.tex} and \include{filename.tex} need to have 
	 .tex as part of their name as for \includeonly{one.tex,two.tex,etc.tex}

	 6. No leading space(s) before \input{} or \include{}, and only one per
	 line. %comments or anything else can follow (ok) e.g. 
	 \input(my-file.tex} % something to say here
	 \input(my-file.tex} \somethingToDoHere

 */


function showObject(inputObject)
{
	var tempText = "";
	for(prop in inputObject){
		tempText += prop + " -> " + inputObject[prop] + "\n";
	}
	TW.information(null, "Hej", tempText);
}
function mainfunction()
{
	////////////// Premable Begin \\\\\\\\\\\\\

	var inDocument = false;
	var explicitSelection = false;
	var checkForIncludeOnly = false;
	var buildIncludeOnly='';
	var followThese = new Array();
	var includeList = new Array();
	var includeFound = '';

	var currentFileName  =  TW.target.fileName;
	var currentDirectoryLastDelim  =  currentFileName.lastIndexOf('/');
	var  currentDirectory  = currentFileName.substr(0,currentDirectoryLastDelim +1);

	var txt = TW.target.selection;
	if (txt == "")
	{ 
		var selStart =TW.target.selectionStart;
		TW.target.balanceDelimiters(); // check if cursor is in an input or include 
		txt = TW.target.selection;
		TW.target.selectRange(selStart); /* protect document form accidental alteration of script selected area
												reposition cursor to original position*/

		if (txt != "")
		{
			if ( (txt.substr(0,1) == "{") & (txt.indexOf('.tex') > -1) )
			{
				txt = '\\input' + txt; // make ready for processing as below to open one file where cursor was between braces {my-file.tex}
				inDocument = true;
				explicitSelection = true;
			}
		}		
		else     
		{
			txt = TW.target.text;
		}
	}// if (txt == "")
	else  // User has explicitly chosen to open these, no matter where they are
	{
			inDocument = true;
			explicitSelection = true;
	} 
	var alLines = txt.split("\n");

	////////////// Premable End \\\\\\\\\\\\\


	if (explicitSelection == false) // whole master document is being processed
	{
		var startIncludeOnly = txt.indexOf('\\includeonly{'); // there is at least one in document
		if (startIncludeOnly > -1)
		{
			// weed out commented out %\includeonly{}-s
			for (check in alLines)
			{
				if (alLines[check].indexOf('\\includeonly{') == 0) // not commented out should only be one \includeonly{ at this position in premable
				{
					includeFound = alLines[check];
					checkForIncludeOnly = true ;
					buildIncludeOnly = includeFound.substr(13, includeFound.length - 12);	
					endIncludeOnly = buildIncludeOnly.indexOf("}");	
					buildIncludeOnly = buildIncludeOnly.substr(0, endIncludeOnly);
					includeList = buildIncludeOnly.split();
					break; // should only be one active  \includeonly in preamble
				}
			} // /End. 	for (check in alLines)
		} // /End. if (startIncludeOnly > -1)
	}	 // /End. (explicitSelection == false)

	// TW.warning(null,"Build Include Only:", buildIncludeOnly);		 

	for (line in alLines)
	{
		if (alLines[line].substr(0,1) == '%'){continue;} // ignore commented lines

		thisLine = alLines[line].toLowerCase();	 

		if (thisLine.indexOf('\\begin{document}') >-1) {inDocument = true;}   // avoid preamble references
		if ( (explicitSelection == false) & (thisLine.indexOf('\\end{document}')  >-1) ) {inDocument = false;}  // avoid user notes below document proper, but explicitSelection test can allow a user selection that crosses over the \end{document}.

		// ADVICE: We are looking for only one \input{} per line	
		if ( (inDocument == true) & doesLineContainInputOrInclude(thisLine))
		{
			var doingInclude = false;

			if  (thisLine.indexOf('\\input{')>-1)
			{
				beginInput = thisLine.indexOf('\\input{') + 7;
			}
			else
			{
				beginInput = thisLine.indexOf('\\include{') + 9;
				doingInclude = true;
			}		 

			endInput  = thisLine.indexOf('.tex}') + 4;

			var fileName = alLines[line].substr(beginInput,(endInput - beginInput)); // use original reference to retain letter case of file name for sensative OSes ;) 
			//TW.warning(null,"Filename Check:", fileName);
			if (  (checkForIncludeOnly == true) & (doingInclude == true) & (buildIncludeOnly != "")  )
			{
				if(isFileInIncludeList(fileName, includeList))
				{
					break;
				}
				else
				{
					continue;
				}
			} 

			fileName = currentDirectory + fileName; 
			fileName = fileName.replace('//','/'); // remove any un-needed user added slash from input lead  
			fileName = fileName.replace('/./','/'); // remove any un-needed user added this-directory slash from input lead 			

			// keeping TW 'opening' in a seperate clause for debugging and any future scripting devlopment
			followThese.push(fileName); 
		}
	}// /End. for	(line in alLines)

	openLocatedFiles(followThese);

	if (followThese.length == 1)
	{
		//openedDoc.showNormal()
	} // user has requested only one file, show it
	else
	{
		TW.warning(null,"Look Under Window Menu", "Files Are Available\nUnder the Window Menu");
	}
	null;
}
function doesLineContainInputOrInclude(thisLine)
{
	return ((thisLine.indexOf('\\input{')>-1) | (thisLine.indexOf('\\include{')>-1) )& (thisLine.indexOf('.tex}')>-1) 
}
function isFileInIncludeList(fileName, includeList)
{
	var usable = false;

	for (item in includeList)
	{
		if (includeList[item].indexOf(fileName) > -1 )
		{
			usable = true;
			break;
		}
	}	
	if (usable == false)					
	{ 
		continue; 
	} // include{fileName} not in \includeonly{}
}
function openLocatedFiles(followThese)
{
	// keeping TW 'opening' in a seperate clause for debugging and any future scripting development
	for (fileNum in followThese)
	{
		fileName = followThese[fileNum];					 
		// TODO: Detect if the file allready exists.
		openedDoc = TW.app.openFileFromScript(fileName, TW);
		if(openedDoc.result == null)
		{
			// Failed to open document, it might be because the document does not exist.
			// Create the document.
			var resp = TW.writeFile(fileName, "");
			var newWindow = TW.app.openFileFromScript(fileName, TW);
			if(newWindow.status == 0) // SystemAccess_OK
			{
				copyTEXOptionsFromCurrentDocumentToNewDocument(newWindow);
			}
		}
	}// /End.  for (fileNum in followThese)
}
function copyTEXOptionsFromCurrentDocumentToNewDocument(newWindow)
{
	// Populate with % !TEX lines from the current document.
	var linesInCurrentDocument = TW.target.text.split("\n");
	for(idx in linesInCurrentDocument)
	{
		curLine = linesInCurrentDocument[idx];
		if(curLine.indexOf('% !TEX') > -1)
		{
			newWindow.result.insertText(curLine);
			newWindow.result.insertText("\n");
		}
	}
}

mainfunction();


