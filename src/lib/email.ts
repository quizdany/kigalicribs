import nodemailer from 'nodemailer';

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use an app password for Gmail
  },
});

export interface EmailVerificationData {
  email: string;
  name: string;
  verificationToken: string;
  role: 'tenant' | 'landlord';
}

export async function sendVerificationEmail(data: EmailVerificationData) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${data.verificationToken}&email=${encodeURIComponent(data.email)}&role=${data.role}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: data.email,
    subject: 'Verify your KigaliCribs account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">Welcome to KigaliCribs!</h1>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Thank you for registering with KigaliCribs! To complete your registration and start using our platform, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <p style="color: #007bff; word-break: break-all; margin-bottom: 20px;">
            ${verificationUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            This verification link will expire in 24 hours. If you didn't create an account with KigaliCribs, 
            you can safely ignore this email.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The KigaliCribs Team
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This email was sent to ${data.email}</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully to:', data.email);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendWelcomeEmail(data: { email: string; name: string; role: 'tenant' | 'landlord' }) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: data.email,
    subject: 'Welcome to KigaliCribs - Your account is now verified!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #28a745; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to KigaliCribs!</h1>
        </div>
        
        <div style="padding: 30px; background-color: white;">
          <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name},</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Congratulations! Your email has been successfully verified and your KigaliCribs account is now active.
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">What's next?</h3>
            ${data.role === 'landlord' ? `
              <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>List your first property</li>
                <li>Set up your property portfolio</li>
                <li>Start receiving tenant applications</li>
                <li>Manage your properties efficiently</li>
              </ul>
            ` : `
              <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li>Search for properties that match your preferences</li>
                <li>Apply for properties you're interested in</li>
                <li>Track your applications and lease agreements</li>
                <li>Connect with landlords and property managers</li>
              </ul>
            `}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for choosing KigaliCribs!<br>
            Best regards,<br>
            The KigaliCribs Team
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>This email was sent to ${data.email}</p>
          <p>If you have any questions, please contact our support team.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', data.email);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
} 