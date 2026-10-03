/**
 * Benchmark JEE Mathematics Test Cases for VisualBoard AI
 * Covers Algebra, Trigonometry, Calculus, Coordinate Geometry, Vector Algebra, 3D Geometry, and Solid Geometry.
 */

export const SAMPLE_PROBLEMS = {
  quadratic_25: {
    id: 'quadratic_25',
    label: 'Demo: x² = 25',
    title: 'x² = 25',
    queryText: 'x^2 = 25',
    domain: 'ALGEBRA',
    category: 'Algebra & Quadratic Equations',
    concept: 'Quadratic Equation Roots & Parabola',
    latex: 'x^2 = 25',
    description: 'Solve x² = 25 and plot the parabola y = x² - 25 showing roots x = ±5 and vertex (0, -25).',
    handwritingStrokes: [
      // 'x'
      [ {x: 120, y: 165}, {x: 145, y: 200} ],
      [ {x: 145, y: 165}, {x: 120, y: 200} ],
      // superscript '2'
      [ {x: 155, y: 155}, {x: 170, y: 148}, {x: 175, y: 158}, {x: 158, y: 170}, {x: 178, y: 170} ],
      // '='
      [ {x: 195, y: 178}, {x: 220, y: 178} ],
      [ {x: 195, y: 188}, {x: 220, y: 188} ],
      // '2'
      [ {x: 240, y: 170}, {x: 255, y: 165}, {x: 260, y: 175}, {x: 242, y: 200}, {x: 265, y: 200} ],
      // '5'
      [ {x: 295, y: 168}, {x: 280, y: 168}, {x: 278, y: 182}, {x: 295, y: 185}, {x: 295, y: 198}, {x: 278, y: 200} ]
    ]
  },
  quadratic_36: {
    id: 'quadratic_36',
    label: 'Test: x² = 36',
    title: 'x² = 36',
    queryText: 'x^2 = 36',
    domain: 'ALGEBRA',
    category: 'Algebra & Quadratic Equations',
    concept: 'Quadratic Equation Roots & Parabola',
    latex: 'x^2 = 36',
    description: 'Solve x² = 36 and plot the parabola y = x² - 36 showing roots x = ±6 and vertex (0, -36).',
    handwritingStrokes: [
      // 'x'
      [ {x: 120, y: 165}, {x: 145, y: 200} ],
      [ {x: 145, y: 165}, {x: 120, y: 200} ],
      // superscript '2'
      [ {x: 155, y: 155}, {x: 170, y: 148}, {x: 175, y: 158}, {x: 158, y: 170}, {x: 178, y: 170} ],
      // '='
      [ {x: 195, y: 178}, {x: 220, y: 178} ],
      [ {x: 195, y: 188}, {x: 220, y: 188} ],
      // '3'
      [ {x: 240, y: 165}, {x: 265, y: 165}, {x: 255, y: 182}, {x: 270, y: 198}, {x: 245, y: 202} ],
      // '6'
      [ {x: 300, y: 165}, {x: 285, y: 180}, {x: 285, y: 200}, {x: 305, y: 200}, {x: 305, y: 185}, {x: 285, y: 185} ]
    ]
  },
  quadratic: {
    id: 'quadratic',
    label: '1. 3x² - 7x + 2 = 0',
    title: '3x² - 7x + 2 = 0',
    queryText: '3x^2 - 7x + 2 = 0',
    domain: 'ALGEBRA',
    category: 'Algebra & Quadratic Equations',
    concept: 'Quadratic Equation Roots & Parabola',
    latex: '3x^2 - 7x + 2 = 0',
    description: 'Solve 3x² - 7x + 2 = 0 and plot the corresponding parabola y = 3x² - 7x + 2 showing its real roots and vertex.',
    handwritingStrokes: [
      // '3'
      [ {x: 80, y: 155}, {x: 105, y: 155}, {x: 95, y: 175}, {x: 110, y: 195}, {x: 80, y: 200} ],
      // 'x'
      [ {x: 120, y: 165}, {x: 145, y: 200} ],
      [ {x: 145, y: 165}, {x: 120, y: 200} ],
      // superscript '2'
      [ {x: 155, y: 155}, {x: 170, y: 148}, {x: 175, y: 158}, {x: 158, y: 170}, {x: 178, y: 170} ],
      // '-'
      [ {x: 195, y: 182}, {x: 215, y: 182} ],
      // '7'
      [ {x: 228, y: 165}, {x: 250, y: 165}, {x: 235, y: 200} ],
      // 'x'
      [ {x: 260, y: 165}, {x: 285, y: 200} ],
      [ {x: 285, y: 165}, {x: 260, y: 200} ],
      // '+'
      [ {x: 300, y: 182}, {x: 320, y: 182} ],
      [ {x: 310, y: 172}, {x: 310, y: 192} ],
      // '2'
      [ {x: 335, y: 172}, {x: 350, y: 165}, {x: 355, y: 175}, {x: 338, y: 200}, {x: 358, y: 200} ],
      // '='
      [ {x: 375, y: 178}, {x: 395, y: 178} ],
      [ {x: 375, y: 188}, {x: 395, y: 188} ],
      // '0'
      [ {x: 415, y: 165}, {x: 430, y: 165}, {x: 430, y: 200}, {x: 415, y: 200}, {x: 415, y: 165} ]
    ]
  },

  trig: {
    id: 'trig',
    label: '2. y = 3sin(4x) + 2',
    title: 'y = 3sin(4x) + 2',
    queryText: 'y = 3sin(4x) + 2',
    domain: 'TRIGONOMETRY',
    category: 'Trigonometric Functions & Oscillations',
    concept: 'Harmonic Sinusoidal Wave Transformation',
    latex: 'y = 3\\sin(4x) + 2',
    description: 'Trigonometric sine wave with amplitude 3, angular frequency 4 rad/s, and vertical shift of 2 units.',
    handwritingStrokes: [
      // 'y'
      [ {x: 70, y: 165}, {x: 80, y: 190}, {x: 90, y: 205} ],
      [ {x: 100, y: 165}, {x: 88, y: 200}, {x: 75, y: 235} ],
      // '='
      [ {x: 115, y: 180}, {x: 140, y: 180} ],
      [ {x: 115, y: 192}, {x: 140, y: 192} ],
      // '3'
      [ {x: 155, y: 165}, {x: 175, y: 165}, {x: 165, y: 182}, {x: 180, y: 198}, {x: 155, y: 202} ],
      // 's'
      [ {x: 200, y: 172}, {x: 188, y: 176}, {x: 190, y: 186}, {x: 202, y: 193}, {x: 188, y: 202} ],
      // 'i'
      [ {x: 212, y: 175}, {x: 212, y: 202} ],
      [ {x: 212, y: 164}, {x: 212, y: 166} ],
      // 'n'
      [ {x: 225, y: 175}, {x: 225, y: 202} ],
      [ {x: 225, y: 182}, {x: 238, y: 175}, {x: 245, y: 188}, {x: 245, y: 202} ],
      // '('
      [ {x: 255, y: 160}, {x: 250, y: 185}, {x: 255, y: 212} ],
      // '4'
      [ {x: 275, y: 165}, {x: 265, y: 185}, {x: 285, y: 185} ],
      [ {x: 280, y: 165}, {x: 280, y: 202} ],
      // 'x'
      [ {x: 295, y: 175}, {x: 315, y: 202} ],
      [ {x: 315, y: 175}, {x: 295, y: 202} ],
      // ')'
      [ {x: 325, y: 160}, {x: 330, y: 185}, {x: 325, y: 212} ],
      // '+'
      [ {x: 345, y: 185}, {x: 365, y: 185} ],
      [ {x: 355, y: 175}, {x: 355, y: 195} ],
      // '2'
      [ {x: 380, y: 172}, {x: 395, y: 165}, {x: 400, y: 175}, {x: 382, y: 200}, {x: 402, y: 200} ]
    ]
  },

  calculus: {
    id: 'calculus',
    label: '3. Area: y = x² & y = 4',
    title: 'Find the area enclosed by y = x² and y = 4.',
    queryText: 'Find the area enclosed by y = x^2 and y = 4.',
    domain: 'CALCULUS',
    category: 'Calculus & Definite Integration',
    concept: 'Area Bounded by Two Curves',
    latex: '\\int_{-2}^{2} (4 - x^2) \\, dx = \\frac{32}{3}',
    description: 'Find the exact enclosed 2D area between the parabola y = x² and horizontal line y = 4.',
    handwritingStrokes: [
      // Parabola sketch
      [ {x: 100, y: 150}, {x: 130, y: 220}, {x: 160, y: 240}, {x: 190, y: 220}, {x: 220, y: 150} ],
      // Horizontal line y = 4
      [ {x: 80, y: 170}, {x: 240, y: 170} ],
      // Label "y = 4"
      [ {x: 250, y: 165}, {x: 290, y: 165} ],
      // Label "y = x^2"
      [ {x: 180, y: 255}, {x: 240, y: 255} ]
    ]
  },

  circle: {
    id: 'circle',
    label: '4. Circle: C(2,-1), r = 4',
    title: 'A circle has centre (2,-1) and radius 4.',
    queryText: 'A circle has centre (2,-1) and radius 4.',
    domain: 'COORDINATE_GEOMETRY',
    category: 'Coordinate Geometry & Conics',
    concept: 'Circle in Cartesian Plane',
    latex: '(x-2)^2 + (y+1)^2 = 16',
    description: 'Construct circle with center at (2, -1) and radius 4 in the Cartesian coordinate plane.',
    handwritingStrokes: [
      // Circle shape
      [
        {x: 200, y: 130}, {x: 245, y: 148}, {x: 265, y: 190}, {x: 245, y: 232},
        {x: 200, y: 250}, {x: 155, y: 232}, {x: 135, y: 190}, {x: 155, y: 148}, {x: 200, y: 130}
      ],
      // Center dot
      [ {x: 200, y: 190}, {x: 202, y: 190} ],
      // Radius line
      [ {x: 200, y: 190}, {x: 245, y: 148} ],
      // Text "C(2, -1)"
      [ {x: 175, y: 205}, {x: 225, y: 205} ],
      // Text "r = 4"
      [ {x: 225, y: 160}, {x: 260, y: 160} ]
    ]
  },

  vectors: {
    id: 'vectors',
    label: '5. Angle Between Vectors',
    title: 'Find the angle between the vectors a = 2i + 3j + k and b = i - j + 2k.',
    queryText: 'Find the angle between the vectors a = 2i + 3j + k and b = i - j + 2k.',
    domain: 'VECTOR_ALGEBRA',
    category: 'Vector Algebra & Dot Product',
    concept: 'Angle Between 3D Space Vectors',
    latex: '\\cos(\\theta) = \\frac{a \\cdot b}{|a||b|}',
    description: 'Compute scalar product and angle θ between vectors a = ⟨2, 3, 1⟩ and b = ⟨1, -1, 2⟩.',
    handwritingStrokes: [
      // Vector a arrow
      [ {x: 150, y: 220}, {x: 230, y: 150} ],
      [ {x: 220, y: 148}, {x: 230, y: 150}, {x: 228, y: 160} ],
      // Vector b arrow
      [ {x: 150, y: 220}, {x: 250, y: 240} ],
      [ {x: 240, y: 235}, {x: 250, y: 240}, {x: 242, y: 248} ],
      // Angle arc
      [ {x: 180, y: 195}, {x: 190, y: 215}, {x: 185, y: 228} ],
      // Label "θ"
      [ {x: 195, y: 210}, {x: 205, y: 210} ]
    ]
  },

  cube: {
    id: 'cube',
    label: '6. Cube: s = 6 cm Volume',
    title: 'A cube has side length 6 cm. Find its volume.',
    queryText: 'A cube has side length 6 cm. Find its volume.',
    domain: 'GEOMETRY',
    category: '3D Solid Geometry',
    concept: '3D Cube Volume & Surface Area',
    latex: 'V = s^3 = 6^3 = 216 \\text{ cm}^3',
    description: '3D regular cube of edge length s = 6 cm. Calculate volume and total surface area.',
    handwritingStrokes: [
      // Front square
      [ {x: 120, y: 140}, {x: 220, y: 140}, {x: 220, y: 240}, {x: 120, y: 240}, {x: 120, y: 140} ],
      // Back square
      [ {x: 170, y: 90}, {x: 270, y: 90}, {x: 270, y: 190}, {x: 170, y: 190}, {x: 170, y: 90} ],
      // Connecting edges
      [ {x: 120, y: 140}, {x: 170, y: 90} ],
      [ {x: 220, y: 140}, {x: 270, y: 90} ],
      [ {x: 220, y: 240}, {x: 270, y: 190} ],
      [ {x: 120, y: 240}, {x: 170, y: 190} ],
      // Label "s = 6 cm"
      [ {x: 130, y: 260}, {x: 210, y: 260} ]
    ]
  },

  cuboid: {
    id: 'cuboid',
    label: '7. Cuboid: 8 × 5 × 3 cm',
    title: 'A cuboid has length 8 cm, width 5 cm and height 3 cm. Find its volume.',
    queryText: 'A cuboid has length 8 cm, width 5 cm and height 3 cm. Find its volume.',
    domain: 'GEOMETRY',
    category: '3D Solid Geometry',
    concept: '3D Cuboid Volume & Surface Area',
    latex: 'V = l \\times w \\times h = 120 \\text{ cm}^3',
    description: '3D rectangular cuboid of dimensions 8 cm × 5 cm × 3 cm.',
    handwritingStrokes: [
      // Front rectangle (wide)
      [ {x: 100, y: 160}, {x: 260, y: 160}, {x: 260, y: 230}, {x: 100, y: 230}, {x: 100, y: 160} ],
      // Back rectangle
      [ {x: 140, y: 110}, {x: 300, y: 110}, {x: 300, y: 180}, {x: 140, y: 180}, {x: 140, y: 110} ],
      // Connecting edges
      [ {x: 100, y: 160}, {x: 140, y: 110} ],
      [ {x: 260, y: 160}, {x: 300, y: 110} ],
      [ {x: 260, y: 230}, {x: 300, y: 180} ],
      [ {x: 100, y: 230}, {x: 140, y: 180} ]
    ]
  },

  skewLines: {
    id: 'skewLines',
    label: '8. 3D Skew Lines Distance',
    title: 'The shortest distance between the lines (x-4)/1 = (y-3)/2 = (z-2)/-3 and (x+2)/2 = (y-6)/4 = (z-5)/-5 is:',
    queryText: 'The shortest distance between the lines (x-4)/1 = (y-3)/2 = (z-2)/-3 and (x+2)/2 = (y-6)/4 = (z-5)/-5 is:',
    domain: '3D_GEOMETRY',
    category: '3D Coordinate Geometry',
    concept: 'Shortest Distance Between Skew Lines in 3D',
    latex: 'd = \\frac{|(a_2 - a_1) \\cdot (b_1 \\times b_2)|}{|b_1 \\times b_2|} = 3\\sqrt{5}',
    description: 'Determine the shortest distance between two non-intersecting, non-parallel lines in 3D coordinate space.',
    handwritingStrokes: [
      // Line 1
      [ {x: 100, y: 120}, {x: 240, y: 220} ],
      // Line 2
      [ {x: 160, y: 260}, {x: 280, y: 130} ],
      // Common perpendicular segment
      [ {x: 180, y: 175}, {x: 220, y: 195} ],
      // Label "d = 3√5"
      [ {x: 230, y: 185}, {x: 290, y: 185} ]
    ]
  }
};
