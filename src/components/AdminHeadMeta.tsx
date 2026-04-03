import { Helmet } from "react-helmet-async";

const PUBLISHED_URL = "https://onetwobarbearia.lovable.app";

export default function AdminHeadMeta() {
  return (
    <Helmet>
      <title>Onetwo — Acesso Administrativo</title>
      <meta property="og:title" content="Onetwo — Acesso Administrativo" />
      <meta name="twitter:title" content="Onetwo — Acesso Administrativo" />
      <meta property="og:description" content="Painel exclusivo para gestão de horários e segurança do sistema." />
      <meta name="twitter:description" content="Painel exclusivo para gestão de horários e segurança do sistema." />
      <meta property="og:image" content={`${PUBLISHED_URL}/og-admin.jpg`} />
      <meta name="twitter:image" content={`${PUBLISHED_URL}/og-admin.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
