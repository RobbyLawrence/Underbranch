### when text is entered into editor
1. the new text is put into currentValue in LateXEditor.js ~120.
  It calls onChange to update currentValue.
  2. then value in 'handleCodeChange' in App.js. this sets the new Latex code from 'value' passed to it. ~59
  3. latexCode in App.js, the text is stored in setLatexCode and assigned to latexCode. ~13
