import { FC } from "react";

interface EmailTemplateProps {
  firstName: string;
  otp: string;
}

const EmailTemplate: FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  otp,
}) => (
  <div>
    <h1>Welcome, {firstName}!</h1>
    <p>Your verification code is: <strong>{otp}</strong></p>
  </div>
);

export default EmailTemplate;
