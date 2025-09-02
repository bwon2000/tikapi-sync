# Migration Plan Template

## Overview
**Feature/Change**: [Brief description]
**Ticket Reference**: README.md#planned-changes - [checklist item]
**Breaking Change**: [Yes/No]

## Current State
Describe the current implementation that will be changed.

## Desired End State  
Describe the target implementation after migration.

## Migration Steps

### Phase 1: Documentation
- [ ] Update README.md "Planned Changes" section
- [ ] Update ARCHITECTURE.md with new design
- [ ] Update DEPLOY.md if deployment changes
- [ ] Run `./scripts/check-docs-drift.sh` to establish baseline

### Phase 2: Implementation
- [ ] [Step 1: specific change]
- [ ] [Step 2: specific change]  
- [ ] [Step 3: specific change]
- [ ] Test each step incrementally

### Phase 3: Verification
- [ ] All tests pass
- [ ] `./scripts/check-docs-drift.sh` passes
- [ ] Manual verification steps completed
- [ ] Mark README checklist item complete

## Rollback Plan
If migration fails:
1. [Specific rollback steps]
2. Restore previous documentation state
3. Verify rollback with drift detection

## Risk Assessment
- **High Risk**: [List high-risk changes]
- **Medium Risk**: [List medium-risk changes]  
- **Low Risk**: [List low-risk changes]

## Dependencies
- [ ] [External dependency 1]
- [ ] [External dependency 2]

## Testing Plan
- [ ] Unit tests for [component]
- [ ] Integration tests for [workflow]
- [ ] Manual testing of [user journey]

## Communication Plan
- [ ] Update team on breaking changes
- [ ] Document new environment variables
- [ ] Update deployment instructions
