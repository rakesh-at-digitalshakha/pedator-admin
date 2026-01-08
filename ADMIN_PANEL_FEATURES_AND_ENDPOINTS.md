# Admin Panel - Features & API Endpoints Documentation

## 🎯 Current Features Implemented

### 1. **Admin Management**

- List all admin users
- Create new admin accounts
- Update admin details
- Delete admin accounts
- View admin statistics
- Profile management

### 2. **Mentor Management**

- View all mentors (approved/pending/rejected)
- Approve mentor applications
- Reject mentor applications with reason
- Update mentor profiles
- Delete mentor accounts
- View mentor details

### 3. **Learner Management**

- View all learners
- View learner details
- Update learner profiles
- Delete learner accounts
- Filter and search learners

### 4. **Course Management**

- View all courses
- Approve course submissions
- Reject courses with reason
- Update course details
- Delete courses
- Filter by status (pending/approved/rejected)

### 5. **Booking Management**

- View all session bookings
- Update booking status
- View booking details
- Track booking history

### 6. **Category Management**

- CRUD operations for course categories
- CRUD operations for subcategories
- Hierarchical category structure

### 7. **Reviews & Ratings**

- **Platform Reviews**: Approve/reject app reviews
- **Mentor Reviews**: Monitor mentor ratings with detailed metrics
- View review analytics
- Moderate inappropriate content

### 8. **Video Session Monitoring**

- Track all video sessions
- View session status (scheduled/ongoing/completed/cancelled)
- Access session recordings
- Monitor session participants

### 9. **Financial Management**

- View all transactions
- Track revenue and earnings
- Admin wallet management
- Withdrawal processing
- Transaction filtering and search

### 10. **Notifications**

- View all notifications
- Mark notifications as read
- FCM token management

---

## 🚀 Suggested Additional Features

### **High Priority Features**

#### 1. **Analytics & Reporting Dashboard**

- **Revenue Analytics**
  - Daily/Weekly/Monthly revenue charts
  - Revenue by course category
  - Mentor earnings breakdown
  - Platform commission tracking
  - Payment method distribution
- **User Growth Metrics**
  - New user registrations over time
  - User retention rates
  - Churn analysis
  - Active users (DAU/MAU)
- **Engagement Metrics**
  - Course enrollment rates
  - Session completion rates
  - Average rating trends
  - Popular courses/mentors

#### 2. **Dispute Resolution System**

- View reported issues (learner vs mentor)
- Dispute categorization (payment, quality, behavior)
- Resolution workflow (pending/investigating/resolved)
- Communication thread between parties
- Refund management
- Penalty system

#### 3. **Content Moderation**

- Flag inappropriate course content
- Review flagged mentor profiles
- Moderate chat/messages
- Ban/suspend users
- Content violation history

#### 4. **Promotional & Marketing Tools**

- Create discount codes/coupons
- Flash sales management
- Featured courses section
- Banner/carousel management
- Push notification campaigns
- Email marketing templates

#### 5. **Commission & Payout Management**

- Set platform commission rates (per category/mentor)
- Automated payout schedules
- Payout approval workflow
- Payment gateway integration status
- Failed payment handling

#### 6. **Test Series Management**

- View all test series created by mentors
- Test performance analytics
- Question bank moderation
- Test result statistics

#### 7. **Support Ticket System**

- View all support tickets
- Ticket categorization (technical/billing/general)
- Assign tickets to admin members
- Ticket status tracking
- Response templates

#### 8. **User Activity Logs**

- Track admin actions (audit trail)
- Monitor suspicious activities
- Login history
- IP tracking
- Device information

#### 9. **Platform Settings**

- General settings (platform name, logo, colors)
- Payment gateway configuration
- Email/SMS provider settings
- Feature toggles
- Maintenance mode

#### 10. **Bulk Operations**

- Bulk user import/export
- Bulk email notifications
- Mass approval/rejection
- Bulk category updates

### **Medium Priority Features**

#### 11. **Mentor Performance Dashboard**

