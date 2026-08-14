import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const standards = [];

function addStandard(item) {
  const textBlob = `${item.code} ${item.alt_code || ''} ${item.subject} ${item.domain} ${item.anchor || ''} ${item.descriptor || ''} ${item.description || ''} ${item.assessment_limits || ''} ${(item.crosswalks || []).join(' ')} ${(item.keywords || []).join(' ')}`.toLowerCase();
  
  const rawWords = textBlob.match(/[a-z0-9\-\.]{3,}/g) || [];
  const uniqueKeywords = Array.from(new Set([...(item.keywords || []), ...rawWords.filter(w => !['the', 'and', 'for', 'with', 'that', 'from', 'this', 'into', 'each', 'such', 'than', 'have', 'more', 'less', 'will', 'been', 'their', 'when'].includes(w))]));

  standards.push({
    id: item.id || item.code,
    code: item.code,
    alt_code: item.alt_code || null,
    subject: item.subject,
    grade: String(item.grade),
    grade_band: ['K', '1', '2'].includes(String(item.grade)) ? 'Early Elementary (K-2)' :
                ['3', '4', '5'].includes(String(item.grade)) ? 'Upper Elementary (3-5)' :
                ['6', '7', '8'].includes(String(item.grade)) ? 'Middle School (6-8)' : 'High School (9-12)',
    domain: item.domain,
    cluster: item.cluster || null,
    anchor: item.anchor || null,
    descriptor: item.descriptor || null,
    description: item.description,
    assessment_limits: item.assessment_limits || null,
    reporting_category: item.reporting_category || null,
    dok: item.dok || 'DOK 2',
    is_pssa_assessed: item.is_pssa_assessed !== undefined ? item.is_pssa_assessed : (['3','4','5','6','7','8'].includes(String(item.grade))),
    is_keystone: item.is_keystone || false,
    crosswalks: item.crosswalks || [],
    prerequisites: item.prerequisites || [],
    next_steps: item.next_steps || [],
    keywords: uniqueKeywords.slice(0, 35)
  });
}

console.log('Generating comprehensive PA Core & PSSA standards dataset...');

// ═══════════════════════════════════════════════════════════════════════
// 1. MATHEMATICS (K - 12)
// ═══════════════════════════════════════════════════════════════════════

// --- KINDERGARTEN MATH ---
addStandard({
  code: 'CC.2.1.K.A.1',
  subject: 'Mathematics',
  grade: 'K',
  domain: 'Counting & Cardinality',
  anchor: 'Know number names and the count sequence.',
  description: 'Count to 100 by ones and by tens. Count forward beginning from a given number within the known sequence.',
  dok: 'DOK 1',
  crosswalks: ['K.CC.A.1', 'K.CC.A.2'],
  next_steps: ['CC.2.1.1.B.1'],
  keywords: ['counting', 'sequence', 'ones', 'tens', 'hundreds chart', 'cardinality']
});

addStandard({
  code: 'CC.2.1.K.A.2',
  subject: 'Mathematics',
  grade: 'K',
  domain: 'Counting & Cardinality',
  anchor: 'Count to tell the number of objects.',
  description: 'Write numbers from 0 to 20. Represent a number of objects with a written numeral 0-20. Understand the relationship between numbers and quantities; connect counting to cardinality.',
  dok: 'DOK 1-2',
  crosswalks: ['K.CC.A.3', 'K.CC.B.4'],
  next_steps: ['CC.2.1.1.B.1'],
  keywords: ['numeral writing', 'one-to-one correspondence', 'cardinality', 'counting objects']
});

addStandard({
  code: 'CC.2.1.K.A.3',
  subject: 'Mathematics',
  grade: 'K',
  domain: 'Counting & Cardinality',
  anchor: 'Compare numbers.',
  description: 'Identify whether the number of objects in one group is greater than, less than, or equal to the number of objects in another group. Compare two numbers between 1 and 10 presented as written numerals.',
  dok: 'DOK 2',
  crosswalks: ['K.CC.C.6', 'K.CC.C.7'],
  next_steps: ['CC.2.1.1.B.2'],
  keywords: ['compare', 'greater than', 'less than', 'equal', 'quantity comparison']
});

addStandard({
  code: 'CC.2.2.K.A.1',
  subject: 'Mathematics',
  grade: 'K',
  domain: 'Operations & Algebraic Thinking',
  anchor: 'Understand addition as putting together and subtraction as taking apart.',
  description: 'Represent addition and subtraction with objects, fingers, mental images, drawings, sounds, acting out situations, verbal explanations, expressions, or equations. Solve addition and subtraction word problems within 10.',
  dok: 'DOK 2',
  crosswalks: ['K.OA.A.1', 'K.OA.A.2'],
  next_steps: ['CC.2.2.1.A.1'],
  keywords: ['addition', 'subtraction', 'word problems', 'part-part-whole', 'ten frames']
});

addStandard({
  code: 'CC.2.3.K.A.1',
  subject: 'Mathematics',
  grade: 'K',
  domain: 'Geometry',
  anchor: 'Identify and describe shapes.',
  description: 'Describe objects in the environment using names of shapes (squares, circles, triangles, rectangles, hexagons, cubes, cones, cylinders, spheres). Correctly name shapes regardless of orientation or overall size.',
  dok: 'DOK 1',
  crosswalks: ['K.G.A.1', 'K.G.A.2'],
  next_steps: ['CC.2.3.1.A.1'],
  keywords: ['2D shapes', '3D shapes', 'circle', 'square', 'triangle', 'cube', 'sphere']
});

addStandard({
  code: 'CC.2.4.K.A.1',
  subject: 'Mathematics',
  grade: 'K',
  domain: 'Measurement & Data',
  anchor: 'Describe and compare measurable attributes.',
  description: 'Describe measurable attributes of objects, such as length or weight. Directly compare two objects with a measurable attribute in common to see which object has "more of" / "less of" the attribute.',
  dok: 'DOK 1-2',
  crosswalks: ['K.MD.A.1', 'K.MD.A.2'],
  next_steps: ['CC.2.4.1.A.1'],
  keywords: ['length', 'weight', 'measurement', 'longer', 'shorter', 'heavier', 'lighter']
});

// --- GRADE 1 MATH ---
addStandard({
  code: 'CC.2.1.1.B.1',
  subject: 'Mathematics',
  grade: '1',
  domain: 'Numbers & Operations in Base Ten',
  anchor: 'Extend the counting sequence.',
  description: 'Count to 120, starting at any number less than 120. In this range, read and write numerals and represent a number of objects with a written numeral.',
  dok: 'DOK 1',
  crosswalks: ['1.NBT.A.1'],
  prerequisites: ['CC.2.1.K.A.1'],
  next_steps: ['CC.2.1.2.B.1'],
  keywords: ['count to 120', 'base ten', 'numeral reading', 'number chart']
});

addStandard({
  code: 'CC.2.1.1.B.2',
  subject: 'Mathematics',
  grade: '1',
  domain: 'Numbers & Operations in Base Ten',
  anchor: 'Understand place value.',
  description: 'Understand that the two digits of a two-digit number represent amounts of tens and ones. Compare two two-digit numbers based on meanings of the tens and ones digits, using >, =, and < symbols.',
  dok: 'DOK 2',
  crosswalks: ['1.NBT.B.2', '1.NBT.B.3'],
  prerequisites: ['CC.2.1.K.A.3'],
  next_steps: ['CC.2.1.2.B.2'],
  keywords: ['place value', 'tens and ones', 'comparison symbols', 'two-digit numbers']
});

addStandard({
  code: 'CC.2.2.1.A.1',
  subject: 'Mathematics',
  grade: '1',
  domain: 'Operations & Algebraic Thinking',
  anchor: 'Represent and solve problems involving addition and subtraction within 20.',
  description: 'Use addition and subtraction within 20 to solve word problems involving situations of adding to, taking from, putting together, taking apart, and comparing, with unknowns in all positions.',
  dok: 'DOK 2',
  crosswalks: ['1.OA.A.1'],
  prerequisites: ['CC.2.2.K.A.1'],
  next_steps: ['CC.2.2.2.A.1'],
  keywords: ['addition within 20', 'subtraction within 20', 'word problems', 'unknowns', 'missing addend']
});

addStandard({
  code: 'CC.2.3.1.A.2',
  subject: 'Mathematics',
  grade: '1',
  domain: 'Geometry & Fractions Foundation',
  anchor: 'Reason with shapes and their attributes.',
  description: 'Partition circles and rectangles into two and four equal shares, describe the shares using the words halves, fourths, and quarters, and use the phrases half of, fourth of, and quarter of.',
  dok: 'DOK 2',
  crosswalks: ['1.G.A.3'],
  next_steps: ['CC.2.3.2.A.2', 'CC.2.1.3.C.1'],
  keywords: ['halves', 'fourths', 'quarters', 'equal shares', 'fraction foundation', 'partitioning']
});

addStandard({
  code: 'CC.2.4.1.A.2',
  subject: 'Mathematics',
  grade: '1',
  domain: 'Measurement & Data: Time & Money',
  anchor: 'Tell and write time and represent data.',
  description: 'Tell and write time in hours and half-hours using analog and digital clocks. Organize, represent, and interpret data with up to three categories.',
  dok: 'DOK 1-2',
  crosswalks: ['1.MD.B.3', '1.MD.C.4'],
  prerequisites: ['CC.2.4.K.A.1'],
  next_steps: ['CC.2.4.2.A.2'],
  keywords: ['analog clock', 'digital clock', 'half-hour', 'tally chart', 'bar graph']
});

// --- GRADE 2 MATH ---
addStandard({
  code: 'CC.2.1.2.B.1',
  subject: 'Mathematics',
  grade: '2',
  domain: 'Numbers & Operations in Base Ten',
  anchor: 'Understand place value up to 1000.',
  description: 'Understand that the three digits of a three-digit number represent amounts of hundreds, tens, and ones. Count within 1000; skip-count by 5s, 10s, and 100s. Read and write numbers to 1000 using base-ten numerals, number names, and expanded form.',
  dok: 'DOK 1-2',
  crosswalks: ['2.NBT.A.1', '2.NBT.A.2', '2.NBT.A.3'],
  prerequisites: ['CC.2.1.1.B.2'],
  next_steps: ['CC.2.1.3.B.1'],
  keywords: ['hundreds', 'tens', 'ones', 'skip counting', 'expanded form', 'base ten']
});

