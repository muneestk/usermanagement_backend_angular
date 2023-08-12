
const bcrypt = require('bcrypt');
const User = require('../model/userModel')
const jwt = require('jsonwebtoken')
const multer = require('multer')


//-----user registration -----//

const userRegiter = async(req,res) => {
    try {
       
       const emailExist = await User.findOne({email:req.body.email})
       //email exist checking
       if(emailExist){
        return res.status(400).json({
            message: 'User already exists' 
          });
       }else{
        const hashPassword = await bcrypt.hash(req.body.password,10)
       
        const user = new User({
            name:req.body.name,
            email:req.body.email,
            password:hashPassword,
            mobile:req.body.mobileNumber
        })

        const result = await user.save()

        //JWT token

        const {_id} = await user.save()
        const token = jwt.sign({_id:_id},"secret");

        res.cookie("jwt",token,{
            httpOnly:true,
            maxAge: 24 * 60 * 60 * 1000
        })

        res.json({
            user:result
        })


       }
       
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal server error' 
          });
    }
}


//-----userLogin verification -----//

const userLogin = async(req,res) => {
    try {
         console.log(req.body.email,req.body.password);
         const user = await User.findOne({ email: req.body.email });
         if (!user) {
             return res.status(400).json({
                 message: 'User not found'
             });
         }
        console.log(user);
        if (user && !(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(400).json({
                message: 'Password is incorrect'
            });
        }
        

        const token = jwt.sign({_id:user._id},"secret")
        res.cookie('jwt',token,{
            httpOnly:true,
            maxAge: 24 * 60 * 60 * 1000
        })

        res.send({
            message:"success"
        })
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal server error' 
          });
    }
}

//----- user authorised  checking -----//

const userAuthorise = async(req,res) => {
    try {
      const cookie = req.cookies['jwt']
      const claim = jwt.verify(cookie,"secret")
      console.log(claim);

      if(!claim){
        return res.status(404).send({
            message:"unauthenticated"
        })
      }      
      
      const user = await User.findOne({_id:claim._id})
      
      const { password,...data } = await user.toJSON();
      res.send(data)

    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message:'unauthoriser'
        })
    }
}

//-----user logout -----//

const userLogout = async(req,res) => {
    try {
        res.cookie("jwt","",{maxAge:0})
        res.send({
            message:"success"
        })
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message:'internal server error'
        })
    }
}

//-----user profile -----//


const userProfile = async(req,res) => {
    try {

        const cookie = req.cookies['jwt'] ;
        const claims = jwt.verify(cookie,"secret")

        if(!claims){
            return res.status(400).json({
                message: 'user not authenticated'
            });
        }
        console.log(req.file.filename);
        const imageadd = await User.updateMany({_id:claims._id},{$set:{image:req.file.filename}})
        if(imageadd){
            return res.status(200).json({
                message: 'image successfully added'
            });
        }else{
            return res.status(400).json({
                message: 'something went wrong'
            });
        }
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message:'internal server error'
        })
    }
}



//-----user edit details -----//

const editDetails = async(req,res) => {
    try {
        console.log('mfmkf');
        const userData = await User.findOne({_id:req.params.id});
        console.log(userData);
        if(!userData){
            res.send({
                message:"Something went wrong"
            })
        }
        const {password,...data} = userData.toJSON();
        console.log(data);
        res.send(data);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message:'internal server error'
        })
    }
}



module.exports = {
    userRegiter,
    userLogin,
    userAuthorise,
    userLogout,
    userProfile,
    editDetails
}