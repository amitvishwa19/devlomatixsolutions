import { useModal } from "@/hooks/useModal";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';


export const PreviewDialouge = ({ open, handleClose, platform, content, hashtags }) => {

    const platformConfigs = {
        twitter: {
            name: 'Twitter',
            icon: 'ChatBubbleLeftIcon',
            color: 'bg-blue-500',
            maxChars: 280,
            avatar: '/assets/images/avatar.jpg'
        },
        facebook: {
            name: 'Facebook',
            icon: 'UserGroupIcon',
            color: 'bg-blue-600',
            maxChars: 63206,
            avatar: '/assets/images/avatar.jpg'
        },
        instagram: {
            name: 'Instagram',
            icon: 'CameraIcon',
            color: 'bg-pink-500',
            maxChars: 2200,
            avatar: '/assets/images/avatar.jpg'
        },
        linkedin: {
            name: 'LinkedIn',
            icon: 'BriefcaseIcon',
            color: 'bg-blue-700',
            maxChars: 3000,
            avatar: '/assets/images/avatar.jpg'
        }
    };


    const config = platformConfigs?.[platform];
    const fullContent = hashtags ? `${content}\n\n${hashtags}` : content;
    const charCount = fullContent?.length;
    const isOverLimit = charCount > config?.maxChars;


    const handleOpenChange = () => {
        handleClose(false)
    }
    return (
        <Dialog open={open} onOpenChange={(e) => { handleOpenChange(e) }}>

            <DialogContent className='dark:bg-darkPrimaryBackground'>

                <DialogHeader className={'hidden'}>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>

                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Platform Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg ${config?.color}`}>
                                <Icon name={config?.icon} size={20} className="text-white" variant="solid" />
                            </div>
                            <span className="text-sm font-semibold text-foreground">{config?.name} Preview</span>
                        </div>
                        <div className={`text-xs font-mono ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {charCount}/{config?.maxChars}
                        </div>
                    </div>
                    {/* Preview Card */}
                    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                        {/* User Info */}
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-border">
                                <AppImage
                                    src={config?.avatar}
                                    alt="User profile picture showing professional headshot"
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Alex Morgan</p>
                                <p className="text-xs text-muted-foreground">Just now</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                            {content ? (
                                <p className={`text-sm text-foreground whitespace-pre-wrap ${isOverLimit ? 'text-destructive' : ''}`}>
                                    {fullContent}
                                </p>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Icon name="DocumentTextIcon" size={48} className="text-muted-foreground mb-3" />
                                    <p className="text-sm text-muted-foreground">
                                        Your generated content will appear here
                                    </p>
                                </div>
                            )}

                            {/* Image Placeholder */}
                            {content && (
                                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center border border-border">
                                    <div className="text-center">
                                        <Icon name="PhotoIcon" size={32} className="text-muted-foreground mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground">Image placeholder</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Engagement Stats */}
                        {content && (
                            <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-border">
                                <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-200">
                                    <Icon name="HeartIcon" size={18} />
                                    <span className="text-xs">0</span>
                                </button>
                                <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-200">
                                    <Icon name="ChatBubbleLeftIcon" size={18} />
                                    <span className="text-xs">0</span>
                                </button>
                                <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-200">
                                    <Icon name="ArrowPathRoundedSquareIcon" size={18} />
                                    <span className="text-xs">0</span>
                                </button>
                            </div>
                        )}
                    </div>
                    {isOverLimit && (
                        <div className="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive rounded-lg">
                            <Icon name="ExclamationTriangleIcon" size={16} className="text-destructive mt-0.5" variant="solid" />
                            <p className="text-xs text-destructive">
                                Content exceeds {config?.name} character limit. Please shorten your content.
                            </p>
                        </div>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    )
}