addStandard({
  code: 'CC.2.1.2.B.3',
  subject: 'Mathematics',
  grade: '2',
  domain: 'Numbers & Operations in Base Ten',
  anchor: 'Use place value understanding and properties of operations to add and subtract.',
  description: 'Fluently add and subtract within 100 using strategies based on place value, properties of operations, and/or the relationship between addition and subtraction. Add up to four two-digit numbers.',
  dok: 'DOK 2',
  crosswalks: ['2.NBT.B.5', '2.NBT.B.6'],
  prerequisites: ['CC.2.2.1.A.1'],
  next_steps: ['CC.2.1.3.B.1'],
  keywords: ['fluent addition', 'fluent subtraction', 'regrouping', 'place value strategies']
});

addStandard({
  code: 'CC.2.3.2.A.2',
  subject: 'Mathematics',
  grade: '2',
  domain: 'Geometry & Fractions Foundation',
  anchor: 'Partition shapes into equal shares.',
  description: 'Partition circles and rectangles into two, three, or four equal shares, describe the shares using the words halves, thirds, half of, a third of, etc., and recognize that equal shares of identical wholes need not have the same shape.',
  dok: 'DOK 2',
  crosswalks: ['2.G.A.3'],
  prerequisites: ['CC.2.3.1.A.2'],
  next_steps: ['M03.A-N.1.1.1', 'CC.2.1.3.C.1'],
  keywords: ['thirds', 'halves', 'fourths', 'equal areas', 'fractions progression']
});

addStandard({
  code: 'CC.2.4.2.A.3',
  subject: 'Mathematics',
  grade: '2',
  domain: 'Measurement & Data: Money',
  anchor: 'Solve problems involving money.',
  description: 'Solve word problems involving dollar bills, quarters, dimes, nickels, and pennies, using $ and ¢ symbols appropriately (e.g., if you have 2 dimes and 3 pennies, how many cents do you have?).',
  dok: 'DOK 2',
  crosswalks: ['2.MD.C.8'],
  prerequisites: ['CC.2.1.1.B.2'],
  next_steps: ['CC.2.4.3.A.1'],
  keywords: ['coins', 'dollar bills', 'quarters', 'dimes', 'nickels', 'pennies', 'money word problems']
});

// --- GRADE 3 PSSA MATH ---
addStandard({
  code: 'M03.A-N.1.1.1',
  alt_code: 'CC.2.1.3.C.1',
  subject: 'Mathematics',
  grade: '3',
  domain: 'Numbers & Operations - Fractions',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M03.A-N.1 - Explore and develop an understanding of fractions as numbers.',
  descriptor: 'M03.A-N.1.1 - Represent fractions on a number line.',
  description: 'Demonstrate that when a whole or set is partitioned into y equal parts, the fraction 1/y represents 1 part of the whole and/or the fraction x/y represents x parts of the whole (limit denominators to 2, 3, 4, 6, and 8; limit numerators to whole numbers less than or equal to the denominator).',
  assessment_limits: 'Denominators limited to 2, 3, 4, 6, 8. Numerators <= denominator.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.1.3.C.1', '3.NF.A.1'],
  prerequisites: ['CC.2.3.2.A.2'],
  next_steps: ['M04.A-F.1.1.1', 'CC.2.1.4.C.1'],
  keywords: ['unit fraction', 'numerator', 'denominator', 'equal parts', 'partitioning', 'fraction models']
});

addStandard({
  code: 'M03.A-N.1.1.2',
  alt_code: 'CC.2.1.3.C.1',
  subject: 'Mathematics',
  grade: '3',
  domain: 'Numbers & Operations - Fractions',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M03.A-N.1 - Explore and develop an understanding of fractions as numbers.',
  descriptor: 'M03.A-N.1.1 - Represent fractions on a number line.',
  description: 'Represent fractions on a number line (limit denominators to 2, 3, 4, 6, and 8; limit numerators to whole numbers less than or equal to the denominator).',
  assessment_limits: 'Denominators limited to 2, 3, 4, 6, 8.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.1.3.C.1', '3.NF.A.2'],
  prerequisites: ['M03.A-N.1.1.1'],
  next_steps: ['M04.A-F.1.1.1'],
  keywords: ['number line', 'fraction representation', 'intervals', 'partitioning line']
});

addStandard({
  code: 'M03.A-N.1.1.3',
  alt_code: 'CC.2.1.3.C.1',
  subject: 'Mathematics',
  grade: '3',
  domain: 'Numbers & Operations - Fractions',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M03.A-N.1 - Explore and develop an understanding of fractions as numbers.',
  descriptor: 'M03.A-N.1.1 - Compare and find equivalent fractions.',
  description: 'Recognize and generate simple equivalent fractions (e.g., 1/2 = 2/4, 4/6 = 2/3). Explain why fractions are equivalent with visual fraction models.',
  assessment_limits: 'Denominators limited to 2, 3, 4, 6, 8.',
  dok: 'DOK 2-3',
  crosswalks: ['CC.2.1.3.C.1', '3.NF.A.3'],
  prerequisites: ['M03.A-N.1.1.2'],
  next_steps: ['M04.A-F.1.1.1', 'CC.2.1.4.C.1'],
  keywords: ['equivalent fractions', 'fraction comparison', 'visual models', 'same size wholes']
});

addStandard({
  code: 'M03.A-T.1.1.1',
  alt_code: 'CC.2.1.3.B.1',
  subject: 'Mathematics',
  grade: '3',
  domain: 'Numbers & Operations in Base Ten',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M03.A-T.1 - Use place-value understanding and properties of operations to perform arithmetic.',
  descriptor: 'M03.A-T.1.1 - Apply place-value strategies to add and subtract.',
  description: 'Round two- and three-digit whole numbers to the nearest ten or hundred. Add and subtract two- and three-digit whole numbers (limit sums and subtrahends up to 1,000). Multiply one-digit whole numbers by two-digit multiples of 10 (e.g., 9 × 80).',
  assessment_limits: 'Sums and differences up to 1,000. Multiples of 10 in range 10-90.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.1.3.B.1', '3.NBT.A.1', '3.NBT.A.2', '3.NBT.A.3'],
  prerequisites: ['CC.2.1.2.B.3'],
  next_steps: ['M04.A-N.1.1.1'],
  keywords: ['rounding', 'place value', 'addition within 1000', 'subtraction within 1000', 'multiples of 10']
});

addStandard({
  code: 'M03.B-O.1.1.1',
  alt_code: 'CC.2.2.3.A.1',
  subject: 'Mathematics',
  grade: '3',
  domain: 'Operations & Algebraic Thinking',
  reporting_category: 'Reporting Category B - Algebraic Concepts',
  anchor: 'M03.B-O.1 - Represent and solve problems involving multiplication and division.',
  descriptor: 'M03.B-O.1.1 - Apply multiplication and division concepts.',
  description: 'Interpret products of whole numbers (e.g., interpret 5 × 7 as the total number of objects in 5 groups of 7 objects each) and quotients (e.g., interpret 56 / 8 as the number of objects in each share when 56 objects are partitioned equally into 8 shares).',
  assessment_limits: 'Multiplication facts within 100.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.2.3.A.1', '3.OA.A.1', '3.OA.A.2'],
  prerequisites: ['CC.2.2.2.A.1'],
  next_steps: ['M04.B-O.1.1.1', 'CC.2.2.4.A.1'],
  keywords: ['multiplication', 'division', 'equal groups', 'arrays', 'repeated addition', 'fair sharing']
});

addStandard({
  code: 'M03.B-O.1.2.1',
  alt_code: 'CC.2.2.3.A.1',
  subject: 'Mathematics',
  grade: '3',
  domain: 'Operations & Algebraic Thinking',
  reporting_category: 'Reporting Category B - Algebraic Concepts',
  anchor: 'M03.B-O.1 - Represent and solve problems involving multiplication and division.',
  descriptor: 'M03.B-O.1.2 - Solve two-step word problems.',
  description: 'Solve two-step word problems using the four operations (addition, subtraction, multiplication, division). Represent these problems using equations with a symbol standing for the unknown quantity.',
  dok: 'DOK 3',
  crosswalks: ['CC.2.2.3.A.1', '3.OA.D.8'],
  prerequisites: ['CC.2.2.2.A.1'],
  next_steps: ['M04.B-O.1.1.2'],
  keywords: ['two-step problems', 'equations', 'unknown variable', 'four operations', 'order of operations']
});

addStandard({
  code: 'M03.C-G.1.1.1',
  alt_code: 'CC.2.3.3.A.1',
  subject: 'Mathematics',
  grade: '3',
  domain: 'Geometry',
  reporting_category: 'Reporting Category C - Geometry',
  anchor: 'M03.C-G.1 - Reason with shapes and their attributes.',
  descriptor: 'M03.C-G.1.1 - Analyze characteristics of polygons.',
  description: 'Explain that shapes in different categories may share attributes (e.g., having four sides) and that the shared attributes can define a larger category (e.g., quadrilaterals). Recognize rhombuses, rectangles, and squares as examples of quadrilaterals.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.3.3.A.1', '3.G.A.1'],
  prerequisites: ['CC.2.3.2.A.1'],
  next_steps: ['M04.C-G.1.1.1'],
  keywords: ['quadrilateral', 'rhombus', 'rectangle', 'square', 'parallelogram', 'attributes']
});

addStandard({
  code: 'M03.D-M.1.1.1',
  alt_code: 'CC.2.4.3.A.1',
  subject: 'Mathematics',
  grade: '3',
  domain: 'Measurement & Data: Time & Liquid Volume',
  reporting_category: 'Reporting Category D - Measurement, Data, and Probability',
  anchor: 'M03.D-M.1 - Solve problems involving measurement and estimation of intervals of time, liquid volumes, and masses of objects.',
  descriptor: 'M03.D-M.1.1 - Determine elapsed time and measure liquid volume.',
  description: 'Tell, show, and write time to the nearest minute. Calculate elapsed time to the minute in a given situation (total elapsed time limited to 60 minutes or less). Measure and estimate liquid volumes and masses of objects using grams (g), kilograms (kg), and liters (l).',
  assessment_limits: 'Elapsed time limited to 60 minutes. Metric units: g, kg, l.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.4.3.A.1', '3.MD.A.1', '3.MD.A.2'],
  prerequisites: ['CC.2.4.2.A.2'],
  next_steps: ['M04.D-M.1.1.1'],
  keywords: ['elapsed time', 'nearest minute', 'grams', 'kilograms', 'liters', 'liquid volume', 'mass']
});

