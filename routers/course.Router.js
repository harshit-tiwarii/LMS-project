import express from 'express'
const courseRoute = express.Router()
import { authorizedAccess, isLoggedIn } from '../middlewares/auth.middleware.js'
import { createCourse, deleteCourse, getAllCourses, getLectureById, updateCourse } from '../controllers/courses.controller.js'
import upload from '../middlewares/multer.middleware.js'

courseRoute.route('/')
    .get(getAllCourses)
    .post(
        isLoggedIn,
        authorizedAccess('Admin'),
        upload.single('thumbnail'),
        createCourse
    )

courseRoute.route('/:id')
    .get(
        isLoggedIn,
        authorizedAccess('Admin'),
        getLectureById
    )
    .put(
        isLoggedIn,
        authorizedAccess('Admin'),
        updateCourse
    )
    .delete(
        isLoggedIn,
        authorizedAccess('Admin'),
        deleteCourse
    )

export default courseRoute