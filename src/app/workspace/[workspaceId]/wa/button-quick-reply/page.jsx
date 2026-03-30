// @ts-nocheck
'use client';

import React, { useState } from'react';
import {
 MessageSquare,
 Image as ImageIcon,
 Video,
 Music,
 FileText,
 MapPin,
 Phone,
 ExternalLink,
 MessageCircle,

 Send,

 MoreVertical,
 Paperclip,
 Mic,
 Sticker,
 Check,
 CheckCheck } from
'lucide-react';

// Type definitions






















// Types for message and button types
const MessageTypes = {
 TEXT:'text',
 IMAGE:'image',
 VIDEO:'video',
 AUDIO:'audio',
 DOCUMENT:'document',
 LOCATION:'location'
};

const ButtonTypes = {
 QUICK_REPLY:'quick_reply',
 CALL:'call',
 URL:'url'
};

// Default messages for each type
const DEFAULT_MESSAGES = {
 [MessageTypes.TEXT]: {
 content:'Hello! 👋 How can we help you today? We offer:\n\n• Doctor appointments\n• Lab tests\n• Medical consultations\n• Prescription refills',
 delay: 0
 },
 [MessageTypes.IMAGE]: {
 url:'https://picsum.photos/seed/healthyfine/400/300',
 caption:'Our clinic location and operating hours',
 delay: 0
 },
 [MessageTypes.VIDEO]: {
 url:'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
 thumbnail:'https://picsum.photos/seed/video/400/300',
 caption:'Virtual consultation guide',
 duration:'02:15',
 delay: 0
 },
 [MessageTypes.AUDIO]: {
 url:'https://sample-videos.com/audio/mp3/crowd-cheering.mp3',
 duration:'00:45',
 delay: 0
 },
 [MessageTypes.DOCUMENT]: {
 url:'https://sample-videos.com/pdf/Sample-Sales-Report.pdf',
 filename:'HealthyFine_Services.pdf',
 filesize:'2.4 MB',
 delay: 0
 },
 [MessageTypes.LOCATION]: {
 latitude: 19.0760,
 longitude: 72.8777,
 address:'HealthyFine Clinic, Mumbai, India',
 delay: 0
 }
};

// Quick reply options
const QUICK_REPLY_OPTIONS = [
{ id:'1', text:'Book Appointment'},
{ id:'2', text:'View Doctors'},
{ id:'3', text:'Check Reports'},
{ id:'4', text:'Billing'},
{ id:'5', text:'Pharmacy'},
{ id:'6', text:'Contact Us'}];


// Message Card Component
const MessageCard = ({ type, isBot = true }) => {
 const message = DEFAULT_MESSAGES[type];

 const renderContent = () => {
 switch (type) {
 case MessageTypes.TEXT:
 return (
 <div className="text-sm text-gray-800">
 {message.content.split('\\n').map((line, index) =>
 <p key={index} className={index > 0 ?'mt-1':''}>
 {line}
 </p>
 )}
 </div>);


 case MessageTypes.IMAGE:
 return (
 <div className="space-y-2">
 <div className="relative rounded-md overflow-hidden">
 <img
 src={message.url}
 alt="Message image"
 className="w-full max-w-xs h-auto"/>
 
 </div>
 <p className="text-sm text-gray-800">
 {message.caption}
 </p>
 </div>);


 case MessageTypes.VIDEO:
 return (
 <div className="space-y-2">
 <div className="relative rounded-md overflow-hidden">
 <img
 src={message.thumbnail}
 alt="Video thumbnail"
 className="w-full max-w-xs h-auto"/>
 
 <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
 <Video className="w-10 text-white"/>
 </div>
 <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
 {message.duration}
 </div>
 </div>
 <p className="text-sm text-gray-800">
 {message.caption}
 </p>
 </div>);


 case MessageTypes.AUDIO:
 return (
 <div className="space-y-2">
 <div className="bg-gray-100 rounded-md p-4 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <Music className="w-6 h-6 text-gray-600"/>
 <div>
 <p className="text-sm font-medium text-gray-800">
 Audio Message
 </p>
 <p className="text-xs text-gray-600">
 {message.duration}
 </p>
 </div>
 </div>
 </div>
 </div>);


 case MessageTypes.DOCUMENT:
 return (
 <div className="space-y-2">
 <div className="bg-gray-100 rounded-md p-4 flex items-center gap-4">
 <FileText className="w-12 h-12 text-gray-600"/>
 <div className="flex-1">
 <p className="text-sm font-medium text-gray-800">
 {message.filename}
 </p>
 <p className="text-xs text-gray-600">
 {message.filesize}
 </p>
 </div>
 </div>
 </div>);


 case MessageTypes.LOCATION:
 return (
 <div className="space-y-2">
 <div className="bg-gray-100 rounded-md overflow-hidden">
 <div className="relative w-full h-32 bg-blue-100">
 <MapPin className="w-8 h-8 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"/>
 </div>
 </div>
 <div className="flex items-center gap-2 text-sm text-gray-800">
 <MapPin className="w-4 h-4"/>
 <p>{message.address}</p>
 </div>
 </div>);


 default:
 return null;
 }
 };

 return (
 <div className={`flex ${isBot ?'justify-start':'justify-end'} mb-4`}>
 <div className={`max-w-xs rounded-md p-3 ${isBot ?
'bg-white text-gray-800':
'bg-green-500 text-white'}`
 }>
 {renderContent()}
 <div className={`text-[10px] mt-1 ${isBot ?'text-gray-500':'text-green-100'} flex items-center gap-1`}>
 <span>10:30</span>
 {isBot && <Check className="w-3 h-3"/>}
 {!isBot && <CheckCheck className="w-3 h-3"/>}
 </div>
 </div>
 </div>);

};

