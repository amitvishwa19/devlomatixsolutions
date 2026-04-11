const fetch = require('node-fetch');

async function testContacts() {
    const userId = 'cmnbhifag000058ikv4p5z6r7'; // Example userId from previous logs or session
    const workspaceId = 'cmnbhifag000458ikwhv1zso2';
    
    try {
        const res = await fetch(`http://localhost:3000/api/wa/contacts?userId=${userId}&workspaceId=${workspaceId}`);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Data:', data);
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testContacts();
