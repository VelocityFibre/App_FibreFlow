const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY
);

const EXPORT_DIR = '/home/ldp/louisdup/Clients/VelocityFibre/Agents/Airtable/airtableToNeon/exports/Velocity_Fibre_Management/2025-05-26/';
const CHUNK_SIZE = 20;

// Table configurations with field mappings
const TABLE_CONFIGS = {
  'Staff_2025-05-26': {
    tableName: 'staff', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', name: 'fields.Name', role: 'fields.Role', phone_number: 'fields.Phone Number', email: 'fields.Email', photo: 'fields.Photo[0]', total_assigned_projects: 'fields.Total Assigned Projects', current_projects: 'fields.Current Projects', tasks_assigned: 'fields.Tasks (Assigned To)'
    }
  },
  'Projects_2025-05-26': {
    tableName: 'projects', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', project_name: 'fields.Project Name', region: 'fields.Region', status: 'fields.Status', start_date: 'fields.Start Date', end_date: 'fields.End Date', total_homes_po: 'fields.Total Homes PO', sheq_status: 'fields.SHEQ Status', homes_connected_percent: 'fields.Homes Connected %', total_homes_connected: 'fields.Total Homes Connected', project_duration_mths: 'fields.Project Duration Mths'
    }
  },
  'Stock Items_2025-05-26': {
    tableName: 'stock_items', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', item_no: 'fields.Item No', description: 'fields.Description', uom: 'fields.UoM'
    }
  },
  'Stock Movements_2025-05-26': {
    tableName: 'stock_movements', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', movement_id: 'fields.Movement ID', movement_date: 'fields.Date', quantity: 'fields.Quantity', movement_type: 'fields.Movement Type', comments: 'fields.Comments', location_id: 'fields.Project Location[0]', stock_item_id: 'fields.Stock Item[0]'
    }
  },
  'Locations_2025-05-26': {
    tableName: 'locations', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', location_name: 'fields.Location Name', project_id: 'fields.Project[0]'
    }
  },
  'Task_2025-05-26': {
    tableName: 'tasks', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', title: 'fields.Name', description: 'fields.Description', status: 'fields.Status', due_date: 'fields.Due Date', assigned_to: 'fields.Assigned To[0]', project_id: 'fields.Project[0]', attachment_summary: 'fields.Attachment Summary'
    }
  },
  'BOQ_2025-05-26': {
    tableName: 'boq', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', name: 'fields.Name', type: 'fields.Type'
    }
  },
  'Contacts_2025-05-26': {
    tableName: 'contacts', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', contact_name: 'fields.Contact Name', contact_type: 'fields.Contact Type', phone_number: 'fields.Phone Number', email: 'fields.Email'
    }
  },
  'Contractors_2025-05-26': {
    tableName: 'contractors', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', name: 'fields.Name', contact_person: 'fields.Contact Person', phone: 'fields.Phone', email: 'fields.Email', specialization: 'fields.Specialization'
    }
  },
  'Customers_2025-05-26': {
    tableName: 'customers', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', name: 'fields.Name', contact_person: 'fields.Contact Person', phone: 'fields.Phone', email: 'fields.Email', address: 'fields.Address'
    }
  },
  'Daily Tracker_2025-05-26': {
    tableName: 'daily_tracker', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', date: 'fields.Date', project_id: 'fields.Project[0]', location_id: 'fields.Location[0]', work_completed: 'fields.Work Completed', issues: 'fields.Issues', staff_id: 'fields.Staff[0]'
    }
  },
  'Drawdowns_2025-05-26': {
    tableName: 'drawdowns', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', drawdown_number: 'fields.Drawdown Number', project_id: 'fields.Project[0]', date: 'fields.Date', status: 'fields.Status', amount: 'fields.Amount', approved_by: 'fields.Approved By[0]'
    }
  },
  'Issues and Risks_2025-05-26': {
    tableName: 'issues_risks', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', title: 'fields.Title', description: 'fields.Description', status: 'fields.Status', priority: 'fields.Priority', project_id: 'fields.Project[0]', assigned_to: 'fields.Assigned To[0]', due_date: 'fields.Due Date', resolved_date: 'fields.Resolved Date'
    }
  },
  'KPI - Elevate_2025-05-26': {
    tableName: 'kpi_elevate', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', kpi_name: 'fields.KPI Name', target: 'fields.Target', actual: 'fields.Actual', variance: 'fields.Variance', month: 'fields.Month', project_id: 'fields.Project[0]'
    }
  },
  'Master Material List_2025-05-26': {
    tableName: 'master_material_list', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', item_code: 'fields.Item Code', description: 'fields.Description', category: 'fields.Category', uom: 'fields.UoM', unit_cost: 'fields.Unit Cost', supplier: 'fields.Supplier', lead_time_days: 'fields.Lead Time (Days)'
    }
  },
  'Provinces_2025-05-26': {
    tableName: 'provinces', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', name: 'fields.Name', code: 'fields.Code', region: 'fields.Region'
    }
  },
  'Raw Data_2025-05-26': {
    tableName: 'raw_data', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', project_id: 'fields.Project[0]', date: 'fields.Date', metric_name: 'fields.Metric Name', metric_value: 'fields.Metric Value', notes: 'fields.Notes'
    }
  },
  'SHEQ_2025-05-26': {
    tableName: 'sheq', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', type: 'fields.Type', description: 'fields.Description', status: 'fields.Status', severity: 'fields.Severity', project_id: 'fields.Project[0]', reported_by: 'fields.Reported By', date_reported: 'fields.Date Reported', date_resolved: 'fields.Date Resolved'
    }
  },
  'Step_2025-05-26': {
    tableName: 'steps', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', name: 'fields.Name', description: 'fields.Description', order: 'fields.Order', phase: 'fields.Phase', is_milestone: 'fields.Is Milestone', duration_days: 'fields.Duration (Days)'
    }
  },
  'Stock Categories_2025-05-26': {
    tableName: 'stock_categories', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', name: 'fields.Name', description: 'fields.Description', parent_category_id: 'fields.Parent Category[0]'
    }
  },
  'Stock On Hand_2025-05-26': {
    tableName: 'stock_on_hand', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', stock_item_id: 'fields.Stock Item[0]', location_id: 'fields.Location[0]', quantity: 'fields.Quantity', last_updated: 'fields.Last Updated'
    }
  },
  'Suppliers_2025-05-26': {
    tableName: 'suppliers', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', name: 'fields.Name', contact_person: 'fields.Contact Person', phone: 'fields.Phone', email: 'fields.Email', address: 'fields.Address', supplier_type: 'fields.Type', lead_time_days: 'fields.Lead Time (Days)'
    }
  },
  'Task Template_2025-05-26': {
    tableName: 'task_templates', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', name: 'fields.Name', description: 'fields.Description', category: 'fields.Category', estimated_duration: 'fields.Estimated Duration', dependencies: 'fields.Dependencies'
    }
  },
  'Test_2025-05-26': {
    tableName: 'tests', upsert: true, fields: {
      id: 'id', created_time: 'createdTime', name: 'fields.Name', description: 'fields.Description', status: 'fields.Status', project_id: 'fields.Project[0]', assigned_to: 'fields.Assigned To[0]', due_date: 'fields.Due Date', result: 'fields.Result', notes: 'fields.Notes'
    }
  }
};

