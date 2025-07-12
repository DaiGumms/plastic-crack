# PowerShell script to create all remaining Plastic Crack MVP issues
# Make sure you have GitHub CLI installed: https://cli.github.com/
# Run: .\create_all_issues.ps1

$REPO = "DaiGumms/plastic-crack"

Write-Host "Creating remaining Plastic Crack MVP issues..." -ForegroundColor Green

# Issue 10: Mobile Authentication Screens
gh issue create `
  --repo $REPO `
  --title "[MOBILE] Authentication flow screens" `
  --body "Create login, registration, and forgot password screens for mobile app.

## Acceptance Criteria
- [ ] Login screen with form validation
- [ ] Registration screen
- [ ] Forgot password screen
- [ ] Form validation with react-hook-form
- [ ] Loading states and error handling
- [ ] Navigation between auth screens

## Dependencies
This issue depends on Issue #8 (React Native Setup) and #5 (Authentication API) being completed first.

## Estimated Time
3-4 days" `
  --label "mobile,auth,ui,priority:high"

Write-Host "✅ Created Issue #10" -ForegroundColor Green

# Issue 11: Mobile Navigation Structure
gh issue create `
  --repo $REPO `
  --title "[MOBILE] Main app navigation and tab structure" `
  --body "Implement the main navigation structure with tab navigation and stack navigation.

## Acceptance Criteria
- [ ] Bottom tab navigation
- [ ] Stack navigation for screens
- [ ] Deep linking support
- [ ] Navigation guards for authentication
- [ ] Custom tab bar design

## Dependencies
This issue depends on Issue #8 (React Native Setup) being completed first.

## Estimated Time
2-3 days" `
  --label "mobile,navigation,ui,priority:high"

Write-Host "✅ Created Issue #11" -ForegroundColor Green

# Issue 12: User Profile Screen (Mobile)
gh issue create `
  --repo $REPO `
  --title "[MOBILE] User profile screen" `
  --body "Create user profile screen with ability to view and edit profile information.

## Acceptance Criteria
- [ ] Profile information display
- [ ] Edit profile form
- [ ] Profile image picker
- [ ] Settings screen
- [ ] Logout functionality

## Dependencies
This issue depends on Issues #10 (Mobile Auth) and #6 (User Profile API) being completed first.

## Estimated Time
3-4 days" `
  --label "mobile,user,ui,priority:medium"

Write-Host "✅ Created Issue #12" -ForegroundColor Green

# Issue 13: Web Authentication Pages
gh issue create `
  --repo $REPO `
  --title "[WEB] Authentication pages and forms" `
  --body "Create authentication pages for web application including login and registration.

## Acceptance Criteria
- [ ] Login page with form validation
- [ ] Registration page
- [ ] Forgot password page
- [ ] Form validation with react-hook-form
- [ ] Responsive design
- [ ] Loading states and error handling

## Dependencies
This issue depends on Issue #9 (React Web Setup) and #5 (Authentication API) being completed first.

## Estimated Time
3-4 days" `
  --label "frontend,auth,ui,priority:high"

Write-Host "✅ Created Issue #13" -ForegroundColor Green

# Issue 14: Web Navigation and Layout
gh issue create `
  --repo $REPO `
  --title "[WEB] Main layout and navigation components" `
  --body "Create the main layout components and navigation for the web application.

## Acceptance Criteria
- [ ] Header component with navigation
- [ ] Sidebar navigation
- [ ] Responsive layout
- [ ] Mobile-friendly hamburger menu
- [ ] User dropdown menu
- [ ] Breadcrumb navigation

## Dependencies
This issue depends on Issue #9 (React Web Setup) being completed first.

## Estimated Time
3-4 days" `
  --label "frontend,navigation,ui,priority:high"

Write-Host "✅ Created Issue #14" -ForegroundColor Green

