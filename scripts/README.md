# Issue Creation Scripts

This directory contains PowerShell scripts to automatically create all 43 GitHub issues for the Plastic Crack MVP.

## Prerequisites

1. **Install GitHub CLI**: https://cli.github.com/
2. **Authenticate with GitHub**:
   ```bash
   gh auth login
   ```

## Usage

### Option 1: Create All Issues at Once
Run both scripts in sequence:

```powershell
cd scripts
.\create_issues_part1.ps1
.\create_issues_part2.ps1
```

### Option 2: Create Issues in Batches
1. **Part 1** (Issues #10-20): `.\create_issues_part1.ps1`
2. **Part 2** (Issues #21-43): `.\create_issues_part2.ps1`

## What Gets Created

- **43 GitHub Issues** total
- **Proper labels** for each issue type
- **Dependencies** clearly documented
- **Acceptance criteria** for each issue
- **Time estimates** for planning

## Issue Categories

- **Phase 1 (Issues #1-9)**: Foundation & Setup ✅ *Already created*
- **Phase 2 (Issues #10-22)**: Core Features
- **Phase 3 (Issues #23-32)**: Enhanced Features  
- **Phase 4 (Issues #33-43)**: Testing & Launch

## After Running Scripts

1. **Create Milestones** in GitHub
2. **Assign issues** to appropriate milestones
3. **Set up Project Board** for tracking
4. **Start development** with Issue #1

## Manual Alternative

If you prefer to create issues manually, refer to `../MVP_ISSUES.md` for the complete list with detailed descriptions.
