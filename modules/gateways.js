// // gateways.js
// // Arquivo central que importa e organiza todos os gateways
// import { gateway404 } from "../src/main.js";

// // Objeto principal de gateways
// export const Gateways = {
//   error404: gateway404,
//   // Aqui depois iremos adicionar outros gateways (loading, auth, offline, etc.)
// };

// // Função utilitária para executar gateways de uma rota
// export async function runGateways(gatewaysList, context) {
//   for (const gateway of gatewaysList) {
//     const result = await gateway(context);
//     if (!result) return false; // interrompe se algum gateway bloquear
//   }
//   return true; // todos aprovados
// }
