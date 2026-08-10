import 'dotenv/config'

import "./common/Bull/Email/worker.js"
import "./common/Bull/Verify-email/worker.js"
import "./common/Bull/send-envitation-mail/worker.js"
console.log("Workers started...");