addStandard({
  code: 'M03.D-M.3.1.1',
  alt_code: 'CC.2.4.3.A.5',
  subject: 'Mathematics',
  grade: '3',
  domain: 'Measurement & Data: Area & Perimeter',
  reporting_category: 'Reporting Category D - Measurement, Data, and Probability',
  anchor: 'M03.D-M.3 - Geometric measurement: understand concepts of area and relate area to multiplication and to addition.',
  descriptor: 'M03.D-M.3.1 - Find the area of rectangles.',
  description: 'Measure area by counting unit squares (square cm, square m, square in., square ft, and non-standard square units). Relate area to the operations of multiplication and addition (Area = length × width).',
  dok: 'DOK 2',
  crosswalks: ['CC.2.4.3.A.5', '3.MD.C.5', '3.MD.C.6', '3.MD.C.7'],
  prerequisites: ['CC.2.3.2.A.2'],
  next_steps: ['M04.D-M.1.1.3'],
  keywords: ['area', 'unit squares', 'length times width', 'tiling', 'rectangles', 'square units']
});

// --- GRADE 4 PSSA MATH ---
addStandard({
  code: 'M04.A-N.1.1.1',
  alt_code: 'CC.2.1.4.B.1',
  subject: 'Mathematics',
  grade: '4',
  domain: 'Numbers & Operations in Base Ten',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M04.A-N.1 - Generalize place-value understanding for multi-digit whole numbers.',
  descriptor: 'M04.A-N.1.1 - Apply place-value concepts to multi-digit numbers.',
  description: 'Recognize that in a multi-digit whole number (up to 1,000,000), a digit in one place represents ten times what it represents in the place to its right. Read and write multi-digit whole numbers using base-ten numerals, number names, and expanded form. Round multi-digit whole numbers to any place (up to 1,000,000).',
  assessment_limits: 'Whole numbers up to 1,000,000.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.1.4.B.1', '4.NBT.A.1', '4.NBT.A.2', '4.NBT.A.3'],
  prerequisites: ['M03.A-T.1.1.1'],
  next_steps: ['M05.A-T.1.1.1'],
  keywords: ['place value', '10 times larger', 'expanded form', 'rounding', 'multi-digit numbers', 'millions']
});

addStandard({
  code: 'M04.A-F.1.1.1',
  alt_code: 'CC.2.1.4.C.1',
  subject: 'Mathematics',
  grade: '4',
  domain: 'Numbers & Operations - Fractions',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M04.A-F.1 - Extend understanding of fraction equivalence and ordering.',
  descriptor: 'M04.A-F.1.1 - Generate and explain fraction equivalence and compare fractions.',
  description: 'Recognize and generate equivalent fractions (limit denominators to 2, 3, 4, 5, 6, 8, 10, 12, and 100). Explain why fraction a/b is equivalent to (n*a)/(n*b) by using visual fraction models.',
  assessment_limits: 'Denominators limited to 2, 3, 4, 5, 6, 8, 10, 12, 100.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.1.4.C.1', '4.NF.A.1'],
  prerequisites: ['M03.A-N.1.1.3'],
  next_steps: ['M05.A-F.1.1.1', 'CC.2.1.5.C.1'],
  keywords: ['equivalent fractions', 'common denominators', 'fraction models', 'benchmark fractions']
});

addStandard({
  code: 'M04.A-F.2.1.1',
  alt_code: 'CC.2.1.4.C.2',
  subject: 'Mathematics',
  grade: '4',
  domain: 'Numbers & Operations - Fractions',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M04.A-F.2 - Build fractions from unit fractions.',
  descriptor: 'M04.A-F.2.1 - Add and subtract fractions with like denominators.',
  description: 'Add and subtract fractions with a common (like) denominator (denominators 2, 3, 4, 5, 6, 8, 10, 12, 100; answers do not need to be simplified; no improper fractions as answers required unless mixed numbers). Decompose a fraction into a sum of fractions with the same denominator in more than one way.',
  assessment_limits: 'Like denominators only. Denominators: 2, 3, 4, 5, 6, 8, 10, 12, 100.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.1.4.C.2', '4.NF.B.3'],
  prerequisites: ['M04.A-F.1.1.1'],
  next_steps: ['M05.A-F.1.1.1'],
  keywords: ['fraction addition', 'fraction subtraction', 'like denominators', 'decomposing fractions', 'mixed numbers']
});

addStandard({
  code: 'M04.A-F.3.1.1',
  alt_code: 'CC.2.1.4.C.3',
  subject: 'Mathematics',
  grade: '4',
  domain: 'Numbers & Operations - Fractions & Decimals',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M04.A-F.3 - Understand decimal notation for fractions and compare decimal fractions.',
  descriptor: 'M04.A-F.3.1 - Relate fractions and decimals.',
  description: 'Use decimal notation for fractions with denominators 10 or 100. (e.g., rewrite 0.62 as 62/100; describe a length as 0.62 meters; locate 0.62 on a number line). Compare two decimals to hundredths by reasoning about their size.',
  assessment_limits: 'Decimals limited to tenths and hundredths.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.1.4.C.3', '4.NF.C.6', '4.NF.C.7'],
  prerequisites: ['M04.A-F.1.1.1'],
  next_steps: ['M05.A-T.1.1.1', 'CC.2.1.5.B.1'],
  keywords: ['decimals', 'tenths', 'hundredths', 'decimal comparison', 'money math', 'decimal number line']
});

addStandard({
  code: 'M04.C-G.1.1.1',
  alt_code: 'CC.2.3.4.A.1',
  subject: 'Mathematics',
  grade: '4',
  domain: 'Geometry: Lines & Angles',
  reporting_category: 'Reporting Category C - Geometry',
  anchor: 'M04.C-G.1 - Draw and identify lines and angles, and classify shapes by properties of their lines and angles.',
  descriptor: 'M04.C-G.1.1 - Identify lines, rays, angles, and symmetry.',
  description: 'Draw points, lines, line segments, rays, angles (right, acute, obtuse), and perpendicular and parallel lines. Identify these in two-dimensional figures. Recognize a line of symmetry for a two-dimensional figure.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.3.4.A.1', '4.G.A.1', '4.G.A.3'],
  prerequisites: ['M03.C-G.1.1.1'],
  next_steps: ['M05.C-G.1.1.1'],
  keywords: ['lines', 'rays', 'acute angle', 'obtuse angle', 'right angle', 'parallel lines', 'perpendicular lines', 'symmetry']
});

// --- GRADE 5 PSSA MATH ---
addStandard({
  code: 'M05.A-T.1.1.1',
  alt_code: 'CC.2.1.5.B.1',
  subject: 'Mathematics',
  grade: '5',
  domain: 'Numbers & Operations in Base Ten',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M05.A-T.1 - Understand the place-value system.',
  descriptor: 'M05.A-T.1.1 - Compare, round, and operate with multi-digit decimals.',
  description: 'Demonstrate that in a multi-digit number, a digit in one place represents 10 times as much as it represents in the place to its right and 1/10 of what it represents in the place to its left. Read, write, and compare decimals to thousandths. Round decimals to any place (tenths, hundredths, thousandths).',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.1.5.B.1', '5.NBT.A.1', '5.NBT.A.3', '5.NBT.A.4'],
  prerequisites: ['M04.A-N.1.1.1', 'M04.A-F.3.1.1'],
  next_steps: ['M06.A-N.2.1.1'],
  keywords: ['thousandths', 'decimal place value', '1/10 value', 'rounding decimals', 'expanded decimal form']
});

addStandard({
  code: 'M05.A-F.1.1.1',
  alt_code: 'CC.2.1.5.C.1',
  subject: 'Mathematics',
  grade: '5',
  domain: 'Numbers & Operations - Fractions',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M05.A-F.1 - Use equivalent fractions as a strategy to add and subtract fractions.',
  descriptor: 'M05.A-F.1.1 - Add and subtract fractions with unlike denominators.',
  description: 'Add and subtract fractions (including mixed numbers) with unlike denominators (denominators up to 12) using equivalent fractions with common denominators. Solve word problems involving addition and subtraction of fractions.',
  assessment_limits: 'Denominators up to 12.',
  dok: 'DOK 2-3',
  crosswalks: ['CC.2.1.5.C.1', '5.NF.A.1', '5.NF.A.2'],
  prerequisites: ['M04.A-F.2.1.1'],
  next_steps: ['M06.A-N.1.1.1', 'CC.2.1.6.E.1'],
  keywords: ['unlike denominators', 'least common multiple', 'fraction addition', 'fraction subtraction', 'mixed numbers']
});

addStandard({
  code: 'M05.A-F.2.1.1',
  alt_code: 'CC.2.1.5.C.2',
  subject: 'Mathematics',
  grade: '5',
  domain: 'Numbers & Operations - Fractions',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M05.A-F.2 - Apply and extend previous understandings of multiplication and division to multiply and divide fractions.',
  descriptor: 'M05.A-F.2.1 - Multiply fractions and whole numbers.',
  description: 'Multiply a fraction (including mixed numbers) by a fraction or whole number (e.g., 2/3 * 4/5 = 8/15; visual models including area models). Interpret multiplication as scaling (resizing).',
  assessment_limits: 'Visual area models and computation. Denominators up to 12.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.1.5.C.2', '5.NF.B.4', '5.NF.B.5'],
  prerequisites: ['M04.A-F.2.1.1'],
  next_steps: ['M06.A-N.1.1.1', 'CC.2.1.6.E.1'],
  keywords: ['fraction multiplication', 'area models', 'scaling', 'cross-cancelling', 'product of fractions']
});

