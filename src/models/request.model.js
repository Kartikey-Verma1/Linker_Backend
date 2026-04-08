const mongoose = require("mongoose");
const createError = require("../utils/createError");

const requestSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected", "withdrawn"],
            message: `{VALUE} is incorrect status type`
        }
    }
}, {
    timestamps: true
});

requestSchema.index({senderId: 1, receiverId: 1}, {unique: true});

requestSchema.pre("save", function() {
    const request = this;
    if(request.senderId.equals(this.receiverId)) {
        throw createError(400, "Cannot send request to yourself!");
    }
})

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;