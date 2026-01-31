const mongoose = require("mongoose");
const Counter = require("./Counter");

const customerDetailSchema = new mongoose.Schema({
  orderId: { type: Number, unique: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true },
  arrival: { type: String },
  mobile: { type: String },
  vehicle: { type: String },
  payment: { type: String },
  totalcost: { type: Number },
  read: { type: String }
});

customerDetailSchema.pre("save", async function () {
  if (!this.isNew) return;

  const counter = await Counter.findByIdAndUpdate(
    { _id: "orderId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.orderId = counter.seq;
});


module.exports = mongoose.model("CustomerDetail", customerDetailSchema);
