//const fs = require('fs');
const Tour = require(`./../models/tourModel`);

const qs = require('qs');

exports.aliasTopTours = (req, res, next)=>{
    console.log('Top 5 Cheap Route Hit ✅');
req.query.limit='5'; //everythig is string here**
req.query.sort='-ratingAverage,price';
req.query.fields='name,price,difficulty,summary,ratingAverage';
next();
}

const APIFeatures = require('./../utils/apiFeatures')

exports.getAllTours = async (req, res) => {
    try{

        //EXECUTE QUERY
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
    }
    catch(err){
res.status(404).json({
    status: 'fail', 
    message:err
})
    }
    
}
exports.getTour = async (req, res) => {
    try{
       const tour = await Tour.findById(req.params.id);
       //Tour.findOne({_id: req.params.id})
       res.status(200).json({
             status: 'success',
             data: {
                 tour
             }
         })
    }
    catch(err){
        res.status(404).json({
            status: 'fail', 
            message:err
        })
    }
}
exports.createTour = async (req, res) => {
        // const newTour = new Tour({})
        // newTour.save();

        try{
            const newTour = await Tour.create(req.body)
            res.status(201).json({
                status: 'success',
                data: {
                    tour: newTour
                }
            })
        }
        catch(err){
            res.status(400).json({
                status: 'fail',
                message: 'Invalid data sent!'
            })
        }
        
    }


exports.updateTour = async (req, res) => {
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true//to match with schema
        })
        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
    } catch(err){
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!'
        })
    }
    
}
exports.deleteTour = async (req, res) => {
    try{
        await Tour.findByIdAndDelete(req.params.id)
        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    catch(err){
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!'
        })
    }
    
}

exports.getTourStats = async (req, res) =>{
    try{
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

    }
    catch(err){
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!'
        })
    }
}

exports.getMonthlyPlan = async (req, res) =>{
    try{
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            }
        ])

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    }
    catch(err){
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!'
        })
    }
}
