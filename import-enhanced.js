const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const EXPORT_DIR = '/home/ldp/louisdup/Clients/VelocityFibre/Agents/Airtable/airtableToNeon/exports/Velocity_Fibre_Management/2025-05-26/';
const CHUNK_SIZE = 20; // Smaller chunks for better reliability

// Table configurations with field mappings
const TABLE_CONFIGS = {
  'Staff_2025-05-26': {
    tableName: 'staff',
    fields: {
      'id': 'id',
      'created_time': 'createdTime',
      'name': 'fields.Name',
      'role': 'fields.Role',
      'phone_number': 'fields.Phone Number',
      'email': 'fields.Email',
      'photo': 'fields.Photo[0]',
      'total_assigned_projects': 'fields.Total Assigned Projects',
      'current_projects': 'fields.Current Projects',
      'tasks_assigned': 'fields.Tasks (Assigned To)'
    }
  },
  'Projects_2025-05-26': {
    tableName: 'projects',
    fields: {
      'id': 'id',
      'created_time': 'createdTime',
      'project_name': 'fields.Project Name',
      'region': 'fields.Region',
      'status': 'fields.Status',
      'start_date': 'fields.Start Date',
      'end_date': 'fields.End Date',
      'total_homes_po': 'fields.Total Homes PO',
      'sheq_status': 'fields.SHEQ Status',
      'homes_connected_percent': 'fields.Homes Connected %',
      'total_homes_connected': 'fields.Total Homes Connected',
      'project_duration_mths': 'fields.Project Duration Mths'
    }
  },
  'Stock Items_2025-05-26': {
    tableName: 'stock_items',
    fields: {
      'id': 'id',
      'created_time': 'createdTime',
      'item_no': 'fields.Item No',
      'description': 'fields.Description',
      'uom': 'fields.UoM'
    }
  },
  'Stock Movements_2025-05-26': {
    tableName: 'stock_movements',
    fields: {
      'id': 'id',
      'created_time': 'createdTime',
      'movement_id': 'fields.Movement ID',
      'movement_date': 'fields.Date',
      'quantity': 'fields.Quantity',
      'movement_type': 'fields.Movement Type',
      'comments': 'fields.Comments',
      'location_id': 'fields.Project Location[0]',
      'stock_item_id': 'fields.Stock Item[0]'
    }
  },
  'Locations_2025-05-26': {
    tableName: 'locations',
    fields: {
      'id': 'id',
      'created_time': 'createdTime',
      'location_name': 'fields.Location Name',
      'project_id': 'fields.Project[0]'
    }
  },
  'Task_2025-05-26': {
    tableName: 'tasks',
    fields: {
      'id': 'id',
      'created_time': 'createdTime',
      'title': 'fields.Name',
      'description': 'fields.Description',
      'status': 'fields.Status',
      'due_date': 'fields.Due Date',
      'assigned_to': 'fields.Assigned To[0]',
      'project_id': 'fields.Project[0]'
    }
  }
};

// Helper function to get nested property
function getNestedValue(obj, path) {
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
      });
      
      console.log(`Inserting chunk ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(data.length / CHUNK_SIZE)}...`);
      
      const { error } = await supabase
        .from(config.tableName)
        .insert(mappedChunk);
      
      if (error) {
        console.error(`Error inserting into ${config.tableName}:`, error);
        return { success: false, error };
      }
      
      console.log(`Inserted ${mappedChunk.length} records`);
    }
    
    console.log(`✅ Successfully imported ${data.length} records to ${config.tableName}`);
    return { success: true, count: data.length };
  } catch (error) {
    console.error(`Error processing ${fileName}:`, error);
    return { success: false, error };
  }
}

async function main() {
  try {
    const files = fs.readdirSync(EXPORT_DIR)
      .filter(f => f.endsWith('.json'))
      .sort((a, b) => {
        // Process in a specific order to handle dependencies
        const order = [
          'Staff_2025-05-26.json',
          'Projects_2025-05-26.json',
          'Locations_2025-05-26.json',
          'Stock Items_2025-05-26.json',
          'Stock Movements_2025-05-26.json',
          'Task_2025-05-26.json'
        ];
        
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);
        
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    
    console.log(`Found ${files.length} JSON files to process`);
    
    for (const file of files) {
      await importJsonFile(file);
      // Add a small delay between imports
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n=== All imports completed! ===');
  } catch (error) {
    console.error('Fatal error in main:', error);
    process.exit(1);
  }
}

main();
