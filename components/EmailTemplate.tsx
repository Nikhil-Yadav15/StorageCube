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
    <h1>Welcome, {otp}!</h1>
  </div>
);

export default EmailTemplate;
