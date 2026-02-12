/* ============================================
   AIFORALL V2 — Local Settings (TEMPLATE)
   Copie para config.local.js e preencha com suas credenciais
   ============================================ */

(function () {
  const LOCAL_CONFIG = {
    provider: 'azure-foundry',           // 'azure-foundry' | 'openai' | 'github-models'
    endpoint: 'https://<recurso>.openai.azure.com',
    apiKey: '<sua-api-key-aqui>',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 800,
  };

  const STORAGE_KEY = 'aiforall_foundry_config';
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(LOCAL_CONFIG));
    console.log('[AIFORALL] Config local carregada automaticamente.');
  }
})();
