// Automated verification of 4 test cases
async function test() {
  const testInputs = [
    { name: 'Test 1: Rectangle', input: 'a rectangle with length 6 breadth 2' },
    { name: 'Test 2: Trigonometry', input: 'y = 3sin(4x) + 2' },
    { name: 'Test 3: Quadratic Algebra', input: 'x^2 - 5x + 6 = 0' },
    { name: 'Test 4: Cube Volume', input: 'A cube has side length 6 cm. Find its volume.' },
    { name: 'Test 5: Quadratic Simple', input: 'x^2 = 16' },
    { name: 'Test 6: Trig Phase Shift', input: 'y = sin(2x) - 1' },
    { name: 'Test 7: Rectangle Explicit Area', input: 'A rectangle has length 12 cm and width 7 cm. Find its area.' }
  ];

  for (const t of testInputs) {
    console.log(`\n========================================`);
    console.log(`RUNNING: ${t.name} -> "${t.input}"`);
    console.log(`========================================`);
    try {
      const res = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: 'text', content: t.input })
      });
      const data = await res.json();
      const c = data.data;
      console.log(`Domain:        ${c.domain}`);
      console.log(`Problem Type:  ${c.problemType}`);
      console.log(`Concept Name:  ${c.conceptName}`);
      console.log(`Final Answer:  ${c.finalAnswer}`);
      console.log(`Vis Supported: ${c.visualization?.supported}`);
      console.log(`Vis Type:      ${c.visualization?.type}`);
      console.log(`Vis Data:     `, JSON.stringify(c.visualization?.data));
      if (c.exploration?.parameters) {
        console.log(`Exploration:   ${c.exploration.parameters.map(p => `${p.label} (default: ${p.defaultValue})`).join(', ')}`);
      }
    } catch (err) {
      console.error(`Error:`, err.message);
    }
  }
}

test();
