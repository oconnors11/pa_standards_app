import assert from 'node:assert';
import { 
  getAllNotes, 
  saveAllNotes, 
  addNote, 
  updateNote, 
  deleteNote, 
  getNotesForStandard, 
  exportNotesToCSV, 
  exportNotesToFormattedText 
} from '../src/utils/notesStorage.js';

// Mock localStorage for Node environment
const mockStore = {};
global.localStorage = {
  getItem: (key) => mockStore[key] || null,
  setItem: (key, val) => { mockStore[key] = String(val); },
  removeItem: (key) => { delete mockStore[key]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); }
};
global.window = {
  dispatchEvent: () => {}
};

console.log('Testing notesStorage utility functions...');

// 1. Initial State
assert.deepStrictEqual(getAllNotes(), [], 'Should start with empty notes');

// 2. Add Note - Teacher Lesson Plan (Eureka Math2 Example)
const note1 = addNote({
  standardId: 'std_4_nbt_4',
  standardCode: 'CCSS.MATH.CONTENT.4.NBT.B.4',
  standardTitle: 'Fluently add and subtract multi-digit whole numbers',
  standardSubject: 'Mathematics',
  standardGrade: '4',
  content: 'Eureka Math2 Module 3 Lesson 12: Focus on standard algorithm regrouping strategies.',
  category: 'Lesson Plan'
});

assert.strictEqual(note1.standardCode, 'CCSS.MATH.CONTENT.4.NBT.B.4');
assert.strictEqual(note1.category, 'Lesson Plan');
assert.strictEqual(getAllNotes().length, 1);

// 3. Add Note - Principal Walkthrough Observation Example
const note2 = addNote({
  standardId: 'std_ri_1_1',
  standardCode: 'CCSS.ELA-LITERACY.RI.1.1',
  standardTitle: 'Ask and answer questions about key details in a text',
  standardSubject: 'English Language Arts',
  standardGrade: '1',
  content: 'Principal Walkthrough Room 104: Students were pairing up to ask who/what/where questions about the informational text.',
  category: 'Walkthrough'
});

assert.strictEqual(getAllNotes().length, 2);

// Add Note - Small Group & Differentiation Examples
const note3 = addNote({
  standardId: 'std_ri_1_1',
  standardCode: 'CCSS.ELA-LITERACY.RI.1.1',
  standardSubject: 'English Language Arts',
  standardGrade: '1',
  content: 'Tier 2 guided reading intervention group focusing on textual evidence.',
  category: 'Small Group'
});

const note4 = addNote({
  standardId: 'std_4_nbt_4',
  standardCode: 'CCSS.MATH.CONTENT.4.NBT.B.4',
  standardSubject: 'Mathematics',
  standardGrade: '4',
  content: 'Differentiated graphic organizers for ELL students.',
  category: 'Differentiation'
});

assert.strictEqual(note3.category, 'Small Group');
assert.strictEqual(note4.category, 'Differentiation');
assert.strictEqual(getAllNotes().length, 4);

// 4. Get Notes for Standard
const riNotes = getNotesForStandard('CCSS.ELA-LITERACY.RI.1.1');
assert.strictEqual(riNotes.length, 2);
assert.strictEqual(riNotes.some(n => n.id === note2.id), true);

// 5. Update Note
const updated = updateNote(note2.id, {
  content: 'Principal Walkthrough Room 104: Updated note - strong student engagement with graphic organizers.',
  category: 'Walkthrough'
});
assert.strictEqual(updated.content.includes('graphic organizers'), true);

// 6. CSV Export Test
const csv = exportNotesToCSV(getAllNotes());
assert.strictEqual(csv.includes('CCSS.MATH.CONTENT.4.NBT.B.4'), true);
assert.strictEqual(csv.includes('CCSS.ELA-LITERACY.RI.1.1'), true);
assert.strictEqual(csv.includes('Eureka Math2'), true);

// 7. Formatted Text Export Test
const formatted = exportNotesToFormattedText(getAllNotes());
assert.strictEqual(formatted.includes('# RBCS PA Standards - User Notes'), true);
assert.strictEqual(formatted.includes('CCSS.ELA-LITERACY.RI.1.1'), true);

// 8. Delete Note
const deleted = deleteNote(note1.id);
assert.strictEqual(deleted, true);
assert.strictEqual(getAllNotes().length, 3);

console.log('✅ ALL NOTES FEATURE UNIT TESTS PASSED SUCCESSFULLY!');
