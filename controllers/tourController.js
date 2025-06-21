//const fs = require('fs');
const Tour = require(`./../models/tourModel`);
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const qs = require('qs');

exports.aliasTopTours = (req, res, next)=>{
    console.log('Top 5 Cheap Route Hit ✅');
req.query.limit='5'; //everythig is string here**
req.query.sort='-ratingAverage,price';
req.query.fields='name,price,difficulty,summary,ratingAverage';
next();
}



exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, {path: 'reviews'});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync( async (req, res, next) => {
   
//         const tour = await Tour.findByIdAndDelete(req.params.id);
//         if(!tour){
//             return next(new AppError('No tour found with this ID', 404))
//          }
//         res.status(204).json({
//             status: 'success',
//             data: null
//         })
    
// })

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

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {distance, latlng, unit} = req.params;  //destructuring
    const [lat, lng] = latlng.split(',');

    if(!lat || !lng){
        return next(new AppError('Please provide latitute and longitude in the format lat,lng.', 400));
    }
//console.log(distance, latlng, unit);
    //distance in km
    //convert distance to radians
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //earth radius in miles and km

    const tours = await Tour.find({
        startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius]}} //just like mongoose operator only
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const {latlng, unit} = req.params;  //destructuring
    const [lat, lng] = latlng.split(',');

    if(!lat || !lng){
        return next(new AppError('Please provide latitute and longitude in the format lat,lng.', 400));
    }

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001; //to convert to miles or km  

    const distances = await Tour.aggregate([
        {
            $geoNear: { //only geospatial pipeline stage which need to be at first
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1] //convert to number
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
                spherical: true //to use spherical geometry
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})
