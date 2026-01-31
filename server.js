require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const admin = require("./firebase");


const app = express();
const PORT = process.env.PORT || 5000;




// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST","PUT","DELETE","PATCH","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));
app.use(express.json());


const CustomerDetail = require("./models/CustomerDetail");

// Route



const axios = require("axios");

app.post("/users", async (req, res) => {
  try {
    const order = new CustomerDetail(req.body);
    const savedOrder = await order.save();

    // await axios.post("https://app.nativenotify.com/api/notification", {
    //   appId: process.env.NATIVENOTIFY_APP_ID,
    //   appToken: process.env.NATIVENOTIFY_APP_TOKEN,
    //   title: "Order Received",
    //   body: `Order recieved process it`,
    // });

    res.status(201).json({
      message: "Order saved & notification sent",
      data: savedOrder
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed" });
  }
});


app.get("/newusers", async (req, res) => {
  try {
    const orders = await CustomerDetail
      .find({ read: "0" })
      .sort({ createdAt: -1 });

  res.status(200).json(orders);
  } 
    catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});






app.put("/updateusers", async (req, res) => {
  const { orderId,action } = req.body; 
  try {
    // Find the order by vehicle and read = "0" (new order)
    // const updatedOrder = await CustomerDetail.findOneAndUpdate(
    //   { orderId: orderId, read: "0" },
    //   { read: action},    
    //   { new: true }                   
    // );
  const updatedOrder = await CustomerDetail.findOneAndUpdate(
      { orderId: Number(orderId) }, // important
      { read: action },
      { new: true }
    );

    console.log(updatedOrder)

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found or already read" });
    }

    res.status(200).json(updatedOrder);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
});



app.get("/readusers", async (req, res) => {
  try {
    const orders = await CustomerDetail
      // .find({ read: "1" })
      .find({ read: { $in: ["1", "2"] } })
      .sort({ createdAt: -1 });

  res.status(200).json(orders);


  } 
    catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});




app.get("/", (req, res) => {
  // handle the route
  res.send("Hello, world!"); 
});




app.post("/getStatus", async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: "orderId is required" });
  }

  try {
    const order = await CustomerDetail
      .findOne({ orderId })
      .sort({ createdAt: -1 })


    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      orderId: order.orderId,
      read: order.read
    });

  } catch (error) {
    console.error("getStatus error:", error);
    res.status(500).json({
      message: "Failed to fetch status",
      error: error.message
    });
  }
});




mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  })
  .catch(err => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });
