const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY; // Use service key for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const EXPORT_DIR = '/home/ldp/louisdup/Clients/VelocityFibre/Agents/Airtable/airtableToNeon/exports/Velocity_Fibre_Management/2025-05-26/';

async function importJsonFile(filePath, tableName) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!Array.isArray(data)) {
    console.error('Expected array of records:', filePath);
    return;
  }
  // Chunk inserts to avoid size/time limits (Supabase limit is 500 rows per insert)
  const chunkSize = 500;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const { error } = await supabase.from(tableName).insert(chunk);
    if (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      return;
    }
    console.log(`Inserted ${chunk.length} records into ${tableName}`);
  }
}

async function main() {
  const files = fs.readdirSync(EXPORT_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const tableName = path.basename(file, '.json');
    console.log(`Importing ${file} into ${tableName}...`);
    await importJsonFile(path.join(EXPORT_DIR, file), tableName);
  }
  console.log('All imports complete!');
}

main().catch(console.error);
