const mongoose = require('mongoose');

const validator = require('validator');

const slugify = require('slugify');

//const User = require('./userModel')

const tourSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'A tour must have a name'], //validator
      unique: true, //not really a validator
      trim: true,
      maxlength: [40, 'A tour name must have less or equal 40 characters'],
      minlength: [10, 'A tour name must have greater or equal 10 characters']
      //validate: [validator.isAlpha, 'Tour names must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']

    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty specified'],
      enum: {values:['easy', 'medium', 'difficult'],
        message:'Difficulty can be easy, medium or hard'
        //enum is for string only
      }
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      //min and max works for numbers and dates
      set: val => Math.round(val * 10) / 10 //roundoffff
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val){
          //this only points to current doc on NEW document creation
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) shoild be less than regular price'
      }
    },
    summary: {
      type: String,
      trim: true , //only works for strings, removes white space in beginning and end of string
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false //to permanently hide from user
    },
    startDate: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates:[Number], //longitude first, then latitude
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    //guides: Array
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
    

  }, 

{
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
})

tourSchema.index({price: 1, ratingAverage: -1}); //performance improve krne k liye!
tourSchema.index({slug: 1}); //to create index on slug field for faster search
tourSchema.index({startLocation: '2dsphere'}); //to create 2d index on startLocation field for geospatial queries

  tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
  })

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review', //model name
  foreignField: 'tour', //field in review model
  localField: '_id' //field in tour model
})

//DOCUMENT MIDDLEWARE
//runs before .save() and .create()
//this save middleware runs only for .save() and .create(); not for findbyID and all...
  tourSchema.pre('save', function(next){
    //console.log(this);
    // eslint-disable-next-line no-undef
    this.slug = slugify(this.name, {lower: true});
    next();
  })

  // tourSchema.pre('save', async function(next) {
  //   const guidesPromises = this.guides.map(async id => await User.findById(id));
  //   this.guides = await Promise.all(guidesPromises)
  //  next();
  // })
  // tourSchema.pre('save', (next) =>{
  //   console.log("Will save document...");
  //   next();
  // })

  // tourSchema.post('save', (doc, next) =>{
  //   console.log(doc);
  //   next();

  // })

  //QUERY MIDDLEWARE
  // tourSchema.pre('find', function(next){
    tourSchema.pre(/^find/, function(next){
    this.find({secretTour: {$ne: true}});
    this.start = Date.now();
    next();
  })
  tourSchema.pre(/^find/, function(next){
    this.populate({
      path: 'guides',
      select: '-__v -passwordChangedAt'
     });
     next();
  })

  tourSchema.post(/^find/, function(doc, next){
    console.log(`Query took ${Date.now() - this.start} milliseconds`);

    //console.log(doc);
    next();
  })


  //AGGREGATION MIDDLEWARE
  // tourSchema.pre('aggregate', function(next){
  //   this.pipeline().unshift({$match: {secretTour: {$ne: true}}})
  //   console.log(this.pipeline());
  //   next();
  // })
  // const Tour = mongoose.model('Tour', tourSchema);

  const Tour = mongoose.model('Tour', tourSchema);
  module.exports = Tour;