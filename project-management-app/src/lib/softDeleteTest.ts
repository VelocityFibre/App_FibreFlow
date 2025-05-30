import { supabase } from './supabaseClient';
import { 
  archiveRecord, 
  unarchiveRecord, 
  bulkArchiveRecords,
  excludeArchived,
  onlyArchived,
  SoftDeleteTable 
} from './softDelete';

/**
 * Test utilities for soft delete functionality
 * These functions help verify that soft delete is working correctly
 */

export interface SoftDeleteTestResult {
  success: boolean;
  message: string;
  details?: any;
  duration?: number;
}

export interface TestSuite {
  name: string;
  results: SoftDeleteTestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    duration: number;
  };
}

/**
 * Test basic archive functionality
 */
export async function testArchiveRecord(): Promise<SoftDeleteTestResult> {
  try {
    // Create a test record first
    const testRecord = {
      project_name: `Test Project ${Date.now()}`,
      description: 'Test project for soft delete functionality'
    };

    const { data: createdData, error: createError } = await supabase
      .from('projects')
      .insert([testRecord])
      .select()
      .single();

    if (createError || !createdData) {
      return {
        success: false,
        message: `Failed to create test record: ${createError?.message || 'Unknown error'}`
      };
    }

    // Archive the record
    const archiveResult = await archiveRecord('projects', createdData.id, {
      testNote: 'Archive test'
    });

    if (!archiveResult.success) {
      return {
        success: false,
        message: `Archive failed: ${archiveResult.error}`
      };
    }

    // Verify the record is archived
    const { data: archivedData, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', createdData.id)
      .single();

    if (fetchError) {
      return {
        success: false,
        message: `Failed to fetch archived record: ${fetchError.message}`
      };
    }

    if (!archivedData.archived_at) {
      return {
        success: false,
        message: 'Record was not properly archived (archived_at is null)'
      };
    }

    // Clean up - permanently delete the test record
    await supabase.from('projects').delete().eq('id', createdData.id);

    return {
      success: true,
      message: 'Archive test passed successfully',
      details: {
        recordId: createdData.id,
        archivedAt: archivedData.archived_at
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `Archive test failed with error: ${error}`
    };
  }
}

/**
 * Test unarchive functionality
 */
export async function testUnarchiveRecord(): Promise<SoftDeleteTestResult> {
  try {
    // Create and archive a test record
    const testRecord = {
      project_name: `Test Project ${Date.now()}`,
      description: 'Test project for soft delete unarchive functionality'
    };

    const { data: createdData, error: createError } = await supabase
      .from('projects')
      .insert([testRecord])
      .select()
      .single();

    if (createError || !createdData) {
      return {
        success: false,
        message: `Failed to create test record: ${createError?.message || 'Unknown error'}`
      };
    }

    // Archive the record first
    const archiveResult = await archiveRecord('projects', createdData.id);
    if (!archiveResult.success) {
      return {
        success: false,
        message: `Failed to archive test record: ${archiveResult.error}`
      };
    }

    // Unarchive the record
    const unarchiveResult = await unarchiveRecord('projects', createdData.id, {
      testNote: 'Unarchive test'
    });

    if (!unarchiveResult.success) {
      return {
        success: false,
        message: `Unarchive failed: ${unarchiveResult.error}`
      };
    }

    // Verify the record is unarchived
    const { data: unarchivedData, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', createdData.id)
      .single();

    if (fetchError) {
      return {
        success: false,
        message: `Failed to fetch unarchived record: ${fetchError.message}`
      };
    }

    if (unarchivedData.archived_at !== null) {
      return {
        success: false,
        message: 'Record was not properly unarchived (archived_at is not null)'
      };
    }

    // Clean up - permanently delete the test record
    await supabase.from('projects').delete().eq('id', createdData.id);

    return {
      success: true,
      message: 'Unarchive test passed successfully',
      details: {
        recordId: createdData.id,
        archivedAt: null
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `Unarchive test failed with error: ${error}`
    };
  }
}

/**
 * Test bulk archive functionality
 */
export async function testBulkArchive(): Promise<SoftDeleteTestResult> {
  try {
    // Create multiple test records
    const testRecords = Array.from({ length: 3 }, (_, i) => ({
      project_name: `Bulk Test Project ${Date.now()}-${i}`,
      description: `Test project ${i} for bulk archive functionality`
    }));

    const { data: createdData, error: createError } = await supabase
      .from('projects')
      .insert(testRecords)
      .select();

    if (createError || !createdData || createdData.length === 0) {
      return {
        success: false,
        message: `Failed to create test records: ${createError?.message || 'Unknown error'}`
      };
    }

    const recordIds = createdData.map(record => record.id);

    // Bulk archive the records
    const bulkArchiveResult = await bulkArchiveRecords('projects', recordIds, {
      testNote: 'Bulk archive test'
    });

    if (!bulkArchiveResult.success) {
      return {
        success: false,
        message: `Bulk archive failed: ${bulkArchiveResult.error}`
      };
    }

    // Verify all records are archived
    const { data: archivedData, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .in('id', recordIds);

    if (fetchError) {
      return {
        success: false,
        message: `Failed to fetch archived records: ${fetchError.message}`
      };
    }

    const unarchivedCount = archivedData?.filter(record => !record.archived_at).length || 0;
    if (unarchivedCount > 0) {
      return {
        success: false,
        message: `${unarchivedCount} records were not properly archived`
      };
    }

    // Clean up - permanently delete the test records
    await supabase.from('projects').delete().in('id', recordIds);

    return {
      success: true,
      message: 'Bulk archive test passed successfully',
      details: {
        recordIds: recordIds,
        archivedCount: recordIds.length
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `Bulk archive test failed with error: ${error}`
    };
  }
}

/**
 * Run all soft delete tests
 */
export async function runAllSoftDeleteTests(): Promise<SoftDeleteTestResult[]> {
  console.log('Running soft delete tests...');
  
  const results = await Promise.all([
    testArchiveRecord(),
    testUnarchiveRecord(),
    testBulkArchive()
  ]);

  const passedTests = results.filter(result => result.success).length;
  const totalTests = results.length;

  console.log(`Soft delete tests completed: ${passedTests}/${totalTests} passed`);
  
  return results;
}

/**
 * Test that archived records are filtered from normal queries
 */
export async function testArchiveFiltering(): Promise<SoftDeleteTestResult> {
  try {
    // Create a test record
    const testRecord = {
      project_name: `Filter Test Project ${Date.now()}`,
      description: 'Test project for archive filtering'
    };

    const { data: createdData, error: createError } = await supabase
      .from('projects')
      .insert([testRecord])
      .select()
      .single();

    if (createError || !createdData) {
      return {
        success: false,
        message: `Failed to create test record: ${createError?.message || 'Unknown error'}`
      };
    }

    // Verify record appears in normal query
    const { data: normalQuery, error: normalError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', createdData.id)
      .is('archived_at', null);

    if (normalError || !normalQuery || normalQuery.length === 0) {
      return {
        success: false,
        message: 'Record not found in normal query before archiving'
      };
    }

    // Archive the record
    await archiveRecord('projects', createdData.id);

    // Verify record does NOT appear in filtered query
    const { data: filteredQuery, error: filteredError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', createdData.id)
      .is('archived_at', null);

    if (filteredError) {
      return {
        success: false,
        message: `Filtered query failed: ${filteredError.message}`
      };
    }

    if (filteredQuery && filteredQuery.length > 0) {
      return {
        success: false,
        message: 'Archived record still appears in filtered query'
      };
    }

    // Verify record DOES appear in unfiltered query
    const { data: unfilteredQuery, error: unfilteredError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', createdData.id);

    if (unfilteredError || !unfilteredQuery || unfilteredQuery.length === 0) {
      return {
        success: false,
        message: 'Archived record not found in unfiltered query'
      };
    }

    // Clean up
    await supabase.from('projects').delete().eq('id', createdData.id);

    return {
      success: true,
      message: 'Archive filtering test passed successfully',
      details: {
        recordId: createdData.id
      }
    };

  } catch (error) {
    return {
      success: false,
      message: `Archive filtering test failed with error: ${error}`
    };
  }
}

/**
 * Enhanced test utilities with timing and better reporting
 */

// Test data generators
export class TestDataGenerator {
  static async createTestProject(): Promise<any> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        project_name: `Test Project ${Date.now()}`,
        customer_id: 'test-customer',
        status: 'active',
        start_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createTestStaff(): Promise<any> {
    const { data, error } = await supabase
      .from('staff')
      .insert({
        name: `Test Staff ${Date.now()}`,
        email: `test${Date.now()}@example.com`,
        role: 'technician'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async createTestLocation(): Promise<any> {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        location_name: `Test Location ${Date.now()}`,
        province: 'Test Province',
        region: 'Test Region'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async cleanupTestData(ids: { [table: string]: string[] }): Promise<void> {
    for (const [table, idList] of Object.entries(ids)) {
      if (idList.length > 0) {
        await supabase
          .from(table)
          .delete()
          .in('id', idList);
      }
    }
  }
}

// Enhanced test functions
export class SoftDeleteTestSuite {
  private static async runTest(
    testName: string,
    testFunction: () => Promise<void>
  ): Promise<SoftDeleteTestResult> {
    const startTime = Date.now();
    
    try {
      await testFunction();
      return {
        success: true,
        message: 'Test completed successfully',
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
        duration: Date.now() - startTime
      };
    }
  }

  // Test query utility functions
  static async testQueryUtilities(): Promise<SoftDeleteTestResult> {
    return this.runTest('Query Utilities', async () => {
      const activeProject = await TestDataGenerator.createTestProject();
      const archivedProject = await TestDataGenerator.createTestProject();
      
      // Archive one project
      await archiveRecord('projects', archivedProject.id);
      
      // Test excludeArchived filter
      const activeQuery = supabase
        .from('projects')
        .select('*')
        .in('id', [activeProject.id, archivedProject.id]);
      
      const { data: activeProjects } = await excludeArchived(activeQuery);

      if (!activeProjects || activeProjects.length !== 1) {
        throw new Error('excludeArchived filter not working properly');
      }

      if (activeProjects[0].id !== activeProject.id) {
        throw new Error('Wrong project returned by excludeArchived filter');
      }

      // Test onlyArchived filter
      const archivedQuery = supabase
        .from('projects')
        .select('*')
        .in('id', [activeProject.id, archivedProject.id]);
      
      const { data: archivedProjects } = await onlyArchived(archivedQuery);

      if (!archivedProjects || archivedProjects.length !== 1) {
        throw new Error('onlyArchived filter not working properly');
      }

      if (archivedProjects[0].id !== archivedProject.id) {
        throw new Error('Wrong project returned by onlyArchived filter');
      }

      // Cleanup
      await TestDataGenerator.cleanupTestData({
        'projects': [activeProject.id, archivedProject.id]
      });
    });
  }

  // Test bulk archive safety limits
  static async testBulkArchiveLimits(): Promise<SoftDeleteTestResult> {
    return this.runTest('Bulk Archive Limits', async () => {
      // Create array of 101 fake IDs to test the limit
      const tooManyIds = Array.from({ length: 101 }, (_, i) => `fake-id-${i}`);
      
      // Attempt bulk archive - should fail due to safety limit
      const result = await bulkArchiveRecords('projects', tooManyIds);
      
      if (result.success) {
        throw new Error('Bulk archive should have failed due to safety limit');
      }

      if (!result.error?.message.includes('100 records at a time')) {
        throw new Error('Error message does not mention safety limit');
      }
    });
  }

  // Test performance with multiple operations
  static async testPerformance(): Promise<SoftDeleteTestResult> {
    return this.runTest('Performance Test', async () => {
      // Create multiple projects for performance testing
      const projects = await Promise.all(
        Array.from({ length: 10 }, () => TestDataGenerator.createTestProject())
      );

      const projectIds = projects.map(p => p.id);
      
      // Measure bulk archive performance
      const startTime = Date.now();
      
      const result = await bulkArchiveRecords('projects', projectIds);
      
      const duration = Date.now() - startTime;
      
      if (!result.success) {
        throw new Error('Performance test failed: ' + result.error?.message);
      }

      // Performance should be under 2 seconds for 10 records
      if (duration > 2000) {
        throw new Error(`Performance too slow: ${duration}ms for 10 records`);
      }

      // Cleanup
      await TestDataGenerator.cleanupTestData({
        'projects': projectIds
      });
    });
  }

  // Test different table types
  static async testMultipleTables(): Promise<SoftDeleteTestResult> {
    return this.runTest('Multiple Table Types', async () => {
      const project = await TestDataGenerator.createTestProject();
      const staff = await TestDataGenerator.createTestStaff();
      const location = await TestDataGenerator.createTestLocation();
      
      // Archive records from different tables
      const projectResult = await archiveRecord('projects', project.id);
      const staffResult = await archiveRecord('staff', staff.id);
      const locationResult = await archiveRecord('locations', location.id);
      
      if (!projectResult.success || !staffResult.success || !locationResult.success) {
        throw new Error('Failed to archive records from different tables');
      }

      // Verify all are archived
      const [archivedProject, archivedStaff, archivedLocation] = await Promise.all([
        supabase.from('projects').select('archived_at').eq('id', project.id).single(),
        supabase.from('staff').select('archived_at').eq('id', staff.id).single(),
        supabase.from('locations').select('archived_at').eq('id', location.id).single()
      ]);

      if (!archivedProject.data?.archived_at || 
          !archivedStaff.data?.archived_at || 
          !archivedLocation.data?.archived_at) {
        throw new Error('Not all records were properly archived');
      }

      // Cleanup
      await TestDataGenerator.cleanupTestData({
        'projects': [project.id],
        'staff': [staff.id],
        'locations': [location.id]
      });
    });
  }

  // Test audit log integration
  static async testAuditLogIntegration(): Promise<SoftDeleteTestResult> {
    return this.runTest('Audit Log Integration', async () => {
      const project = await TestDataGenerator.createTestProject();
      
      // Archive with details
      await archiveRecord('projects', project.id, { reason: 'test archive' });
      
      // Check if audit log was created
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_type', 'PROJECT')
        .eq('resource_id', project.id)
        .eq('action', 'DELETE')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!auditLogs || auditLogs.length === 0) {
        throw new Error('Audit log was not created');
      }

      const auditLog = auditLogs[0];
      
      if (!auditLog.changes?.action || auditLog.changes.action !== 'archive') {
        throw new Error('Audit log does not contain correct action');
      }

      // Test unarchive audit log
      await unarchiveRecord('projects', project.id, { reason: 'test unarchive' });
      
      const { data: unarchiveAuditLogs } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_type', 'PROJECT')
        .eq('resource_id', project.id)
        .eq('action', 'UPDATE')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!unarchiveAuditLogs || unarchiveAuditLogs.length === 0) {
        throw new Error('Unarchive audit log was not created');
      }

      // Cleanup
      await TestDataGenerator.cleanupTestData({
        'projects': [project.id]
      });
      
      // Clean up audit logs
      await supabase
        .from('audit_logs')
        .delete()
        .in('id', [auditLog.id, unarchiveAuditLogs[0].id]);
    });
  }
}

/**
 * Comprehensive test runner
 */
export class SoftDeleteTestRunner {
  static async runComprehensiveTests(): Promise<TestSuite> {
    const startTime = Date.now();
    const results: SoftDeleteTestResult[] = [];

    console.log('🧪 Starting Comprehensive Soft Delete Test Suite...\n');

    // Run all tests
    const tests = [
      { name: 'Basic Archive', fn: testArchiveRecord },
      { name: 'Unarchive Record', fn: testUnarchiveRecord },
      { name: 'Bulk Archive', fn: testBulkArchive },
      { name: 'Archive Filtering', fn: testArchiveFiltering },
      { name: 'Query Utilities', fn: SoftDeleteTestSuite.testQueryUtilities },
      { name: 'Bulk Archive Limits', fn: SoftDeleteTestSuite.testBulkArchiveLimits },
      { name: 'Performance Test', fn: SoftDeleteTestSuite.testPerformance },
      { name: 'Multiple Tables', fn: SoftDeleteTestSuite.testMultipleTables },
      { name: 'Audit Log Integration', fn: SoftDeleteTestSuite.testAuditLogIntegration }
    ];

    for (const test of tests) {
      console.log(`Running: ${test.name}...`);
      const result = await test.fn();
      results.push({ ...result, test: test.name });
      
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${test.name}: ${result.message}`);
      if (result.duration) {
        console.log(`   Duration: ${result.duration}ms`);
      }
      console.log('');
    }

    // Calculate summary
    const summary = {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => r.success === false).length,
      duration: Date.now() - startTime
    };

    console.log('📊 Comprehensive Test Suite Summary:');
    console.log(`Total: ${summary.total}`);
    console.log(`Passed: ${summary.passed} ✅`);
    console.log(`Failed: ${summary.failed} ❌`);
    console.log(`Duration: ${summary.duration}ms`);
    console.log('');

    if (summary.failed > 0) {
      console.log('❌ Failed Tests:');
      results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`- ${r.test || 'Unknown'}: ${r.message}`);
          if (r.details) {
            console.log(`  Details:`, r.details);
          }
        });
    } else {
      console.log('🎉 All tests passed!');
    }

    return {
      name: 'Comprehensive Soft Delete Test Suite',
      results,
      summary
    };
  }

  // Quick test for development
  static async quickTest(): Promise<void> {
    console.log('🚀 Running Quick Soft Delete Test...\n');
    
    try {
      const project = await TestDataGenerator.createTestProject();
      console.log('✅ Created test project:', project.id);
      
      const archiveResult = await archiveRecord('projects', project.id);
      console.log('✅ Archive result:', archiveResult.success ? 'SUCCESS' : 'FAILED');
      
      const { data: archivedProject } = await supabase
        .from('projects')
        .select('archived_at')
        .eq('id', project.id)
        .single();
      
      console.log('✅ Archived status:', archivedProject?.archived_at ? 'ARCHIVED' : 'NOT ARCHIVED');
      
      const unarchiveResult = await unarchiveRecord('projects', project.id);
      console.log('✅ Unarchive result:', unarchiveResult.success ? 'SUCCESS' : 'FAILED');
      
      // Cleanup
      await supabase.from('projects').delete().eq('id', project.id);
      console.log('✅ Cleanup completed');
      
      console.log('\n🎉 Quick test completed successfully!');
    } catch (error) {
      console.error('❌ Quick test failed:', error);
    }
  }
}

/**
 * Export enhanced test functions
 */
export {
  SoftDeleteTestSuite,
  SoftDeleteTestRunner,
  TestDataGenerator
};

// Legacy compatibility
export { runAllSoftDeleteTests };

// New comprehensive test function
export async function runComprehensiveSoftDeleteTests(): Promise<TestSuite> {
  return await SoftDeleteTestRunner.runComprehensiveTests();
}

// Quick test function
export async function quickSoftDeleteTest(): Promise<void> {
  return await SoftDeleteTestRunner.quickTest();
}