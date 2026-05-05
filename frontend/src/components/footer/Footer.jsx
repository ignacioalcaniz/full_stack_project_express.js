// src/components/footer/Footer.jsx
import "./Footer.css";

export const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>THE LIBRARY</h3>
            <p>
              Marketplace de libros con tecnología de nivel empresarial,
              seguridad avanzada y experiencia premium.
            </p>
          </div>

          <div className="footer-links">
            <h4>Secciones</h4>
            <a href="/tienda">Inicio</a>
            <a href="/tienda/libros">Libros</a>
            <a href="/tienda/carrito">Carrito</a>
            
          </div>

          <div className="footer-social">
            <h4>Conectá con nosotros</h4>
            <div className="social-icons">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                title="Instagram"
              >
                <img
                  src="https://i.ibb.co/DM0Sn1h/instagram-3.png"
                  alt="Instagram"
                />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                title="Facebook"
              >
                <img
                  src="https://i.ibb.co/CMsP4QR/facebook-4.png"
                  alt="Facebook"
                />
              </a>

              <a
                href="https://wa.me/5490000000000"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                title="WhatsApp"
              >
                <img
                  src="https://i.ibb.co/9H2yq7Z/whatsapp-2.png"
                  alt="WhatsApp"
                />
              </a>

              <a href="mailto:ignaalcaniz@gmail.com" aria-label="Mail" title="Mail">
                <img
                  src="https://i.ibb.co/2tWvxH6/correo-electronico-1.png"
                  alt="Mail"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2025 THE LIBRARY - Desarrollado por Ignacio Alcañiz</p>
        </div>
      </div>
    </footer>
  );
};