# Issue 15: User Dashboard (Web)
gh issue create `
  --repo $REPO `
  --title "[WEB] User dashboard and profile pages" `
  --body "Create user dashboard and profile management pages for web application.

## Acceptance Criteria
- [ ] Dashboard overview page
- [ ] Profile settings page
- [ ] Account settings
- [ ] Activity feed
- [ ] Statistics and insights

## Dependencies
This issue depends on Issues #13 (Web Auth) and #6 (User Profile API) being completed first.

## Estimated Time
4-5 days" `
  --label "frontend,user,ui,priority:medium"

Write-Host "✅ Created Issue #15" -ForegroundColor Green

# Issue 16: Collection Data Models
gh issue create `
  --repo $REPO `
  --title "[DATABASE] Collection and model data schemas" `
  --body "Define database schemas for collections, models, and related entities.

## Acceptance Criteria
- [ ] User model with relationships
- [ ] Collection model
- [ ] Model/Miniature entity
- [ ] Army/Faction categorization
- [ ] Painting status tracking
- [ ] Image metadata
- [ ] Tagging system

## Dependencies
This issue depends on Issue #3 (Database Setup) being completed first.

## Estimated Time
3-4 days" `
  --label "database,backend,models,priority:high"

Write-Host "✅ Created Issue #16" -ForegroundColor Green

# Issue 17: Collection API Endpoints
gh issue create `
  --repo $REPO `
  --title "[BACKEND] Collection CRUD API endpoints" `
  --body "Create RESTful API endpoints for collection management operations.

## Acceptance Criteria
- [ ] Create collection endpoint
- [ ] Get collections endpoint (with pagination)
- [ ] Update collection endpoint
- [ ] Delete collection endpoint
- [ ] Add model to collection endpoint
- [ ] Remove model from collection endpoint
- [ ] Search and filter endpoints

## Dependencies
This issue depends on Issues #16 (Collection Models) and #7 (Authorization) being completed first.

## Estimated Time
4-5 days" `
  --label "backend,api,collections,priority:high"

Write-Host "✅ Created Issue #17" -ForegroundColor Green

# Issue 18: Model Management API
gh issue create `
  --repo $REPO `
  --title "[BACKEND] Model/Miniature management API" `
  --body "Create API endpoints for individual model/miniature management within collections.

## Acceptance Criteria
- [ ] Add model endpoint
- [ ] Update model details endpoint
- [ ] Update painting status endpoint
- [ ] Add model photos endpoint
- [ ] Get model details endpoint
- [ ] Bulk operations endpoint

## Dependencies
This issue depends on Issue #17 (Collection API) being completed first.

## Estimated Time
3-4 days" `
  --label "backend,api,models,priority:high"

Write-Host "✅ Created Issue #18" -ForegroundColor Green

# Issue 19: Collection Screen (Mobile)
gh issue create `
  --repo $REPO `
  --title "[MOBILE] Collection management screens" `
  --body "Create mobile screens for viewing and managing collections.

## Acceptance Criteria
- [ ] Collections list screen
- [ ] Collection detail screen
- [ ] Add collection form
- [ ] Edit collection form
- [ ] Collection sharing options

## Dependencies
This issue depends on Issues #11 (Mobile Navigation) and #17 (Collection API) being completed first.

## Estimated Time
4-5 days" `
  --label "mobile,collections,ui,priority:high"

Write-Host "✅ Created Issue #19" -ForegroundColor Green

# Issue 20: Model Management Screen (Mobile)
gh issue create `
  --repo $REPO `
  --title "[MOBILE] Model/miniature management screens" `
  --body "Create mobile screens for managing individual models within collections.

## Acceptance Criteria
- [ ] Model list view
- [ ] Model detail screen
- [ ] Add model form
- [ ] Edit model details
- [ ] Photo management
- [ ] Painting status updates

## Dependencies
This issue depends on Issues #19 (Collection Screens) and #18 (Model API) being completed first.

## Estimated Time
4-5 days" `
  --label "mobile,models,ui,priority:high"

Write-Host "✅ Created Issue #20" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Successfully created Issues #10-20!" -ForegroundColor Green
Write-Host "📊 Progress: 20/43 issues created" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Next: Run create_remaining_part2.ps1 to create Issues #21-43" -ForegroundColor Cyan
