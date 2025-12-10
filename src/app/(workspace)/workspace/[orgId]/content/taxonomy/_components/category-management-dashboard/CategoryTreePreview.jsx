import PropTypes from 'prop-types';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

const CategoryTreePreview = ({ categories }) => {
    return (
        <div className="bg-surface rounded-lg border border-border shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-text-primary">Category Overview</h2>
                <Link
                    href="/category-tree-management"
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors duration-150"
                >
                    View All
                    <Icon name="ChevronRightIcon" size={16} variant="outline" />
                </Link>
            </div>
            <div className="divide-y divide-border">
                {categories?.map((category) => (
                    <div
                        key={category?.id}
                        className="p-4 hover:bg-muted transition-colors duration-150 cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                                <Icon
                                    name={category?.hasChildren ? 'ChevronRightIcon' : 'FolderIcon'}
                                    size={20}
                                    variant="outline"
                                    className="text-text-secondary"
                                />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-text-primary">{category?.name}</h3>
                                    <p className="text-xs text-text-secondary mt-0.5">{category?.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-text-primary">{category?.itemCount}</p>
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

CategoryTreePreview.propTypes = {
    categories: PropTypes?.arrayOf(
        PropTypes?.shape({
            id: PropTypes?.number?.isRequired,
            name: PropTypes?.string?.isRequired,
            description: PropTypes?.string?.isRequired,
            hasChildren: PropTypes?.bool?.isRequired,
            itemCount: PropTypes?.number?.isRequired,
            tags: PropTypes?.arrayOf(
                PropTypes?.shape({
                    name: PropTypes?.string?.isRequired,
                    color: PropTypes?.string?.isRequired
                })
            )?.isRequired
        })
    )?.isRequired
};

export default CategoryTreePreview;