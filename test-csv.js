const row = 'Vivek Kumar Pandey,919140791918,,Job Application,job|apply|application';
const values = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
console.log(values);
// Let's test a better splitting mechanism
const betterSplit = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
console.log(betterSplit);