// Helper function to get nested property
function getNestedValue(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((o, p) => {
    if (!o) return null;
    
    // Handle array access like 'fields.Project[0]'
    const arrayMatch = p.match(/(.*?)\[(\d+)\]/);
    if (arrayMatch) {
      const arrayPath = arrayMatch[1];
      const index = parseInt(arrayMatch[2]);
      const array = getNestedValue(obj, arrayPath);
      return Array.isArray(array) && array.length > index ? array[index] : null;
    }
    
    return o[p];
  }, obj);
}

async function importJsonFile(fileName) {
  const baseName = path.basename(fileName, '.json');
  const config = TABLE_CONFIGS[baseName];
  
  if (!config) {
    console.log(`Skipping ${fileName} - no configuration found`);
    return { success: false, skipped: true };
  }
  
  try {
    const filePath = path.join(EXPORT_DIR, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    if (!Array.isArray(data)) {
      console.error('Expected array of records:', filePath);
      return { success: false, error: 'Invalid data format' };
    }

    console.log(`\n=== Processing ${fileName} into table ${config.tableName} ===`);
    console.log(`Found ${data.length} records`);
    
    // Process records in chunks
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      const mappedChunk = chunk.map(record => {
        const mapped = {};
        for (const [dbField, sourcePath] of Object.entries(config.fields)) {
          mapped[dbField] = getNestedValue(record, sourcePath);
        }
        return mapped;
      }).filter(record => Object.values(record).some(v => v !== null && v !== undefined));

      if (mappedChunk.length === 0) {
        console.log('No valid records to insert in this chunk');
        continue;
      }

      console.log(`Inserting chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(data.length / CHUNK_SIZE)}...`);
      
      try {
        const { error } = config.upsert 
          ? await supabase.from(config.tableName).upsert(mappedChunk, { onConflict: 'id' })
          : await supabase.from(config.tableName).insert(mappedChunk);
        
        if (error) throw error;
        
        console.log(`Inserted ${mappedChunk.length} records`);
      } catch (error) {
        console.error(`Error inserting into ${config.tableName}:`, error);
        // Try inserting records one by one to identify problematic records
        for (const record of mappedChunk) {
          try {
            const { error } = await supabase.from(config.tableName).upsert([record], { onConflict: 'id' });
            if (error) {
              console.error('Failed to insert record:', record);
              console.error('Error:', error);
            }
          } catch (e) {
            console.error('Error inserting single record:', e);
          }
        }
      }
    }
    
    console.log(`✅ Successfully imported data to ${config.tableName}`);
    return { success: true, count: data.length };
    
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    // Read all JSON files in the export directory
    const files = fs.readdirSync(EXPORT_DIR).filter(file => file.endsWith('.json'));
    console.log(`Found ${files.length} JSON files to process`);
    
    for (const file of files) {
      await importJsonFile(file);
    }
    
    console.log('\n=== All imports completed! ===');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

// Run the main function
main();
