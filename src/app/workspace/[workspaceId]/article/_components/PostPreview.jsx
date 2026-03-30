'use client';

import { Facebook, Instagram, Linkedin, Twitter, MessageCircle, Heart, Share2, MoreHorizontal, User } from"lucide-react";
import { cn } from"@/lib/utils";

const FacebookPreview = ({ content, mediaUrls, profileName }) => (
 <div className="bg-white text-black rounded-md shadow-sm border border-gray-200 w-full max-w-[500px] overflow-hidden font-sans">
 <div className="p-3 flex items-center gap-2">
 <div className="w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
 <User className="text-gray-400"size={24} />
 </div>
 <div>
 <p className="text-[14px] font-bold leading-none">{profileName ||"Your Page"}</p>
 <p className="text-[12px] text-gray-500 mt-1">Just now · 🌍</p>
 </div>
 <MoreHorizontal className="ml-auto text-gray-500"size={20} />
 </div>
 <div className="px-3 pb-3">
 <div 
 className="text-[14px] leading-relaxed break-words prose prose-sm max-w-none"
 dangerouslySetInnerHTML={{ __html: content }} 
 />
 </div>
 {mediaUrls.length > 0 && (
 <div className="relative aspect-video bg-gray-100 border-y border-gray-100">
 <img src={mediaUrls[0]} alt="Post media"className="w-full h-full object-cover"/>
 {mediaUrls.length > 1 && (
 <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-bold">
 +{mediaUrls.length - 1} more
 </div>
 )}
 </div>
 )}
 <div className="p-2 border-t border-gray-100 flex items-center justify-around">
 <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[12px] hover:bg-gray-50 px-3 py-1.5 rounded-md flex-1 justify-center cursor-default">
 <Heart size={18} /> Like
 </div>
 <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[12px] hover:bg-gray-50 px-3 py-1.5 rounded-md flex-1 justify-center cursor-default">
 <MessageCircle size={18} /> Comment
 </div>
 <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[12px] hover:bg-gray-50 px-3 py-1.5 rounded-md flex-1 justify-center cursor-default">
 <Share2 size={18} /> Share
 </div>
 </div>
 </div>
);

const InstagramPreview = ({ content, mediaUrls, profileName }) => (
 <div className="bg-white text-black rounded-md shadow-sm border border-gray-200 w-full max-w-[400px] overflow-hidden font-sans">
 <div className="p-3 flex items-center gap-2">
 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
 <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-[1px]">
 <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
 <User size={16} />
 </div>
 </div>
 </div>
 <p className="text-[13px] font-bold">{profileName?.toLowerCase().replace(/\s+/g,'_') ||"your_account"}</p>
 <MoreHorizontal className="ml-auto text-gray-800"size={18} />
 </div>
 <div className="aspect-square bg-gray-50 flex items-center justify-center">
 {mediaUrls.length > 0 ? (
 <img src={mediaUrls[0]} alt="Post media"className="w-full h-full object-cover"/>
 ) : (
 <div className="flex flex-col items-center gap-2 opacity-20">
 <Instagram size={40} />
 <span className="text-[10px] font-bold">Image Content</span>
 </div>
 )}
 </div>
 <div className="p-3">
 <div className="flex items-center gap-4 mb-3">
 <Heart size={24} className="hover:text-red-500 transition-colors"/>
 <MessageCircle size={24} />
 <Share2 size={24} />
 </div>
 <div className="space-y-1">
 <p className="text-[13px] font-bold">1,234 likes</p>
 <div className="text-[13px] leading-relaxed overflow-hidden line-clamp-3">
 <span className="font-bold mr-2">{profileName?.toLowerCase().replace(/\s+/g,'_') ||"user"}</span>
 <span dangerouslySetInnerHTML={{ __html: content.replace(/<[^>]*>/g,'') }} />
 </div>
 <p className="text-[10px] text-gray-400 mt-2">Just now</p>
 </div>
 </div>
 </div>
);

const TwitterPreview = ({ content, mediaUrls, profileName }) => (
 <div className="bg-white text-black rounded-md shadow-sm border border-gray-200 w-full max-w-[500px] p-4 font-sans">
 <div className="flex gap-3">
 <div className="w-10 rounded-full bg-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
 <User className="text-gray-400"size={24} />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-1 mb-0.5">
 <span className="text-[14px] font-bold truncate">{profileName ||"Display Name"}</span>
 <span className="text-[13px] text-gray-500 truncate">@{profileName?.toLowerCase().replace(/\s+/g,'') ||"handle"} · now</span>
 </div>
 <div 
 className="text-[14px] leading-normal mb-3 whitespace-pre-wrap break-words"
 dangerouslySetInnerHTML={{ __html: content.replace(/<[^>]*>/g,'') }} 
 />
 {mediaUrls.length > 0 && (
 <div className="rounded-md overflow-hidden border border-gray-100 bg-gray-50 max-h-[300px]">
 <img src={mediaUrls[0]} alt="Tweet media"className="w-full h-full object-cover"/>
 </div>
 )}
 <div className="flex items-center justify-between mt-3 max-w-[400px] text-gray-500">
 <MessageCircle size={16} />
 <Share2 size={16} />
 <Heart size={16} />
 <div className="flex items-center gap-1">
 <div className="w-4 h-4 rounded bg-gray-200"/>
 </div>
 </div>
 </div>
 </div>
 </div>
);

