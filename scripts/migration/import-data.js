const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const EXPORT_DIR = '/home/ldp/louisdup/Clients/VelocityFibre/Agents/Airtable/airtableToNeon/exports/Velocity_Fibre_Management/2025-05-26/';
const CHUNK_SIZE = 50; // Smaller chunks for better reliability

// Mapping of Airtable table names to our database table names
const TABLE_MAPPING = {
  'Staff_2025-05-26': 'staff',
  'Projects_2025-05-26': 'projects',
  'Task_2025-05-26': 'tasks',
  'Contacts_2025-26': 'contacts',
  'Stock Items_2025-05-26': 'stock_items',
  'Stock Movements_2025-05-26': 'stock_movements',
  'Locations_2025-05-26': 'locations',
  'Task Template_2025-05-26': 'task_templates'
};

// Field mappings for each table
const FIELD_MAPPINGS = {
  staff: (record) => ({
    id: record.id,
    created_time: new Date(record.createdTime).toISOString(),
    name: record.fields?.Name,
    role: record.fields?.Role,
    phone_number: record.fields?.['Phone Number'],
    email: record.fields?.Email,
    photo: record.fields?.Photo?.[0] ? record.fields.Photo[0] : null,
    total_assigned_projects: record.fields?.['Total Assigned Projects'] || 0,
    current_projects: record.fields?.['Current Projects'] || [],
    tasks_assigned: record.fields?.['Tasks (Assigned To)']
  }),
  
  projects: (record) => ({
    id: record.id,
    created_time: new Date(record.createdTime).toISOString(),
    project_name: record.fields?.['Project Name'],
    region: record.fields?.Region,
    status: record.fields?.Status,
    start_date: record.fields?.['Start Date'],
    end_date: record.fields?.['End Date'],
    total_homes_po: record.fields?.['Total Homes PO'],
    sheq_status: record.fields?.['SHEQ Status'],
    homes_connected_percent: record.fields?.['Homes Connected %'] || 0,
    auto_project_status: record.fields?.['Auto Project Status'] || 0,
    homes_connected_current: record.fields?.['Homes Connected Current'] || 0,
    permissions_complete: record.fields?.['Permissions Complete'] || 0,
    permissions_percent: record.fields?.['Permissions %']?.specialValue === 'NaN' ? null : record.fields?.['Permissions %'],
    poles_planted: record.fields?.['Poles Planted'] || 0,
    poles_planted_percent: record.fields?.['Poles Planted %']?.specialValue === 'NaN' ? null : record.fields?.['Poles Planted %'],
    stringing_boq: record.fields?.['Stringing BOQ'] || 0,
    stringing_complete: record.fields?.['Stringing Complete'] || 0,
    total_stringing_percent: record.fields?.['Total Stringing %']?.specialValue === 'NaN' ? null : record.fields?.['Total Stringing %'],
    trenching_boq: record.fields?.['Trenching BOQ'] || 0,
    trenching_complete: record.fields?.['Trenching Complete'] || 0,
    trenching_percent_complete: record.fields?.['Trenching % Complete']?.specialValue === 'NaN' ? null : record.fields?.['Trenching % Complete'],
    total_homes_connected: record.fields?.['Total Homes Connected'],
    total_poles_boq: record.fields?.['Total Poles BOQ'],
    permissions_missing: record.fields?.['Permissions Missing'] || 0,
    permissions_declined: record.fields?.['Permissions Declined'] || 0,
    home_sign_ups: record.fields?.['Home Sign-ups'] || 0,
    home_sign_ups_percent: record.fields?.['Home Sign-Ups %'] || 0,
    project_duration_mths: record.fields?.['Project Duration Mths']
  })
};

async function importJsonFile(filePath, tableName) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    if (!Array.isArray(data)) {
      console.error('Expected array of records:', filePath);
      return { success: false, error: 'Invalid data format' };
    }

    console.log(`Found ${data.length} records in ${path.basename(filePath)}`);
    
    // Process records in chunks
    for (let i = 0; i < data.length; i += CHUNK_SIZE) {
      const chunk = data.slice(i, i + CHUNK_SIZE);
      const mappedChunk = chunk.map(record => {
        const mapper = FIELD_MAPPINGS[tableName];
        return mapper ? mapper(record) : record.fields || record;
      });
      
      console.log(`Inserting chunk ${i / CHUNK_SIZE + 1} of ${Math.ceil(data.length / CHUNK_SIZE)} into ${tableName}...`);
      
      const { error } = await supabase
        .from(tableName)
        .insert(mappedChunk);
      
      if (error) {
        console.error(`Error inserting into ${tableName}:`, error);
        return { success: false, error };
      }
      
      console.log(`Inserted ${mappedChunk.length} records into ${tableName}`);
    }
    
    return { success: true, count: data.length };
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return { success: false, error };
  }
}

async function main() {
  try {
    const files = fs.readdirSync(EXPORT_DIR)
      .filter(f => f.endsWith('.json'));
    
    console.log(`Found ${files.length} JSON files to process`);
    
    for (const file of files) {
      const baseName = path.basename(file, '.json');
      const tableName = TABLE_MAPPING[baseName] || baseName.toLowerCase();
      
      console.log(`\n=== Processing ${file} into table ${tableName} ===`);
      
      const result = await importJsonFile(
        path.join(EXPORT_DIR, file),
        tableName
      );
      
      if (result.success) {
        console.log(`✅ Successfully imported ${result.count} records to ${tableName}`);
      } else {
        console.error(`❌ Failed to import ${file}:`, result.error);
      }
      
      // Add a small delay between imports
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n=== All imports completed! ===');
  } catch (error) {
    console.error('Fatal error in main:', error);
    process.exit(1);
  }
}

main();
