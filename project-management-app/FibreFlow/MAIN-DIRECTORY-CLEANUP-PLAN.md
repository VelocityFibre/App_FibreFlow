# FibreFlow_Backup Directory Cleanup Plan

## 🚨 Current Problem
The main `/FibreFlow_Backup/` directory is cluttered with 40+ files that should be organized:
- Database migration scripts (.sql files)
- Development test files (.js files)
- Configuration files
- Documentation files
- Legacy files

## 📋 File Analysis

### **Database Scripts (12 files)**
```
alter-customers-table.sql
check-customers-table.sql
create-customer-table.sql
create-customers-table.sql
create-new-projects.sql
fix-customers-insert.sql
fix-customers-table.sql
remove-duplicate-projects.sql
update-customer-add-projects.sql
update-customers.js
users_rows.sql
```

### **Development/Test Scripts (15 files)**
```
add-customer-columns.js
add-customer.js
airtable-to-supabase.js
alternative-connection-test.js
check-schema.js
check-tables.js
comprehensive-test.js
create-table-example.js
direct-connection-test.js
direct-test.js
import-all-tables.js
import-data.js
import-enhanced.js
import-json-to-supabase.js
list-tables.js
manage-tasks-table.js
rest-api-test.js
session-pooler-params.js
session-pooler-ssl-test.js
session-pooler-test.js
simple-supabase-client.js
simple-test.js
supabase-client-test.js
supabase-client.js
supabase-js-test.js
test-all-connections.js
test-connection.js
transaction-pooler-test.js
enhanced-supabase-client.js
```

### **Configuration Files (3 files)**
```
config.js
db.js
package.json / package-lock.json
```

### **Documentation Files (4 files)**
```
FiberFlow-Project-Plan.md
README.md
plan.md
supabase-connection-info.md
```

### **Legacy/Backup Folders**
```
backup_docs/ (contains old files)
FunctionsToAdd/ (contains PowerBi.txt)
```

## 🏗️ Proposed New Structure

```
FibreFlow_Backup/
├── project-management-app/          # Main application (already organized)
├── development-scripts/             # All dev/test scripts
│   ├── database/
│   │   ├── migrations/              # SQL migration files
│   │   ├── test-connections/        # Connection test scripts
│   │   ├── import-scripts/          # Data import scripts
│   │   └── utilities/               # DB utility scripts
│   ├── supabase-clients/           # Various client implementations
│   └── tests/                      # Development test files
├── docs/                           # Project-level documentation
│   ├── FiberFlow-Project-Plan.md
│   ├── plan.md
│   ├── supabase-connection-info.md
│   └── PowerBi.txt                 # From FunctionsToAdd
├── config/                         # Configuration files
│   ├── config.js
│   └── db.js
├── archive/                        # Legacy/backup files
│   └── backup_docs/
└── README.md                       # Main project README
```

## 🔄 Migration Commands

### Step 1: Create Directory Structure
```bash
cd /home/ldp/louisdup/Clients/VelocityFibre/App/FibreFlow_Backup
mkdir -p development-scripts/database/migrations
mkdir -p development-scripts/database/test-connections
mkdir -p development-scripts/database/import-scripts
mkdir -p development-scripts/database/utilities
mkdir -p development-scripts/supabase-clients
mkdir -p development-scripts/tests
mkdir -p docs
mkdir -p config
mkdir -p archive
```

### Step 2: Move Database Scripts
```bash
# Migration files
mv *customers*.sql development-scripts/database/migrations/
mv create-new-projects.sql development-scripts/database/migrations/
mv remove-duplicate-projects.sql development-scripts/database/migrations/
mv users_rows.sql development-scripts/database/migrations/

# Connection tests
mv *connection*.js development-scripts/database/test-connections/
mv *pooler*.js development-scripts/database/test-connections/
mv session-pooler-params.js development-scripts/database/test-connections/

# Import scripts
mv airtable-to-supabase.js development-scripts/database/import-scripts/
mv import-*.js development-scripts/database/import-scripts/
mv add-customer*.js development-scripts/database/import-scripts/

# Utilities
mv check-*.js development-scripts/database/utilities/
mv list-tables.js development-scripts/database/utilities/
mv manage-tasks-table.js development-scripts/database/utilities/
```

### Step 3: Move Client Scripts
```bash
mv *supabase-client*.js development-scripts/supabase-clients/
mv enhanced-supabase-client.js development-scripts/supabase-clients/
mv simple-supabase-client.js development-scripts/supabase-clients/
```

### Step 4: Move Test Scripts
```bash
mv *test*.js development-scripts/tests/
mv comprehensive-test.js development-scripts/tests/
```

### Step 5: Move Documentation
```bash
mv FiberFlow-Project-Plan.md docs/
mv plan.md docs/
mv supabase-connection-info.md docs/
mv FunctionsToAdd/PowerBi.txt docs/
rmdir FunctionsToAdd
```

### Step 6: Move Configuration
```bash
mv config.js config/
mv db.js config/
```

### Step 7: Archive Legacy Files
```bash
mv backup_docs archive/
```

## ✅ Benefits

1. **Clean Main Directory** - Only essential folders remain
2. **Logical Organization** - Scripts grouped by purpose
3. **Easy Navigation** - Clear folder structure
4. **Maintainability** - No more scattered files
5. **Development Efficiency** - Know where to find everything

## 🎯 Final Result

```
FibreFlow_Backup/
├── project-management-app/     # Main app (clean & organized)
├── development-scripts/        # All dev tools organized
├── docs/                      # All documentation
├── config/                    # Configuration files
├── archive/                   # Old/backup files
└── README.md                  # Main project overview
```

This transforms the chaotic directory into a professional, maintainable structure!