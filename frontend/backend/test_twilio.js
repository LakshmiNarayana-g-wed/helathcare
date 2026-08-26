const twilio = require("twilio");

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

async function createMessage() {
  const message = await client.messages.create({
    body: "Take Your Medinice",
    from: "+17372212163",
    to: process.argv[2] || "enter your number",
  });

  console.log("Twilio Message SID:", message.sid);
}

if (!accountSid || !authToken) {
  console.error("Error: Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN env variables.");
  process.exit(1);
}

createMessage().catch(console.error);
