
const mongoose = require('mongoose');

const validator = require('validator');

const slugify = require('slugify');

const Tour = require('./tourModel');


const reviewSchema = new mongoose.Schema(
    {
      review: {
        type: String,
        required: [true, 'Review cannot be empty!']
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
      },
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
      }
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true }
    }
  );

  reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //to prevent duplicate reviews by same user for same tour
  

  reviewSchema.pre(/^find/, function(next){
    // this.populate({ //this will add 2 extra queries to the find query
    //   //populate tour and user
    //   path: 'tour',
    //   select: 'name'
    //  }).populate({
    //   path: 'user',
    //   select: 'name photo'
    //  })

    this.populate({
      path: 'user',
      select: 'name photo'
     })
     next();
  })


  //static method bhi... mongoose
  reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
      {
        $match: { tour: tourId }
      },
      {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    //console.log(stats);

    
  
    if (stats.length > 0) {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingAverage: stats[0].avgRating
      });
    } else {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingAverage: 4.5
      });
    }
    
  }

  reviewSchema.post('save', async function() {  //-->  cannot put this after Review...bcoz midwar wont contain it
    //this points to current review
    await this.constructor.calcAverageRatings(this.tour);
    
  });

  // Mongoose middleware to handle updates/deletes

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.reviewDoc = await this.findOne(); // Store document before update/delete
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.reviewDoc) {
    await this.reviewDoc.constructor.calcAverageRatings(this.reviewDoc.tour);
  }
});


const Review = mongoose.model('Review', reviewSchema);



module.exports = Review;

