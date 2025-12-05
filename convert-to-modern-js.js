#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find all variables that get assigned (not just declared)
const assignedVars = new Set();
const assignmentMatches = content.matchAll(/([a-zA-Z$_][a-zA-Z0-9$_]*)\s*=/g);
for (const match of assignmentMatches) {
  assignedVars.add(match[1]);
}

// Properties being set (not variable assignments)
const properties = ['src', 'loop', 'currentTime', 'onload', 'onresize'];

// Remove properties from assigned vars
properties.forEach(prop => assignedVars.delete(prop));

// Convert var declarations at the top level
// All top-level vars that are assigned should be let
content = content.replace(/^var\s+([^;]+);$/gm, (match, varList) => {
  const vars = varList.split(',').map(v => v.trim());
  const letVars = [];
  
  vars.forEach(varName => {
    // All top-level variables that are assigned should be let
    if (assignedVars.has(varName)) {
      letVars.push(varName);
    }
  });
  
  if (letVars.length > 0) {
    return 'let ' + letVars.join(', ') + ';';
  }
  return match; // Keep original if nothing to convert
});

// Convert var declarations inside functions
content = content.replace(/(\s+)var\s+([a-zA-Z$_][a-zA-Z0-9$_]*(?:\s*,\s*[a-zA-Z$_][a-zA-Z0-9$_]*)*);/g, (match, indent, varList) => {
  const vars = varList.split(',').map(v => v.trim());
  
  // For local variables, use let (they're typically reassigned within the function)
  return indent + 'let ' + varList + ';';
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Converted var to let in index.js');
