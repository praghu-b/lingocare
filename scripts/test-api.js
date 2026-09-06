const fs = require('fs');
const path = require('path');

async function testUpload(fileName) {
  console.log(`\n--- Testing Upload: ${fileName} ---`);
  const filePath = path.join(__dirname, '..', 'public', fileName);
  const fileBuffer = fs.readFileSync(filePath);

  const blob = new Blob([fileBuffer], { type: 'application/pdf' });
  const formData = new FormData();
  formData.append('file', blob, fileName);

  const res = await fetch('http://localhost:3000/api/parse-curriculum', {
    method: 'POST',
    body: formData,
  });

  const json = await res.json();
  console.log('HTTP Status:', res.status);
  console.log('Success:', json.success);
  if (json.success) {
    console.log('Title:', json.curriculum.title);
    console.log('Modules Count:', json.curriculum.modules.length);
    json.curriculum.modules.forEach((m, idx) => {
      console.log(`  [Module ${idx + 1}] ${m.title} (Inferred: ${m.isInferred})`);
      m.topics.forEach((t, tIdx) => {
        console.log(`    [Topic ${idx + 1}.${tIdx + 1}] ${t.title} (Lessons: ${t.lessons.length}, Inferred: ${t.isInferred})`);
      });
    });
    if (json.warning) {
      console.log('Warning Notice:', json.warning);
    }
  } else {
    console.log('Error:', json.error);
  }
}

async function runAllTests() {
  await testUpload('sample-nursing-curriculum.pdf');
  await testUpload('sample-incomplete-syllabus.pdf');
  await testUpload('sample-unrelated-document.pdf');
}

runAllTests().catch(console.error);
