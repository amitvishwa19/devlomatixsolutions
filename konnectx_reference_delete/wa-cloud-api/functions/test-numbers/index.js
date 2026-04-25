// Wraps existing helpers in lib/testNumbers so the page can swap import source without behavior change.
export {
  getTestNumbers as listTestNumbers,
  addTestNumber,
  updateTestNumber,
  removeTestNumber,
  bulkImportTestNumbers,
} from "../../lib/testNumbers";