addStandard({
  code: 'M05.A-F.2.1.2',
  alt_code: 'CC.2.1.5.C.2',
  subject: 'Mathematics',
  grade: '5',
  domain: 'Numbers & Operations - Fractions',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M05.A-F.2 - Apply and extend previous understandings of multiplication and division to multiply and divide fractions.',
  descriptor: 'M05.A-F.2.1 - Divide unit fractions and whole numbers.',
  description: 'Divide unit fractions by whole numbers and whole numbers by unit fractions (e.g., 1/3 divided by 4 = 1/12; 4 divided by 1/5 = 20). Solve real-world problems involving division of unit fractions.',
  assessment_limits: 'Division limited to unit fractions and whole numbers (no fraction by fraction yet).',
  dok: 'DOK 2',
  crosswalks: ['CC.2.1.5.C.2', '5.NF.B.7'],
  prerequisites: ['M05.A-F.2.1.1'],
  next_steps: ['M06.A-N.1.1.1', 'CC.2.1.6.E.1'],
  keywords: ['unit fraction division', 'reciprocals', 'fraction division models', 'sharing problems']
});

addStandard({
  code: 'M05.C-G.1.1.1',
  alt_code: 'CC.2.3.5.A.1',
  subject: 'Mathematics',
  grade: '5',
  domain: 'Geometry & Coordinate Grid',
  reporting_category: 'Reporting Category C - Geometry',
  anchor: 'M05.C-G.1 - Graph points on the coordinate plane to solve real-world and mathematical problems.',
  descriptor: 'M05.C-G.1.1 - Graph and interpret points in Quadrant I.',
  description: 'Identify parts of the coordinate plane (x-axis, y-axis, origin (0,0)). Graph points in the first quadrant of the coordinate plane and interpret coordinate values of points in the context of the situation.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.3.5.A.1', '5.G.A.1', '5.G.A.2'],
  prerequisites: ['CC.2.3.4.A.1'],
  next_steps: ['M06.C-G.1.1.1', 'M06.A-N.3.1.1'],
  keywords: ['coordinate plane', 'x-axis', 'y-axis', 'origin', 'ordered pairs', 'quadrant I']
});

// --- GRADE 6 PSSA MATH ---
addStandard({
  code: 'M06.A-N.1.1.1',
  alt_code: 'CC.2.1.6.E.1',
  subject: 'Mathematics',
  grade: '6',
  domain: 'The Number System',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M06.A-N.1 - Apply and extend previous understandings of multiplication and division to divide fractions by fractions.',
  descriptor: 'M06.A-N.1.1 - Solve problems involving division of fractions.',
  description: 'Interpret and compute quotients of fractions (including mixed numbers), and solve word problems involving the division of fractions by fractions (e.g., by using visual fraction models and equations to represent the problem).',
  assessment_limits: 'Includes proper fractions, improper fractions, and mixed numbers.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.1.6.E.1', '6.NS.A.1'],
  prerequisites: ['M05.A-F.2.1.2'],
  next_steps: ['M07.A-N.1.1.1', 'CC.2.1.7.E.1'],
  keywords: ['fraction division', 'reciprocal', 'invert and multiply', 'quotients of fractions', 'rational arithmetic']
});

addStandard({
  code: 'M06.A-R.1.1.1',
  alt_code: 'CC.2.1.6.D.1',
  subject: 'Mathematics',
  grade: '6',
  domain: 'Ratios & Proportional Relationships',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M06.A-R.1 - Understand ratio concepts and use ratio reasoning to solve problems.',
  descriptor: 'M06.A-R.1.1 - Represent and use ratios and unit rates.',
  description: 'Use ratio language and notation (a:b, a/b, a to b) to describe a ratio relationship between two quantities. Determine the unit rate associated with a ratio (e.g., if a recipe has a ratio of 3 cups of flour to 4 cups of sugar, unit rate is 3/4 cup of flour per cup of sugar).',
  assessment_limits: 'Whole number comparisons and simple unit rates.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.1.6.D.1', '6.RP.A.1', '6.RP.A.2'],
  prerequisites: ['M05.A-F.2.1.1'],
  next_steps: ['M07.A-R.1.1.1', 'CC.2.1.7.D.1'],
  keywords: ['ratio', 'unit rate', 'part-to-part', 'part-to-whole', 'ratio table', 'rate reasoning']
});

addStandard({
  code: 'M06.B-E.1.1.1',
  alt_code: 'CC.2.2.6.B.1',
  subject: 'Mathematics',
  grade: '6',
  domain: 'Expressions & Equations',
  reporting_category: 'Reporting Category B - Algebraic Concepts',
  anchor: 'M06.B-E.1 - Apply and extend previous understandings of arithmetic to algebraic expressions.',
  descriptor: 'M06.B-E.1.1 - Identify, write, and evaluate numerical and algebraic expressions.',
  description: 'Write and evaluate numerical expressions involving whole-number exponents (e.g., 3^4 = 81). Write algebraic expressions that record operations with numbers and letters standing for numbers.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.2.6.B.1', '6.EE.A.1', '6.EE.A.2'],
  prerequisites: ['M05.B-O.1.1.1'],
  next_steps: ['M07.B-E.1.1.1', 'CC.2.2.7.B.1'],
  keywords: ['exponents', 'algebraic expressions', 'variables', 'evaluate expressions', 'substitution']
});

addStandard({
  code: 'M06.D-S.1.1.1',
  alt_code: 'CC.2.4.6.B.1',
  subject: 'Mathematics',
  grade: '6',
  domain: 'Statistics & Probability',
  reporting_category: 'Reporting Category E - Statistics and Data',
  anchor: 'M06.D-S.1 - Demonstrate an understanding of statistical variability.',
  descriptor: 'M06.D-S.1.1 - Display and summarize numerical data distributions.',
  description: 'Display numerical data in plots on a number line, including line plots (dot plots), histograms, and box-and-whisker plots. Calculate and interpret measures of center (mean, median, mode) and variability (interquartile range, mean absolute deviation).',
  dok: 'DOK 2-3',
  crosswalks: ['CC.2.4.6.B.1', '6.SP.B.4', '6.SP.B.5'],
  prerequisites: ['M05.D-M.1.1.1'],
  next_steps: ['M07.D-S.1.1.1'],
  keywords: ['mean', 'median', 'mode', 'IQR', 'box and whisker', 'histogram', 'dot plot', 'mean absolute deviation']
});

// --- GRADE 7 PSSA MATH ---
addStandard({
  code: 'M07.A-N.1.1.1',
  alt_code: 'CC.2.1.7.E.1',
  subject: 'Mathematics',
  grade: '7',
  domain: 'The Number System',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M07.A-N.1 - Apply and extend previous understandings of operations with fractions to operations with rational numbers.',
  descriptor: 'M07.A-N.1.1 - Add, subtract, multiply, and divide rational numbers.',
  description: 'Apply properties of operations as strategies to add, subtract, multiply, and divide rational numbers (integers, fractions, and decimals). Solve real-world and mathematical problems involving the four operations with rational numbers.',
  assessment_limits: 'Includes positive and negative numbers, decimals, fractions.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.1.7.E.1', '7.NS.A.1', '7.NS.A.2', '7.NS.A.3'],
  prerequisites: ['M06.A-N.1.1.1'],
  next_steps: ['M08.A-N.1.1.1', 'CC.2.1.8.E.1'],
  keywords: ['rational numbers', 'integers', 'negative numbers', 'absolute value', 'signed fractions', 'rational arithmetic']
});

addStandard({
  code: 'M07.A-R.1.1.1',
  alt_code: 'CC.2.1.7.D.1',
  subject: 'Mathematics',
  grade: '7',
  domain: 'Ratios & Proportional Relationships',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M07.A-R.1 - Demonstrate an understanding of proportional relationships.',
  descriptor: 'M07.A-R.1.1 - Compute unit rates and identify proportional relationships.',
  description: 'Compute unit rates associated with ratios of fractions, including ratios of lengths, areas, and other quantities measured in like or different units. Determine whether two quantities are in a proportional relationship (e.g., by testing for equivalent ratios in a table or graphing on a coordinate plane and observing whether the graph is a straight line through the origin).',
  dok: 'DOK 2-3',
  crosswalks: ['CC.2.1.7.D.1', '7.RP.A.1', '7.RP.A.2'],
  prerequisites: ['M06.A-R.1.1.1'],
  next_steps: ['M08.B-E.2.1.1', 'CC.2.2.8.B.2'],
  keywords: ['unit rate', 'constant of proportionality', 'proportions', 'origin', 'straight line', 'y=kx']
});

addStandard({
  code: 'M07.B-E.2.1.1',
  alt_code: 'CC.2.2.7.B.2',
  subject: 'Mathematics',
  grade: '7',
  domain: 'Expressions & Equations',
  reporting_category: 'Reporting Category B - Algebraic Concepts',
  anchor: 'M07.B-E.2 - Solve real-world and mathematical problems using numerical and algebraic expressions, equations, and inequalities.',
  descriptor: 'M07.B-E.2.1 - Solve two-step equations and inequalities.',
  description: 'Apply properties of operations to solve multi-step equations and inequalities of the form px + q = r and p(x + q) = r, where p, q, and r are specific rational numbers. Graph the solution set of the inequality and interpret it in the context of the problem.',
  dok: 'DOK 2-3',
  crosswalks: ['CC.2.2.7.B.2', '7.EE.B.4'],
  prerequisites: ['M06.B-E.1.1.1'],
  next_steps: ['M08.B-E.3.1.1', 'A1.1.2.1.1'],
  keywords: ['two-step equations', 'inequalities', 'distributive property', 'graphing inequalities', 'algebraic solving']
});

// --- GRADE 8 PSSA MATH ---
addStandard({
  code: 'M08.A-N.1.1.1',
  alt_code: 'CC.2.1.8.E.1',
  subject: 'Mathematics',
  grade: '8',
  domain: 'The Number System',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M08.A-N.1 - Demonstrate an understanding of numbers, ways of representing numbers, relationships among numbers, and number systems.',
  descriptor: 'M08.A-N.1.1 - Apply concepts of rational and irrational numbers.',
  description: 'Determine whether a number is rational or irrational. For rational numbers, show that the decimal expansion terminates in 0s or eventually repeats.',
  assessment_limits: 'Radicals limited to square roots and cube roots.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.1.8.E.1', '8.NS.A.1'],
  prerequisites: ['M07.A-N.1.1.1'],
  next_steps: ['A1.1.1.1.1', 'CC.2.1.HS.F.1'],
  keywords: ['rational numbers', 'irrational numbers', 'repeating decimals', 'terminating decimals', 'real numbers', 'pi', 'square roots']
});

