# GitHub Repository Setup Guide

This guide will walk you through creating the GitHub repository and setting up all the issues for the Plastic Crack MVP.

## Step 1: Create GitHub Repository

1. **Go to GitHub** and sign in to your account
2. **Click "New repository"** or go to https://github.com/new
3. **Repository settings:**
   - Repository name: `plastic-crack`
   - Description: `Cross-platform miniature wargaming collection management app with AI-powered features and social community`
   - Visibility: Public (or Private if you prefer)
   - ✅ Initialize with README (uncheck this - we already have one)
   - ✅ Add .gitignore: None (we already have one)
   - ✅ Choose a license: MIT License (recommended)

4. **Click "Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these in your terminal:

```bash
cd "c:\Users\DavidMorgan-_ikyj\Documents\Plastic Crack"
git remote add origin https://github.com/DaiGumms/plastic-crack.git
git branch -M main
git push -u origin main
```

## Step 3: Set Up Repository Labels

Create these labels in your repository (Settings → Labels):

### Priority Labels
- `priority:high` - #d93f0b (red)
- `priority:medium` - #fbca04 (yellow) 
- `priority:low` - #0e8a16 (green)

### Type Labels
- `epic` - #7057ff (purple)
- `backend` - #1d76db (blue)
- `frontend` - #1d76db (blue)
- `mobile` - #1d76db (blue)
- `database` - #006b75 (teal)
- `api` - #0052cc (dark blue)
- `ui` - #e99695 (light red)
- `auth` - #f9d0c4 (light orange)
- `testing` - #c2e0c6 (light green)
- `devops` - #5319e7 (dark purple)
- `documentation` - #0075ca (blue)
- `security` - #b60205 (dark red)
- `performance` - #fbca04 (yellow)
- `setup` - #d4c5f9 (light purple)

### Status Labels
- `good-first-issue` - #7057ff (purple)
- `help-wanted` - #008672 (teal)
- `enhancement` - #a2eeef (light blue)
- `bug` - #d73a4a (red)

## Step 4: Create GitHub Issues

Now you'll create all 43 issues from the `MVP_ISSUES.md` file. Here's how to create them efficiently:

### Batch Issue Creation Process

1. **Open your repository** on GitHub
2. **Go to Issues tab** and click "New issue"
3. **For each issue in MVP_ISSUES.md:**
   
   **Copy the content structure like this:**

   **Title:** `[EPIC] Project Setup and Development Infrastructure`
   
   **Labels:** Add the appropriate labels (epic, infrastructure, setup, priority:high)
   
   **Description:** Copy the full description from MVP_ISSUES.md including:
   - Description
   - Tasks/Acceptance Criteria
   - Dependencies (if any)

### Example: First Issue

**Title:** `[EPIC] Project Setup and Development Infrastructure`

**Labels:** `epic`, `setup`, `infrastructure`, `priority:high`

**Description:**
```
Set up the foundational infrastructure for the Plastic Crack application including monorepo structure, CI/CD, and development environment.

## Tasks
- [ ] Create monorepo structure with workspaces
- [ ] Set up TypeScript configuration
- [ ] Configure ESLint and Prettier
- [ ] Set up GitHub Actions CI/CD pipeline
- [ ] Configure Docker containers for development
- [ ] Set up environment variable management

## Definition of Done
- [ ] All tasks completed
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Tests passing
```

## Step 5: Create Issues in Order

Create the issues in this order for best workflow:

### Phase 1 - Foundation (Issues 1-7)
1. [EPIC] Project Setup and Development Infrastructure
2. [BACKEND] Set up Express.js API with TypeScript  
3. [DATABASE] PostgreSQL setup with Prisma ORM
4. [CACHE] Redis integration for caching and sessions
5. [AUTH] JWT-based authentication system
6. [USER] User profile CRUD operations
7. [AUTH] Role-based authorization middleware

### Phase 2 - Core Features (Issues 8-22)
Continue with mobile app setup, web app setup, and collection management features...

### Phase 3 - Enhanced Features (Issues 23-32)
Image management, search, and price tracking features...

### Phase 4 - Quality & Launch (Issues 33-43)
Testing, optimization, and launch preparation...

## Step 6: Set Up Milestones

Create these milestones in GitHub (Issues → Milestones):

1. **Phase 1: Foundation** (Due: 2 weeks from start)
   - Description: "Basic infrastructure, authentication, and project setup"
   - Issues: #1-7

2. **Phase 2: Core Features** (Due: 6 weeks from start)
   - Description: "Mobile and web applications with collection management"
   - Issues: #8-22

3. **Phase 3: Enhanced Features** (Due: 8 weeks from start)
   - Description: "Image management, search, and price tracking"
   - Issues: #23-32

4. **Phase 4: Launch Preparation** (Due: 10 weeks from start)
   - Description: "Testing, optimization, and MVP launch"
   - Issues: #33-43

## Step 7: Assign Issues to Milestones

After creating all issues, go back and assign each issue to its appropriate milestone.

## Step 8: Set Up Project Board (Optional)

1. **Go to Projects tab** in your repository
2. **Create new project** (use the new Projects beta)
3. **Add columns:**
   - Backlog
   - Todo
   - In Progress
   - In Review
   - Done

4. **Add all issues** to the Backlog column

## Step 9: Configure Repository Settings

### Branch Protection
1. Go to Settings → Branches
2. Add branch protection rule for `main`:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Restrict pushes to matching branches

### Security Settings
1. Go to Settings → Security & analysis
2. Enable:
   - ✅ Dependency graph
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates

## Step 10: Update Package.json

Update the repository URLs in your `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/DaiGumms/plastic-crack.git"
  },
  "bugs": {
    "url": "https://github.com/DaiGumms/plastic-crack/issues"
  },
  "homepage": "https://github.com/DaiGumms/plastic-crack#readme"
}
```

Then commit and push the changes:

```bash
git add package.json
git commit -m "Update repository URLs in package.json"
git push origin main
```

## Step 11: Invite Collaborators (Optional)

If you're working with a team:
1. Go to Settings → Collaborators
2. Add team members with appropriate permissions

## Automation Tips

### Using GitHub CLI (Optional)
If you have GitHub CLI installed, you can create issues faster:

```bash
# Install GitHub CLI first: https://cli.github.com/

# Create an issue
gh issue create --title "[EPIC] Project Setup" --body-file issue-template.md --label "epic,setup"
```

### Issue Templates
The issue templates in `.github/ISSUE_TEMPLATE/` will automatically show up when creating new issues, making it easier for contributors to report bugs or request features.

## Next Steps

1. ✅ Create the GitHub repository
2. ✅ Push your local code
3. ✅ Set up labels and milestones  
4. ✅ Create all 43 issues
5. ✅ Set up project board
6. ✅ Configure repository settings
7. 🚀 Start development with Issue #1!

## Getting Help

If you encounter any issues during setup:
- Check GitHub's documentation: https://docs.github.com/
- Reach out to the community
- Create a discussion in your repository

Happy coding! 🎯
