// Order Model - Updated for local context
import mongoose from 'mongoose';

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: false },
        price: { type: Number, required: true },
        cost: { type: Number, default: 0 }, // snapshot of costPrice, for profit reports
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],
    shippingAddress: {
      streetName: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      landmark: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      required: true,
      default: 'EVC Plus',
    },
    paymentResult: {
      transactionId: { type: String },
      status: { type: String },
      update_time: { type: String },
      payer_phone: { type: String },
    },
    // "Qaybo" — pay the order off in monthly installments
    installmentPlan: {
      enabled: { type: Boolean, default: false },
      installments: [
        {
          amount: { type: Number, required: true },
          dueDate: { type: Date, required: true },
          paid: { type: Boolean, default: false },
          paidAt: { type: Date },
          method: { type: String }, // 'EVC Plus' | 'Cash' | 'Manual'
          reference: { type: String },
        },
      ],
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Paid', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    // Courier assignment + live delivery progress
    delivery: {
      status: {
        type: String,
        enum: ['Unassigned', 'Assigned', 'Picked Up', 'On the Way', 'Delivered'],
        default: 'Unassigned',
      },
      rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      assignedAt: { type: Date },
      events: [
        {
          status: { type: String },
          at: { type: Date, default: Date.now },
          note: { type: String },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order_Somalia || mongoose.model('Order_Somalia', orderSchema);

export default Order;