addStandard({
  code: 'M08.A-N.1.1.2',
  alt_code: 'CC.2.1.8.E.4',
  subject: 'Mathematics',
  grade: '8',
  domain: 'The Number System',
  reporting_category: 'Reporting Category A - Numbers and Operations',
  anchor: 'M08.A-N.1 - Demonstrate an understanding of numbers, ways of representing numbers, relationships among numbers, and number systems.',
  descriptor: 'M08.A-N.1.1 - Apply concepts of rational and irrational numbers.',
  description: 'Convert a terminating or repeating decimal into a rational number (fraction). Estimate the value of irrational numbers without a calculator by comparing to nearby square roots.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.1.8.E.4', '8.NS.A.2'],
  prerequisites: ['M08.A-N.1.1.1'],
  next_steps: ['A1.1.1.1.1'],
  keywords: ['convert repeating decimals', 'estimate square roots', 'fraction conversion', 'irrational approximations']
});

addStandard({
  code: 'M08.B-E.1.1.1',
  alt_code: 'CC.2.2.8.B.1',
  subject: 'Mathematics',
  grade: '8',
  domain: 'Expressions & Equations',
  reporting_category: 'Reporting Category B - Algebraic Concepts',
  anchor: 'M08.B-E.1 - Work with radicals and integer exponents.',
  descriptor: 'M08.B-E.1.1 - Apply properties of exponents and scientific notation.',
  description: 'Apply one or more properties of integer exponents to generate equivalent numerical expressions (e.g., 3^2 * 3^-5 = 3^-3 = 1/27). Use scientific notation to estimate very large or small quantities.',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.2.8.B.1', '8.EE.A.1', '8.EE.A.3'],
  prerequisites: ['M06.B-E.1.1.1'],
  next_steps: ['A1.1.1.3.1'],
  keywords: ['exponent rules', 'power of a power', 'negative exponents', 'zero exponent', 'scientific notation']
});

addStandard({
  code: 'M08.B-E.2.1.1',
  alt_code: 'CC.2.2.8.B.2',
  subject: 'Mathematics',
  grade: '8',
  domain: 'Expressions & Equations & Slope',
  reporting_category: 'Reporting Category B - Algebraic Concepts',
  anchor: 'M08.B-E.2 - Understand the connections between proportional relationships, lines, and linear equations.',
  descriptor: 'M08.B-E.2.1 - Analyze and interpret linear relationships and slope.',
  description: 'Graph proportional relationships, interpreting the unit rate as the slope of the graph. Compare two different proportional relationships represented in different ways (e.g., compare a distance-time graph to a distance-time equation). Use similar triangles to explain why slope m is constant.',
  dok: 'DOK 2-3',
  crosswalks: ['CC.2.2.8.B.2', '8.EE.B.5', '8.EE.B.6'],
  prerequisites: ['M07.A-R.1.1.1'],
  next_steps: ['A1.2.1.1.1', 'A1.2.2.1.1'],
  keywords: ['slope', 'unit rate', 'linear equations', 'rate of change', 'similar triangles', 'y=mx+b']
});

addStandard({
  code: 'M08.B-E.3.1.1',
  alt_code: 'CC.2.2.8.B.3',
  subject: 'Mathematics',
  grade: '8',
  domain: 'Expressions & Equations',
  reporting_category: 'Reporting Category B - Algebraic Concepts',
  anchor: 'M08.B-E.3 - Analyze and solve linear equations and pairs of simultaneous linear equations.',
  descriptor: 'M08.B-E.3.1 - Solve linear equations with one variable.',
  description: 'Solve linear equations in one variable with rational number coefficients, including equations whose solutions require expanding expressions using the distributive property and collecting like terms. Give examples of linear equations in one variable with one solution, infinitely many solutions, or no solutions.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.2.8.B.3', '8.EE.C.7'],
  prerequisites: ['M07.B-E.2.1.1'],
  next_steps: ['A1.1.2.1.1'],
  keywords: ['linear equations', 'distributive property', 'combining like terms', 'no solution', 'infinite solutions', 'one solution']
});

addStandard({
  code: 'M08.B-F.1.1.1',
  alt_code: 'CC.2.2.8.C.1',
  subject: 'Mathematics',
  grade: '8',
  domain: 'Functions',
  reporting_category: 'Reporting Category B - Algebraic Concepts',
  anchor: 'M08.B-F.1 - Define, evaluate, and compare functions.',
  descriptor: 'M08.B-F.1.1 - Understand and represent functions.',
  description: 'Determine whether a relation is a function given a set of points, mapping diagram, table, or graph (vertical line test, unique output for each input).',
  dok: 'DOK 1-2',
  crosswalks: ['CC.2.2.8.C.1', '8.F.A.1'],
  prerequisites: ['M08.B-E.2.1.1'],
  next_steps: ['A1.2.1.1.1', 'CC.2.2.HS.C.1'],
  keywords: ['functions', 'domain and range', 'input output', 'vertical line test', 'mapping diagram', 'relations']
});

addStandard({
  code: 'M08.C-G.1.1.1',
  alt_code: 'CC.2.3.8.A.1',
  subject: 'Mathematics',
  grade: '8',
  domain: 'Geometry',
  reporting_category: 'Reporting Category C - Geometry',
  anchor: 'M08.C-G.1 - Understand congruence and similarity using physical models, transparencies, or geometry software.',
  descriptor: 'M08.C-G.1.1 - Apply geometric transformations.',
  description: 'Identify and apply properties of rotations, reflections, translations, and dilations on the coordinate plane. Understand that a 2D figure is congruent or similar to another if one can be obtained by a sequence of transformations.',
  dok: 'DOK 2',
  crosswalks: ['CC.2.3.8.A.1', '8.G.A.1', '8.G.A.2', '8.G.A.3'],
  prerequisites: ['CC.2.3.7.A.2'],
  next_steps: ['G.1.2.1.1', 'CC.2.3.HS.A.1'],
  keywords: ['transformations', 'rotations', 'reflections', 'translations', 'dilations', 'congruence', 'similarity']
});

addStandard({
  code: 'M08.C-G.2.1.1',
  alt_code: 'CC.2.3.8.A.3',
  subject: 'Mathematics',
  grade: '8',
  domain: 'Geometry & Pythagorean Theorem',
  reporting_category: 'Reporting Category C - Geometry',
  anchor: 'M08.C-G.2 - Understand and apply the Pythagorean Theorem.',
  descriptor: 'M08.C-G.2.1 - Apply the Pythagorean Theorem.',
  description: 'Apply the Pythagorean Theorem (a^2 + b^2 = c^2) to determine unknown side lengths in right triangles in real-world and mathematical problems in two and three dimensions. Apply the Pythagorean Theorem to find the distance between two points on a coordinate plane.',
  dok: 'DOK 2-3',
  crosswalks: ['CC.2.3.8.A.3', '8.G.B.7', '8.G.B.8'],
  prerequisites: ['M08.A-N.1.1.2'],
  next_steps: ['G.1.2.1.1', 'CC.2.3.HS.A.7'],
  keywords: ['pythagorean theorem', 'right triangle', 'hypotenuse', 'legs', 'distance formula', 'a2+b2=c2']
});

// --- KEYSTONE ALGEBRA 1 (HIGH SCHOOL) ---
addStandard({
  code: 'A1.1.1.1.1',
  alt_code: 'CC.2.1.HS.F.1',
  subject: 'Mathematics',
  grade: 'HS',
  domain: 'Operations with Real Numbers & Expressions',
  reporting_category: 'Module 1 - Operations and Linear Equations & Inequalities',
  anchor: 'A1.1.1 - Represent and/or use numbers in equivalent forms.',
  descriptor: 'A1.1.1.1 - Compare and/or order any real numbers (rational and irrational).',
  description: 'Compare and/or order any real numbers (rational and irrational may be mixed). Simplify square roots (e.g., sqrt(24) = 2*sqrt(6)). Find the Greatest Common Factor (GCF) and/or Least Common Multiple (LCM) for sets of monomials.',
  dok: 'DOK 1-2',
  is_keystone: true,
  crosswalks: ['CC.2.1.HS.F.1', 'A1.1.1.1.2', 'A1.1.1.2.1'],
  prerequisites: ['M08.A-N.1.1.1'],
  next_steps: ['CC.2.1.HS.F.2'],
  keywords: ['real numbers', 'simplifying radicals', 'GCF', 'LCM', 'monomials', 'ordering numbers']
});

addStandard({
  code: 'A1.1.2.1.1',
  alt_code: 'CC.2.2.HS.D.7',
  subject: 'Mathematics',
  grade: 'HS',
  domain: 'Linear Equations & Systems',
  reporting_category: 'Module 1 - Operations and Linear Equations & Inequalities',
  anchor: 'A1.1.2 - Apply algebraic techniques to solve linear equations and systems.',
  descriptor: 'A1.1.2.1 - Write, solve, and/or apply a linear equation.',
  description: 'Write, solve, and/or apply a linear equation (including problem situations). Linear equations may include variables on both sides, compound equations, or absolute value equations.',
  dok: 'DOK 2-3',
  is_keystone: true,
  crosswalks: ['CC.2.2.HS.D.7', 'CC.2.2.HS.D.8'],
  prerequisites: ['M08.B-E.3.1.1'],
  next_steps: ['CC.2.2.HS.D.9', 'CC.2.2.HS.D.10'],
  keywords: ['linear equations', 'absolute value equations', 'variables on both sides', 'word problems', 'algebraic modeling']
});

addStandard({
  code: 'A1.1.2.2.1',
  alt_code: 'CC.2.2.HS.D.10',
  subject: 'Mathematics',
  grade: 'HS',
  domain: 'Systems of Linear Equations',
  reporting_category: 'Module 1 - Operations and Linear Equations & Inequalities',
  anchor: 'A1.1.2 - Apply algebraic techniques to solve linear equations and systems.',
  descriptor: 'A1.1.2.2 - Write, solve, and/or apply a system of linear equations.',
  description: 'Write and/or solve a system of linear equations using graphing, substitution, and/or elimination (linear combinations). Interpret solutions to systems in real-world contexts.',
  dok: 'DOK 2-3',
  is_keystone: true,
  crosswalks: ['CC.2.2.HS.D.10'],
  prerequisites: ['A1.1.2.1.1', 'M08.B-E.3.1.1'],
  next_steps: ['CC.2.2.HS.C.5'],
  keywords: ['systems of equations', 'substitution method', 'elimination method', 'graphing systems', 'intersection point', 'no solution']
});

