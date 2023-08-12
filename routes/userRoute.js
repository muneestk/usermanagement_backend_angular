
const express = require('express')
const user_route = express()

const userController = require('../controller/userController')
const multer = require('multer')
const upload = multer({ dest : 'uploads/'})

user_route.post('/register',userController.userRegiter)
user_route.post('/login',userController.userLogin)
user_route.post('/logout',userController.userLogout)
user_route.post('/editDetails/:id',userController.editDetails)
user_route.post('/profile',upload.single('image'),userController.userProfile)


user_route.get('/user',userController.userAuthorise)


module.exports = user_route