- Top-performing mentors
- Average ratings comparison
- Session completion rates
- Earnings leaderboard
- Student satisfaction scores

#### 12. **Refund Management**

- Refund requests list
- Approve/reject refunds
- Partial/full refund options
- Refund analytics

#### 13. **Certification Management**

- Approve mentor certificates/credentials
- Generate course completion certificates
- Certificate templates

#### 14. **Time-based Analytics**

- Peak usage hours
- Best time for courses
- Session booking patterns

#### 15. **Mentor Onboarding Workflow**

- Onboarding checklist tracking
- Document verification status
- Training completion tracking

---

## 📡 Complete API Endpoints List

### **Authentication**

```
POST   /auth/login/admin                    # Admin login
POST   /auth/logout/admin                   # Admin logout (if implemented)
POST   /auth/refresh-token                  # Refresh JWT token
```

### **Admin Management**

```
GET    /admin/admins                        # List all admins (with pagination)
GET    /admin/admins/:id                    # Get admin by ID
POST   /admin/admins                        # Create new admin
PUT    /admin/admins/:id                    # Update admin
DELETE /admin/admins/:id                    # Delete admin
GET    /admin/stats                         # Get dashboard statistics
GET    /admin/profile                       # Get current admin profile
PUT    /admin/profile                       # Update current admin profile
POST   /admin/fcm-token                     # Update FCM token
```

### **Mentor Management**

```
GET    /mentor/all                          # List all mentors (with filters)
GET    /mentor/:id                          # Get mentor by ID
GET    /admin/unapproved-mentors            # Get pending mentor applications
PATCH  /admin/mentors/:mentorId/approve    # Approve mentor
PATCH  /admin/mentors/:mentorId/reject     # Reject mentor with reason
PUT    /mentor/admin/:id                    # Update mentor profile
DELETE /mentor/admin/:id                    # Delete mentor
```

### **Learner Management**

```
GET    /learner/all                         # List all learners (with pagination)
GET    /learner/:id                         # Get learner by ID
PUT    /learner/admin/:id                   # Update learner profile
DELETE /learner/admin/:id                   # Delete learner
```

### **Course Management**

```
GET    /course/all                          # List all courses (with filters)
GET    /course/:id                          # Get course by ID
PATCH  /course/admin/:courseId/approve     # Approve course
PATCH  /course/admin/:courseId/reject      # Reject course with reason
PUT    /course/admin/:id                    # Update course
DELETE /course/admin/:id                    # Delete course
```

### **Booking Management**

```
GET    /course/bookings/all                 # List all bookings (with filters)
GET    /course/bookings/:id                 # Get booking by ID
PATCH  /course/bookings/:id/status          # Update booking status
```

### **Category Management**

```
GET    /course/courseCategory/all           # List all categories
POST   /course/courseCategory/add           # Create category
PUT    /course/courseCategory/update/:id    # Update category
DELETE /course/courseCategory/delete/:id    # Delete category

GET    /course/courseSubCategory/all        # List all subcategories
GET    /course/courseSubCategory/:categoryId # Get subcategories by category
POST   /course/courseSubCategory/add        # Create subcategory
PUT    /course/courseSubCategory/update/:id # Update subcategory
DELETE /course/courseSubCategory/delete/:id # Delete subcategory
```

### **Review Management**

```
# Platform Reviews
GET    /platform-reviews                    # List platform reviews (with filters)
PATCH  /platform-reviews/:id/status         # Update review status (approve/reject)
DELETE /platform-reviews/:id                # Delete platform review

# Course Reviews
GET    /reviews/course/:courseId            # Get course reviews

# Mentor Reviews
GET    /mentor/review                       # List all mentor reviews (with filters)
GET    /mentor/review/mentor/:mentorId      # Get reviews for specific mentor
POST   /mentor/review/:reviewId/reply       # Mentor reply to review
DELETE /mentor/review/:reviewId             # Delete mentor review
```

### **Video Session Management**

```
GET    /video-sessions/all                  # List all video sessions (with filters)
GET    /video-sessions/:sessionId           # Get video session by ID
```