addStandard({
  code: 'A1.2.1.1.1',
  alt_code: 'CC.2.2.HS.C.1',
  subject: 'Mathematics',
  grade: 'HS',
  domain: 'Functions & Coordinate Geometry',
  reporting_category: 'Module 2 - Linear Functions and Data Organization',
  anchor: 'A1.2.1 - Analyze and/or use patterns, relations, and functions.',
  descriptor: 'A1.2.1.1 - Analyze and/or use patterns and relations.',
  description: 'Analyze a set of data for the existence of a pattern and represent the pattern algebraically and/or graphically. Determine whether a relation is a function, find the domain and range of a relation/function.',
  dok: 'DOK 2',
  is_keystone: true,
  crosswalks: ['CC.2.2.HS.C.1', 'CC.2.2.HS.C.2'],
  prerequisites: ['M08.B-F.1.1.1'],
  next_steps: ['CC.2.2.HS.C.3'],
  keywords: ['domain', 'range', 'relations', 'functions', 'pattern recognition', 'function notation']
});

addStandard({
  code: 'A1.2.2.1.1',
  alt_code: 'CC.2.2.HS.C.3',
  subject: 'Mathematics',
  grade: 'HS',
  domain: 'Coordinate Geometry & Slope',
  reporting_category: 'Module 2 - Linear Functions and Data Organization',
  anchor: 'A1.2.2 - Coordinate Geometry.',
  descriptor: 'A1.2.2.1 - Describe, compute, and/or use the rate of change (slope) of a line.',
  description: 'Identify, compute, and/or use the slope of a line from a graph, an equation, or two points on the line. Write, solve, or graph linear equations in slope-intercept form (y = mx + b), point-slope form, and standard form (Ax + By = C).',
  dok: 'DOK 2',
  is_keystone: true,
  crosswalks: ['CC.2.2.HS.C.3', 'CC.2.2.HS.C.6'],
  prerequisites: ['M08.B-E.2.1.1'],
  next_steps: ['CC.2.2.HS.C.4'],
  keywords: ['slope', 'slope-intercept', 'point-slope', 'standard form', 'parallel lines', 'perpendicular lines', 'rate of change']
});


// ═══════════════════════════════════════════════════════════════════════
// 2. ENGLISH LANGUAGE ARTS (ELA)
// ═══════════════════════════════════════════════════════════════════════

addStandard({
  code: 'CC.1.2.K.A',
  subject: 'English Language Arts',
  grade: 'K',
  domain: 'Reading Informational Text',
  anchor: 'Key Ideas and Details: Main Idea.',
  description: 'With prompting and support, identify the main idea and retell key details of text.',
  dok: 'DOK 1-2',
  crosswalks: ['RI.K.1', 'RI.K.2'],
  next_steps: ['CC.1.2.1.A'],
  keywords: ['main idea', 'key details', 'retell', 'informational text', 'prompting and support']
});

addStandard({
  code: 'CC.1.3.K.A',
  subject: 'English Language Arts',
  grade: 'K',
  domain: 'Reading Literature',
  anchor: 'Key Ideas and Details: Story Elements.',
  description: 'With prompting and support, retell familiar stories including key details, character, setting, and major events.',
  dok: 'DOK 1-2',
  crosswalks: ['RL.K.1', 'RL.K.2', 'RL.K.3'],
  next_steps: ['CC.1.3.1.A'],
  keywords: ['characters', 'setting', 'major events', 'retelling', 'story elements', 'fiction']
});

addStandard({
  code: 'CC.1.1.1.D',
  subject: 'English Language Arts',
  grade: '1',
  domain: 'Foundational Skills: Phonics',
  anchor: 'Know and apply grade-level phonics and word analysis skills.',
  description: 'Know and apply grade-level phonics in decoding words: decode regularly spelled one-syllable words, recognize common consonant digraphs, decode words with final -e and common vowel teams.',
  dok: 'DOK 1',
  crosswalks: ['RF.1.3'],
  prerequisites: ['CC.1.1.K.D'],
  next_steps: ['CC.1.1.2.D'],
  keywords: ['phonics', 'decoding', 'digraphs', 'vowel teams', 'silent e', 'sight words']
});

addStandard({
  code: 'E03.A-K.1.1.1',
  alt_code: 'CC.1.3.3.A',
  subject: 'English Language Arts',
  grade: '3',
  domain: 'Reading Literature: Key Ideas & Details',
  reporting_category: 'Reporting Category A - Literature Text',
  anchor: 'E03.A-K.1 - Key Ideas and Details.',
  descriptor: 'E03.A-K.1.1 - Demonstrate understanding of literature.',
  description: 'Ask and answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers. Recount stories, including fables, folktales, and myths from diverse cultures; determine the central message, lesson, or moral and explain how it is conveyed through key details in the text.',
  dok: 'DOK 2-3',
  crosswalks: ['CC.1.3.3.A', 'CC.1.3.3.B', 'RL.3.1', 'RL.3.2'],
  next_steps: ['E04.A-K.1.1.1', 'CC.1.3.4.A'],
  keywords: ['central message', 'theme', 'moral', 'folktales', 'fables', 'textual evidence', 'ask and answer']
});

addStandard({
  code: 'E03.B-K.1.1.1',
  alt_code: 'CC.1.2.3.A',
  subject: 'English Language Arts',
  grade: '3',
  domain: 'Reading Informational Text: Key Ideas & Details',
  reporting_category: 'Reporting Category B - Informational Text',
  anchor: 'E03.B-K.1 - Key Ideas and Details.',
  descriptor: 'E03.B-K.1.1 - Demonstrate understanding of informational text.',
  description: 'Answer questions to demonstrate understanding of a text, referring explicitly to the text as the basis for the answers. Determine the main idea of a text; recount the key details and explain how they support the main idea.',
  dok: 'DOK 2',
  crosswalks: ['CC.1.2.3.A', 'CC.1.2.3.B', 'RI.3.1', 'RI.3.2'],
  next_steps: ['E04.B-K.1.1.1', 'CC.1.2.4.A'],
  keywords: ['main idea', 'key details', 'supporting evidence', 'nonfiction', 'explicit questioning']
});

addStandard({
  code: 'E03.E.1.1.1',
  alt_code: 'CC.1.4.3.S',
  subject: 'English Language Arts',
  grade: '3',
  domain: 'Text-Dependent Analysis (TDA)',
  reporting_category: 'Reporting Category E - Text-Dependent Analysis',
  anchor: 'E03.E.1 - Text-Dependent Analysis.',
  descriptor: 'E03.E.1.1 - Draw evidence from literary or informational texts to support analysis, reflection, and research.',
  description: 'Respond to an evidence-based prompt using textual evidence to support an analysis of key ideas, craft, or structure across one or more texts.',
  dok: 'DOK 3-4',
  crosswalks: ['CC.1.4.3.S', 'CC.1.4.3.B'],
  next_steps: ['E04.E.1.1.1', 'E05.E.1.1.1'],
  keywords: ['TDA', 'text dependent analysis', 'evidence-based response', 'essay', 'analysis', 'citations', 'rubric']
});

addStandard({
  code: 'E04.A-K.1.1.1',
  alt_code: 'CC.1.3.4.A',
  subject: 'English Language Arts',
  grade: '4',
  domain: 'Reading Literature: Key Ideas & Details',
  reporting_category: 'Reporting Category A - Literature Text',
  anchor: 'E04.A-K.1 - Key Ideas and Details.',
  descriptor: 'E04.A-K.1.1 - Refer to details and examples when explaining text.',
  description: 'Refer to details and examples in a text when explaining what the text says explicitly and when drawing inferences from the text. Determine a theme of a story, drama, or poem from details in the text; summarize the text.',
  dok: 'DOK 2-3',
  crosswalks: ['CC.1.3.4.A', 'RL.4.1', 'RL.4.2'],
  prerequisites: ['E03.A-K.1.1.1'],
  next_steps: ['E05.A-K.1.1.1'],
  keywords: ['inferences', 'theme', 'summary', 'details and examples', 'story elements']
});

addStandard({
  code: 'E05.A-K.1.1.1',
  alt_code: 'CC.1.3.5.A',
  subject: 'English Language Arts',
  grade: '5',
  domain: 'Reading Literature: Key Ideas & Details',
  reporting_category: 'Reporting Category A - Literature Text',
  anchor: 'E05.A-K.1 - Key Ideas and Details in Literature.',
  descriptor: 'E05.A-K.1.1 - Analyze literary texts.',
  description: 'Quote accurately from a text when explaining what the text says explicitly and when drawing inferences from the text. Determine a theme of a story, drama, or poem from details in the text, including how characters in a story or drama respond to challenges or how the speaker in a poem reflects upon a topic; summarize the text.',
  dok: 'DOK 2-3',
  crosswalks: ['CC.1.3.5.A', 'CC.1.3.5.B', 'RL.5.1', 'RL.5.2'],
  prerequisites: ['E04.A-K.1.1.1'],
  next_steps: ['E06.A-K.1.1.1', 'CC.1.3.6.A'],
  keywords: ['theme', 'summarize', 'quoting accurately', 'inferences', 'character response', 'drama', 'poetry']
});

addStandard({
  code: 'E05.B-C.2.1.1',
  alt_code: 'CC.1.2.5.E',
  subject: 'English Language Arts',
  grade: '5',
  domain: 'Reading Informational Text: Craft & Structure',
  reporting_category: 'Reporting Category B - Informational Text',
  anchor: 'E05.B-C.2 - Craft and Structure in Informational Text.',
  descriptor: 'E05.B-C.2.1 - Analyze text structure and point of view.',
  description: 'Compare and contrast the overall structure (e.g., chronology, comparison, cause/effect, problem/solution) of events, ideas, concepts, or information in two or more texts. Analyze multiple accounts of the same event or topic, noting important similarities and differences in the point of view they represent.',
  dok: 'DOK 3',
  crosswalks: ['CC.1.2.5.E', 'CC.1.2.5.D', 'RI.5.5', 'RI.5.6'],
  prerequisites: ['E04.B-C.2.1.1'],
  next_steps: ['E06.B-C.2.1.1', 'CC.1.2.6.E'],
  keywords: ['text structure', 'chronology', 'cause and effect', 'problem and solution', 'compare contrast', 'point of view']
});

