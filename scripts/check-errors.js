const fs = require('fs');
const path = require('path');

// Color codes for console output
const colors = {
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}`);
}

// Check for missing files referenced in imports
function checkMissingFiles() {
  logSection('CHECKING FOR MISSING FILES');
  
  const missingFiles = [];
  const srcDir = path.join(process.cwd(), 'src');
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for relative imports
        const importRegex = /import.*from\s+['"](\.[^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          let resolvedPath = path.resolve(path.dirname(filePath), importPath);
          
          // Try different extensions
          const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
          let found = false;
          
          for (const ext of extensions) {
            const testPath = resolvedPath + ext;
            if (fs.existsSync(testPath)) {
              found = true;
              break;
            }
          }
          
          if (!found) {
            missingFiles.push({
              file: path.relative(process.cwd(), filePath),
              import: importPath,
              resolvedPath: path.relative(process.cwd(), resolvedPath)
            });
          }
        }
      }
    });
  }
  
  if (fs.existsSync(srcDir)) {
    scanDirectory(srcDir);
  }
  
  if (missingFiles.length > 0) {
    log('red', '❌ Missing imported files found:');
    missingFiles.forEach(({ file, import: imp, resolvedPath }) => {
      log('red', `  ${file}: imports "${imp}" -> ${resolvedPath} (NOT FOUND)`);
    });
  } else {
    log('green', '✅ No missing imported files found');
  }
  
  return missingFiles;
}

// Check package.json dependencies
function checkDependencies() {
  logSection('CHECKING DEPENDENCIES');
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log('red', '❌ package.json not found');
    return [];
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const issues = [];
  
  // Check for missing dependencies that are imported
  const srcDir = path.join(process.cwd(), 'src');
  const importedPackages = new Set();
  
  function scanForImports(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanForImports(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for npm package imports
        const importRegex = /import.*from\s+['"]([^.][^'"]+)['"]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          const packageName = match[1].split('/')[0];
          if (packageName.startsWith('@')) {
            // Scoped package
            const scopedName = match[1].split('/').slice(0, 2).join('/');
            importedPackages.add(scopedName);
          } else {
            importedPackages.add(packageName);
          }
        }
      }
    });
  }
  
  scanForImports(srcDir);
  
  // Check if imported packages are in dependencies
  importedPackages.forEach(pkg => {
    if (!dependencies[pkg] && !isBuiltInModule(pkg)) {
      issues.push({
        type: 'missing_dependency',
        package: pkg,
        message: `Package "${pkg}" is imported but not in dependencies`
      });
    }
  });
  
  // Check for unused dependencies
  Object.keys(dependencies).forEach(pkg => {
    if (!importedPackages.has(pkg) && !isEssentialDependency(pkg)) {
      issues.push({
        type: 'unused_dependency',
        package: pkg,
        message: `Package "${pkg}" is in dependencies but not imported`
      });
    }
  });
  
  if (issues.length > 0) {
    issues.forEach(issue => {
      if (issue.type === 'missing_dependency') {
        log('red', `❌ ${issue.message}`);
      } else {
        log('yellow', `⚠️  ${issue.message}`);
      }
    });
  } else {
    log('green', '✅ Dependencies look good');
  }
  
  return issues;
}

function isBuiltInModule(pkg) {
  const builtIns = ['react', 'react-dom', 'react-router-dom'];
  return builtIns.includes(pkg);
}

function isEssentialDependency(pkg) {
  const essential = [
    'typescript', 'vite', '@vitejs/plugin-react', 'tailwindcss', 
    'autoprefixer', 'postcss', 'eslint', '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser', 'eslint-plugin-react-hooks',
    'eslint-plugin-react-refresh', '@types/react', '@types/react-dom'
  ];
  return essential.includes(pkg);
}

// Check for TypeScript errors
function checkTypeScriptIssues() {
  logSection('CHECKING TYPESCRIPT ISSUES');
  
  const issues = [];
  const srcDir = path.join(process.cwd(), 'src');
  
  function scanForTSIssues(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanForTSIssues(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Check for common TypeScript issues
        const lines = content.split('\n');
        
        lines.forEach((line, index) => {
          const lineNum = index + 1;
          
          // Check for any type
          if (line.includes(': any') && !line.includes('// @ts-ignore')) {
            issues.push({
              file: relativePath,
              line: lineNum,
              type: 'any_type',
              message: 'Using "any" type - consider using specific types'
            });
          }
          
          // Check for unused imports
          if (line.trim().startsWith('import') && line.includes('{')) {
            const importMatch = line.match(/import\s*{([^}]+)}/);
            if (importMatch) {
              const imports = importMatch[1].split(',').map(i => i.trim());
              imports.forEach(imp => {
                const cleanImport = imp.replace(/\s+as\s+\w+/, '').trim();
                if (cleanImport && !content.includes(cleanImport.split(' ')[0])) {
                  // This is a basic check - might have false positives
                }
              });
            }
          }
          
          // Check for console.log (should be removed in production)
          if (line.includes('console.log') && !line.includes('console.error')) {
            issues.push({
              file: relativePath,
              line: lineNum,
              type: 'console_log',
              message: 'console.log found - consider removing for production'
            });
          }
          
          // Check for TODO/FIXME comments
          if (line.includes('TODO') || line.includes('FIXME')) {
            issues.push({
              file: relativePath,
              line: lineNum,
              type: 'todo',
              message: 'TODO/FIXME comment found'
            });
          }
        });
      }
    });
  }
  
  scanForTSIssues(srcDir);
  
  if (issues.length > 0) {
    issues.forEach(issue => {
      const color = issue.type === 'any_type' ? 'yellow' : 
                   issue.type === 'console_log' ? 'yellow' : 'blue';
      log(color, `${issue.type === 'todo' ? '📝' : '⚠️'}  ${issue.file}:${issue.line} - ${issue.message}`);
    });
  } else {
    log('green', '✅ No obvious TypeScript issues found');
  }
  
  return issues;
}

// Check for React-specific issues
function checkReactIssues() {
  logSection('CHECKING REACT ISSUES');
  
  const issues = [];
  const srcDir = path.join(process.cwd(), 'src');
  
  function scanForReactIssues(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanForReactIssues(filePath);
      } else if (file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        // Check for missing React import (in older React versions)
        if (content.includes('JSX') && !content.includes("import React") && !content.includes("import * as React")) {
          // This might be okay in React 17+ with new JSX transform
        }
        
        // Check for missing key props in lists
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('.map(') && !line.includes('key=')) {
            const nextLines = lines.slice(index, index + 5).join(' ');
            if (nextLines.includes('<') && !nextLines.includes('key=')) {
              issues.push({
                file: relativePath,
                line: index + 1,
                type: 'missing_key',
                message: 'Possible missing key prop in mapped component'
              });
            }
          }
          
          // Check for inline styles (should use CSS classes)
          if (line.includes('style={{') && !line.includes('backgroundColor')) {
            issues.push({
              file: relativePath,
              line: index + 1,
              type: 'inline_style',
              message: 'Consider using CSS classes instead of inline styles'
            });
          }
        });
      }
    });
  }
  
  scanForReactIssues(srcDir);
  
  if (issues.length > 0) {
    issues.forEach(issue => {
      log('yellow', `⚠️  ${issue.file}:${issue.line} - ${issue.message}`);
    });
  } else {
    log('green', '✅ No obvious React issues found');
  }
  
  return issues;
}

// Check for potential runtime errors
function checkRuntimeIssues() {
  logSection('CHECKING POTENTIAL RUNTIME ISSUES');
  
  const issues = [];
  const srcDir = path.join(process.cwd(), 'src');
  
  function scanForRuntimeIssues(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanForRuntimeIssues(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          const lineNum = index + 1;
          
          // Check for potential null/undefined access
          if (line.includes('.') && !line.includes('?.') && (line.includes('data.') || line.includes('user.') || line.includes('response.'))) {
            if (!line.includes('if') && !line.includes('&&') && !line.includes('||')) {
              issues.push({
                file: relativePath,
                line: lineNum,
                type: 'null_access',
                message: 'Potential null/undefined access - consider using optional chaining'
              });
            }
          }
          
          // Check for array access without length check
          if (line.includes('[0]') && !line.includes('length')) {
            issues.push({
              file: relativePath,
              line: lineNum,
              type: 'array_access',
              message: 'Array access without length check'
            });
          }
          
          // Check for missing error handling in async functions
          if (line.includes('await') && !content.includes('try') && !content.includes('catch')) {
            issues.push({
              file: relativePath,
              line: lineNum,
              type: 'missing_error_handling',
              message: 'Async operation without error handling'
            });
          }
        });
      }
    });
  }
  
  scanForRuntimeIssues(srcDir);
  
  if (issues.length > 0) {
    issues.forEach(issue => {
      log('yellow', `⚠️  ${issue.file}:${issue.line} - ${issue.message}`);
    });
  } else {
    log('green', '✅ No obvious runtime issues found');
  }
  
  return issues;
}

// Check configuration files
function checkConfigFiles() {
  logSection('CHECKING CONFIGURATION FILES');
  
  const issues = [];
  const configFiles = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'tailwind.config.js',
    'postcss.config.js'
  ];
  
  configFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) {
      issues.push({
        file,
        type: 'missing_config',
        message: `Configuration file ${file} is missing`
      });
    } else {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (file.endsWith('.json')) {
          JSON.parse(content);
        }
        log('green', `✅ ${file} exists and is valid`);
      } catch (error) {
        issues.push({
          file,
          type: 'invalid_config',
          message: `Configuration file ${file} has syntax errors: ${error.message}`
        });
      }
    }
  });
  
  if (issues.length > 0) {
    issues.forEach(issue => {
      log('red', `❌ ${issue.message}`);
    });
  }
  
  return issues;
}

// Check for missing component files
function checkMissingComponents() {
  logSection('CHECKING FOR MISSING COMPONENT FILES');
  
  const issues = [];
  const srcDir = path.join(process.cwd(), 'src');
  
  // List of component files that should exist based on imports
  const requiredComponents = [
    'src/components/exercises/TimeTrackingExercise.tsx',
    'src/components/exercises/CompetitorAnalysisExercise.tsx',
    'src/components/exercises/WeeklyAIHabitTracker.tsx',
    'src/components/exercises/ROICalculator.tsx',
    'src/components/exercises/AIReadinessAssessment.tsx'
  ];
  
  requiredComponents.forEach(component => {
    const filePath = path.join(process.cwd(), component);
    if (!fs.existsSync(filePath)) {
      issues.push({
        file: component,
        type: 'missing_component',
        message: `Component file ${component} is missing but is imported in the code`
      });
    } else {
      log('green', `✅ ${component} exists`);
    }
  });
  
  if (issues.length > 0) {
    issues.forEach(issue => {
      log('red', `❌ ${issue.message}`);
    });
  }
  
  return issues;
}

// Check for environment variables
function checkEnvironmentVariables() {
  logSection('CHECKING ENVIRONMENT VARIABLES');
  
  const issues = [];
  const envFiles = ['.env', '.env.example'];
  
  // Required environment variables
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  let envContent = '';
  let envExists = false;
  
  for (const file of envFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      envExists = true;
      envContent = fs.readFileSync(filePath, 'utf8');
      log('green', `✅ ${file} exists`);
      break;
    }
  }
  
  if (!envExists) {
    issues.push({
      type: 'missing_env',
      message: 'No .env or .env.example file found'
    });
  } else {
    requiredVars.forEach(variable => {
      if (!envContent.includes(variable)) {
        issues.push({
          type: 'missing_env_var',
          message: `Environment variable ${variable} is missing`
        });
      }
    });
  }
  
  if (issues.length > 0) {
    issues.forEach(issue => {
      log('yellow', `⚠️  ${issue.message}`);
    });
  } else if (envExists) {
    log('green', '✅ All required environment variables are defined');
  }
  
  return issues;
}

// Run all checks
function runAllChecks() {
  console.log(`${colors.bold}${colors.blue}RUNNING CODE ERROR CHECK${colors.reset}`);
  console.log(`${colors.blue}==========================${colors.reset}`);
  
  const missingFiles = checkMissingFiles();
  const dependencyIssues = checkDependencies();
  const tsIssues = checkTypeScriptIssues();
  const reactIssues = checkReactIssues();
  const runtimeIssues = checkRuntimeIssues();
  const configIssues = checkConfigFiles();
  const componentIssues = checkMissingComponents();
  const envIssues = checkEnvironmentVariables();
  
  const allIssues = [
    ...missingFiles,
    ...dependencyIssues.filter(i => i.type === 'missing_dependency'),
    ...componentIssues,
    ...configIssues,
    ...envIssues
  ];
  
  const warnings = [
    ...dependencyIssues.filter(i => i.type === 'unused_dependency'),
    ...tsIssues,
    ...reactIssues,
    ...runtimeIssues
  ];
  
  logSection('SUMMARY');
  
  if (allIssues.length === 0) {
    log('green', '✅ No critical issues found!');
  } else {
    log('red', `❌ Found ${allIssues.length} critical issues that need to be fixed`);
  }
  
  if (warnings.length > 0) {
    log('yellow', `⚠️  Found ${warnings.length} warnings that should be reviewed`);
  }
  
  return {
    criticalIssues: allIssues,
    warnings
  };
}

runAllChecks();