import jwt from 'jsonwebtoken';

export const verifyUser = (permissions) => {
    return (req, res, next) => {
        const token = req.cookies.token;
        if(!token){
            return res.json({Error: "You are not authenticated!", role: "guest", username: "guest"})
        } else{
            jwt.verify(token, process.env.JWTSECRET, (err, decoded) =>{
                if(err){
                    return res.json({Error:"Invalid or expired token", role: "guest", username:"guest"})
                } else{
                    req.role = decoded.role;
                    req.username = decoded.username;
                    req.id = decoded.id;
                    req.email = decoded.email;
                    if(permissions.includes(req.role)){
                        next();
                    } else{
                        return res.json({Error: "You are not authorized!", role: decoded.role, username: decoded.username});
                    }
                }
            })
        }
    }
};

export const getUser = () => {
    return (req, res, next) => {
        const token = req.cookies.token;
        if(!token) {
            req.role = "guest";
            req.username= "guest";
            next();
        } else{
            jwt.verify(token, process.env.JWTSECRET, (err, decoded) =>{
                if(err){
                    return res.json({Error:"Ooops, your token is expired! Please log in or refresh the page to continue as guest", role:"guest", username:"guest"})
                } else{
                    req.role = decoded.role;
                    req.username = decoded.username;
                    req.id = decoded.id;
                    req.email = decoded.email;
                    next();
                }
            })
        }
    }
};