addStandard({
  code: 'E06.A-K.1.1.1',
  alt_code: 'CC.1.3.6.A',
  subject: 'English Language Arts',
  grade: '6',
  domain: 'Reading Literature: Key Ideas & Details',
  reporting_category: 'Reporting Category A - Literature Text',
  anchor: 'E06.A-K.1 - Key Ideas and Details.',
  descriptor: 'E06.A-K.1.1 - Cite textual evidence and determine theme.',
  description: 'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text. Determine a theme or central idea of a text and how it is conveyed through particular details; provide a summary of the text distinct from personal opinions or judgments.',
  dok: 'DOK 3',
  crosswalks: ['CC.1.3.6.A', 'RL.6.1', 'RL.6.2'],
  prerequisites: ['E05.A-K.1.1.1'],
  next_steps: ['E07.A-K.1.1.1'],
  keywords: ['objective summary', 'theme conveyance', 'textual evidence', 'inferences', 'literature analysis']
});

addStandard({
  code: 'E07.B-C.2.1.1',
  alt_code: 'CC.1.2.7.D',
  subject: 'English Language Arts',
  grade: '7',
  domain: 'Reading Informational Text: Craft & Structure',
  reporting_category: 'Reporting Category B - Informational Text',
  anchor: 'E07.B-C.2 - Craft and Structure.',
  descriptor: 'E07.B-C.2.1 - Analyze author’s point of view and purpose.',
  description: 'Determine an author’s point of view or purpose in a text and analyze how the author distinguishes his or her position from that of others. Analyze the structure an author uses to organize a text, including how the major sections contribute to the whole and to the development of the ideas.',
  dok: 'DOK 3',
  crosswalks: ['CC.1.2.7.D', 'CC.1.2.7.E', 'RI.7.5', 'RI.7.6'],
  prerequisites: ['E06.B-C.2.1.1'],
  next_steps: ['E08.B-C.2.1.1'],
  keywords: ['author purpose', 'point of view', 'counterarguments', 'text organization', 'informational craft']
});

addStandard({
  code: 'E08.A-K.1.1.1',
  alt_code: 'CC.1.3.8.A',
  subject: 'English Language Arts',
  grade: '8',
  domain: 'Reading Literature: Key Ideas & Details',
  reporting_category: 'Reporting Category A - Literature Text',
  anchor: 'E08.A-K.1 - Key Ideas and Details.',
  descriptor: 'E08.A-K.1.1 - Cite textual evidence and determine theme.',
  description: 'Cite the textual evidence that most strongly supports an analysis of what the text says explicitly as well as inferences drawn from the text. Determine a theme or central idea of a text and analyze its development over the course of the text, including its relationship to the characters, setting, and plot; provide an objective summary of the text.',
  dok: 'DOK 3',
  crosswalks: ['CC.1.3.8.A', 'CC.1.3.8.B', 'RL.8.1', 'RL.8.2'],
  prerequisites: ['E07.A-K.1.1.1'],
  next_steps: ['L.F.1.1.1', 'CC.1.3.11-12.A'],
  keywords: ['cite textual evidence', 'theme development', 'objective summary', 'strongest evidence', 'plot development']
});

addStandard({
  code: 'E08.A-C.2.1.1',
  alt_code: 'CC.1.3.8.D',
  subject: 'English Language Arts',
  grade: '8',
  domain: 'Reading Literature: Craft & Structure',
  reporting_category: 'Reporting Category A - Literature Text',
  anchor: 'E08.A-C.2 - Craft and Structure.',
  descriptor: 'E08.A-C.2.1 - Analyze literary devices and point of view.',
  description: 'Determine the meaning of words and phrases as they are used in a text, including figurative and connotative meanings; analyze the impact of specific word choices on meaning and tone, including analogies or allusions to other texts. Analyze how differences in the points of view of the characters and the audience create effects such as suspense or humor.',
  dok: 'DOK 3',
  crosswalks: ['CC.1.3.8.D', 'CC.1.3.8.F', 'RL.8.4', 'RL.8.6'],
  prerequisites: ['E07.A-C.2.1.1'],
  next_steps: ['L.F.1.2.1', 'CC.1.3.11-12.D'],
  keywords: ['figurative language', 'connotation', 'allusions', 'tone', 'dramatic irony', 'suspense', 'humor', 'point of view']
});

addStandard({
  code: 'E08.E.1.1.1',
  alt_code: 'CC.1.4.8.S',
  subject: 'English Language Arts',
  grade: '8',
  domain: 'Text-Dependent Analysis (TDA)',
  reporting_category: 'Reporting Category E - Text-Dependent Analysis',
  anchor: 'E08.E.1 - Text-Dependent Analysis.',
  descriptor: 'E08.E.1.1 - Draw evidence from literary or informational texts to support analysis.',
  description: 'Write responses that synthesize ideas from text to analyze character motivation, thematic development, structural choices, or authorial purpose, integrating quotes smoothly with insightful commentary.',
  dok: 'DOK 4',
  crosswalks: ['CC.1.4.8.S', 'CC.1.4.8.B'],
  prerequisites: ['E07.E.1.1.1'],
  next_steps: ['L.F.1.3.1'],
  keywords: ['TDA essay', 'synthesis', 'author purpose', 'evidence integration', 'thematic analysis', 'analytical writing']
});

addStandard({
  code: 'L.F.1.1.1',
  alt_code: 'CC.1.3.11-12.A',
  subject: 'English Language Arts',
  grade: 'HS',
  domain: 'Keystone Literature: Literary Elements',
  reporting_category: 'Module 1 - Fiction and Literary Elements',
  anchor: 'L.F.1 - Understand and use literary elements in fiction.',
  descriptor: 'L.F.1.1 - Identify and analyze literary elements in stories, novels, dramas, and poems.',
  description: 'Identify and analyze the character, setting, plot, theme, tone, point of view, and mood in a story, poem, or play, and how these elements interact to create meaning.',
  dok: 'DOK 3',
  is_keystone: true,
  crosswalks: ['CC.1.3.11-12.A', 'CC.1.3.11-12.C'],
  prerequisites: ['E08.A-K.1.1.1'],
  next_steps: ['AP Literature / College English'],
  keywords: ['keystone literature', 'fiction analysis', 'mood', 'tone', 'plot structure', 'character arc', 'literary elements']
});

addStandard({
  code: 'L.N.2.1.1',
  alt_code: 'CC.1.2.11-12.A',
  subject: 'English Language Arts',
  grade: 'HS',
  domain: 'Keystone Literature: Nonfiction & Rhetoric',
  reporting_category: 'Module 2 - Nonfiction and Informational Texts',
  anchor: 'L.N.2 - Analyze and evaluate rhetoric and structure in nonfiction.',
  descriptor: 'L.N.2.1 - Analyze author’s argument, bias, and rhetorical appeals.',
  description: 'Analyze an author’s argument, perspective, or purpose in a seminal U.S. or historical text; evaluate the effectiveness of rhetorical strategies (ethos, pathos, logos), evidence, and reasoning.',
  dok: 'DOK 3-4',
  is_keystone: true,
  crosswalks: ['CC.1.2.11-12.A', 'CC.1.2.11-12.H'],
  prerequisites: ['E08.B-C.2.1.1'],
  next_steps: ['AP Language / College Rhetoric'],
  keywords: ['rhetorical appeals', 'ethos', 'pathos', 'logos', 'author bias', 'argument evaluation', 'nonfiction keystone']
});


// ═══════════════════════════════════════════════════════════════════════
// 3. STEELS SCIENCE (PENNSYLVANIA NEW 3D STANDARDS - 2025/2026)
// ═══════════════════════════════════════════════════════════════════════

addStandard({
  code: '3.1.K.A',
  subject: 'STEELS Science',
  grade: 'K',
  domain: '3.1 Life Science',
  anchor: 'Molecules to Organisms: Structures and Processes.',
  description: 'Use observations to describe patterns of what plants and animals (including humans) need to survive (e.g., animals need food, plants need water and light).',
  dok: 'DOK 2',
  crosswalks: ['K-LS1-1', 'NGSS K-LS1-1'],
  next_steps: ['3.1.2.A', '3.1.5.A'],
  keywords: ['plant needs', 'animal survival', 'living organisms', 'STEELS', 'science practices', 'patterns']
});

addStandard({
  code: '3.2.4.B',
  subject: 'STEELS Science',
  grade: '4',
  domain: '3.2 Physical Science: Energy & Waves',
  anchor: 'Energy Transfer and Wave Properties.',
  description: 'Apply scientific ideas to design, test, and refine a device that converts energy from one form to another (e.g., solar energy into heat or electrical energy into motion).',
  dok: 'DOK 3-4',
  crosswalks: ['4-PS3-4'],
  prerequisites: ['3.2.2.A'],
  next_steps: ['3.2.8.B'],
  keywords: ['energy transformation', 'engineering design', 'solar energy', 'electrical energy', 'STEELS design']
});

addStandard({
  code: '3.3.8.A',
  subject: 'STEELS Science',
  grade: '8',
  domain: '3.3 Earth & Space Science',
  anchor: 'Earth’s Place in the Universe & Plate Tectonics.',
  description: 'Construct an explanation based on evidence for how geoscience processes have changed Earth’s surface at varying time and spatial scales (e.g., plate tectonic motion, volcanic eruptions, erosion).',
  dok: 'DOK 3',
  crosswalks: ['MS-ESS2-2'],
  prerequisites: ['3.3.4.A'],
  next_steps: ['3.3.HS.A', 'BIO.B.3.1.1'],
  keywords: ['plate tectonics', 'geoscience', 'erosion', 'earth science', 'continental drift', 'rock cycle']
});

