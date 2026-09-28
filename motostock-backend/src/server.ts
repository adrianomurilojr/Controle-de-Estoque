import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`🏍️  MotoStock API rodando em http://localhost:${env.port}/api`);
  console.log(`   Ambiente: ${env.nodeEnv}`);
});
