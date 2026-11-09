const HALF_HOUR = 0.5;

class Timesheet {
  #timesheets = new Map();

  /**
   * Records `duration` hours against `projectName`.
   * Hours for a project that already exists are added to its running total.
   *
   * @param {string} projectName non-empty project name (trimmed before use)
   * @param {number} duration positive number of hours in half-hour units
   * @returns {true}
   * @throws {TypeError} if the project name or duration is of the wrong type
   * @throws {RangeError} if the duration is not a positive multiple of 0.5
   */
  submitTimesheet(projectName, duration) {
    const key = Timesheet.#normaliseProjectName(projectName);
    const hours = Timesheet.#validateDuration(duration);

    const existing = this.#timesheets.get(key) ?? 0;
    this.#timesheets.set(key, Timesheet.#roundToHalfHour(existing + hours));
    return true;
  }

  /**
   * @returns {number[]} a copy of the recorded hours, one entry per project
   */
  getTimesheets() {
    return [...this.#timesheets.values()];
  }

  /**
   * @param {string} projectName
   * @returns {number} total hours for the project, 0 if the project is unknown
   */
  getTotalTimesheetHours(projectName) {
    const key = Timesheet.#normaliseProjectName(projectName);
    return this.#timesheets.get(key) ?? 0;
  }

  static #normaliseProjectName(projectName) {
    if (typeof projectName !== 'string') {
      throw new TypeError('projectName must be a string');
    }
    const key = projectName.trim();
    if (key.length === 0) {
      throw new RangeError('projectName must not be empty');
    }
    return key;
  }

  static #validateDuration(duration) {
    if (typeof duration !== 'number' || !Number.isFinite(duration)) {
      throw new TypeError('duration must be a finite number');
    }
    if (duration <= 0) {
      throw new RangeError('duration must be greater than 0');
    }
    if (!Number.isInteger(duration / HALF_HOUR)) {
      throw new RangeError('duration must be a multiple of 0.5 hours');
    }
    return duration;
  }

  // Avoid floating-point drift (e.g. 0.1 + 0.2) accumulating across submissions.
  static #roundToHalfHour(hours) {
    return Math.round(hours / HALF_HOUR) * HALF_HOUR;
  }
}

module.exports = Timesheet;