### **Transaction & Financial Management**

```
GET    /admin/transactions                  # List all transactions (with filters)
GET    /admin/transactions/:id              # Get transaction by ID
POST   /admin/withdraw                      # Process admin withdrawal
PATCH  /admin/wallet                        # Update wallet balance
```

### **Payment Management**

```
POST   /payments/payout                     # Process payout
GET    /payments/payout/:payoutId           # Get payout status
```

### **Notification Management**

```
GET    /admin/admin                         # Get admin notifications (with pagination)
PUT    /admin/notifications/:id/read        # Mark notification as read
```

---

## 🔮 Suggested New Endpoints for Additional Features

### **Analytics & Reporting**

```
GET    /admin/analytics/revenue             # Revenue analytics data
GET    /admin/analytics/users               # User growth metrics
GET    /admin/analytics/engagement          # Engagement metrics
GET    /admin/analytics/courses             # Course performance metrics
GET    /admin/reports/generate              # Generate custom reports
POST   /admin/reports/export                # Export reports (CSV/PDF)
```

### **Dispute Management**

```
GET    /admin/disputes                      # List all disputes
GET    /admin/disputes/:id                  # Get dispute details
PATCH  /admin/disputes/:id/status           # Update dispute status
POST   /admin/disputes/:id/resolve          # Resolve dispute with action
POST   /admin/disputes/:id/message          # Add message to dispute thread
POST   /admin/refunds                       # Process refund
```

### **Content Moderation**

```
GET    /admin/flagged-content               # List flagged content
POST   /admin/content/:id/flag              # Flag content for review
POST   /admin/users/:id/suspend             # Suspend user
POST   /admin/users/:id/ban                 # Ban user permanently
DELETE /admin/users/:id/ban                 # Unban user
GET    /admin/moderation-logs               # View moderation history
```

### **Promotional Tools**

```
GET    /admin/coupons                       # List all coupons
POST   /admin/coupons                       # Create coupon
PUT    /admin/coupons/:id                   # Update coupon
DELETE /admin/coupons/:id                   # Delete coupon
GET    /admin/promotions                    # List active promotions
POST   /admin/promotions                    # Create promotion campaign
GET    /admin/banners                       # List banners
POST   /admin/banners                       # Upload banner
PUT    /admin/banners/:id                   # Update banner
DELETE /admin/banners/:id                   # Delete banner
```

### **Commission & Payout**

```
GET    /admin/commission-rates              # Get commission rates
PUT    /admin/commission-rates/:id          # Update commission rate
GET    /admin/payouts/pending               # List pending payouts
POST   /admin/payouts/:id/approve           # Approve payout
POST   /admin/payouts/:id/reject            # Reject payout
GET    /admin/payouts/history               # Payout history
```

### **Support Tickets**

```
GET    /admin/tickets                       # List all tickets
GET    /admin/tickets/:id                   # Get ticket details
PATCH  /admin/tickets/:id/assign            # Assign ticket to admin
PATCH  /admin/tickets/:id/status            # Update ticket status
POST   /admin/tickets/:id/reply             # Reply to ticket
```

### **Activity Logs**

```
GET    /admin/activity-logs                 # View audit trail
GET    /admin/activity-logs/:adminId        # Get specific admin's actions
GET    /admin/login-history                 # Login history
```

### **Platform Settings**

```
GET    /admin/settings                      # Get all platform settings
PUT    /admin/settings                      # Update platform settings
GET    /admin/settings/payment-gateways     # Get payment gateway config
PUT    /admin/settings/payment-gateways     # Update payment gateway config
POST   /admin/settings/maintenance          # Toggle maintenance mode
```

### **Test Series Management**

```
GET    /admin/test-series                   # List all test series
GET    /admin/test-series/:id               # Get test series details
GET    /admin/test-series/:id/results       # Get test results analytics
DELETE /admin/test-series/:id               # Delete test series
```

### **Bulk Operations**

