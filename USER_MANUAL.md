# Ramaiah Capital Ticket Management System
## User Manual

---

# Table of Contents
1. [System Overview](#system-overview)
2. [Getting Started](#getting-started)
3. [Admin User Guide](#admin-user-guide)
4. [Branch User Guide](#branch-user-guide)
5. [Cluster Admin Guide](#cluster-admin-guide)
6. [Ticket Workflow](#ticket-workflow)
7. [Stationary Ordering](#stationary-ordering)
8. [Troubleshooting](#troubleshooting)

---

# System Overview

The Ramaiah Capital Ticket Management System is a web-based platform for managing support tickets and stationary orders across multiple branches. The system supports three user roles:

| Role | Description |
|------|-------------|
| **Admin** | Head office staff with full system access |
| **Branch** | Branch staff who create tickets and place stationary orders |
| **Cluster** | Regional supervisors who approve stationary orders before they reach admin |

## Key Features
- Ticket creation, tracking, and resolution
- Real-time commenting and notifications
- Stationary ordering with approval workflow
- Branch and cluster management
- Reports and analytics
- Audit logging

---

# Getting Started

## Accessing the System
1. Open your web browser (Chrome, Firefox, Edge recommended)
2. Navigate to the system URL provided by your administrator
3. Enter your email and password
4. Click **Login**

## First-Time Login
- Your initial password was set by your administrator
- You may be prompted to change your password on first login
- Contact your administrator if you have login issues

## Navigation
The sidebar on the left provides access to all features available to your role:
- **Admin**: Dashboard, Tickets, Users, Audit Log, Reports, Settings
- **Branch**: Dashboard, My Tickets, Create Ticket, Stationary
- **Cluster**: Dashboard, Orders

## Logging Out
1. Click your name in the bottom-left corner of the sidebar
2. Click **Sign Out**
3. Confirm the logout

---

# Admin User Guide

## Dashboard
**Route**: `/`

The admin dashboard provides a system-wide overview:

### Stat Cards
- **Total Tickets**: All tickets in the system
- **Total Branches**: Number of registered branches
- **Active Branches**: Branches with recent activity

### Charts
- **Status Distribution**: Pie chart showing ticket distribution by status
- **Stationary Budget**: Bar chart showing spending by branch
- **Branch Performance**: Bar chart showing ticket volume by branch

### Recent Tickets
- Table of the 5 most recent tickets
- Click any ticket to view details
- Click **View All** to see the complete ticket list

### Quick Actions
- **Manage Users**: Navigate to branch user management
- **Reports**: Access the reports page

---

## Ticket Management

### Viewing All Tickets
**Route**: `/tickets`

| Feature | Description |
|---------|-------------|
| **Search** | Search by ticket number, subject, or description |
| **Filter by Status** | Filter tickets by their current status |
| **Filter by Branch** | Filter tickets from specific branches |
| **Filter by Date Range** | Filter tickets created within a date range |
| **Sort** | Click column headers to sort |
| **Export to Excel** | Export filtered tickets to spreadsheet |

### Ticket List Columns
- Ticket Number (click to view)
- Subject
- Branch name
- Status (color-coded badge)
- Assigned To
- Created Date

### Viewing Ticket Details
**Route**: `/tickets/:id`

#### Header
- Ticket number and subject
- Status badge
- **Change Status** button (admin only)

#### Conversation Tab
- Chat-style comment thread
- Your messages appear on the left (gray)
- Branch messages appear on the right (red)
- Type your message and press Enter or click Send
- Comments notify all relevant users

#### Timeline History Tab
- Chronological audit trail of all events
- Status changes, comments, assignments
- Shows who did what and when

#### Sidebar Information
- **Status**: Current ticket status
- **Branch**: Which branch created the ticket
- **Role**: Branch role (IT, Branch Admin, Manager)
- **Created By**: Contact person
- **Assigned To**: Currently assigned admin
- **Created/Updated**: Timestamps

#### Additional Details
- Custom fields specific to the branch role
- Ticket description
- Attachments (click to view, download to save)

### Creating a Ticket (Admin)
**Route**: `/tickets/new`

1. Enter a descriptive subject (minimum 5 characters)
2. Provide a detailed description (minimum 20 characters)
3. Fill in any custom fields required for the branch role
4. Optionally attach images (max 2MB each, auto-compressed)
5. Review the ticket preview on the right
6. Click **Submit Ticket**

### Changing Ticket Status
1. Open the ticket detail page
2. Click **Change Status** button
3. Select the new status from the dropdown
4. The change is recorded in the timeline

### Assigning Tickets
1. Open the ticket detail page
2. Click the assign button
3. Select an admin from the list
4. Assignment is recorded in the timeline

---

## Branch User Management
**Route**: `/users`

### Viewing Branch Users
- List of all branch users with their details
- Search by name or email
- Filter by branch or role

### Creating a Branch User
1. Click **Add User**
2. Fill in:
   - Name
   - Email address
   - Branch selection
   - Role (IT, Branch Admin, Manager)
3. Click **Create User**
4. A temporary password is auto-generated and displayed

### Editing a Branch User
1. Find the user in the list
2. Click the edit icon
3. Modify details as needed
4. Click **Save Changes**

### Deleting a Branch User
1. Find the user in the list
2. Click the delete icon
3. Confirm the deletion

---

## Cluster Management
**Route**: `/clusters`

### Tab 1: Clusters
Manage cluster groups:

#### Creating a Cluster
1. Click **Add Cluster**
2. Enter cluster name (e.g., "North Region")
3. Enter cluster code (e.g., "NORTH")
4. Click **Save**

#### Editing a Cluster
1. Click the edit icon on the cluster row
2. Modify name or code
3. Click **Save**

#### Deleting a Cluster
1. Click the delete icon
2. Confirm the deletion

### Tab 2: Cluster Users
Manage users assigned to clusters:

#### Creating a Cluster User
1. Click **Add User**
2. Select the cluster from the dropdown
3. Enter the user's name
4. Enter the user's email
5. A temporary password is auto-generated
6. Click **Create User**

#### Editing a Cluster User
1. Click the edit icon
2. Modify name or cluster assignment
3. Click **Save**

#### Deleting a Cluster User
1. Click the delete icon
2. Confirm the deletion

### Tab 3: Branch Assignments
Assign branches to clusters:

#### Assigning a Branch to a Cluster
1. Select a cluster from the dropdown
2. Select a branch from the dropdown
3. Click **Assign Branch**

#### Removing a Branch from a Cluster
1. Find the assignment in the list
2. Click the remove icon
3. Confirm the removal

---

## Stationary Admin
**Route**: `/stationary/admin`

### Managing Stationary Items
- View all stationary items
- Add new items with name, price, and threshold
- Edit existing items
- Enable/disable items

### Managing Order Windows
- Set ordering window start and end dates
- Configure allowed branch roles
- Enable/disable the stationary portal

### Viewing Orders
- List of all stationary orders
- Filter by status (pending, approved, fulfilled, cancelled)
- View order details
- Approve/reject cluster-approved orders
- Mark orders as fulfilled or cancelled

---

## Ticket Settings
**Route**: `/settings`

### System Settings
- **Live Chat**: Enable/disable real-time commenting
- **Ticket Portal**: Enable/disable ticket creation for branches
- **Stationary Portal**: Enable/disable stationary ordering

### Status Management
**Route**: `/statuses`

#### Creating a Status
1. Click **Add Status**
2. Enter status name (e.g., "In Progress")
3. Select a color
4. Click **Save**

#### Editing a Status
1. Click the edit icon
2. Modify name or color
3. Click **Save**

#### Reordering Statuses
1. Drag and drop statuses to reorder
2. The new order is saved automatically

### Ticket Form Configuration
**Route**: `/ticket-form-config`

Configure custom fields for each branch role:

#### Adding a Custom Field
1. Select the branch role (IT, Branch Admin, Manager)
2. Click **Add Field**
3. Configure:
   - Field label
   - Field type (text, textarea, select, radio, checkbox)
   - Options (for select/radio/checkbox)
   - Required toggle
4. Click **Save**

#### Reordering Fields
1. Drag and drop fields to reorder
2. The new order is saved automatically

---

## Reports
**Route**: `/reports`

### Available Reports
- **Ticket Volume**: Tickets per branch over time
- **Resolution Time**: Average time to resolve tickets
- **Stationary Spending**: Budget usage by branch
- **Status Distribution**: Tickets by status

### Generating a Report
1. Select the report type
2. Set date range
3. Click **Generate Report**
4. Export to PDF or Excel if needed

---

## Audit Log
**Route**: `/audit-log`

### Viewing Audit Trail
- Chronological list of all system actions
- Filter by user, action type, or date
- View details of each action

### Exporting Audit Data
1. Set filters as needed
2. Click **Export**
3. Choose format (PDF, Excel)
4. Download the file

---

# Branch User Guide

## Dashboard
**Route**: `/`

### Welcome Banner
- Personalized greeting with your branch name
- Quick summary of your ticket activity
- **Create Ticket** button for quick access

### Stat Cards
- **Total Tickets**: Your branch's total tickets
- **Open Tickets**: Tickets awaiting resolution
- **In Progress**: Tickets being worked on
- **Solved**: Resolved tickets

### Charts
- **Ticket Status Breakdown**: Pie chart of your ticket statuses
- **Recent Activity**: Timeline of recent events on your tickets
- **My Recent Tickets**: Table of your 5 most recent tickets

---

## Creating Tickets
**Route**: `/tickets/new`

### Step-by-Step Process

1. **Check Portal Status**
   - If the ticket portal is disabled, you'll see a message
   - Contact your administrator if you need to create tickets

2. **Enter Ticket Details**
   - **Subject**: Brief description (minimum 5 characters)
   - **Description**: Detailed explanation (minimum 20 characters)

3. **Fill Custom Fields**
   - Complete any additional fields specific to your branch role
   - Fields marked with * are required

4. **Attach Files** (Optional)
   - Click **Choose Files** or drag and drop
   - Supported: Images (JPG, PNG, GIF)
   - Maximum size: 2MB per file (auto-compressed)
   - Preview your attachments below the upload area

5. **Review and Submit**
   - Check the **Ticket Preview** sidebar
   - Read the **Tips for Faster Resolution**
   - Click **Submit Ticket**

### Tips for Better Tickets
- Be specific about the issue
- Include account numbers if relevant
- Attach screenshots of error messages
- Describe steps to reproduce the problem

---

## Viewing Your Tickets
**Route**: `/tickets`

### Ticket List Features
- **Search**: Find tickets by number or subject
- **Filter by Status**: Show only Open, In Progress, or Solved tickets
- **Filter by Date**: Show tickets from a specific time period
- **Load More**: Progressive loading (10 tickets at a time)

### Ticket List Columns
- Ticket Number (click to view)
- Subject
- Status (color-coded)
- Created Date
- Actions (view button)

---

## Ticket Detail View
**Route**: `/tickets/:id`

### Header
- Ticket number and subject
- Status badge (color-coded)

### Conversation Tab
- View all comments on the ticket
- Your messages appear on the right (red)
- Admin messages appear on the left (gray)

### Adding a Comment
1. Type your message in the text area
2. Press Enter or click Send
3. Your comment is added to the conversation
4. Admins are notified

### Timeline History Tab
- View all events on your ticket
- Status changes, comments, assignments
- See who did what and when

### Sidebar Information
- **Status**: Current ticket status
- **Branch**: Your branch name
- **Role**: Your branch role (IT, Branch Admin, Manager)
- **Created By**: Who created the ticket
- **Assigned To**: Admin handling the ticket
- **Created/Updated**: Timestamps

### Custom Fields
- View additional details specific to your branch role
- Displayed in the **Additional Details** section

### Attachments
- View all attached files
- Click to preview images
- Download files using the download icon
- Use lightbox for full-screen viewing

### Limitations for Branch Users
- **Cannot change ticket status** (admin only)
- **Cannot assign tickets** (admin only)
- **Cannot delete tickets** (admin only)
- **Cannot see internal admin notes**

---

## Notifications
### Viewing Notifications
- Click the bell icon in the header
- See all your notifications
- Filter by unread only

### Managing Notifications
- Click a notification to mark as read
- Click **Mark All as Read** to clear all
- Delete individual notifications

### Notification Types
- Admin commented on your ticket
- Your ticket status changed
- Your ticket was assigned
- Stationary order status updated

---

## Stationary Ordering
**Route**: `/stationary`

### Before You Order
1. Check if the ordering window is open
2. Review available items and their thresholds
3. See your remaining quota for each item

### Placing an Order

1. **Select Items**
   - Use +/- buttons or type quantity
   - Cannot exceed threshold per item
   - See real-time total in cart

2. **Review Order**
   - Check items and quantities in the cart sidebar
   - Verify total cost
   - Note: Only one order per branch per window

3. **Confirm Order**
   - Click **Place Order**
   - Review the confirmation modal
   - Click **Confirm** to submit

4. **Order Submitted**
   - Success message appears
   - Order shows in **My Orders** with "Pending" status
   - Cluster admin reviews (if applicable)
   - Admin fulfills the order

### Viewing Order History
- Scroll to **My Orders** section
- See all past orders with:
  - Order date
  - Status (Pending/Approved/Fulfilled/Cancelled)
  - Items ordered
  - Total cost

---

# Cluster Admin Guide

## Dashboard
**Route**: `/`

### Welcome Banner
- Personalized greeting
- Summary of your cluster's activity
- Warning if you don't have a cluster assigned

### Stat Cards
- **Pending Orders**: Orders awaiting your approval
- **Approved Orders**: Orders you've approved
- **Total Orders**: All orders in your cluster

---

## Managing Stationary Orders
**Route**: `/cluster/orders`

### Viewing Orders
- List of all orders from branches in your cluster
- Filter by status (Pending, Approved, Fulfilled, Cancelled)
- Search by branch name or order date

### Order List Columns
- Order Date
- Branch Name
- Items Ordered
- Total Cost
- Status (color-coded)
- Actions (View, Edit, Approve, Reject)

### Approving an Order
1. Find the order in the list
2. Click **View** to review details
3. Check items and quantities
4. Click **Approve Order**
5. Order moves to admin for fulfillment

### Rejecting an Order
1. Find the order in the list
2. Click **View** to review details
3. Click **Reject Order**
4. Enter a reason for rejection (optional)
5. Order is marked as rejected

### Editing an Order
1. Find the order in the list
2. Click **Edit**
3. Modify quantities as needed
4. Click **Save Changes**
5. Review and approve the modified order

---

## Workflow: Stationary Orders

### Complete Order Flow
```
Branch Places Order
        ↓
Cluster Admin Reviews
        ↓
    ┌─────────────┐
    │  Approve    │
    └─────────────┘
        ↓
Admin Fulfills Order
        ↓
Order Complete
```

### Statuses
| Status | Description |
|--------|-------------|
| **Pending** | Awaiting cluster approval |
| **Approved** | Approved by cluster, awaiting admin fulfillment |
| **Fulfilled** | Order completed by admin |
| **Cancelled** | Order cancelled by admin |

---

## Limitations for Cluster Users
- **Cannot create tickets** (branch only)
- **Cannot manage users** (admin only)
- **Cannot access settings** (admin only)
- **Cannot fulfill orders** (admin only)
- **Can only see orders from their cluster**
- **Can edit order quantities before approval**

---

# Ticket Workflow

## Ticket Lifecycle

### 1. Ticket Creation
- Branch user creates a ticket
- System assigns ticket number
- Ticket status set to default (e.g., "New")
- Admins receive notification

### 2. Assignment
- Admin assigns ticket to themselves or another admin
- Assignment recorded in timeline
- Assigned admin notified

### 3. Processing
- Admin adds comments for clarification
- Branch user responds with additional information
- Status updated as work progresses

### 4. Resolution
- Admin changes status to "Resolved" or "Closed"
- Branch user notified
- Ticket archived

## Ticket Statuses
Default statuses (can be customized):
- **New**: Just created
- **Open**: Under review
- **In Progress**: Being worked on
- **Waiting for Info**: Needs more details
- **Resolved**: Issue fixed
- **Closed**: No longer active

---

# Stationary Ordering

## Understanding the System

### Ordering Windows
- Fixed time periods when branches can place orders
- Set by administrator
- Branches can only order during open windows

### Thresholds
- Maximum quantity per item per branch per window
- Prevents over-ordering
- Managed by administrator

### Approval Workflow
1. **Branch Places Order**: Selects items and quantities
2. **Cluster Reviews** (if applicable): Approves, rejects, or edits
3. **Admin Fulfills**: Processes and ships the order

## Stationary Items
- **Name**: Item description
- **Price**: Cost per unit
- **Threshold**: Max quantity per branch per window
- **Available**: Current stock level

---

# Troubleshooting

## Common Issues

### Cannot Login
- Verify email and password are correct
- Check if Caps Lock is on
- Contact administrator if account is locked

### Cannot Create Ticket
- Check if ticket portal is enabled (Settings)
- Verify your branch role has access
- Ensure all required fields are filled

### Cannot Place Stationary Order
- Check if stationary portal is enabled
- Verify ordering window is open
- Ensure you haven't already ordered in this window
- Check item thresholds

### Missing Notifications
- Check browser notification settings
- Refresh the page
- Clear browser cache

### Slow Performance
- Check internet connection
- Close unnecessary browser tabs
- Clear browser cache

---

## Getting Help

### Contact Support
- Email: [Your Support Email]
- Phone: [Your Support Phone]
- Hours: [Business Hours]

### Information to Provide
- Your name and email
- Branch name
- Screenshot of the issue
- Steps to reproduce
- Error message (if any)

---

# Appendix

## Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| Enter | Send comment |
| Shift+Enter | New line in comment |
| Escape | Close modal |

## Browser Requirements
- Chrome 90+ (recommended)
- Firefox 88+
- Edge 90+
- Safari 14+

## Data Privacy
- All data is encrypted in transit
- Access is role-based
- Audit logs track all actions
- Sensitive data is protected

---

*Last Updated: [Date]*
*Version: 1.0*
