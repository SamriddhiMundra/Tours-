//const fs = require('fs');
const Tour = require(`./../models/tourModel`);
exports.aliasTopTours = (req, res, next)=>{
req.query.limit='5';
req.query.sort='-ratingAverage,price';
req.query.fields='name,price,difficulty,summary,ratingAverage';
next();
}

const APIFeatures = require('./../utils/apiFeatures')

exports.getAllTours = async (req, res) => {
    try{
        //BUILD QUERY
        //1.) Filtering
        // const queryObj = {...req.query};
        // const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // excludedFields.forEach(el => delete queryObj[el]);

        // //1b) Advanced filtering
        // let queryStr = JSON.stringify(queryObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        // console.log(JSON.parse(queryStr));
        // console.log(req.query, queryObj);
        // //const tours = await Tour.find({duration:5, difficulty: 'easy'});
        // // {difficulty: 'easy', duration: {$gte: 5}}
        // console.log(req.query)
        // let query = Tour.find(JSON.parse(queryStr));
        // const query = Tour.find()
        // .where('duration')
        // .equals(5)
        // .where('difficulty')
        // .equals('easy');

        //2) SORTING
        // if(req.query.sort){
        //     const sortBy = req.query.sort.split(',').join(' ');
        //     console.log(sortBy);
        //     query = query.sort(sortBy);
        //     //sort('price ratingsaverage')
        // }else{
        //     query = query.sort('-createdAt');
        // }
        //3 FIELD LIMITING
        // if(req.query.fields){
        //     const fields = req.query.fields.split(',').join(' ');
        //     query = query.select(fields);
        // }else{
        //     query = query.select('-__v')
        // }

        //4 PAGINATION
        // const page = req.query.page*1 || 1;
        // const limit = req.query.limit*1 || 100;
        // const skip = (page-1)*limit;
        // //page=2&limit=10 1-10page1, 11-20page2 21-30page3
        // //query = query.skip(10).limit(10)
        // query = query.skip(skip).limit(limit);
        // if(req.query.page){
        //     const numTours = await Tour.countDocuments();
        //     if(skip>=numTours){
        //         throw new Error('This page does not exist');
        //     }
        // }


        //EXECUTE QUERY
        
        //query.sort().select().skip().limit()
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
        const tours = await features.query;
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
        const stats = Tour.aggregate([
            {
                $match: {ratingAverage: {$gte: 4.5}}
            },
            
        ])
    }
    catch(err){
        res.status(400).json({
            status: 'fail',
            message: 'Invalid data sent!'
        })
    }
}