```
POST   /admin/users/bulk-import             # Import users via CSV
GET    /admin/users/bulk-export             # Export users to CSV
POST   /admin/notifications/bulk-send       # Send bulk notifications
POST   /admin/courses/bulk-approve          # Bulk approve courses
POST   /admin/mentors/bulk-approve          # Bulk approve mentors
```

### **Mentor Performance**

```
GET    /admin/mentors/top-performers        # Get top-performing mentors
GET    /admin/mentors/:id/analytics         # Get mentor performance metrics
GET    /admin/mentors/leaderboard           # Mentor leaderboard
```

### **Refund Management**

```
GET    /admin/refunds                       # List refund requests
POST   /admin/refunds/:id/approve           # Approve refund
POST   /admin/refunds/:id/reject            # Reject refund
GET    /admin/refunds/analytics             # Refund analytics
```

### **Certification**

```
GET    /admin/certificates/pending          # Pending certificate verifications
POST   /admin/certificates/:id/verify       # Verify mentor certificate
POST   /admin/certificates/generate         # Generate completion certificate
GET    /admin/certificates/templates        # Get certificate templates
PUT    /admin/certificates/templates/:id    # Update certificate template
```

---

## 📊 Query Parameters & Filters

### Common Pagination Parameters

```
?page=1                   # Page number (default: 1)
?limit=10                 # Items per page (default: 10)
```

### Common Filter Parameters

```
?status=active            # Filter by status
?search=keyword           # Search query
?sortBy=createdAt         # Sort field
?order=desc               # Sort order (asc/desc)
?startDate=2024-01-01     # Date range start
?endDate=2024-12-31       # Date range end
```

### Specific Filters

**Mentors:**

```
?isProfileApproved=true
?isProfileRejected=false
?status=approved|pending|rejected
```

**Courses:**

```
?isCourseApproved=true
?categoryId=xxx
?mentorId=xxx
```

**Bookings:**

```
?status=pending|confirmed|completed|cancelled
?learnerId=xxx
?mentorId=xxx
```

**Transactions:**

```
?type=booking|payout|refund
?status=pending|completed|failed
?userId=xxx
?userModel=learners|mentors
```

**Video Sessions:**

```
?status=scheduled|ongoing|completed|cancelled
?mentorId=xxx
?learnerId=xxx
```

**Reviews:**

```
?status=true|false        # For platform reviews (approved/pending)
?mentorId=xxx             # For mentor reviews
?courseId=xxx
```

---

## 🔐 Authentication & Authorization

### Headers Required

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Role-Based Access

- **Super Admin**: Full access to all endpoints
- **Admin**: Limited access (cannot manage other admins)

---

## 📝 Notes for Backend Developer

### Response Format

All API responses should follow this standard structure:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "currentPage": 1,
    "totalPages": 10,
    "totalCount": 100,
    "limit": 10
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error message"
  }
}
```

### Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

### Important Implementation Notes

1. All list endpoints should support pagination
2. Implement proper input validation
3. Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
4. Implement rate limiting for sensitive operations
5. Log all admin actions for audit trail
6. Implement soft delete where appropriate
7. Use transactions for financial operations
8. Implement webhook notifications for critical events
9. Ensure proper indexing for filter fields
10. Implement caching for frequently accessed data

---

## 🎯 Priority Implementation Order

### Phase 1 (Critical - Already Implemented) ✅

- Admin management
- Mentor approval workflow
- Learner management
- Course approval workflow
- Basic financial tracking

### Phase 2 (High Priority - Suggested)

1. Analytics Dashboard
2. Dispute Resolution System
3. Refund Management
4. Support Tickets
5. Activity Logs

### Phase 3 (Medium Priority)

1. Promotional Tools
2. Content Moderation
3. Commission Management
4. Bulk Operations
5. Mentor Performance Dashboard

### Phase 4 (Nice to Have)

1. Advanced Reporting
2. Test Series Management
3. Certification System
4. Platform Settings UI
5. Email Campaign Tools

---

**Document Version:** 1.0  
**Last Updated:** November 28, 2025  
**Maintained By:** Frontend Development Team
