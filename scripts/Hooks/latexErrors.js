// TeXworksScript
// Title: LaTeX errors
// Description: Looks for errors in the LaTeX terminal output
// Author: Jonathan Kew & Stefan Löffler
// Version: 0.4
// Date: 2010-11-02
// Script-Type: hook
// Hook: AfterTypeset

// This is just a simple proof-of-concept; it will often get filenames wrong, for example.
// Switching the engines to use the FILE:LINE-style error messages could help a lot.


function LatexErrorAnalyzer() {
	var obj = {};
	obj.initializeParameters = function()
	{
		this.parenRE = new RegExp("[()]");
		// Should catch filenames of the following forms:
		// * ./abc, "./abc"
		// * /abc, "/abc"
		// * .\abc, ".\abc"
		// * C:\abc, "C:\abc"
		// * \\server\abc, "\\server\abc"
		// Caveats: filenames with escaped " or space in the filename don't work (correctly)
		this.newFileRE = new RegExp("^\\(\"?((?:\\./|/|.\\\\|[a-zA-Z]:\\\\|\\\\\\\\[^\\\" )]+\\\\)[^\" )]+)");
		this.lineNumRE = new RegExp("^l\\.(\\d+)");
		this.badLineRE = new RegExp("^(?:Over|Under)full \\\\hbox.*at lines (\\d+)");
		this.warnLineRE = new RegExp("^(?:LaTeX|Package (?:.*)) Warning: .*");
		this.warnLineNumRE = new RegExp("on input line (\\d+).");
		this.errors = [];
		this.warnings = [];
		this.infos = [];
	}
	obj.initializeParameters();

	function trim (zeichenkette) {
		return zeichenkette.replace (/^\s+/, '').replace (/\s+$/, '');
	}

	// get the text from the standard console output
	obj.txt = TW.target.consoleOutput;
	obj.lines = obj.txt.split('\n');

	obj.curFile = undefined;
	obj.filenames = [];
	obj.extraParens = 0;

	obj.addErrorFromLine = function(line)
	{
		var error = [];
		// record the current input file
		error[0] = this.curFile;
		// record the error message itself
		error[2] = line;
		// look ahead for the line number and record that
		error[1] = 0;
		while (++i < this.lines.length) {
			line = this.lines[i];
			if(trim(line) == '') break;
			matched = this.lineNumRE.exec(line);
			if (matched)
				error[1] = matched[1];
			error[2] += "\n" + line;
		}
		this.errors.push(error);
	}

	obj.addInfoFromLine = function(line)
	{
		var error = [];
		error[0] = this.curFile;
		error[1] = matched[1];
		error[2] = line;
		this.infos.push(error);
	}


	for (i = 0; i < obj.lines.length; ++i) {
		line = 	obj.lines[i];

		// check for error messages
		if (line.match("^! ")) {
			obj.addErrorFromLine(line);
			continue;
		}


		// check for over- or underfull lines
		matched = obj.badLineRE.exec(line);
		if (matched) {
			obj.addInfoFromLine(line);
			continue;
		}

		// check for other warnings
		matched = obj.warnLineRE.exec(line);
		if (matched) {
			var error = [];
			error[0] = obj.curFile;
			error[1] = "?";
			error[2] = line;

			while (++i < obj.lines.length) {
				line = obj.lines[i];
				if(line == '') break;
				error[2] += "\n" + line;
			}
			matched = obj.warnLineNumRE.exec(error[2].replace(/\n/, ""));
			if (matched)
				error[1] = matched[1];
			obj.warnings.push(error);
			continue;
		}

		// try to track beginning/ending of input files (flaky!)
		pos = line.search(obj.parenRE);
		while (pos >= 0) {
			line = line.slice(pos);
			if (line.charAt(0) == ")") {
				if (obj.extraParens > 0) {
					--obj.extraParens;
				}
				else if (obj.filenames.length > 0) {
					obj.curFile = obj.filenames.pop();
				}
				line = line.slice(1);
			}
			else {
				match = obj.newFileRE.exec(line);
				if (match) {
					obj.filenames.push(obj.curFile);
					obj.curFile = match[1];
					line = line.slice(match[0].length);
					obj.extraParens = 0;
				}
				else {
					++obj.extraParens;
					line = line.slice(1);
				}
			}
			if (line == undefined) {
				break;
			}
			pos = line.search(obj.parenRE);
		}
	}

	function htmlize(str) {
		var html = str;
		html = html.replace(/&/g, "&amp;");
		html = html.replace(/</g, "&lt;");
		html = html.replace(/>/g, "&gt;");
		html = html.replace(/\n /g, "\n&nbsp;");
		html = html.replace(/  /g, "&nbsp;&nbsp;");
		html = html.replace(/&nbsp; /g, "&nbsp;&nbsp;");
		return html.replace(/\n/g, "<br />\n");

	}

	function makeResultRow(data, color) {
		var html = '';
		var url = 'texworks:' + data[0] + (data[1] != '?' && data[1] != 0 ? '#' + data[1] : '');
		html += '<tr>';
		html += '<td width="10" style="background-color: ' + color + '"></td>';
		html += '<td valign="top"><a href="' + url + '">' + data[0] + '</a></td>';
		html += '<td valign="top">' + data[1] + '</td>';
		html += '<td valign="top" style="font-family: monospace;">' + htmlize(data[2]) + '</td>';
		html += '</tr>';
		return html;
	}

	function showObject(inputObject)
	{
		var tempText = "";
		for(prop in inputObject){
			tempText += prop + " -> " + inputObject[prop] + "\n";
		}
		TW.information(null, "Hej", tempText);
	}

	function suggestToDeleteAuxFilesIfSpecificErrorIsSeen()
	{
		for (index in obj.errors)
		{
			error = obj.errors[index];

			if(error[2].indexOf("File ended while scanning use of") > -1)
			{
				TW.target.removeAuxFiles();
			}
		}
	}


	suggestToDeleteAuxFilesIfSpecificErrorIsSeen(obj.errors);


	// finally, return our result (if any)
	if (obj.errors.length > 0 || obj.warnings.length > 0 || obj.infos.length > 0) {
		html  = '<html><body>';
		html += '<table border="1" cellspacing="0" cellpadding="4">';

		for(i = 0; i < obj.errors.length; ++i)
			html += makeResultRow(obj.errors[i], 'red');
		for(i = 0; i < obj.warnings.length; ++i)
			html += makeResultRow(obj.warnings[i], 'yellow');
		for(i = 0; i < obj.infos.length; ++i)
			html += makeResultRow(obj.infos[i], '#8080ff');

		html += "</table>";
		html += "</body></html>";
		TW.result = html;
	}
	undefined;
}

LatexErrorAnalyzer();


