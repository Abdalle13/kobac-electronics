import express from 'express';
import Settings from '../models/settingsModel.js';
import sendEmail from '../utils/sendEmail.js';
import { contactMessageEmail, contactAckEmail } from '../utils/emailTemplates.js';

const router = express.Router();

// @desc    Receive a contact-form message and forward it to support
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const subject = (req.body.subject || '').trim();
  const message = (req.body.message || '').trim();

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }
  if (message.length > 5000) {
    return res.status(400).json({ message: 'Message is too long.' });
  }

  const settings = await Settings.findOne();
  const supportInbox = settings?.supportEmail || process.env.EMAIL_USER;

  const forward = contactMessageEmail({ name, email, subject, message });
  const result = await sendEmail({
    to: supportInbox,
    subject: forward.subject,
    html: forward.html,
    replyTo: email,
  });

  if (result.error) {
    return res.status(500).json({ message: 'Could not send your message right now. Please try again later.' });
  }

  // Best-effort acknowledgement to the sender (don't fail the request if it bounces)
  const ack = contactAckEmail(name);
  await sendEmail({ to: email, subject: ack.subject, html: ack.html });

  res.json({ message: 'Thanks! Your message has been sent. We\'ll reply within one business day.' });
});

export default router;
