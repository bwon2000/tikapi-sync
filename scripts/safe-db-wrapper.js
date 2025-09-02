#!/usr/bin/env node
// Safe Database Wrapper - Immutable Protection Layer
// This wrapper cannot be bypassed without explicit permission

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Import guardian for safety validation
import './db-guardian.js';

const ALLOWED_COMMANDS = [
  'npm run db:inspect',
  'npm run db:query',
  'node scripts/db-inspect.js',
  'node scripts/db-query.js'
];

const BLOCKED_PATTERNS = [
  // Block direct Supabase usage
  /supabase.*from.*delete/gi,
  /supabase.*from.*drop/gi,
  /supabase.*from.*truncate/gi,
  
  // Block direct script modification
  /echo.*>.*db-query/gi,
  /cat.*>.*db-query/gi,
  /sed.*db-query/gi,
  
  // Block environment manipulation
  /export.*SUPABASE.*=/gi,
  /SUPABASE.*=.*node/gi,
  
  // Block Node.js eval/exec bypass
  /node -e.*delete|drop|truncate/gi,
  /node --eval.*delete|drop|truncate/gi
];

function validateCommand(command) {
  // Check if command is in allowed list
  const isAllowed = ALLOWED_COMMANDS.some(allowed => 
    command.trim().startsWith(allowed.trim())
  );
  
  if (!isAllowed) {
    console.error('🚨 BLOCKED: Command not in safe whitelist');
    console.error('Allowed commands:', ALLOWED_COMMANDS.join(', '));
    return false;
  }
  
  // Check for blocked patterns
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      console.error('🚨 BLOCKED: Detected dangerous pattern in command');
      console.error('Pattern:', pattern);
      return false;
    }
  }
  
  return true;
}

function executeCommand(command) {
  if (!validateCommand(command)) {
    process.exit(1);
  }
  
  console.log('🛡️  Safe execution:', command);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Command failed:', error.message);
      return;
    }
    if (stderr) {
      console.error('⚠️  Warning:', stderr);
    }
    console.log(stdout);
  });
}

// Export for use in other scripts
export { validateCommand, executeCommand };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv.slice(2).join(' ');
  if (!command) {
    console.log('🛡️  Safe Database Wrapper');
    console.log('Usage: node scripts/safe-db-wrapper.js <command>');
    console.log('');
    console.log('Allowed commands:');
    ALLOWED_COMMANDS.forEach(cmd => console.log(`  ${cmd}`));
    process.exit(1);
  }
  
  executeCommand(command);
}
