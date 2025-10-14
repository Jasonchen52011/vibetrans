// Test script for Medicare ID conversion logic
const testCases = [
  {
    input: '1234-5678-9101',
    expected: '123456789101',
    description: 'Standard numeric MBI format with hyphens',
  },
  {
    input: '1EG4 TE5 MK73',
    expected: '1EG4TE5MK73',
    description: 'New MBI alphanumeric format with spaces',
  },
  {
    input: '1EG4-TE5-MK73',
    expected: '1EG4TE5MK73',
    description: 'Alphanumeric MBI with hyphens',
  },
  {
    input: 'My Medicare ID is 1234-5678-9101',
    expected: 'MYMEDICAREIDIS123456789101',
    description: 'Voice input with sentence context',
  },
  {
    input: '5555 6666 7777',
    expected: '555566667777',
    description: 'Space-separated numeric ID',
  },
  {
    input: '  1A2B-3C4D-5E6F  ',
    expected: '1A2B3C4D5E6F',
    description: 'Mixed case with leading/trailing spaces',
  },
];

// Simulate the API conversion logic
function convertMedicareId(text) {
  return text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

console.log('🧪 Testing Medicare ID Conversion Logic\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((test, index) => {
  const result = convertMedicareId(test.input);
  const success = result === test.expected;

  if (success) {
    passed++;
    console.log(`\n✅ Test ${index + 1} PASSED`);
  } else {
    failed++;
    console.log(`\n❌ Test ${index + 1} FAILED`);
  }

  console.log(`   Description: ${test.description}`);
  console.log(`   Input:       "${test.input}"`);
  console.log(`   Expected:    "${test.expected}"`);
  console.log(`   Got:         "${result}"`);
});

console.log('\n' + '='.repeat(80));
console.log(
  `\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} total\n`
);

if (failed === 0) {
  console.log(
    '🎉 All tests passed! The conversion logic is working correctly.\n'
  );
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the logic.\n');
  process.exit(1);
}
