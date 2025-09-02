#!/usr/bin/env node
// Database Guardian - Immutable Safety Monitor
// This script monitors and prevents database safety bypass attempts

import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

// Immutable safety checksums (update these if safety files are legitimately changed)
const SAFETY_CHECKSUMS = {
  'scripts/db-query.js': null, // Will be calculated on first run
  'scripts/db-inspect.js': null,
  '.cursorrules': null,
  'package.json': null
};

// Critical safety patterns that must exist
const REQUIRED_PATTERNS = {
  'scripts/db-query.js': [
    'destructivePatterns',
    'DELETE.*FROM',
    'DROP.*TABLE',
    'TRUNCATE.*TABLE',
    '--force',
    'isDangerous',
    'process.exit\\(1\\)'
  ],
  '.cursorrules': [
    'Database Safety',
    'Never run destructive SQL queries',
    'CRITICAL',
    'SERVICE_ROLE_KEY'
  ]
};

function calculateChecksum(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  } catch (error) {
    return null;
  }
}

function validateSafetyPatterns(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const requiredPatterns = REQUIRED_PATTERNS[filePath];
    
    if (!requiredPatterns) return true;
    
    for (const pattern of requiredPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (!regex.test(content)) {
        console.error(`🚨 SECURITY VIOLATION: Missing safety pattern "${pattern}" in ${filePath}`);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error(`❌ Cannot validate ${filePath}:`, error.message);
    return false;
  }
}

function checkForSuspiciousActivity() {
  const suspiciousPatterns = [
    // Check for attempts to bypass safety
    /\/\*.*destructivePatterns.*\*\//gi,
    /\/\/.*destructivePatterns/gi,
    /process\.exit\(1\).*\/\//gi,
    /isDangerous.*=.*false/gi,
    
    // Check for direct Supabase bypass (in single line)
    /createClient.*(?:delete|drop|truncate).*supabase/gi,
    /supabase\.from.*(?:delete|drop|truncate)/gi,
    
    // Check for environment manipulation
    /process\.env\.SUPABASE.*=.*"/gi
  ];
  
  const filesToCheck = [
    'scripts/db-query.js',
    'scripts/db-inspect.js',
    'index.mjs'
  ];
  
  for (const file of filesToCheck) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          console.error(`🚨 SUSPICIOUS ACTIVITY DETECTED in ${file}`);
          console.error(`Pattern: ${pattern}`);
          return false;
        }
      }
    } catch (error) {
      // File doesn't exist, skip
    }
  }
  
  return true;
}

function createTamperEvidence() {
  const timestamp = new Date().toISOString();
  const evidence = {
    timestamp,
    checksums: {},
    patterns_validated: true,
    guardian_version: '1.0.0'
  };
  
  // Calculate and store checksums
  for (const [filePath] of Object.entries(SAFETY_CHECKSUMS)) {
    evidence.checksums[filePath] = calculateChecksum(filePath);
  }
  
  fs.writeFileSync('.db-guardian-log.json', JSON.stringify(evidence, null, 2));
  console.log('✅ Database Guardian: Safety validation complete');
  return evidence;
}

function validateIntegrity() {
  console.log('🛡️  Database Guardian: Validating safety integrity...');
  
  // Check for suspicious modifications
  if (!checkForSuspiciousActivity()) {
    console.error('🚨 SECURITY ALERT: Suspicious activity detected!');
    console.error('   - Review recent changes to database scripts');
    console.error('   - Consider restoring from backup');
    process.exit(1);
  }
  
  // Validate safety patterns exist
  let allValid = true;
  for (const filePath of Object.keys(REQUIRED_PATTERNS)) {
    if (!validateSafetyPatterns(filePath)) {
      allValid = false;
    }
  }
  
  if (!allValid) {
    console.error('🚨 SAFETY VIOLATION: Critical safety patterns missing!');
    console.error('   - Database safety mechanisms have been compromised');
    console.error('   - Restore safety patterns before proceeding');
    process.exit(1);
  }
  
  // Create tamper evidence
  createTamperEvidence();
  
  return true;
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  validateIntegrity();
}
