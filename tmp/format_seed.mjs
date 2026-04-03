import fs from 'fs';

const rawData = [
  {"id":"cmnd60flz00000sikj9z6yxoo","userId":"cmnbhiehs000058ikhvvibcxx","name":"Standard Text","category":"UTILITY","language":"en_US","type":"text","body":"Hello! This is a standard WhatsApp text template. How are you doing today?","footer":"HealthyFine Solutions","buttons":null,"metadata":null,"status":"APPROVED","createdAt":"2026-03-30 12:29:22.055","updatedAt":"2026-03-30 12:29:22.055","isDefault":true,"platform":"WHATSAPP_BROWSER"},
  {"id":"cmnd60fqq00010sikrn3vkuz1","userId":"cmnbhiehs000058ikhvvibcxx","name":"Image Message","category":"MARKETING","language":"en_US","type":"image","body":"Check out this beautiful image from HealthyFine!","footer":"Health & Wellness","buttons":null,"metadata":"{\"mediaUrl\": \"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80\"}","status":"APPROVED","createdAt":"2026-03-30 12:29:22.226","updatedAt":"2026-03-30 12:29:22.226","isDefault":true,"platform":"WHATSAPP_BROWSER"},
  {"id":"cmnd60fuw00020siksccuvxh1","userId":"cmnbhiehs000058ikhvvibcxx","name":"Video Message","category":"MARKETING","language":"en_US","type":"video","body":"Watch our latest wellness guide video.","footer":"Guided by Experts","buttons":null,"metadata":"{\"mediaUrl\": \"https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4\"}","status":"APPROVED","createdAt":"2026-03-30 12:29:22.376","updatedAt":"2026-03-30 12:29:22.376","isDefault":true,"platform":"WHATSAPP_BROWSER"},
  {"id":"cmnd60fyy00030sik1tb6u9em","userId":"cmnbhiehs000058ikhvvibcxx","name":"Audio Voice Note","category":"UTILITY","language":"en_US","type":"audio","body":"Voice message from your health counselor.","footer":null,"buttons":null,"metadata":"{\"mediaUrl\": \"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3\"}","status":"APPROVED","createdAt":"2026-03-30 12:29:22.522","updatedAt":"2026-03-30 12:29:22.522","isDefault":true,"platform":"WHATSAPP_BROWSER"},
  {"id":"cmnd60g3500040sik8psmpcox","userId":"cmnbhiehs000058ikhvvibcxx","name":"Document Message","category":"UTILITY","language":"en_US","type":"document","body":"Your health report is attached here as a PDF.","footer":"Confidential","buttons":null,"metadata":"{\"mediaUrl\": \"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf\"}","status":"APPROVED","createdAt":"2026-03-30 12:29:22.673","updatedAt":"2026-03-30 12:29:22.673","isDefault":true,"platform":"WHATSAPP_BROWSER"},
  {"id":"cmnd60gbn00060sik1s5fro1a","userId":"cmnbhiehs000058ikhvvibcxx","name":"Interactive Buttons","category":"MARKETING","language":"en_US","type":"interactive-button","body":"Would you like to book a consultation?","footer":"Select an option below","buttons":"[\"Yes, Book Now\", \"Tell me more\", \"Maybe later\"]","metadata":null,"status":"APPROVED","createdAt":"2026-03-30 12:29:22.979","updatedAt":"2026-03-30 12:29:22.979","isDefault":true,"platform":"WHATSAPP_BROWSER"},
  {"id":"cmnd60gfs00070sikn6szbvci","userId":"cmnbhiehs000058ikhvvibcxx","name":"Interactive List","category":"UTILITY","language":"en_US","type":"interactive-group","body":"Please choose your preferred department.","footer":"Tap the button to view options","buttons":null,"metadata":"{\"listButton\": \"View Departments\", \"listSections\": [{\"rows\": [{\"title\": \"OPD\", \"description\": \"Outpatient Department\"}, {\"title\": \"Pharmacy\", \"description\": \"Buy medicines\"}], \"title\": \"General\"}]}","status":"APPROVED","createdAt":"2026-03-30 12:29:23.127","updatedAt":"2026-03-30 12:29:23.127","isDefault":true,"platform":"WHATSAPP_BROWSER"},
  {"id":"cmnd60gjt00080sik1syfj6dq","userId":"cmnbhiehs000058ikhvvibcxx","name":"Carousel Display","category":"MARKETING","language":"en_US","type":"text","body":"Our Top Wellness Packages:\n\n1. Gold Plan - All features included\n2. Silver Plan - Essential features\n3. Bronze Plan - Basic features","footer":"Reply with the plan name to subscribe","buttons":null,"metadata":"{\"plans\": [\"Gold\", \"Silver\", \"Bronze\"], \"isCarousel\": true}","status":"APPROVED","createdAt":"2026-03-30 12:29:23.273","updatedAt":"2026-03-30 12:29:23.273","isDefault":true,"platform":"WHATSAPP_BROWSER"},
  {"id":"cmnd60gnu00090siko4g4xx9t","userId":"cmnbhiehs000058ikhvvibcxx","name":"Disappearing View Once","category":"UTILITY","language":"en_US","type":"text","body":"Your one-time access code is: 9988. This message will disappear.","footer":null,"buttons":null,"metadata":"{\"viewOnce\": true}","status":"APPROVED","createdAt":"2026-03-30 12:29:23.418","updatedAt":"2026-03-30 12:29:23.418","isDefault":true,"platform":"WHATSAPP_BROWSER"},
  {"id":"cmnd8ioit0021lgikzmxtxcom","userId":"cmnbhiehs000058ikhvvibcxx","name":"Carousel Display_copy_633","category":"MARKETING","language":"en_US","type":"carousel","body":"Our Top Wellness Packages:\n\n1. Gold Plan - All features included\n2. Silver Plan - Essential features\n3. Bronze Plan - Basic features","footer":"Reply with the plan name to subscribe","buttons":"[]","metadata":"{\"plans\": [\"Gold\", \"Silver\", \"Bronze\"], \"isCarousel\": true, \"carouselCards\": [{\"title\": \"sdsdsdsd\", \"imageUrl\": \"https://picsum.photos/300\", \"buttonText\": \"View Details\", \"description\": \"sdsdsdsdsd\"}, {\"title\": \"sdssdsdsd\", \"imageUrl\": \"https://picsum.photos/300\", \"buttonText\": \"View Details\", \"description\": \"sdsdsdsd\"}]}","status":"PENDING","createdAt":"2026-03-30 13:39:32.645","updatedAt":"2026-03-30 14:15:07.745","isDefault":false,"platform":"WHATSAPP_BROWSER"}
];

const cleanedData = rawData.map(({ id, userId, createdAt, updatedAt, ...rest }) => rest);

const formattedArray = JSON.stringify(cleanedData, null, 8)
    .replace(/^\[/, '[\n')
    .replace(/\}$/mg, '        }')
    .replace(/\]$/, '    ];');

let seedFileContent = fs.readFileSync('prisma/seeds/seed-wa-browser-template.js', 'utf8');

// The original array in the file spans from "const templatesData = [" to "];"
const startMarker = 'const templatesData = [';
// Finding the ending bracket of templatesData array safely
const arrayRegex = /const templatesData = \[[^]*?\];/m;

seedFileContent = seedFileContent.replace(arrayRegex, `const templatesData = ${formattedArray}`);

fs.writeFileSync('prisma/seeds/seed-wa-browser-template.js', seedFileContent, 'utf8');

console.log('Successfully updated templatesData with provided array.');
