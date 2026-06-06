import foxGreen from "@/assets/fox-green.png.asset.json";
import foxBlack from "@/assets/fox-black.png.asset.json";
import foxBlue from "@/assets/fox-blue.png.asset.json";
import foxPurple from "@/assets/fox-purple.png.asset.json";

const WHATSAPP_NUMBER = "5577981302545";

type Product = {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  price: string;
  image: string;
  dotColor: string;
  dotBorder?: string;
  whatsappMsg: string;
};

const products: Product[] = [
  {
    id: "green",
    name: "Hidratação e Controle",
    description: "Modela sem deixar duro.",
    benefits: ["Hidratação profunda", "Reduz o frizz", "Visual mais natural"],
    price: "R$ 19,90",
    image: foxGreen.url,
    dotColor: "#4CAF50",
    whatsappMsg: "Olá! Tenho interesse em adquirir a Pasta Fox For Men Hidratação e Controle (Verde) - R$ 19,90",
  },
  {
    id: "black",
    name: "Fixação Extra Forte",
    description: "Alta definição o dia todo.",
    benefits: ["Fixação extra forte", "Resistente à umidade", "Alta definição"],
    price: "R$ 19,90",
    image: foxBlack.url,
    dotColor: "#555555",
    dotBorder: "#888888",
    whatsappMsg: "Olá! Tenho interesse em adquirir a Pasta Fox For Men Fixação Extra Forte (Preta) - R$ 19,90",
  },
  {
    id: "blue",
    name: "Fixação + Hidratação",
    description: "Para todos os tipos de cabelo.",
    benefits: ["Fixação extra forte", "Manteiga de karité", "Hidratação dos fios"],
    price: "R$ 19,90",
    image: foxBlue.url,
    dotColor: "#2196F3",
    whatsappMsg: "Olá! Tenho interesse em adquirir a Pasta Fox For Men Fixação + Hidratação (Azul) - R$ 19,90",
  },
  {
    id: "purple",
    name: "Textura e Brilho",
    description: "Cria textura e movimento nos fios.",
    benefits: ["Mega fixação", "Brilho natural", "Óleo de uva"],
    price: "R$ 19,90",
    image: foxPurple.url,
    dotColor: "#9C27B0",
    whatsappMsg: "Olá! Tenho interesse em adquirir a Pasta Fox For Men Textura e Brilho (Roxa) - R$ 19,90",
  },
];

export default function ProdutosPage() {
  const handleBuy = (msg: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen px-3 py-4" style={{ backgroundColor: "#0d0d0d" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="block h-6 w-1 rounded-full" style={{ backgroundColor: "#D4AF37" }} />
          <h1 className="font-montserrat font-bold text-xl text-white">
            <span>Nossos Produtos</span>
          </h1>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {products.map((p) => (
            <article
              key={p.id}
              className="flex flex-col"
              style={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #222",
                borderRadius: "16px",
                padding: "14px",
              }}
            >
              <div className="flex justify-center mb-2">
                <div
                  style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={p.image}
                    alt={`Pasta Fox For Men ${p.name}`}
                    loading="eager"
                    decoding="sync"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                      imageRendering: "-webkit-optimize-contrast",
                      mixBlendMode: "normal",
                    }}
                  />

                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className="inline-block rounded-full shrink-0"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: p.dotColor,
                    border: p.dotBorder ? `1px solid ${p.dotBorder}` : undefined,
                  }}
                />
                <h2
                  className="font-montserrat text-white leading-tight"
                  style={{ fontSize: "13px", fontWeight: 700 }}
                >
                  <span>{p.name}</span>
                </h2>
              </div>

              <p
                className="font-opensans text-white/70 mb-1.5 leading-snug"
                style={{ fontSize: "11px" }}
              >
                <span>{p.description}</span>
              </p>

              <ul className="flex flex-col mb-2">
                {p.benefits.map((b) => (
                  <li
                    key={b}
                    className="font-opensans text-white/80 flex items-start gap-1"
                    style={{ fontSize: "10px", margin: "1px 0" }}
                  >
                    <span style={{ color: "#4CAF50" }}>✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <p
                  className="font-montserrat mb-2"
                  style={{ color: "#1e3f6e", fontSize: "15px", fontWeight: 700 }}
                >
                  <span>{p.price}</span>
                </p>
                <button
                  type="button"
                  onClick={() => handleBuy(p.whatsappMsg)}
                  className="w-full font-montserrat font-semibold text-white transition-colors hover:bg-white/5"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid #D4AF37",
                    fontSize: "11px",
                    padding: "8px 14px",
                    borderRadius: "20px",
                  }}
                >
                  <span>Adquirir Agora</span>
                </button>
              </div>
            </article>

          ))}
        </div>
      </div>
    </div>
  );
}