const LinkedInPreview = ({ content, mediaUrls, profileName }) => (
 <div className="bg-white text-black rounded-md shadow-sm border border-gray-200 w-full max-w-[500px] overflow-hidden font-sans">
 <div className="p-3 flex items-center gap-2">
 <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
 <User className="text-gray-400"size={32} />
 </div>
 <div>
 <p className="text-[14px] font-bold leading-none">{profileName ||"Professional Name"}</p>
 <p className="text-[11px] text-gray-500 mt-1">Thought Leader • Now · 🌐</p>
 </div>
 <MoreHorizontal className="ml-auto text-gray-500"size={20} />
 </div>
 <div className="px-3 pb-3">
 <div 
 className="text-[14px] leading-relaxed break-words prose prose-sm max-w-none line-clamp-4"
 dangerouslySetInnerHTML={{ __html: content }} 
 />
 {content.length > 200 && <span className="text-[14px] text-gray-500 font-bold hover:underline cursor-pointer">...see more</span>}
 </div>
 {mediaUrls.length > 0 && (
 <div className="bg-gray-100 border-y border-gray-200">
 <img src={mediaUrls[0]} alt="LinkedIn media"className="w-full h-full object-cover"/>
 </div>
 )}
 <div className="p-2 px-4 border-t border-gray-100 flex items-center justify-between text-gray-500 text-[10px]">
 <div className="flex items-center -space-x-1">
 <div className="w-4 h-4 rounded-full bg-blue-500 border border-white flex items-center justify-center"><Heart size={8} className="text-white fill-current"/></div>
 <div className="w-4 h-4 rounded-full bg-green-500 border border-white flex items-center justify-center"><Linkedin size={8} className="text-white bg-green-500"/></div>
 </div>
 <span>12 comments • 5 reposts</span>
 </div>
 <div className="p-1 px-4 border-t border-gray-100 flex items-center justify-around">
 <div className="flex items-center gap-2 text-gray-500 font-bold text-[12px] hover:bg-gray-100 px-3 py-2 rounded flex-1 justify-center cursor-default transition-colors">
 <Heart size={16} /> Like
 </div>
 <div className="flex items-center gap-2 text-gray-500 font-bold text-[12px] hover:bg-gray-100 px-3 py-2 rounded flex-1 justify-center cursor-default transition-colors">
 <MessageCircle size={16} /> Comment
 </div>
 <div className="flex items-center gap-2 text-gray-500 font-bold text-[12px] hover:bg-gray-100 px-3 py-2 rounded flex-1 justify-center cursor-default transition-colors">
 <Share2 size={16} /> Repost
 </div>
 </div>
 </div>
);

export const SinglePostPreview = ({ platformKey, content, mediaUrls, accounts }) => {
 // Find account details for this platform
 const account = accounts?.find(acc => 
 acc.platform?.toUpperCase() === platformKey.toUpperCase() || 
 acc.id === platformKey
 );
 const name = account?.profileName || account?.name;
 const platform = account?.platform?.toUpperCase() || platformKey.toUpperCase();

 switch (platform) {
 case'FACEBOOK':
 return <FacebookPreview content={content} mediaUrls={mediaUrls} profileName={name} />;
 case'INSTAGRAM':
 return <InstagramPreview content={content} mediaUrls={mediaUrls} profileName={name} />;
 case'TWITTER':
 return <TwitterPreview content={content} mediaUrls={mediaUrls} profileName={name} />;
 case'LINKEDIN':
 return <LinkedInPreview content={content} mediaUrls={mediaUrls} profileName={name} />;
 default:
 return null;
 }
};

export const PostPreview = ({ platforms, content, mediaUrls, accounts }) => {
 if (!platforms || platforms.length === 0) {
 return (
 <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/10 rounded-md bg-muted/5">
 <Share2 className="w-12 h-12 mb-4 text-muted-foreground opacity-20"/>
 <h3 className="text-sm font-bold text-muted-foreground opacity-60">No Platforms Selected</h3>
 <p className="text-xs text-muted-foreground opacity-40 mt-2">Select at least one account in the sidebar to view previews</p>
 </div>
 );
 }

 return (
 <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in fade-in duration-500 pb-12">
 {platforms.map((platform) => {
 return (
 <div key={platform} className="space-y-4">
 <div className="flex items-center gap-2 ml-1">
 <span className="text-[10px] text-muted-foreground bg-muted/30 px-3 py-1 rounded-full border border-border/10">
 {platform.split('_')[0]} Preview
 </span>
 </div>
 <div className="flex justify-center bg-muted/10 p-6 rounded-md border border-border/5 group-hover:scale-[1.01] transition-transform">
 <SinglePostPreview platformKey={platform} content={content} mediaUrls={mediaUrls} accounts={accounts} />
 </div>
 </div>
 );
 })}
 </div>
 );
};