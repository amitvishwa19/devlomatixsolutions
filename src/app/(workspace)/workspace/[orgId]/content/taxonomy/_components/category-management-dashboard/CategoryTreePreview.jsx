import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { DynamicIcon } from 'lucide-react/dynamic';

const CategoryTreePreview = ({ categories }) => {

    console.log(categories)
    return (
        <div className="bg-surface rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Category Overview</h2>

            </div>
            <div className="divide-y divide-border">
                {categories?.map((category) => (
                    <div
                        key={category?.id}
                        className="p-4 hover:bg-muted transition-colors duration-150 cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">

                                {category?.icon ? (
                                    <DynamicIcon
                                        name={category?.icon}
                                        size={16}
                                        color={category?.color || 'currentColor'}
                                    />
                                ) : (
                                    <Icon
                                        name={category?.hasChildren ? 'ChevronRightIcon' : 'FolderIcon'}
                                        size={16}
                                        variant="outline"
                                        className={`flex-shrink-0 `}


                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-text-primary">{category?.name}</h3>
                                    <p className="text-xs text-text-secondary mt-0.5">{category?.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-text-primary">{category?.children?.length}</p>
                                    <p className="text-xs text-text-secondary">items</p>
                                </div>

                                <div className="flex items-center gap-1">
                                    {category?.tags?.slice(0, 3)?.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 text-xs font-medium rounded-md"
                                            style={{
                                                backgroundColor: `${tag?.color}20`,
                                                color: tag?.color
                                            }}
                                        >
                                            {tag?.name}
                                        </span>
                                    ))}
                                    {category?.tags?.length > 3 && (
                                        <span className="text-xs text-text-secondary">+{category?.tags?.length - 3}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryTreePreview;