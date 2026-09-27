// Comprehensive automated test runner for all 20 test cases
async function runAllTests() {
  const testCases = [
    { id: 1, domain: 'ALGEBRA', question: '3x^2 - 7x + 2 = 0', expectedAns: 'x = 2 or x = 1/3', expectedVis: 'PARABOLA' },
    { id: 2, domain: 'ALGEBRA', question: '2x^2 - 7x + 3 = 0', expectedAns: 'x = 3 or x = 1/2', expectedVis: 'PARABOLA' },
    { id: 3, domain: 'ALGEBRA', question: 'Find the determinant of matrix [[3, 4], [1, 2]]', expectedAns: 'det(A) = 2', expectedVis: 'MATRIX' },
    { id: 4, domain: 'ALGEBRA', question: 'In an arithmetic progression, first term a = 3 and common difference d = 4. Find the sum of first 5 terms.', expectedAns: 'Sum S_5 = 55', expectedVis: 'SEQUENCES_SERIES' },
    { id: 5, domain: 'ALGEBRA', question: 'A fair coin is tossed 4 times with p = 0.5. Find the expected number of heads.', expectedAns: 'E(X) = 2', expectedVis: 'PROBABILITY' },
    { id: 6, domain: 'TRIGONOMETRY', question: 'A 60 m high tower casts a shadow. If angle of elevation is 45 degrees, find the distance.', expectedAns: 'Distance d = 60 m', expectedVis: 'HEIGHTS_AND_DISTANCES' },
    { id: 7, domain: 'TRIGONOMETRY', question: 'y = 2sin(3x) + 1', expectedAns: 'Period = 0.67π rad', expectedVis: 'TRIG_GRAPH' },
    { id: 8, domain: 'GEOMETRY', question: 'A rectangle has length 15 cm and breadth 8 cm. Find its area and perimeter.', expectedAns: 'Area = 120 cm²', expectedVis: 'RECTANGLE' },
    { id: 9, domain: 'GEOMETRY', question: 'Find the area of a square of side 9 cm.', expectedAns: 'Area = 81 cm²', expectedVis: 'SQUARE' },
    { id: 10, domain: 'GEOMETRY', question: 'A triangle has base 14 cm and height 8 cm. Find its area.', expectedAns: 'Area = 56 cm²', expectedVis: 'TRIANGLE' },
    { id: 11, domain: 'GEOMETRY', question: 'A circle of radius 6 cm is divided into 6 equal parts. Find the area of each sector.', expectedAns: 'Each of 6 sectors = 18.85 cm²', expectedVis: 'CIRCLE_GEOMETRY' },
    { id: 12, domain: 'GEOMETRY', question: 'A regular hexagon has side length 6 cm. Find its area.', expectedAns: 'Area = 93.53 cm²', expectedVis: 'POLYGON' },
    { id: 13, domain: 'GEOMETRY', question: 'A cube has side length 5 cm. Find its volume and surface area.', expectedAns: 'Volume V = 125 cm³', expectedVis: 'CUBE' },
    { id: 14, domain: 'GEOMETRY', question: 'A cylinder has radius 3 cm and height 12 cm. Find its volume.', expectedAns: 'Volume V = 339.29 cm³', expectedVis: 'CYLINDER' },
    { id: 15, domain: 'COORDINATE_GEOMETRY', question: 'An ellipse has equation x^2/25 + y^2/16 = 1. Find its eccentricity and area.', expectedAns: 'Eccentricity e = 0.600', expectedVis: 'ELLIPSE' },
    { id: 16, domain: 'CALCULUS', question: 'Find the area enclosed by y = x^2 and y = 9.', expectedAns: 'Area = 36.00 sq units', expectedVis: 'AREA_UNDER_CURVE' },
    { id: 17, domain: 'CALCULUS', question: 'Find the slope of tangent line to curve y = x^2 at x = 3.', expectedAns: 'Slope m = 6', expectedVis: 'DERIVATIVE_TANGENT' },
    { id: 18, domain: 'VECTOR_ALGEBRA', question: 'Find the angle between the vectors a = 2i + 3j + k and b = i - j + 2k.', expectedAns: 'θ = 83.74°', expectedVis: 'VECTOR_3D' },
    { id: 19, domain: '3D_GEOMETRY', question: 'Find the normal vector and distance from origin for plane 2x + 3y + 4z - 12 = 0.', expectedAns: 'Normal n = ⟨2, 3, 4⟩', expectedVis: '3D_PLANE' },
    { id: 20, domain: 'UNKNOWN', question: 'what is the best food in Mumbai', expectedAns: 'AI analysis unavailable.', expectedVis: 'NONE' }
  ];

  console.log(`\n========================================================================`);
  console.log(`STARTING AUTOMATED VERIFICATION OF ${testCases.length} TEST CASES`);
  console.log(`========================================================================\n`);

  let passCount = 0;

  for (const t of testCases) {
    try {
      const res = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: 'text', content: t.question })
      });
      const json = await res.json();
      const d = json.data;

      const domainMatch = d.domain === t.domain;
      const visMatch = (d.visualization?.type || 'NONE') === t.expectedVis;
      const answerContains = d.finalAnswer.includes(t.expectedAns.replace(/²|³|π/g, '')) || d.finalAnswer.includes(t.expectedAns.split('=')[0]);

      const passed = domainMatch && visMatch;
      if (passed) passCount++;

      console.log(`TEST #${t.id}: "${t.question}"`);
      console.log(`  Source:       ${json.source} (${json.model})`);
      console.log(`  Domain:       ${d.domain} (Expected: ${t.domain}) -> ${domainMatch ? '✅' : '❌'}`);
      console.log(`  Problem Type: ${d.problemType}`);
      console.log(`  Vis Type:     ${d.visualization?.type || 'NONE'} (Expected: ${t.expectedVis}) -> ${visMatch ? '✅' : '❌'}`);
      console.log(`  Final Answer: ${d.finalAnswer}`);
      console.log(`  Voice Steps:  ${d.spokenSteps?.length || 0} spoken step(s) available`);
      console.log(`  Status:       ${passed ? 'PASS ✅' : 'FAIL ❌'}`);
      console.log(`------------------------------------------------------------------------`);
    } catch (err) {
      console.error(`TEST #${t.id} FAILED WITH ERROR:`, err.message);
    }
  }

  console.log(`\n========================================================================`);
  console.log(`VERIFICATION SUMMARY: ${passCount} / ${testCases.length} TESTS PASSED`);
  console.log(`========================================================================\n`);
}

runAllTests();
