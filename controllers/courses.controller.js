import Course from "../models/course.model.js";
import AppError from '../utils/error.utils.js'
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

const getAllCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({}).select('-lectures')

        res.status(200).json({
            success: true,
            message: 'All courses',
            courses
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const getLectureById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);

        res.status(200).json({
            success: true,
            message: 'Course lecture fetched successfully',
            lectures: course.lectures
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }

}

const createCourse = async function (req, res, next) {
    try {
        const { tittle, description, category, createdBy } = req.body;

        if (!tittle || !description || !category || !createdBy) {
            return next(new AppError('All fields are required', 400))
        }
        const course = await Course.create({
            tittle,
            description,
            category,
            createdBy,
            thumbnail: {
                public_id: 'email',
                secure_url: 'dummy'
            }
        })
        if (!course) {
            return next(new AppError('Course not created,Try again', 400))
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill'
            })
            if (result) {
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
                course.markModified('thumbnail')
            }
            await fs.rm(`./uploads/${req.file.filename}`)
        }
        await course.save()

       res.status(200).json({
         success: true,
         message: 'course created successfully',
         course
       }) 

    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}

const updateCourse = async function (req,res,next) {
    try {
        const {id} = req.params
    
        const course = await Course.findByIdAndUpdate(id,
            {
               $set: req.body
            },
            {
                runValidators: true,
                new: true
            }
        )
        if(! course){
            return next(new AppError('course not exist',400))
        }
        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            course
        })
    } catch (error) {
        return next(new AppError(error.message,400))
    }
}

const deleteCourse = async function (req,res,next) {
    try {
        const {id} = req.params
    
        const course = await Course.findByIdAndDelete(id)
    
        if(!course){
            return next(new AppError('course not deleted',401))
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        })
    } catch (error) {
        return next(new AppError(error.message,401))
    }
}

export { getAllCourses, getLectureById, createCourse, updateCourse, deleteCourse }