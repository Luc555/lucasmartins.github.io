/* ================================================================
   config.template.js
   ─────────────────────────────────────────────────────────────────
   Este arquivo fica no repositório público — sem credenciais.
   Os placeholders __ASSIM__ são substituídos automaticamente
   pelo GitHub Actions na hora do deploy usando os GitHub Secrets.

   NUNCA edite config.js diretamente — edite aqui.
   NUNCA adicione credenciais reais neste arquivo.
   ================================================================ */

const CONFIG = {
  supabaseUrl:       "__SUPABASE_URL__",
  supabasePublicKey: "__SUPABASE_PUBLIC_KEY__",
  supabaseServiceKey:"__SUPABASE_SERVICE_KEY__",
  adminPassword:     "__ADMIN_PASSWORD__",
};