// Button Quick Reply Component
const ButtonQuickReply = ({ type, quickReplies = [] }) => {
 const renderQuickReplies = () => {
 return (
 <div className="flex flex-wrap gap-2 mt-3">
 {quickReplies.map((reply) =>
 <button
 key={reply.id}
 onClick={() => alert(`Selected: ${reply.text}`)}
 className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors border border-gray-200">
 
 {reply.text}
 </button>
 )}
 </div>);

 };

 const renderCallButton = () => {
 return (
 <div className="flex items-center gap-3 mt-4 bg-white p-3 rounded-md border">
 <Phone className="w-5 h-5 text-green-600"/>
 <div className="flex-1">
 <p className="text-sm font-medium text-gray-800">
 Call Support
 </p>
 <p className="text-xs text-gray-600">
 +91 98765 43210
 </p>
 </div>
 <button
 onClick={() => alert('Calling...')}
 className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-600 transition-colors">
 
 Call Now
 </button>
 </div>);

 };

 const renderURLButton = () => {
 return (
 <div className="flex items-center gap-3 mt-4 bg-white p-3 rounded-md border">
 <ExternalLink className="w-5 h-5 text-blue-600"/>
 <div className="flex-1">
 <p className="text-sm font-medium text-gray-800">
 Visit Website
 </p>
 <p className="text-xs text-gray-600">
 healthyfine.com
 </p>
 </div>
 <button
 onClick={() => alert('Opening website...')}
 className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-600 transition-colors">
 
 Visit Site
 </button>
 </div>);

 };

 return (
 <div className="space-y-4">
 <div className="text-sm font-medium text-gray-700 mb-2">
 {type === ButtonTypes.QUICK_REPLY ?'Quick Reply Options':
 type === ButtonTypes.CALL ?'Call Button':'URL Button'}
 </div>

 {type === ButtonTypes.QUICK_REPLY && renderQuickReplies()}
 {type === ButtonTypes.CALL && renderCallButton()}
 {type === ButtonTypes.URL && renderURLButton()}
 </div>);

};

