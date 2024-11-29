import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';

export default function VendorReviews({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this vendor!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review, index) => (
        <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {format(new Date(review.date), 'MMM d, yyyy')}
              </span>
            </div>
          </div>
          
          <p className="text-gray-700 whitespace-pre-line">{review.review}</p>
          
          {review.photos?.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {review.photos.map((photo, photoIndex) => (
                <div key={photoIndex} className="relative aspect-w-4 aspect-h-3">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Review photo ${photoIndex + 1}`}
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
