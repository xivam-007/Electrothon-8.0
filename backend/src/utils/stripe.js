import Stripe from "stripe";
import { configDotenv } from "dotenv";
configDotenv(); // Load .env file   
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default stripe;