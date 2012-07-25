//TeXworksScript
//Title: Open All .tex Inputs/Includes (one per line)
//Description: Within A Selection or all Text \inputs \include with .tex in them are opened
//Author: Paul A Norman  paul.a.norman@gmail.com
// with modifications by Henrik Skov Midtiby
//Version: 0.2
//Date: 2011-11-11
//Script-Type: standalone
// Shortcut: Ctrl+Shift+o

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



// Include functionality from other script
var file = TW.readFile("openAllinputsFunctions.js");
if (file.status == 0) {
  eval(file.result);
  file = null;  // free mem
}

filehandler = OpenAllInputFiles();
filehandler.openInputFiles();