addStandard({
  code: '3.4.8.A',
  subject: 'STEELS Science',
  grade: '8',
  domain: '3.4 Environmental Literacy & Sustainability',
  anchor: 'Human Impact on Watersheds & Pennsylvania Ecosystems.',
  description: 'Apply scientific principles to design a method for monitoring and minimizing human impact on Pennsylvania watersheds (e.g., Susquehanna, Delaware, Ohio River basins) and Chesapeake Bay water quality.',
  dok: 'DOK 3-4',
  crosswalks: ['MS-ESS3-3', 'PA STEELS Watersheds'],
  prerequisites: ['3.4.5.A'],
  next_steps: ['3.4.HS.A'],
  keywords: ['environmental literacy', 'watersheds', 'Chesapeake Bay', 'runoff', 'sustainability', 'PA ecology']
});

addStandard({
  code: '3.5.8.B',
  subject: 'STEELS Science',
  grade: '8',
  domain: '3.5 Technology & Engineering Principles',
  anchor: 'Technological Design & Systems Thinking.',
  description: 'Analyze how societal needs drive technological innovation, and test criteria/constraints for sustainable engineering solutions in Pennsylvania communities.',
  dok: 'DOK 3',
  crosswalks: ['MS-ETS1-2'],
  prerequisites: ['3.5.5.A'],
  next_steps: ['3.5.HS.A'],
  keywords: ['engineering design', 'constraints', 'prototyping', 'sustainable technology', 'systems thinking']
});

addStandard({
  code: 'BIO.A.1.1.1',
  alt_code: '3.1.HS.A',
  subject: 'STEELS Science',
  grade: 'HS',
  domain: 'Keystone Biology: Basic Biological Principles',
  reporting_category: 'Module A - Cells and Cell Processes',
  anchor: 'BIO.A.1 - Basic Biological Principles.',
  descriptor: 'BIO.A.1.1 - Explain the characteristics of life and cellular structure.',
  description: 'Describe the characteristics of life shared by all prokaryotic and eukaryotic organisms. Compare the structure and function of cellular organelles in plants, animals, and bacteria.',
  dok: 'DOK 2',
  is_keystone: true,
  crosswalks: ['CC.3.5.11-12.A', 'HS-LS1-2'],
  prerequisites: ['3.1.8.A'],
  next_steps: ['AP Biology / Advanced Life Sciences'],
  keywords: ['keystone biology', 'prokaryote', 'eukaryote', 'organelles', 'nucleus', 'mitochondria', 'cell membrane']
});

addStandard({
  code: 'BIO.A.3.2.1',
  alt_code: '3.1.HS.B',
  subject: 'STEELS Science',
  grade: 'HS',
  domain: 'Keystone Biology: Bioenergetics',
  reporting_category: 'Module A - Cells and Cell Processes',
  anchor: 'BIO.A.3 - Bioenergetics.',
  descriptor: 'BIO.A.3.2 - Describe the role of ATP, cellular respiration, and photosynthesis.',
  description: 'Compare the basic transformation of energy during photosynthesis and cellular respiration. Explain the role of ATP in biochemical reactions and energy transfer within cells.',
  dok: 'DOK 2-3',
  is_keystone: true,
  crosswalks: ['HS-LS1-5', 'HS-LS1-7'],
  prerequisites: ['BIO.A.1.1.1'],
  next_steps: ['AP Biology / Biochemistry'],
  keywords: ['ATP', 'photosynthesis', 'cellular respiration', 'chloroplast', 'mitochondria', 'glucose', 'bioenergetics']
});

addStandard({
  code: 'BIO.B.2.1.1',
  alt_code: '3.1.HS.C',
  subject: 'STEELS Science',
  grade: 'HS',
  domain: 'Keystone Biology: Genetics & Heredity',
  reporting_category: 'Module B - Continuity and Unity of Life',
  anchor: 'BIO.B.2 - Genetics.',
  descriptor: 'BIO.B.2.1 - Describe processes that can alter composition of an organism’s genome.',
  description: 'Describe and/or predict how genetic mutations, crossing over, and non-disjunction alter genetic variation in populations. Explain how DNA replication, transcription, and translation synthesize proteins.',
  dok: 'DOK 3',
  is_keystone: true,
  crosswalks: ['HS-LS3-1', 'HS-LS3-2'],
  prerequisites: ['BIO.A.1.1.1'],
  next_steps: ['AP Biology / Genetics'],
  keywords: ['DNA replication', 'transcription', 'translation', 'mutations', 'punnett squares', 'heredity', 'genetics']
});

addStandard({
  code: 'BIO.B.4.1.1',
  alt_code: '3.1.HS.E',
  subject: 'STEELS Science',
  grade: 'HS',
  domain: 'Keystone Biology: Ecology',
  reporting_category: 'Module B - Continuity and Unity of Life',
  anchor: 'BIO.B.4 - Ecology.',
  descriptor: 'BIO.B.4.1 - Describe ecological levels of organization and energy flow.',
  description: 'Describe the relationships between organisms and energy flow in an ecosystem (food chains, food webs, trophic pyramids). Explain how limiting factors and carrying capacity regulate population growth.',
  dok: 'DOK 2-3',
  is_keystone: true,
  crosswalks: ['HS-LS2-3', 'HS-LS2-4'],
  prerequisites: ['3.4.8.A'],
  next_steps: ['AP Environmental Science'],
  keywords: ['trophic levels', 'carrying capacity', 'food web', 'energy pyramid', 'biotic abiotic factors', 'ecology']
});


// ═══════════════════════════════════════════════════════════════════════
// 4. SOCIAL STUDIES (CIVICS, ECONOMICS, GEOGRAPHY, HISTORY)
// ═══════════════════════════════════════════════════════════════════════

addStandard({
  code: '5.1.8.C',
  subject: 'Social Studies',
  grade: '8',
  domain: '5.1 Civics and Government: Principles & Documents',
  anchor: 'Principles and Documents of Government.',
  description: 'Explain how the principles of the United States Constitution (separation of powers, checks and balances, federalism) and the Pennsylvania Constitution establish a system of limited government.',
  dok: 'DOK 2-3',
  crosswalks: ['PA Code Chapter 4 Civics'],
  next_steps: ['5.1.12.C'],
  keywords: ['constitution', 'checks and balances', 'separation of powers', 'federalism', 'PA government', 'bill of rights']
});

addStandard({
  code: '5.3.8.F',
  subject: 'Social Studies',
  grade: '8',
  domain: '5.3 How Government Works: Voting & Elections',
  anchor: 'How Government Works.',
  description: 'Explain the role of political parties, interest groups, the media, and voting in shaping public policy and citizen participation in Pennsylvania and the nation.',
  dok: 'DOK 2',
  crosswalks: ['PA Civics 5.3'],
  next_steps: ['5.3.12.F'],
  keywords: ['elections', 'voting', 'political parties', 'media influence', 'civic duty', 'public policy']
});

addStandard({
  code: '6.1.8.A',
  subject: 'Social Studies',
  grade: '8',
  domain: '6.1 Economics: Scarcity & Choices',
  anchor: 'Scarcity and Choice in Market Economies.',
  description: 'Explain how limited resources force individuals, businesses, and governments to make economic choices (opportunity cost, supply and demand, incentives).',
  dok: 'DOK 2',
  crosswalks: ['PA Economics Standards'],
  next_steps: ['6.1.12.A'],
  keywords: ['opportunity cost', 'scarcity', 'supply and demand', 'market economy', 'trade-offs']
});

addStandard({
  code: '7.1.8.A',
  subject: 'Social Studies',
  grade: '8',
  domain: '7.1 Geography: Basic Geographic Literacy',
  anchor: 'Physical and Human Geography of Pennsylvania and the US.',
  description: 'Use geographic tools (GIS, topographic maps, thematic maps) to analyze spatial patterns and explain the physical features of Pennsylvania (Allegheny Plateau, Ridge and Valley, Piedmont, Coastal Plain).',
  dok: 'DOK 2',
  crosswalks: ['PA Geography 7.1'],
  next_steps: ['7.1.12.A'],
  keywords: ['geography', 'topographic maps', 'Allegheny plateau', 'ridge and valley', 'PA physical geography']
});

addStandard({
  code: '8.2.8.B',
  subject: 'Social Studies',
  grade: '8',
  domain: '8.2 Pennsylvania History',
  anchor: 'Pennsylvania History: Contributions to American Society.',
  description: 'Evaluate the social, political, and economic contributions of individuals and groups in Pennsylvania history (e.g., William Penn, Benjamin Franklin, anthracite coal miners, steel industry pioneers, labor movements).',
  dok: 'DOK 3',
  crosswalks: ['PA History 8.2'],
  next_steps: ['8.2.12.B'],
  keywords: ['William Penn', 'Ben Franklin', 'coal mining', 'steel mills', 'labor movement', 'PA history', 'industrial revolution']
});

addStandard({
  code: '8.3.8.C',
  subject: 'Social Studies',
  grade: '8',
  domain: '8.3 United States History',
  anchor: 'United States History: American Revolution & Constitutional Era.',
  description: 'Analyze how the American Revolution, the Declaration of Independence, and the drafting of the U.S. Constitution in Philadelphia created a new nation and defined democratic ideals.',
  dok: 'DOK 3',
  crosswalks: ['PA History 8.3'],
  next_steps: ['8.3.12.C'],
  keywords: ['American Revolution', 'Declaration of Independence', 'Constitutional Convention', 'Philadelphia', 'Founding Fathers']
});

// Output compilation statistics
console.log(`Successfully compiled ${standards.length} high-fidelity PA standards across all 4 subjects!`);

const outputDir = path.resolve(__dirname, '../src/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'standards.json');
fs.writeFileSync(outputPath, JSON.stringify(standards, null, 2), 'utf-8');

const stats = {
  total: standards.length,
  by_subject: standards.reduce((acc, s) => { acc[s.subject] = (acc[s.subject] || 0) + 1; return acc; }, {}),
  by_grade: standards.reduce((acc, s) => { acc[s.grade] = (acc[s.grade] || 0) + 1; return acc; }, {}),
  updated_at: new Date().toISOString()
};

fs.writeFileSync(path.join(outputDir, 'stats.json'), JSON.stringify(stats, null, 2), 'utf-8');
console.log('Dataset Stats:', stats);
