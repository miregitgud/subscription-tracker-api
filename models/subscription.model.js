import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "subscription name is required"],
      trim: true,
      minLength: [2, "subscription name must be at least 1 character"],
      maxLength: [100, "subscription name must be at most 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be at least 0"],
    },
    currency: {
      type: String,
      enum: ["USD", "EUR", "GBP", "JPY", "IDR"],
      default: "IDR",
    },
    frequency: {
      type: String,
      required: [true, "renewal period is required"],
      enum: ["monthly", "yearly", "weekly", "daily", "custom"],
    },
    category: {
      type: String,
      enum: ["sports", "news", "entertainment", "lifestyle", "technology"],
    },
    paymentMethod: {
      type: String,
      required: [true, "payment method is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: [true, "start date is required"],
      validate: {
        validator: (value) => value < new Date(),
        message: "Start date must be in the past",
      },
    },
    renewalDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "renewal date must be after the start date",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Auto calculate renewalDate if missing.
subscriptionSchema.pre("save", function (next) {
  if (!this.renewalDate) {
    const renewalPeriod = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      yearly: 365,
    };

    this.renewalDate = new Date(this.startDate);
    this.renewalDate.setDate(
      this.renewalDate.getDate() + (renewalPeriod[this.frequency] || 0)
    );
  }

  if (this.renewalDate < new Date()) {
    this.status = "expired";
  }

  next();
});

const subscription = mongoose.model("Subscription", subscriptionSchema);

export default subscription;
