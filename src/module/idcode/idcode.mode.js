import mongoose from "mongoose";

const IdcodeSchema = new mongoose.Schema({
    idname:{
        type: String,
        required: true
    },
    idcode:{
        type: String,
        required : true
    },
    codes:{
        type: Number,
        required : true
    },
    // zero-padding width for the numeric part (e.g. pad 4 -> L0001)
    pad:{
        type: Number,
        default: 3
    },
});

const IdcodeModel = mongoose.model('idcodes',IdcodeSchema);

export default IdcodeModel;