// ----------------------------------------------------------------
// (c) Copyright 2021- SPX Graphics (https://spx.graphics)
// ----------------------------------------------------------------

// Receive item data from SPX Graphics Controller
// and store values in hidden DOM elements for
// use in the template.

// Called by SPX when data for this template item is sent/updated.
function update(data) {
  // Incoming payload is a JSON string keyed by placeholder IDs (f0, f1, f99...).
  var templateData = JSON.parse(data);
  console.log('----- Update handler called with data:', templateData)

  // Map each payload field to a DOM element with matching id.
  for (var dataField in templateData) {
    var idField = document.getElementById(dataField);
    if (idField) {
      let fString = templateData[dataField];
      // SPX may pass literal strings "undefined" / "null"; treat them as empty.
      if ( fString != 'undefined' && fString != 'null' ) {
        idField.innerText = fString
      } else {
        idField.innerText = '';
      }
    } else {
      switch (dataField) {
        case 'comment':
        case 'epochID':
          // console.warn('FYI: Optional #' + dataField + ' missing from SPX template...');
          break;
        default:
          console.error('ERROR Placeholder #' + dataField + ' missing from SPX template.');
      }
    }
  }

  // Hand over to the template-specific update function (defined in the HTML template).
  if (typeof runTemplateUpdate === "function") { 
    runTemplateUpdate() // Play will follow
  } else {
    console.error('runTemplateUpdate() function missing from SPX template.')
  }
}

// Called by SPX "play" command.
// Animation-in is intentionally triggered from runTemplateUpdate() after data binding.
function play() {
  // console.log('----- Play handler called.')
  // if (typeof runAnimationIN === "function") { 
  //   runAnimationIN()
  // } else {
  //   console.error('runAnimationIN() function missing from SPX template.')
  // }
}

// Called by SPX "stop" command.
function stop() {
  // console.log('----- Stop handler called.')
  if (typeof runAnimationOUT === "function") { 
    runAnimationOUT()
  } else {
    console.error('runAnimationOUT() function missing from SPX template.')
  }
}

// Called by SPX "next/continue" command for multi-step templates.
function next(data) {
  console.log('----- Next handler called.')
  if (typeof runAnimationNEXT === "function") { 
    runAnimationNEXT()
  } else {
    console.error('runAnimationNEXT() function missing from SPX template.')
  }
}

// Decode encoded text so template fields can safely render symbols/entities.
function htmlDecode(txt) {
  var doc = new DOMParser().parseFromString(txt, "text/html");
  return doc.documentElement.textContent;
}

// Short helper for document.getElementById with guard logging.
function e(elementID) {
  if (!elementID) {
    console.warn('Element ID is falsy, returning null.');
    return null;
  }
  if (!document.getElementById(elementID)) {
    console.warn('Element ' + elementID + ' not found, returning null.');
    return null;
  }
  return document.getElementById(elementID);
}

// Global error trap for template runtime errors.
window.onerror = function (msg, url, row, col, error) {
  let err = {};
  err.file = url;
  err.message = msg;
  err.line = row;
  console.log('%c' + 'SPX Template Error Detected:', 'font-weight:bold; font-size: 1.2em; margin-top: 2em;');
  console.table(err);
  // spxlog('Template Error Auto Detected: file: ' + url + ', line: ' + row + ', msg; ' + msg,'WARN')
};

// Utility validator used by some templates before writing text fields.
function validString(str) {
  let S = str.toUpperCase();
  // console.log('checking validString(' + S +');');
  switch (S) {
    case "UNDEFINED":
    case "NULL":
    case "":
      return false  // not a valid string
      break;
  }
  return true; // is a valid string
}
