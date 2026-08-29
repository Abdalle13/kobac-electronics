// Branded, email-client-safe HTML templates (inline styles, table-free where possible).

const STORE = 'Kobac Electronics';
const BRAND = '#0066ff';
const BG = '#0b0b0d';
const CARD = '#141417';
const TEXT = '#e7e7ea';
const MUTED = '#9a9aa2';

const money = (n) =>
  `$${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const layout = (heading, bodyHtml, cta) => `
<div style="margin:0;padding:0;background:${BG};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px;">KOBAC <span style="color:${BRAND};">Electronics</span></span>
    </div>
    <div style="background:${CARD};border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:20px;color:${TEXT};">${heading}</h1>
      <div style="font-size:14px;line-height:1.7;color:${MUTED};">${bodyHtml}</div>
      ${
        cta
          ? `<div style="margin-top:28px;text-align:center;">
               <a href="${cta.url}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 28px;border-radius:10px;">${cta.label}</a>
             </div>`
          : ''
      }
    </div>
    <p style="text-align:center;font-size:11px;color:#5a5a63;margin-top:24px;">
      &copy; ${new Date().getFullYear()} ${STORE}. All rights reserved.
    </p>
  </div>
</div>`;

export const welcomeEmail = (name) => ({
  subject: `Welcome to ${STORE}`,
  html: layout(
    `Welcome, ${name} 👋`,
    `Your ${STORE} account is ready. Explore premium phones, laptops, gaming gear and more —
     with fast local delivery and EVC Plus checkout.`,
    { label: 'Start shopping', url: process.env.FRONTEND_URL || '#' }
  ),
});

export const orderConfirmationEmail = (order, user) => {
  const rows = order.orderItems
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;color:${TEXT};">${i.name} <span style="color:${MUTED};">× ${i.qty}</span></td>
        <td style="padding:8px 0;text-align:right;color:${TEXT};">${money(i.price * i.qty)}</td>
      </tr>`
    )
    .join('');

  const addr = order.shippingAddress || {};

  return {
    subject: `Order confirmed · ${money(order.totalPrice)}`,
    html: layout(
      `Thanks for your order, ${user.name}!`,
      `We've received your order <strong style="color:${TEXT};">#${String(order._id).slice(-8).toUpperCase()}</strong>
       and it's being processed.
       <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;">
         ${rows}
         <tr><td colspan="2" style="border-top:1px solid rgba(255,255,255,0.08);padding-top:10px;"></td></tr>
         <tr><td style="color:${MUTED};">Subtotal</td><td style="text-align:right;color:${TEXT};">${money(order.itemsPrice)}</td></tr>
         <tr><td style="color:${MUTED};">Shipping</td><td style="text-align:right;color:${TEXT};">${order.shippingPrice === 0 ? 'Free' : money(order.shippingPrice)}</td></tr>
         <tr><td style="color:${MUTED};">Tax</td><td style="text-align:right;color:${TEXT};">${money(order.taxPrice)}</td></tr>
         <tr><td style="font-weight:800;color:#fff;padding-top:8px;">Total</td><td style="text-align:right;font-weight:800;color:#fff;padding-top:8px;">${money(order.totalPrice)}</td></tr>
       </table>
       <p style="margin:0;"><strong style="color:${TEXT};">Deliver to:</strong><br/>
       ${addr.streetName || ''}, ${addr.district || ''}, ${addr.city || ''}<br/>
       Landmark: ${addr.landmark || '—'}</p>
       <p style="margin:16px 0 0;"><strong style="color:${TEXT};">Payment:</strong> ${order.paymentMethod}${order.isPaid ? ' (paid)' : ' (pending)'}</p>`,
      { label: 'View your order', url: `${process.env.FRONTEND_URL || ''}/order/${order._id}` }
    ),
  };
};

export const paymentReceivedEmail = (order, user) => ({
  subject: `Payment received · ${money(order.totalPrice)}`,
  html: layout(
    `Payment confirmed ✅`,
    `We've received your ${money(order.totalPrice)} payment for order
     <strong style="color:${TEXT};">#${String(order._id).slice(-8).toUpperCase()}</strong>
     via ${order.paymentMethod}. Your order is now being prepared for delivery.`,
    { label: 'Track your order', url: `${process.env.FRONTEND_URL || ''}/order/${order._id}` }
  ),
});

export const orderDeliveredEmail = (order, user) => ({
  subject: `Your order was delivered 📦`,
  html: layout(
    `Delivered, ${user.name}!`,
    `Order <strong style="color:${TEXT};">#${String(order._id).slice(-8).toUpperCase()}</strong>
     has been marked as delivered. We hope you love it — leave a review to help other shoppers.`,
    { label: 'Leave a review', url: `${process.env.FRONTEND_URL || ''}/order/${order._id}` }
  ),
});

export const contactMessageEmail = ({ name, email, subject, message }) => ({
  subject: `Contact form: ${subject}`,
  html: layout(
    `New message from ${name}`,
    `<p style="margin:0 0 4px;"><strong style="color:${TEXT};">From:</strong> ${name} &lt;${email}&gt;</p>
     <p style="margin:0 0 4px;"><strong style="color:${TEXT};">Subject:</strong> ${subject}</p>
     <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:16px 0;" />
     <p style="white-space:pre-wrap;margin:0;">${String(message).replace(/</g, '&lt;')}</p>`
  ),
});

export const contactAckEmail = (name) => ({
  subject: `We received your message`,
  html: layout(
    `Thanks for reaching out, ${name}`,
    `We've received your message and a member of the ${STORE} team will get back to you within one business day.`,
    { label: 'Continue shopping', url: process.env.FRONTEND_URL || '#' }
  ),
});

export const passwordResetEmail = (name, resetUrl) => ({
  subject: `Reset your ${STORE} password`,
  html: layout(
    `Password reset requested`,
    `Hi ${name}, we received a request to reset your password. This link expires in 30 minutes.
     If you didn't ask for this, you can safely ignore this email.`,
    { label: 'Reset password', url: resetUrl }
  ),
});
