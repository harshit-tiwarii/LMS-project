import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    tittle:{
        type: String,
        required: [true,'Tittle is required'],
        trim:true,
        minLength: [6,'Tittle required 6 character'],
        maxLength: [50,'Max length of tittle is 50 character']
    },
    description:{
        type: String,
        required: [true,'description is required'],
        minLength: [10,'Tittle required 10 character'],
        maxLength: [200,'Max length of tittle is 200 character']
    },
    category:{
        type: String,
        required: [true,'category is required']
    },
    thumbnail:{
        public_id:{
            type: String
        },
        secure_url:{
            type: String
        }
    },
    lectures:{
        tittle:{
            type: String
        },
        description:{
            type: String
        },
        lecture:{
            public_id: {
                type: String
            },
            secure_url: {
                type: String
            }
        }

    },
    numberOfLectures:{
        type: Number,
        default: 0
    },
    createdBy:{
        type : String,
        required: [true,'createdBy is required']
    }
},{
    timestamps: true
})

const Course = mongoose.model('Course',courseSchema)

export default Course;