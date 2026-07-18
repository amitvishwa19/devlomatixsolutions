import { authOptions } from './src/app/api/auth/[...nextauth]/options.js';
import { getConversations } from './src/app/workspace/[workspaceId]/konnectx/chats/_actions/get-conversations.js';

console.log("Imports succeeded!");
console.log("authOptions provider count:", authOptions.providers.length);
console.log("getConversations type:", typeof getConversations);
