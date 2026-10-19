import React, { useState, useEffect } from 'react';
import { X, Shield, FileText, Cookie, Scale, AlertTriangle, ExternalLink } from 'lucide-react';
import { RESTAURANT_INFO } from '../data/restaurantInfo';

export type LegalTab = 'aviso-legal' | 'privacidad' | 'cookies' | 'consumo';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTab;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'aviso-legal',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-[#0e0e14] border border-[#252538] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202030] bg-[#13131c]">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-red-500" />
            <h2 id="legal-modal-title" className="font-display text-xl font-bold uppercase text-white tracking-wide">
              Información Legal y Cumplimiento Normativo
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal legal"
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legal Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#202030] bg-[#0f0f18] overflow-x-auto scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setActiveTab('aviso-legal')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'aviso-legal'
                ? 'border-red-600 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Aviso Legal (LSSI-CE)</span>
          </button>

          <button
            onClick={() => setActiveTab('privacidad')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'privacidad'
                ? 'border-red-600 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Política de Privacidad (RGPD)</span>
          </button>

          <button
            onClick={() => setActiveTab('cookies')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'cookies'
                ? 'border-red-600 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" />
            <span>Política de Cookies</span>
          </button>

          <button
            onClick={() => setActiveTab('consumo')}
            className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'consumo'
                ? 'border-red-600 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Términos y Consumo</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
          {/* Missing Owner Identification Flag Banner */}
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/50 flex items-start gap-3 text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="block font-bold uppercase tracking-wider text-amber-300">
                Aviso para el titular del establecimiento (Información pendiente)
              </strong>
              <p>
                De conformidad con la Ley 34/2002 (LSSI-CE) y el RGPD, antes del despliegue oficial el propietario debe incorporar su <strong>Razón Social o Nombre y Apellidos completos del autónomo</strong>, el número de identificación fiscal (<strong>NIF / CIF</strong>) y una <strong>dirección oficial de correo electrónico</strong>. Los textos a continuación reflejan los datos reales disponibles en el proyecto sin inventar identidades.
              </p>
            </div>
          </div>

          {/* TAB 1: AVISO LEGAL */}
          {activeTab === 'aviso-legal' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-white mb-2">
                  1. Identificación del Responsable (LSSI-CE Ley 34/2002)
                </h3>
                <p>
                  En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se facilitan los datos identificativos del establecimiento:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Nombre Comercial:</strong> {RESTAURANT_INFO.name}</li>
                  <li><strong>Titular / Razón Social:</strong> <em>[Pendiente de facilitar por el titular — Persona física o jurídica]</em></li>
                  <li><strong>NIF / CIF:</strong> <em>[Pendiente de facilitar por el titular]</em></li>
                  <li><strong>Domicilio del local:</strong> {RESTAURANT_INFO.address.full}</li>
                  <li><strong>Teléfono de contacto:</strong> {RESTAURANT_INFO.phone.display}</li>
                  <li><strong>Canal oficial de Instagram:</strong> {RESTAURANT_INFO.social.instagram.handle}</li>
                  <li><strong>Canal oficial de TikTok:</strong> {RESTAURANT_INFO.social.tiktok.handle}</li>
                  <li><strong>Correo electrónico de contacto:</strong> <em>[Pendiente de facilitar por el titular para notificaciones legales]</em></li>
                </ul>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold uppercase text-white mb-2">
                  2. Objeto y Condiciones de Uso
                </h3>
                <p>
                  El presente sitio web tiene por objeto ofrecer información sobre la carta gastronómica, especialidades smash, precios, horarios de apertura, solicitud de reservas en local y enlaces a plataformas de reparto autorizadas de {RESTAURANT_INFO.name}. El acceso al sitio web atribuye la condición de usuario e implica la aceptación plena de este Aviso Legal.
                </p>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold uppercase text-white mb-2">
                  3. Propiedad Intelectual e Industrial
                </h3>
                <p>
                  Los contenidos, textos, fotografías, signos distintivos, logotipos y código fuente son titularidad de {RESTAURANT_INFO.name} o de sus legítimos licenciantes. Queda prohibida la reproducción, distribución o comunicación pública sin autorización previa expresa.
                </p>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold uppercase text-white mb-2">
                  4. Enlaces Externos y Plataformas de Terceros
                </h3>
                <p>
                  Este sitio web contiene enlaces directos a servicios de terceros, tales como Google Maps para la localización geográfica, y plataformas de entrega a domicilio ({RESTAURANT_INFO.delivery.glovo.name}). {RESTAURANT_INFO.name} no se responsabiliza del contenido, términos o políticas de privacidad de dichas plataformas externas, siendo de aplicación sus propias condiciones contractuales al operar a través de ellas.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: POLÍTICA DE PRIVACIDAD */}
          {activeTab === 'privacidad' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-white mb-2">
                  1. Tratamiento de Datos Personales (RGPD UE 2016/679 y LOPDGDD 3/2018)
                </h3>
                <p>
                  {RESTAURANT_INFO.name} garantiza la protección y confidencialidad de los datos personales suministrados de acuerdo con el Reglamento General de Protección de Datos (UE 2016/679) y la Ley Orgánica 3/2018 (LOPDGDD).
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  2. Finalidades del Tratamiento y Legitimación
                </h3>
                <div className="space-y-2 mt-2">
                  <div className="p-3 bg-[#141420] rounded-lg border border-white/5">
                    <strong>A) Gestión de Reservas de Mesa:</strong> Tratamiento de nombre, teléfono, fecha, hora y número de comensales. Base legal: Ejecución de medidas precontractuales a petición del interesado (Art. 6.1.b RGPD).
                  </div>
                  <div className="p-3 bg-[#141420] rounded-lg border border-white/5">
                    <strong>B) Tramitación de Encargos para Recogida (Takeaway vía WhatsApp):</strong> Nombre, teléfono y hora estimada de recogida para preparar el pedido en cocina. Base legal: Ejecución de relación contractual (Art. 6.1.b RGPD).
                  </div>
                  <div className="p-3 bg-[#141420] rounded-lg border border-white/5">
                    <strong>C) Atención a Consultas:</strong> Contacto directo a través de los canales habilitados. Base legal: Consentimiento e interés legítimo (Art. 6.1.a y 6.1.f RGPD).
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  3. Plazo de Conservación
                </h3>
                <p>
                  Los datos vinculados a reservas y encargos se conservan únicamente durante el tiempo imprescindible para gestionar el servicio y, posteriormente, durante los plazos legalmente exigibles para la atención de posibles responsabilidades tributarias o sanitarias.
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  4. Destinatarios y Transferencias
                </h3>
                <p>
                  No se ceden datos personales a terceros salvo obligación legal. En caso de canalizar reservas o pedidos a través de WhatsApp, el usuario debe tener en cuenta que dicho canal opera bajo los términos de privacidad de WhatsApp Ireland Limited / Meta Platforms.
                </p>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  5. Ejercicio de Derechos (ARCO-POL)
                </h3>
                <p>
                  Puede ejercer sus derechos de acceso, rectificación, supresión, limitación del tratamiento, portabilidad y oposición mediante solicitud escrita dirigida al local en {RESTAURANT_INFO.address.street}, 41015 Sevilla, o por vía telefónica al {RESTAURANT_INFO.phone.display}. Asimismo, tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-red-400 underline">www.aepd.es</a>) si considera que sus derechos han sido vulnerados.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: POLÍTICA DE COOKIES */}
          {activeTab === 'cookies' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-white mb-2">
                  Política de Cookies (LSSI-CE Art. 22.2)
                </h3>
                <p>
                  Una cookie es un pequeño archivo de texto que un sitio web almacena en el navegador del usuario. Este sitio web prioriza la privacidad del visitante y utiliza únicamente tecnologías necesarias para su funcionamiento:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#141420] rounded-xl border border-white/5">
                  <div className="font-bold text-white mb-1">1. Cookies y almacenamiento técnico funcional</div>
                  <p className="text-xs text-zinc-400">
                    Utilizadas para mantener los platos seleccionados en el carrito de recogida durante la sesión, recordar la preferencia sobre el aviso de cookies y gestionar el contador de intentos del reto promocional del cronómetro en el dispositivo (`ltb_challenge_token` y almacenamiento local).
                  </p>
                </div>

                <div className="p-3.5 bg-[#141420] rounded-xl border border-white/5">
                  <div className="font-bold text-white mb-1">2. Contenido embebido y plataformas de terceros</div>
                  <p className="text-xs text-zinc-400">
                    Este sitio web no instala cookies propias de perfilado publicitario. No obstante, en las secciones de inicio y contacto se integra un mapa interactivo de <strong>Google Maps</strong> (Google Ireland Limited), cuya carga puede implicar el uso de cookies o solicitudes técnicas por parte de Google conforme a su propia política de privacidad. Asimismo, los enlaces externos a Instagram, TikTok, WhatsApp y Glovo se rigen por las políticas de dichas plataformas al acceder a ellas.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  Cómo gestionar o revocar cookies en su navegador
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones de su navegador de Internet (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge). En caso de bloquear el almacenamiento local, la función de añadir productos al carrito para recogida podría no operar correctamente.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: CONSUMO Y TÉRMINOS */}
          {activeTab === 'consumo' && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-xl font-bold uppercase text-white mb-2">
                  Información al Consumidor, Precios y Promociones
                </h3>
                <p>
                  En cumplimiento del Real Decreto Legislativo 1/2007, de 29 de noviembre, por el que se aprueba el texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[#141420] rounded-xl border border-white/5">
                  <strong className="text-white block mb-1">Precios e Impuestos:</strong>
                  Todos los precios mostrados en la carta digital incluyen el Impuesto sobre el Valor Añadido (IVA al 10% para hostelería y restauración).
                </div>

                <div className="p-3.5 bg-[#141420] rounded-xl border border-white/5">
                  <strong className="text-white block mb-1">Guarnición y Alérgenos:</strong>
                  Las patatas fritas están incluidas en las hamburguesas y baguettes indicadas en carta. Se dispone de opción de pan sin gluten sin suplemento adicional. El establecimiento dispone de información detallada sobre alérgenos a disposición del consumidor en el local.
                </div>

                <div className="p-3.5 bg-[#141420] rounded-xl border border-white/5">
                  <strong className="text-white block mb-1">Modalidades de Pedido:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-xs text-zinc-300">
                    <li><strong>Recogida en Local (Takeaway):</strong> El usuario puede configurar su pedido en la web y enviarlo para confirmación por WhatsApp. El pago se efectúa presencialmente en el restaurante.</li>
                    <li><strong>Pedidos a Domicilio (Delivery):</strong> Se gestionan de forma exclusiva e independiente a través de la tienda oficial del restaurante en Glovo u otras plataformas autorizadas. La web no procesa cobros directos de entrega a domicilio.</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-[#141420] rounded-xl border border-white/5">
                  <strong className="text-white block mb-1">Bases del Reto del Cronómetro:</strong>
                  El reto consistente en detener el cronómetro exactamente en 10 segundos (10.000 s) para conseguir una hamburguesa gratis requiere un consumo mínimo de 25 € en el local. Cada participante dispone de un intento inicial por dispositivo y hasta un intento adicional al compartir y mencionar en Instagram o TikTok.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer of Modal */}
        <div className="px-6 py-4 border-t border-[#202030] bg-[#101018] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            {RESTAURANT_INFO.name} · Sevilla
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            Entendido y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
