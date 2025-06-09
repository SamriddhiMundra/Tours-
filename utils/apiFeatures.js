const qs = require('qs');

class APIFeatures{
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    filter(){
        const queryObj = qs.parse(this.queryStr || this.query);
         const excludedFields = ['page', 'sort', 'limit', 'fields'];
         excludedFields.forEach(el => delete queryObj[el]);

        // //1b) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        const mongoFormatted = JSON.parse(queryStr);
        console.log(mongoFormatted);
    this.query = this.query.find(mongoFormatted);
    return this;
    }

    sort(){
        if(this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(',').join(' ');
            console.log(sortBy);
            this.query = this.query.sort(sortBy);
        }else{
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }

    limitFields(){
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select('-__v')
        }
        return this;
    }

    paginate(){
        const page = this.queryStr.page*1 || 1;
        const limit = this.queryStr.limit*1 || 100;
        const skip = (page-1)*limit;
        //page=2&limit=10 1-10page1, 11-20page2 21-30page3
        //query = query.skip(10).limit(10)
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}
module.exports = APIFeatures;