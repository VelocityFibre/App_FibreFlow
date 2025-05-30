const { quickSoftDeleteTest } = require('./src/lib/softDeleteTest.ts');

// Simple test runner
async function runTests() {
  console.log('🧪 Testing FibreFlow Soft Delete Functionality...\n');
  
  try {
    await quickSoftDeleteTest();
    console.log('\n✅ All soft delete tests passed!');
  } catch (error) {
    console.error('\n❌ Soft delete tests failed:', error);
  }
}

runTests();