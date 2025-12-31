/**
 * Script to find and optionally remove console.log statements
 * Usage: node scripts/remove-console-logs.js [--fix]
 */

const fs = require('fs');
const path = require('path');

const shouldFix = process.argv.includes('--fix');
const dirsToScan = ['components', 'lib', 'app'];
const filesToIgnore = [
  'logger.ts',
  'error-handler.ts',
  'middleware.ts'
];

let totalFound = 0;
let totalFixed = 0;

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (!['node_modules', '.next', 'dist', 'build'].includes(file)) {
        scanDirectory(filePath);
      }
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
      // Skip ignored files
      if (filesToIgnore.some(ignored => filePath.includes(ignored))) {
        return;
      }
      
      processFile(filePath);
    }
  });
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let modified = false;
  let lineNumber = 0;
  
  const newLines = lines.map(line => {
    lineNumber++;
    
    // Check for console.log
    if (line.includes('console.log') || line.includes('console.warn') || line.includes('console.error')) {
      totalFound++;
      console.log(`  Found in ${filePath}:${lineNumber}`);
      console.log(`    ${line.trim()}`);
      
      if (shouldFix) {
        modified = true;
        totalFixed++;
        // Comment out the line instead of removing it
        return line.replace(/(\s*)console\.(log|warn|error)/, '$1// console.$2');
      }
    }
    
    return line;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
    console.log(`  ✅ Fixed: ${filePath}\n`);
  }
}

console.log('🔍 Scanning for console statements...\n');

dirsToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
});

console.log('\n' + '='.repeat(60));
console.log(`📊 Summary:`);
console.log(`   Total console statements found: ${totalFound}`);

if (shouldFix) {
  console.log(`   Total fixed: ${totalFixed}`);
  console.log('\n✅ All console statements have been commented out!');
} else {
  console.log('\n💡 Run with --fix flag to automatically comment them out:');
  console.log('   node scripts/remove-console-logs.js --fix');
}
console.log('='.repeat(60));
