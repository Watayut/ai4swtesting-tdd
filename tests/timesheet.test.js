const Timesheet = require('../src/timesheet');

test('submitting a timesheet with a project name and hours returns true', () => {
  const timesheet = new Timesheet();
  const result = timesheet.submitTimesheet('Project 1', 8);
  expect(result).toBe(true);
});