export default function ButtonQuickReplyPage() {
 const [activeMessageType, setActiveMessageType] = useState(MessageTypes.TEXT);
 const [activeButtonType, setActiveButtonType] = useState(ButtonTypes.QUICK_REPLY);
 const [selectedQuickReplies, setSelectedQuickReplies] = useState([]);
 const [messageInput, setMessageInput] = useState('');

 const messageTypes = [
 { type: MessageTypes.TEXT, label:'Text', icon: MessageSquare },
 { type: MessageTypes.IMAGE, label:'Image', icon: ImageIcon },
 { type: MessageTypes.VIDEO, label:'Video', icon: Video },
 { type: MessageTypes.AUDIO, label:'Audio', icon: Music },
 { type: MessageTypes.DOCUMENT, label:'Document', icon: FileText },
 { type: MessageTypes.LOCATION, label:'Location', icon: MapPin }];


 const buttonTypes = [
 { type: ButtonTypes.QUICK_REPLY, label:'Quick Reply', icon: MessageCircle },
 { type: ButtonTypes.CALL, label:'Call', icon: Phone },
 { type: ButtonTypes.URL, label:'URL', icon: ExternalLink }];


 const quickReplies = [
 { id:'1', text:'Schedule Appointment'},
 { id:'2', text:'View Doctor Availability'},
 { id:'3', text:'Check Lab Reports'},
 { id:'4', text:'Billing & Payments'},
 { id:'5', text:'Pharmacy'},
 { id:'6', text:'Contact Support'}];


 const handleQuickReplyClick = (reply) => {
 setMessageInput(reply.text);
 };

 const handleSendMessage = () => {
 if (messageInput.trim()) {
 alert(`Sending message: ${messageInput}`);
 setMessageInput('');
 }
 };

 return (
 <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
 {/* Header */}
 <div>
 <h1 className="text-3xl font-bold text-white mb-2">Button & Quick Reply</h1>
 <p className="text-[#A0AEC0]">Create interactive rich message templates with all message and button types</p>
 </div>

 {/* Controls */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Message Type Selector */}
 <div className="bg-[#1E293B] rounded-md p-5 border border-slate-700">
 <label className="block text-sm font-medium text-white mb-4">
 Message Types
 </label>
 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
 {messageTypes.map(({ type, label, icon: Icon }) =>
 <button
 key={type}
 onClick={() => setActiveMessageType(type)}
 className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-all ${activeMessageType === type ?
'bg-green-500 border-green-500 text-white':
'bg-slate-800 border-slate-600 text-gray-300 hover:border-green-400 hover:bg-slate-700'}`
 }>
 
 <Icon className="w-4 h-4"/>
 <span className="text-sm font-medium">{label}</span>
 </button>
 )}
 </div>
 </div>

 {/* Button Type Selector */}
 <div className="bg-[#1E293B] rounded-md p-5 border border-slate-700">
 <label className="block text-sm font-medium text-white mb-4">
 Button Types
 </label>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 {buttonTypes.map(({ type, label, icon: Icon }) =>
 <button
 key={type}
 onClick={() => setActiveButtonType(type)}
 className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-all ${activeButtonType === type ?
'bg-green-500 border-green-500 text-white':
'bg-slate-800 border-slate-600 text-gray-300 hover:border-green-400 hover:bg-slate-700'}`
 }>
 
 <Icon className="w-4 h-4"/>
 <span className="text-sm font-medium">{label}</span>
 </button>
 )}
 </div>
 </div>
 </div>

 {/* WhatsApp Preview */}
 <div className="bg-[#111827] rounded-md overflow-hidden border border-slate-700">
 <div className="max-w-md mx-auto">
 {/* Chat Header */}
 <div className="bg-green-600 p-4 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 bg-white rounded-full flex items-center justify-center">
 <span className="text-green-600 font-semibold text-sm">HF</span>
 </div>
 <div>
 <h3 className="text-white font-semibold text-sm">HealthyFine</h3>
 <p className="text-green-100 text-xs">Online</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <Video className="w-5 h-5 text-white"/>
 <Phone className="w-5 h-5 text-white"/>
 <MoreVertical className="w-5 h-5 text-white"/>
 </div>
 </div>

 {/* Chat Messages */}
 <div className="bg-[#0A0A0A] p-4 min-h-[450px] max-h-[500px] overflow-y-auto">
 {/* Date separator */}
 <div className="flex justify-center mb-4">
 <span className="text-xs text-gray-500 bg-[#1E293B] px-3 py-1 rounded-full">Today</span>
 </div>

 {/* Bot Message */}
 <MessageCard
 type={activeMessageType}
 isBot={true} />
 

 {/* Quick Reply Buttons */}
 <div className="mt-4">
 <ButtonQuickReply
 type={activeButtonType}
 quickReplies={quickReplies} />
 
 </div>

 {/* User Message (Simulated) */}
 <div className="mt-4 flex justify-end">
 <div className="bg-green-500 text-white px-4 py-2 rounded-md max-w-xs">
 <p className="text-sm">Thanks for the information!</p>
 <div className="text-[10px] text-green-100 flex items-center justify-end gap-1 mt-1">
 <span>10:32</span>
 <CheckCheck className="w-3 h-3"/>
 </div>
 </div>
 </div>
 </div>

 {/* Chat Input */}
 <div className="bg-[#1E293B] p-3">
 <div className="flex items-center gap-2">
 <button className="p-2 text-gray-400 hover:text-white transition-colors">
 <Sticker className="w-5 h-5"/>
 </button>
 <button className="p-2 text-gray-400 hover:text-white transition-colors">
 <Paperclip className="w-5 h-5"/>
 </button>
 <input
 type="text"
 value={messageInput}
 onChange={(e) => setMessageInput(e.target.value)}
 placeholder="Type a message..."
 className="flex-1 px-4 py-2 bg-[#2D3748] rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
 onKeyPress={(e) => e.key ==='Enter'&& handleSendMessage()} />
 
 <button className="p-2 text-gray-400 hover:text-white transition-colors">
 <Mic className="w-5 h-5"/>
 </button>
 <button
 onClick={handleSendMessage}
 className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors">
 
 <Send className="w-5 h-5"/>
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Quick Reply Options Grid */}
 <div className="bg-[#1E293B] rounded-md p-5 border border-slate-700">
 <h3 className="text-lg font-semibold text-white mb-4">Quick Reply Options</h3>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
 {QUICK_REPLY_OPTIONS.map((reply) =>
 <button
 key={reply.id}
 onClick={() => handleQuickReplyClick(reply)}
 className="p-3 bg-slate-800 border border-slate-600 rounded-md text-sm text-gray-300 hover:bg-slate-700 hover:border-green-400 transition-all text-center">
 
 {reply.text}
 </button>
 )}
 </div>
 </div>

 {/* Code Examples */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <div className="bg-[#1E293B] rounded-md p-5 border border-slate-700">
 <h3 className="text-lg font-semibold text-white mb-3">Message Types Code</h3>
 <pre className="bg-[#0A0A0A] p-4 rounded-md overflow-x-auto text-sm text-gray-300">
 <code>{`// Text message
const textMessage = {
 type:'text',
 content:'Hello! How can we help?'
}

// Image message
const imageMessage = {
 type:'image',
 url:'https://example.com/image.jpg',
 caption:'Image description'
}

// Video message 
const videoMessage = {
 type:'video',
 url:'https://example.com/video.mp4',
 caption:'Video description',
 duration:'02:15'
}

// Audio message
const audioMessage = {
 type:'audio',
 url:'https://example.com/audio.mp3',
 duration:'00:45'
}

// Document message
const documentMessage = {
 type:'document',
 url:'https://example.com/file.pdf',
 filename:'Document.pdf',
 filesize:'2.4 MB'
}

// Location message
const locationMessage = {
 type:'location',
 latitude: 19.0760,
 longitude: 72.8777,
 address:'Location address'
}`}</code>
 </pre>
 </div>

 <div className="bg-[#1E293B] rounded-md p-5 border border-slate-700">
 <h3 className="text-lg font-semibold text-white mb-3">Button Types Code</h3>
 <pre className="bg-[#0A0A0A] p-4 rounded-md overflow-x-auto text-sm text-gray-300">
 <code>{`// Quick Reply Buttons
const quickReplies = [
 { 
 id:'1', 
 text:'Book Appointment'
 },
 { 
 id:'2', 
 text:'View Doctors'
 },
 {
 id:'3',
 text:'Check Reports'
 }
]

// Call Button
const callButton = {
 type:'call',
 number:'+1234567890',
 label:'Call Support'
}

// URL Button
const urlButton = {
 type:'url',
 url:'https://healthyfine.com',
 label:'Visit Website'
}

// Combined template
const template = {
 message: textMessage,
 buttons: [quickReplies]
}

// Send via API
await sendMessage({
 to: phoneNumber,
 template: template
})`}</code>
 </pre>
 </div>
 </div>
 </div>);

}