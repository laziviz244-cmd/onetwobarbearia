import { useEffect } from "react";

const PUBLISHED_URL = "https://onetwobarbearia.lovable.app";

const ADMIN_META = {
  title: "Onetwo — Acesso Administrativo",
  description: "Painel exclusivo para gestão de horários e segurança do sistema.",
  image: `${PUBLISHED_URL}/og-admin.jpg?v=${Date.now()}`,
};

function setMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    if (property.startsWith("og:")) {
      el.setAttribute("property", property);
    } else {
      el.setAttribute("name", property);
    }
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function AdminHeadMeta() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = ADMIN_META.title;

    setMeta("og:title", ADMIN_META.title);
    setMeta("twitter:title", ADMIN_META.title);
    setMeta("og:description", ADMIN_META.description);
    setMeta("twitter:description", ADMIN_META.description);
    setMeta("og:image", ADMIN_META.image);
    setMeta("twitter:image", ADMIN_META.image);
    setMeta("og:image:width", "1200");
    setMeta("og:image:height", "630");
    setMeta("twitter:card", "summary_large_image");
    setMeta("og:type", "website");

    return () => {
      document.title = prevTitle;
    };
  }, []);

  return null;
}
