//const fs = require('fs');
const Tour = require(`./../models/tourModel`);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const qs = require('qs');

exports.aliasTopTours = (req, res, next)=>{
    console.log('Top 5 Cheap Route Hit ✅');
req.query.limit='5'; //everythig is string here**
req.query.sort='-ratingAverage,price';
req.query.fields='name,price,difficulty,summary,ratingAverage';
next();
}

const APIFeatures = require('./../utils/apiFeatures')


exports.getAllTours = catchAsync(async (req, res, next) => {
   
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
    const tours = await features.query;
        //query.sort().select().skip().limit()

    console.log(req.requestTime);
    //SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours: tours
        }
    }) 
})
exports.getTour = catchAsync( async (req, res, next) => {
   
       const tour = await Tour.findById(req.params.id);
       //Tour.findOne({_id: req.params.id})

        if(!tour){
           return next(new AppError('No tour found with this ID', 404))
        }

       res.status(200).json({
             status: 'success',
             data: {
                 tour
             }
         })
})
exports.createTour = catchAsync(
    async (req, res, next) => {
        // const newTour = new Tour({})
        // newTour.save();
            const newTour = await Tour.create(req.body)
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour
                }
            })
        }  
) 


exports.updateTour = catchAsync( async (req, res, next) => {
    
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true//to match with schema
        })

        if(!tour){
            return next(new AppError('No tour found with this ID', 404))
         }
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
    
})
exports.deleteTour = catchAsync( async (req, res, next) => {
   
        const tour = await Tour.findByIdAndDelete(req.params.id);
        if(!tour){
            return next(new AppError('No tour found with this ID', 404))
         }
        res.status(204).json({
            status: 'success',
            data: null
        })
    
})

exports.getTourStats = catchAsync( async (req, res, next) =>{
   
        const stats = await Tour.aggregate([
            {
                $match: {ratingAverage: {$gte: 4.5}}
            },
            {
                $group: {
                   // _id : null,
                   //_id: '$difficulty',
                   _id: {$toUpper: '$difficulty'},
                    numTours: {$sum: 1},
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRating: {$avg: '$ratingAverage'},
                    avgPrice : {$avg: '$price'},
                    minPrice: {$min: '$price'},
                    maxPrice: {$max: '$price'},

                }
            },
            {
                $sort: {avgPrice: -1}
            },
            // {
            //     $match: {
            //         _id: {$ne: 'EASY'}
            //     }
            // } we can repeat stages
            
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
})

exports.getMonthlyPlan = catchAsync( async (req, res, next) =>{
    
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDate'
            },
            {
                $match: {
                    startDate: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: {$month: '$startDate'},
                    numTourStart: {$sum: 1},
                    tours: {$push: '$name'}
                }
            },
            {
                $addFields: {month: '$_id'}
            },
            {
                $project: {
                    _id:0  //to hide id
                }
            },
            {
                $sort: {numTourStart: -1}
            },
            {
                $limit: 27
            }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
})
