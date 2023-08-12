
const express = require('express');
const admin_route = express();

const adminController = require('../controller/adminController');



admin_route.post('/register',adminController.adminRegister)
admin_route.post('/login',adminController.adminLogin)
admin_route.post('/logout',adminController.adminLogout)
admin_route.post('/editUser',adminController.updateUser)
admin_route.post('/createuser',adminController.createUser)

admin_route.get('/users',adminController.userDetails)
admin_route.get('/deleteUser/:id',adminController.deleteUser)
admin_route.get('/edituser/:id',adminController.editDetails)
admin_route.get('/active',adminController.adminAuthorise)
admin_route.post('/search', adminController.userSearch);


module.exports = admin_route;