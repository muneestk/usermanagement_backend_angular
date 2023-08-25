const bcrypt = require('bcrypt');
const User = require('../model/userModel')
const jwt = require('jsonwebtoken')
const Admin = require('../model/adminModel')



//-----admin registration -----//

const adminRegister = async(req,res) => {
    try {
        const emailExist = await User.findOne({email:req.body.email})

        //email exist checking

        if(emailExist){
         return res.status(400).json({
             message: 'Email already exists' 
           });
        }else{
         const hashPassword = await bcrypt.hash(req.body.password,10)
        
         const admin = new Admin({
             name:req.body.name,
             email:req.body.email,
             password:hashPassword,
             mobile:req.body.mobileNumber
         })
 
         const result = await admin.save()
 
         //JWT token
 
         const {_id} = await admin.save()
        //  const token = jwt.sign({_id:_id},"secretAdmin");

        const token = jwt.sign({ _id: _id, role: 'admin' }, "secretAdmin");

 
         res.cookie("jwt",token,{
             httpOnly:true,
             maxAge: 24 * 60 * 60 * 1000
         })
 
         res.json({
             admin:result
         })
 
 
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message:'internal server error'
        })
    }
}

//-----admin login verification -----//

const adminLogin = async(req,res) => {
    try {
         const admin = await Admin.findOne({ email: req.body.email });
         if (!admin) {
             return res.status(400).json({
                 message: 'User not found'
             });
         }
        console.log(admin);
        if (admin && !(await bcrypt.compare(req.body.password, admin.password))) {
            return res.status(400).json({
                message: 'Password is incorrect'
            });
        }

        const adminVerified = await Admin.findOne({ email : req.body.email , isVerified:false })
        if(adminVerified){
            return res.status(400).json({
                message: 'You are not an admin'
            });
        }
        

        const token = jwt.sign({_id:admin._id},"secretAdmin")
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


//-----userData-----//

const userDetails = async(req,res) => {
    try {
        console.log('in user details');
        const user = await User.find()
        res.status(200).json(user)
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal server error' 
          });
    }
} 


//-----userData searching-----//
const userSearch = async (req, res) => {
    try {
      console.log(req.body.name,'in serach');
      const users = await User.find({
        name: { $regex: req.body.name, $options: 'i' }
      });
      console.log(users);
  
      if (users.length > 0) {
        res.status(200).send(users);
      } else {
        res.status(400).json({ message: "User not found" });
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({
        message: 'Internal server error'
      });
    }
  };
  


//-----user delete-----//

const deleteUser = async (req, res) => {
    try {
        console.log('in delete');
        console.log(req.params.id);
        const userDelete = await User.findByIdAndDelete(req.params.id);

        if (!userDelete) {
            return res.status(400).send({ message: 'Something went wrong!' });
        }

        res.status(200).send({
            message: 'User successfully deleted',
            deletedUser: userDelete
        });
        
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Internal server error'
        });
    }
};


//-----edit user details-----//

const editDetails = async(req,res) => {
    try {
        const data = await User.findById(req.params.id)
        res.status(200).json(data)
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal server error' 
          });
    }
} 


//-----update user details-----//

const updateUser = async(req,res) => {
    try {
        const userData = await User.findByIdAndUpdate(req.body.id,{
            $set:{
                email:req.body.emailChange,
                name:req.body.name,
                mobile:req.body.mobileNumber,
            }
        })
        res.status(200).json({message:'success'})
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal server error' 
          });
    }
} 


//-----create user on admin-----//

const createUser = async(req,res) => {
    try {
        let email=req.body.email
        let password=await bcrypt.hash(req.body.password,10)
        let name=req.body.name

        console.log(req.body.mobileNumber);

        const user = User({
            name:name,
            email:email,
            mobile:req.body.mobileNumber,
            password:password
        })  

        await user.save()

        res.status(200).json({
            message:'user add success'
        })
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message: 'Internal server error' 
          });
    }
} 





//-----admin logout-----//


const adminLogout = async(req,res) => {
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


//-----admin authorise-----//

const adminAuthorise = async(req,res) => {
    try {
        const cookie = req.cookies["jwt"];
        const claims = jwt.verify(cookie,"secretAdmin")
        console.log(claims);
        if(!claims){
         return res.status(401).send({
             message:"unauthenticated"
         })
        } 
 
        const admin = await Admin.findOne({_id:claims._id})
        console.log(admin);
        const {password, ...data} =  admin.toJSON();
        console.log(data);
        res.send(data)
    
    } catch (error) {
        console.log(error.message);
        res.status(500).json({
            message:'internal server error'
        })
    }
}

module.exports = {
    adminRegister,
    adminLogin,
    adminLogout,
    createUser,
    deleteUser,
    editDetails,
    updateUser,
    userDetails,
    adminAuthorise,
    userSearch
}