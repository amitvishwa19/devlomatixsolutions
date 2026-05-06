'use client'

import React, { use, useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, CheckCircle, XCircle, Trash2, Loader2, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';
import { getReviews, updateReviewStatus, deleteReview } from './_actions/reviewActions';
import { useAction } from '@/hooks/use-action';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ReviewsPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const workspaceId = params.workspaceId;
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchReviewsList = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getReviews(workspaceId);
            if (res.success) setReviews(res.data);
            else toast.error(res.error);
        } catch (err) {
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        fetchReviewsList();
    }, [fetchReviewsList]);

    const handleStatusUpdate = async (id, status) => {
        try {
            const res = await updateReviewStatus(id, status);
            if (res.success) {
                toast.success(`Review ${status}`);
                fetchReviewsList();
            } else toast.error(res.error);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDeleteClick = (review) => {
        setReviewToDelete(review);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!reviewToDelete) return;
        try {
            const res = await deleteReview(reviewToDelete.id);
            if (res.success) {
                toast.success("Review deleted");
                fetchReviewsList();
            } else toast.error(res.error);
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const filteredReviews = reviews.filter(r => statusFilter === 'all' || r.status === statusFilter);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-white/10'}`} />
        ));
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Star className="w-8 h-8 text-amber-400" />
                        Product Reviews
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Moderate customer feedback and manage product ratings.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
                    {['all', 'pending', 'approved', 'rejected'].map(s => (
                        <Button 
                            key={s} 
                            variant={statusFilter === s ? 'secondary' : 'ghost'} 
                            size="sm" 
                            className="capitalize h-8 px-3 text-xs"
                            onClick={() => setStatusFilter(s)}
                        >
                            {s}
                        </Button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading reviews...</p>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-xl">
                    <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">No reviews found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Once customers leave reviews, they will appear here for moderation.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filteredReviews.map((review) => (
                        <Card key={review.id} className="bg-card/50 border-white/5 hover:bg-card/80 transition-all group">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                                            <User className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-white">{review.customerName || 'Anonymous'}</h3>
                                                {review.isVerified && (
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] uppercase tracking-tighter">Verified Buyer</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mb-3">
                                                {renderStars(review.rating)}
                                                <span className="text-[10px] text-muted-foreground ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`capitalize ${
                                        review.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                        review.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                    }`}>
                                        {review.status}
                                    </Badge>
                                </div>

                                <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5">
                                    {review.title && <p className="font-bold text-sm text-white mb-1">{review.title}</p>}
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        "{review.comment}"
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-white/5 p-1">
                                            {review.product?.imageUrls?.cover ? (
                                                <img src={review.product.imageUrls.cover} className="w-full h-full object-cover rounded" alt="" />
                                            ) : (
                                                <ShoppingBag className="w-full h-full text-muted-foreground/30 p-1" />
                                            )}
                                        </div>
                                        <div className="text-[11px]">
                                            <p className="text-muted-foreground">Review for:</p>
                                            <p className="text-white font-medium truncate max-w-[150px]">{review.product?.title}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        {review.status !== 'approved' && (
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-8 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-400"
                                                onClick={() => handleStatusUpdate(review.id, 'approved')}
                                            >
                                                <CheckCircle className="w-3.5 h-3.5 mr-2" /> Approve
                                            </Button>
                                        )}
                                        {review.status !== 'rejected' && (
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                className="h-8 border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                                                onClick={() => handleStatusUpdate(review.id, 'rejected')}
                                            >
                                                <XCircle className="w-3.5 h-3.5 mr-2" /> Reject
                                            </Button>
                                        )}
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleDeleteClick(review)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-card border-white/5">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This review will be permanently removed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
