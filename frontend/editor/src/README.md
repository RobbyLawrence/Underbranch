### when text is entered into editor
1. The new text is put into currentValue in LaTeXEditor.js ~120.
  It calls onChange to update currentValue.
2. Then value in 'handleCodeChange' in App.js. This sets the new Latex code from 'value' passed to it. ~59
3. latexCode in App.js, the text is stored in setLatexCode and assigned to latexCode. ~13
