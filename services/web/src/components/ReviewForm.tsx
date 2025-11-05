// services/web/src/components/ReviewForm.tsx
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Star, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { createReview } from '../lib/api';
import { Review, User } from '../types';

interface ReviewFormProps {
  placeId: string;
  user: User;
  onReviewSubmitted: (newReview: Review) => void;
}

export function ReviewForm({ placeId, user, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    setIsSubmitting(true);
    try {
      const reviewData = {
        placeId: parseInt(placeId, 10), // Ensure API gets a number
        rating,
        comment,
      };
      const response = await createReview(reviewData);
      toast.success('Review submitted successfully!');
      onReviewSubmitted(response.data); // Pass the full review object back
      // Reset form
      setRating(0);
      setComment('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to submit review.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-2 border-brand-yellow shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-brand-burgundy">Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="text-sm font-medium text-brand-burgundy mb-2">Your Rating:</div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-7 w-7 cursor-pointer transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>
          <div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Hi ${user.name}, share your experience at this spot...`}
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" disabled={isSubmitting || rating === 0} className="w-full bg-brand-orange text-brand-cream hover:bg-brand-orange/90 h-11">
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}