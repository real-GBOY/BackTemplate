

// data policy to filter data based on role
module.exports = {
    President : {
        User: ()=>{},
        Team: ()=>{},
        Role: ()=>{},
        Permission: ()=>{},
        Task: ()=>{},
        Event: ()=>{},
        Feedback: ()=>{},
        Attendance: ()=>{},
    },
    Head :{
        User:(user)=>{{team:user.team}},
        Team:()=>{},
        Task: (user)=>{
            {
                createdBy: user._id
                //if assigned to have the userid
                assignedTo: {$in: [user._id]}
            }
        },
        Event: (user)=>{
            {
                createdBy: user._id
                //if assigned to have the userid
                assignedTo: {$in: [user._id]}
            }
        },
        Feedback: (user)=>{
            {
                submittedBy: user._id
                submittedTo: {$in: [user._id]}
            }
        },
        Attendance: (user)=>{
            {
                user: user._id
                verifiedBy : {$in: [user._id]}
            }
        },
    }

}